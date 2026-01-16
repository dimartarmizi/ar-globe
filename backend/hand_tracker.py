import cv2
import mediapipe as mp
import numpy as np

class HandTracker:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils

    def process_frame(self, frame):
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        hands_data = []

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Use Wrist (0) and Middle MCP (9) for better anchoring
                wrist = hand_landmarks.landmark[0]
                middle_mcp = hand_landmarks.landmark[9]
                
                # Center of palm as average of Wrist and Middle MCP
                cx = (wrist.x + middle_mcp.x) / 2
                cy = (wrist.y + middle_mcp.y) / 2
                cz = (wrist.z + middle_mcp.z) / 2
                
                # Hand scale based on distance between Wrist and Middle MCP
                # This serves as a proxy for distance from camera
                hand_scale = np.sqrt((wrist.x - middle_mcp.x)**2 + (wrist.y - middle_mcp.y)**2)

                # Full landmarks list
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.append({"x": lm.x, "y": lm.y, "z": lm.z})

                # Gesture detection: Fist vs Open Palm
                tips = [8, 12, 16, 20] # Index, Middle, Ring, Pinky tips
                is_fist = True
                for tip_idx in tips:
                    tip = hand_landmarks.landmark[tip_idx]
                    dist = np.sqrt((tip.x - cx)**2 + (tip.y - cy)**2)
                    if dist > 0.15: # Threshold for open palm
                        is_fist = False
                        break
                
                # Rotation estimation (simplified for now)
                v1 = np.array([middle_mcp.x - wrist.x, middle_mcp.y - wrist.y])
                angle = np.arctan2(v1[1], v1[0])

                hands_data.append({
                    "x": cx,
                    "y": cy,
                    "z": cz,
                    "scale": float(hand_scale),
                    "landmarks": landmarks,
                    "gesture": "fist" if is_fist else "open",
                    "rotation_z": float(angle)
                })

        return {
            "hand_detected": len(hands_data) > 0,
            "hands": hands_data
        }
