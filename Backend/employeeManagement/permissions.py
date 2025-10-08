from rest_framework.permissions import BasePermission
from .models import TblEmployeeMaster

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(user and getattr(user, "is_superuser", False))
       
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == TblEmployeeMaster.ADMIN
    
class IsUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == TblEmployeeMaster.USER

class IsAdminOrIsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == TblEmployeeMaster.ADMIN or request.user.role == TblEmployeeMaster.SUPER_ADMIN)