import requests
import os
from dotenv import load_dotenv

load_dotenv()


class VAPIService:
    """Service to interact with VAPI API"""
    
    def __init__(self):
        self.api_key = os.getenv('VAPI_API_KEY', 'ab5825a3-963d-4e84-8964-8ef3e5dc62e0')
        self.base_url = os.getenv('VAPI_BASE_URL', 'https://api.vapi.ai')
        self.phone_number_id = os.getenv('PHONE_NUMBER_ID', '3ea911a0-32da-43e5-a0e2-86fc880a676c')
        self.assistant_name = "Sahayaki"
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        self.system_prompt = """
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
    
    def get_or_create_assistant(self):
        """Get existing assistant or create new one"""
        try:
            # Get existing assistants
            response = requests.get(
                f"{self.base_url}/assistant",
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            
            # Check if assistant exists
            for assistant in response.json():
                if assistant.get("name") == self.assistant_name:
                    return assistant["id"]
            
            # Create new assistant
            return self.create_assistant()
            
        except Exception as e:
            print(f"Error getting/creating assistant: {str(e)}")
            return None
    
    def create_assistant(self):
        """Create a new assistant"""
        assistant_payload = {
            "name": self.assistant_name,
            "firstMessage": "Namaste. I am Sahayaki, a government awareness assistant. How may I help you today?",
            "model": {
                "provider": "openai",
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
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
            "endCallMessage": "Thank you for calling. Have a good day."
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/assistant",
                headers=self.headers,
                json=assistant_payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()["id"]
            
        except Exception as e:
            print(f"Error creating assistant: {str(e)}")
            return None
    
    def start_call(self, phone_number, assistant_id=None):
        """Start a call to the given phone number"""
        if not assistant_id:
            assistant_id = self.get_or_create_assistant()
        
        call_payload = {
            "assistantId": assistant_id,
            "phoneNumberId": self.phone_number_id,
            "customer": {
                "number": phone_number
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/call",
                headers=self.headers,
                json=call_payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            print(f"Error starting call: {str(e)}")
            return None
