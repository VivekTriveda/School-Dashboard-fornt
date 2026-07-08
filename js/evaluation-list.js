const reportContainer = document.getElementById("reportContainer");
const search = document.getElementById("search");
const schoolId = localStorage.getItem("schoolId");

const classFilter = document.getElementById("classFilter");

const subjectFilter = document.getElementById("subjectFilter");

const searchBtn = document.getElementById("searchBtn");

let reports = [];


loadClasses();

async function loadClasses(){

    const response = await fetch(

        `/api/evaluation/classes?schoolId=${schoolId}`

    );

    const data = await response.json();

    classFilter.innerHTML =

    '<option value="">Select Class</option>';

    data.classes.forEach(c=>{

        classFilter.innerHTML +=

        `<option value="${c}">${c}</option>`;

    });

}
classFilter.addEventListener("change",loadSubjects);

async function loadSubjects(){

    const response = await fetch(

`/api/evaluation/subjects?schoolId=${schoolId}&className=${classFilter.value}`

    );

    const data = await response.json();

    subjectFilter.innerHTML =

    '<option value="">Select Subject</option>';

    data.subjects.forEach(s=>{

        subjectFilter.innerHTML +=

        `<option value="${s}">${s}</option>`;

    });

}
searchBtn.addEventListener("click",searchReports);

async function searchReports(){

    if(!classFilter.value || !subjectFilter.value){

        alert("Please select both Class and Subject.");

        return;

    }

    const response = await fetch(

`/api/evaluation/filter?schoolId=${schoolId}&className=${classFilter.value}&subject=${subjectFilter.value}`

    );

    const data = await response.json();

    reports = data.reports;

    updateDashboardCards(reports);

    displayReports(reports);

    document.getElementById("emptyState").style.display = "none";

    document.getElementById("reportsSection").style.display = "block";

}


// ==========================
// Load Reports
// ==========================

async function loadReports() {

    try {

        const res = await fetch("/api/evaluation");

        const data = await res.json();

        reports = data.reports || [];

        updateDashboardCards(reports);

        displayReports(reports);

    } catch (err) {

        console.error(err);

        alert("Failed to load reports.");

    }

}

// ==========================
// Dashboard Cards
// ==========================

function updateDashboardCards(list) {

    const pending = list.filter(r => !r.teacherChecked).length;

    const approved = list.filter(r => r.teacherChecked).length;

    const total = list.length;

    let average = 0;

    if (total) {

        average = Math.round(

            list.reduce((sum, r) => sum + (r.percentage || 0), 0) / total

        );

    }

    document.getElementById("pendingCount").innerText = pending;

    document.getElementById("approvedCount").innerText = approved;

    document.getElementById("totalReports").innerText = total;

    document.getElementById("averageScore").innerText = average + "%";

}

// ==========================
// Display Cards
// ==========================

function displayReports(list) {

    reportContainer.innerHTML = "";

    if (list.length === 0) {

        reportContainer.innerHTML = `

        <h2 style="text-align:center;width:100%;padding:40px;">

        No Evaluation Reports Found

        </h2>

        `;

        return;

    }

    list.forEach(report => {

        reportContainer.innerHTML += `

<div class="report-card">

<div class="card-header">

<div class="student">

<div class="avatar">

${report.studentName.charAt(0).toUpperCase()}

</div>

<div>

<h3>${report.studentName}</h3>

<div class="subject">

${report.subject}

</div>

</div>

</div>

${

report.teacherChecked

?

`<span class="approvedBadge">

✅ Approved

</span>`

:

`<span class="pendingBadge">

🟡 Pending

</span>`

}

</div>

<div class="info">

<span class="label">

Roll No

</span>

<span class="value">

${report.rollNo}

</span>

</div>

<div class="info">

<span class="label">

Paper ID

</span>

<span class="value">

${report.paperId}

</span>

</div>

<div class="info">

<span class="label">

AI Marks

</span>

<span class="value">

${report.obtainedMarks}/${report.totalMarks}

</span>

</div>

<div class="info">

<span class="label">

Final Marks

</span>

<span class="value">

${report.teacherChecked

?

report.finalMarks + "/" + report.totalMarks

:

"Awaiting Review"

}

</span>

</div>

<div class="info">

<span class="label">

Teacher

</span>

<span class="value">

${report.teacherName || "--"}

</span>

</div>

<div class="action">

${

report.teacherChecked

?

`<button
class="reportBtn"
onclick="viewReport('${report._id}')">

📄 Report

</button>`

:

`<button
class="reviewBtn"
onclick="teacherReview('${report._id}')">

🔍 Review

</button>`

}

<button

class="deleteBtn"

onclick="deleteReport('${report._id}')">

🗑 Delete

</button>

</div>

</div>

`;

    });

}

// ==========================
// Search
// ==========================

search.addEventListener("keyup", () => {

    const keyword = search.value.toLowerCase();

    const filtered = reports.filter(r =>

        r.studentName.toLowerCase().includes(keyword) ||

        r.subject.toLowerCase().includes(keyword) ||

        r.paperId.toLowerCase().includes(keyword)

    );

    displayReports(filtered);

});

document.getElementById("reportsSection").style.display = "none";

document.getElementById("emptyState").style.display = "block";
// ==========================

function teacherReview(id) {

    window.location.href =

        `teacher-review.html?id=${id}`;

}

function viewReport(id) {

    window.location.href =

        `evaluation-report.html?id=${id}`;

}

async function deleteReport(id) {

    if (!confirm("Delete this report?"))

        return;

    await fetch(`/api/evaluation/${id}`, {

        method: "DELETE"

    });

    loadReports();

}