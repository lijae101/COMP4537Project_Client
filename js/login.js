document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        let email = document.getElementById("email").value.trim();
        let password = document.getElementById("password").value.trim();

        if (!email || !password) {
            showMessage(messages.emptyFields, "danger");
            return;
        }
        let userId = localStorage.getItem("userID") || 0;
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // Include credentials in the request
        console.log("User ID:", userId); // Check the userID being used for login
        xhr.open("POST", "https://lionfish-app-kaw6i.ondigitalocean.app/api/v1/login?userID=" + userId, true); // Adjust the URL as needed
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {

                if (xhr.status === 200) {
                    let response = xhr.responseText.trim();
                    response = JSON.parse(response);
                    console.log("Response:", response.error); // Check the entire response object
                    if (response.error) {
                        if(response.error.toLowerCase().includes("user not found"))
                        showMessage(messages.invalidCredentials, "danger");
                    } else {

                            const xhr2 = new XMLHttpRequest();
                            xhr2.withCredentials = true; // Include credentials in the request
                            xhr2.open("GET", "https://lionfish-app-kaw6i.ondigitalocean.app/api/v1/index?userID=" + userId, true); // Adjust the URL as needed
                            xhr2.setRequestHeader("Content-Type", "application/json");
                            xhr2.onreadystatechange = function () {
                                if (xhr2.readyState === 4) {
                                    if(xhr.responseText.includes("API limit reached")) {
                                        alert("API limit reached. Please try again later.");
                                    }
                                    // console.log("Response:", xhr2.responseText);
                                    if (xhr2.status === 200) {
                                        let response = xhr2.responseText.trim();
                                        response = JSON.parse(response);
                                        console.log("User Data:", response.error); // Check the entire userData object
                                        localStorage.setItem("email", response.email);
                                        localStorage.setItem("role", response.role);
                                        localStorage.setItem("apiCounter", response.apiCounter);
                                        localStorage.setItem("userID", response.userID); // Store userID in localStorage
                                        localStorage.setItem("usersData", JSON.stringify(response.usersData));
                                        localStorage.setItem("putCounter", response.putCounter);
                                        localStorage.setItem("deleteCounter", response.deleteCounter);
                                        localStorage.setItem("getCounter", response.getCounter);
                                        localStorage.setItem("postCounter", response.postCounter);
                                
                                        let redirectPage = response.role === "admin" ? "admin.html" : "index.html";
                                        window.location.href = redirectPage;
                                    }
                                }
                            };
                            xhr2.send();
                        }
                     

                    }
                } else {
                    console.error("Error:", xhr.status, xhr.statusText);
                    showMessage(messages.serverError, "danger");
                }
            
        };


        let data = JSON.stringify({ email: email, password: password });
        xhr.send(data);
    });

    document.getElementById("resetpass").addEventListener("click", function () {
       document.getElementById("resetPassword").style.display = "block";
        
    });
    document.getElementById("resetsubmit").addEventListener("click", function () {
        let email = document.getElementById("resetEmail").value.trim();
        console.log("Email:", email); // Log the email value for debugging
        if (!email) {
            showMessage(messages.emptyFields, "danger");
            return;
        }

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // Include credentials in the request
        xhr.open("PUT", "https://lionfish-app-kaw6i.ondigitalocean.app/api/v1/resetPassword?userID=" + localStorage.getItem("userID"), true); // Adjust the URL as needed
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log("Response:", xhr.responseText);
                if(xhr.responseText.includes("API limit reached")) {
                    alert("API limit reached. Please try again later.");
                }
                if (xhr.status === 200) {
                    console.log("Response:", xhr.responseText);
                    window.location.href = "login.html"; // Redirect to login page after successful reset
                    showMessage(messages.resetSuccess, "success");

                } else {
                    showMessage(messages.resetError, "danger");
                }
            }
        };

        let data = JSON.stringify({ email: email });
        xhr.send(data);
    });
});

function showMessage(message, type) {
    let messageBox = document.getElementById("message-box");
    messageBox.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}