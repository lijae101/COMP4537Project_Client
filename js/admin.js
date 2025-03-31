document.addEventListener("DOMContentLoaded", function () {
    let role = localStorage.getItem("role");
    if (role !== "admin") {
        window.location.href = "index.html";
    } else {
        let usersData = localStorage.getItem("usersData");
        if (usersData) {
            usersData = JSON.parse(usersData);
            let tableHTML = '';
            usersData.forEach(user => {
                tableHTML += `<tr>
                    <td>${user.email}</td>
                    <td>${user.apiCounter}</td>
                    <td><button onclick="deleteUser('${user.email}')" class="btn btn-danger">Delete</button></td>
                </tr>`;
            });

            const tableBody = document.getElementById("userTableBody");
            if (usersData.length === 0) {
                tableHTML = '<tr><td colspan="3" class="text-center">No users found</td></tr>';
            }

            tableBody.innerHTML = tableHTML;
        }
    }

    // Populate API usage table
    document.getElementById("putCounter").textContent = localStorage.getItem("putCounter") || 0;
    document.getElementById("deleteCounter").textContent = localStorage.getItem("deleteCounter") || 0;
    document.getElementById("postCounter").textContent = localStorage.getItem("postCounter") || 0;
    document.getElementById("getCounter").textContent = localStorage.getItem("getCounter") || 0;

    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("apiCounter");
        localStorage.removeItem("usersData");
        localStorage.removeItem("putCounter");
        localStorage.removeItem("deleteCounter");
        localStorage.removeItem("postCounter");
        localStorage.removeItem("getCounter");
        window.location.href = "login.html";
    });
});

function deleteUser(email) {
    let userID = localStorage.getItem("userID");
    if (confirm(`Are you sure you want to delete user with email: ${email}?`)) {
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open('DELETE', `https://lionfish-app-kaw6i.ondigitalocean.app/api/v1/deleteUser?userID=${userID}&email=${email}`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status === 200) {
                alert("User deleted successfully");
                let usersData = JSON.parse(localStorage.getItem("usersData"));
                usersData = usersData.filter(user => user.email !== email);
                localStorage.setItem("usersData", JSON.stringify(usersData));
                window.location.reload();
            } else {
                alert("Error deleting user: " + xhr.responseText);
            }
        };

        xhr.send();
    }
}
