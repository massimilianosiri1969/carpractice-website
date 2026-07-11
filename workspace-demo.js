(() => {
  const viewMeta = {
    dashboard:["PANORAMICA","Buongiorno, Mario."],
    pratiche:["GESTIONE OPERATIVA","Pratiche"],
    clienti:["ANAGRAFICHE","Clienti"],
    veicoli:["PARCO VEICOLI","Veicoli"],
    danni:["ANALISI VISIVA","Danni 3D"],
    documenti:["ARCHIVIO DIGITALE","Documenti"],
    ai:["INTELLIGENZA OPERATIVA","AI Assistant"],
    bi:["ANALISI AZIENDALE","Business Intelligence"]
  };

  const navButtons = [...document.querySelectorAll(".side-nav button")];
  const views = [...document.querySelectorAll(".view")];
  const eyebrow = document.getElementById("viewEyebrow");
  const title = document.getElementById("viewTitle");

  function openView(name){
    navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.view === name));
    views.forEach(view => view.classList.toggle("active", view.id === `view-${name}`));
    eyebrow.textContent = viewMeta[name][0];
    title.textContent = viewMeta[name][1];
    document.querySelector(".workspace").scrollTop = 0;
    if(name === "dashboard") animateCounters();
  }

  navButtons.forEach(btn => btn.addEventListener("click", () => openView(btn.dataset.view)));
  document.querySelectorAll("[data-jump]").forEach(btn => btn.addEventListener("click", () => openView(btn.dataset.jump)));

  function animateCounters(){
    document.querySelectorAll("[data-count]").forEach(el => {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 700;
      const tick = now => {
        const p = Math.min(1,(now-start)/duration);
        el.textContent = Math.round(target*(1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
  animateCounters();

  const customers = {
    mario:{avatar:"MB",name:"Mario Bianchi",meta:"Cliente dal 2023 · Privato",email:"mario.bianchi@email.it",phone:"+39 333 456 7890",vehicles:"2",jobs:"3"},
    laura:{avatar:"LC",name:"Laura Conti",meta:"Cliente dal 2026 · Privato",email:"laura.conti@email.it",phone:"+39 347 555 0192",vehicles:"1",jobs:"1"},
    andrea:{avatar:"AF",name:"Andrea Ferri",meta:"Cliente dal 2021 · Azienda",email:"amministrazione@ferrisrl.it",phone:"+39 0187 462 112",vehicles:"3",jobs:"5"}
  };

  document.querySelectorAll(".customer").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".customer").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const c = customers[btn.dataset.customer];
    document.getElementById("customerAvatar").textContent = c.avatar;
    document.getElementById("customerName").textContent = c.name;
    document.getElementById("customerMeta").textContent = c.meta;
    document.getElementById("customerEmail").textContent = c.email;
    document.getElementById("customerPhone").textContent = c.phone;
    document.getElementById("customerVehicles").textContent = c.vehicles;
    document.getElementById("customerJobs").textContent = c.jobs;
  }));

  document.querySelectorAll(".damage-marker").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".damage-marker").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("damagePart").textContent = btn.dataset.part;
    document.querySelectorAll(".severity-buttons button").forEach(x => x.classList.toggle("active", x.textContent === btn.dataset.level));
  }));

  document.querySelectorAll(".severity-buttons button").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".severity-buttons button").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
  }));

  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatForm = document.getElementById("chatForm");

  const aiReplies = {
    "Prepara una prima stima":"Ho preparato una prima stima: 7,2 ore di carrozzeria, 3,4 ore di verniciatura e possibile sostituzione del fanale destro.",
    "Quali ricambi potrebbero servire?":"Possibili ricambi: fanale anteriore destro, staffa paraurti e modanatura parafango. Verifica disponibilità prima dell'ordine.",
    "Riepiloga la pratica":"Pratica CP-2026-0127: Fiat Grande Panda, 3 danni rilevati, 12 foto, 8 documenti e consegna prevista il 14 luglio."
  };

  function appendMessage(text, type){
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function askAI(text){
    appendMessage(text,"user");
    const loading = document.createElement("div");
    loading.className = "message assistant";
    loading.innerHTML = "<p>Analisi in corso…</p>";
    chatMessages.appendChild(loading);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(() => {
      loading.innerHTML = `<p>${aiReplies[text] || "Ho verificato la pratica. Posso aiutarti con danni, ricambi, documenti, stato lavorazione e stima delle attività."}</p>`;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },700);
  }

  document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click", () => askAI(btn.dataset.prompt)));
  chatForm.addEventListener("submit", e => {
    e.preventDefault();
    const value = chatInput.value.trim();
    if(!value) return;
    chatInput.value = "";
    askAI(value);
  });

  const tourSteps = [
    ["dashboard","Arriva il cliente","La targa identifica il veicolo e crea automaticamente la pratica."],
    ["documenti","Documenti acquisiti","Libretto, polizza e CID vengono archiviati e classificati."],
    ["danni","Danni rilevati","Il veicolo 3D organizza le zone danneggiate e la gravità."],
    ["ai","AI Assistant","L'assistente suggerisce lavorazioni, ricambi e riepiloghi."],
    ["bi","Controllo aziendale","La direzione verifica tempi, margini e performance."]
  ];

  let tourIndex = 0;
  const overlay = document.getElementById("tourOverlay");
  const tourTitle = document.getElementById("tourTitle");
  const tourText = document.getElementById("tourText");
  const tourStep = document.getElementById("tourStep");
  const tourProgress = document.getElementById("tourProgress");
  const tourNext = document.getElementById("tourNext");

  function showTourStep(){
    const [view,heading,text] = tourSteps[tourIndex];
    openView(view);
    tourTitle.textContent = heading;
    tourText.textContent = text;
    tourStep.textContent = `${tourIndex+1} / ${tourSteps.length}`;
    tourProgress.style.width = `${((tourIndex+1)/tourSteps.length)*100}%`;
    tourNext.textContent = tourIndex === tourSteps.length-1 ? "Fine" : "Continua";
  }

  document.getElementById("demoTourButton").addEventListener("click", () => {
    tourIndex = 0;
    overlay.hidden = false;
    showTourStep();
  });

  tourNext.addEventListener("click", () => {
    if(tourIndex === tourSteps.length-1){
      overlay.hidden = true;
      return;
    }
    tourIndex++;
    showTourStep();
  });

  document.getElementById("tourClose").addEventListener("click", () => overlay.hidden = true);
})();