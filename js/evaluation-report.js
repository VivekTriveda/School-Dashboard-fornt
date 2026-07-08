// =============================
// Get Evaluation ID from URL
// Example:
// evaluation-report.html?id=686f4a12...
// =============================
let currentEvaluation = null;
const params = new URLSearchParams(window.location.search);
const evaluationId = params.get("id");

if (!evaluationId) {
    alert("Evaluation ID not found.");
    throw new Error("Evaluation ID missing.");
}

loadEvaluation();

// =============================

async function loadEvaluation() {

    try {

        const response = await fetch(`/api/evaluation/${evaluationId}`);

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        renderReport(data.report);

    }

    catch (err) {

        console.error(err);

        alert("Unable to load evaluation.");

    }

}



// =============================

function renderReport(evaluation) {

    currentEvaluation = evaluation;

  document.getElementById("summary").innerHTML = `

<div class="summary-item">
<label>Student Name</label>
<span>${evaluation.studentName}</span>
</div>

<div class="summary-item">
<label>Roll No</label>
<span>${evaluation.rollNo}</span>
</div>

<div class="summary-item">
<label>Paper ID</label>
<span>${evaluation.paperId}</span>
</div>

<div class="summary-item">
<label>Maximum Marks</label>
<span>${evaluation.totalMarks}</span>
</div>

<div class="summary-item">
<label>AI Marks</label>
<span>${evaluation.obtainedMarks}</span>
</div>

<div class="summary-item">
<label>Final Teacher Marks</label>
<span>${evaluation.finalMarks || evaluation.obtainedMarks}</span>
</div>

<div class="summary-item">
<label>Percentage</label>
<span>${evaluation.percentage}%</span>
</div>

<div class="summary-item">
<label>Grade</label>
<span>${evaluation.grade}</span>
</div>

<div class="summary-item">
<label>Status</label>
<span style="color:${evaluation.teacherChecked ? 'green':'orange'};font-weight:bold;">
${evaluation.teacherChecked ? 'Approved by Teacher ✅' : 'Pending Teacher Review ⏳'}
</span>
</div>

<div class="summary-item">
<label>Teacher</label>
<span>${evaluation.teacherName || "-"}</span>
</div>

`;

    const questionContainer = document.getElementById("questions");

    questionContainer.innerHTML = "";

    evaluation.results.forEach((q, index) => {

       let badge = "wrong";
let status = "❌ Wrong";

if (
    q.feedback &&
    q.feedback.toLowerCase().includes("correct")
) {

    badge = "correct";
    status = "✅ Correct";

}
else if (
    q.feedback &&
    q.feedback.toLowerCase().includes("partial")
) {

    badge = "partial";
    status = "🟡 Partial";

}

        questionContainer.innerHTML += `

<div class="question-card">

<div class="question-header">

Question ${index + 1}

<span class="badge ${badge}">
${status}
</span>

</div>

<div class="question-body">

<h4>Student Answer</h4>

<p>${q.studentAnswer || "-"}</p>

<h4>Correct Answer</h4>

<p>${q.correctAnswer || "-"}</p>

<h4>Feedback</h4>

<p>${q.feedback || "-"}</p>

<div class="marks">

<b>AI Marks :</b> ${q.obtainedMarks} / ${q.maxMarks}

</div>

<p style="color:green;font-size:13px;margin:8px 0;">
✔ AI marks are already filled. Change only if required.
</p>

<div class="teacher-review">

<label><b>Teacher Marks</b></label>

<input
    type="number"
    class="teacherMarks"
    data-question="${q.questionId}"
    data-ai="${q.obtainedMarks}"
    min="0"
    max="${q.maxMarks}"
    value="${q.teacherMarks ?? q.obtainedMarks}"
    ${evaluation.teacherChecked ? "disabled" : ""}
>

<label><b>Teacher Remarks</b></label>

<textarea
    class="teacherRemarks"
    data-question="${q.questionId}"
    rows="2"
    ${evaluation.teacherChecked ? "disabled" : ""}
>${q.teacherRemarks || ""}</textarea>

</div>

</div>

</div>

`;

    });
    
   if (!evaluation.teacherChecked) {

questionContainer.innerHTML += `

<div style="margin-top:30px;text-align:center;">

<button
class="saveBtn"
onclick="saveTeacherReview()">

✅ Approve Evaluation

</button>

</div>

`;

}

}

// =============================
// Download PDF
// =============================

async function downloadReport() {

    const response = await fetch(`/api/evaluation/${evaluationId}`);

    const data = await response.json();

    if (!data.success) {

        alert("Evaluation not found.");

        return;

    }

   const e = data.report;

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let y = 18;

    // ======================
    // HEADER
    // ======================

    doc.setDrawColor(0);
    doc.rect(8,8,194,280);

    doc.setFont("times","bold");
    doc.setFontSize(18);

    doc.text("STUDENT EVALUATION REPORT",105,y,{align:"center"});

    y += 12;

    doc.setLineWidth(0.5);
    doc.line(10,y,200,y);

    y += 10;

    doc.setFontSize(12);
    doc.setFont("times","normal");

    doc.text(`Student Name : ${e.studentName}`,12,y);

    y += 8;

    doc.text(`Roll No : ${e.rollNo}`,12,y);

    y += 8;

    doc.text(`Paper ID : ${e.paperId}`,12,y);

    y += 8;

    doc.text(`Obtained Marks : ${e.obtainedMarks} / ${e.totalMarks}`,12,y);

    y += 8;

    doc.text(`Percentage : ${e.percentage}%`,12,y);

    y += 8;

    doc.text(`Grade : ${e.grade}`,12,y);

    y += 10;

    doc.line(10,y,200,y);

    y += 10;

    // ======================
    // QUESTION REPORT
    // ======================

    e.results.forEach((q,index)=>{

        if(y>250){

            doc.addPage();

            doc.rect(8,8,194,280);

            y=20;

        }

        doc.setFont("times","bold");

        doc.text(`Question ${index+1}`,12,y);

        y+=7;

        doc.setFont("times","normal");

        doc.text(
            `Student Answer : ${q.studentAnswer || "-"}`,
            15,
            y
        );

        y+=7;

        doc.text(
            `Correct Answer : ${q.correctAnswer || "-"}`,
            15,
            y
        );

        y+=7;

        doc.text(
            `Feedback : ${q.feedback || "-"}`,
            15,
            y
        );

        y+=7;

        doc.text(
            `Marks : ${q.obtainedMarks} / ${q.maxMarks}`,
            15,
            y
        );

        y+=10;

        doc.line(12,y,195,y);

        y+=8;

    });

    // ======================
    // FOOTER
    // ======================

    doc.setFont("times","bold");

    doc.text(
        `FINAL SCORE : ${e.obtainedMarks}/${e.totalMarks}`,
        12,
        y
    );

    y+=8;

    doc.text(
        `GRADE : ${e.grade}`,
        12,
        y
    );

    doc.save(`${e.studentName}_Evaluation_Report.pdf`);

}

async function saveTeacherReview() {

    const marks =
        document.querySelectorAll(".teacherMarks");

    const remarks =
        document.querySelectorAll(".teacherRemarks");
    
    let hasChanges = false;    
    let results = [];

    marks.forEach((m, index) => {

    const aiMarks = Number(m.dataset.ai);
    const currentMarks = Number(m.value);

    const teacherMarks =
    currentMarks === aiMarks ? null : currentMarks;

if (teacherMarks !== null) {
    hasChanges = true;
}

results.push({

    questionId: m.dataset.question,

    teacherMarks,

    teacherRemarks: remarks[index].value

});

}); 
if (!hasChanges) {

    if (!confirm(
        "Approve AI evaluation without any changes?"
    )) return;

}
else {

    if (!confirm(
        "Save your modified evaluation?"
    )) return;

}

    const teacherName =
        prompt("Enter Teacher Name");

    if (!teacherName) return;
    console.log("===== RESULTS SENT TO SERVER =====");
console.log(JSON.stringify(results, null, 2));
console.log("==================================");

    const response = await fetch(

        `/api/evaluation/${evaluationId}/manual-review`,

        {

            method: "PUT",

            headers: {

                "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

                teacherName,

                results

            })

        }

    );

    const data = await response.json();

    if (data.success) {

        alert("✅ Teacher Review Saved");

        location.reload();

    } else {

        alert(data.message);

    }

}