from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from .fields import VarCharCharField

class EmployeeUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email).strip().lower()
        user = self.model(email_id=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email=email, password=password, **extra_fields)

class TblDepartmentMaster(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    department_id = models.CharField(db_column='Department_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    department = models.CharField(db_column='Department', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    updated_date = models.DateTimeField(db_column='Updated_Date', blank=True, null=True)  # Field name made lowercase.    

    class Meta:
        managed = False
        db_table = 'Tbl_Department_Master'
    
    def __str__(self):
        return self.department
 
class TblEmployeeMaster(AbstractBaseUser, PermissionsMixin):
    SUPER_ADMIN = 'super_admin'
    ADMIN = 'admin'
    USER = 'user'

    ROLE_CHOICES = [
        (SUPER_ADMIN, 'Super Admin'),
        (ADMIN, 'Admin'),
        (USER, 'User'),
    ]
    employee_id = VarCharCharField(
        db_column="Employee_ID",
        primary_key=True,
        max_length=8,
        db_collation="SQL_Latin1_General_CP1_CI_AS"
    )
    id = models.IntegerField(db_column="ID", unique=True)
    employee_name = models.CharField(
        db_column="Employee_Name",
        max_length=200,
        db_collation="SQL_Latin1_General_CP1_CI_AS",
        blank=True,
        null=True
    )
    email_id = models.EmailField(
        db_column="Email_ID",
        unique=True,
        max_length=200,
        db_collation="SQL_Latin1_General_CP1_CI_AS",
        blank=False,
        null=False
    )
    department = models.ForeignKey(
        TblDepartmentMaster,
        models.DO_NOTHING,
        db_column="Department_ID",
        blank=True,
        null=True
    )
    date_of_joining = models.DateField(db_column="Date_Of_Joining", blank=True, null=True)
    is_active_raw = models.BigIntegerField(db_column="Is_Active", blank=True, null=True)
    created_datedate = models.DateTimeField(db_column="Created_Datedate", blank=True, null=True)
    updated_date = models.DateTimeField(db_column="Updated_Date", blank=True, null=True)
    password = models.CharField(
        db_column="PasswordHash",
        max_length=128,
        db_collation="SQL_Latin1_General_CP1_CI_AS",
        blank=True,
        null=True
    )
    is_staff = models.BooleanField(db_column="Is_Staff", default=False)
    is_superuser = models.BooleanField(db_column="Is_Superuser", default=False)
    role = models.CharField(db_column='Role', max_length=20, default=USER, db_collation='SQL_Latin1_General_CP1_CI_AS')  

    objects = EmployeeUserManager()

    USERNAME_FIELD = "email_id"
    REQUIRED_FIELDS = []

    class Meta:
        managed = False
        db_table = "Tbl_Employee_Master"

    
    def __str__(self):
        return str(self.email_id or self.employee_name or self.employee_id or self.id)

    @property
    def is_active(self):
        return bool(self.is_active_raw) and int(self.is_active_raw) == 1

    def get_full_name(self):
        return self.employee_name or self.email_id

    def get_short_name(self):
        return (self.employee_name or "").split(" ")[0] or self.email_id
