import json
import re
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action,parser_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
from django.db import transaction
import uuid
import os
from rapidfuzz import process, fuzz
from .structured_output import ToolMetadata
from .models import CallHistory, CallingSession, KnowledgeDocument, ConnectedDatabase
from .serializers import CallHistorySerializer, CallingSessionSerializer
from .vapi_service import VAPIService
from rest_framework.parsers import MultiPartParser, FormParser
import pandas as pd
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import requests

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
structured_llm = llm.with_structured_output(ToolMetadata)

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

    all_db_records = ConnectedDatabase.objects.all()

    dynamic_tool_ids = []
    for record in all_db_records:
        dynamic_tool_ids.extend(record.vapi_tool_ids)

    service = VAPIService()
    call_response = service.start_call(phone_number, dynamic_tool_ids)

    
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
@parser_classes([MultiPartParser, FormParser])
def connect_database(request):
    source_type = request.data.get('source_type')
    can_read = request.data.get('can_read') == 'true'
    file_obj = request.FILES.get('file')

    # 1. Parse File
    if source_type == 'csv':
        df = pd.read_csv(file_obj)
    else:
        df = pd.read_excel(file_obj)
    
    print(f"📊 Loaded DataFrame with shape: {df.shape}")
    # 2. Generate Semantic Summary with Gemini
    columns = df.columns.tolist()
    sample = df.head(3).to_string()

    # 2. Generate Structured Output using LangChain
    try:
        ai_response = structured_llm.invoke(
            f"Analyze this dataset (Filename: {file_obj.name}). "
            f"Columns: {columns}. Sample Data: {sample}"
        )
        
        db_tool_name = ai_response.tool_name
        db_summary = ai_response.summary
        
    except Exception as e:
        print(f"⚠️ LangChain Structured Output failed: {e}")
        db_tool_name = "".join(x for x in file_obj.name.split('.')[0] if x.isalnum())
        db_summary = f"Database containing: {', '.join(columns)}"
    
    print(f"🛠️ Tool Name: {db_tool_name}")
    print(f"📝 Summary: {db_summary}")
    # 3. Create Tools in Vapi
    service = VAPIService()
    tool_ids = []

    if can_read:
        tool = service.create_db_function_tool(db_tool_name, db_summary, columns, "read")
        if tool and 'id' in tool:
            print(f"✅ Created READ tool with ID: {tool['id']}")
            tool_ids.append(tool['id'])

    # 4. Save to Django DB
    ConnectedDatabase.objects.create(
        name=db_tool_name,
        source_type=source_type,
        summary=db_summary,
        columns=columns,
        vapi_tool_ids=tool_ids,
        data=df.to_dict(orient='records')
    )

    return Response({
        'success': True,
        'tool_name': db_tool_name,
        'summary': db_summary,
        'tools_created': tool_ids
    })


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
        # Use a transaction to ensure DB integrity
        with transaction.atomic():
            try:
                doc = KnowledgeDocument.objects.get(vapi_file_id=file_id)
            except KnowledgeDocument.DoesNotExist:
                return Response({'error': 'Document not found in local DB'}, status=404)
            
            # Capture the ID before deleting
            target_id = doc.vapi_file_id
            doc.delete()
            print(f"🗑️ Deleted {target_id} from Database.")

        # 2. Get the updated list of remaining IDs
        remaining_ids = list(KnowledgeDocument.objects.values_list('vapi_file_id', flat=True))
        
        # 3. Update Vapi Tool
        print(f"🔄 Syncing updated list to Vapi Tool (Remaining: {len(remaining_ids)})")
        
        service = VAPIService()
        try:
            # We pass the list even if it's empty []
            sync_success = service.update_query_tool(remaining_ids)
            
            if sync_success:
                return Response({
                    'success': True, 
                    'message': 'Document removed from DB and Vapi synced successfully'
                })
            else:
                # If the service returned False instead of raising an error
                return Response({
                    'success': False, 
                    'error': 'DB record deleted, but Vapi refused the update. Check Vapi Tool ID.'
                }, status=500)
                
        except Exception as vapi_error:
            print(f"❌ Vapi Sync Crash: {str(vapi_error)}")
            return Response({
                'success': False,
                'error': f'DB deleted, but Vapi Sync crashed: {str(vapi_error)}'
            }, status=500)

    except Exception as e:
        print(f"💥 Top-level Error: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def execute_db_query(request):
    message = request.data.get('message', {})
    tool_calls = message.get('toolCalls', [])
    
    if not tool_calls:
        return Response({"error": "No tool call provided"}, status=400)
    
    call = tool_calls[0]
    tool_call_id = call.get('id') 
    function_name = call.get('function', {}).get('name', '')
    
    args = call.get('function', {}).get('arguments', {})
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except:
            args = {}

    search_query = str(args.get('search_query', '')).strip()
    db_name = function_name.replace('read_', '').replace('write_', '')
    
    print(f"🔎 Processing {db_name} for query: {search_query}")

    try:
        db_record = ConnectedDatabase.objects.get(name__iexact=db_name)
        rows = db_record.data

        final_data = None

        for row in rows:
            if str(list(row.values())[0]).lower() == search_query.lower():
                final_data = {"results": [row], "match_type": "exact"}
                break

        if not final_data:
            row_strings = [" ".join(str(v) for v in r.values()) for r in rows]
            matches = process.extract(search_query, row_strings, scorer=fuzz.partial_ratio, limit=3, score_cutoff=60)
            results = [rows[match[2]] for match in matches]
            final_data = {"results": results, "status": "success" if results else "not_found"}

        vapi_response = {
            "results": [
                {
                    "toolCallId": tool_call_id,
                    "result": final_data
                }
            ]
        }

        print(f"✅ Sending formatted response for ID: {tool_call_id}")
        return Response(vapi_response, status=200)

    except ConnectedDatabase.DoesNotExist:
        return Response({
            "results": [{
                "toolCallId": tool_call_id,
                "result": {"error": f"Database {db_name} not found"}
            }]
        }, status=200)
    

@api_view(['GET'])
@permission_classes([AllowAny])
def get_connected_databases(request):
    """
    Retrieves all databases stored in the ConnectedDatabase model.
    Used by the frontend to display the list of active datasets.
    """
    try:
        # Fetch all database records
        databases = ConnectedDatabase.objects.all()
        
        # Prepare the response data
        # We include the name and the JSON data stored in the 'data' field
        payload = [
            {
                "id": db.id,
                "name": db.name,
                "data": db.data  # The list of dictionaries from Excel/CSV
            } for db in databases
        ]
        
        print(f"📡 Fetched {len(payload)} connected databases.")
        return Response(payload, status=200)
    
    except Exception as e:
        print(f"❌ Error fetching databases: {str(e)}")
        return Response({"error": "Failed to retrieve databases"}, status=500)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_database(request):
    db_name = request.query_params.get('name')
    
    try:
        db_record = ConnectedDatabase.objects.get(name=db_name)
        db_record.delete()
        print(f"🗑️ Purged {db_name} from local storage.")
        
        return Response({
            "success": True, 
            "message": f"Database {db_name} deleted. It will not be included in future calls."
        })
    except ConnectedDatabase.DoesNotExist:
        return Response({"error": "Database not found"}, status=404)