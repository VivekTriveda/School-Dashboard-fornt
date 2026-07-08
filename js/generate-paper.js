let generatedPaper = [];
let editingIndex = -1;
let currentPaperId = "";
// =========================
// Auto Fill School Name
// =========================

window.addEventListener("DOMContentLoaded", () => {

    const schoolName = localStorage.getItem("schoolName");

    if (schoolName) {

        const schoolInput = document.getElementById("schoolName");
        

        if (schoolInput) {

            schoolInput.value = schoolName;

            schoolInput.readOnly = true;

        }
       

    }

});

function showToast(message, error = false) {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);

    }

    toast.innerText = message;
    toast.style.background = error ? "#dc2626" : "#16a34a";
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

async function generatePaper() {

    try {

        showToast("Generating Paper...");

        document.getElementById("board").value = school.board;
        const board =document.getElementById("board").value;
        const className =
            document.getElementById("className").value;

        const subject =
            document.getElementById("subject").value;

         const chapters = Array.from(
    document.querySelectorAll("#chapterList input[type='checkbox']:checked")
).map(cb => cb.value);

      /*  const totalMarks = parseInt(
                document.getElementById("totalMarks").value);
        const mcqMarks = Math.round(totalMarks * 0.25);

       const shortMarks = Math.round(totalMarks * 0.35);

       const longMarks = totalMarks - mcqMarks - shortMarks;

const blueprint = [
    {
        title: "SECTION A",
        type: "MCQ",
        marks: mcqMarks
    },
    {
        title: "SECTION B",
        type: "Short Answer",
        marks: shortMarks
    },
    {
        title: "SECTION C",
        type: "Long Answer",
        marks: longMarks
    }
];      

*/

const totalMarks = parseInt(
    document.getElementById("totalMarks").value
);

// Get selected question types
const selectedTypes = Array.from(
    document.querySelectorAll(".question-type-list input[type='checkbox']:checked")
).map(cb => cb.value);

if (selectedTypes.length === 0) {

    showToast("Please select at least one question type.", true);

    return;

}

let blueprint = [];

const marksPerType = Math.floor(totalMarks / selectedTypes.length);

let remainingMarks = totalMarks;

selectedTypes.forEach((type, index) => {

    const marks =
        (index === selectedTypes.length - 1)
            ? remainingMarks
            : marksPerType;

    blueprint.push({

        title: `SECTION ${String.fromCharCode(65 + index)}`,

        type,

        marks

    });

    remainingMarks -= marks;

});


        generatedPaper = [];
        if (!localStorage.getItem("schoolId")) {

    showToast("Please select a school first.", true);

    return;

}

      const response = await fetch(
    "/api/paper/generate-blueprint",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            schoolId: localStorage.getItem("schoolId"),
            schoolName: localStorage.getItem("schoolName"),
            board,
            className,
            subject,
            chapters,

            difficulty: {
                easy: 30,
                medium: 50,
                hard: 20
            },

            blueprint

        })
    }
);

  const data = await response.json();
  currentPaperId = data.paperId;

        if (!data.success) {

            showToast(data.message, true);

            return;

        }


localStorage.setItem("paperId", data.paperId);

// Show Paper ID
const paperIdSpan = document.getElementById("paperId");

if (paperIdSpan) {
    paperIdSpan.textContent = data.paperId;
    paperIdSpan.style.color = "green";
    paperIdSpan.style.fontWeight = "bold";
}

        generatedPaper = data.questions;

        renderPaper(data);

        showToast("Paper Generated Successfully");

    }

    catch (err) {

        console.error(err);

        showToast("Server Error", true);

    }

}

function renderPaper(data) {

    let html = "";
    let currentSection = "";

    data.questions.forEach((q, index) => {

        if (currentSection !== q.section) {

            currentSection = q.section;

            html += `
                <div class="section-title">
                    ${currentSection}
                </div>
            `;
        }

        html += `
        <div class="question-card" id="question-${index}">

            <div class="question-header">

                <div>
                    <strong>Q${index + 1}.</strong>
                    ${q.question}
                </div>

                <span class="marks-badge">
                    ${q.marks} Marks
                </span>

            </div>

            <div class="question-info">

                <span>
                    <b>Type:</b> ${q.type || "-"}
                </span>

                <span>
                    <b>Difficulty:</b> ${q.difficulty || "-"}
                </span>

            </div>
        `;

        if (q.type === "MCQ" && q.options && q.options.length) {

            html += `
                <div class="mcq-options">
                    <div>A. ${q.options[0]}</div>
                    <div>B. ${q.options[1]}</div>
                    <div>C. ${q.options[2]}</div>
                    <div>D. ${q.options[3]}</div>
                </div>
            `;
        }

        html += `
            <div class="question-actions">

                <button
                    class="edit-btn"
                    onclick="editQuestion(${index})">

                    ✏ Edit

                </button>

                <button
                    class="replace-btn"
                    onclick="replaceQuestion(${index})">

                    🔄 Replace

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteQuestion(${index})">

                    ❌ Delete

                </button>

            </div>

        </div>
        `;

    });

    document.getElementById("paper").innerHTML = html;
}

function deleteQuestion(index){

    if(!confirm("Delete this question?"))
        return;

    generatedPaper.splice(index,1);

    renderPaper({
        questions: generatedPaper
    });

    showToast("Question Deleted");

}


function editQuestion(index){

    editingIndex = index;

    const q = generatedPaper[index];

    document.getElementById("editQuestionText").value = q.question || "";

    document.getElementById("editMarks").value = q.marks || "";

    document.getElementById("editDifficulty").value = q.difficulty || "Easy";

    document.getElementById("mcqArea").style.display =
        q.type === "MCQ" ? "block" : "none";

    if(q.type === "MCQ"){

        document.getElementById("optionA").value = q.options?.[0] || "";

        document.getElementById("optionB").value = q.options?.[1] || "";

        document.getElementById("optionC").value = q.options?.[2] || "";

        document.getElementById("optionD").value = q.options?.[3] || "";

    }

    document.getElementById("editModal").style.display = "flex";

}
function saveEditedQuestion() {

    const q = generatedPaper[editingIndex];

    q.question = document.getElementById("editQuestionText").value;

    q.marks = Number(document.getElementById("editMarks").value);

    q.difficulty = document.getElementById("editDifficulty").value;

    if (q.type === "MCQ") {

        q.options = [

            document.getElementById("optionA").value,

            document.getElementById("optionB").value,

            document.getElementById("optionC").value,

            document.getElementById("optionD").value

        ];

    }

    closeEditModal();

    renderPaper({

        questions: generatedPaper

    });

    showToast("Question Updated Successfully");

}
function closeEditModal(){

    document.getElementById("editModal").style.display = "none";

}



async function replaceQuestion(index){

    const q = generatedPaper[index];

    try{

        const res = await fetch(

            `/api/questions/replace?subject=${encodeURIComponent(q.subject)}
            &chapters=${encodeURIComponent(q.chapters?.join(","))}&marks=${q.marks}
            &type=${encodeURIComponent(q.type || "")}&exclude=${q._id}
            &schoolId=${encodeURIComponent(localStorage.getItem("schoolId"))}`

        );

        const data = await res.json();

        if(!data.success){

            showToast(data.message,true);

            return;

        }

        generatedPaper[index] = data.question;

        renderPaper({

            questions: generatedPaper

        });

        showToast("Question Replaced Successfully");

    }

    catch(err){

        console.error(err);

        showToast("Unable to replace question",true);

    }

}


document.getElementById("subject").addEventListener("change", loadChapters);

async function loadChapters() {

    const subject = document.getElementById("subject").value;

    if (!subject) return;

    const res = await fetch(
        `/api/questions/chapters/${subject}?schoolId=${localStorage.getItem("schoolId")}`
    );

    const chapters = await res.json();

    const chapterList = document.getElementById("chapterList");

    chapterList.innerHTML = "";

    chapters.forEach(chapter => {

        chapterList.innerHTML += `
            <label class="chapter-item">
                <input
                    type="checkbox"
                    value="${chapter}">
                ${chapter}
            </label>
        `;

    });

}

async function downloadPDF(){

    if(generatedPaper.length === 0){

        showToast("Generate a paper first.", true);

        return;
    }
    const currentSchool = JSON.parse(
    localStorage.getItem("currentSchool")
);

    const principalName =
    currentSchool?.principal || "Principal";
    
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const schoolName =
    document.getElementById("schoolName").value;

    const examName =
    document.getElementById("examName").value;

    const board =
    document.getElementById("board").value;

    const className =
    document.getElementById("className").value;

    const subject =
    document.getElementById("subject").value;

    const duration =
    document.getElementById("duration").value;

    const totalMarks =
    document.getElementById("totalMarks").value;

let y = 15;

//header

doc.setDrawColor(0);
doc.rect(8,8,194,280);

doc.setFont("times","bold");
doc.setFontSize(18);
doc.text(schoolName.toUpperCase(),105,y,{align:"center"});

y+=8;

doc.setFontSize(14);
doc.text(examName.toUpperCase(),105,y,{align:"center"});

y+=10;

doc.setLineWidth(0.5);
doc.line(10,y,200,y);

y+=8;

doc.setFont("times","normal");
doc.setFontSize(11);

doc.text(`Paper ID : ${currentPaperId}`, 12, y);

y += 8;

doc.text(`Board : ${board}`,12,y);
doc.text(`Class : ${className}`,150,y);

y+=8;

doc.text(`Subject : ${subject}`,12,y);
doc.text(`Time : ${duration}`,150,y);

y+=8;

doc.text(`Maximum Marks : ${totalMarks}`,12,y);

y+=10;

doc.text("Student Name : ____________________________",12,y);

y+=8;

doc.text("Roll No : ____________",12,y);
doc.text("Section : ____________",90,y);
doc.text("Date : ____________",150,y);

y+=8;

doc.line(10,y,200,y);

y+=10;

    // INSTRUCTIONS

doc.setFont("times","bold");
doc.setFontSize(12);

doc.text("GENERAL INSTRUCTIONS",10,y);

y+=8;

doc.setFont("times","normal");
doc.setFontSize(10);

const instructions=[
"1. All questions are compulsory.",
"2. Read all questions carefully.",
"3. Figures in the right margin indicate marks.",
"4. Draw neat diagrams wherever necessary.",
"5. Write answers in clear handwriting.",
"6. Use blue or black ink only.",
"7. Do not write in the margins.",
"8. Maintain proper question numbering."
];

instructions.forEach(i=>{
doc.text(i,15,y);
y+=6;
});

y+=4;
doc.line(10,y,200,y);

y+=10;

    // =============================
// QUESTIONS
// =============================

let currentSection = "";

generatedPaper.forEach((q,index)=>{

    // Clean Question Text

    let cleanQuestion = q.question

        .replace(/^Q\s*\d+\.\s*/i,"")

        .replace(/^\d+\.\s*/,"")

        .replace(/[\u200B-\u200D\uFEFF]/g,"")

        .replace(/\s+/g," ")

        .trim();

    // Section Heading

   const sectionName = q.section || "";

if(sectionName && currentSection !== sectionName){

    currentSection = sectionName;

    doc.setFont("times","bold");

    doc.setFontSize(14);

    doc.setTextColor(0,0,160);

    doc.text(sectionName,105,y,{align:"center"});

        y+=8;

        doc.setDrawColor(0);

        doc.line(15,y,195,y);

        y+=10;

    }

    let questionText=cleanQuestion;

    if(

        q.type==="MCQ"

        &&

        q.options

        &&

        q.options.length

    ){

        questionText+="\n\n";

        q.options.forEach((option,i)=>{

            questionText +=
`      ${String.fromCharCode(65+i)}. ${option}\n`;

        });

    }

    const lines=doc.splitTextToSize(

        questionText,

        165

    );

    const questionHeight=

        (lines.length*5)+3;

    if(

        y+questionHeight>260

    ){

        doc.addPage();

        doc.rect(8,8,194,280);

        y=20;

    }

    // Question Number

    doc.setFont("times","bold");

    doc.setFontSize(11);

    doc.setTextColor(0,0,0);

    doc.text(

        `Q${index+1}.`,

        12,

        y

    );

    // Question

    doc.setFont("times","normal");

    doc.text(

        lines,

        22,

        y

    );

    // Marks

    doc.setFont("times","bold");

    doc.text(

        `[${q.marks}]`,

        188,

        y,

        {

            align:"right"

        }

    );

    if (q.type === "MCQ") {
    y += questionHeight - 2;
} else {
    y += questionHeight + 2;
}

});

// ===============================
// FOOTER
// ===============================

// End of Question Paper

if(y<245){

    y+=8;

    doc.setDrawColor(180);

    doc.line(15,y,195,y);

    y+=8;

    doc.setFont("times","italic");

    doc.setFontSize(10);

    doc.setTextColor(120);

    doc.text(

        "*** End of Question Paper ***",

        105,

        y,

        {

            align:"center"

        }

    );

}

// Signature Area

doc.setTextColor(0);

doc.setFont("times","normal");

doc.setFontSize(10);

doc.line(18,260,70,260);

doc.line(135,260,188,260);

doc.text(

    "Exam Controller",

    22,

    266

);

doc.text(

    principalName,  
    150,
    266);


doc.text(

    "Principal",

    150,

    272

);

// Page Number

const pageCount = doc.getNumberOfPages();

for(let i=1;i<=pageCount;i++){

    doc.setPage(i);

    // Border

    doc.setDrawColor(0);

    doc.rect(

        8,

        8,

        194,

        280

    );

    // Footer Line

    doc.setDrawColor(180);

    doc.line(

        10,

        278,

        200,

        278

    );

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(

        `Page ${i} of ${pageCount}`,

        180,

        283

    );

    doc.text(

        "Generated by Question Paper Generator",

        20,

        283

    );

    // Watermark

    doc.setTextColor(240);

    doc.setFontSize(42);

    doc.setFont("times","bold");

    doc.text(

        "CONFIDENTIAL",

        105,

        150,

        {

            align:"center",

        

        }

    );

}

// Save

doc.save(

`${subject}_Question_Paper.pdf`

);

}
async function downloadAnswerKey() {

    if (generatedPaper.length === 0) {
        showToast("Generate a paper first.", true);
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const schoolName = document.getElementById("schoolName").value;
    const examName = document.getElementById("examName").value;
    const board = document.getElementById("board").value;
    const className = document.getElementById("className").value;
    const subject = document.getElementById("subject").value;
    const paperId = localStorage.getItem("paperId") || "";

    let y = 20;

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text(schoolName.toUpperCase(), 105, y, { align: "center" });

    y += 10;

    doc.setFontSize(14);
    doc.text("ANSWER KEY", 105, y, { align: "center" });

    y += 10;

    doc.setFontSize(11);
    doc.setFont("times", "normal");

    doc.text(`Paper ID : ${paperId}`, 15, y);

    y += 7;

    doc.text(`Board : ${board}`, 15, y);
    doc.text(`Class : ${className}`, 140, y);

    y += 7;

    doc.text(`Subject : ${subject}`, 15, y);

    y += 12;

    generatedPaper.forEach((q, index) => {

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("times", "bold");
        doc.text(`Q${index + 1}`, 15, y);

        doc.setFont("times", "normal");

        const answer = q.answer || "Answer Not Available";

        const lines = doc.splitTextToSize(answer, 160);

        doc.text(lines, 30, y);

        y += (lines.length * 6) + 4;

    });

    doc.save(`${subject}_Answer_Key.pdf`);

    showToast("Answer Key Downloaded");
}

async function downloadBlankAnswerSheet() {

    if (generatedPaper.length === 0) {

        showToast("Generate a question paper first.", true);

        return;

    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const schoolName = document.getElementById("schoolName").value;
    const examName = document.getElementById("examName").value;
    const board = document.getElementById("board").value;
    const className = document.getElementById("className").value;
    const subject = document.getElementById("subject").value;
    const totalMarks = document.getElementById("totalMarks").value;

    let y = 15;

    // ===========================
    // BORDER
    // ===========================

    doc.rect(8, 8, 194, 280);

    // ===========================
    // HEADER
    // ===========================

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text(schoolName.toUpperCase(), 105, y, { align: "center" });

    y += 8;

    doc.setFontSize(14);
    doc.text(examName.toUpperCase(), 105, y, { align: "center" });

    y += 10;

    doc.line(10, y, 200, y);

    y += 8;

    doc.setFont("times", "normal");
    doc.setFontSize(11);

   // ===========================
// PAPER ID BOX
// ===========================

doc.setDrawColor(0);
doc.setFillColor(240, 248, 255);

// Draw box
doc.roundedRect(12, y - 4, 176, 12, 2, 2, "FD");

doc.setFont("times", "bold");
doc.setFontSize(12);

doc.text(
    `Paper ID : ${currentPaperId}`,
    100,
    y + 4,
    { align: "center" }
);

y += 18;

    doc.text(`Board : ${board}`, 12, y);
    doc.text(`Class : ${className}`, 150, y);

    y += 8;

    doc.text(`Subject : ${subject}`, 12, y);
    doc.text(`Maximum Marks : ${totalMarks}`, 150, y);

    y += 10;

    doc.text("Student Name : ________________________________", 12, y);

    y += 8;

    doc.text("Roll No : ____________", 12, y);
    doc.text("Section : ____________", 90, y);
    doc.text("Date : ____________", 150, y);

    y += 10;

    doc.line(10, y, 200, y);

    y += 10;

    // ===========================
    // ANSWER AREAS
    // ===========================

    generatedPaper.forEach((q, index) => {

        let lines = 5;

        if (q.marks == 1) lines = 2;
        else if (q.marks == 2) lines = 5;
        else if (q.marks == 3) lines = 8;
        else if (q.marks == 5) lines = 12;
        else if (q.marks >= 6) lines = 15;

        const requiredHeight = (lines * 7) + 18;

        if (y + requiredHeight > 270) {

            doc.addPage();
            doc.rect(8, 8, 194, 280);
            y = 20;

        }

        doc.setFont("times", "bold");
        doc.setFontSize(11);

        doc.text(
            `Q${index + 1} (${q.marks} Marks)`,
            12,
            y
        );

        y += 6;

        doc.setFont("times", "normal");

        for (let i = 0; i < lines; i++) {

            doc.line(18, y, 190, y);

            y += 7;

        }

        y += 5;

    });

    // ===========================
    // FOOTER
    // ===========================

    const pages = doc.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {

        doc.setPage(i);

        doc.rect(8, 8, 194, 280);

        doc.setFontSize(8);

        doc.text(
            `Page ${i} of ${pages}`,
            170,
            285
        );

    }

    doc.save(`${subject}_Blank_Answer_Sheet.pdf`);

}
function selectAllChapters() {

    document
        .querySelectorAll("#chapterList input[type='checkbox']")
        .forEach(cb => cb.checked = true);

}

function clearAllChapters() {

    document
        .querySelectorAll("#chapterList input[type='checkbox']")
        .forEach(cb => cb.checked = false);

}

function logout() {

    if (!confirm("Are you sure you want to logout?")) return;

    localStorage.clear();

    window.location.href = "login.html";

}