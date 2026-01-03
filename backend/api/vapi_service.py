import requests
import os
import re
from dotenv import load_dotenv
from google import genai
from google.api_core.exceptions import ResourceExhausted
import time

load_dotenv()

DEPLOYED_URL = os.getenv('DEPLOYED_URL')
print(f"🚀 DEPLOYED_URL: {DEPLOYED_URL}")
gemini_client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

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

    def call_gemini(self, prompt: str, model="gemini-2.5-flash", retries=3) -> str:
        for attempt in range(retries):
            try:
                print(f"🧠 Gemini call ({model}) attempt {attempt + 1}/{retries}")

                response = gemini_client.models.generate_content(
                    model=model,
                    contents=prompt
                )

                if response.text:
                    return response.text.strip()

                raise ValueError("Empty Gemini response")

            except ResourceExhausted:
                wait = 2 ** attempt
                print(f"⚠️ Gemini quota hit, retrying in {wait}s")
                time.sleep(wait)

            except Exception as e:
                print("❌ Gemini error:", e)
                break

        # IMPORTANT: deterministic failure
        return "{}"
    
    def extract_json(text: str) -> str:
        """
        Robustly extract JSON from LLM output.
        Handles:
        - ```json ... ```
        - ``` ... ```
        - Leading/trailing noise
        """
        if not text:
            return ""

        text = text.strip()

        # Remove fenced code blocks
        if text.startswith("```"):
            # Remove opening fence
            text = text.split("```", 1)[1]
            # Remove optional language tag (e.g., 'json')
            text = text.lstrip()
            if text.startswith("json"):
                text = text[4:]
            # Remove closing fence
            if "```" in text:
                text = text.split("```", 1)[0]

        return text.strip()



    def start_outbound_call(self, phone_number, db_tool_ids, file_ids=None, agent_name=None, agent_description=None, enabled_base_tool_ids=None):
        """
        Initiates an outbound call to a phone number.
        Uses agent_name and agent_description if provided.
        Uses enabled_base_tool_ids instead of default TOOL_ID if provided.
        """

        if db_tool_ids is None:
            db_tool_ids = []
        if file_ids is None:
            file_ids = []
        
        # Use provided name or default
        name = agent_name or "Sahayaki"
        description = agent_description or "A helpful AI voice assistant"
        
        # Use enabled base tools or default to all base tools
        base_tools = enabled_base_tool_ids if enabled_base_tool_ids is not None else TOOL_ID

        print(f"📞 Starting outbound call to {phone_number}")
        print(f"🤖 Agent Name: {name}")
        print(f"🔧 Base Tool IDs: {base_tools}")
        print(f"🔧 Additional Tool IDs: {db_tool_ids}")
        print(f"📄 File IDs: {file_ids}")
        
        payload = {
            "assistant": {
                "name": name,
                "firstMessage": f"Namaste, I am {name}. How can I help you?",
                "maxDurationSeconds": 43200,
                "silenceTimeoutSeconds": 3600,
                "model": {
                    "provider": "openai",
                    "model": "gpt-4.1-nano",
                    "toolIds": list(set(base_tools + db_tool_ids)),
                    "messages": [
                                {
                                    "role": "system",
                                    "content": f"""
                            You are {name}. {description}
                            You are an autonomous, tool-using reasoning system operating in a live voice call.
                            Context: {self.llm_context}

                            RULES:
                            - Speak clearly, politely, and concisely.
                            - Do NOT ask for sensitive personal information.
                            - Do NOT express political or legal opinions.
                            - Never mention tool names to the caller.

                            KNOWLEDGE & TOOLS:
                            - If required information is not already known with certainty, or must be accurate and verified,
                            retrieve it using the appropriate knowledge base or tool before responding.
                            - Always wait for the tool response before continuing.
                            - Use at most one tool per turn.
                            
                            TRANSFER TO HUMAN:
                            - If the user explicitly asks to speak to a human, expert, officer, or agent,
                            invoke `transfer_call_tool` immediately.
                            - Also invoke `transfer_call_tool` if the user is confused, frustrated, dissatisfied,
                            or if the issue requires human judgment or escalation.

                            ENDING THE CALL:
                            - If the user clearly indicates the conversation is finished
                            (e.g., “thank you”, “thanks”, “that’s all”, “no more help”, “bye”, “goodbye”):
                                - First, politely ask if any further help is needed.
                                - If the user confirms no further help, invoke `end_call_tool`.

                            CONTINUE WITHOUT TOOLS:
                            - For greetings, clarifications, confirmations, or follow-up questions.
                            - When explaining information already retrieved.

                            ERROR & SAFETY:
                            - If a tool fails or returns no useful result, briefly apologize and offer to retry or transfer to a human.
                            - Politely refuse illegal, unsafe, or harmful requests and offer a safe alternative or human transfer.

                            CALL FLOW:
                            Understand the request → decide (answer, tool, transfer) → respond clearly → ask if more help is needed → end politely when appropriate.
                            """
                                }
                            ],

                    "temperature": 0.50,
                },
                "voice": {"provider": "vapi", "voiceId": "Neha"},
                "transcriber": {
                    "model": "gemini-2.0-flash",
                    "provider": "google",
                    "language": "Multilingual"
                },
                # Server configuration for webhook
                "server": {
                    "url": f"{DEPLOYED_URL}/api/vapi-webhook/"
                },
                # Only receive end-of-call-report (not live transcript events)
                "serverMessages": ["end-of-call-report"]
            },
            "phoneNumberId": self.phone_number_id,
            "customer": {"number": phone_number}
        }

        try:
            res = requests.post(
                f"{self.base_url}/call",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            res.raise_for_status()
            call_response = res.json()
            print(f"✅ Outbound call initiated successfully: {call_response.get('id')}")
            return call_response

        except requests.exceptions.HTTPError as e:
            print(f"❌ Vapi API Error: {e.response.text}") # This is the golden ticket
            return None

    def start_inbound_agent(self, db_tool_ids=None, file_ids=None, agent_name=None, agent_description=None, enabled_base_tool_ids=None):
        """
        Creates and activates an inbound agent that handles incoming calls.
        Uses agent_name and agent_description if provided.
        Uses enabled_base_tool_ids instead of default TOOL_ID if provided.
        Returns the assistant ID if successful.
        """
        user_prompt = self.call_gemini("prompt need be edited for inbound agent")
        if db_tool_ids is None:
            db_tool_ids = []
        if file_ids is None:
            file_ids = []
        
        # Use provided name or default
        name = agent_name or "Sahayaki"
        description = agent_description or "A helpful AI voice assistant"
        
        # Use enabled base tools or default to all base tools
        base_tools = enabled_base_tool_ids if enabled_base_tool_ids is not None else TOOL_ID

        print(f"📞 Starting inbound agent")
        print(f"🤖 Agent Name: {name}")
        print(f"🔧 Base Tool IDs: {base_tools}")
        print(f"🔧 Additional Tool IDs: {db_tool_ids}")
        print(f"📄 File IDs: {file_ids}")

        try:
            # INBOUND ASSISTANT (PERSISTENT)
            inbound_assistant_payload = {
                "name": f"{name}-Inbound",
                "firstMessage": f"Namaste. I am {name}. How may I assist you today?",
                "model": {
                    "provider": "openai",
                    "model": "gpt-4.1-nano",
                    "toolIds": list(set(base_tools + db_tool_ids)),
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are {name}. {description} You are a polite government-style inbound assistant. Context: {self.llm_context}. Answer clearly and respectfully. Do not ask for sensitive personal information. If anything isn't found or accessed by your tools then refer to the knowledge base provided and give relevant information."
                        },
                        {
                            "role": "user",
                            "content": user_prompt
                        }
                    ],
                    "temperature": 0.4
                },
                "voice": {"provider": "vapi", "voiceId": "Neha"},
                "transcriber": {
                    "language": "multi",
                    "model": "nova-3",
                    "provider": "deepgram"
                },
                "recordingEnabled": True,
                "endCallMessage": "Thank you for calling. Have a good day.",
                # Server configuration for webhook
                "server": {
                    "url": f"{DEPLOYED_URL}/api/vapi-webhook/"
                },
                "serverMessages": ["end-of-call-report"]
            }

            # Add knowledge base if file_ids are provided
            if file_ids:
                inbound_assistant_payload["knowledgeBases"] = [{
                    "name": "government_knowledge_base",
                    "provider": "google",
                    "model": "gemini-2.0-flash",
                    "description": "Government schemes and information knowledge base",
                    "fileIds": file_ids
                }]

            inbound_res = requests.post(
                f"{self.base_url}/assistant",
                headers=self.headers,
                json=inbound_assistant_payload,
                timeout=30
            )
            inbound_res.raise_for_status()
            inbound_assistant_id = inbound_res.json()["id"]
            print(f"✅ Inbound assistant created with ID: {inbound_assistant_id}")

            # ATTACH INBOUND ASSISTANT TO PHONE NUMBER
            attach_payload = {
                "assistantId": inbound_assistant_id
            }

            attach_res = requests.patch(
                f"{self.base_url}/phone-number/{self.phone_number_id}",
                headers=self.headers,
                json=attach_payload,
                timeout=30
            )
            attach_res.raise_for_status()

            print(f"✅ Inbound agent attached to phone number successfully")
            return {"id": inbound_assistant_id, "assistant_id": inbound_assistant_id}

        except Exception as e:
            print(f"❌ Inbound Agent Error: {e}")
            import traceback
            print(traceback.format_exc())
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
                    "url": f"{DEPLOYED_URL}/api/execute-db-query/" 
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

    def create_transfer_call_tool(self, phone_number, expert_description):
        """
        Creates a VAPI transferCall tool for human expert escalation.
        This tool allows the AI to transfer calls to a human expert.
        """
        url = f"{self.base_url}/tool"
        
        payload = {
            "type": "transferCall",
            "function": {
                "name": "transfer_call_tool",
                "parameters": None,
                "description": "this tool transfer the call to human {expert_description} expert when the client ask for exact details of {expert_description} and if the case is sensative or there is any personal question"
            },
            "messages": [
                {
                    "type": "request-start",
                    "blocking": False
                }
            ],
            "destinations": [
                {
                    "type": "number",
                    "number": phone_number,
                    "message": "Okay, this is a crucial and sensitive topic to solve by me. I will transfer the call to our corresponding expert who will further help you related to this.",
                    "description": f"when the client speaks about give me more details about {expert_description} or uses specific terms related to {expert_description}, invoke this tool",
                    "transferPlan": {
                        "mode": "blind-transfer",
                        "sipVerb": "refer"
                    },
                    "numberE164CheckEnabled": True
                }
            ]
        }

        try:
            res = requests.post(url, headers=self.headers, json=payload, timeout=30)
            res.raise_for_status()
            tool_response = res.json()
            print(f"✅ TransferCall tool created successfully: {tool_response.get('id')}")
            return tool_response
        except Exception as e:
            print(f"❌ TransferCall Tool Error: {e}")
            return {"error": str(e)}
