from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views as v

urlpatterns = [
    # path('dashboard/summary/', v.dashboard_summary_api, name='dashboard_summary_api'),
    path("", v.asset_list, name="asset-list"),
    path("create/", v.asset_create, name="asset-create"),
    # path("assets/bulk-import/", v.asset_bulk_import, name="asset_bulk_import"),
    path('assign/', v.assign_asset, name='assign-asset'),
    path('my-assets/', v.my_assets),
    path('request/', v.request_assignment, name='request'),
    path('pending/', v.pending_requests, name='pending-requests'),
    path("requests/decision/", v.approve_reject_request, name="approve-reject-request"),
    path("<int:pk>/", v.asset_update, name="asset-update"),
    path("delete/", v.delete_assets, name="asset-soft-delete"),
    path("asset-types/", v.get_asset_types, name="get-asset-types"),
    path("assigned/list/", v.list_assigned_assets, name="list-assigned-assets"),
    path("revoke/", v.revoke_asset, name="revoke-asset"),
    path("assets/requests/pending/user/", v.user_pending_requests, name="user-pending-requests"),
    path("assets/logs/", v.list_asset_log, name="list-asset-log"),

]



if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)