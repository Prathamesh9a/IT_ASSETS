# assetsManagementc/serializers.py
from rest_framework import serializers
from .models import TblServerAsset

class BulkAssetImportSerializer(serializers.Serializer):
    file = serializers.FileField()
    images_zip = serializers.FileField(required=False, allow_null=True)

class TblServerAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblServerAsset
        # created_date is not present on this model, updated_date exists but keep read-only
        read_only_fields = ["id", "updated_date"]
        fields = [
            "server_asset_id",
            "server_name_description",
            "asset",            # FK to TblAssetMaster
            "asset_type",       # FK to TblAssetType
            "asset_category",   # FK to TblAssetCategory
            "asset_model_no",
            "is_mission_critical",
            "asset_serial_number",
            "configuration",
            "operating_system",
            "updated_date",
            "id",
        ]

class DepartmentDistributionSerializer(serializers.Serializer):
    department = serializers.CharField()
    hardware_assets = serializers.IntegerField()
    software_licenses = serializers.IntegerField()
    under_repair = serializers.IntegerField()
    available = serializers.IntegerField()

class SystemAnalyticsSerializer(serializers.Serializer):
    total_assets = serializers.IntegerField()
    active_users = serializers.IntegerField()
    requests_today = serializers.IntegerField()
    total_departments = serializers.IntegerField()
    asset_distribution = DepartmentDistributionSerializer(many=True)
