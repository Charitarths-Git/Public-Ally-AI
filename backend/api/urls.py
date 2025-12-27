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
    path('documents/', views.get_documents, name='get_documents'),
    path('execute-db-query/', views.execute_db_query, name='execute_db_query'),
    path('documents/<str:file_id>/', views.delete_document, name='delete_document'),
    path('delete-database/', views.delete_database, name='delete_database'),
    path('get-databases/', views.get_connected_databases, name='get_connected_databases'),
    path('vapi-webhook/', views.vapi_webhook, name='vapi_webhook'),
    path('call-history/', views.get_call_history, name='get_call_history'),
]
