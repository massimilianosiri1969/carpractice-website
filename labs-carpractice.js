(() => {
  const boot = document.getElementById("bootScreen");
  const bootText = document.getElementById("bootText");
  const bootMessages = ["INITIALIZING LAB...","CONNECTING SYSTEMS...","LAB ONLINE"];
  let bootIndex = 0;
  const bootTimer = setInterval(() => {
    bootIndex += 1;
    if (bootIndex < bootMessages.length) {
      bootText.textContent = bootMessages[bootIndex];
    } else {
      clearInterval(bootTimer);
      setTimeout(() => boot.classList.add("done"), 350);
    }
  }, 580);

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add("in-view"), Number(entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.13 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  document.querySelectorAll("[data-counter]").forEach(el => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const target = Number(el.dataset.counter);
      const start = performance.now();
      const duration = 1100;
      const tick = now => {
        const p = Math.min(1, (now - start) / duration);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    });
    observer.observe(el);
  });

  const canvas = document.getElementById("networkCanvas");
  const ctx = canvas.getContext("2d");
  let nodes = [];

  function resizeNetwork() {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    nodes = Array.from({ length: width < 700 ? 24 : 46 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16
    }));
  }

  function drawNetwork() {
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    ctx.clearRect(0, 0, width, height);

    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 170) {
          ctx.strokeStyle = `rgba(255,106,0,${(1 - distance / 170) * 0.17})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(node => {
      ctx.fillStyle = "rgba(255,140,70,.48)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(drawNetwork);
  }

  resizeNetwork();
  drawNetwork();
  addEventListener("resize", resizeNetwork);

  const projectData = {
    "ai-damage": {
      badge: "Prototype",
      title: "AI Damage Detection",
      text: "Analizza immagini e video per riconoscere automaticamente le aree danneggiate e suggerire la classificazione.",
      metrics: ["82% sviluppo", "120k immagini", "Build 0.8.4"]
    },
    "voice-ai": {
      badge: "Alpha",
      title: "Centralino AI",
      text: "Comprende le chiamate, classifica la richiesta e la trasforma in attività operative.",
      metrics: ["46% sviluppo", "IT + EN", "Voice 0.4"]
    },
    "estimator-ai": {
      badge: "Research",
      title: "Preventivatore AI",
      text: "Combina danni, tempi e ricambi per proporre un preventivo assistito.",
      metrics: ["38% sviluppo", "Model R-12", "Training"]
    }
  };

  const modal = document.getElementById("projectModal");
  document.querySelectorAll(".project-open").forEach(button => {
    button.addEventListener("click", () => {
      const data = projectData[button.closest(".project-card").dataset.project];
      document.getElementById("modalBadge").textContent = data.badge;
      document.getElementById("modalTitle").textContent = data.title;
      document.getElementById("modalText").textContent = data.text;
      document.getElementById("modalMetrics").innerHTML = data.metrics.map(x => `<div>${x}</div>`).join("");
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
  addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  const experiments = {
    scanner: ["CONCEPT","Scanner 3D da smartphone","Rilievo rapido delle superfici attraverso fotocamera e sensori del telefono.","Concept","Acquisizione 3D"],
    ar: ["RESEARCH","Realtà aumentata","Sovrapposizione di danni, parti e istruzioni direttamente sul veicolo.","Research","Visualizzazione AR"],
    voice: ["INTERNAL","Assistente vocale","Consultazione e aggiornamento delle pratiche senza usare tastiera o mouse.","Internal","Voice workflow"],
    glasses: ["PROTOTYPE","Smart Glasses","Istruzioni contestuali e documentazione visiva durante la lavorazione.","Prototype","Assistenza visuale"],
    times: ["RESEARCH","Stima tempi AI","Previsione della durata di lavorazione e del carico operativo.","Research","Pianificazione"],
    signature: ["BETA","Firma digitale","Accettazione e autorizzazioni firmate da tablet o smartphone.","Beta","Documenti"],
    parts: ["CONCEPT","Ricambi automatici","Suggerimenti di ricambi e materiali basati sulla pratica e sui danni.","Concept","Automazione ordini"],
    api: ["INTERNAL","API pubbliche","Connessioni sicure con partner, gestionali e servizi esterni.","Internal","Integrazioni"]
  };

  const expState = document.getElementById("experimentState");
  const expTitle = document.getElementById("experimentTitle");
  const expText = document.getElementById("experimentText");
  const expPhase = document.getElementById("experimentPhase");
  const expFocus = document.getElementById("experimentFocus");

  document.querySelectorAll(".experiment-menu button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".experiment-menu button").forEach(x => x.classList.remove("active"));
      button.classList.add("active");
      const data = experiments[button.dataset.exp];

      [expState, expTitle, expText, expPhase, expFocus].forEach(el => el.classList.add("switching"));
      setTimeout(() => {
        expState.textContent = data[0];
        expTitle.textContent = data[1];
        expText.textContent = data[2];
        expPhase.textContent = data[3];
        expFocus.textContent = data[4];
        [expState, expTitle, expText, expPhase, expFocus].forEach(el => el.classList.remove("switching"));
      }, 170);
    });
  });

  document.querySelectorAll(".reactions button").forEach(button => {
    button.addEventListener("click", () => {
      const count = button.querySelector("b");
      count.textContent = String(Number(count.textContent) + 1);
      button.disabled = true;
    });
  });

  const timelineData = {
    q3: ["Q3 2026","AI Assistant","Prima release dell'assistente operativo integrato nelle pratiche."],
    q4: ["Q4 2026","Business Intelligence","Dashboard avanzate per KPI, tempi e marginalità."],
    q1: ["Q1 2027","Centralino AI","Prima beta del centralino telefonico intelligente."],
    q2: ["Q2 2027","Preventivatore AI","Test guidati del preventivo assistito da immagini e danni."],
    "q3-27": ["Q3 2027","App Mobile","Beta iOS e Android per foto, notifiche e pratiche."]
  };

  const timelineDetail = document.getElementById("timelineDetail");
  const timelineProgress = document.getElementById("timelineProgress");
  const timeNodes = [...document.querySelectorAll(".time-node")];

  timeNodes.forEach((button, index) => {
    button.addEventListener("click", () => {
      timeNodes.forEach(x => x.classList.remove("active"));
      button.classList.add("active");
      timelineProgress.style.width = `${(index / (timeNodes.length - 1)) * 100}%`;
      const data = timelineData[button.dataset.time];
      timelineDetail.innerHTML = `<small>${data[0]}</small><h3>${data[1]}</h3><p>${data[2]}</p>`;
    });
  });

  const openBeta = document.getElementById("openBetaForm");
  const betaForm = document.getElementById("betaForm");
  const terminalBody = document.getElementById("terminalBody");

  openBeta.addEventListener("click", () => {
    terminalBody.hidden = true;
    betaForm.hidden = false;
  });

  betaForm.addEventListener("submit", event => {
    event.preventDefault();
    const feedback = document.getElementById("betaFeedback");
    feedback.textContent = "Candidatura ricevuta. Ti ricontatteremo per i prossimi test.";
    feedback.style.color = "#82f29c";
    betaForm.reset();
  });
})();