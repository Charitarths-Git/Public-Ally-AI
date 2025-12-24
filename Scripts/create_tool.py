import requests
import os
from dotenv import load_dotenv

load_dotenv()

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_BASE_URL = "https://api.vapi.ai"

headers = {
    "Authorization": f"Bearer {VAPI_API_KEY}",
    "Content-Type": "application/json"
}

# =========================
# TOOL PAYLOAD (CORRECT)
# =========================
tool_payload = {
    "type": "function",

    "function": {
        "name": "get_government_scheme_info",
        "description": "Returns official information about Indian government schemes",

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
        "url": "https://your-server.com/vapi/scheme-info",
        "timeoutSeconds": 20
    }
}

print("🛠️ Creating Vapi Tool...")

res = requests.post(
    f"{VAPI_BASE_URL}/tool",
    headers=headers,
    json=tool_payload,
    timeout=30
)

print("Status:", res.status_code)
print("Response:", res.text)
res.raise_for_status()

tool = res.json()
print("✅ Tool created successfully")
print("Tool ID:", tool["id"])
print("Tool Name:", tool["function"]["name"])
print("Tool Description:", tool["function"]["description"])
print("Tool Parameters:", tool["function"]["parameters"])