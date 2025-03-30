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
                tableHTML += `<tr><td>${user.email}</td><td>${user.apiCounter}</td></tr> <td><button onclick="deleteUser('${user.email}')" class="btn btn-danger">Delete</button></td>`;
            });

            const tableBody = document.getElementById("userTableBody");
            if (usersData.length === 0) {
                tableHTML = '<tr><td colspan="2" class="text-center">No users found</td></tr>';
            }

            tableBody.innerHTML = tableHTML;
        }
    }

    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("apiCounter");
        localStorage.removeItem("usersData");
        window.location.href = "login.html";
    });
});

function deleteUser(email) {
    userID = localStorage.getItem("userID");
    if (confirm(`Are you sure you want to delete user with email: ${email}?`)) {
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // Include credentials in the request
        xhr.open('DELETE', `https://lionfish-app-kaw6i.ondigitalocean.app/api/v1/deleteUser?userID=${userID}`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

       
        xhr.onload = function() {
            
            if (xhr.status === 200) {
                alert("User deleted successfully");
                let usersData = JSON.parse(localStorage.getItem("usersData"));
                usersData = usersData.filter(user => user.email !== email); // Remove the deleted user from the array
                localStorage.removeItem("usersData"); // Clear the existing data
                localStorage.setItem("usersData", JSON.stringify(usersData)); // Store the updated array back to localStorage
                // let usersData = localStorage.getItem("usersData");
                window.location.reload(); // Refresh the page to see the updated user list
                // window.location.href = "index.html"; // Refresh the page to see the updated user list
            } else {
                alert("Error deleting user: " + xhr.responseText);
            }
        };

        xhr.send(JSON.stringify({ email: email })); // Send the email of the user to be deleted
    }
}