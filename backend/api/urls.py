from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'call-history', views.CallHistoryViewSet, basename='call-history')

urlpatterns = [
    path('', include(router.urls)),
    path('start-calling/', views.start_calling, name='start-calling'),
    path('stop-calling/', views.stop_calling, name='stop-calling'),
    path('upload-document/', views.upload_document, name='upload-document'),
    path('connect-database/', views.connect_database, name='connect-database'),
    path('add-number/', views.add_number, name='add-number'),
    path('session-status/', views.get_session_status, name='session-status'),
]
