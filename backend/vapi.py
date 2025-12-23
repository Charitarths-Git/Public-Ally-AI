import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔥 Script started")

# =========================
# CONFIG
# =========================
VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_BASE_URL = os.getenv("VAPI_BASE_URL", "https://api.vapi.ai")

PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
CUSTOMER_PHONE = os.getenv("CUSTOMER_PHONE", "+918668944955")

ASSISTANT_NAME = "Sahayaki"   # 👈 FINAL NAME

headers = {
    "Authorization": f"Bearer {VAPI_API_KEY}",
    "Content-Type": "application/json"
}

# =========================
# SYSTEM PROMPT
# =========================
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

# =========================
# FIND EXISTING ASSISTANT
# =========================
def get_existing_assistant_id(name: str):
    print("🔍 Checking for existing assistant...")
    res = requests.get(
        f"{VAPI_BASE_URL}/assistant",
        headers=headers,
        timeout=30
    )
    res.raise_for_status()

    for assistant in res.json():
        if assistant.get("name") == name:
            print(f"♻️ Found existing assistant '{name}'")
            return assistant["id"]

    print("➕ Assistant not found, will create new one")
    return None

# =========================
# CREATE ASSISTANT
# =========================
def create_assistant():
    assistant_payload = {
        "name": ASSISTANT_NAME,
        "firstMessage": "Namaste. I am Sahayaki, a government awareness assistant. How may I help you today?",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
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
        "endCallMessage": "Thank you for calling. Have a good day."
    }

    print("➡️ Creating assistant 'Sahayaki'...")
    res = requests.post(
        f"{VAPI_BASE_URL}/assistant",
        headers=headers,
        json=assistant_payload,
        timeout=30
    )

    print("Status:", res.status_code)
    print("Response:", res.text)
    res.raise_for_status()

    assistant_id = res.json()["id"]
    print("✅ Assistant created:", assistant_id)
    return assistant_id

# =========================
# GET OR CREATE ASSISTANT
# =========================
assistant_id = get_existing_assistant_id(ASSISTANT_NAME)
if not assistant_id:
    assistant_id = create_assistant()

print("🤖 Using assistant ID:", assistant_id)

# =========================
# START CALL
# =========================
call_payload = {
    "assistantId": assistant_id,
    "phoneNumberId": PHONE_NUMBER_ID,
    "customer": {
        "number": CUSTOMER_PHONE
    }
}

print("📞 Starting call...")
call_res = requests.post(
    f"{VAPI_BASE_URL}/call",
    headers=headers,
    json=call_payload,
    timeout=30
)

print("Status:", call_res.status_code)
print("Response:", call_res.text)
call_res.raise_for_status()

call = call_res.json()
print("✅ Call started!")
print("Call ID:", call["id"])
print("Status:", call["status"])
