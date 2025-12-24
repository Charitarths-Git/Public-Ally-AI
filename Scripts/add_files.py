import requests
import os
from dotenv import load_dotenv

load_dotenv()

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_BASE_URL = "https://api.vapi.ai/file"

headers = {
    "Authorization": f"Bearer {VAPI_API_KEY}"
}

file_paths = [
    r"C:\Users\dhana\Downloads\twilio_2FA_recovery_code.txt",
]

uploaded_file_ids = []

for path in file_paths:
    with open(path, "rb") as f:
        files = {"file": f}
        res = requests.post(VAPI_BASE_URL, headers=headers, files=files)
        res.raise_for_status()
        file_info = res.json()
        uploaded_file_ids.append(file_info["id"])
        print(f"Uploaded {path} → File ID:", file_info["id"])

print("All uploaded file IDs:", uploaded_file_ids)
