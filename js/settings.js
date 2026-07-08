const schoolId = localStorage.getItem("schoolId");

if (!schoolId) {

    alert("Please select a school first.");

    window.location.href = "schools.html";

}

// Load School Settings
async function loadSettings() {

    try {

        const response = await fetch("/api/settings/" + schoolId);

        const data = await response.json();

        if (!data.success) return;

        const s = data.school;

        document.getElementById("schoolName").value = s.schoolName || "";

        document.getElementById("principal").value = s.principal || "";

        document.getElementById("phone").value = s.phone || "";

        document.getElementById("email").value = s.email || "";

        document.getElementById("website").value = s.website || "";

        document.getElementById("city").value = s.city || "";

        document.getElementById("state").value = s.state || "";

        document.getElementById("address").value = s.address || "";

        if(document.getElementById("defaultBoard"))
            document.getElementById("defaultBoard").value = s.board || "CBSE";

    } catch (err) {

        console.log(err);

    }

}

// Save Settings
document.getElementById("saveSettingsBtn")
.addEventListener("click", saveSettings);

async function saveSettings() {

    const body = {

        schoolName: document.getElementById("schoolName").value,

        principal: document.getElementById("principal").value,

        phone: document.getElementById("phone").value,

        email: document.getElementById("email").value,

        website: document.getElementById("website").value,

        city: document.getElementById("city").value,

        state: document.getElementById("state").value,

        address: document.getElementById("address").value,

        board: document.getElementById("defaultBoard").value

    };

    try {

        const response = await fetch("/api/settings/" + schoolId, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(body)

        });

        const result = await response.json();

        if(result.success){

            alert("Settings Updated Successfully");

        }

    } catch(err){

        console.log(err);

    }

}
function logout() {

    if (!confirm("Are you sure you want to logout?")) return;

    localStorage.clear();

    window.location.href = "login.html";

}

loadSettings();