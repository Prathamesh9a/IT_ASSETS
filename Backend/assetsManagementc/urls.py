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
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)