async function uploadAnswerSheet() {

    const paperId =
        document.getElementById("paperId").value;

    const studentName =
        document.getElementById("studentName").value;

    const rollNo =
        document.getElementById("rollNo").value;

    const file =
        document.getElementById("answerSheet").files[0];

    if (!paperId || !studentName || !rollNo || !file) {

        alert("Please fill all fields.");

        return;
    }

    const formData = new FormData();

    formData.append("paperId", paperId);

    formData.append("studentName", studentName);

    formData.append("rollNo", rollNo);
    formData.append("schoolId", localStorage.getItem("schoolId"));
    formData.append(
    "answerSheet",
    document.getElementById("answerSheet").files[0]
);

    const response = await fetch(
    "/api/evaluation/upload",
    {
        method: "POST",
        body: formData
    }
);

    if (!response.ok) {

    const text = await response.text();
    console.error(text);

    alert("Upload failed.");
    return;

}

const data = await response.json();

const status = document.getElementById("status");
status.style.display = "block";
status.innerHTML = "✅ " + data.message;
}

function logout() {

    if (!confirm("Are you sure you want to logout?")) return;

    localStorage.clear();

    window.location.href = "login.html";

}