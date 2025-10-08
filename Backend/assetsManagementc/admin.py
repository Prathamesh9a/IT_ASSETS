# assetsManagement/admin.py
from django.contrib import admin
from .models import (
    TblAssetCategory,
    TblAssetMaster,
    TblAssetOwner,
    TblAssetPurchaseDetails,
    TblAssetStatus,
    TblAssetType,
    TblServerAsset,
    TblSupplierMaster,
    TblLocationMaster,
    TblAssignMaster,
)

class TblAssetCategoryAdmin(admin.ModelAdmin):
    list_display = ("asset_category_id", "asset_category", "asset", "asset_type", "id")
    list_filter = ("asset", "asset_type")
    search_fields = (
        "asset_category_id",
        "asset_category",
        "asset__asset_id",
        "asset_type__asset_type_id",
    )

class TblAssetMasterAdmin(admin.ModelAdmin):
    list_display = ("asset_id", "asset_name", "created_date", "id")
    list_filter = ()
    search_fields = ("asset_id", "asset_name")

class TblAssetOwnerAdmin(admin.ModelAdmin):
    list_display = (
        "asset_owner_id",
        "assigned_to",
        "email_id",
        "server_asset",
        "location",
        "department",
        "employee",
        "assign_master",
        "created_date",
        "updated_date",
        "id",
    )
    list_filter = ("server_asset", "location", "department", "employee", "assign_master")
    search_fields = (
        "asset_owner_id",
        "assigned_to",
        "email_id",
        "server_asset__server_asset_id",
        "location__location",
        "department__department",
        "employee__employee_id",
        "assign_master__assign_master_id",
    )

class TblAssetPurchaseDetailsAdmin(admin.ModelAdmin):
    list_display = (
        'asset_purchase_id',
        'server_asset',
        'pucase_order_no',
        'purchase_value',
        'date_of_purchase',
        'date_of_material_inward',
        'supplier',
        'created_date',
        'updated_date',
    )
    search_fields = ('asset_purchase_id', 'pucase_order_no')
    list_filter = ('supplier', 'date_of_purchase', 'date_of_material_inward')

class TblAssetStatusAdmin(admin.ModelAdmin):
    list_display = (
        "asset_status_id",
        "server_asset",
        "asset_condition_good_fair_excellent",
        "in_amc",
        "supplier",
        "period_in_year_field",
        "warranty_description",
        "amc_amount",
        "warranty_start_date",
        "warranty_over_date",
        "remarks",
        "created_date",
        "updated_date",
        "id",
    )
    list_filter = ("server_asset", "supplier", "in_amc")
    search_fields = (
        "asset_status_id",
        "server_asset__server_asset_id",
        "supplier__supplier_id",
        "warranty_description",
        "remarks",
    )

class TblAssetTypeAdmin(admin.ModelAdmin):
    list_display = ("asset_type_id", "asset_type", "asset", "id")
    list_filter = ("asset",)
    search_fields = ("asset_type_id", "asset_type", "asset__asset_id")

class TblServerAssetAdmin(admin.ModelAdmin):
    list_display = (
        "server_asset_id",
        "server_name_description",
        "asset",
        "asset_type",
        "asset_category",
        "asset_model_no",
        "is_mission_critical",
        "asset_serial_number",
        "operating_system",
        "updated_date",
        "id",
    )
    list_filter = ("asset", "asset_type", "asset_category", "is_mission_critical")
    search_fields = (
        "server_asset_id",
        "server_name_description",
        "asset__asset_id",
        "asset_type__asset_type_id",
        "asset_category__asset_category_id",
        "asset_serial_number",
        "operating_system",
    )

class TblSupplierMasterAdmin(admin.ModelAdmin):
    list_display = (
        "supplier_id",
        "supplier_name",
        "email_id",
        "supplier_toll_free_or_support_field",
        "is_active",
        "created_datedate",
        "updated_date",
        "id",
    )
    list_filter = ("is_active",)
    search_fields = ("supplier_id", "supplier_name", "email_id")

class TblLocationMasterAdmin(admin.ModelAdmin):
    list_display = ("location_id", "location", "id")
    list_filter = ()
    search_fields = ("location_id", "location")

class TblAssignMasterAdmin(admin.ModelAdmin):
    list_display = ("assign_master_id", "name", "code", "id")
    list_filter = ()
    search_fields = ("assign_master_id", "name", "code")

admin.site.register(TblAssetCategory, TblAssetCategoryAdmin)
admin.site.register(TblAssetMaster, TblAssetMasterAdmin)
admin.site.register(TblAssetOwner, TblAssetOwnerAdmin)
admin.site.register(TblAssetPurchaseDetails, TblAssetPurchaseDetailsAdmin)
admin.site.register(TblAssetStatus, TblAssetStatusAdmin)
admin.site.register(TblAssetType, TblAssetTypeAdmin)
admin.site.register(TblServerAsset, TblServerAssetAdmin)
admin.site.register(TblSupplierMaster, TblSupplierMasterAdmin)
admin.site.register(TblLocationMaster, TblLocationMasterAdmin)
admin.site.register(TblAssignMaster, TblAssignMasterAdmin)
