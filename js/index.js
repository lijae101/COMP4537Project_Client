const DRONE_URL = "https://comp4537g2.loca.lt";

// Assuming the user is already authenticated and the server is sending the required data during login
document.addEventListener('DOMContentLoaded', function () {
    let userId = localStorage.getItem('userID'); // Assuming userID is stored in localStorage after login
    const xhr2 = new XMLHttpRequest();
    xhr2.withCredentials = true; // Include credentials in the request
    xhr2.open("GET", "https://lionfish-app-kaw6i.ondigitalocean.app/api/v1/index?userID=" + userId, true); // Adjust the URL as needed
    xhr2.setRequestHeader("Content-Type", "application/json");
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState === 4) {
            console.log("Response:", xhr2.responseText);
            if (xhr2.responseText.includes("API limit reached")) {
                alert("API limit reached. Please try again later.");
            }
            if (xhr2.status === 200) {
                let response = xhr2.responseText.trim();
                response = JSON.parse(response);
                if (response.message && response.message.toLowerCase().includes("session expired")) {
                    alert("Session expired. Please log in again.");
                    window.location.href = "login.html";
                    return;
                }
                localStorage.setItem("email", response.email);
                localStorage.setItem("role", response.role);
                localStorage.setItem("apiCounter", response.apiCounter);
                if (response.role === "admin") {
                    localStorage.setItem("usersData", JSON.stringify(response.usersData));
                    console.log("Users Data:", response.usersData); // Check the entire usersData object
                    localStorage.setItem("usersData", JSON.stringify(userData.usersData));
                    window.location.href = "admin.html";
                }

            }
        }
    };
    xhr2.send();
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
    fetch(`${DRONE_URL}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true'  },
        body: JSON.stringify({ command: command })
    })
    .then(response => console.log('Command sent:', command))
    .catch(error => console.error('Error:', error));
}

// Keyboard controls
document.addEventListener('keydown', function(event) {
    let command = '';
    switch (event.key) {
        case 'ArrowLeft': command = 'rotate_left'; break;
        case 'ArrowRight': command = 'rotate_right'; break;
        case 'ArrowUp': command = 'up'; break;
        case 'ArrowDown': command = 'down'; break;
        case 'w': command = 'forward'; break;
        case 's': command = 'backward'; break;
        case 'a': command = 'left'; break;
        case 'd': command = 'right'; break;
        case 'e': command = 'takeoff'; break;
        case 'q': command = 'land'; break;
    }
    if (command) {
        sendCommand(command);
        event.preventDefault(); // Prevent page scrolling with arrow keys
    }
});

let faceDetectionEnabled = false;
let faceTrackingEnabled = false;

function toggleFaceDetection() {
    fetch('https://lionfish-app-kaw6i.ondigitalocean.app/drone/toggle_face_detection',{headers: { 'bypass-tunnel-reminder': 'true' }})
    // fetch(`${DRONE_URL}/toggle_face_detection`,{headers: { 'bypass-tunnel-reminder': 'true' }})
        .then(response => response.json())
        .then(data => {
            faceDetectionEnabled = data.face_detection;
            trackingEnabled = data.tracking;
            const fdButton = document.getElementById('faceDetectionButton');
            fdButton.innerText = faceDetectionEnabled ? 'Disable Face Detection' : 'Enable Face Detection';
            const trackingButton = document.getElementById('trackingButton');
            trackingButton.innerText = trackingEnabled ? 'Stop Tracking' : 'Start Tracking';
            trackingButton.disabled = !faceDetectionEnabled;
        })
        .catch(error => console.error('Error:', error));
}

// toggle face tracking
function toggleTracking() {
    fetch(`https://lionfish-app-kaw6i.ondigitalocean.app/drone/toggle_face_tracking`,{headers: { 'bypass-tunnel-reminder': 'true' }})
    // fetch(`${DRONE_URL}/toggle_face_tracking`,{headers: { 'bypass-tunnel-reminder': 'true' }})
    .then(response => {
        if (!response.ok) {
            throw new Error('Face detection must be enabled');
        }
        return response.json();
    })
    .then(data => {
        trackingEnabled = data.tracking;
        const trackingButton = document.getElementById('trackingButton');
        trackingButton.innerText = trackingEnabled ? 'Stop Tracking' : 'Start Tracking';
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message);
    });
}

function updateTelemetry() {
    fetch(`${DRONE_URL}/telemetry`,{headers: { 'bypass-tunnel-reminder': 'true' }})
    .then(response => response.json())
    .then(data => {
        document.getElementById('battery').textContent = data.battery;
        document.getElementById('height').textContent = data.height;
    })
    .catch(error => console.error('Error fetching telemetry:', error));
}

function updateFaces() {
    fetch(`${DRONE_URL}/faces`,{headers: { 'bypass-tunnel-reminder': 'true' }})
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('faceSelect');
        select.innerHTML = '<option value="">Select Face to Track</option>';
        data.forEach(face => {
            const option = document.createElement('option');
            option.value = face.id;
            option.textContent = `Face ${face.id}`;
            select.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching faces:', error));
}

// Handle face selection
document.getElementById('faceSelect').addEventListener('change', function() {
    const faceId = this.value;
    if (faceId) {
        fetch(`${DRONE_URL}/select_face`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
            body: JSON.stringify({ face_id: parseInt(faceId) })
        }).catch(error => console.error('Error selecting face:', error));
    }
});

// Update telemetry and faces every 2 seconds
setInterval(() => {
    updateTelemetry();
    updateFaces();
}, 2000);

// Initial updates
updateTelemetry();
updateFaces();