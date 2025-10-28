from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Asset, AssetAssignment, AssetLog
from .serializers import AssignAssetSerializer,MyPendingRequestSerializer
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .serializers import MyAssetSerializer
from .models import Asset, AssetImage, AssetAssignment,AssetType
from .serializers import  AssignedAssetListRowSerializer,AssetLogSerializer
from .serializers import AssetSerializer, AssetCreateSerializer,RequestAssignmentSerializer,AssetAssignmentSerializer, ApproveRejectSerializer, AssetUpdateSerializer,DeleteAssetsSerializer,AssetTypeSerializer
from .serializers import RevokeAssetSerializer
from employeeManagement.permissions import IsAdmin,IsUser
from employeeManagement.models import Employee
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
            "detail": "Soft delete processed.",
            "retired": [
                {"asset_id": 3, "new_status": "Retired"}
            ],
            "skipped": [
                {"asset_id": 7, "reason": "Asset is not Available"}
            ]
        }
    },
)


@swagger_auto_schema(
    method="post",
    operation_summary="Deactivate assets (Admin only). Only assets in Available status will be Retired",
    request_body=DeleteAssetsSerializer,
    responses={200: success_example, 400: "Bad Request", 404: "Not Found"},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
@transaction.atomic
def delete_assets(request):
    """
    Deactivate assets:
    - If asset.status == 'Available', set status to 'Retired'
    - If asset is Assigned, or already Requested, skip it
    - Do not hard delete
    - Do not unassign automatically for skipped assets
    """
    set_request_context(request)

    serializer = DeleteAssetsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset_ids = serializer.validated_data["asset_ids"]
    reason = serializer.validated_data.get("reason", "").strip()

    # Fetch all matching assets, 404 if any ID not found
    assets = get_list_or_404(Asset, id__in=asset_ids)

    now = timezone.now()
    retired_list = []
    skipped_list = []

    for asset in assets:
        current_status = (asset.status or "").strip()

        # Only Available assets are allowed to be retired
        if current_status != Asset.Status.AVAILABLE:
            # asset is Assigned, In Repair, Retired, or any *_requested state in assignment
            skipped_list.append({
                "asset_id": asset.id,
                "reason": f"Asset is {current_status}, cannot deactivate"
            })
            continue

        # Check if any active assignment still exists for safety
        # If any AssetAssignment with returned_date null, we treat it as "in use"
        active_assign_qs = AssetAssignment.objects.filter(
            asset=asset,
            returned_date__isnull=True
        )

        if active_assign_qs.exists():
            # If assignment exists, we refuse to retire it
            skipped_list.append({
                "asset_id": asset.id,
                "reason": "Asset is assigned, cannot deactivate"
            })
            continue

        # Also check if there's any pending request on this asset
        # status ending with '_requested' means user raised a workflow
        requested_exists = AssetAssignment.objects.filter(
            asset=asset,
            status__iendswith="requested",
            returned_date__isnull=True
        ).exists()

        if requested_exists:
            skipped_list.append({
                "asset_id": asset.id,
                "reason": "Asset has a pending request, cannot deactivate"
            })
            continue

        # Safe to retire this asset
        try:
            asset.status = Asset.Status.RETIRED
        except Exception:
            asset.status = "Retired"

        # Save asset new status
        if hasattr(asset, "updated_at"):
            asset.save(update_fields=["status", "updated_at"])
        else:
            asset.save(update_fields=["status"])

        # Close any lingering assignments (belt and suspenders, should not hit because of early continue)
        # We still do it for correctness if something slipped through
        stale_assign_qs = AssetAssignment.objects.filter(
            asset=asset,
            returned_date__isnull=True
        )
        for assign in stale_assign_qs:
            assign.returned_date = now.date()
            if reason:
                if assign.remarks:
                    assign.remarks = f"{assign.remarks}\nSoft delete reason: {reason}"
                else:
                    assign.remarks = f"Soft delete reason: {reason}"
            assign.save(update_fields=["returned_date", "remarks"])

        # Audit in AssetLog
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

        retired_list.append({
            "asset_id": asset.id,
            "new_status": str(asset.status),
        })

    logger.info(
        f"Soft delete processed by {request.user}. retired={retired_list} skipped={skipped_list}"
    )

    return Response(
        {
            "detail": "Soft delete processed.",
            "retired": retired_list,
            "skipped": skipped_list,
        },
        status=status.HTTP_200_OK,
    )
#----------------GET ASSET TYPES----------
asset_type_list_response = openapi.Response(
    description="List of asset types",
    examples={
        "application/json": [
            {
                "id": 1,
                "name": "Laptop",
                "description": "Portable computer",
            },
            {
                "id": 2,
                "name": "Desktop",
                "description": "Tower or workstation PC",
            },
            {
                "id": 3,
                "name": "Monitor",
                "description": "Display device",
            }
        ]
    },
)

@swagger_auto_schema(
    method="get",
    operation_summary="Get all asset types",
    responses={200: asset_type_list_response},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated,IsAdmin])
def get_asset_types(request):
    set_request_context(request)

    qs = AssetType.objects.all().order_by("name")
    data = AssetTypeSerializer(qs, many=True).data

    logger.info(f"Asset types fetched by {request.user}")
    return Response(data, status=status.HTTP_200_OK)

#------------------ASSIGN ASSET------------------
@swagger_auto_schema(
    method="post",
    operation_summary="Assign asset to employee",
    request_body=AssignAssetSerializer,
    responses={201: assign_success_response, 400: "Bad Request", 404: "Not Found"},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated,IsAdmin])
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
#--------------current Assets--------
assigned_assets_example = openapi.Response(
    description="All active assigned assets with employee details (Admin only)",
    examples={
        "application/json": [
            {
                "id": 42,
                "asset": {
                    "id": 7,
                    "asset_type_name": "Laptop",
                    "product_name": "HP EliteBook 840 G10",
                    "model_no": "HP-840-G10",
                    "serial_no": "HP-840-7788",
                    "os_version": "Windows 11 Pro",
                    "configuration": "Intel i7, 16GB RAM, 512GB SSD",
                    "status": "Assigned",
                    "vendor_name": "HP India",
                    "images": [
                        {
                            "id": 123,
                            "image": "/media/asset_images/hp_elitebook_front.jpg",
                            "uploaded_at": "2025-10-20T10:15:00+05:30"
                        }
                    ]
                },
                "employee": {
                    "id": 15,
                    "first_name": "Aisha",
                    "last_name": "Sharma",
                    "email": "aisha.sharma@example.com"
                },
                "assigned_date": "2025-10-18",
                "status": "assigned",
                "remarks": "Issued for project onboarding"
            },
            
        ]
    }
)


@swagger_auto_schema(
    method="get",
    operation_summary="List all assets assigned to employees (Admin only)",
    responses={200: assigned_assets_example, 403: "Forbidden"},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def list_assigned_assets(request):
    """
    Admin view.

    Return every active assignment:
    - AssetAssignment.returned_date IS NULL
    Means asset is still with the employee.

    Includes:
    - which asset
    - which employee
    - assigned_date
    - current status (assigned, surrender_requested, etc)
    - remarks
    """
    set_request_context(request)

    assignments = (
        AssetAssignment.objects
        .select_related("asset", "asset__asset_type", "asset__vendor", "employee")
        .prefetch_related("asset__images")
        .filter(returned_date__isnull=True)
        .order_by("-assigned_date")
    )

    data = AssignedAssetListRowSerializer(assignments, many=True).data

    logger.info(
        f"Admin {request.user} viewed active assigned assets list. Count={len(data)}"
    )

    return Response(data, status=status.HTTP_200_OK)

#--------------------revoke assets------------------
revoke_success_example = openapi.Response(
    description="Asset revoked and made available",
    examples={
        "application/json": {
            "detail": "Asset revoked successfully.",
            "asset_id": 12,
            "asset_status": "Available",
            "assignment_id": 44,
            "assignment_status": "revoked",
            "returned_date": "2025-10-27"
        }
    },
)


@swagger_auto_schema(
    method="post",
    operation_summary="Revoke asset from employee and mark it Available (Admin only)",
    request_body=RevokeAssetSerializer,
    responses={200: revoke_success_example, 400: "Bad Request", 404: "Not Found"},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
@transaction.atomic
def revoke_asset(request):
    """
    Admin action:
    - Close the active assignment for an employee on an asset
    - Mark assignment.status = 'revoked'
    - Set returned_date = today
    - Mark the asset status back to Available
    """
    set_request_context(request)

    serializer = RevokeAssetSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset_id = serializer.validated_data["asset_id"]
    employee_id = serializer.validated_data["employee_id"]
    note = serializer.validated_data.get("remarks", "").strip()

    # 1. Get asset
    asset = get_object_or_404(Asset, id=asset_id)
    employee = get_object_or_404(Employee, id=employee_id)

    # 2. Find active assignment for this employee and asset
    assignment = AssetAssignment.objects.filter(
        asset=asset,
        employee=employee,
        returned_date__isnull=True,
    ).order_by("-assigned_date").first()

    if not assignment:
        return Response(
            {"detail": "No active assignment found for this asset and employee."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 3. Set assignment.status = 'revoked'
    assignment.status = "revoked"
    assignment.returned_date = timezone.now().date()

    # append revoke note to remarks
    if note:
        if assignment.remarks:
            assignment.remarks = f"{assignment.remarks}\nRevoked: {note}"
        else:
            assignment.remarks = f"Revoked: {note}"

    assignment.save(update_fields=["status", "returned_date", "remarks"])

    # 4. Set asset.status = Available
    try:
        asset.status = Asset.Status.AVAILABLE
    except Exception:
        asset.status = "Available"

    asset.save(update_fields=["status", "updated_at"] if hasattr(asset, "updated_at") else ["status"])

    # 5. Log it in AssetLog for audit
    try:
        desc = f"Asset revoked from employee {employee.username}"
        if note:
            desc = f"{desc}. Note: {note}"

        AssetLog.objects.create(
            asset=asset,
            employee=str(employee),
            action="Revoked",
            description=desc,
            timestamp=timezone.now(),
        )
    except Exception:
        logger.warning("Failed to create AssetLog for revoke_asset", exc_info=True)

    logger.info(
        f"Asset {asset.id} revoked from employee {employee.username} by admin {request.user}"
    )

    return Response(
        {
            "detail": "Asset revoked successfully.",
            "asset_id": asset.id,
            "asset_status": str(asset.status),
            "assignment_id": assignment.id,
            "assignment_status": assignment.status,
            "returned_date": assignment.returned_date.isoformat(),
        },
        status=status.HTTP_200_OK,
    )
#----------------My Assets------------
@swagger_auto_schema(
    method="get",
    operation_summary="Get assets assigned to the logged-in user",
    responses={200: MyAssetSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated,IsUser])
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
    operation_summary="Submit a request for maintenance, surrender, renew, damaged, expired",
    request_body=RequestAssignmentSerializer,
    responses={200: request_success_response, 400: "Bad Request", 404: "Not Found"},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsUser])
def request_assignment(request):
    set_request_context(request)

    serializer = RequestAssignmentSerializer(data=request.data)
    if not serializer.is_valid():
        logger.error(f"Asset request failed: {serializer.errors} by user {request.user}", exc_info=True)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    asset_id = serializer.validated_data["asset_id"]
    requested_status = serializer.validated_data["status_requested"]
    reason = serializer.validated_data.get("reason", "").strip()

    # 1. Get asset
    try:
        asset = Asset.objects.get(id=asset_id)
    except Asset.DoesNotExist:
        return Response({"detail": "Asset not found."}, status=status.HTTP_404_NOT_FOUND)

    # 2. Get "employee" for this request
    # You changed your code to treat the user as employee directly
    employee = request.user

    # 3. Find the active assignment record for this asset and this user
    assignment = AssetAssignment.objects.filter(
        asset=asset,
        employee=employee,
        returned_date__isnull=True
    ).order_by("-id").first()

    if not assignment:
        logger.error(
            f"Asset request failed: No active assignment for asset {asset.id} and user {request.user}",
            exc_info=True
        )
        return Response({"detail": "No active assignment found."}, status=status.HTTP_400_BAD_REQUEST)

    # 4. Update the AssetAssignment row so admin can see it in pending
    # expected patterns:
    # surrender_requested
    # maintenance_requested
    # renew_requested
    # damaged_requested
    # expired_requested
    assignment.status = requested_status

    # optional: if your AssetAssignment model has requested_at field, set it
    if hasattr(assignment, "requested_at"):
        assignment.requested_at = timezone.now()

    # optional: keep reason
    if hasattr(assignment, "remarks"):
        # append reason to remarks instead of overwriting
        if reason:
            if assignment.remarks:
                assignment.remarks = f"{assignment.remarks}\nUser request: {reason}"
            else:
                assignment.remarks = f"User request: {reason}"

    assignment.save()

    # 5. Write audit into AssetLog for history
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

    # 6. Log and respond
    logger.info(
        f"Asset request: Asset {asset.id} {requested_status} by user {request.user}"
    )

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
#------------------Pending request for user---
user_pending_example = openapi.Response(
    description="Pending requests for the logged-in user",
    examples={
        "application/json": [
            {
                "id": 51,
                "employee": {
                    "id": 22,
                    "first_name": "Ravi",
                    "last_name": "Narayan",
                    "email": "ravi.narayan@example.com"
                },
                "asset": {
                    "id": 9,
                    "asset_type_name": "Desktop",
                    "product_name": "Dell OptiPlex 7010",
                    "model_no": "DOP-7010-2025",
                    "serial_no": "DOP1004",
                    "os_version": "Windows 11 Pro",
                    "configuration": "Intel i7, 16GB RAM, 1TB HDD, 512GB SSD",
                    "status": "surrender_requested",
                    "vendor_name": "Dell India",
                    "images": []
                },
                "assigned_date": "2025-10-10",
                "status": "surrender_requested",
                "remarks": "Leaving team"
            }
        ]
    }
)


@swagger_auto_schema(
    method="get",
    operation_summary="Get all your pending asset requests",
    responses={200: user_pending_example, 403: "Forbidden"},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsUser])
def user_pending_requests(request):
    """
    User view.

    Return all AssetAssignment rows where:
    - employee == request.user
    - status ends with '_requested' (example: surrender_requested)
    - returned_date is null (asset still with user)

    Includes asset info, request status, remarks, assigned_date.
    """
    set_request_context(request)

    # request.user IS the Employee model in your project
    employee_obj = request.user

    pending_qs = (
        AssetAssignment.objects
        .filter(
            employee=employee_obj,
            status__iendswith="requested",
            returned_date__isnull=True,
        )
        .select_related("asset", "asset__asset_type", "asset__vendor", "employee")
        .prefetch_related("asset__images")
        .order_by("-assigned_date")
    )

    data = MyPendingRequestSerializer(pending_qs, many=True).data
    logger.info(f"Pending requests retrieved for user {request.user}; count={len(data)}")

    return Response(data, status=status.HTTP_200_OK)
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

asset_log_list_example = openapi.Response(
    description="List of asset log entries with asset details and images",
    examples={
        "application/json": [
            {
                "id": 101,
                "asset": {
                    "id": 7,
                    "asset_type_name": "Laptop",
                    "product_name": "HP EliteBook 840 G10",
                    "model_no": "HP-840-G10",
                    "serial_no": "HP-840-7788",
                    "os_version": "Windows 11 Pro",
                    "configuration": "Intel i7, 16GB RAM, 512GB SSD",
                    "status": "Assigned",
                    "vendor_name": "HP India",
                    "images": [
                        {
                            "id": 301,
                            "image": "/media/asset_images/hp_elitebook_front.jpg",
                            "uploaded_at": "2025-10-20T10:15:00+05:30"
                        },
                        {
                            "id": 302,
                            "image": "/media/asset_images/hp_elitebook_label.jpg",
                            "uploaded_at": "2025-10-20T10:16:11+05:30"
                        }
                    ]
                },
                "employee": "aisha.sharma",
                "action": "Request",
                "description": "Request: surrender_requested | Reason: Leaving team",
                "timestamp": "2025-10-22T15:45:00+05:30"
            },
            {
                "id": 102,
                "asset": {
                    "id": 7,
                    "asset_type_name": "Laptop",
                    "product_name": "HP EliteBook 840 G10",
                    "model_no": "HP-840-G10",
                    "serial_no": "HP-840-7788",
                    "os_version": "Windows 11 Pro",
                    "configuration": "Intel i7, 16GB RAM, 512GB SSD",
                    "status": "Available",
                    "vendor_name": "HP India",
                    "images": [
                        {
                            "id": 301,
                            "image": "/media/asset_images/hp_elitebook_front.jpg",
                            "uploaded_at": "2025-10-20T10:15:00+05:30"
                        }
                    ]
                },
                "employee": "admin",
                "action": "Revoked",
                "description": "Asset revoked from employee 22. Note: Work finished",
                "timestamp": "2025-10-23T11:10:45+05:30"
            }
        ]
    }
)


@swagger_auto_schema(
    method="get",
    operation_summary="Get full asset activity log with asset info and images",
    responses={200: asset_log_list_example, 403: "Forbidden"},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def list_asset_log(request):
    """
    Admin view.

    Returns the full audit trail from AssetLog.
    Includes:
    - which asset the log is about
    - asset details (type, serial, vendor)
    - asset images
    - which employee triggered the action (string field)
    - what action happened
    - when it happened
    Latest first.
    """
    set_request_context(request)

    logs = (
        AssetLog.objects
        .select_related("asset", "asset__asset_type", "asset__vendor")
        .prefetch_related("asset__images")
        .order_by("-timestamp")
    )

    data = AssetLogSerializer(logs, many=True).data
    logger.info(f"Asset log fetched by {request.user}. Count={len(data)}")

    return Response(data, status=status.HTTP_200_OK)