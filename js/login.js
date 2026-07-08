const adminTab = document.getElementById("adminTab");
const principalTab = document.getElementById("principalTab");

let loginRole = "admin";
// Detect role from URL
const params = new URLSearchParams(window.location.search);
const role = params.get("role");

if (role === "principal") {

    loginRole = "principal";

    window.addEventListener("DOMContentLoaded", () => {

        principalTab.classList.add("active");
        adminTab.classList.remove("active");

        document.querySelector(".title").innerHTML =
            "Principal Login";

    });

}

adminTab.onclick = () => {

    loginRole = "admin";

    adminTab.classList.add("active");
    principalTab.classList.remove("active");

    document.querySelector(".title").innerHTML =
        "Super Admin Login";

}

principalTab.onclick = () => {

    loginRole = "principal";

    principalTab.classList.add("active");
    adminTab.classList.remove("active");

    document.querySelector(".title").innerHTML =
        "Principal Login";

}

const eye = document.getElementById("togglePassword");

const password = document.getElementById("password");

eye.onclick = () => {

    if(password.type==="password"){

        password.type="text";

        eye.classList.replace("fa-eye","fa-eye-slash");

    }else{

        password.type="password";

        eye.classList.replace("fa-eye-slash","fa-eye");

    }

}
// ================= LOGIN =================

document.getElementById("loginForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const username = document.getElementById("username").value.trim();

    const password = document.getElementById("password").value;

    const url = loginRole === "admin"
        ? "/api/auth/admin/login"
        : "/api/auth/principal/login";

    try{

        const response = await fetch(url,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                username,
                password
            })

        });

        const result = await response.json();

        if(result.success){

    localStorage.setItem("user", JSON.stringify(result));

    if(loginRole === "admin"){

        localStorage.setItem("role","admin");

        window.location.href = "schools.html";

    }else{

       localStorage.setItem("role", "principal");

localStorage.setItem("schoolId", result.school._id);
localStorage.setItem("schoolName", result.school.schoolName);

// Save complete school object
localStorage.setItem(
    "currentSchool",
    JSON.stringify(result.school)
);

window.location.href = "dashboard.html";

    }

     }else{

            alert(result.message);

        }

    }catch(err){

        alert("Server Error");

        console.error(err);

    }

});