const BASE_URL = "https://9040-142-232-153-30.ngrok-free.app";
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


// Function to send commands to the server
function sendCommand(command) {
    fetch(`${BASE_URL}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command })
    })
    .then(response => console.log('Command sent:', command))
    .catch(error => console.error('Error:', error));
}

// Keyboard controls
document.addEventListener('keydown', function(event) {
    let command = '';
    switch (event.key) {
        case 'ArrowLeft': command = 'left'; break;
        case 'ArrowRight': command = 'right'; break;
        case 'ArrowUp': command = 'forward'; break;
        case 'ArrowDown': command = 'backward'; break;
        case 'w': command = 'up'; break;
        case 's': command = 'down'; break;
        case 'a': command = 'rotate_left'; break;
        case 'd': command = 'rotate_right'; break;
        case 'e': command = 'takeoff'; break;
        case 'q': command = 'land'; break;
    }
    if (command) {
        sendCommand(command);
        event.preventDefault(); // Prevent page scrolling with arrow keys
    }
});

// // toggle face tracking
// function toggleTracking() {
//     fetch(`${BASE_URL}/control`)
//     .then(response => response.json())
//     .then(data => {
//         const button = document.getElementById('trackingButton');
//         button.innerText = data.tracking ? 'Stop Tracking' : 'Track Face';
//     })
//     .catch(error => console.error('Error:', error));
// }


/////////////// TEST JUST FOR NOW WITH CAMERA LAPTOP /////////////////////
let trackingStream = null;
let trackingInterval = null;

function toggleTracking() {
    const button = document.getElementById('trackingButton');

    if (trackingStream) {
        stopTracking();
        button.innerText = "Track Face";
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            trackingStream = stream;
            button.innerText = "Stop Tracking";

            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            trackingInterval = setInterval(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 360;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(blob => {
                    const formData = new FormData();
                    formData.append('image', blob);

                    fetch(`${BASE_URL}/control`, {
                        method: 'POST',
                        body: formData
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log("Faces:", data.faces);
                            // Optionally: draw boxes or update UI here
                        })
                        .catch(err => console.error('Detection error:', err));
                }, 'image/jpeg');
            }, 1000);
        })
        .catch(err => console.error('Webcam access denied:', err));
}

function stopTracking() {
    if (trackingStream) {
        trackingStream.getTracks().forEach(t => t.stop());
        trackingStream = null;
    }
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
}
