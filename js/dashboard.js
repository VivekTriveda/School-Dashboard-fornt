const API = "/api/questions";

let currentPage = 1;
let totalPages = 1;
let searchText = "";
let deleteId = null;


async function loadDashboard(){

    const schoolId =
        localStorage.getItem("schoolId");

    const res = await fetch(
        `/api/dashboard/${schoolId}`
    );

    const data = await res.json();

    document.getElementById("totalBooks").innerText =
        data.books;

    document.getElementById("totalQuestions").innerText =
        data.questions;

    document.getElementById("totalSubjects").innerText =
        data.subjects;

    document.getElementById("totalClasses").innerText =
        data.classes;

    document.getElementById("totalChapters").innerText =
        data.chapters;

}

loadDashboard();

async function loadQuestions(page = 1, search = "") {

    currentPage = page;

    const schoolId = localStorage.getItem("schoolId");

    const res = await fetch(
    `${API}?page=${page}&limit=25&limit=25&search=${encodeURIComponent(search)}&schoolId=${schoolId}`
    );

    const data = await res.json();

    totalPages = data.totalPages;

    document.getElementById("totalQuestions").innerText = data.total;

    renderTable(data.questions);

    document.getElementById("pageInfo").innerText =
        `Page ${currentPage} of ${totalPages}`;

    updateButtons();

    
}

function renderTable(questions) {

    const table = document.getElementById("questionTable");

    table.innerHTML = "";

    const fragment = document.createDocumentFragment();

    questions.forEach(q => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${q.subject}</td>
            <td>${q.chapter}</td>
            <td>${q.question}</td>
            <td>${q.marks}</td>

           <td class="action-cell">

                 <button
                   class="edit-btn"
                   onclick="editQuestion('${q._id}')">

                 ✏ Edit

                </button>

               <button
               class="delete-btn"
               onclick="deleteQuestion('${q._id}')">

                🗑 Delete

                 </button>

               </td>
        `;

        fragment.appendChild(tr);

    });

    table.appendChild(fragment);

}

function updateButtons() {

    document.getElementById("prevBtn").disabled =
        currentPage === 1;

    document.getElementById("nextBtn").disabled =
        currentPage >= totalPages;

}

document.getElementById("prevBtn")
.addEventListener("click", () => {

    if (currentPage > 1) {

        loadQuestions(currentPage - 1, searchText);

    }

});

document.getElementById("nextBtn")
.addEventListener("click", () => {

    if (currentPage < totalPages) {

        loadQuestions(currentPage + 1, searchText);

    }

});

document.getElementById("search")
.addEventListener("keyup", function () {

    searchText = this.value;

    loadQuestions(1, searchText);

});

async function deleteQuestion(id){

    openConfirm(id);

}
const confirmBtn = document.getElementById("confirmDelete");

if (confirmBtn) {

    confirmBtn.onclick = async () => {

        await fetch(`${API}/${deleteId}`, {
            method: "DELETE"
        });

        closeConfirm();

        showToast("Question deleted successfully.");

        loadQuestions(currentPage, searchText);

    };

}

async function updateQuestion() {

    const id = document.getElementById("editId").value;

    await fetch(`${API}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            subject:
                document.getElementById("editSubject").value,

            chapter:
                document.getElementById("editChapter").value,

            question:
                document.getElementById("editQuestion").value,

            marks:
                document.getElementById("editMarks").value

        })

    });

    

    closeModal();
    showToast("Question updated successfully.");

    loadQuestions(currentPage, searchText);

}

function showToast(message){

    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = message;

    toast.style.display = "block";

    setTimeout(()=>{

        toast.style.display="none";

    },2500);

}

function openConfirm(id){

    deleteId = id;

    document.getElementById("confirmModal").style.display="flex";

}

function closeConfirm(){

    document.getElementById("confirmModal").style.display="none";

}

async function editQuestion(id) {

    try {

        const res = await fetch(`${API}/${id}`);

        const q = await res.json();

        document.getElementById("editId").value = q._id;
        document.getElementById("editSubject").value = q.subject;
        document.getElementById("editChapter").value = q.chapter;
        document.getElementById("editQuestion").value = q.question;
        document.getElementById("editMarks").value = q.marks;

        document.getElementById("editModal").style.display="flex";

    } catch (err) {

        alert("Unable to load question.");

        console.error(err);

    }

}

function closeModal() {

    document.getElementById("editModal").style.display = "none";

}

const userrole = localStorage.getItem("role");

if(userrole === "admin"){
    document.getElementById("backSchoolMenu").style.display = "block";
}

function backToSchools(){

    localStorage.removeItem("schoolId");
    localStorage.removeItem("schoolName");
    localStorage.removeItem("currentSchool");

    window.location.href = "schools.html";
}



loadQuestions();