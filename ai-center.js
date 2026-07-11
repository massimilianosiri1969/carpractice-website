(() => {
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatForm = document.getElementById("chatForm");
  const confidenceValue = document.getElementById("confidenceValue");
  const confidenceBar = document.getElementById("confidenceBar");
  const aiStatus = document.getElementById("aiStatus");
  const visionStatus = document.getElementById("visionStatus");
  const visionModel = document.getElementById("visionModel");
  const contextModel = document.getElementById("contextModel");

  const replies = {
    "Analizza le foto": {
      text: "Ho rianalizzato le 12 fotografie. Confermo tre aree danneggiate: paraurti anteriore, parafango destro e fanale destro.",
      confidence: 98.1,
      action: "damage"
    },
    "Quali ricambi servono?": {
      text: "Ricambi suggeriti: fanale anteriore destro, staffa paraurti, modanatura parafango e kit fissaggio.",
      confidence: 94.6,
      action: "parts"
    },
    "Prepara il preventivo": {
      text: "Preventivo preliminare generato: 7,2 ore di lavorazione e totale stimato di € 895.",
      confidence: 96.2,
      action: "estimate"
    },
    "Il cliente vuole ritirare l'auto domani": {
      text: "È possibile, ma serve anticipare verniciatura, lucidatura e controllo finale. Tempo residuo stimato: 6 ore.",
      confidence: 92.8,
      action: "delivery"
    }
  };

  function appendMessage(text, type) {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setConfidence(value) {
    confidenceValue.textContent = `${String(value).replace(".", ",")}%`;
    confidenceBar.style.width = `${value}%`;
  }

  function activateWorkflow(step) {
    const steps = [...document.querySelectorAll(".workflow-step")];
    const order = ["practice","vehicle","photos","ai","estimate","signature","invoice"];
    const index = order.indexOf(step);

    steps.forEach((el, i) => {
      el.classList.remove("active");
      if (i <= index) {
        el.classList.add("complete");
        el.querySelector("b").textContent = "✓";
      }
    });

    if (index + 1 < steps.length) {
      steps[index + 1].classList.add("active");
      steps[index + 1].querySelector("b").textContent = "•••";
    }
  }

  function openOutput(name) {
    document.querySelectorAll(".output-tabs button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.output === name);
    });
    document.querySelectorAll(".output-view").forEach(view => {
      view.classList.toggle("active", view.id === `output-${name}`);
    });
  }

  function addLog(title, text, done = true) {
    const log = document.getElementById("aiLog");
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const div = document.createElement("div");
    div.innerHTML = `<b>${time}</b><span></span><p><strong>${title}</strong><small>${text}</small></p><i>${done ? "✓" : "•••"}</i>`;
    log.appendChild(div);
  }

  function processPrompt(text) {
    appendMessage(text, "user");
    aiStatus.textContent = "Elaborazione in corso";
    const loading = document.createElement("div");
    loading.className = "message assistant";
    loading.innerHTML = "<p>Sto elaborando i dati della pratica…</p>";
    chatMessages.appendChild(loading);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const response = replies[text] || {
      text: "Ho verificato la pratica. Posso aiutarti con danni, ricambi, documenti, tempi, preventivo e consegna.",
      confidence: 93.4,
      action: "generic"
    };

    setTimeout(() => {
      loading.innerHTML = `<p>${response.text}</p>`;
      aiStatus.textContent = "Analisi completata";
      setConfidence(response.confidence);

      if (response.action === "damage") {
        visionStatus.textContent = "3 anomalie confermate";
        addLog("AI Vision","Analisi immagini completata");
        visionModel.setAttribute("camera-orbit","-18deg 64deg 6.8m");
        contextModel.setAttribute("camera-orbit","-18deg 64deg 7.5m");
      }

      if (response.action === "parts") {
        openOutput("parts");
        addLog("Parts Intelligence","4 ricambi compatibili trovati");
        activateWorkflow("ai");
      }

      if (response.action === "estimate") {
        openOutput("estimate");
        addLog("Estimate Engine","Preventivo preliminare generato");
        activateWorkflow("estimate");
      }

      if (response.action === "delivery") {
        addLog("Planning Engine","Consegna anticipata verificata");
        activateWorkflow("signature");
      }

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);
  }

  document.querySelectorAll("[data-prompt]").forEach(btn => {
    btn.addEventListener("click", () => processPrompt(btn.dataset.prompt));
  });

  chatForm.addEventListener("submit", event => {
    event.preventDefault();
    const value = chatInput.value.trim();
    if (!value) return;
    chatInput.value = "";
    processPrompt(value);
  });

  document.querySelectorAll(".output-tabs button").forEach(btn => {
    btn.addEventListener("click", () => openOutput(btn.dataset.output));
  });

  document.querySelectorAll(".damage-marker").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".damage-marker").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("damageDetail").innerHTML = `
        <div><span>DANNO SELEZIONATO</span><strong>${btn.dataset.damage}</strong></div>
        <div><span>CONFIDENCE</span><strong>${btn.dataset.confidence}%</strong></div>
        <div><span>INTERVENTO</span><strong>${btn.dataset.damage.includes("Fanale") ? "Sostituzione" : "Riparazione media"}</strong></div>`;
      setConfidence(Number(btn.dataset.confidence));
    });
  });

  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action === "estimate") processPrompt("Prepara il preventivo");
      if (action === "parts") processPrompt("Quali ricambi servono?");
      if (action === "pdf") {
        appendMessage("Genera il PDF del preventivo", "user");
        setTimeout(() => {
          appendMessage("PDF generato e pronto per l’invio al cliente.", "assistant");
          addLog("Document Engine","PDF preventivo generato");
        }, 600);
      }
    });
  });

  document.querySelectorAll("[data-doc]").forEach(btn => {
    btn.addEventListener("click", () => {
      openOutput("ocr");
      appendMessage(`Mostrami i dati estratti da ${btn.dataset.doc}`, "user");
      setTimeout(() => {
        appendMessage(`Ho aperto i dati OCR relativi a ${btn.dataset.doc}.`, "assistant");
      }, 500);
    });
  });

  const presentationSteps = [
    ["FASE 01","Analisi delle fotografie","L’AI elabora le immagini e identifica le aree danneggiate.","damage"],
    ["FASE 02","Lettura dei documenti","OCR estrae targa, telaio, polizza e scadenze.","ocr"],
    ["FASE 03","Conferma dei danni","Paraurti, parafango e fanale vengono classificati.","damage"],
    ["FASE 04","Ricerca ricambi","Il sistema individua i componenti compatibili.","parts"],
    ["FASE 05","Generazione preventivo","Ore, materiali e importi vengono calcolati.","estimate"],
    ["FASE 06","Workflow operativo","La pratica avanza verso firma e consegna.","timeline"],
    ["FASE 07","Controllo finale","La pratica è pronta per la revisione dell’operatore.","timeline"]
  ];

  const overlay = document.getElementById("presentationOverlay");
  const stepEl = document.getElementById("presentationStep");
  const eyebrowEl = document.getElementById("presentationEyebrow");
  const titleEl = document.getElementById("presentationTitle");
  const textEl = document.getElementById("presentationText");
  const progressEl = document.getElementById("presentationProgress");
  const pauseBtn = document.getElementById("presentationPause");

  let presentationIndex = 0;
  let presentationTimer = null;
  let paused = false;

  function renderPresentation() {
    const [eyebrow,title,text,output] = presentationSteps[presentationIndex];
    stepEl.textContent = `${presentationIndex + 1} / ${presentationSteps.length}`;
    eyebrowEl.textContent = eyebrow;
    titleEl.textContent = title;
    textEl.textContent = text;
    progressEl.style.width = `${((presentationIndex + 1) / presentationSteps.length) * 100}%`;
    openOutput(output === "damage" ? "timeline" : output);

    if (output === "damage") {
      visionModel.setAttribute("camera-orbit", presentationIndex === 0 ? "-18deg 64deg 6.8m" : "-35deg 68deg 7.1m");
      visionStatus.textContent = presentationIndex === 0 ? "Analisi immagini in corso" : "3 anomalie confermate";
    }
    if (output === "parts") activateWorkflow("ai");
    if (output === "estimate") activateWorkflow("estimate");
    if (presentationIndex === 5) activateWorkflow("signature");
  }

  function nextPresentation() {
    if (paused) return;
    presentationIndex++;
    if (presentationIndex >= presentationSteps.length) {
      clearInterval(presentationTimer);
      presentationTimer = null;
      pauseBtn.textContent = "Riavvia";
      return;
    }
    renderPresentation();
  }

  document.getElementById("presentationButton").addEventListener("click", () => {
    overlay.hidden = false;
    presentationIndex = 0;
    paused = false;
    pauseBtn.textContent = "Pausa";
    renderPresentation();
    clearInterval(presentationTimer);
    presentationTimer = setInterval(nextPresentation, 3200);
  });

  pauseBtn.addEventListener("click", () => {
    if (!presentationTimer && presentationIndex >= presentationSteps.length - 1) {
      presentationIndex = 0;
      paused = false;
      pauseBtn.textContent = "Pausa";
      renderPresentation();
      presentationTimer = setInterval(nextPresentation, 3200);
      return;
    }
    paused = !paused;
    pauseBtn.textContent = paused ? "Riprendi" : "Pausa";
  });

  document.getElementById("presentationClose").addEventListener("click", () => {
    overlay.hidden = true;
    clearInterval(presentationTimer);
    presentationTimer = null;
  });
})();