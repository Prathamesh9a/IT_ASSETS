from django.db import models
from django.contrib.auth.models import AbstractUser


class Employee(AbstractUser):
    ADMIN = 'admin'
    USER = 'user'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (USER, 'User'),
    ]
    
    employee_id = models.CharField(
        db_column="Employee_ID",
        max_length=8,
    )

    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default=USER
    )
    department = models.CharField(
        max_length=20, null=True, blank=True
    )

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_permissions',
        blank=True
    )
    class Meta:
        db_table = 'Employee'
    
    def __str__(self):
        return self.username
 


class Vendor(models.Model):
    name = models.CharField(max_length=150, unique=True)
    contact_person = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "vendor"
        ordering = ["name"]

    def __str__(self):
        return self.name