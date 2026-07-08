const form=document.getElementById("uploadForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const data=new FormData(form);

const res=await fetch("/api/upload",{

method:"POST",

body:data

});

const result=await res.json();

alert(result.message);

});