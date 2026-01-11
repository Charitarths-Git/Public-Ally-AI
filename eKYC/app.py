from flask import Flask, render_template, Response, jsonify, send_file
import cv2
import threading
import time
import os
from ekyc import EKYCVerifier
import pygame

app = Flask(__name__)

# ===============================
# AUDIO PLAYBACK
# ===============================
pygame.mixer.init()

def play_audio(file_path):
    """Play audio file in a separate thread"""
    def _play():
        try:
            pygame.mixer.music.load(file_path)
            pygame.mixer.music.play()
            print(f"🔊 Playing audio: {file_path}")
        except Exception as e:
            print(f"❌ Audio playback error: {e}")
    threading.Thread(target=_play, daemon=True).start()

# ===============================
# GLOBAL STATE
# ===============================
class AppState:
    def __init__(self):
        self.camera = None
        self.is_recording = False
        self.recording_start_time = 0
        self.recording_duration = 15
        self.video_writer = None
        self.video_path = "images/web_record.avi"
        self.latest_frame = None
        self.status = "idle" # idle, recording, processing, completed, failed
        self.result = {}
        self.lock = threading.Lock()
        self.last_instruction = ""

    def get_camera(self):
        if self.camera is None or not self.camera.isOpened():
            self.camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        return self.camera

    def release_camera(self):
        if self.camera:
            self.camera.release()
            self.camera = None

state = AppState()
verifier = EKYCVerifier()
os.makedirs("images", exist_ok=True)

# ===============================
# VIDEO STREAM
# ===============================
def generate_frames():
    global state
    while True:
        cam = state.get_camera()
        success, frame = cam.read()
        if not success:
            time.sleep(0.1)
            continue

        with state.lock:
            current_status = state.status

        # Mirror the frame for natural display (like a mirror)
        display_frame = cv2.flip(frame.copy(), 1)
        
        if current_status == "recording":
            elapsed = time.time() - state.recording_start_time
            if elapsed < state.recording_duration:
                if state.video_writer:
                    # Write ORIGINAL frame (not mirrored) for processing
                    state.video_writer.write(frame)
                ret, buffer = cv2.imencode('.jpg', display_frame)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            else:
                with state.lock:
                    state.is_recording = False
                    state.status = "processing"
                    if state.video_writer:
                        state.video_writer.release()
                        state.video_writer = None
                threading.Thread(target=process_verification).start()
        else:
            ret, buffer = cv2.imencode('.jpg', display_frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# ===============================
# PROCESS VERIFICATION
# ===============================
def process_verification():
    global state
    try:
        video_path = state.video_path
        selfie_path = verifier.liveness_check(video_path)
        if not selfie_path:
            with state.lock:
                state.status = "completed"
                state.result = {"verified": False, "reason": "Liveness Check Failed (did not detect all movements)"}
            return

        try:
            id_path = verifier.fetch_latest_id_card()
        except:
            id_path = "images/id_card.jpg"

        extracted_face = verifier.extract_face_from_id(id_path)
        result = verifier.verify_identity_with_images(extracted_face, selfie_path)

        with state.lock:
            state.status = "completed"
            state.result = result

    except Exception as e:
        with state.lock:
            state.status = "failed"
            state.result = {"error": str(e)}

# ===============================
# ROUTES
# ===============================
@app.route('/')
def index():
    # Play welcome audio when page loads
    welcome_audio = "welcome.mp3"  # Audio for page load
    if os.path.exists(welcome_audio):
        play_audio(welcome_audio)
    else:
        print(f"⚠️ Warning: Welcome audio file '{welcome_audio}' not found")
    
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/fetch_id')
def fetch_id():
    try:
        path = verifier.fetch_latest_id_card()
        print(f"✅ Fetched ID from Supabase: {path}")
    except Exception as e:
        print(f"⚠️ Supabase fetch failed: {e}. Using local fallback.")
        path = "images/id_card.jpg"
    
    if not os.path.exists(path):
        print(f"❌ ID card not found at: {path}")
        # Return a placeholder or error
        return jsonify({"error": "ID card not found"}), 404
    
    return send_file(path, mimetype='image/jpeg')

@app.route('/start_process')
def start_process():
    global state
    with state.lock:
        if state.status == "recording":
            return jsonify({"status": "already_started"})
        state.status = "recording"
        state.recording_start_time = time.time()
        state.is_recording = True
        state.last_instruction = ""

        cam = state.get_camera()
        w = int(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = 30.0
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        state.video_writer = cv2.VideoWriter(state.video_path, fourcc, fps, (w, h))

    # Play the audio instructions
    audio_path = "instructions.mp3"  # Make sure this file exists in your project root
    if os.path.exists(audio_path):
        play_audio(audio_path)
    else:
        print(f"⚠️ Warning: Audio file '{audio_path}' not found")

    return jsonify({"status": "started"})

@app.route('/get_result')
def get_result():
    global state
    with state.lock:
        data = {
            "status": state.status,
            "result": state.result,
            "recording_duration": state.recording_duration,
            "instruction": state.last_instruction
        }
        if state.status == "recording":
            elapsed = time.time() - state.recording_start_time
            data["time_left"] = int(max(0, state.recording_duration - elapsed))
    return jsonify(data)

# ===============================
# RUN
# ===============================
if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    finally:
        pygame.mixer.quit()