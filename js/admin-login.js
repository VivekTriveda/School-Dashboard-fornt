document.getElementById("loginBtn")
.addEventListener("click", login);

async function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch("/api/auth/admin-login", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            username,

            password

        })

    });

    const result = await response.json();

    if (result.success) {

        localStorage.setItem("adminLoggedIn", "true");

        localStorage.setItem("adminName", result.admin.username);

        window.location.href = "schools.html";

    } else {

        alert(result.message);

    }

}