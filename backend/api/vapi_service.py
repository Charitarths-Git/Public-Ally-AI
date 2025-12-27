import requests
import os
from dotenv import load_dotenv

load_dotenv()

TOOL_ID = ["8be56882-fe70-4871-b7ec-ec6176ecfc5c","ffce1d40-0d91-4eca-aec3-8520ad1bf46d"]

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
                    "toolIds": list(set(TOOL_ID)),
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
            
            # This is what the AI reads to decide whether to use this database
            description = (
                f"Use this tool for {permission_type} operations. "
                f"Knowledge Base Summary: {summary}. "
                f"Available columns/fields: {', '.join(columns)}."
            )

            payload = {
                "type": "function",
                "function": {
                    "name": f"{name}",
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
    

