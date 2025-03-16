document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    let isValid = true;
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    // Email validation
    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
        document.getElementById("emailError").classList.remove("d-none");
        isValid = false;
    } else {
        document.getElementById("emailError").classList.add("d-none");
    }

    // Password validation
    if (password.length < 3) {
        document.getElementById("passwordError").classList.remove("d-none");
        isValid = false;
    } else {
        document.getElementById("passwordError").classList.add("d-none");
    }

    // If valid, send data to backend
    if (isValid) {
        let userData = { email: email, password: password };

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://lionfish-app-kaw6i.ondigitalocean.app/signup', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Set up the callback function for the response
        xhr.onload = function() {
            if (xhr.status === 200) {
                let response = xhr.responseText;
                console.log("Server Response:", response);

                if (response === "User inserted") {
                    // Hide the signup form and show the success message
                    document.getElementById("signupForm").classList.add("d-none");
                    document.getElementById("redirect").classList.add("d-none");

                    // Inject success message
                    const successMessage = `
                        <div class="alert alert-success text-center" role="alert">
                            ${messages.signupSuccess}
                        </div>
                    `;
                    document.getElementById("successMessage").innerHTML = successMessage;
                } else {
                    alert("Signup failed: " + response); 
                }
            } else {
                console.error("Error:", xhr.status, xhr.statusText);
            }
        };

        // Send the request with the user data as a JSON string
        xhr.send(JSON.stringify(userData));
    }
});
