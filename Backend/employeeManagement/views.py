from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes
from .models import Employee
from .serializers import *
from django.shortcuts import get_object_or_404
from django.db import transaction
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import pandas as pd
import traceback
from .serializers import RoleSerializer
# from .serializers import BulkAssetImportSerializer
import logging
from logs.views import set_request_context
from django.db import IntegrityError
logger = logging.getLogger('custom')  # Use your 'custom' logger

# -------------------------------- USER MANAGEMENT --------------------------------

# ---------- LIST ----------
@swagger_auto_schema(
    method="get",
    responses={200: UserSerializer(many=True)},
    operation_summary="List users",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list(request):
    qs = Employee.objects.all().order_by("employee_id")
    data = UserSerializer(qs, many=True).data
    print(data)
    logger.info("Users listed by %s", getattr(request.user, "email_id", "unknown"))
    return Response(data, status=status.HTTP_200_OK)

# ---------- CREATE ----------
@swagger_auto_schema(
    method="post",
    request_body=UserCreateSerializer,
    responses={201: UserSerializer},
    operation_summary="Create user",
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])  # switch to IsAdminUser if needed
def user_create(request):
    serializer = UserCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    out = UserSerializer(user).data
    logger.info("User created by %s: %s", getattr(request.user, "email_id", "unknown"), out.get("email_id"))
    return Response(out, status=status.HTTP_201_CREATED)

# # ---------- UPDATE ----------
try:
    from logs.views import set_request_context
except Exception:
    def set_request_context(request):
        return None


update_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        "first_name": openapi.Schema(type=openapi.TYPE_STRING, example="Jane"),
        "last_name": openapi.Schema(type=openapi.TYPE_STRING, example="Doe"),
        "role": openapi.Schema(type=openapi.TYPE_STRING, example="User"),
        "department": openapi.Schema(type=openapi.TYPE_STRING, nullable=True, example="DEPT0001"),
        "password": openapi.Schema(type=openapi.TYPE_STRING, example="StrongPass@123"),
    },
)

@swagger_auto_schema(
    method="put",
    request_body=UserUpdateSerializer,
    responses={200: UserSerializer},
    operation_summary="Update User",
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def user_update(request, id):
    set_request_context(request)
    user = get_object_or_404(Employee, id=id)
    ser = UserUpdateSerializer(user, data=request.data, partial=True)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    user = ser.save()
    # include department name in response
    return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


# # ---------- DEACTIVATE (soft delete) ----------
deactivate_response = openapi.Response(
    "User deactivated",
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={"message": openapi.Schema(type=openapi.TYPE_STRING)},
    ),
)

@swagger_auto_schema(
    method="delete",
    responses={200: deactivate_response},
    operation_summary="Deactivate User",
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def user_deactivate(request, id):
    set_request_context(request)
    user = get_object_or_404(Employee, id=id)
    Employee.objects.filter(pk=user.pk).update(is_active=0)
    return Response({"message": "User deactivated"}, status=status.HTTP_200_OK)

# #-------------get roles--------- 
@swagger_auto_schema(
    method="get",
    responses={200: RoleSerializer(many=True)},
    operation_summary="Get Roles List",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_roles(request):
    set_request_context(request)
    roles = [{"value": v, "label": l} for v, l in Employee.ROLE_CHOICES]
    return Response(RoleSerializer(roles, many=True).data, status=status.HTTP_200_OK)

assign_ok = openapi.Response(
    "Role updated",
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={"message": openapi.Schema(type=openapi.TYPE_STRING)},
    ),
)



# try:
#     from logs.views import set_request_context
# except Exception:
#     def set_request_context(request):
#         return None

# ROLE_VALUES = {v for v, _ in Employee.ROLE_CHOICES}

# bulk_result_schema = openapi.Schema(
#     type=openapi.TYPE_OBJECT,
#     properties={
#         "created": openapi.Schema(
#             type=openapi.TYPE_ARRAY,
#             items=openapi.Schema(type=openapi.TYPE_OBJECT)
#         ),
#         "errors": openapi.Schema(
#             type=openapi.TYPE_ARRAY,
#             items=openapi.Schema(type=openapi.TYPE_STRING)
#         ),
#     },
# )

# @swagger_auto_schema(
#     method="post",
#     request_body=BulkAssetImportSerializer,
#     responses={200: openapi.Response(description="Bulk import result", schema=bulk_result_schema),
#                400: "Bad Request"},
#     operation_summary="Bulk Create Employee Accounts",
#     consumes=["multipart/form-data"],
# )
# @api_view(["POST"])
# @parser_classes([MultiPartParser])
# @permission_classes([IsAuthenticated])
# def employee_bulk_import(request):
#     set_request_context(request)

#     upload = request.FILES.get("file")
#     if not upload:
#         return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

#     if not upload.name.lower().endswith((".xlsx", ".xls")):
#         return Response({"error": "Only .xlsx or .xls files are accepted"}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         df = pd.read_excel(upload)
#     except Exception as e:
#         return Response({"error": f"Invalid Excel file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#     # column helpers
#     lower_map = {str(c).strip().lower(): c for c in df.columns}

#     def pick(*names):
#         for n in names:
#             if n in lower_map:
#                 return lower_map[n]
#         return None

#     col_employee_name = pick("employee_name", "name", "full_name")
#     col_email = pick("email_id", "email")
#     col_role = pick("role")
#     col_department_id = pick("department_id", "departmentid", "dept_id")
#     col_department_name = pick("department", "department_name", "dept")
#     col_password = pick("password")

#     required = [col_employee_name, col_email]
#     if any(c is None for c in required):
#         return Response(
#             {"error": "Missing columns. Required at least: employee_name, email_id or email"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )

#     created = []
#     errors = []

#     for idx, row in df.iterrows():
#         row_no = idx + 2  # header row is 1
#         try:
#             employee_name = str(row.get(col_employee_name) or "").strip()
#             email = str(row.get(col_email) or "").strip().lower()
#             role = str(row.get(col_role) or "User").strip()
#             raw_pwd = str(row.get(col_password) or "Default@123").strip()

#             if not employee_name:
#                 errors.append(f"Row {row_no}: employee_name required")
#                 continue
#             if not email:
#                 errors.append(f"Row {row_no}: email required")
#                 continue
#             if role and role not in ROLE_VALUES:
#                 errors.append(f"Row {row_no}: role '{role}' not in {sorted(ROLE_VALUES)}")
#                 continue

#             # resolve department
#             dept_obj = None
#             if col_department_id and pd.notna(row.get(col_department_id)):
#                 dept_id = str(row.get(col_department_id)).strip()
#                 dept_obj = TblDepartmentMaster.objects.filter(department_id=dept_id).first()
#                 if not dept_obj:
#                     errors.append(f"Row {row_no}: Department_ID '{dept_id}' not found")
#                     continue
#             elif col_department_name and pd.notna(row.get(col_department_name)):
#                 dept_name = str(row.get(col_department_name)).strip()
#                 if dept_name:
#                     dept_obj = TblDepartmentMaster.objects.filter(department__iexact=dept_name).first()
#                     if not dept_obj:
#                         errors.append(f"Row {row_no}: Department '{dept_name}' not found")
#                         continue

#             # skip if email exists
#             if Employee.objects.filter(email_id__iexact=email).exists():
#                 errors.append(f"Row {row_no}: email '{email}' already exists")
#                 continue

#             # create via manager so password hashes correctly and email maps to email_id
#             user = Employee.objects.create_user(
#                 email_id=email,
#                 password=raw_pwd,
#                 employee_name=employee_name,
#                 role=role or "User",
#                 department=dept_obj,
#                 is_active_raw=1,
                
#             )

#             # refresh with department for serializer
#             user = Employee.objects.select_related("department").get(pk=user.pk)
#             created.append(UserSerializer(user).data)

#         except IntegrityError as ie:
#             errors.append(f"Row {row_no}: integrity error {str(ie)}")
#         except Exception as e:
#             errors.append(f"Row {row_no}: {str(e)}")

#     return Response({"created": created, "errors": errors}, status=status.HTTP_200_OK)