import json
import os
import urllib.request
import urllib.parse
from datetime import datetime

def lambda_handler(event, context):
    try:
        print("Received webhook event:", json.dumps(event))
        
        # 1. Handle Browser GET requests gracefully (This fixes the "Internal Server Error" when you click the link!)
        http_method = event.get('requestContext', {}).get('http', {}).get('method', '')
        if http_method == 'GET' or not event.get('body'):
            return {
                'statusCode': 200,
                'body': 'LokMitra Webhook Listener is Active! (Waiting for POST requests from Vapi)'
            }

        # Parse the body
        body_raw = event.get('body')
        if isinstance(body_raw, str):
            body = json.loads(body_raw)
        else:
            body = body_raw
            
        message = body.get('message', {})
        message_type = message.get('type')
        
        # We only care about end-of-call-report
        if message_type != 'end-of-call-report':
            return {
                'statusCode': 200,
                'body': json.dumps({'message': f'Ignored event type: {message_type}'})
            }
            
        # Extract Call Details
        call = message.get('call', {})
        call_id = call.get('id', 'Unknown')
        phone_number = call.get('customer', {}).get('number', 'Unknown')
        
        transcript = message.get('transcript', 'No transcript available')
        summary = message.get('summary', '')
        recording_url = message.get('recordingUrl', '')
        stereo_recording_url = message.get('stereoRecordingUrl', '')
        
        # Extract durations and times
        started_at_str = call.get('startedAt')
        ended_at_str = call.get('endedAt')
        duration_seconds = message.get('durationMinutes', 0) * 60

        started_at = None
        ended_at = None
        if started_at_str:
            try:
                started_at = started_at_str.replace('Z', '+00:00')
            except Exception:
                pass
        if ended_at_str:
            try:
                ended_at = ended_at_str.replace('Z', '+00:00')
            except Exception:
                pass
                
        # Connect to Supabase using REST API (Zero external dependencies needed!)
        SUPABASE_URL = os.environ['SUPABASE_URL']
        SUPABASE_KEY = os.environ['SUPABASE_KEY']
        
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates' # Handles the UPSERT logic
        }
        
        # 1. Update api_callhistory
        call_history_data = {
            'call_id': call_id, 
            'phone_number': phone_number,
            'status': 'ended',
            'duration': int(duration_seconds),
            'started_at': started_at or datetime.utcnow().isoformat(),
            'ended_at': ended_at or datetime.utcnow().isoformat(),
            'summary': summary,
            'transcript': transcript,
            'recording_url': recording_url or stereo_recording_url,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/api_callhistory",
            data=json.dumps(call_history_data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        urllib.request.urlopen(req)
        
        # 2. Update calling_queue status to 'completed'
        try:
            # Need to URL-encode the phone number properly for the query string since it contains a +
            encoded_phone = urllib.parse.quote(phone_number)
            queue_headers = headers.copy()
            # For PATCH requests, we definitely don't want to merge-duplicates
            if 'Prefer' in queue_headers:
                del queue_headers['Prefer']
                
            queue_data = {'status': 'completed'}
            
            queue_req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/calling_queue?phone=eq.{encoded_phone}&status=eq.calling",
                data=json.dumps(queue_data).encode('utf-8'),
                headers=queue_headers,
                method='PATCH'
            )
            urllib.request.urlopen(queue_req)
            print(f"✅ Queue updated: Marked {phone_number} as completed!")
        except Exception as q_err:
            print(f"⚠️ Could not update queue for {phone_number}: {q_err}")

        print(f"✅ Successfully saved Call {call_id} to Supabase via Lambda!")
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Call history saved successfully'})
        }

    except Exception as e:
        import traceback
        print("❌ Error processing webhook:", str(e))
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
