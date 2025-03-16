document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        let email = document.getElementById("email").value.trim();
        let password = document.getElementById("password").value.trim();

        if (!email || !password) {
            showMessage(messages.emptyFields, "danger");
            return;
        }

        let xhr = new XMLHttpRequest();
        xhr.open("POST", "https://lionfish-app-kaw6i.ondigitalocean.app/login", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log("Response:", xhr.responseText); 
        
                if (xhr.status === 200) {
                    let response = xhr.responseText.trim();

        
                    if (response.toLowerCase().includes("user not found")) { 
                        showMessage(messages.invalidCredentials, "danger");
                    } else {
                        
                        let userData = JSON.parse(response);
                        console.log("User Data:", userData); // Check the entire userData object

                        localStorage.setItem("email", userData.email);
                        localStorage.setItem("role", userData.role);
                        localStorage.setItem("apiCounter", userData.apiCounter);

                        if (userData.role === "admin") {
                            
                            localStorage.setItem("usersData", JSON.stringify(userData.usersData));
                        }
        
                        let redirectPage = userData.role === "admin" ? "admin.html" : "index.html";
                        window.location.href = redirectPage;
                    }
                } else {
                    showMessage(messages.serverError, "danger");
                }
            }
        };
        

        let data = JSON.stringify({ email: email, password: password });
        xhr.send(data);
    });
});

function showMessage(message, type) {
    let messageBox = document.getElementById("message-box");
    messageBox.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}
