import cv2
import asyncio
import json
import base64
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .hand_tracker import HandTracker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

tracker = HandTracker()

@app.websocket("/ws/hand-tracking")
async def websocket_endpoint(websocket: WebSocket):
    print("New WS connection")
    await websocket.accept()
    
    try:
        while True:
            # Receive data from client (expecting base64 string)
            data_url = await websocket.receive_text()
            
            # Remove header if present (data:image/jpeg;base64,...)
            if "," in data_url:
                header, encoded = data_url.split(",", 1)
            else:
                encoded = data_url
                
            # Decode base64 to image
            nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is not None:
                # Process frame
                tracking_data = tracker.process_frame(frame)
                # Send results back
                await websocket.send_text(json.dumps(tracking_data))
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WS Error: {e}")
    finally:
        print("WS session ended")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
