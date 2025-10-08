from rest_framework import serializers
from django.db.models import Count
from .models import (
    TblServerAsset,
    TblAssetMaster,
    TblAssetType,
    TblAssetCategory,
    TblAssetOwner,
    TblAssetStatus,
)
from employeeManagement.models import TblEmployeeMaster, TblDepartmentMaster


class ServerAssetSerializer(serializers.ModelSerializer):
    # Write via slug of related PKs, read nested labels
    asset = serializers.SlugRelatedField(
        slug_field="asset_id", queryset=TblAssetMaster.objects.all(), allow_null=True, required=False
    )
    asset_type = serializers.SlugRelatedField(
        slug_field="asset_type_id", queryset=TblAssetType.objects.all(), allow_null=True, required=False
    )
    asset_category = serializers.SlugRelatedField(
        slug_field="asset_category_id", queryset=TblAssetCategory.objects.all(), allow_null=True, required=False
    )

    asset_name = serializers.CharField(source="asset.asset_name", read_only=True)
    asset_type_name = serializers.CharField(source="asset_type.asset_type", read_only=True)
    asset_category_name = serializers.CharField(source="asset_category.asset_category", read_only=True)

    class Meta:
        model = TblServerAsset
        fields = [
            "server_asset_id",
            "server_name_description",
            "asset",
            "asset_type",
            "asset_category",
            "asset_model_no",
            "is_mission_critical",
            "asset_serial_number",
            "configuration",
            "operating_system",
            "updated_date",
            "asset_name",
            "asset_type_name",
            "asset_category_name",
        ]
        read_only_fields = ["updated_date"]


class AssetOwnerSerializer(serializers.ModelSerializer):
    server_asset = serializers.SlugRelatedField(
        slug_field="server_asset_id", queryset=TblServerAsset.objects.all(), required=True
    )
    employee = serializers.SlugRelatedField(
        slug_field="employee_id", queryset=TblEmployeeMaster.objects.all(), required=False, allow_null=True
    )
    department = serializers.SlugRelatedField(
        slug_field="department_id", queryset=TblDepartmentMaster.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = TblAssetOwner
        fields = [
            "asset_owner_id",
            "server_asset",
            "employee",
            "department",
            "assigned_to",
            "email_id",
            "location",
            "assign_master",
            "created_date",
            "updated_date",
            "id",
        ]
        read_only_fields = ["created_date", "updated_date", "id"]


class AssignAssetSerializer(serializers.Serializer):
    server_asset_id = serializers.CharField(help_text="TblServerAsset.server_asset_id")
    employee_id = serializers.CharField(help_text="TblEmployeeMaster.employee_id")

    def validate(self, data):
        if not TblServerAsset.objects.filter(server_asset_id=data["server_asset_id"]).exists():
            raise serializers.ValidationError({"server_asset_id": "Server asset not found."})
        if not TblEmployeeMaster.objects.filter(employee_id=data["employee_id"]).exists():
            raise serializers.ValidationError({"employee_id": "Employee not found."})
        return data


class StatusSummaryItemSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()


class BulkAssetImportSerializer(serializers.Serializer):
    # Excel only, images are not supported by current DB schema
    file = serializers.FileField(required=True)


class ApproveRejectSerializer(serializers.Serializer):
    # Not supported by current schema, kept for uniform API surfaces
    assignment_id = serializers.CharField()
    action = serializers.ChoiceField(choices=[("approve", "approve"), ("reject", "reject")])
    reason = serializers.CharField(required=False, allow_blank=True)


class TransferAssetSerializer(serializers.Serializer):
    # Not supported by current schema, kept for uniform API surfaces
    asset_id = serializers.CharField()
    reason = serializers.CharField()
    transfer_to_employee_id = serializers.CharField()
