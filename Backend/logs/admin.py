from django.contrib import admin
from .models import BackendLog

@admin.register(BackendLog)
class BackendLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "level", "module", "function_name", "ip_address")
    search_fields = ("message", "module", "function_name", "ip_address", "user_agent")
    list_filter = ("level", "module", "function_name", "ip_address", "created_at")
    readonly_fields = (
        "level",
        "message",
        "module",
        "function_name",
        "traceback",
        "ip_address",
        "user_agent",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
