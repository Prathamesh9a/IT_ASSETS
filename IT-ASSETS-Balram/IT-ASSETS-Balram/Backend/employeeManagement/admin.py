from django.contrib import admin
from django.contrib.auth.admin import UserAdmin 
from .models import Employee
from django.contrib import admin
from .models import Vendor

class CustomUserAdmin(UserAdmin):
    model = Employee
    
    list_display = ('username', 'id', 'email', 'first_name', 'last_name', 'role')
    fieldsets = (
        (None, {'fields': ('username', 'password', 'first_name', 'last_name', 'email', 'is_active', 'role')}),
    )
    search_fields = ('role', 'username', 'email')
    list_filter = ('first_name', 'last_name', 'username',)

# Register the User model and custom admin
admin.site.register(Employee, CustomUserAdmin)

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("name", "contact_person", "email", "phone")
    search_fields = ("name", "contact_person", "email", "phone")
    ordering = ("name",)
    list_per_page = 50

    fieldsets = (
    ("Vendor Info", {"fields": ("name", "contact_person")}),
    ("Contact", {"fields": ("email", "phone", "address")}),
)


