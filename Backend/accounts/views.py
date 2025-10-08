# views_auth.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

logger = logging.getLogger("custom")

login_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=["email", "password"],
    properties={
        "email": openapi.Schema(type=openapi.TYPE_STRING, example="user@example.com"),
        "password": openapi.Schema(type=openapi.TYPE_STRING, example="your_password"),
    },
)

login_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        "access": openapi.Schema(type=openapi.TYPE_STRING),
        "refresh": openapi.Schema(type=openapi.TYPE_STRING),
        "employee_id": openapi.Schema(type=openapi.TYPE_STRING),
        "email": openapi.Schema(type=openapi.TYPE_STRING),
        "name": openapi.Schema(type=openapi.TYPE_STRING),
        "is_staff": openapi.Schema(type=openapi.TYPE_BOOLEAN),
        "is_superuser": openapi.Schema(type=openapi.TYPE_BOOLEAN),
    },
)

@swagger_auto_schema(
    method="post",
    request_body=login_schema,
    responses={200: openapi.Response("Success", login_response_schema), 401: "Invalid credentials", 403: "Deactivated"},
    operation_summary="User login with email and password",
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    if not email or not password:
        return Response({"detail": "Email and password required."}, status=400)

    # IMPORTANT: pass username=email, Django maps it to USERNAME_FIELD (email_id)
    user = authenticate(request, username=email, password=password)

    if user is None:
        logger.error(f"Login failed for email={email}: invalid credentials")
        return Response({"detail": "Invalid credentials"}, status=401)

    if not user.is_active:
        logger.error(f"Login failed for email={email}: user deactivated")
        return Response({"detail": "User account is deactivated."}, status=403)

    refresh = RefreshToken.for_user(user)
    logger.info(f"Login success for email={email}")

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "employee_id": user.employee_id,
            "email": user.email_id,
            "name": user.employee_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        },
        status=200,
    )


logout_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=["refresh"],
    properties={"refresh": openapi.Schema(type=openapi.TYPE_STRING, example="your_refresh_token")},
)

@swagger_auto_schema(
    method="POST",
    request_body=logout_schema,
    responses={200: "Successfully logged out", 400: "Invalid refresh token"},
    operation_summary="User logout with refresh token blacklist",
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"detail": "Refresh token required."}, status=400)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        logger.info("Logout success, token blacklisted")
        return Response({"detail": "Successfully logged out"}, status=200)
    except Exception:
        logger.error("Logout failed: invalid refresh token", exc_info=True)
        return Response({"detail": "Invalid refresh token"}, status=400)


me_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        "employee_id": openapi.Schema(type=openapi.TYPE_STRING),
        "email": openapi.Schema(type=openapi.TYPE_STRING, format="email"),
        "name": openapi.Schema(type=openapi.TYPE_STRING),
        "is_staff": openapi.Schema(type=openapi.TYPE_BOOLEAN),
        "is_superuser": openapi.Schema(type=openapi.TYPE_BOOLEAN),
    },
)

@swagger_auto_schema(
    method="GET",
    responses={200: openapi.Response("Authenticated user info", me_response_schema)},
    operation_summary="Get current authenticated user's profile",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    u = request.user
    return Response(
        {
            "employee_id": u.employee_id,
            "email": u.email_id,
            "name": u.employee_name,
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def sso_login_view(request):
    return Response({"detail": "SSO login not implemented"}, status=501)
