from django.urls import path,include
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.me_view, name='me'),
    path('sso-login/', views.sso_login_view, name='sso-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]