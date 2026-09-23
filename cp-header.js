document.addEventListener("DOMContentLoaded",()=>{
 const n=document.getElementById("cpNav"),b=document.getElementById("cpMenuToggle");
 if(n){
  const here=(location.pathname.split("/").pop()||"index.html");
  const items=[
   ["scopri-carpractice.html","Scopri<br>CarPractice","M3 14h18M5 14l1-5h12l1 5M7 14v3m10-3v3M8 9l2-3h4l2 3"],
   ["perche-carpractice.html","Perché<br>CarPractice","M12 2l3 3 4 .5.5 4 2.5 2.5-2.5 2.5-.5 4-4 .5-3 3-3-3-4-.5-.5-4L2 12l2.5-2.5.5-4L9 5l3-3z"],
   ["ecosistema-carpractice.html","Ecosistema","M4 12h16M12 4v16M6 6l12 12M18 6L6 18"],
   ["funzionalita.html","Funzionalità","M5 5h14v14H5zM8 9h8M8 13h8"],
   ["prezzi.html","Prezzi","M3 12V5a2 2 0 012-2h7l9 9-9 9-9-9z"],
   ["index.html#contatti","Contatti","M2 5h20v14H2zM3 7l9 6 9-6"]
  ];
  n.innerHTML=items.map(([href,label,path])=>`<a class="cp-nav-item ${here===href.split("#")[0]?"active":""}" href="${href}"><svg viewBox="0 0 24 24"><path d="${path}"/></svg><span>${label}</span></a>`).join("");
 }
 document.querySelectorAll(".cp-login").forEach(a=>a.href="https://app.carpractice.it/accesso");
 document.querySelectorAll(".cp-trial").forEach(a=>a.href="prova.html");
 if(b&&n)b.addEventListener("click",()=>n.classList.toggle("open"));
 n?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>n.classList.remove("open")));
});