from django.contrib import admin
from .models import AssetType, Asset, AssetAssignment, AssetLog, AssetImage
from django.utils.html import format_html
from django.utils.timezone import localtime

from .models import Notification

@admin.register(AssetType)
class AssetTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    ordering = ("name",)
    list_per_page = 50

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("product_name","id", "serial_no", "asset_type", "status", "vendor", "amc_vendor", "purchase_date", "warranty_expiry", "created_at", )
    list_filter = ("status", "asset_type", "vendor", "amc_vendor")
    search_fields = ( "product_name", "model_no", "serial_no", "keyboard_sr_no", "mouse_sr_no", "os_version", "configuration", )
    raw_id_fields = ("asset_type", "vendor", "amc_vendor")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "purchase_date"
    list_select_related = ("asset_type", "vendor", "amc_vendor")
    ordering = ("-created_at",)
    list_per_page = 50

    fieldsets = (
        ("Type and Identity", {"fields": ("asset_type", "product_name", "model_no", "serial_no")}),
        ("Peripherals", {"fields": ("keyboard_sr_no", "mouse_sr_no")}),
        ("Purchase and Warranty", {
            "fields": ("purchase_date", "purchase_cost", "vendor", "warranty_expiry")
        }),
        ("AMC", {"fields": ("amc_vendor", "amc_start_date", "amc_end_date")}),
        ("System", {"fields": ("os_version", "configuration", "status")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

@admin.register(AssetImage)
class AssetImageAdmin(admin.ModelAdmin):
    list_display = ("id", "asset", "uploaded_at")
    search_fields = ("asset__serial_no",)


@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = ("asset","id", "employee", "assigned_date", "returned_date")
    list_filter = ("assigned_date", "returned_date")
    search_fields = ("asset__serial_no", "remarks")
    raw_id_fields = ("asset", "employee")
    date_hierarchy = "assigned_date"
    ordering = ("-assigned_date",)
    list_per_page = 50

@admin.register(AssetLog)
class AssetLogAdmin(admin.ModelAdmin):
    list_display = ("asset", "employee", "action", "timestamp","performed_by")
    list_filter = ("action","performed_by__username")
    search_fields = ("asset__serial_no", "employee", "action", "description","performed_by__username")
    raw_id_fields = ("asset",)
    date_hierarchy = "timestamp"
    ordering = ("-timestamp",)
    list_per_page = 50

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "to_user",
        "asset_link",
        "assignment_id",
        "short_message",
        "is_read",
        "created_local",
    )
    list_filter = (
        "is_read",
        "created_at",
    )
    search_fields = (
        "message",
        "to_user__username",
        "to_user__first_name",
        "to_user__last_name",
        "asset__product_name",
        "asset__serial_no",
        "assignment__id",
    )
    readonly_fields = (
        "created_at",
    )
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    autocomplete_fields = (
        "to_user",
        "asset",
        "assignment",
    )
    actions = ("mark_as_read", "mark_as_unread")

    def short_message(self, obj):
        return (obj.message[:80] + "…") if len(obj.message) > 80 else obj.message
    short_message.short_description = "Message"

    def created_local(self, obj):
        return localtime(obj.created_at).strftime("%Y-%m-%d %H:%M:%S")
    created_local.short_description = "Created At"

    def assignment_id(self, obj):
        return obj.assignment_id or "-"
    assignment_id.short_description = "Assignment"

    def asset_link(self, obj):
        if obj.asset_id and hasattr(obj.asset, "product_name"):
            return format_html("{} ({})", obj.asset.product_name, obj.asset.serial_no or "no-serial")
        return "-"
    asset_link.short_description = "Asset"

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"Marked {updated} notification(s) as read.")
    mark_as_read.short_description = "Mark selected as read"

    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"Marked {updated} notification(s) as unread.")
    mark_as_unread.short_description = "Mark selected as unread"    