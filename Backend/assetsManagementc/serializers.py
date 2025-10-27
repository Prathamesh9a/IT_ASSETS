from rest_framework import serializers
from employeeManagement.models import Employee
from .models import AssetType, Asset, AssetImage , Vendor, AssetAssignment
from django.utils import timezone
from django.db import transaction
from .models import AssetType
class AssetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetType
        fields = ["id", "name", "description"]


class AssetImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = AssetImage
        fields = ["id", "image", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]

class MyAssetSerializer(serializers.ModelSerializer):
    asset_type_name = serializers.CharField(source="asset_type.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True, default=None)
    amc_vendor_name = serializers.CharField(source="amc_vendor.name", read_only=True, default=None)
    images = AssetImageSerializer(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = [
            "id",
            "asset_type_name",
            "product_name",
            "model_no",
            "serial_no",
            "keyboard_sr_no",
            "mouse_sr_no",
            "purchase_date",
            "purchase_cost",
            "vendor_name",
            "is_amc",
            "amc_start_date",
            "amc_end_date",
            "amc_vendor_name",
            "warranty_expiry",
            "os_version",
            "configuration",
            "status",
            "created_at",
            "updated_at",
            "images",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AssetSerializer(serializers.ModelSerializer):
    # asset_type = serializers.PrimaryKeyRelatedField(queryset=AssetType.objects.all())
    asset_type_name = serializers.CharField(source="asset_type.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True, default=None)
    amc_vendor_name = serializers.CharField(source="amc_vendor.name", read_only=True, default=None)
    images = AssetImageSerializer(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = [
            "id",
            "asset_type",
            "asset_type_name",
            "product_name",
            "model_no",
            "serial_no",
            "keyboard_sr_no",
            "mouse_sr_no",
            "purchase_date",
            "purchase_cost",
            "vendor",
            "vendor_name",
            "is_amc",
            "amc_start_date",
            "amc_end_date",
            "amc_vendor",
            "amc_vendor_name",
            "warranty_expiry",
            "os_version",
            "configuration",
            "status",
            "created_at",
            "updated_at",
            "images",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AssetCreateSerializer(serializers.ModelSerializer):
    asset_type = serializers.SlugRelatedField(slug_field="name", queryset=AssetType.objects.all())
    vendor = serializers.SlugRelatedField(slug_field="name", queryset=Vendor.objects.all(), allow_null=True, required=False)
    amc_vendor = serializers.SlugRelatedField(slug_field="name", queryset=Vendor.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Asset
        fields = [
            "asset_type",
            "product_name",
            "model_no",
            "serial_no",
            "keyboard_sr_no",
            "mouse_sr_no",
            "purchase_date",
            "purchase_cost",
            "vendor",
            "is_amc",
            "amc_start_date",
            "amc_end_date",
            "amc_vendor",
            "warranty_expiry",
            "os_version",
            "configuration",
            "status",
        ]

    def validate(self, attrs):
        if attrs.get("is_amc"):
            if not attrs.get("amc_vendor"):
                raise serializers.ValidationError({"amc_vendor": "amc_vendor is required when is_amc is true"})
            if not attrs.get("amc_start_date") or not attrs.get("amc_end_date"):
                raise serializers.ValidationError({"amc_dates": "amc_start_date and amc_end_date are required"})
            if attrs["amc_end_date"] < attrs["amc_start_date"]:
                raise serializers.ValidationError({"amc_end_date": "amc_end_date must be on or after amc_start_date"})
        return attrs
    

class AssetUpdateSerializer(serializers.ModelSerializer):
    # accept FK ids on update (optional)
    asset_type = serializers.PrimaryKeyRelatedField(queryset=AssetType.objects.all(), required=False, allow_null=True)
    vendor = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.all(), required=False, allow_null=True)
    amc_vendor = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Asset
        fields = [
            "asset_type",
            "product_name",
            "model_no",
            "serial_no",
            "keyboard_sr_no",
            "mouse_sr_no",
            "purchase_date",
            "purchase_cost",
            "vendor",
            "is_amc",
            "amc_start_date",
            "amc_end_date",
            "amc_vendor",
            "warranty_expiry",
            "os_version",
            "configuration",
            "status",
        ]
        extra_kwargs = {f: {"required": False} for f in fields}

    def validate(self, attrs):
        # when enabling AMC, dates and vendor must be present
        is_amc = attrs.get("is_amc", getattr(self.instance, "is_amc", False))
        amc_vendor = attrs.get("amc_vendor", getattr(self.instance, "amc_vendor", None))
        amc_start = attrs.get("amc_start_date", getattr(self.instance, "amc_start_date", None))
        amc_end = attrs.get("amc_end_date", getattr(self.instance, "amc_end_date", None))

        if is_amc:
            if not amc_vendor:
                raise serializers.ValidationError({"amc_vendor": "amc_vendor is required when is_amc is true"})
            if not amc_start or not amc_end:
                raise serializers.ValidationError({"amc_dates": "amc_start_date and amc_end_date are required when is_amc is true"})
            if amc_end < amc_start:
                raise serializers.ValidationError({"amc_end_date": "amc_end_date must be on or after amc_start_date"})
        return attrs

class DeleteAssetsSerializer(serializers.Serializer):
    asset_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
        help_text="List of asset IDs to deactivate"
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Reason for deactivation"
    )
class AssetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetType
        fields = [
            "id",
            "name",
            "description",
        ]
        read_only_fields = ["id"]

class AssignAssetSerializer(serializers.Serializer):
    asset_id = serializers.IntegerField()
    employee_id = serializers.IntegerField()
    remarks = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        asset = Asset.objects.filter(id=data["asset_id"]).first()
        if not asset:
            raise serializers.ValidationError({"asset_id": "Asset not found."})
        if asset.status != Asset.Status.ASSIGNED.label and asset.status != Asset.Status.AVAILABLE:
            # handles any unexpected value
            raise serializers.ValidationError({"asset_id": "Asset status is invalid for assignment."})
        if asset.status != Asset.Status.AVAILABLE:
            raise serializers.ValidationError({"asset_id": "Asset is not available."})

        employee = Employee.objects.filter(id=data["employee_id"]).first()
        if not employee:
            raise serializers.ValidationError({"employee_id": "Employee not found."})

        active_assignment = AssetAssignment.objects.filter(asset=asset, returned_date__isnull=True).exists()
        if active_assignment:
            raise serializers.ValidationError({"asset_id": "Asset already has an active assignment."})

        data["_asset"] = asset
        data["_employee"] = employee
        data["_assigned_date"] = timezone.now().date()
        return data  
class AssignedEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]
class AssignedAssetSerializer(serializers.ModelSerializer):
    asset_type_name = serializers.CharField(source="asset_type.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True, default=None)
    images =AssetImageSerializer(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = [
            "id",
            "asset_type_name",
            "product_name",
            "model_no",
            "serial_no",
            "os_version",
            "configuration",
            "status",
            "vendor_name",
            "images",
        ]        
class AssignedAssetListRowSerializer(serializers.ModelSerializer):
    asset = AssignedAssetSerializer(read_only=True)
    employee = AssignedEmployeeSerializer(read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            "id",
            "asset",
            "employee",
            "assigned_date",
            "status",
            "remarks",
        ]
        read_only_fields = [
            "id",
            "asset",
            "employee",
            "assigned_date",
            "status",
            "remarks",
        ]

class RevokeAssetSerializer(serializers.Serializer):
    asset_id = serializers.IntegerField(help_text="Asset ID to revoke")
    employee_id = serializers.IntegerField(help_text="Employee ID who currently holds this asset")
    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional note for why this asset was revoked"
    )

class RequestAssignmentSerializer(serializers.Serializer):
    asset_id = serializers.IntegerField(help_text="Asset ID")
    status_requested = serializers.ChoiceField(choices=[
        ("surrender_requested", "Surrender Requested"),
        ("maintenance_requested", "Maintenance Requested"),
        ("renew_requested", "Renew Requested"),
        ("damaged_requested", "Damaged Requested"),
        ("expired_requested", "Expired Requested"),
    ])
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Why you are raising this request"
    )
class AssetAssignmentSerializer(serializers.ModelSerializer):
    asset = AssignedAssetSerializer(read_only=True)
    employee = AssignedEmployeeSerializer(read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            "id",
            "asset",
            "employee",
            "assigned_date",
            "returned_date",
            "status",
            "remarks",
        ]
        read_only_fields = [
            "id",
            "asset",
            "employee",
            "assigned_date",
            "returned_date",
            "status",
            "remarks",
        ]
        # keep these read-only if your model has them
       # read_only_fields = ["assigned_by", "requested_at", "approved_at", "status"]    

class ApproveRejectSerializer(serializers.Serializer):
    assignment_id = serializers.IntegerField(help_text="AssetAssignment ID")
    action = serializers.ChoiceField(
        choices=[("approve", "Approve"), ("reject", "Reject")],
        help_text="approve or reject"
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=False,
        help_text="Reason required when action is reject"
    )

    def validate(self, data):
        if data.get("action") == "reject" and not data.get("reason"):
            raise serializers.ValidationError({"reason": "Reason is required when rejecting"})
        return data       