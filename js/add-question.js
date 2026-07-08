const form = document.getElementById("questionForm");

const saveBtn = document.getElementById("saveBtn");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";

    const data = {

        board: document.getElementById("board").value,

        className: document.getElementById("className").value,

        subject: document.getElementById("subject").value.trim(),

        chapter: document.getElementById("chapter").value.trim(),

        question: document.getElementById("question").value.trim(),

        answer: document.getElementById("answer").value.trim(),

        type: document.getElementById("type").value,

        difficulty: document.getElementById("difficulty").value,

        marks: Number(document.getElementById("marks").value)

    };

    try {

        const res = await fetch("/api/questions/add", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(data)

        });

        const result = await res.json();

        if (res.ok) {

            showToast(result.message || "Question Added Successfully");

            form.reset();

        } else {

            showToast(result.message || "Something went wrong", true);

        }

    } catch (err) {

        console.error(err);

        showToast("Server Error", true);

    }

    saveBtn.disabled = false;

    saveBtn.innerText = "Save Question";

});

function showToast(message, error = false) {

    const toast = document.getElementById("toast");

    toast.innerText = message;

    toast.style.background = error ? "#dc2626" : "#16a34a";

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 2500);

}
function logout() {

    if (!confirm("Are you sure you want to logout?")) return;

    localStorage.clear();

    window.location.href = "index.html";

}
