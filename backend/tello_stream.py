import cv2
import threading
import yolo_face

tracking_enabled = False

def toggle_face_tracking():
    global tracking_enabled
    tracking_enabled = not tracking_enabled
    return tracking_enabled

def run_stream():
    # cap = cv2.VideoCapture("udp://0.0.0.0:11111")
    
    # test with webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Failed to open Tello stream")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if tracking_enabled:
            frame = yolo_face.detect_faces(frame)

        cv2.imshow("Tello YOLOv8 Face Detection", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()
