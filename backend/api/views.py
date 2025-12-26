from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action,parser_classes
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import uuid
import os
from .models import CallHistory, CallingSession, KnowledgeDocument
from .serializers import CallHistorySerializer, CallingSessionSerializer
from .vapi_service import VAPIService
from rest_framework.parsers import MultiPartParser, FormParser



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
    # Extract phone number from the POST request body
    phone_number = request.data.get('phone_number')
    
    if not phone_number:
        return Response({'success': False, 'error': 'phone_number is required'}, status=400)

    service = VAPIService()
    call_response = service.start_call(phone_number)

    if call_response:
        # Create a session in your database to track the call
        session = CallingSession.objects.create(
            session_id=call_response.get('id'),
            is_active=True
        )
        return Response({'success': True, 'session_id': session.session_id})
    
    return Response({'success': False, 'error': 'VAPI Call Failed'}, status=500)

@api_view(['GET'])
def get_documents(request):
    """Returns all uploaded documents from the local DB"""
    docs = KnowledgeDocument.objects.all().order_by('-created_at')
    return Response([{
        'id': d.vapi_file_id, 
        'name': d.file_name, 
        'type': d.file_name.split('.')[-1].upper()
    } for d in docs])    
    
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
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'success': False, 'error': 'No file provided'}, status=400)

    service = VAPIService()
    
    # 1. Upload to Vapi
    vapi_response = service.upload_file(file_obj)
    if not vapi_response:
        return Response({'success': False, 'error': 'Vapi upload failed'}, status=500)
    
    new_id = vapi_response.get('id')

    # 2. Save to your local Database
    KnowledgeDocument.objects.create(
        vapi_file_id=new_id,
        file_name=file_obj.name
    )

    # 3. Get all IDs currently in your DB
    all_ids = list(KnowledgeDocument.objects.values_list('vapi_file_id', flat=True))
    print(f"📚 All Document IDs for Vapi Tool Update: {all_ids}")

    # 4. Update the Vapi Tool with the full, updated list
    update_status = service.update_query_tool(all_ids)

    if update_status:
        return Response({
            'success': True, 
            'file_id': new_id,
            'name': file_obj.name
        })
    
    return Response({'success': False, 'error': 'DB saved but Vapi Tool sync failed'}, status=500)

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
    

@api_view(['DELETE'])
def delete_document(request, file_id):
    """
    1. Delete document from local DB
    2. Fetch remaining IDs
    3. Update the Vapi Tool with the shorter list
    """
    try:
        # 1. Find and delete from DB
        doc = KnowledgeDocument.objects.get(vapi_file_id=file_id)
        doc.delete()
        print(f"🗑️ Deleted {file_id} from Database.")

        # 2. Get the updated list of remaining IDs
        service = VAPIService()
        remaining_ids = list(KnowledgeDocument.objects.values_list('vapi_file_id', flat=True))
        
        # 3. Update Vapi Tool
        print(f"🔄 Syncing updated list to Vapi Tool (Remaining: {len(remaining_ids)})")
        sync_success = service.update_query_tool(remaining_ids)

        if sync_success:
            return Response({
                'success': True, 
                'message': 'Document removed from DB and Vapi memory'
            })
        else:
            return Response({
                'success': False, 
                'error': 'Removed from DB but failed to sync with Vapi'
            }, status=500)

    except KnowledgeDocument.DoesNotExist:
        return Response({'error': 'Document not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)