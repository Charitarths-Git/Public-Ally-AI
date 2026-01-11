import cv2
import os
import numpy as np
import time
from deepface import DeepFace
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime

# ===============================
# CONFIG & ENV
# ===============================
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "whatsapp"

if not SUPABASE_URL or not SUPABASE_KEY or not BUCKET_NAME:
    print("⚠️  WARNING: Supabase env variables missing. ID Card fetch will fail.")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except:
    supabase = None

# ===============================
# HAAR CASCADES SETUP
# ===============================
# Standard paths in cv2.data.haarcascades
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
PROFILE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
EYE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

class EKYCVerifier:
    def __init__(self, model_name="ArcFace"):
        self.model_name = model_name
        os.makedirs("images", exist_ok=True)

    # --------------------------------------------------
    # HELPER: Check Liveness State
    # --------------------------------------------------
    def detect_face_orientation(self, gray_frame):
        """
        Determines if face is Frontal, Left Profile, or Right Profile.
        Returns: 'check_left', 'check_right', 'frontal', or None
        """
        # 1. Try Frontal
        faces = FACE_CASCADE.detectMultiScale(gray_frame, 1.3, 5)
        if len(faces) > 0:
            return "frontal", faces[0]

        # 2. Try Profile (Default detects Left profile in image, which is user looking Right)
        # Note: Profile cascade detects one side. To detect the other, we flip the image.
        
        # Check Normal (Detects User Looking RIGHT usually -> "Left Profile" of face)
        profiles = PROFILE_CASCADE.detectMultiScale(gray_frame, 1.3, 5)
        if len(profiles) > 0:
             return "looking_right", profiles[0]

        # Check Flipped (Detects User Looking LEFT usually)
        flipped_gray = cv2.flip(gray_frame, 1)
        profiles_flipped = PROFILE_CASCADE.detectMultiScale(flipped_gray, 1.3, 5)
        if len(profiles_flipped) > 0:
            return "looking_left", profiles_flipped[0]

        return None, None

    # --------------------------------------------------
    # STEP 2a: RECORD VIDEO
    # --------------------------------------------------
    def record_video(self, output_path="images/liveness_record.avi", duration=15):
        cap = cv2.VideoCapture(0)
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        fps = 30.0
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        out = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
        
        start_time = time.time()
        print(f"🎥 Recording for {duration} seconds...")

        while (time.time() - start_time) < duration:
            ret, frame = cap.read()
            if not ret: break

            # Mirror for UX
            frame_display = cv2.flip(frame, 1)
            
            # Instructions overlay
            remaining = int(duration - (time.time() - start_time))
            msg = f"Look Center -> Left -> Right ({remaining}s)"
            cv2.putText(frame_display, msg, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.imshow("Recording Liveness... Move Head!", frame_display)
            
            out.write(frame) # Write original (unflipped) or flipped? Let's write original to keep raw data standard.
            
            if cv2.waitKey(1) & 0xFF == 27:
                break
        
        cap.release()
        out.release()
        cv2.destroyAllWindows()
        print("✅ Recording Saved.")
        return output_path

    # --------------------------------------------------
    # STEP 2b: PROCESS VIDEO FOR LIVENESS
    # --------------------------------------------------
    def liveness_check(self, video_path):
        cap = cv2.VideoCapture(video_path)
        
        # State Machine
        # 0: Calibration/Center
        # 1: Look Left
        # 2: Look Right
        # 3: Verify Eyes/Blink (Optional, maybe skip for now if motion adds noise)
        # 4: Success
        state = 0 
        best_frame = None
        
        frame_count = 0
        
        print("⚙️ Processing Liveness Video...")
        
        while True:
            ret, frame = cap.read()
            if not ret: break
            frame_count += 1
            
            # Use original frame logic.
            # If user looked 'Left', in the raw frame they face Left.
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # 1. Frontal
            frontal_faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)
            is_frontal = len(frontal_faces) > 0
            
            if is_frontal and best_frame is None:
                best_frame = frame.copy() # Grab a frontal frame for ID verify
            
            # 2. Profiles
            # Normal Profile Cascade: Detects LEFT Profile (User looking RIGHT)
            profiles_looking_right = PROFILE_CASCADE.detectMultiScale(gray, 1.3, 5)
            
            # Flipped Profile Cascade: Detects RIGHT Profile (User looking LEFT)
            gray_flipped = cv2.flip(gray, 1)
            profiles_looking_left = PROFILE_CASCADE.detectMultiScale(gray_flipped, 1.3, 5)
            
            is_looking_right = len(profiles_looking_right) > 0
            is_looking_left = len(profiles_looking_left) > 0
            
            # --- STATE LOGIC (Sequential) ---
            # We just need to see these states happen *sometime* in the video in order.
            
            if state == 0: # Waiting for Center
                if is_frontal:
                    state = 1
                    print(f"  [Frame {frame_count}] Detected Center ✅")
            
            elif state == 1: # Waiting for Left Turn
                if is_looking_left:
                    state = 2
                    print(f"  [Frame {frame_count}] Detected Look Left ✅")
            
            elif state == 2: # Waiting for Right Turn
                if is_looking_right:
                    state = 3
                    print(f"  [Frame {frame_count}] Detected Look Right ✅")
                    
            elif state == 3: # Success
                break

        cap.release()
        
        if state == 3:
            print("✅ Liveness Checks Passed!")
            # Save the best frame for verification
            if best_frame is not None:
                cv2.imwrite("images/selfie.jpg", best_frame)
                return "images/selfie.jpg"
        
        print("❌ Liveness Failed. Did not detect all movements (Center -> Left -> Right).")
        return None

    # --------------------------------------------------
    # SUPABASE & EXTRACT
    # --------------------------------------------------
    def fetch_latest_id_card(self, save_path="images/id_card.jpg"):
        if not supabase:
            raise Exception("Supabase not initialized.")
        files = supabase.storage.from_(BUCKET_NAME).list()
        files.sort(key=lambda f: datetime.fromisoformat(f["created_at"].replace("Z", "")), reverse=True)
        if not files: raise Exception("No ID card found.")
        print(f"⬇️ Downloading latest ID: {files[0]['name']}")
        data = supabase.storage.from_(BUCKET_NAME).download(files[0]["name"])
        with open(save_path, "wb") as f: f.write(data)
        return save_path

    def extract_face_from_id(self, id_path, output_path="images/extracted_face.jpg"):
        print("🔍 Extracting face from ID...")
        faces = DeepFace.extract_faces(img_path=id_path, detector_backend="retinaface", enforce_detection=True)
        faces.sort(key=lambda f: f["facial_area"]["w"] * f["facial_area"]["h"], reverse=True)
        face_rgb = (faces[0]["face"] * 255).astype("uint8")
        face_bgr = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2BGR)
        cv2.imwrite(output_path, face_bgr)
        return output_path

    # --------------------------------------------------
    # MAIN VERIFY
    # --------------------------------------------------
    def verify_identity(self):
        try:
            print("1️⃣ Fetching ID...")
            try:
                id_path = self.fetch_latest_id_card()
            except Exception as e:
                print(f"Skipping ID fetch ({e}) - Using local test file")
                id_path = "images/id_card.jpg"
            
            extracted_face = self.extract_face_from_id(id_path)
            
            print("2️⃣ Starting Liveness Recording...")
            video_path = self.record_video()
            
            print("3️⃣ Verifying Liveness from Video...")
            selfie_path = self.liveness_check(video_path)
            
            if not selfie_path: 
                return {"result": "Failed", "reason": "Liveness Check Failed"}

            print("4️⃣ Verifying Identity...")
            result = DeepFace.verify(
                img1_path=extracted_face,
                img2_path=selfie_path,
                model_name=self.model_name,
                detector_backend="retinaface",
                align=True
            )
            return result

            return result

        except Exception as e:
            return {"error": str(e)}

    def verify_identity_with_images(self, id_face_path, selfie_path):
        """
        Public method to verify two images directly.
        """
        try:
             return DeepFace.verify(
                img1_path=id_face_path,
                img2_path=selfie_path,
                model_name=self.model_name,
                detector_backend="retinaface",
                align=True
            )
        except Exception as e:
            return {"verified": False, "error": str(e)}


if __name__ == "__main__":
    verifier = EKYCVerifier()
    res = verifier.verify_identity()
    print("\n FINAL RESULTS:\n", res)
