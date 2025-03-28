from ultralytics import YOLO
import cv2
import numpy as np

model = YOLO("yolov8n-face.pt")

async def detect_faces(image: UploadFile = File(...)):
    contents = await image.read()
    np_img = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    results = model(img)[0]
    faces = [{"x": int(b[0]), "y": int(b[1]), "w": int(b[2] - b[0]), "h": int(b[3] - b[1])}
             for b in results.boxes.xyxy.cpu().numpy()]
    return {"faces": faces}
