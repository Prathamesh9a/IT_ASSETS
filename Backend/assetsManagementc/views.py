from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Asset, AssetAssignment, AssetLog
from .serializers import AssignAssetSerializer
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .serializers import MyAssetSerializer
from .models import Asset, AssetImage, AssetAssignment
from .serializers import AssetSerializer, AssetCreateSerializer,RequestAssignmentSerializer,AssetAssignmentSerializer, ApproveRejectSerializer, AssetUpdateSerializer,DeleteAssetsSerializer
from employeeManagement.permissions import IsAdmin,IsUser
from django.shortcuts import get_object_or_404
from django.shortcuts import get_list_or_404
import logging
logger = logging.getLogger(__name__)


def set_request_context(request):
    return


# ---------- LIST EVERY ASSET (no filters, no pagination) ----------
@swagger_auto_schema(
    method="get",
    operation_summary="List every asset",
    responses={200: AssetSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated,IsAdmin])
def asset_list(request):
    set_request_context(request)
    try:
        qs = (
            Asset.objects
            .select_related("asset_type", "vendor", "amc_vendor")
            .prefetch_related("images")
            .order_by("-created_at")
        )
        serializer = AssetSerializer(qs, many=True, context={"request": request})
        logger.info(f"Asset list retrieved by user {request.user}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception:
        logger.error("Unhandled error in asset_list", exc_info=True)
        return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------- CREATE WITH IMAGES ----------
images_param = openapi.Parameter(
    name="images",
    in_=openapi.IN_FORM,
    type=openapi.TYPE_FILE,
    required=False,
    description="Upload one or more images. Use the same key images multiple times",
)

@swagger_auto_schema(
    method="post",
    operation_summary="Create asset with optional images",
    request_body=AssetCreateSerializer,
    manual_parameters=[images_param],
    consumes=["multipart/form-data"],
    responses={201: AssetSerializer},
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated,IsAdmin])
@transaction.atomic
def asset_create(request):
    set_request_context(request)
    serializer = AssetCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset = serializer.save()

    files = request.FILES.getlist("images")
    if files:
        AssetImage.objects.bulk_create([AssetImage(asset=asset, image=f) for f in files])

    out = AssetSerializer(asset).data
    return Response(out, status=status.HTTP_201_CREATED)



assign_success_response = openapi.Response(
    description="Asset assigned",
    examples={
        "application/json": {
            "detail": "Asset assigned successfully.",
            "assignment_id": 12,
            "asset_id": 3,
            "employee_id": 7,
            "status": "Assigned"
        }
    },
)
#---------------------update asset------
images_param = openapi.Parameter(
    name="images",
    in_=openapi.IN_FORM,
    type=openapi.TYPE_FILE,
    required=False,
    description="Upload one or more images. Repeat the key 'images' to add multiple files."
)

@swagger_auto_schema(
    method="patch",
    operation_summary="Update an asset and optionally add images",
    request_body=AssetUpdateSerializer,
    manual_parameters=[images_param],
    consumes=["multipart/form-data"],
    responses={200: AssetSerializer},
)
@api_view(["PATCH"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated,IsAdmin])
@transaction.atomic
def asset_update(request, pk: int):
    set_request_context(request)

    asset = get_object_or_404(Asset, pk=pk)
    serializer = AssetUpdateSerializer(asset, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset = serializer.save()

    # add images (keeps existing ones)
    files = request.FILES.getlist("images")
    if files:
        AssetImage.objects.bulk_create([AssetImage(asset=asset, image=f) for f in files])

    out = AssetSerializer(asset, context={"request": request}).data
    logger.info(f"Asset {asset.id} updated by user {request.user}")
    return Response(out, status=status.HTTP_200_OK)


#-------------------delete asset
success_example = openapi.Response(
    description="Soft delete applied",
    examples={
        "application/json": {
            "detail": "Assets marked as not available.",
            "updated": [
                {"asset_id": 3, "new_status": "Retired"},
                {"asset_id": 7, "new_status": "Retired"}
            ]
        }
    },
)

@swagger_auto_schema(
    method="post",
    operation_summary="Soft delete assets, mark as not available (Admin only)",
    request_body=DeleteAssetsSerializer,
    responses={200: success_example, 400: "Bad Request", 404: "Not Found"},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
@transaction.atomic
def delete_assets(request):
    """
    Soft delete: set Asset.status to Retired so it is not available for assignment.
    Also closes any active assignments and writes an audit log.
    """
    serializer = DeleteAssetsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset_ids = serializer.validated_data["asset_ids"]
    reason = serializer.validated_data.get("reason", "").strip()

    # Fetch all assets; 404 if any ID is invalid
    assets = get_list_or_404(Asset, id__in=asset_ids)

    updated = []
    now = timezone.now()

    for asset in assets:
        # close active assignments for this asset
        active_qs = AssetAssignment.objects.filter(asset=asset, returned_date__isnull=True)
        for assign in active_qs:
            assign.returned_date = now.date()
            assign.remarks = (assign.remarks or "")
            if reason:
                assign.remarks = f"{assign.remarks}\nSoft delete reason: {reason}".strip()
            assign.save(update_fields=["returned_date", "remarks"])

        # mark asset as not available by setting status to Retired
        try:
            asset.status = Asset.Status.RETIRED
        except Exception:
            asset.status = "Retired"  # fallback if Status enum changes
        asset.save(update_fields=["status", "updated_at"] if hasattr(asset, "updated_at") else ["status"])

        # audit log
        try:
            desc = "Marked not available (soft delete)"
            if reason:
                desc = f"{desc}. Reason: {reason}"
            AssetLog.objects.create(
                asset=asset,
                employee=str(request.user),
                action="Soft Delete",
                description=desc,
                timestamp=now,
            )
        except Exception:
            logger.warning("Failed to write AssetLog for soft delete", exc_info=True)

        updated.append({"asset_id": asset.id, "new_status": str(asset.status)})

    logger.info(f"Soft-deleted assets by {request.user}: {updated}")
    return Response(
        {"detail": "Assets marked as not available.", "updated": updated},
        status=status.HTTP_200_OK,
    )

#------------------ASSIGN ASSET------------------
@swagger_auto_schema(
    method="post",
    operation_summary="Assign asset to employee",
    request_body=AssignAssetSerializer,
    responses={201: assign_success_response, 400: "Bad Request", 404: "Not Found"},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def assign_asset(request):
    set_request_context(request)

    serializer = AssignAssetSerializer(data=request.data)
    if not serializer.is_valid():
        logger.error(f"Asset assignment failed: {serializer.errors} by user {request.user}", exc_info=True)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset = serializer.validated_data["_asset"]
    employee = serializer.validated_data["_employee"]
    remarks = serializer.validated_data.get("remarks", "")
    assigned_date = serializer.validated_data["_assigned_date"]

    # create assignment
    assignment = AssetAssignment.objects.create(
        asset=asset,
        employee=employee,
        assigned_date=assigned_date,
        remarks=remarks,
    )

    # update asset status
    asset.status = Asset.Status.ASSIGNED
    asset.save(update_fields=["status", "updated_at"])

    # log action
    try:
        AssetLog.objects.create(
            asset=asset,
            employee=str(employee),
            action="Assigned",
            description=f"Assigned to employee ID {employee.id}",
            timestamp=timezone.now(),
        )
    except Exception:
        logger.warning("AssetLog create failed for assignment", exc_info=True)

    logger.info(f"Asset {asset.id} assigned to employee {employee.id} by user {request.user}")
    return Response(
        {
            "detail": "Asset assigned successfully.",
            "assignment_id": assignment.id,
            "asset_id": asset.id,
            "employee_id": employee.id,
            "status": "Assigned",
        },
        status=status.HTTP_201_CREATED,
    )

#----------------My Assets------------
@swagger_auto_schema(
    method="get",
    operation_summary="Get assets assigned to the logged-in user",
    responses={200: MyAssetSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_assets(request):
    set_request_context(request)
    employee = request.user
    # Active assignments only, returned_date is null
    active_asset_ids = (
        AssetAssignment.objects
        .filter(employee=employee, returned_date__isnull=True)
        .values_list("asset_id", flat=True)
    )

    qs = (
        Asset.objects
        .filter(id__in=active_asset_ids)
        .select_related("asset_type", "vendor", "amc_vendor")
        .prefetch_related("images")
        .order_by("-created_at")
    )

    data = MyAssetSerializer(qs, many=True, context={"request": request}).data
    logger.info(f"My assets retrieved for user {request.user}. Count={len(data)}")
    return Response(data, status=status.HTTP_200_OK)

#------------------request assign----
request_success_response = openapi.Response(
    description="Request submitted",
    examples={
        "application/json": {
            "detail": "surrender request submitted.",
            "asset_id": 5,
            "requested": "surrender_requested",
            "timestamp": "2025-10-22T15:45:00+05:30"
        }
    },
)


@swagger_auto_schema(
    method="post",
    operation_summary="Submit a request for  maintenance, surrender, renew, damaged, or expired",
    request_body=RequestAssignmentSerializer,
    responses={200: request_success_response, 400: "Bad Request", 404: "Not Found"},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated,IsUser])
def request_assignment(request):
    set_request_context(request)

    serializer = RequestAssignmentSerializer(data=request.data)
    if not serializer.is_valid():
        logger.error(f"Asset request failed: {serializer.errors} by user {request.user}", exc_info=True)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset_id = serializer.validated_data["asset_id"]
    requested_status = serializer.validated_data["status_requested"]
    reason = serializer.validated_data.get("reason", "").strip()

    # get asset
    try:
        asset = Asset.objects.get(id=asset_id)
    except Asset.DoesNotExist:
        return Response({"detail": "Asset not found."}, status=status.HTTP_404_NOT_FOUND)

    # get employee profile
    employee = request.user
    # verify active assignment exists for this user and asset
    has_active = AssetAssignment.objects.filter(
        asset=asset,
        employee=employee,
        returned_date__isnull=True
    ).exists()

    if not has_active:
        logger.error(f"Asset request failed: No active assignment for asset {asset.id} and user {request.user}", exc_info=True)
        return Response({"detail": "No active assignment found."}, status=status.HTTP_400_BAD_REQUEST)

    # record request in AssetLog
    try:
        desc_parts = [f"Request: {requested_status.replace('_', ' ')}"]
        if reason:
            desc_parts.append(f"Reason: {reason}")
        description = " | ".join(desc_parts)

        AssetLog.objects.create(
            asset=asset,
            employee=str(employee),
            action="Request",
            description=description,
            timestamp=timezone.now(),
        )
    except Exception:
        logger.warning("Failed to write AssetLog for request_assignment", exc_info=True)

    logger.info(f"Asset request: Asset {asset.id} {requested_status} by user {request.user}")

    return Response(
        {
            "detail": f"{requested_status.split('_')[0]} request submitted.",
            "asset_id": asset.id,
            "requested": requested_status,
            "timestamp": timezone.now().isoformat(),
        },
        status=status.HTTP_200_OK,
    )

#----------pending request(admin will see all request of asset given by user)
@swagger_auto_schema(
    method="get",
    operation_summary="Get all pending asset requests (Admin only)",
    responses={200: AssetAssignmentSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def pending_requests(request):
    set_request_context(request)

    # statuses ending with "_requested"
    pending = AssetAssignment.objects.filter(status__iendswith="requested")

    serializer = AssetAssignmentSerializer(pending, many=True)
    logger.info(f"Pending requests retrieved by admin {request.user}")
    return Response(serializer.data, status=status.HTTP_200_OK)

#----------approve reject request(admin)-------
decision_success = openapi.Response(
    description="Decision applied",
    examples={
        "application/json": {
            "detail": "surrender approved.",
            "assignment_id": 10,
            "new_status": "surrender_approved",
            "timestamp": "2025-10-22T16:30:00+05:30"
        }
    }
)

@swagger_auto_schema(
    method="post",
    operation_summary="Approve or reject an asset request (Admin only)",
    request_body=ApproveRejectSerializer,
    responses={200: decision_success, 400: "Bad Request", 404: "Not Found"}
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_reject_request(request):
    set_request_context(request)

    serializer = ApproveRejectSerializer(data=request.data)
    if not serializer.is_valid():
        logger.error(f"Decision failed: {serializer.errors} by {request.user}", exc_info=True)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    assignment = get_object_or_404(AssetAssignment, id=serializer.validated_data["assignment_id"])
    action = serializer.validated_data["action"]
    reason = serializer.validated_data.get("reason", "").strip()

    # Expect statuses like surrender_requested, transfer_requested, maintenance_requested, renew_requested, damaged_requested, expired_requested
    status_val = getattr(assignment, "status", "")
    if "_requested" not in status_val:
        return Response({"detail": "This assignment is not in a requested state."}, status=status.HTTP_400_BAD_REQUEST)

    base = status_val.rsplit("_", 1)[0]  # surrender, transfer, maintenance, renew, damaged, expired

    if action == "approve":
        new_status = f"{base}_approved"
        assignment.status = new_status
        # optional timestamps if fields exist on your model
        if hasattr(assignment, "approved_at"):
            assignment.approved_at = timezone.now()

        # optional business rules
        # if surrender or transfer are approved, close current assignment and free the asset
        if base in {"surrender", "transfer"}:
            if hasattr(assignment, "returned_date"):
                assignment.returned_date = timezone.now().date()
            try:
                assignment.asset.status = Asset.Status.AVAILABLE
            except Exception:
                assignment.asset.status = "Available"
            assignment.asset.save(update_fields=["status", "updated_at"] if hasattr(assignment.asset, "updated_at") else ["status"])

        assignment.save()

        # audit log
        try:
            AssetLog.objects.create(
                asset=assignment.asset,
                employee=str(getattr(assignment, "employee", "")),
                action="Request Approved",
                description=f"{base} approved",
                timestamp=timezone.now(),
            )
        except Exception:
            logger.warning("AssetLog write failed for approve_reject_request", exc_info=True)

        logger.info(f"Assignment {assignment.id} {new_status} by admin {request.user}")
        return Response(
            {
                "detail": f"{base} approved.",
                "assignment_id": assignment.id,
                "new_status": new_status,
                "timestamp": timezone.now().isoformat(),
            },
            status=status.HTTP_200_OK,
        )

    # reject
    new_status = f"{base}_rejected"
    assignment.status = new_status
    if hasattr(assignment, "approved_at"):
        # ensure not set on rejection
        assignment.approved_at = None
    assignment.save()

    try:
        desc = f"{base} rejected"
        if reason:
            desc = f"{desc} | Reason: {reason}"
        AssetLog.objects.create(
            asset=assignment.asset,
            employee=str(getattr(assignment, "employee", "")),
            action="Request Rejected",
            description=desc,
            timestamp=timezone.now(),
        )
    except Exception:
        logger.warning("AssetLog write failed for approve_reject_request (reject)", exc_info=True)

    logger.info(f"Assignment {assignment.id} {new_status} by admin {request.user}")
    return Response(
        {
            "detail": f"{base} rejected.",
            "assignment_id": assignment.id,
            "new_status": new_status,
            "timestamp": timezone.now().isoformat(),
        },
        status=status.HTTP_200_OK,
    )