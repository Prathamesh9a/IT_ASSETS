from django.urls import path
from . import views as v

urlpatterns = [
    path('dashboard/summary/', v.dashboard_summary_api, name='dashboard_summary_api'),
    path("assets/", v.asset_list, name="asset_list"),
    path("assets/create/", v.asset_create, name="asset_create"),
    path("assets/bulk-import/", v.asset_bulk_import, name="asset_bulk_import"),
]

