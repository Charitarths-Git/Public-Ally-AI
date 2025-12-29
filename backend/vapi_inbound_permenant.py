import requests
import os
from dotenv import load_dotenv

load_dotenv()

def create_inbound_vapi_agent():
    VAPI_API_KEY = os.getenv("VAPI_API_KEY")
    VAPI_BASE_URL = "https://api.vapi.ai"
    PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")

    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }

    SYSTEM_PROMPT = """
    You are Sahayaki, an official FEMALE Government Awareness AI Assistant for India.
    Speak politely, neutrally, and always in the caller's language.
    Do not ask for sensitive personal information.
    """

    # -------------------------
    # 1. CREATE ASSISTANT
    # -------------------------
    assistant_payload = {
        "name": "Sahayaki",
        "firstMessage": "Namaste. I am Sahayaki, a government awareness assistant. How may I help you today?",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT}
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

    res = requests.post(
        f"{VAPI_BASE_URL}/assistant",
        headers=headers,
        json=assistant_payload,
        timeout=30
    )
    res.raise_for_status()
    assistant_id = res.json()["id"]

    # -------------------------
    # 2. ATTACH TO PHONE NUMBER
    # -------------------------
    phone_payload = {
        "assistantId": assistant_id
    }

    res = requests.patch(
        f"{VAPI_BASE_URL}/phone-number/{PHONE_NUMBER_ID}",
        headers=headers,
        json=phone_payload,
        timeout=30
    )
    res.raise_for_status()

    print("✅ Inbound AI Agent Ready")
    print("🤖 Assistant ID:", assistant_id)
    print("📞 Phone Number linked for inbound calls")

    return assistant_id


# RUN
create_inbound_vapi_agent()
