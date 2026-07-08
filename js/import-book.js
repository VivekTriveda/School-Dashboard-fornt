const board = document.getElementById("board");
const className = document.getElementById("class");
const subject = document.getElementById("subject");
const pdf = document.getElementById("pdf");

pdf.addEventListener("change",()=>{

const fileName=document.getElementById("fileName");

if(pdf.files.length){

fileName.innerHTML="📘 "+pdf.files[0].name;

}else{

fileName.innerHTML="No file selected";

}

});

const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const status = document.getElementById("status");

async function uploadBook() {

    if (subject.value.trim() === "") {
        alert("Please enter Subject.");
        return;
    }

    if (pdf.files.length === 0) {
        alert("Please select a PDF.");
        return;
    }

    const formData = new FormData();

    formData.append("board", board.value);
    formData.append("class", className.value);
    formData.append("subject", subject.value);
    formData.append("schoolId", localStorage.getItem("schoolId"));
    formData.append("schoolName", localStorage.getItem("schoolName"));
    formData.append("pdf", pdf.files[0]);

    progressContainer.style.display = "block";
    progressBar.value = 10;
    status.innerHTML = "Uploading PDF...";

    try {

    // ---------- Upload Book ----------

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (!result.success) {

        status.innerHTML = "❌ " + result.message;
        alert(result.message);
        return;

    }

    progressBar.value = 30;
    status.innerHTML = "📚 Book Uploaded Successfully";

    // ---------- Generate Questions ----------

    progressBar.value = 40;
    status.innerHTML = "Generating Questions using Gemini...";

    const processResponse = await fetch(
        `/api/process-book/${result.bookId}`,
        {
            method: "POST"
        }
    );

    const processResult = await processResponse.json();

    if (!processResult.success) {

        status.innerHTML = "❌ " + processResult.message;
        alert(processResult.message);
        return;

    }

    progressBar.value = 100;

    status.innerHTML =
        `✅ ${processResult.totalQuestions} Questions Generated Successfully`;

    alert(
        `${processResult.totalQuestions} Questions Generated Successfully`
    );

    setTimeout(() => {

        window.location.href = "dashboard.html";

    }, 2000);

} catch (error) {

    console.error(error);

    status.innerHTML = "❌ Server Error";

    alert("Server Error");

}
}
function logout() {

    if (!confirm("Are you sure you want to logout?")) return;

    localStorage.clear();

    window.location.href = "login.html";

}