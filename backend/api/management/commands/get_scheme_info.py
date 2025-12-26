# api/management/commands/register_vapi_tool.py

from django.core.management.base import BaseCommand
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class Command(BaseCommand):
    help = 'Registers the Sahayaki Government Scheme tool with Vapi AI'

    def handle(self, *args, **options):
        # 1. Load Config
        api_key = os.getenv("VAPI_API_KEY")
        base_url = "https://api.vapi.ai"
        
        # IMPORTANT: Replace this with your actual ngrok or server URL
        server_url = "https://bddncrssbjqudbbkccps.supabase.co/functions/v1/bright-action"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # 2. Tool Payload
        tool_payload = {
            "type": "function",
            "function": {
                "name": "get_government_scheme_info",
                "description": "Should be used whenever user asks any information related to the government schemes",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "scheme_name": {
                            "type": "string",
                            "description": "Name of the government scheme"
                        },
                        "language": {
                            "type": "string",
                            "description": "Preferred response language"
                        }
                    },
                    "required": ["scheme_name"]
                }
            },
            "server": {
                "url": server_url,
                "timeoutSeconds": 20,
                "headers": {
                    "Authorization": f"Bearer {os.getenv('SUPABASE_KEY')}",
                    "apikey": os.getenv("SUPABASE_KEY"),
                    "Content-Type": "application/json"
                }
            }
        }

        self.stdout.write(self.style.WARNING("🛠️ Registering Vapi Tool..."))

        try:
            res = requests.post(
                f"{base_url}/tool",
                headers=headers,
                json=tool_payload,
                timeout=30
            )
            res.raise_for_status()
            
            tool = res.json()
            self.stdout.write(self.style.SUCCESS(f"✅ Tool Created: {tool['id']}"))
            self.stdout.write(f"Name: {tool['function']['name']}")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Failed to register tool: {str(e)}"))