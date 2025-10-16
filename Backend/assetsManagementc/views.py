import os
import zipfile
import logging
import pandas as pd
from datetime import datetime
from django.core.files.base import ContentFile
from django.db.models import Count, Sum, Max
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Max
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    TblServerAsset,
    TblAssetOwner,
    TblAssetStatus,
    TblAssetType,
    TblAssetPurchaseDetails,
    TblAssetCategory,
    TblAssetMaster,
)
from .serializers import (
    TblServerAssetSerializer,
    BulkAssetImportSerializer,
)


from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from assetsManagementc.utils import set_request_context

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import TblServerAsset  # use your actual model
from .serializers import TblServerAssetSerializer
import logging

logger = logging.getLogger(__name__)

type_param = openapi.Parameter(
    name="type",
    in_=openapi.IN_QUERY,
    type=openapi.TYPE_STRING,
    description="Filter by asset type. Example: Laptop, Desktop, Software",
    required=False,
)

@swagger_auto_schema(
    method="get",
    manual_parameters=[type_param],
    responses={200: TblServerAssetSerializer(many=True)},
    operation_summary="List server assets",
    operation_description="Returns all server assets. Optionally filter by asset_type name."
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def asset_list(request):
    set_request_context(request)

    asset_type_name = request.query_params.get("type")
    qs = TblServerAsset.objects.all()

    if asset_type_name:
        qs = qs.filter(asset_type__asset_type=asset_type_name)

    serializer = TblServerAssetSerializer(qs, many=True)
    logger.info("Server asset list retrieved by user %s", request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method="post",
    request_body=TblServerAssetSerializer,
    responses={201: TblServerAssetSerializer, 400: "Validation error"},
    operation_summary="Create server asset",
    operation_description="Creates a new server asset row."
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def asset_create(request):
    set_request_context(request)

    serializer = TblServerAssetSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    obj = serializer.save()
    logger.info("Server asset created by user %s", request.user)
    return Response(TblServerAssetSerializer(obj).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary_api(request):
    today = now().date()

    total_server_assets = TblServerAsset.objects.count()

    assigned_assets = (
        TblAssetOwner.objects
        .exclude(server_asset__isnull=True)
        .values('server_asset')
        .distinct()
        .count()
    )
    unassigned_assets = max(total_server_assets - assigned_assets, 0)

    # By Type
    _by_type = (
        TblServerAsset.objects
        .values('asset_type__asset_type')
        .annotate(count=Count('server_asset_id'))
        .order_by('-count')
    )
    by_type = [
        {'label': r['asset_type__asset_type'] or 'Unknown', 'count': r['count']}
        for r in _by_type
    ]

    # By Category
    _by_category = (
        TblServerAsset.objects
        .values('asset_category__asset_category')
        .annotate(count=Count('server_asset_id'))
        .order_by('-count')
    )
    by_category = [
        {'label': r['asset_category__asset_category'] or 'Unknown', 'count': r['count']}
        for r in _by_category
    ]

    # By Location
    _by_location = (
        TblAssetOwner.objects
        .exclude(server_asset__isnull=True)
        .values('location__location')
        .annotate(count=Count('server_asset', distinct=True))
        .order_by('-count')
    )
    by_location = [
        {'label': r['location__location'] or 'Unknown', 'count': r['count']}
        for r in _by_location
    ]

    # By Department
    _by_department = (
        TblAssetOwner.objects
        .exclude(server_asset__isnull=True)
        .values('department__department')
        .annotate(count=Count('server_asset', distinct=True))
        .order_by('-count')
    )
    by_department = [
        {'label': r['department__department'] or 'Unknown', 'count': r['count']}
        for r in _by_department
    ]

    mission_critical = TblServerAsset.objects.filter(is_mission_critical=1).count()

    # Condition
    _condition = (
        TblAssetStatus.objects
        .values('asset_condition')
        .annotate(count=Count('server_asset', distinct=True))
        .order_by('-count')
    )
    condition = [
        {'label': r['asset_condition'] or 'Unknown', 'count': r['count']}
        for r in _condition
    ]

    in_amc_count = (
        TblAssetStatus.objects
        .filter(in_amc=1)
        .values('server_asset')
        .distinct()
        .count()
    )
    amc_amount_total = TblAssetStatus.objects.aggregate(total=Sum('amc_amount'))['total'] or 0

    warranty_active = (
        TblAssetStatus.objects
        .filter(warranty_over_date__isnull=False, warranty_over_date__gte=today)
        .values('server_asset')
        .distinct()
        .count()
    )
    warranty_expired = (
        TblAssetStatus.objects
        .filter(warranty_over_date__isnull=False, warranty_over_date__lt=today)
        .values('server_asset')
        .distinct()
        .count()
    )

    year = today.year
    purchases_year_qs = TblAssetPurchaseDetails.objects.filter(date_of_purchase__year=year)
    purchases = {
        'year': year,
        'count': purchases_year_qs.count(),
        'total_value': purchases_year_qs.aggregate(total=Sum('purchase_value'))['total'] or 0
    }

    _top_suppliers = (
        TblAssetPurchaseDetails.objects
        .exclude(supplier__isnull=True)
        .values('supplier__supplier_name')
        .annotate(
            total_value=Sum('purchase_value'),
            orders=Count('asset_purchase_id')
        )
        .order_by('-total_value')[:10]
    )
    top_suppliers = [
        {
            'label': r['supplier__supplier_name'] or 'Unknown',
            'total_value': r['total_value'] or 0,
            'orders': r['orders']
        }
        for r in _top_suppliers
    ]

    _os_breakdown = (
        TblServerAsset.objects
        .values('operating_system')
        .annotate(count=Count('server_asset_id'))
        .order_by('-count')
    )
    os_breakdown = [
        {'label': r['operating_system'] or 'Unknown', 'count': r['count']}
        for r in _os_breakdown
    ]

    last_updated = {
        'server_asset': TblServerAsset.objects.aggregate(ts=Max('updated_date'))['ts'],
        'status': TblAssetStatus.objects.aggregate(ts=Max('updated_date'))['ts'],
        'owner': TblAssetOwner.objects.aggregate(ts=Max('updated_date'))['ts'],
    }

    data = {
        'totals': {
            'server_assets': total_server_assets
        },
        'ownership': {
            'assigned': assigned_assets,
            'unassigned': unassigned_assets
        },
        'by_type': by_type,
        'by_category': by_category,
        'by_location': by_location,
        'by_department': by_department,
        'mission_critical': mission_critical,
        'condition': condition,
        'amc': {
            'assets_in_amc': in_amc_count,
            'amc_amount_total': amc_amount_total
        },
        'warranty': {
            'active': warranty_active,
            'expired': warranty_expired
        },
        'purchases': purchases,
        'top_suppliers': top_suppliers,
        'os_breakdown': os_breakdown,
        'last_updated': last_updated
    }

    return Response(data)

try:
    from .models import TblServerAssetImage  # FK(server_asset -> TblServerAsset), image = ImageField
    HAS_IMAGE_MODEL = True
except Exception:
    TblServerAssetImage = None
    HAS_IMAGE_MODEL = False


def _coerce_cell(v):
    if pd.isna(v):
        return None
    if isinstance(v, pd.Timestamp):
        return v.to_pydatetime()
    if isinstance(v, datetime):
        return v
    return v


file_param = openapi.Parameter(
    name="file",
    in_=openapi.IN_FORM,
    type=openapi.TYPE_FILE,
    required=True,
    description="Excel file with asset rows",
)

images_zip_param = openapi.Parameter(
    name="images_zip",
    in_=openapi.IN_FORM,
    type=openapi.TYPE_FILE,
    required=False,
    description="Zip containing images. Optional. Use image_names column to map filenames",
)


@swagger_auto_schema(
    method="post",
    manual_parameters=[file_param, images_zip_param],
    request_body=BulkAssetImportSerializer,
    consumes=["multipart/form-data"],
    responses={201: "Created", 207: "Partial Success", 400: "Bad Request"},
    operation_summary="Bulk import assets",
    operation_description="Upload Excel. Optional images zip. Creates TblServerAsset rows. Expects FK IDs in columns.",
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def asset_bulk_import(request):
    set_request_context(request)

    form = BulkAssetImportSerializer(data=request.data)
    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    excel_file = request.FILES.get("file")
    zip_file = request.FILES.get("images_zip")

    if not excel_file:
        return Response({"detail": "Excel file is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df = pd.read_excel(excel_file)
    except Exception:
        logger.exception("Invalid Excel")
        return Response({"detail": "Invalid Excel file."}, status=status.HTTP_400_BAD_REQUEST)

    required_columns = [
        "server_asset_id",            # PK string like SRV0001
        "server_name_description",
        "asset_id",                   # FK to TblAssetMaster.asset_id
        "asset_type_id",              # FK to TblAssetType.asset_type_id
        "asset_category_id",          # FK to TblAssetCategory.asset_category_id
        "asset_model_no",
        "is_mission_critical",        # 0 or 1
        "asset_serial_number",
        "configuration",
        "operating_system",
    ]
    missing = [c for c in required_columns if c not in df.columns]
    if missing:
        return Response({"detail": f"Missing columns: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

    # Optional column to map images
    has_image_names = "image_names" in df.columns

    zip_images = {}
    if zip_file:
        try:
            zf = zipfile.ZipFile(zip_file)
            # Normalize keys for fast lookup
            zip_images = {os.path.basename(n): zf.read(n) for n in zf.namelist() if not n.endswith("/")}
        except Exception:
            logger.exception("Invalid images zip")
            return Response({"detail": "Invalid images zip."}, status=status.HTTP_400_BAD_REQUEST)

    created = []
    errors = []

    for idx, row in df.iterrows():
        rownum = idx + 2  # header on row 1
        data = {k: _coerce_cell(row.get(k)) for k in required_columns}

        # Resolve FKs by IDs from the sheet
        try:
            asset_fk = None
            if data["asset_id"]:
                asset_fk = TblAssetMaster.objects.get(asset_id=str(data["asset_id"]))

            type_fk = None
            if data["asset_type_id"]:
                type_fk = TblAssetType.objects.get(asset_type_id=str(data["asset_type_id"]))

            category_fk = None
            if data["asset_category_id"]:
                category_fk = TblAssetCategory.objects.get(asset_category_id=str(data["asset_category_id"]))
        except TblAssetMaster.DoesNotExist:
            errors.append({"row": rownum, "error": f"asset_id not found: {data['asset_id']}"})
            continue
        except TblAssetType.DoesNotExist:
            errors.append({"row": rownum, "error": f"asset_type_id not found: {data['asset_type_id']}"})
            continue
        except TblAssetCategory.DoesNotExist:
            errors.append({"row": rownum, "error": f"asset_category_id not found: {data['asset_category_id']}"})
            continue
        except Exception as e:
            errors.append({"row": rownum, "error": f"FK resolution error: {str(e)}"})
            continue

        payload = {
            "server_asset_id": data["server_asset_id"],
            "server_name_description": data["server_name_description"],
            "asset": asset_fk.asset_id if asset_fk else None,
            "asset_type": type_fk.asset_type_id if type_fk else None,
            "asset_category": category_fk.asset_category_id if category_fk else None,
            "asset_model_no": data["asset_model_no"],
            "is_mission_critical": int(data["is_mission_critical"] or 0),
            "asset_serial_number": data["asset_serial_number"],
            "configuration": data["configuration"],
            "operating_system": data["operating_system"],
        }

        ser = TblServerAssetSerializer(data=payload)
        if not ser.is_valid():
            errors.append({"row": rownum, "errors": ser.errors})
            continue

        obj = ser.save()

        # Attach images if present
        if has_image_names and HAS_IMAGE_MODEL and zip_images:
            names_cell = row.get("image_names")
            if not pd.isna(names_cell) and str(names_cell).strip():
                for raw in str(names_cell).split(","):
                    fname = os.path.basename(raw.strip())
                    if not fname:
                        continue
                    content = zip_images.get(fname)
                    if content is None:
                        errors.append({"row": rownum, "image_error": f'Image "{fname}" not found in zip'})
                        continue
                    cf = ContentFile(content)
                    cf.name = fname
                    TblServerAssetImage.objects.create(server_asset=obj, image=cf)

        created.append(TblServerAssetSerializer(obj).data)

    if errors:
        return Response({"created": created, "errors": errors}, status=status.HTTP_207_MULTI_STATUS)

    return Response({"created": created}, status=status.HTTP_201_CREATED)