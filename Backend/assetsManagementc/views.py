from datetime import datetime, timedelta
import pandas as pd
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    TblServerAsset,
    TblAssetOwner,
    TblAssetStatus,
    TblEmployeeMaster,  # via employeeManagement.models but re-exported in this app's models import
)
from .serializers import (
    ServerAssetSerializer,
    AssetOwnerSerializer,
    AssignAssetSerializer,
    StatusSummaryItemSerializer,
    BulkAssetImportSerializer,
    ApproveRejectSerializer,
    TransferAssetSerializer,
)

# Optional custom role permissions
try:
    from employeeManagement.permissions import IsAdmin, IsAdminOrIsSuperAdmin, IsSuperAdmin, IsUser
except Exception:
    class IsAdmin(IsAuthenticated): pass
    class IsAdminOrIsSuperAdmin(IsAuthenticated): pass
    class IsSuperAdmin(IsAuthenticated): pass
    class IsUser(IsAuthenticated): pass

# Optional logging context
try:
    from logs.views import set_request_context
except Exception:
    def set_request_context(request): return None


# ---------- Assets list/create ----------

@swagger_auto_schema(
    method="post",
    request_body=ServerAssetSerializer,
    responses={201: ServerAssetSerializer},
    operation_summary="Create Server Asset"
)
@swagger_auto_schema(
    method="get",
    responses={200: ServerAssetSerializer(many=True)},
    operation_summary="List Server Assets"
)
@api_view(["GET", "POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def asset_list_create(request):
    set_request_context(request)

    if request.method == "GET":
        qs = TblServerAsset.objects.all()
        # Optional filter by asset_type_id or category_id
        t = request.query_params.get("asset_type_id")
        c = request.query_params.get("asset_category_id")
        if t:
            qs = qs.filter(asset_type__asset_type_id=t)
        if c:
            qs = qs.filter(asset_category__asset_category_id=c)
        return Response(ServerAssetSerializer(qs, many=True).data, status=200)

    # POST
    s = ServerAssetSerializer(data=request.data)
    if s.is_valid():
        obj = s.save()
        return Response(ServerAssetSerializer(obj).data, status=201)
    return Response(s.errors, status=400)


# ---------- Asset detail ----------

@swagger_auto_schema(method="get", responses={200: ServerAssetSerializer}, operation_summary="Get Server Asset")
@swagger_auto_schema(method="put", request_body=ServerAssetSerializer, responses={200: ServerAssetSerializer}, operation_summary="Update Server Asset")
@swagger_auto_schema(method="delete", responses={204: "Deleted"}, operation_summary="Delete Server Asset")
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def asset_detail(request, server_asset_id):
    set_request_context(request)
    asset = get_object_or_404(TblServerAsset, server_asset_id=server_asset_id)

    if request.method == "GET":
        return Response(ServerAssetSerializer(asset).data, status=200)

    if request.method == "PUT":
        s = ServerAssetSerializer(asset, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data, status=200)
        return Response(s.errors, status=400)

    # DELETE
    asset.delete()
    return Response(status=204)


# ---------- Assets owned by current user ----------

@swagger_auto_schema(
    method="get",
    responses={200: AssetOwnerSerializer(many=True)},
    operation_summary="My Assets"
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_assets(request):
    set_request_context(request)
    # Your AUTH_USER_MODEL is TblEmployeeMaster with PK employee_id
    employee = request.user
    owners = TblAssetOwner.objects.filter(employee=employee)
    return Response(AssetOwnerSerializer(owners, many=True).data, status=200)


# ---------- Status summary (by condition) ----------

@swagger_auto_schema(
    method="get",
    responses={200: StatusSummaryItemSerializer(many=True)},
    operation_summary="Assets status summary by condition"
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def status_summary(request):
    # Summarize by TblAssetStatus.asset_condition_good_fair_excellent
    data = (
        TblAssetStatus.objects.values("asset_condition_good_fair_excellent")
        .annotate(count=Count("asset_status_id"))
        .order_by()
    )
    out = [
        {"status": row["asset_condition_good_fair_excellent"] or "Unknown", "count": row["count"]}
        for row in data
    ]
    return Response(out, status=200)


# ---------- Image endpoints (not supported by schema) ----------

not_supported = openapi.Response(
    description="Images are not supported by current DB schema.",
)

@swagger_auto_schema(
    method="post",
    manual_parameters=[
        openapi.Parameter(
            name="images",
            in_=openapi.IN_FORM,
            type=openapi.TYPE_FILE,
            required=True,
            description="One or more image files",
        ),
    ],
    responses={501: not_supported},
    operation_summary="Upload images to an asset (not supported)"
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def upload_asset_images(request, server_asset_id):
    return Response({"detail": "Not supported by current DB schema."}, status=501)


@swagger_auto_schema(method="delete", responses={501: not_supported}, operation_summary="Delete asset image (not supported)")
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_asset_image(request, image_id):
    return Response({"detail": "Not supported by current DB schema."}, status=501)


@swagger_auto_schema(
    method="put",
    manual_parameters=[openapi.Parameter(name="image", in_=openapi.IN_FORM, type=openapi.TYPE_FILE, required=True)],
    responses={501: not_supported},
    operation_summary="Replace an asset image (not supported)"
)
@api_view(["PUT"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def replace_asset_image(request, image_id):
    return Response({"detail": "Not supported by current DB schema."}, status=501)


# ---------- Bulk import (Server Assets only) ----------

@swagger_auto_schema(
    method="post",
    request_body=BulkAssetImportSerializer,
    consumes=["multipart/form-data"],
    responses={201: "Created", 207: "Partial Success"},
    operation_summary="Bulk import Server Assets from Excel"
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated, IsAdmin])
def asset_bulk_import(request):
    set_request_context(request)
    s = BulkAssetImportSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=400)

    excel = request.FILES.get("file")
    if not excel:
        return Response({"detail": "Excel file is required."}, status=400)

    try:
        df = pd.read_excel(excel)
    except Exception:
        return Response({"detail": "Invalid Excel file."}, status=400)

    required = ["server_asset_id", "server_name_description"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        return Response({"detail": f"Missing columns: {', '.join(missing)}"}, status=400)

    created, errors = [], []
    for idx, row in df.iterrows():
        data = {k: (None if pd.isna(v) else v) for k, v in row.to_dict().items()}
        payload = {
            "server_asset_id": str(data.get("server_asset_id")),
            "server_name_description": data.get("server_name_description"),
            "asset": data.get("asset_id"),
            "asset_type": data.get("asset_type_id"),
            "asset_category": data.get("asset_category_id"),
            "asset_model_no": data.get("asset_model_no"),
            "is_mission_critical": data.get("is_mission_critical"),
            "asset_serial_number": data.get("asset_serial_number"),
            "configuration": data.get("configuration"),
            "operating_system": data.get("operating_system"),
        }

        instance = TblServerAsset.objects.filter(server_asset_id=payload["server_asset_id"]).first()
        ser = ServerAssetSerializer(instance, data=payload, partial=bool(instance))
        if ser.is_valid():
            obj = ser.save()
            created.append(ServerAssetSerializer(obj).data)
        else:
            errors.append({"row": idx + 2, "errors": ser.errors})

    if errors:
        return Response({"created": created, "errors": errors}, status=207)
    return Response({"created": created}, status=201)


# ---------- Assign asset to employee ----------

@swagger_auto_schema(
    method="post",
    request_body=AssignAssetSerializer,
    responses={201: "Assigned"},
    operation_summary="Assign server asset to an employee"
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def assign_asset(request):
    set_request_context(request)
    s = AssignAssetSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=400)

    server_asset = get_object_or_404(TblServerAsset, server_asset_id=s.validated_data["server_asset_id"])
    employee = get_object_or_404(TblEmployeeMaster, employee_id=s.validated_data["employee_id"])

    owner, created = TblAssetOwner.objects.get_or_create(
        server_asset=server_asset,
        defaults={"employee": employee, "assigned_to": employee.employee_name, "email_id": employee.email_id},
    )
    if not created:
        owner.employee = employee
        owner.assigned_to = employee.employee_name
        owner.email_id = employee.email_id
        owner.updated_date = timezone.now()
        owner.save()

    return Response({"detail": "Asset assigned."}, status=201)


# ---------- Request/Approve/Reject/Transfer (not supported) ----------

not_supported_req = openapi.Response(description="Not supported by current DB schema.")

@swagger_auto_schema(method="post", request_body=ApproveRejectSerializer, responses={501: not_supported_req}, operation_summary="Request assignment (not supported)")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_assignment(request):
    return Response({"detail": "Not supported by current DB schema."}, status=501)

@swagger_auto_schema(method="post", request_body=ApproveRejectSerializer, responses={501: not_supported_req}, operation_summary="Approve request (not supported)")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_request(request):
    return Response({"detail": "Not supported by current DB schema."}, status=501)

@swagger_auto_schema(method="post", request_body=ApproveRejectSerializer, responses={501: not_supported_req}, operation_summary="Reject request (not supported)")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_request(request):
    return Response({"detail": "Not supported by current DB schema."}, status=501)

@swagger_auto_schema(method="post", request_body=TransferAssetSerializer, responses={501: not_supported_req}, operation_summary="Request transfer (not supported)")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_transfer(request):
    return Response({"detail": "Not supported by current DB schema."}, status=501)

@swagger_auto_schema(method="post", request_body=ApproveRejectSerializer, responses={501: not_supported_req}, operation_summary="Approve/Reject transfer (not supported)")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_reject_transfer(request):
    return Response({"detail": "Not supported by current DB schema."}, status=501)


# ---------- Assignment history ----------

@swagger_auto_schema(
    method="get",
    responses={200: AssetOwnerSerializer(many=True)},
    operation_summary="Assignment history, all records"
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminOrIsSuperAdmin])
def asset_assignment_history(request):
    set_request_context(request)
    qs = TblAssetOwner.objects.all().order_by("-updated_date", "-created_date")
    return Response(AssetOwnerSerializer(qs, many=True).data, status=200)


@swagger_auto_schema(
    method="get",
    responses={200: AssetOwnerSerializer(many=True)},
    operation_summary="My assignment history"
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsUser])
def my_assignment_history(request):
    set_request_context(request)
    qs = TblAssetOwner.objects.filter(employee=request.user).order_by("-updated_date", "-created_date")
    return Response(AssetOwnerSerializer(qs, many=True).data, status=200)


# ---------- Pending and recent (not supported precisely) ----------

@swagger_auto_schema(
    method="get",
    responses={200: AssetOwnerSerializer(many=True)},
    operation_summary="Pending requests (not supported, returns empty list)"
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def pending_requests(request):
    return Response([], status=200)


@swagger_auto_schema(
    method="get",
    responses={200: AssetOwnerSerializer(many=True)},
    operation_summary="Current assignments in last 7 days (by updated_date)"
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def current_assignments(request):
    set_request_context(request)
    since = timezone.now() - timedelta(days=7)
    qs = TblAssetOwner.objects.filter(Q(updated_date__gte=since) | Q(created_date__gte=since)).order_by("-updated_date")
    return Response(AssetOwnerSerializer(qs, many=True).data, status=200)
