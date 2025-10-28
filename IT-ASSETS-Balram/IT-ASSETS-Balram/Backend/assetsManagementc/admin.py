from django.contrib import admin
from .models import AssetType, Asset, AssetAssignment, AssetLog, AssetImage

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
    list_display = ("asset", "employee", "action", "timestamp")
    list_filter = ("action",)
    search_fields = ("asset__serial_no", "employee", "action", "description")
    raw_id_fields = ("asset",)
    date_hierarchy = "timestamp"
    ordering = ("-timestamp",)
    list_per_page = 50