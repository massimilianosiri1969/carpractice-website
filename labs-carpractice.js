(() => {
  const boot = document.getElementById("bootScreen");
  const bootText = document.getElementById("bootText");
  const bootMessages = ["INITIALIZING LAB...","CONNECTING MODULES...","LAB CONNECTED"];
  let bootIndex = 0;
  const bootTimer = setInterval(() => {
    bootIndex++;
    if (bootIndex < bootMessages.length) bootText.textContent = bootMessages[bootIndex];
    else {
      clearInterval(bootTimer);
      setTimeout(() => boot.classList.add("done"), 450);
    }
  }, 650);

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add("in-view"), Number(entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    });
  }, {threshold:.13});
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  const counters = document.querySelectorAll("[data-counter]");
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = Number(el.dataset.counter);
      const start = performance.now(), duration = 1100;
      function tick(now){
        const p = Math.min(1,(now-start)/duration);
        el.textContent = Math.round(target*(1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  });
  counters.forEach(el => counterObserver.observe(el));

  const canvas = document.getElementById("networkCanvas");
  const ctx = canvas.getContext("2d");
  let nodes = [];
  function resize(){
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = canvas.parentElement.offsetHeight * devicePixelRatio;
    canvas.style.width = innerWidth+"px";
    canvas.style.height = canvas.parentElement.offsetHeight+"px";
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    nodes = Array.from({length:42},()=>({
      x:Math.random()*innerWidth,y:Math.random()*canvas.parentElement.offsetHeight,
      vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18
    }));
  }
  function draw(){
    const h=canvas.parentElement.offsetHeight;
    ctx.clearRect(0,0,innerWidth,h);
    for(const n of nodes){n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>innerWidth)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1}
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<170){ctx.strokeStyle=`rgba(255,106,0,${(1-d/170)*.18})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
    }
    for(const n of nodes){ctx.fillStyle="rgba(255,140,70,.48)";ctx.beginPath();ctx.arc(n.x,n.y,1.7,0,Math.PI*2);ctx.fill()}
    requestAnimationFrame(draw);
  }
  resize(); draw(); addEventListener("resize",resize);

  const projectData = {
    "ai-damage": {badge:"Prototype",title:"AI Damage Detection",text:"Analizza immagini e video per riconoscere automaticamente le aree danneggiate.",metrics:["82% sviluppo","120k immagini","Build 0.8.4"]},
    "estimator-ai": {badge:"Research",title:"Preventivatore AI",text:"Combina danni, tempi e ricambi per proporre un preventivo assistito.",metrics:["38% sviluppo","Model R-12","Training"]},
    "voice-ai": {badge:"Alpha",title:"Centralino AI",text:"Comprende le chiamate e trasforma le richieste in attività operative.",metrics:["46% sviluppo","IT + EN","Voice 0.4"]}
  };
  const modal=document.getElementById("projectModal");
  document.querySelectorAll(".project-open").forEach(btn=>btn.onclick=()=>{
    const d=projectData[btn.closest(".project-card").dataset.project];
    document.getElementById("modalBadge").textContent=d.badge;
    document.getElementById("modalTitle").textContent=d.title;
    document.getElementById("modalText").textContent=d.text;
    document.getElementById("modalMetrics").innerHTML=d.metrics.map(x=>`<div>${x}</div>`).join("");
    modal.hidden=false;document.body.style.overflow="hidden";
  });
  document.querySelectorAll("[data-close]").forEach(el=>el.onclick=()=>{modal.hidden=true;document.body.style.overflow=""});
  addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden){modal.hidden=true;document.body.style.overflow=""}});

  document.querySelectorAll(".idea-note button").forEach(btn=>btn.onclick=()=>{
    const m=btn.textContent.match(/(\D+)(\d+)/); if(!m) return;
    btn.textContent=`${m[1]}${Number(m[2])+1}`; btn.disabled=true;
  });

  const timelineData={
    q3:["Q3 2026","AI Assistant","Prima release dell'assistente operativo integrato nelle pratiche."],
    q4:["Q4 2026","Business Intelligence","Dashboard avanzate per KPI, tempi e marginalità."],
    q1:["Q1 2027","Centralino AI","Prima beta del centralino telefonico intelligente."],
    q2:["Q2 2027","Preventivatore AI","Test guidati del preventivo assistito da immagini e danni."],
    "q3-27":["Q3 2027","App Mobile","Beta iOS e Android per foto, notifiche e pratiche."]
  };
  const detail=document.getElementById("timelineDetail");
  document.querySelectorAll(".time-node").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".time-node").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    const d=timelineData[btn.dataset.time];detail.innerHTML=`<small>${d[0]}</small><h3>${d[1]}</h3><p>${d[2]}</p>`;
  });

  const openBeta=document.getElementById("openBetaForm"), betaForm=document.getElementById("betaForm"), terminalBody=document.getElementById("terminalBody");
  openBeta.onclick=()=>{terminalBody.hidden=true;betaForm.hidden=false};
  betaForm.onsubmit=e=>{
    e.preventDefault();
    const feedback=document.getElementById("betaFeedback");
    feedback.textContent="Candidatura pronta. Collegare Base44 per il salvataggio reale.";
    feedback.style.color="#82f29c";
  };
})();