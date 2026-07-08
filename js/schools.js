const role = localStorage.getItem("role");

if(role === "principal"){

    alert("Access Denied");

    window.location.href = "dashboard.html";

}

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

    window.location.href = "login.html";

}

const container = document.getElementById("schoolsContainer");

let schools = [];
let editMode = false;

let editingSchoolId = null;

async function loadSchools() {

    try {

        const response = await fetch("/api/schools");

        const data = await response.json();

        schools = data.schools || [];

        displaySchools(schools);

    } catch (err) {

        console.error(err);

        container.innerHTML = `
            <h2 style="color:red;text-align:center;">
                Failed to load schools
            </h2>
        `;
    }
}

function displaySchools(list) {

    if (list.length === 0) {

        container.innerHTML = `
            <h2 style="text-align:center;">
                No School Found
            </h2>
        `;

        return;
    }

    container.innerHTML = "";

    list.forEach(school => {

        container.innerHTML += `

        <div class="school-card">

            <div class="school-logo">

                <img src="${
                    school.logo ||
                    'https://placehold.co/120x120?text=School'
                }">

            </div>

            <div class="school-name">

                ${school.schoolName}

            </div>

            <div class="school-info">

                <p><b>Board :</b> ${school.board}</p>

                <p><b>Principal :</b> ${school.principal || "-"}</p>

                <p><b>Phone :</b> ${school.phone || "-"}</p>

                <p><b>City :</b> ${school.city || "-"}</p>

            </div>

            <div class="card-buttons">

                <button
                    class="open-btn"
                    onclick="openSchool('${school._id}')">

                    Open

                </button>

                <button
                   class="edit-btn"
                   onclick="editSchool('${school._id}')">

                    Edit

                 </button>

                <button
                    class="delete-btn"
                    onclick="deleteSchool('${school._id}')">

                    Delete

                </button>

            </div>

        </div>

        `;

    });

}

function openSchool(id) {

    const school = schools.find(s => s._id === id);

    if (!school) return;

    localStorage.setItem("schoolId", school._id);

    localStorage.setItem("schoolName", school.schoolName);

    localStorage.setItem(
        "currentSchool",
        JSON.stringify(school)
    );

    window.location.href = "dashboard.html";

}

async function deleteSchool(id) {

    const school = schools.find(s => s._id === id);

    if (!school) return;

    const confirmDelete = confirm(
        `Are you sure you want to delete "${school.schoolName}"?`
    );

    if (!confirmDelete) return;

    try {

        const response = await fetch("/api/schools/" + id, {
            method: "DELETE"
        });

        const result = await response.json();

        if (result.success) {

            alert("School deleted successfully.");

            loadSchools();

        } else {

            alert(result.message);

        }

    } catch (err) {

        console.error(err);

        alert("Unable to delete school.");

    }
}

document.getElementById("searchSchool")
.addEventListener("input", function () {

    const text = this.value.toLowerCase();

    const filtered = schools.filter(s =>

        s.schoolName.toLowerCase().includes(text)

    );

    displaySchools(filtered);

});
// Modal

const modal = document.getElementById("schoolModal");

document.getElementById("addSchoolBtn").onclick = () => {

    modal.style.display = "flex";

};

document.getElementById("closeModal").onclick = () => {

    modal.style.display = "none";

};

document.getElementById("cancelBtn").onclick = () => {

    modal.style.display = "none";

    editMode = false;

    editingSchoolId = null;

    document.getElementById("modalTitle").innerHTML =
    `<i class="fa-solid fa-school"></i> Add New School`;

    document.getElementById("saveSchoolBtn").innerText =
    "Save School";

};

window.onclick = function(e){

    if(e.target===modal){

        modal.style.display="none";

    }

};
// ==============================
// Save School
// ==============================

document.getElementById("saveSchoolBtn").addEventListener("click", saveSchool);

async function saveSchool() {

   const school = {

    schoolName: document.getElementById("schoolName").value.trim(),

    principal: document.getElementById("principal").value.trim(),

    username: document.getElementById("principalUsername").value.trim(),

    password: document.getElementById("principalPassword").value,

    phone: document.getElementById("phone").value.trim(),

    email: document.getElementById("email").value.trim(),

    board: document.getElementById("board").value,

    city: document.getElementById("city").value.trim(),

    state: document.getElementById("state").value.trim(),

    address: document.getElementById("address").value.trim()

};

    // Validation
    if (!school.schoolName) {

        alert("Please enter School Name");

        return;

    }
    if (!school.username) {

    alert("Please enter Principal Username");

    return;

}

if (!school.password) {

    alert("Please enter Principal Password");

    return;

}

    try {

                const url = editMode ? "/api/schools/" + editingSchoolId: "/api/schools";

                const method = editMode? "PUT": "POST";

                const response = await fetch(url,{

                method,headers:
                {
                 "Content-Type":"application/json"
                },

                body:JSON.stringify(school)

                });

        const result = await response.json();

        if (result.success) {

            alert("School Added Successfully");

            modal.style.display = "none";
            editMode = false;

            editingSchoolId = null;

            document.getElementById("modalTitle").innerHTML =`<i class="fa-solid fa-school">
                                                               </i> Add New School`;

            document.getElementById("saveSchoolBtn").innerText ="Save School";

            // Clear form
            document.getElementById("schoolName").value = "";
            document.getElementById("principal").value = "";
            document.getElementById("principalUsername").value = "";
            document.getElementById("principalPassword").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("email").value = "";
            document.getElementById("city").value = "";
            document.getElementById("state").value = "";
            document.getElementById("address").value = "";
            document.getElementById("board").selectedIndex = 0;

            // Reload school list
            loadSchools();

        } else {

            alert(result.message);

        }

    } catch (err) {

        console.error(err);

        alert("Unable to save school.");

    }

}

// ==============================
// Edit School
// ==============================

function editSchool(id){

    const school = schools.find(s => s._id === id);

    if(!school) return;

    editMode = true;

    editingSchoolId = id;

    document.getElementById("modalTitle").innerHTML =
    `<i class="fa-solid fa-pen"></i> Edit School`;

    document.getElementById("saveSchoolBtn").innerText =
    "Update School";

    document.getElementById("schoolName").value = school.schoolName || "";

    document.getElementById("principal").value = school.principal || "";
    document.getElementById("principalUsername").value = "";

    document.getElementById("principalPassword").value = "";

    document.getElementById("phone").value = school.phone || "";

    document.getElementById("email").value = school.email || "";

    document.getElementById("board").value = school.board || "CBSE";

    document.getElementById("city").value = school.city || "";

    document.getElementById("state").value = school.state || "";

    document.getElementById("address").value = school.address || "";

    modal.style.display = "flex";

}

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {

    if(confirm("Are you sure you want to logout?")){

        localStorage.removeItem("user");

        window.location.href = "login.html";

    }

});

loadSchools();