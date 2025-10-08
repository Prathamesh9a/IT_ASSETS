from django.db import models
from employeeManagement.models import TblEmployeeMaster, TblDepartmentMaster
# Create your models here.
class TblAssetCategory(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    asset_category_id = models.CharField(db_column='Asset_Category_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    asset_category = models.CharField(db_column='Asset_Category', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    asset = models.ForeignKey('TblAssetMaster', models.DO_NOTHING, db_column='Asset_ID', blank=True, null=True)  # Field name made lowercase.
    asset_type = models.ForeignKey('TblAssetType', models.DO_NOTHING, db_column='Asset_Type_ID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Tbl_Asset_Category'

class TblAssetMaster(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    asset_id = models.CharField(db_column='Asset_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    asset_name = models.CharField(db_column='Asset_Name', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    created_date = models.DateTimeField(db_column='Created_date', blank=True, null=True)  # Field name made lowercase.    

    class Meta:
        managed = False
        db_table = 'Tbl_Asset_MAster'


class TblAssetOwner(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    asset_owner_id = models.CharField(db_column='Asset_Owner_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    assigned_to = models.CharField(db_column='Assigned_To', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    email_id = models.CharField(db_column='Email_Id', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    server_asset = models.ForeignKey('TblServerAsset', models.DO_NOTHING, db_column='Server_Asset_ID', blank=True, null=True)  # Field name made lowercase.
    location = models.ForeignKey('TblLocationMaster', models.DO_NOTHING, db_column='Location_ID', blank=True, null=True)  
# Field name made lowercase.
    department = models.ForeignKey(TblDepartmentMaster, models.DO_NOTHING, db_column='Department_ID', blank=True, null=True)  # Field name made lowercase.
    employee = models.ForeignKey(TblEmployeeMaster, models.DO_NOTHING, db_column='Employee_ID', blank=True, null=True)  
# Field name made lowercase.
    created_date = models.DateTimeField(db_column='Created_Date', blank=True, null=True)  # Field name made lowercase.    
    updated_date = models.DateTimeField(db_column='Updated_Date', blank=True, null=True)  # Field name made lowercase.    
    assign_master = models.ForeignKey('TblAssignMaster', models.DO_NOTHING, db_column='Assign_Master_ID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Tbl_Asset_Owner'

class TblAssetPurchaseDetails(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)
    asset_purchase_id = models.CharField(
        db_column='Asset_Purchase_ID',
        primary_key=True,
        max_length=8,
        db_collation='SQL_Latin1_General_CP1_CI_AS'
    )
    server_asset = models.ForeignKey(
        'TblServerAsset',
        models.DO_NOTHING,
        db_column='Server_Asset_ID',
        blank=True,
        null=True
    )
    pucase_order_no = models.CharField(
        db_column='Pucase_Order_No',
        max_length=200,
        db_collation='SQL_Latin1_General_CP1_CI_AS',
        blank=True,
        null=True
    )
    purchase_value = models.FloatField(db_column='Purchase_Value', blank=True, null=True)
    date_of_purchase = models.DateField(db_column='Date_of_Purchase', blank=True, null=True)
    date_of_material_inward = models.DateField(db_column='Date_of_Material_Inward', blank=True, null=True)
    supplier = models.ForeignKey(
        'TblSupplierMaster',
        models.DO_NOTHING,
        db_column='Supplier_ID',
        blank=True,
        null=True
    )
    created_date = models.DateTimeField(db_column='Created_Date', blank=True, null=True)
    updated_date = models.DateTimeField(db_column='Updated_Date', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Asset_Purchase_Details'

class TblAssetStatus(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    asset_status_id = models.CharField(db_column='Asset_Status_ID', primary_key=True, max_length=9, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    server_asset = models.ForeignKey('TblServerAsset', models.DO_NOTHING, db_column='Server_Asset_ID', blank=True, null=True)  # Field name made lowercase.
    asset_condition_good_fair_excellent = models.CharField(db_column='Asset Condition. Good/Fair/Excellent', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    in_amc = models.IntegerField(db_column='In_AMC', blank=True, null=True)  # Field name made lowercase.
    supplier = models.ForeignKey('TblSupplierMaster', models.DO_NOTHING, db_column='Supplier_ID', blank=True, null=True)  
# Field name made lowercase.
    period_in_year_field = models.IntegerField(db_column='Period(in_Year)', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters. Field renamed because it ended with '_'.
    warranty_description = models.CharField(db_column='Warranty_description', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    amc_amount = models.IntegerField(db_column='AMC_Amount', blank=True, null=True)  # Field name made lowercase.
    warranty_start_date = models.DateField(db_column='warranty Start Date', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    warranty_over_date = models.DateField(db_column='Warranty Over date', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    remarks = models.CharField(db_column='Remarks', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    created_date = models.DateTimeField(db_column='Created_Date', blank=True, null=True)  # Field name made lowercase.    
    updated_date = models.DateTimeField(db_column='Updated_Date', blank=True, null=True)  # Field name made lowercase.    

    class Meta:
        managed = False
        db_table = 'Tbl_Asset_Status'        

class TblAssetType(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    asset_type_id = models.CharField(db_column='Asset_Type_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    asset_type = models.CharField(db_column='Asset_Type', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    asset = models.ForeignKey('TblAssetMaster', models.DO_NOTHING, db_column='Asset_ID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Tbl_Asset_Type'

class TblServerAsset(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    server_asset_id = models.CharField(db_column='Server_Asset_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    server_name_description = models.CharField(db_column='Server_Name_Description', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    asset = models.ForeignKey('TblAssetMaster', models.DO_NOTHING, db_column='Asset_ID', blank=True, null=True)  # Field name made lowercase.
    asset_type = models.ForeignKey('TblAssetType', models.DO_NOTHING, db_column='Asset_Type_ID', blank=True, null=True)  # Field name made lowercase.
    asset_category = models.ForeignKey('TblAssetCategory', models.DO_NOTHING, db_column='Asset_Category_ID', blank=True, null=True)  # Field name made lowercase.
    asset_model_no = models.CharField(db_column='Asset_Model_No', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    is_mission_critical = models.IntegerField(db_column='Is_Mission_Critical', blank=True, null=True)  # Field name made lowercase.
    asset_serial_number = models.CharField(db_column='Asset_Serial_Number', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    configuration = models.TextField(db_column='Configuration', db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    operating_system = models.CharField(db_column='Operating_System', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    updated_date = models.DateTimeField(db_column='Updated_Date', blank=True, null=True)  # Field name made lowercase.    

    class Meta:
        managed = False
        db_table = 'Tbl_Server_Asset'  

class TblSupplierMaster(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    supplier_id = models.CharField(db_column='Supplier_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    supplier_name = models.CharField(db_column='Supplier_Name', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    email_id = models.CharField(db_column='Email_ID', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    supplier_toll_free_or_support_field = models.CharField(db_column='Supplier Toll Free or Support ', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters. Field renamed because it ended with '_'.
    is_active = models.BigIntegerField(db_column='Is_Active', blank=True, null=True)  # Field name made lowercase.        
    created_datedate = models.DateTimeField(db_column='Created_Datedate', blank=True, null=True)  # Field name made lowercase.
    updated_date = models.DateTimeField(db_column='Updated_Date', blank=True, null=True)  # Field name made lowercase.    

    class Meta:
        managed = False
        db_table = 'Tbl_Supplier_Master'      

class TblLocationMaster(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    location_id = models.CharField(db_column='Location_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    location = models.CharField(db_column='Location', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Tbl_Location_Master'     

class TblAssignMaster(models.Model):
    id = models.IntegerField(db_column='ID', unique=True)  # Field name made lowercase.
    assign_master_id = models.CharField(db_column='Assign_Master_ID', primary_key=True, max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    code = models.CharField(db_column='Code', max_length=8, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Tbl_Assign_Master'                   
