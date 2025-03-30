const BASE_URL = "https://comp4537g2.loca.lt";
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

// toggle face tracking
function toggleTracking() {
    fetch(`${BASE_URL}/toggle_tracking`,{headers: { 'bypass-tunnel-reminder': 'true' }})
    .then(response => response.json())
    .then(data => {
        const button = document.getElementById('trackingButton');
        button.innerText = data.tracking ? 'Stop Tracking' : 'Track Face';
    })
    .catch(error => console.error('Error:', error));
}

function updateTelemetry() {
    fetch(`${BASE_URL}/telemetry`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('battery').textContent = data.battery;
        document.getElementById('height').textContent = data.height;
    })
    .catch(error => console.error('Error fetching telemetry:', error));
}

function updateFaces() {
    fetch(`${BASE_URL}/faces`)
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
        fetch(`${BASE_URL}/select_face`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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