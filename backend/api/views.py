from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import uuid
import os
from .models import CallHistory, CallingSession
from .serializers import CallHistorySerializer, CallingSessionSerializer
from .vapi_service import VAPIService


class CallHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Call History"""
    
    queryset = CallHistory.objects.all()
    serializer_class = CallHistorySerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = CallHistory.objects.all()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


@api_view(['POST'])
def start_calling(request):
    """Start the calling agent"""
    
    print("\n" + "="*50)
    print("🚀 START CALLING REQUEST RECEIVED")
    print("="*50)
    print(f"📦 Request Data: {request.data}")
    print(f"📦 Headers: {dict(request.headers)}")
    print("="*50 + "\n")
    
    try:
        # Create or get active session
        session_id = str(uuid.uuid4())
        session = CallingSession.objects.create(
            session_id=session_id,
            is_active=True
        )
        
        print(f"✅ Created calling session: {session_id}")
        
        return Response({
            'success': True,
            'message': 'Calling agent started successfully',
            'session_id': session_id,
            'status': 'active'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Error starting calling: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def stop_calling(request):
    """Stop the calling agent"""
    
    print("\n" + "="*50)
    print("🛑 STOP CALLING REQUEST RECEIVED")
    print("="*50)
    print(f"📦 Request Data: {request.data}")
    print("="*50 + "\n")
    
    try:
        session_id = request.data.get('session_id')
        if session_id:
            session = CallingSession.objects.get(session_id=session_id)
            session.is_active = False
            session.ended_at = timezone.now()
            session.save()
            
        return Response({
            'success': True,
            'message': 'Calling agent stopped successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Error stopping calling: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def upload_document(request):
    """Upload document endpoint (stub)"""
    
    print("\n" + "="*50)
    print("📄 UPLOAD DOCUMENT REQUEST RECEIVED")
    print("="*50)
    print(f"📦 Request Data: {request.data}")
    print(f"📁 Files: {request.FILES}")
    
    if request.FILES:
        for key, file in request.FILES.items():
            print(f"  - {key}: {file.name} ({file.size} bytes)")
    
    print("="*50 + "\n")
    
    return Response({
        'success': True,
        'message': 'Document upload endpoint - stub implementation',
        'received_data': {
            'files_count': len(request.FILES) if request.FILES else 0,
            'form_data': dict(request.data)
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def connect_database(request):
    """Connect database endpoint (stub)"""
    
    print("\n" + "="*50)
    print("🗄️ CONNECT DATABASE REQUEST RECEIVED")
    print("="*50)
    print(f"📦 Request Data: {request.data}")
    
    # Print the database connection details
    db_type = request.data.get('database_type', 'Unknown')
    db_name = request.data.get('database_name', 'Unknown')
    host = request.data.get('host', 'Unknown')
    port = request.data.get('port', 'Unknown')
    
    print(f"  Database Type: {db_type}")
    print(f"  Database Name: {db_name}")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print("="*50 + "\n")
    
    return Response({
        'success': True,
        'message': 'Database connection endpoint - stub implementation',
        'received_data': dict(request.data)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_number(request):
    """Add number to calling list endpoint (stub)"""
    
    print("\n" + "="*50)
    print("📞 ADD NUMBER REQUEST RECEIVED")
    print("="*50)
    print(f"📦 Request Data: {request.data}")
    
    phone_number = request.data.get('phone_number', 'Unknown')
    name = request.data.get('name', 'Unknown')
    
    print(f"  Phone Number: {phone_number}")
    print(f"  Name: {name}")
    print("="*50 + "\n")
    
    return Response({
        'success': True,
        'message': 'Number added successfully (stub)',
        'received_data': dict(request.data)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_session_status(request):
    """Get current calling session status"""
    
    try:
        active_session = CallingSession.objects.filter(is_active=True).first()
        
        if active_session:
            return Response({
                'is_active': True,
                'session_id': active_session.session_id,
                'started_at': active_session.started_at,
                'total_calls': active_session.total_calls,
                'successful_calls': active_session.successful_calls,
                'failed_calls': active_session.failed_calls
            })
        else:
            return Response({
                'is_active': False,
                'message': 'No active calling session'
            })
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
