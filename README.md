# AR Globe - Hand Gesture Controlled 3D Globe

A futuristic web application that allows you to control a 3D Earth globe using real-time hand gestures. The globe "floats" above your palm, creating an immersive AR-like experience directly in your browser.

## 🚀 Features

- **Real-time Hand Tracking**: Powered by MediaPipe for precise 21-point hand landmark detection.
- **AR Experience**: The 3D globe follows your palm's position and orientation.
- **Two-Hand Interaction**:
    - **Primary Hand (Left)**: Controls the globe's position and scale (move your left palm to move the globe).
    - **Secondary Hand (Right)**: Controls rotation (move your right hand while making a **Fist** to spin the globe).
- **Gesture Control**:
    - **Open Palm (Left Hand)**: Globe is active and follows movement.
    - **Fist Gesture (Right Hand)**: Acts as a "grab" to manually rotate the globe.
- **Live Statistics**: Modern UI panel showing real-time coordinates, rotation, and gesture status.
- **Mirrored View**: Natural interaction that matches your movement on camera (Backend automatically swaps hand labels for better UX).

## 🛠️ Technologies

- **Backend**: Python 3.11+, FastAPI, OpenCV, MediaPipe, NumPy.
- **Frontend**: JavaScript, Three.js (WebGL), HTML5/CSS3.
- **Communication**: WebSockets for ultra-low latency data streaming.

## 📦 Project Structure

```text
ar-globe/
├── backend/            # Python FastAPI backend
│   ├── main.py         # Entry point & WebSocket server
│   └── hand_tracker.py # MediaPipe logic
├── frontend/           # Web interface
│   ├── index.html      # Main UI
│   └── js/             # Three.js & Socket logic
├── blueprint.md        # Original project design
└── README.md           # This file
```

## ⚙️ Installation & Setup

### 1. Prerequisite
- Python 3.11 or higher
- Webcam

### 2. Backend Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate environment:
   - **Windows**: `.\venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn opencv-python mediapipe numpy
   ```
4. Run the backend:
   ```bash
   python -m backend.main
   ```

### 3. Frontend Setup
1. Serve the `frontend` folder using any local server (e.g., Live Server in VS Code or Python's http.server):
   ```bash
   python -m http.server 8080
   ```
2. Open `http://localhost:8080` in your browser.

## 🖱️ Usage

1. Grant camera permission when prompted.
2. Wait for the "Connected" status.
3. Show your **Left Hand (Open Palm)** to the camera.
4. Move your hand to see the globe follow!
5. Bring in your **Right Hand** and make a **Fist** to swipe and spin the globe.

---
Developed by **Dimar Tarmizi**
