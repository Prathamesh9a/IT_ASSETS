from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm
from django.utils.html import format_html
from .models import TblEmployeeMaster, TblDepartmentMaster
from .forms import EmployeeCreationForm, EmployeeChangeForm


@admin.register(TblDepartmentMaster)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("department_id", "department")
    search_fields = ("department_id", "department")


class ActiveFilter(admin.SimpleListFilter):
    title = "Active"
    parameter_name = "active"

    def lookups(self, request, model_admin):
        return (("1", "Active"), ("0", "Inactive"))

    def queryset(self, request, queryset):
        val = self.value()
        if val == "1":
            return queryset.filter(is_active_raw=1)
        if val == "0":
            return queryset.exclude(is_active_raw=1)
        return queryset


@admin.register(TblEmployeeMaster)
class EmployeeAdmin(BaseUserAdmin):
    add_form = EmployeeCreationForm
    form = EmployeeChangeForm
    change_password_form = AdminPasswordChangeForm
    model = TblEmployeeMaster

    list_display = ("employee_id", "email_safe", "employee_name", "is_staff", "is_superuser","role")
    search_fields = ("employee_id", "email_id", "employee_name","role")
    ordering = ("employee_id",)
    list_filter = ("role", "is_superuser", ActiveFilter)

    exclude = ("groups", "user_permissions")
    readonly_fields = ("employee_id", "id", "last_login")

    fieldsets = (
        ("Login", {"fields": ("email_id", "password")}),
        ("Personal info", {"fields": ("employee_name", "department", "date_of_joining")}),
        ("Employment", {"fields": ("role",)}),
        ("Flags", {"fields": ("is_staff", "is_superuser", "is_active_raw")}),
        ("IDs", {"fields": ("employee_id", "id")}),
        ("Important dates", {"fields": ("last_login",)}),
        
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email_id",
                "password1",
                "password2",
                "employee_name",
                "department",
                "role",
                "is_staff",
                "is_superuser",
                "is_active_raw",
            ),
        }),
    )

    def email_safe(self, obj):
        return obj.email_id or "(no email)"
    email_safe.short_description = "Email"

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Build the correct password-change URL without reverse
        if obj and "password" in form.base_fields:
            url = request.build_absolute_uri(f"{request.path}password/")
            form.base_fields["password"].help_text = format_html(
                'Raw passwords are not stored. Change this user’s password using <a href="{}">this form</a>.',
                url,
            )
        return form
