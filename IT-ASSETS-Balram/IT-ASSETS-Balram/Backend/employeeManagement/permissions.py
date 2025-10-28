from rest_framework.permissions import BasePermission
from .models import Employee
       
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Employee.ADMIN
    
class IsUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == Employee.USER

