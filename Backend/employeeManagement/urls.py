from django.urls import path
from . import views as v

urlpatterns = [
    path("users/", v.user_list, name="user-list"),
    path("users/create/", v.user_create, name="user-create"),
    path("users/<str:id>/", v.user_update, name="user-update"),
    path("users/<str:id>/deactivate/", v.user_deactivate, name="user-deactivate"),
    path("roles/", v.get_roles, name="roles-list"),
#     path("users/bulk-import/", v.employee_bulk_import, name="users-bulk-import"),
]
