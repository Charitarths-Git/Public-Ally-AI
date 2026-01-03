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
import psycopg2
import os
from rapidfuzz import process, fuzz
from .structured_output import ToolMetadata
from .utils import deploy_supabase_edge_logic, fetch_google_sheet_as_df
from .models import CallHistory, CallingSession, KnowledgeDocument, ConnectedDatabase, HumanExpert, AgentConfiguration
from .serializers import CallHistorySerializer, CallingSessionSerializer
from .vapi_service import VAPIService, sanitize_function_name
from rest_framework.parsers import MultiPartParser, FormParser
import pandas as pd
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import requests
import gspread
from oauth2client.service_account import ServiceAccountCredentials

load_dotenv()

DEPLOYED_URL = os.getenv("DEPLOYED_URL")
# Lazy-load LLM to avoid initialization errors at startup when credentials aren't available
_llm = None
_structured_llm = None

def get_llm():
    """Get or initialize the LLM instance"""
    global _llm, _structured_llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            temperature=0.3,
            google_api_key=os.getenv("GEMINI_API_KEY")
        )
        _structured_llm = _llm.with_structured_output(ToolMetadata)
    return _llm, _structured_llm

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
def start_outbound_calling(request):
    """
    Start outbound calling - initiates a call to a phone number.
    Only includes tools that are enabled in agent configuration.
    """
    from .vapi_service import TOOL_ID
    
    phone_number = request.data.get('phone_number')
    file_ids = request.data.get('file_ids', [])
    
    if not phone_number:
        return Response({'success': False, 'error': 'phone_number is required'}, status=400)

    # Get agent configuration and tool settings
    agent_config = AgentConfiguration.get_config()
    tool_settings = agent_config.tool_settings or {}
    
    # Helper function to check if a tool is enabled
    def is_tool_enabled(tool_id):
        return tool_settings.get(tool_id, {}).get('enabled', True)  # Default enabled

    # Get all database tool IDs (filtered by enabled status)
    all_db_records = ConnectedDatabase.objects.all()
    dynamic_tool_ids = []
    for record in all_db_records:
        for tool_id in record.vapi_tool_ids:
            if is_tool_enabled(tool_id):
                dynamic_tool_ids.append(tool_id)

    # Get all active human expert transfer tool IDs (filtered by enabled status)
    human_expert_tool_ids = []
    for expert in HumanExpert.objects.filter(is_active=True):
        if is_tool_enabled(expert.vapi_tool_id):
            human_expert_tool_ids.append(expert.vapi_tool_id)
    
    # Filter base TOOL_IDs based on enabled status
    enabled_base_tool_ids = [tid for tid in TOOL_ID if is_tool_enabled(tid)]
    
    # Combine all enabled tools
    all_tool_ids = dynamic_tool_ids + human_expert_tool_ids
    print(f"📞 Starting outbound call with enabled tool IDs: {enabled_base_tool_ids + all_tool_ids}")
    print(f"👤 Human Expert Tool IDs: {human_expert_tool_ids}")
    print(f"🤖 Using Agent: {agent_config.name}")

    service = VAPIService()
    call_response = service.start_outbound_call(
        phone_number, 
        all_tool_ids, 
        file_ids,
        agent_name=agent_config.name,
        agent_description=agent_config.description,
        enabled_base_tool_ids=enabled_base_tool_ids
    )

    if call_response:
        # Create a session in your database to track the call
        session = CallingSession.objects.create(
            session_id=call_response.get('id'),
            is_active=True
        )
        return Response({
            'success': True, 
            'session_id': session.session_id,
            'call_id': call_response.get('id')
        })
    
    return Response({'success': False, 'error': 'VAPI Outbound Call Failed'}, status=500)

@api_view(['POST'])
def start_inbound_agent(request):
    """
    Start inbound agent - creates and activates an assistant to handle incoming calls.
    Only includes tools that are enabled in agent configuration.
    """
    from .vapi_service import TOOL_ID
    
    file_ids = request.data.get('file_ids', [])

    # Get agent configuration and tool settings
    agent_config = AgentConfiguration.get_config()
    tool_settings = agent_config.tool_settings or {}
    
    # Helper function to check if a tool is enabled
    def is_tool_enabled(tool_id):
        return tool_settings.get(tool_id, {}).get('enabled', True)  # Default enabled

    # Get all database tool IDs (filtered by enabled status)
    all_db_records = ConnectedDatabase.objects.all()
    dynamic_tool_ids = []
    for record in all_db_records:
        for tool_id in record.vapi_tool_ids:
            if is_tool_enabled(tool_id):
                dynamic_tool_ids.append(tool_id)

    # Get all active human expert transfer tool IDs (filtered by enabled status)
    human_expert_tool_ids = []
    for expert in HumanExpert.objects.filter(is_active=True):
        if is_tool_enabled(expert.vapi_tool_id):
            human_expert_tool_ids.append(expert.vapi_tool_id)
    
    # Filter base TOOL_IDs based on enabled status
    enabled_base_tool_ids = [tid for tid in TOOL_ID if is_tool_enabled(tid)]
    
    # Combine all enabled tools
    all_tool_ids = dynamic_tool_ids + human_expert_tool_ids
    print(f"📞 Starting inbound agent with enabled tool IDs: {enabled_base_tool_ids + all_tool_ids}")
    print(f"👤 Human Expert Tool IDs: {human_expert_tool_ids}")
    print(f"🤖 Using Agent: {agent_config.name}")

    service = VAPIService()
    agent_response = service.start_inbound_agent(
        all_tool_ids, 
        file_ids,
        agent_name=agent_config.name,
        agent_description=agent_config.description,
        enabled_base_tool_ids=enabled_base_tool_ids
    )

    if agent_response:
        assistant_id = agent_response.get('assistant_id') or agent_response.get('id')
        
        # Create a session in your database to track the inbound agent
        # Use assistant_id as session_id since CallingSession doesn't have assistant_id field
        session = CallingSession.objects.create(
            session_id=assistant_id,
            is_active=True
        )
        return Response({
            'success': True, 
            'session_id': session.session_id,
            'assistant_id': assistant_id,
            'message': 'Inbound agent activated successfully'
        })
    
    return Response({'success': False, 'error': 'VAPI Inbound Agent Failed'}, status=500)

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
        _, structured_llm = get_llm()
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
    vapi_tool_id = call.get('toolId') # The unique ID Vapi assigned to the tool
    function_name = call.get('function', {}).get('name', '')
    
    args = call.get('function', {}).get('arguments', {})
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except:
            args = {}

    search_query = str(args.get('search_query', '')).strip()

    # 1. CLEAN THE NAME: Strip search_, read_, and write_
    # This ensures "search_delhi_jal_board" becomes "delhi_jal_board"
    db_name_cleaned = function_name.replace('search_', '').replace('read_', '').replace('write_', '')
    
    print(f"🔎 Vapi Tool ID: {vapi_tool_id} | Function: {function_name} | Target: {db_name_cleaned}")

    try:
        # 2. MATCHING STRATEGY:
        # First try matching the Tool ID (Best Practice)
        db_record = ConnectedDatabase.objects.filter(vapi_tool_ids__contains=[vapi_tool_id]).first()
        
        # If not found by ID, match by cleaned name
        if not db_record:
            db_record = ConnectedDatabase.objects.filter(name__iexact=db_name_cleaned).first()

        if not db_record:
            print(f"❌ Database match failed for: {db_name_cleaned}")
            raise ConnectedDatabase.DoesNotExist

        rows = db_record.data
        final_data = None

        # 3. SEARCH LOGIC
        # Exact Match Check
        for row in rows:
            if any(str(val).lower() == search_query.lower() for val in row.values()):
                final_data = {"results": [row], "match_type": "exact"}
                break

        # Fuzzy Match Check (if exact match fails)
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

        print(f"✅ Success: Found {len(final_data.get('results', []))} results")
        return Response(vapi_response, status=200)

    except ConnectedDatabase.DoesNotExist:
        return Response({
            "results": [{
                "toolCallId": tool_call_id,
                "result": {"error": f"Database '{db_name_cleaned}' not found in Sahayaki system."}
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
        db_records = ConnectedDatabase.objects.filter(name=db_name)
        count = db_records.count()
        
        if count == 0:
            return Response({"error": "Database not found"}, status=404)
        
        db_records.delete()
        print(f"🗑️ Purged {count} record(s) with name '{db_name}' from local storage.")
        
        return Response({
            "success": True, 
            "message": f"Database {db_name} deleted ({count} record(s) removed). It will not be included in future calls."
        })
    except Exception as e:
        print(f"❌ Error deleting database: {str(e)}")
        return Response({"error": f"Failed to delete database: {str(e)}"}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_call_history(request):
    """
    Retrieves all call history records from the database.
    Used by the frontend to display call history in the history section.
    """
    try:
        # Fetch all call history records
        call_histories = CallHistory.objects.all().order_by('-created_at')
        
        # Serialize the data
        serializer = CallHistorySerializer(call_histories, many=True)
        
        print(f"📡 Fetched {len(serializer.data)} call history records.")
        return Response(serializer.data, status=200)
    
    except Exception as e:
        print(f"❌ Error fetching call history: {str(e)}")
        return Response({"error": "Failed to retrieve call history"}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def vapi_webhook(request):
    """
    Webhook endpoint to receive events from Vapi.
    Specifically handles end-of-call-report to extract and print transcripts.
    """
    
    print("\n" + "="*80)
    print("📞 VAPI WEBHOOK RECEIVED")
    print("="*80)
    print(f"🔍 Full Request Data: {request.data}")
    print(f"🔍 Request Headers: {dict(request.headers)}")
    print("="*80)
    
    try:
        # Extract the message from the webhook payload
        message = request.data.get('message', {})
        message_type = message.get('type')
        
        print(f"📨 Message Type: {message_type}")
        
        # Handle end-of-call-report
        if message_type == 'end-of-call-report':
            # Extract call details
            call = message.get('call', {})
            call_id = call.get('id', 'Unknown')
            call_status = call.get('status', 'ended')
            ended_reason = message.get('endedReason', 'Unknown')
            
            # Extract transcript and other details from message level
            transcript = message.get('transcript', 'No transcript available')
            summary = message.get('summary', '')
            recording_url = message.get('recordingUrl', '')
            stereo_recording_url = message.get('stereoRecordingUrl', '')
            
            # Extract timing information
            started_at_str = message.get('startedAt', '')
            ended_at_str = message.get('endedAt', '')
            duration_seconds = message.get('durationSeconds', 0)
            
            # Extract customer info
            customer = call.get('customer', {})
            phone_number = customer.get('number', 'Unknown')
            
            # Extract cost information
            cost = message.get('cost', 0)
            
            print(f"\n🆔 Call ID: {call_id}")
            print(f"📊 Status: {call_status}")
            print(f"🏁 Ended Reason: {ended_reason}")
            print(f"📞 Phone Number: {phone_number}")
            print(f"⏱️ Duration: {duration_seconds} seconds")
            print(f"💰 Cost: ${cost}")
            
            print("\n" + "="*80)
            print("📝 CALL TRANSCRIPT")
            print("="*80)
            print(transcript)
            print("="*80)
            
            print(f"\n🎙️ Recording URL: {recording_url}")
            print(f"🎙️ Stereo Recording URL: {stereo_recording_url}")
            print("="*80 + "\n")
            
            # Save transcript to backend/history/call.txt file
            try:
                history_dir = os.path.join(settings.BASE_DIR, 'history')
                os.makedirs(history_dir, exist_ok=True)
                
                transcript_file_path = os.path.join(history_dir, 'call.txt')
                with open(transcript_file_path, 'w', encoding='utf-8') as f:
                    f.write(f"Call ID: {call_id}\n")
                    f.write(f"Phone Number: {phone_number}\n")
                    f.write(f"Status: {call_status}\n")
                    f.write(f"Ended Reason: {ended_reason}\n")
                    f.write(f"Duration: {duration_seconds} seconds\n")
                    f.write(f"Cost: ${cost}\n")
                    f.write(f"Started At: {started_at_str}\n")
                    f.write(f"Ended At: {ended_at_str}\n")
                    f.write(f"Recording URL: {recording_url}\n")
                    f.write(f"Stereo Recording URL: {stereo_recording_url}\n")
                    f.write("\n" + "="*80 + "\n")
                    f.write("SUMMARY\n")
                    f.write("="*80 + "\n")
                    f.write(summary + "\n")
                    f.write("\n" + "="*80 + "\n")
                    f.write("TRANSCRIPT\n")
                    f.write("="*80 + "\n")
                    f.write(transcript)
                    f.write("\n" + "="*80 + "\n")
                
                print(f"💾 Transcript saved to: {transcript_file_path}")
            except Exception as file_error:
                print(f"⚠️ Could not save transcript to file: {file_error}")
            
            # Save to database
            try:
                from datetime import datetime
                
                # Parse datetime strings
                started_at = None
                ended_at = None
                if started_at_str:
                    try:
                        started_at = datetime.fromisoformat(started_at_str.replace('Z', '+00:00'))
                    except:
                        pass
                if ended_at_str:
                    try:
                        ended_at = datetime.fromisoformat(ended_at_str.replace('Z', '+00:00'))
                    except:
                        pass
                
                # Create or update call history
                call_history, created = CallHistory.objects.update_or_create(
                    call_id=call_id,
                    defaults={
                        'phone_number': phone_number,
                        'status': 'ended',
                        'duration': int(duration_seconds),
                        'started_at': started_at or timezone.now(),
                        'ended_at': ended_at or timezone.now(),
                        'summary': summary,
                        'transcript': transcript,
                        'recording_url': recording_url or stereo_recording_url,
                    }
                )
                
                action = "Created" if created else "Updated"
                print(f"✅ {action} call history in database for call {call_id}")
                
            except Exception as db_error:
                print(f"⚠️ Could not save to database: {db_error}")
            
            # Update session if exists
            try:
                session = CallingSession.objects.filter(session_id=call_id).first()
                if session:
                    print(f"✅ Found session for call {call_id}")
            except Exception as e:
                print(f"⚠️ Could not find session: {e}")
            
            return Response({
                'success': True,
                'message': 'Transcript received and printed'
            }, status=200)
        
        else:
            # Handle other message types if needed
            print(f"ℹ️ Received message type: {message_type}")
            return Response({
                'success': True,
                'message': f'Received {message_type}'
            }, status=200)
    
    except Exception as e:
        print(f"❌ Error processing webhook: {str(e)}")
        print(f"📦 Raw payload: {request.data}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
    
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def connect_supabase(request):
    # Extract data from the request
    user_token = request.data.get('access_token')
    host = request.data.get('host')
    database = request.data.get('database')
    username = request.data.get('username')
    password = request.data.get('password')
    port = request.data.get('port')
    table_name = request.data.get('table_name')
    can_read = request.data.get('can_read') == 'true'

    try:
        # 1. VERIFY & ANALYZE: Connect to Supabase to fetch column metadata
        conn = psycopg2.connect(
            host=host,
            database=database,
            user=username,
            password=password,
            port=port,
            connect_timeout=5
        )
        
        # Get columns and a small sample for Gemini analysis
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
        columns = [desc[0] for desc in cursor.description]
        sample_rows = cursor.fetchall()
        df_sample = pd.DataFrame(sample_rows, columns=columns)
        sample_data_string = df_sample.to_string()
        cursor.close()
        conn.close()

        print(f"📡 Connected to Supabase table: {table_name}")

        # 2. GENERATE SEMANTIC SUMMARY: Structured Output using LangChain & Gemini
        try:
            _, structured_llm = get_llm()
            ai_response = structured_llm.invoke(
                f"Analyze this SQL table (Table: {table_name}). "
                f"Columns: {columns}. Sample Data: {sample_data_string}"
            )
            
            db_tool_name = ai_response.tool_name
            db_summary = ai_response.summary
            
        except Exception as e:
            print(f"⚠️ LangChain Structured Output failed: {e}")
            db_tool_name = f"query_{table_name.lower()}"
            db_summary = f"SQL Database containing: {', '.join(columns)}"

        print(f"🛠️ AI Tool Name: {db_tool_name}")
        print(f"📝 AI Summary: {db_summary}")

        # 3. DEPLOY: Trigger Supabase Edge Function Registration
        # We pass the user's token to deploy the logic directly to their project
        edge_function_url = deploy_supabase_edge_logic(request.data, user_token)
        print(f"🚀 Edge Function deployed at: {edge_function_url}")

        # 4. CREATE TOOLS: Register the tool in Vapi pointing to the Edge Function
        service = VAPIService()
        tool_ids = []

        if can_read:
            # We use the new Edge Function URL as the server endpoint for this tool
            tool = service.create_supabase_sql_tool(
                name=db_tool_name, 
                summary=db_summary, 
                columns=columns, 
                edge_function_url=edge_function_url
            )
            if tool and 'id' in tool:
                print(f"✅ Created Vapi SQL tool with ID: {tool['id']}")
                tool_ids.append(tool['id'])

        # 5. SAVE TO DJANGO DB: Store the connection metadata
        ConnectedDatabase.objects.create(
            name=db_tool_name,
            source_type="SUPABASE",
            summary=db_summary,
            columns=columns,
            vapi_tool_ids=tool_ids,
            # We store a "Live Connection" marker instead of raw data for SQL
            data=[{"status": "Live SQL Connection", "table": table_name, "endpoint": edge_function_url}],
        )

        return Response({
            'success': True,
            'tool_name': db_tool_name,
            'summary': db_summary,
            'tools_created': tool_ids,
            'edge_url': edge_function_url
        })

    except Exception as e:
        print(f"❌ Supabase Integration Error: {str(e)}")
        return Response({"error": str(e)}, status=500)
    

@api_view(['POST'])
def connect_google_sheets(request):
    data = request.data
    sheet_url = data.get('sheet_url')
    db_name = data.get('name', 'Google_Sheet_DB')
    can_read = data.get('can_read') == 'true'
    can_write = data.get('can_write') == 'true'

    # 1. Extract Spreadsheet ID
    match = re.search(r"/d/([a-zA-Z0-9-_]+)", sheet_url)
    if not match:
        return Response({"error": "Invalid Google Sheet URL format."}, status=400)
    
    spreadsheet_id = match.group(1)
    vapi_service = VAPIService()
    tool_ids = []
    columns = []
    df_data = []

    try:
        # Fetch initial data for LLM analysis
        df, columns = fetch_google_sheet_as_df(spreadsheet_id)
        sample_data = df.head(5).to_string()
        _, structured_llm = get_llm()

        # 2. READ LOGIC: Analysis for Information Retrieval
        if can_read:
            read_prompt = (
                f"Identify the KNOWLEDGE BASE purpose of this sheet: {db_name}\n"
                f"Columns: {columns}\nSample: {sample_data}\n"
                "Create a description explaining what information can be RETRIEVED from here."
            )
            read_analysis = structured_llm.invoke(read_prompt)
            read_desc = read_analysis.summary
            
            df_data = df.to_dict(orient='records')
            # The search tool name always keeps the 'search_' prefix for the backend router
            # Note: sanitization happens inside create_db_function_tool
            read_tool = vapi_service.create_db_function_tool(
                f"search_{db_name.lower().replace(' ', '_')}", 
                f"SEARCH TOOL: {read_desc}", 
                columns, 
                "read"
            )
            if 'id' in read_tool:
                tool_ids.append(read_tool['id'])

        # 3. WRITE LOGIC: Specialized Analysis for Data Entry
        if can_write:
            write_prompt = (
                f"This is a DATA ENTRY tool for the sheet: {db_name}\n"
                f"Columns: {columns}\nSample: {sample_data}\n"
                "Explain to the Voice AI exactly what it needs to ask the user to fill these columns. "
                "Include instructions on being brief and capturing specific details."
            )
            write_analysis = structured_llm.invoke(write_prompt)
            
            # Use the AI to generate a clean, action-oriented function name
            # Sanitize to meet Vapi requirements: /^[a-zA-Z0-9_-]{1,64}$/
            write_func_name = sanitize_function_name(f"log_{db_name.lower().replace(' ', '_')}")
            write_desc = f"APPEND TOOL: {write_analysis.summary}"

            write_payload = {
                "type": "function",
                "function": {
                    "name": write_func_name,
                    "description": write_desc,
                    "parameters": {
                        "type": "object",
                        "properties": {col: {"type": "string", "description": f"Caller's {col}"} for col in columns},
                        "required": columns[:2] # Heuristic: Name and Description/Issue usually first
                    }
                },
                "server": {
                    "url": f"{DEPLOYED_URL}/api/execute_sheet_write",
                }
            }
            write_tool = vapi_service.create_generic_tool(write_payload)
            if 'id' in write_tool:
                tool_ids.append(write_tool['id'])

        # 4. STORE: Save to Django
        ConnectedDatabase.objects.create(
            name=db_name,
            source_type="googlesheets",
            summary=f"Read: {read_desc if can_read else 'N/A'} | Write: {write_desc if can_write else 'N/A'}",
            columns=columns,
            vapi_tool_ids=tool_ids,
            data=df_data,
            connection_details={"spreadsheet_id": spreadsheet_id}
        )

        return Response({"success": True, "message": f"Successfully linked {db_name}", "tools": tool_ids})

    except Exception as e:
        print(f"❌ Google Sheets Sync Error: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def execute_sheet_write(request):
    print(f"📥 Received sheet write request: {json.dumps(request.data, indent=2)}")
    
    message = request.data.get('message', {})
    tool_calls = message.get('toolCalls', [])
    
    if not tool_calls:
        print("❌ No tool calls provided")
        return Response({"error": "No tool call provided"}, status=400)
    
    call = tool_calls[0]
    tool_call_id = call.get('id')
    vapi_tool_id = call.get('toolId')
    function_name = call.get('function', {}).get('name', '')
    args = call.get('function', {}).get('arguments', {})
    
    # Parse args if it's a string (common with Vapi)
    if isinstance(args, str):
        try:
            args = json.loads(args)
            print(f"✅ Parsed JSON args: {args}")
        except json.JSONDecodeError as e:
            print(f"⚠️ Failed to parse args as JSON: {e}")
            args = {}

    print(f"🔍 Looking up database - Function: {function_name}, Tool ID: {vapi_tool_id}")

    # 1. DEFENSIVE LOOKUP
    # First try by Vapi Tool ID (most reliable)
    db = ConnectedDatabase.objects.filter(vapi_tool_ids__contains=[vapi_tool_id]).first()
    
    if not db:
        # Try matching by function name (handle sanitized names)
        # Remove prefixes like log_, write_, search_
        clean_name = function_name.replace('log_', '').replace('write_', '').replace('search_', '')
        print(f"🔍 Trying name-based lookup (cleaned): {clean_name}")
        
        # Try exact match first
        db = ConnectedDatabase.objects.filter(name=clean_name).first()
        
        # Try case-insensitive contains match
        if not db:
            db = ConnectedDatabase.objects.filter(name__icontains=clean_name).first()
        
        # Try matching against sanitized versions of all database names
        if not db:
            print(f"🔍 Trying fuzzy match against all databases...")
            all_dbs = ConnectedDatabase.objects.filter(source_type="googlesheets")
            for candidate_db in all_dbs:
                # Sanitize the candidate name and compare
                candidate_sanitized = sanitize_function_name(candidate_db.name.lower().replace(' ', '_'))
                function_sanitized = sanitize_function_name(clean_name)
                if candidate_sanitized == function_sanitized or candidate_sanitized in function_sanitized or function_sanitized in candidate_sanitized:
                    print(f"✅ Matched via fuzzy sanitization: {candidate_db.name}")
                    db = candidate_db
                    break

    if db is None:
        print(f"❌ Database not found for function: {function_name}")
        return Response({
            "results": [{"toolCallId": tool_call_id, "result": "Error: DB not found."}]
        }, status=200)

    print(f"✅ Found database: {db.name} (ID: {db.id})")
    details = db.connection_details or {}
    spreadsheet_id = details.get('spreadsheet_id')
    
    if not spreadsheet_id:
        print(f"❌ No spreadsheet_id found in connection_details: {details}")
        return Response({
            "results": [{"toolCallId": tool_call_id, "result": "Error: Spreadsheet ID not found."}]
        }, status=200)

    print(f"📊 Spreadsheet ID: {spreadsheet_id}")
    print(f"📋 Columns: {db.columns}")
    print(f"📝 Args received: {args}")

    try:
        # 2. PREPARE DATA
        # Create a dictionary for Django and a list for Google Sheets
        new_entry_dict = {col: str(args.get(col, "")) for col in db.columns}
        new_row_list = [new_entry_dict[col] for col in db.columns]
        
        print(f"📦 Prepared row data: {new_row_list}")

        # 3. GOOGLE SHEETS WRITE (External)
        json_path = settings.SERVICE_ACCOUNT_FILE 

        if not os.path.exists(json_path):
            # This might happen if the Env Var was missing during startup
            print("❌ Service account file missing! Checking for Env Var...")
            sa_content = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
            if sa_content:
                with open(json_path, 'w') as f:
                    f.write(sa_content)
            else:
                raise FileNotFoundError(f"Service account credentials not found in Env or File.")
        
        print(f"🔑 Using service account: {json_path}")
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_name(json_path, scope)
        client = gspread.authorize(creds)
        
        print(f"📄 Opening spreadsheet: {spreadsheet_id}")
        spreadsheet = client.open_by_key(spreadsheet_id)
        sheet = spreadsheet.sheet1
        
        print(f"✍️ Appending row to sheet: {sheet.title}")
        sheet.append_row(new_row_list)
        print(f"✅ Successfully appended row to Google Sheet")

        # 4. DJANGO DATABASE UPDATE (Internal Sync)
        # We append the new dictionary to the existing 'data' list
        current_data = list(db.data) if db.data else [] # Cast to list to be safe
        current_data.append(new_entry_dict)
        db.data = current_data
        db.save() # This commits the new row to your Django DB

        print(f"✅ Synced: Appended to GSheet and Django for {db.name}")

        return Response({
            "results": [{
                "toolCallId": tool_call_id, 
                "result": "I have successfully recorded your entry and updated the system."
            }]
        }, status=200)

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Sync Error: {str(e)}")
        print(f"❌ Traceback: {error_trace}")
        return Response({
            "results": [{"toolCallId": tool_call_id, "result": f"Sync Error: {str(e)}"}]
        }, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_human_expert(request):
    """
    Creates a VAPI transferCall tool for human expert escalation.
    Takes phone_number and expert_field as inputs.
    Saves to database and returns the created tool ID.
    """
    print("\n" + "="*50)
    print("👤 CREATE HUMAN EXPERT REQUEST RECEIVED")
    print("="*50)
    print(f"📦 Request Data: {request.data}")
    print("="*50 + "\n")
    
    phone_number = request.data.get('phone_number')
    expert_field = request.data.get('expert_field')
    
    if not phone_number:
        return Response({
            'success': False, 
            'error': 'phone_number is required'
        }, status=400)
    
    if not expert_field:
        return Response({
            'success': False, 
            'error': 'expert_field is required'
        }, status=400)
    
    # Ensure phone number has proper format
    if not phone_number.startswith('+'):
        phone_number = f"+{phone_number}"
    
    try:
        service = VAPIService()
        tool_response = service.create_transfer_call_tool(phone_number, expert_field)
        
        if 'error' in tool_response:
            return Response({
                'success': False,
                'error': tool_response['error']
            }, status=500)
        
        tool_id = tool_response.get('id')
        print(f"✅ Human Expert Tool Created: {tool_id}")
        
        # Save to database
        human_expert = HumanExpert.objects.create(
            phone_number=phone_number,
            expert_field=expert_field,
            vapi_tool_id=tool_id,
            is_active=True
        )
        print(f"💾 Human Expert saved to database with ID: {human_expert.id}")
        
        return Response({
            'success': True,
            'id': human_expert.id,
            'tool_id': tool_id,
            'phone_number': phone_number,
            'expert_field': expert_field,
            'message': 'Human expert transfer tool created and saved successfully'
        }, status=200)
        
    except Exception as e:
        print(f"❌ Error creating human expert tool: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_human_experts(request):
    """
    Retrieves all human experts from the database.
    Used by the frontend to display configured human experts.
    """
    try:
        experts = HumanExpert.objects.filter(is_active=True)
        
        payload = [{
            'id': expert.id,
            'phone_number': expert.phone_number,
            'expert_field': expert.expert_field,
            'tool_id': expert.vapi_tool_id,
            'created_at': expert.created_at.isoformat()
        } for expert in experts]
        
        print(f"📡 Fetched {len(payload)} human experts.")
        return Response(payload, status=200)
    
    except Exception as e:
        print(f"❌ Error fetching human experts: {str(e)}")
        return Response({'error': 'Failed to retrieve human experts'}, status=500)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_human_expert(request, expert_id):
    """
    Deletes a human expert from the database.
    The VAPI tool remains but will no longer be included in calls.
    """
    print(f"\n🗑️ DELETE HUMAN EXPERT REQUEST: ID={expert_id}")
    
    try:
        expert = HumanExpert.objects.get(id=expert_id)
        expert_info = f"{expert.expert_field} - {expert.phone_number}"
        
        # Option 1: Soft delete (mark as inactive)
        # expert.is_active = False
        # expert.save()
        
        # Option 2: Hard delete
        expert.delete()
        
        print(f"✅ Human Expert deleted: {expert_info}")
        
        return Response({
            'success': True,
            'message': f'Human expert "{expert_info}" deleted successfully'
        }, status=200)
        
    except HumanExpert.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Human expert not found'
        }, status=404)
        
    except Exception as e:
        print(f"❌ Error deleting human expert: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_agent_configuration(request):
    """
    Retrieves the agent configuration (name and description).
    Used by the frontend to display and allow editing of agent settings.
    """
    try:
        config = AgentConfiguration.get_config()
        
        print(f"📡 Fetched agent configuration: {config.name}")
        return Response({
            'success': True,
            'name': config.name,
            'description': config.description,
            'updated_at': config.updated_at.isoformat() if config.updated_at else None
        }, status=200)
    
    except Exception as e:
        print(f"❌ Error fetching agent configuration: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to retrieve agent configuration'
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_tools(request):
    """
    Returns all available tools (base tools + database tools + human expert tools).
    Also returns their current enabled/disabled status from AgentConfiguration.
    """
    from .vapi_service import TOOL_ID
    
    try:
        config = AgentConfiguration.get_config()
        tool_settings = config.tool_settings or {}
        
        # Build available tools list
        available_tools = []
        
        # 1. Add base TOOL_IDs with their names
        base_tool_names = {
            TOOL_ID[0]: {"name": "Knowledge Query Tool", "description": "Query the knowledge base for information"},
            TOOL_ID[1]: {"name": "End Call Tool", "description": "End the current call gracefully"}
        }
        
        for tool_id in TOOL_ID:
            tool_info = base_tool_names.get(tool_id, {"name": f"Base Tool {tool_id[:8]}", "description": "Base system tool"})
            enabled = tool_settings.get(tool_id, {}).get('enabled', True)  # Default enabled
            available_tools.append({
                'id': tool_id,
                'name': tool_info['name'],
                'description': tool_info['description'],
                'type': 'base',
                'enabled': enabled
            })
        
        # 2. Add database tools
        db_records = ConnectedDatabase.objects.all()
        for db in db_records:
            for tool_id in db.vapi_tool_ids:
                enabled = tool_settings.get(tool_id, {}).get('enabled', True)
                available_tools.append({
                    'id': tool_id,
                    'name': db.name,
                    'description': db.summary[:100] + '...' if len(db.summary) > 100 else db.summary,
                    'type': 'database',
                    'enabled': enabled
                })
        
        # 3. Add human expert transfer tools
        human_experts = HumanExpert.objects.filter(is_active=True)
        for expert in human_experts:
            enabled = tool_settings.get(expert.vapi_tool_id, {}).get('enabled', True)
            available_tools.append({
                'id': expert.vapi_tool_id,
                'name': f"Transfer to {expert.expert_field}",
                'description': f"Transfer call to human expert ({expert.phone_number})",
                'type': 'transfer',
                'enabled': enabled
            })
        
        print(f"📡 Fetched {len(available_tools)} available tools")
        return Response({
            'success': True,
            'tools': available_tools
        }, status=200)
    
    except Exception as e:
        print(f"❌ Error fetching available tools: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_agent_configuration(request):
    """
    Updates the agent configuration (name, description, and/or tool_settings).
    Used by the frontend to save changes to agent settings.
    """
    print(f"\n📝 UPDATE AGENT CONFIGURATION REQUEST")
    print(f"📦 Request Data: {request.data}")
    
    try:
        name = request.data.get('name')
        description = request.data.get('description')
        tool_settings = request.data.get('tool_settings')
        
        if not name and not description and tool_settings is None:
            return Response({
                'success': False,
                'error': 'At least one of name, description, or tool_settings is required'
            }, status=400)
        
        config = AgentConfiguration.get_config()
        
        if name:
            config.name = name.strip()
        if description:
            config.description = description.strip()
        if tool_settings is not None:
            # Merge with existing settings
            existing_settings = config.tool_settings or {}
            existing_settings.update(tool_settings)
            config.tool_settings = existing_settings
        
        config.save()
        
        print(f"✅ Agent configuration updated: {config.name}")
        
        return Response({
            'success': True,
            'name': config.name,
            'description': config.description,
            'tool_settings': config.tool_settings,
            'updated_at': config.updated_at.isoformat(),
            'message': 'Agent configuration updated successfully'
        }, status=200)
        
    except Exception as e:
        print(f"❌ Error updating agent configuration: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_tool_status(request):
    """
    Updates the enabled/disabled status of a specific tool.
    """
    print(f"\n🔧 UPDATE TOOL STATUS REQUEST")
    print(f"📦 Request Data: {request.data}")
    
    try:
        tool_id = request.data.get('tool_id')
        enabled = request.data.get('enabled')
        
        if not tool_id or enabled is None:
            return Response({
                'success': False,
                'error': 'tool_id and enabled are required'
            }, status=400)
        
        config = AgentConfiguration.get_config()
        tool_settings = config.tool_settings or {}
        
        # Update the specific tool's enabled status
        if tool_id not in tool_settings:
            tool_settings[tool_id] = {}
        tool_settings[tool_id]['enabled'] = enabled
        
        config.tool_settings = tool_settings
        config.save()
        
        print(f"✅ Tool {tool_id} status updated to: {enabled}")
        
        return Response({
            'success': True,
            'tool_id': tool_id,
            'enabled': enabled,
            'message': f'Tool status updated successfully'
        }, status=200)
        
    except Exception as e:
        print(f"❌ Error updating tool status: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)