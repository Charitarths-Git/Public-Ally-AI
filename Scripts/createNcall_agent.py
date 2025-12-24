import requests
import os
from dotenv import load_dotenv

load_dotenv()

print("🔥 Fully Dynamic Gemini VAPI Agent Started")

# =========================
# CONFIG
# =========================
VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_BASE_URL = os.getenv("VAPI_BASE_URL", "https://api.vapi.ai")

PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
CUSTOMER_PHONE = os.getenv("CUSTOMER_PHONE")

ASSISTANT_NAME = "Sahayaki"

headers = {
    "Authorization": f"Bearer {VAPI_API_KEY}",
    "Content-Type": "application/json"
}

# =========================
# DYNAMIC CONTEXT (NOT PROMPT)
# =========================
# This is NOT telling Gemini what to say.
# This is only giving situation + constraints.

LLM_CONTEXT = {
    "environment": "live_voice_call",
    "audience": "Indian citizen",
    "organization": "Government awareness service",
    "interaction_type": "real-time phone conversation",

    "constraints": {
        "no_sensitive_data": True,
        "no_political_opinions": True,
        "no_legal_or_medical_advice": True,
        "tone": "trustworthy",
        "safety_priority": "high"
    },

    "capabilities": [
        "answer factual public questions",
        "explain official procedures",
        "provide awareness",
        "handle multilingual speech"
    ]
}

# =========================
# FIND ASSISTANT
# =========================
def get_existing_assistant_id(name):
    res = requests.get(f"{VAPI_BASE_URL}/assistant", headers=headers, timeout=30)
    res.raise_for_status()

    for assistant in res.json():
        if assistant.get("name") == name:
            return assistant["id"]
    return None

# =========================
# CREATE ASSISTANT (NO PROMPT)
# =========================
def create_assistant():
    assistant_payload = {
        "name": ASSISTANT_NAME,

        # Minimal neutral opening — Gemini decides everything next
        "firstMessage": "Hello.",

        "model": {
            "provider": "google",
            "model": "gemini-1.5-flash",

            # ⚠️ THIS IS THE KEY PART
            # We do NOT instruct Gemini what to say.
            # We only provide structured context.
            "messages": [
                {
                    "role": "system",
                    "content": f"""
You are an autonomous reasoning system.

Context:
{LLM_CONTEXT}

Task:
Observe the conversation and decide what to say next.
"""
                }
            ],
            "temperature": 0.35
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
        "endCallMessage": "Goodbye."
    }

    res = requests.post(
        f"{VAPI_BASE_URL}/assistant",
        headers=headers,
        json=assistant_payload,
        timeout=30
    )
    res.raise_for_status()
    return res.json()["id"]

# =========================
# GET OR CREATE ASSISTANT
# =========================
assistant_id = get_existing_assistant_id(ASSISTANT_NAME)
if not assistant_id:
    assistant_id = create_assistant()

print("🤖 Assistant ID:", assistant_id)

# =========================
# START CALL
# =========================
call_payload = {
    "assistantId": assistant_id,
    "phoneNumberId": PHONE_NUMBER_ID,
    "customer": {"number": CUSTOMER_PHONE}
}

call_res = requests.post(
    f"{VAPI_BASE_URL}/call",
    headers=headers,
    json=call_payload,
    timeout=30
)
call_res.raise_for_status()

call = call_res.json()
print("📞 Call started:", call["id"])
print("Status:", call["status"])
