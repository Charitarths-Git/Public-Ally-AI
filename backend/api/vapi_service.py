import requests
import os
import re
from dotenv import load_dotenv

load_dotenv()

TOOL_ID = ["8be56882-fe70-4871-b7ec-ec6176ecfc5c","ffce1d40-0d91-4eca-aec3-8520ad1bf46d"]

def sanitize_function_name(name):
    """
    Sanitizes a function name to match Vapi's requirements: /^[a-zA-Z0-9_-]{1,64}$/
    - Only alphanumeric characters, underscores, and hyphens
    - Must start with alphanumeric character
    - Maximum 64 characters
    """
    if not name:
        return "function_1"
    
    # Remove all characters that aren't alphanumeric, underscore, or hyphen
    sanitized = re.sub(r'[^a-zA-Z0-9_-]', '', str(name))
    
    # Ensure it starts with alphanumeric (remove leading underscores/hyphens)
    sanitized = re.sub(r'^[_-]+', '', sanitized)
    
    # If empty after sanitization, provide a default
    if not sanitized:
        sanitized = "function_1"
    
    # Limit to 64 characters
    sanitized = sanitized[:64]
    
    # Ensure it still starts with alphanumeric after truncation
    if sanitized and sanitized[0] in ['_', '-']:
        sanitized = 'f' + sanitized[1:]
    
    return sanitized

class VAPIService:
    def __init__(self):
        self.api_key = os.getenv('VAPI_API_KEY')
        self.base_url = os.getenv('VAPI_BASE_URL', 'https://api.vapi.ai')
        self.phone_number_id = os.getenv('PHONE_NUMBER_ID')
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        # Dynamic context replaces the long static prompt
        self.llm_context = {
            "environment": "live_voice_call",
            "audience": "Indian citizen",
            "interaction_type": "government awareness service",
            "constraints": {
                "no_sensitive_data": True,
                "no_political_opinions": True,
                "safety_priority": "high"
            }
        }

    def start_call(self, phone_number,db_tool_ids):
        # We define the assistant inline for maximum flexibility
        if db_tool_ids is None:
            db_tool_ids = []

        print(TOOL_ID + db_tool_ids)
        
        payload = {
            "assistant": {
                "name": "Sahayaki",
                "firstMessage": "Namaste, I am Sahayaki. How can I help you?",
                "maxDurationSeconds": 43200,
                "silenceTimeoutSeconds": 3600,
                "model": {
                    "provider": "openai",
                    "model": "gpt-4.1-nano",
                    "toolIds": list(set(TOOL_ID+db_tool_ids)),
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are an autonomous reasoning system. Context: {self.llm_context}. If anything isn't found or accessed by your tools then refer to the knowledge base provided and give relevant information. If user says thankyou then ask him for any other help if not then invoke the tool name end_call_tool to end the call"
                        }
                    ],
                    "temperature": 0.50,
                },
                "voice": {"provider": "vapi", "voiceId": "Neha"},
                "transcriber": {
                    "language": "English",
                    "model": "gemini-2.0-flash",
                    "provider": "google"
                },
                # Server configuration for webhook
                "server": {
                    "url": os.getenv('WEBHOOK_URL', 'https://phonematic-streamingly-jayda.ngrok-free.dev/api/vapi-webhook/')
                },
                # Only receive end-of-call-report (not live transcript events)
                "serverMessages": ["end-of-call-report"]
            },
            "phoneNumberId": self.phone_number_id,
            "customer": {"number": phone_number}
        }

        try:
            res = requests.post(f"{self.base_url}/call", headers=self.headers, json=payload, timeout=30)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            print(f"Call Error: {e}")
            return None
        
    def upload_file(self, file_obj):
        """
        Takes a file object from a Django request and uploads it to Vapi.
        """
        url = f"https://api.vapi.ai/file"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        try:
            # We pass the file object directly to requests
            files = {"file": (file_obj.name, file_obj.read(), file_obj.content_type)}
            res = requests.post(url, headers=headers, files=files, timeout=60)
            res.raise_for_status()
            return res.json() # Returns {'id': 'file-uuid-xxx', ...}
        except Exception as e:
            print(f"Vapi Upload Error: {e}")
            return None
        

    def update_query_tool(self, file_ids):
        url = f"{self.base_url}/tool/{TOOL_ID[0]}"
        
        payload = {
            "function": {
                "name": "query_tool",
                "description": "This tool is an authoritative knowledge retrieval system. Call this tool whenever the user asks for specific details, eligibility criteria, documentation requirements, or procedural steps of any kind. Use this to ensure accuracy before providing factual information.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            "messages": [
                {
                "type": "request-start",
                "blocking": True
                },
                {
                "type": "request-response-delayed",
                "content": "Please hold on, getting back to you with the right information.",
                "timingMilliseconds": 1000
                }
            ],
            "knowledgeBases": [
            {
            "name": "new_knowledge_base",
            "provider": "google",
            "model": "gemini-2.0-flash",
            "description": "it should be used every time whenever the information needed to be retrieved is regarding or related to the government.",
            "fileIds": file_ids
            }
            ],
        }

        try:
            res = requests.patch(url, headers=self.headers, json=payload, timeout=30)
            
            if res.status_code != 200:
                print(f"❌ VAPI Error Detail: {res.text}")
                
            res.raise_for_status()
            return True
        except Exception as e:
            print(f"Error syncing Tool: {e}")
            return False
        

    def create_db_function_tool(self, name, summary, columns, permission_type):
            url = f"{self.base_url}/tool"
            
            # Sanitize the function name to meet Vapi requirements
            sanitized_name = sanitize_function_name(name)
            
            # This is what the AI reads to decide whether to use this database
            description = (
                f"Use this tool for {permission_type} operations. "
                f"Knowledge Base Summary: {summary}. "
                f"Available columns/fields: {', '.join(columns)}."
            )

            payload = {
                "type": "function",
                "function": {
                    "name": sanitized_name,
                    "description": description,
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "search_query": {"type": "string", "description": "The specific value or ID to look for"},
                            "target_column": {"type": "string", "description": "The column name to search within"}
                        },
                        "required": ["search_query"]
                    }
                },
                "server": {
                    "url": "https://phonematic-streamingly-jayda.ngrok-free.dev/api/execute-db-query/" 
                }
            }

            res = requests.post(url, headers=self.headers, json=payload)
            return res.json()
    
    def create_supabase_sql_tool(self, name, summary, columns, edge_function_url):
        """
        Creates a Vapi tool specifically for the Supabase Edge Function.
        """
        url = f"{self.base_url}/tool"
        
        # Sanitize the function name to meet Vapi requirements
        sanitized_name = sanitize_function_name(f"query_{name}")
        
        description = (
            f"Use this tool to query the {name} SQL database. "
            f"Summary: {summary}. "
            f"Columns: {', '.join(columns)}."
        )

        payload = {
            "type": "function",
            "function": {
                "name": sanitized_name,
                "description": description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "search_query": {"type": "string", "description": "The SQL search term or ILIKE pattern"},
                    },
                    "required": ["search_query"]
                }
            },
            "server": {
                "url": edge_function_url  # Points directly to Supabase Edge Function
            }
        }

        res = requests.post(url, headers=self.headers, json=payload)
        return res.json()

    def create_generic_tool(self, payload):
        """
        Creates any Vapi-native tool (Google Sheets, etc.) using a custom payload.
        """
        url = f"{self.base_url}/tool"
        
        # We send the payload as-is because we've already 
        # structured it correctly in the view.
        res = requests.post(url, headers=self.headers, json=payload)
        
        if res.status_code in [200, 201]:
            return res.json()
        else:
            print(f"❌ Vapi Generic Tool Error: {res.text}")
            return {"error": res.text}
    
    def get_existing_assistant_id(self, name):
        """
        Checks if an assistant with the given name already exists.
        Returns the assistant ID if found, None otherwise.
        """
        url = f"{self.base_url}/assistant"
        try:
            res = requests.get(url, headers=self.headers, timeout=30)
            res.raise_for_status()
            
            assistants = res.json()
            for assistant in assistants:
                if assistant.get("name") == name:
                    print(f"♻️ Found existing assistant '{name}' with ID: {assistant.get('id')}")
                    return assistant.get("id")
            
            print(f"➕ Assistant '{name}' not found")
            return None
        except Exception as e:
            print(f"❌ Error checking for existing assistant: {str(e)}")
            return None
    
    def create_permanent_assistant(self, db_tool_ids=None, file_ids=None):
        """
        Creates a permanent assistant for inbound calls.
        Based on the configuration from vapi.py
        """
        if db_tool_ids is None:
            db_tool_ids = []
        if file_ids is None:
            file_ids = []
        
        # System prompt from vapi.py
        SYSTEM_PROMPT = """
You are Sahayaki, an official FEMALE Government Awareness AI Assistant for India.

IDENTITY:
- Your name is Sahayaki.
- You are a female assistant.
- You speak politely, warmly, and respectfully like a government helpdesk officer.

ROLE:
You help citizens understand Indian government rules, regulations, public schemes,
citizen rights, and verified facts about India.

LANGUAGE:
- You are MULTI-LINGUAL.
- Always reply in the SAME LANGUAGE the citizen uses.
- Supported languages include Hindi, English, Tamil, Telugu, Marathi, Bengali,
  Kannada, Malayalam, Gujarati, Punjabi, and mixed languages like Hinglish.

BEHAVIOR:
- Calm, neutral, factual, and respectful
- No political opinions
- No legal advice
- Do NOT ask for sensitive personal information (Aadhaar, PAN, OTP, bank details)

TOPICS YOU CAN HELP WITH:
- Government schemes (PMAY, Ayushman Bharat, PM Kisan, pensions, scholarships)
- Indian laws & regulations (traffic rules, digital laws, tax basics)
- Citizen rights (RTI, voter ID, ration card, grievance systems)
- Education & exams (UPSC, SSC, state exams – procedure only)
- Banking & fraud awareness (RBI rules)
- Verified facts about India (constitution, states, governance)

CALL FLOW:
1. Greet politely
2. Introduce yourself as Sahayaki
3. Ask how you can help
4. Answer clearly and simply
5. Ask if further help is needed
6. End politely

SAFETY:
- Politely refuse illegal or harmful requests
- Maintain trust, clarity, and neutrality

Remember:
You are Sahayaki — a trusted female government awareness assistant for Indian citizens.
"""
        
        # Combine tool IDs
        all_tool_ids = list(set(TOOL_ID + db_tool_ids))
        
        # Build knowledge bases if file_ids are provided
        knowledge_bases = []
        if file_ids:
            knowledge_bases = [{
                "name": "new_knowledge_base",
                "provider": "google",
                "model": "gemini-2.0-flash",
                "description": "it should be used every time whenever the information needed to be retrieved is regarding or related to the government.",
                "fileIds": file_ids
            }]
        
        assistant_payload = {
            "name": "Sahayaki",
            "firstMessage": "Namaste. I am Sahayaki, a government awareness assistant. How may I help you today?",
            "maxDurationSeconds": 43200,
            "silenceTimeoutSeconds": 3600,
            "model": {
                "provider": "openai",
                "model": "gpt-4o-mini",
                "toolIds": all_tool_ids,
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    }
                ],
                "temperature": 0.4
            },
            "voice": {
                "provider": "vapi",
                "voiceId": "Neha"
            },
            "transcriber": {
                "provider": "deepgram",
                "model": "nova-3",
                "language": "multi"
            },
            "recordingEnabled": True,
            "endCallMessage": "Thank you for calling. Have a good day.",
            "phoneNumberId": self.phone_number_id,  # Link to phone number for inbound calls
            "server": {
                "url": os.getenv('WEBHOOK_URL', 'https://phonematic-streamingly-jayda.ngrok-free.dev/api/vapi-webhook/')
            },
            "serverMessages": ["end-of-call-report"]
        }
        
        # Add knowledge bases if available
        if knowledge_bases:
            assistant_payload["knowledgeBases"] = knowledge_bases
        
        url = f"{self.base_url}/assistant"
        
        try:
            print(f"➡️ Creating permanent assistant 'Sahayaki' for inbound calls...")
            print(f"📋 Tool IDs: {all_tool_ids}")
            print(f"📄 File IDs: {file_ids}")
            
            res = requests.post(url, headers=self.headers, json=assistant_payload, timeout=30)
            
            if res.status_code not in [200, 201]:
                print(f"❌ Vapi Assistant Creation Error: {res.text}")
                return {"error": res.text}
            
            assistant_data = res.json()
            assistant_id = assistant_data.get("id")
            print(f"✅ Permanent assistant created with ID: {assistant_id}")
            return assistant_data
            
        except Exception as e:
            print(f"❌ Error creating permanent assistant: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return {"error": str(e)}
    
    def delete_assistant(self, assistant_id):
        """
        Deletes an assistant by ID.
        """
        if not assistant_id:
            print("⚠️ No assistant_id provided for deletion")
            return False
        
        url = f"{self.base_url}/assistant/{assistant_id}"
        
        try:
            print(f"🗑️ Deleting assistant with ID: {assistant_id}")
            res = requests.delete(url, headers=self.headers, timeout=30)
            
            if res.status_code == 200:
                print(f"✅ Assistant {assistant_id} deleted successfully")
                return True
            else:
                print(f"❌ Error deleting assistant: {res.status_code} - {res.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception while deleting assistant: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return False