from django.db import models
from employeeManagement.models import Vendor
from employeeManagement.models import Employee

class AssetType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "asset_type"
        ordering = ["name"]

    def __str__(self):
        return self.name
    
class Asset(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "Available", "Available"
        ASSIGNED = "Assigned", "Assigned"
        IN_REPAIR = "In Repair", "In Repair"
        RETIRED = "Retired", "Retired"    
    asset_type = models.ForeignKey(AssetType, on_delete=models.PROTECT, related_name="assets")
    product_name = models.CharField(max_length=150)
    model_no = models.CharField(max_length=100, blank=True)
    serial_no = models.CharField(max_length=100, blank=True,null = True)
    keyboard_sr_no = models.CharField(max_length=100, blank=True)
    mouse_sr_no = models.CharField(max_length=100, blank=True)

    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name="assets")
    is_amc = models.BooleanField(default=False)
    amc_start_date = models.DateField(null=True, blank=True)
    amc_end_date = models.DateField(null=True, blank=True)
    amc_vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name="amc_assets")
    warranty_expiry = models.DateField(null=True, blank=True)

    os_version = models.CharField(max_length=120, blank=True)
    configuration = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "asset"
        indexes = [
            models.Index(fields=["serial_no"]),
            models.Index(fields=["status"]),
            models.Index(fields=["asset_type"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product_name} [{self.serial_no}]"
    
class AssetImage(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="asset_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)    

    class Meta:
        db_table = "asset_image"
        ordering = ["-uploaded_at"]

def __str__(self):
    return f"{self.asset.serial_no} image {self.id}"
    
class AssetAssignment(models.Model):
    ASSIGNMENT_STATUS = [
        ('assigned', 'Assigned'),
        # User-requested statuses
        ('surrender_requested', 'Surrender Requested'),
        ('maintenance_requested', 'Maintenance Requested'),
        ('renew_requested', 'Renew Requested'),
        ('damaged_requested', 'Damaged Requested'),
        ('expired_requested', 'Expired Requested'),
        # Admin decision statuses
        ('surrender_approved', 'Surrender Approved'),
        ('surrender_rejected', 'Surrender Rejected'),
        ('maintenance_approved', 'Maintenance Approved'),
        ('maintenance_rejected', 'Maintenance Rejected'),
        ('renew_approved', 'Renew Approved'),
        ('renew_rejected', 'Renew Rejected'),
        ('damaged_approved', 'Damaged Approved'),
        ('damaged_rejected', 'Damaged Rejected'),
        ('expired_approved', 'Expired Approved'),
        ('expired_rejected', 'Expired Rejected'),
    ]
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="assignments")
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="asset_assignments")
    assigned_date = models.DateField()
    returned_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=ASSIGNMENT_STATUS, default='assigned')
    remarks = models.TextField(blank=True)
     
    class Meta:
        db_table = "asset_assignment"
        ordering = ["-assigned_date"]

def __str__(self):
    return f"{self.asset.serial_no} -> {self.user.username}"


class AssetLog(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="logs")
    employee = models.CharField(max_length=50)
    action = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField()

    class Meta:
        db_table = "asset_log"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.timestamp:%Y-%m-%d} {self.asset.serial_no} {self.action}"