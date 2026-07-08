const params = new URLSearchParams(window.location.search);

const evaluationId = params.get("id");

loadEvaluation();

async function loadEvaluation(){

    const response = await fetch(

        `/api/evaluation/${evaluationId}`

    );

    const data = await response.json();

    if(!data.success){

        alert("Evaluation not found");

        return;

    }

    renderPage(data.report);

}

function renderPage(evaluation){

    // =============================
    // Student Summary
    // =============================

    document.getElementById("summary").innerHTML = `

    <div class="summary-item">
        <b>Student Name</b><br>
        ${evaluation.studentName}
    </div>

    <div class="summary-item">
        <b>Roll No</b><br>
        ${evaluation.rollNo}
    </div>

    <div class="summary-item">
        <b>Paper ID</b><br>
        ${evaluation.paperId}
    </div>

    <div class="summary-item">
        <b>Subject</b><br>
        ${evaluation.subject}
    </div>

    <div class="summary-item">
        <b>AI Marks</b><br>
        ${evaluation.obtainedMarks} / ${evaluation.totalMarks}
    </div>

    `;

    // =============================
    // Questions
    // =============================

    const container =
        document.getElementById("questions");

    container.innerHTML = "";

    evaluation.results.forEach((q,index)=>{

        container.innerHTML += `

        <div class="question-card">

            <h3>Question ${index+1}</h3>

            <p><b>Student Answer</b></p>

            <p>${q.studentAnswer || "-"}</p>

            <p><b>Correct Answer</b></p>

            <p>${q.correctAnswer || "-"}</p>

            <p><b>AI Feedback</b></p>

            <p>${q.feedback || "-"}</p>

            <p>

            <b>AI Marks :</b>

            ${q.obtainedMarks} / ${q.maxMarks}

            </p>

            <hr>

            <label>

            Teacher Marks

            </label>

            <input

            type="number"

            class="teacherMarks"

            data-question="${q.questionId}"

            min="0"

            max="${q.maxMarks}"

            value="${q.teacherMarks ?? ""}"

            >

            <br><br>

            <label>

            Teacher Remarks

            </label>

            <textarea

            class="teacherRemarks"

            data-question="${q.questionId}"

            >${q.teacherRemarks || ""}</textarea>

        </div>

        `;

    });

}
// =========================
// SAVE TEACHER REVIEW
// =========================

document.getElementById("saveReview")
.addEventListener("click", saveTeacherReview);

async function saveTeacherReview() {

    const marks =
        document.querySelectorAll(".teacherMarks");

    const remarks =
        document.querySelectorAll(".teacherRemarks");

    let results = [];

    marks.forEach((m,index)=>{

        results.push({

            questionId: m.dataset.question,

            teacherMarks: Number(m.value),

            teacherRemarks: remarks[index].value

        });

    });

    const teacherName =
        prompt("Enter Teacher Name");

    if(!teacherName) return;

    const response = await fetch(

        `/api/evaluation/${evaluationId}/manual-review`,

        {

            method:"PUT",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                teacherName,

                results

            })

        }

    );

    const data = await response.json();

    if(data.success){

        alert("Teacher Review Saved Successfully.");

        window.location.href="evaluation-list.html";

    }else{

        alert(data.message);

    }

}