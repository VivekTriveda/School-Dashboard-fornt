const table = document.getElementById("bookTable");

const schoolId = localStorage.getItem("schoolId");

async function loadBooks(){

    const res = await fetch(`/api/books/${schoolId}`);

    const books = await res.json();

    table.innerHTML = "";

    books.forEach(book=>{

        table.innerHTML += `

        <tr>

            <td>${book.fileName}</td>

            <td>${book.className}</td>

            <td>${book.subject}</td>

            <td>${book.totalQuestions}</td>

            <td>${book.status}</td>

            <td>

                ${
                    book.status==="Completed"

                    ?

                    `<button class="delete"
                    onclick="deleteBook('${book._id}')">
                    Delete
                    </button>`

                    :

                    `<button class="resume"
                    onclick="resumeBook('${book._id}')">
                    Resume
                    </button>

                    <button class="delete"
                    onclick="deleteBook('${book._id}')">
                    Delete
                    </button>`
                }

            </td>

        </tr>

        `;

    });

}

async function deleteBook(id){

    if(!confirm("Delete this book?")) return;

    await fetch(`/api/books/${id}`,{

        method:"DELETE"

    });

    loadBooks();

}

function resumeBook(id){

    location.href=`process-book.html?id=${id}`;

}

loadBooks();