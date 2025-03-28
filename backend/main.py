# main.py
from fastapi import UploadFile, File
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import subprocess
import tello_control
import threading
import tello_stream

app = FastAPI()

# Allow all origins for local dev; restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve HTML & JS if needed (optional if frontend is served separately)
app.mount("/static", StaticFiles(directory="../js"), name="static")
templates = Jinja2Templates(directory="../")

# Command model
class Command(BaseModel):
    command: str

@app.get("/")
async def root():
    return {"message": "Tello YOLOv8 Backend Running"}

@app.post("/control")
async def control_drone(cmd: Command):
    tello_control.send_command(cmd.command)
    return {"status": "Command sent", "command": cmd.command}

@app.get("/start_drone")
async def start_drone_stream():
    thread = threading.Thread(target=tello_stream.run_stream)
    thread.start()
    return {"status": "Drone camera started"}

@app.get("/toggle_tracking")
async def toggle_tracking():
    tracking = tello_stream.toggle_face_tracking()
    return {"tracking": tracking}

from fastapi import UploadFile, File
from yolo_face import detect_faces

@app.post("/detect_faces")
async def detect_faces_api(image: UploadFile = File(...)):
    return await detect_faces(image)
