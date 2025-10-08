# serializers_users.py
from rest_framework import serializers
from employeeManagement.models import TblEmployeeMaster,TblDepartmentMaster
from django.contrib.auth.hashers import make_password
#from .constants import ROLE_CHOICES



class UserSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(read_only=True)
    is_active = serializers.SerializerMethodField()
    department_id = serializers.CharField(read_only=True)
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = TblEmployeeMaster
        fields = [
            "employee_id",
            "employee_name",
            "email_id",
            "role",
            "is_active",
            "date_of_joining",
            "department_id",
            "department_name",
        ]

    def get_is_active(self, obj):
        try:
            return bool(obj.is_active)
        except Exception:
            return False
        
    def get_department_name(self, obj):
        if not obj.department_id:
            return None
        if getattr(obj, "department", None):
            return obj.department.department
        return TblDepartmentMaster.objects.filter(
            department_id=obj.department_id
        ).values_list("department", flat=True).first()
    


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = TblEmployeeMaster
        fields = [
            "email_id",
            "password",
            "employee_name",
            "role",
            "department",
            "date_of_joining",
            "is_active_raw",
        ]
        extra_kwargs = {
            "department": {"required": False, "allow_null": True},
            "date_of_joining": {"required": False, "allow_null": True},
            "is_active_raw": {"required": False},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email_id").strip().lower()
        # your model manager expects email, not email_id
        user = TblEmployeeMaster.objects.create_user(email=email, password=password, **validated_data)
        return user



class UserUpdateSerializer(serializers.ModelSerializer):
    # accept Department_ID string like "DEPT0001"
    department = serializers.SlugRelatedField(
        slug_field="department_id",
        queryset=TblDepartmentMaster.objects.all(),
        required=False,
        allow_null=True,
    )
    password = serializers.CharField(required=False, write_only=True, min_length=8)

    class Meta:
        model = TblEmployeeMaster
        fields = ["employee_name", "role", "department", "password"]

    def update(self, instance, validated_data):
        updates = {}

        if "employee_name" in validated_data:
            updates["employee_name"] = validated_data["employee_name"]

        if "role" in validated_data:
            updates["role"] = (validated_data["role"] or "").strip()

        if "department" in validated_data:
            # SlugRelatedField returns TblDepartmentMaster or None
            dept = validated_data["department"]
            updates["department_id"] = getattr(dept, "department_id", None)

        if "password" in validated_data and validated_data["password"]:
            updates["password"] = make_password(validated_data["password"])

        if updates:
            TblEmployeeMaster.objects.filter(pk=instance.pk).update(**updates)
            # refresh changed fields only
            fields_to_refresh = list(updates.keys())
            instance.refresh_from_db(fields=fields_to_refresh)

        return instance



class RoleSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()

class AssignRoleSerializer(serializers.Serializer):
    employee_id = serializers.CharField()
    role = serializers.ChoiceField(choices=TblEmployeeMaster.ROLE_CHOICES)

    def validate_employee_id(self, v):
        return v.strip()
    
class BulkAssetImportSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)          # Excel .xlsx or .xls
    images_zip = serializers.FileField(required=False)      