import requests
import os
from dotenv import load_dotenv

load_dotenv()

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

    def start_call(self, phone_number):
        # We define the assistant inline for maximum flexibility
        payload = {
            "assistant": {
                "name": "Sahayaki",
                "firstMessage": "Namaste, I am Sahayaki. How can I help you?",
                "model": {
                    "provider": "google",
                    "model": "gemini-1.5-flash",
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are an autonomous reasoning system. Context: {self.llm_context}"
                        }
                    ],
                    "temperature": 0.35
                },
                "voice": {"provider": "vapi", "voiceId": "Neha"},
                "transcriber": {"provider": "deepgram", "model": "nova-3", "language": "multi"}
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