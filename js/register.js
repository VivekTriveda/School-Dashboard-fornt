const adminTab = document.getElementById("adminTab");
const principalTab = document.getElementById("principalTab");
const schoolGroup = document.getElementById("schoolGroup");

adminTab.onclick = () => {

    adminTab.classList.add("active");
    principalTab.classList.remove("active");

    schoolGroup.style.display = "none";

}

principalTab.onclick = () => {

    principalTab.classList.add("active");
    adminTab.classList.remove("active");

    schoolGroup.style.display = "block";

}

function toggle(inputId, eyeId){

    const input=document.getElementById(inputId);
    const eye=document.getElementById(eyeId);

    if(input.type==="password"){

        input.type="text";

        eye.classList.replace("fa-eye","fa-eye-slash");

    }else{

        input.type="password";

        eye.classList.replace("fa-eye-slash","fa-eye");

    }

}

document.getElementById("togglePassword").onclick=()=>{

    toggle("password","togglePassword");

}

document.getElementById("toggleConfirm").onclick=()=>{

    toggle("confirmPassword","toggleConfirm");

}
// ================= REGISTER =================

document.getElementById("registerForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const data={

        fullName:document.getElementById("name").value.trim(),

        email:document.getElementById("email").value.trim(),

        mobile:document.getElementById("mobile").value.trim(),

        username:document.getElementById("username").value.trim(),

        password:document.getElementById("password").value,

        schoolId:document.getElementById("school") ?
        document.getElementById("school").value : ""

    };

    const url = adminTab.classList.contains("active")

        ? "/api/auth/admin/register"

        : "/api/auth/principal/register";

    try{

        const response=await fetch(url,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(data)

        });

        const result=await response.json();

        if(result.success){

            alert("Account Created Successfully");

            window.location.href="login.html";

        }else{

            alert(result.message);

        }

    }catch(err){

        alert("Server Error");

        console.error(err);

    }

});