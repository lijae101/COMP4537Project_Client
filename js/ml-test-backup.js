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

const API_ENDPOINT = 'http://localhost:5000/process_frame';
let isProcessing = false;
let mediaStream = null;

// Webcam handling
async function startWebcam() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.srcObject = mediaStream;
        startProcessing();
    } catch (err) {
        console.error('Error accessing webcam:', err);
    }
}

function stopWebcam() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

// File upload handling
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
        processImage(url);
    } else if (file.type.startsWith('video/')) {
        processVideo(url);
    }
});

// Image processing
async function processImage(url) {
    const img = new Image();
    img.src = url;
    img.onload = async () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await detectFaces(canvas);
    };
}

// Video processing
function processVideo(url) {
    const video = document.getElementById('video');
    video.src = url;
    video.onloadeddata = () => startProcessing();
}

// Main detection function
async function detectFaces(canvas) {
    isProcessing = true;
    try {
        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        const base64Data = base64Image.split(',')[1];
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({image: base64Data})
        });
        
        lastDetection = await response.json();
    } finally {
        isProcessing = false;
    }
}

function drawBoxes(data) {
    // Clear previous boxes
    boxCtx.clearRect(0, 0, boxCanvas.width, boxCanvas.height);
    
    // Draw new boxes
    data.faces.forEach(face => {
        const [x1, y1, x2, y2] = face.box;
        boxCtx.beginPath();
        boxCtx.lineWidth = 2;
        boxCtx.strokeStyle = '#FF0000';
        boxCtx.rect(x1, y1, x2 - x1, y2 - y1);
        boxCtx.stroke();
    });
}

const video = document.getElementById('video');
const videoCanvas = document.getElementById('videoCanvas');
const videoCtx = videoCanvas.getContext('2d');
const boxCanvas = document.getElementById('boxCanvas');
const boxCtx = boxCanvas.getContext('2d');
let lastDetection = null;

function processFrame() {
    // Only draw video to videoCanvas
    videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
    
    // Process detection on videoCanvas
    if (!isProcessing) {
        detectFaces(videoCanvas);
    }
    
    // Draw boxes from last detection
    if (lastDetection) {
        drawBoxes(lastDetection);
    }
    
    requestAnimationFrame(processFrame);
}

// Continuous processing
function startProcessing() {
    processFrame();
}