from django.urls import path
from . import views as v

urlpatterns = [
    path("assets/", v.asset_list_create, name="asset-list"),
    path("assets/<str:server_asset_id>/", v.asset_detail, name="asset-detail"),
    path("assets/me/", v.my_assets, name="my-assets"),
    path("assets/status-summary/", v.status_summary, name="status-summary"),

    path("assets/<str:server_asset_id>/images/upload/", v.upload_asset_images, name="asset-images-upload"),
    path("assets/images/<str:image_id>/", v.delete_asset_image, name="asset-image-delete"),
    path("assets/images/<str:image_id>/replace/", v.replace_asset_image, name="asset-image-replace"),

    path("assets/bulk-import/", v.asset_bulk_import, name="asset-bulk-import"),
    path("assets/assign/", v.assign_asset, name="asset-assign"),

    path("assignments/request/", v.request_assignment, name="assignment-request"),
    path("assignments/approve/", v.approve_request, name="assignment-approve"),
    path("assignments/reject/", v.reject_request, name="assignment-reject"),
    path("assignments/transfer/request/", v.request_transfer, name="transfer-request"),
    path("assignments/transfer/approve-reject/", v.approve_reject_transfer, name="transfer-approve-reject"),

    path("assignments/history/", v.asset_assignment_history, name="assignment-history"),
    path("assignments/history/me/", v.my_assignment_history, name="assignment-history-me"),
    path("assignments/pending/", v.pending_requests, name="assignments-pending"),
    path("assignments/current/", v.current_assignments, name="assignments-current"),
]
