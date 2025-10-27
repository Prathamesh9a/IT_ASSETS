# serializers_users.py
from rest_framework import serializers
from employeeManagement.models import Employee
from django.contrib.auth.hashers import make_password
#from .constants import ROLE_CHOICES



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
            'department',
            'date_joined',
            'employee_id',
            'role',
        ]

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Employee
        fields = [
            "employee_id",
            "email",
            "password",
            "username",
            "first_name",
            "last_name",
            "role",
            "department",
            
        ]
        extra_kwargs = {
            "department": {"required": False, "allow_null": True},
            
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email").strip().lower()
        # your model manager expects email, not email_id
        user = Employee.objects.create_user(email=email, password=password, **validated_data)
        return user



class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['username', 'email', 'role',  'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'required': False},
            'username': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'role': {'required': False},
            
        }

    def validate_username(self, value):
        if Employee.objects.filter(username=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if Employee.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Email already exists.")
        return value


class RoleSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


    
# class BulkAssetImportSerializer(serializers.Serializer):
#     file = serializers.FileField(required=True)          # Excel .xlsx or .xls
#     images_zip = serializers.FileField(required=False)      