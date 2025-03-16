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
                tableHTML += `<tr><td>${user.email}</td><td>${user.apiCounter}</td></tr>`;
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
