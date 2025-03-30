// const API_URL = "https://facedetection.ddns.net/detect_faces";

const API_URL = "https://bc21-2605-8d80-8020-23bb-64d7-1476-8632-7412.ngrok-free.app/detect_faces"; // <== replace with your real ngrok URL


// Assuming the user is already authenticated and the server is sending the required data during login
document.addEventListener('DOMContentLoaded', function () {
    // Fetch user data (email and API call count) from the server
    let email = localStorage.getItem('email');  // Assuming email is stored in localStorage after login
    let apiCounter = localStorage.getItem('apiCounter'); // Similarly, the API counter value is stored

    if (email && apiCounter !== null) {
        // Populate the data on the page
        document.getElementById('userEmail').textContent = email;
        document.getElementById('apiCounter').textContent = apiCounter;
    } else {
        // Handle case where there's no user info (user might have logged out or session expired)
        alert('User information not found. Please log in again.');
        window.location.href = 'login.html'; // Redirect to login page if no user data found
    }

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function () {
        // Clear localStorage (remove user session info)
        localStorage.removeItem('email');
        localStorage.removeItem('apiCounter');
        localStorage.removeItem('role');

        // Redirect to the login page
        window.location.href = 'login.html';
    });
});

// ========== Variables ==========
const video = document.getElementById('video');
const videoOverlay = document.getElementById('videoOverlay');
const videoCtx = videoOverlay.getContext('2d');
let captureWidth, captureHeight;
const displayWidth = 640;
const displayHeight = 360;

video.addEventListener('loadedmetadata', () => {
    captureWidth = video.videoWidth;
    captureHeight = video.videoHeight;
});

const uploadedImage = document.getElementById('uploadedImage');
const uploadedOverlay = document.getElementById('uploadedOverlay');
const uploadedCtx = uploadedOverlay.getContext('2d');

let detectionIntervalId = null;
let videoStream = null;  // Store the video stream


// ========== Start Webcam Function ==========
function startWebcam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Webcam not supported.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            videoStream = stream;
        })
        .catch(err => console.error("Error accessing webcam: ", err));
}

// ========== Stop Webcam Function ==========
function stopWebcam() {
    if (videoStream) {
        let tracks = videoStream.getTracks();
        tracks.forEach(track => track.stop()); // Stop each track
        video.srcObject = null;
        videoStream = null;
    }
}

// ========== Real-Time Detection Controls ==========
document.getElementById('startButton').addEventListener('click', () => {
    startWebcam();  // Open the camera
    const interval = parseInt(document.getElementById('intervalInput').value, 10) || 1000;
    startRealTimeDetection(interval);
});

document.getElementById('stopButton').addEventListener('click', () => {
    stopRealTimeDetection();
    stopWebcam();  // Close the camera
});

// ========== Start Real-Time Detection ==========
function startRealTimeDetection(interval) {
    stopRealTimeDetection();  // Stop any existing intervals before starting

    detectionIntervalId = setInterval(() => {
        captureFrameAndDetect();
    }, interval);
}

// ========== Stop Real-Time Detection ==========
function stopRealTimeDetection() {
    if (detectionIntervalId) {
        clearInterval(detectionIntervalId);
        detectionIntervalId = null;
    }
    videoCtx.clearRect(0, 0, videoOverlay.width, videoOverlay.height);
}

// ========== Capture Frame from Webcam & Send to API ==========
function captureFrameAndDetect() {
    if (!videoStream) return;  // Don't process if camera is off

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = video.videoWidth || 640;
    offscreenCanvas.height = video.videoHeight || 360;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

    offscreenCanvas.toBlob(blob => {
        sendImageToEndpoint(blob, (data) => {
            drawBoxesOnVideo(data.faces, videoOverlay, videoCtx);
        });
    }, 'image/jpeg');
}

// ========== Upload & Detect Single Image ==========
document.getElementById('uploadButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        // Display the image
        uploadedImage.src = URL.createObjectURL(file);
        uploadedImage.onload = () => {
            // Resize overlay to match uploaded image
            uploadedOverlay.width = uploadedImage.width;
            uploadedOverlay.height = uploadedImage.height;
            uploadedOverlay.style.width = uploadedImage.width + 'px';
            uploadedOverlay.style.height = uploadedImage.height + 'px';
            uploadedImage.style.display = 'block';
        };

        // Send to endpoint
        sendImageToEndpoint(file, (data) => {
            // Draw boxes on the uploaded overlay
            drawBoxesOnCanvas(data.faces, uploadedOverlay, uploadedCtx);
        });
    }
});

// ========== Send Image to Face Detection Endpoint ==========
function sendImageToEndpoint(imageBlob, callback) {
    const formData = new FormData();
    formData.append('image', imageBlob);

    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // Display result in <pre>
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
            if (data.faces && data.faces.length > 0) {
                callback(data);
            } else {
                // No faces or empty data
                callback({ faces: [] });
            }
        })
        .catch(error => console.error('Error:', error));
}

// ========== Draw Boxes on Specified Canvas ==========
function drawBoxesOnCanvas(faces, canvas, context) {
    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    faces.forEach(face => {
        context.strokeRect(face.x, face.y, face.w, face.h);
    });
}
function drawBoxesOnVideo(faces, canvas, context) {
    // Clear overlay
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'red';
    context.lineWidth = 2;

    // Scale factor
    const scaleX = displayWidth / captureWidth;   // e.g. 400/1280
    const scaleY = displayHeight / captureHeight; // e.g. 300/720

    faces.forEach(face => {
        const xScaled = face.x * scaleX;
        const yScaled = face.y * scaleY;
        const wScaled = face.w * scaleX;
        const hScaled = face.h * scaleY;
        context.strokeRect(xScaled, yScaled, wScaled, hScaled);
    });
}