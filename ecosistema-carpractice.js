(() => {
  const API_BASE = "https://app.carpractice.it/functions";
  const ENDPOINTS = {
    roadmap: `${API_BASE}/getPublicRoadmap`,
    vote: `${API_BASE}/voteModule`,
    suggestion: `${API_BASE}/submitFeatureSuggestion`
  };

  const FALLBACK_MODULES = [
    {slug:"ricerca-targa",nome:"Ricerca Targa",descrizione:"Identificazione istantanea del veicolo tramite scansione targa.",stato:"available",percentuale_avanzamento:100,conteggio_voti:0},
    {slug:"pratiche",nome:"Gestione Pratiche",descrizione:"Workflow completo di gestione pratiche.",stato:"available",percentuale_avanzamento:100,conteggio_voti:0},
    {slug:"danni-3d",nome:"Danni 3D",descrizione:"Mappatura dei danni su modello 3D.",stato:"available",percentuale_avanzamento:100,conteggio_voti:0},
    {slug:"foto-documenti",nome:"Foto e Documenti",descrizione:"Gestione centralizzata di fotografie e documenti.",stato:"available",percentuale_avanzamento:100,conteggio_voti:0},
    {slug:"club",nome:"CarPractice Club",descrizione:"Programma referral CarPractice.",stato:"available",percentuale_avanzamento:100,conteggio_voti:0},
    {slug:"ai-assistant",nome:"AI Assistant",descrizione:"Assistente AI integrato per supporto operativo.",stato:"developing",percentuale_avanzamento:65,conteggio_voti:0},
    {slug:"business-intelligence",nome:"Business Intelligence",descrizione:"Dashboard analitiche avanzate.",stato:"developing",percentuale_avanzamento:45,conteggio_voti:0},
    {slug:"magazzino",nome:"Magazzino",descrizione:"Gestione inventario ricambi e materiali.",stato:"developing",percentuale_avanzamento:28,conteggio_voti:0},
    {slug:"app-mobile",nome:"App Mobile",descrizione:"Applicazione iOS e Android.",stato:"roadmap",percentuale_avanzamento:0,conteggio_voti:0},
    {slug:"centralino-ai",nome:"Centralino AI",descrizione:"Centralino telefonico intelligente.",stato:"roadmap",percentuale_avanzamento:0,conteggio_voti:0},
    {slug:"preventivatore-ai",nome:"Preventivatore AI",descrizione:"Generazione automatica di preventivi.",stato:"roadmap",percentuale_avanzamento:0,conteggio_voti:0},
    {slug:"crm-evoluto",nome:"CRM Evoluto",descrizione:"Gestione relazioni cliente avanzata.",stato:"roadmap",percentuale_avanzamento:0,conteggio_voti:0}
  ];

  const STATUS_LABELS = {
    available: "Disponibile",
    developing: "In sviluppo",
    beta: "Beta",
    testing: "Testing",
    roadmap: "Roadmap",
    research: "Ricerca"
  };

  let roadmapModules = [];
  let lastFocusedElement = null;

  function createSessionId() {
    const key = "cp_ecosystem_session_id";
    let value = localStorage.getItem(key);
    if (value) return value;

    if (window.crypto?.randomUUID) {
      value = crypto.randomUUID();
    } else {
      value = `cp-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
    }
    localStorage.setItem(key, value);
    return value;
  }

  function getVotedModules() {
    try {
      return new Set(JSON.parse(localStorage.getItem("cp_voted_modules") || "[]"));
    } catch {
      return new Set();
    }
  }

  function rememberVote(slug) {
    const voted = getVotedModules();
    voted.add(slug);
    localStorage.setItem("cp_voted_modules", JSON.stringify([...voted]));
  }

  async function fetchJson(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {...options, signal: controller.signal});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.error || data.message || `Errore HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  const revealNodes = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add("in-view"), delay);
      revealObserver.unobserve(entry.target);
    });
  }, {threshold: 0.13});
  revealNodes.forEach((node) => revealObserver.observe(node));

  const filterButtons = [...document.querySelectorAll(".filters button")];
  const moduleCards = [...document.querySelectorAll(".module-card")];

  function setFilter(filter) {
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
    });

    moduleCards.forEach((card) => {
      const visible = filter === "all" || card.dataset.status === filter;
      card.classList.toggle("filtered-out", !visible);
    });
  }
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  function updateModuleCards(modules) {
    const map = new Map(modules.map((module) => [module.slug, module]));

    moduleCards.forEach((card) => {
      const module = map.get(card.dataset.slug);
      if (!module) return;

      card.dataset.status = module.stato;
      card.dataset.apiUpdated = "true";

      const status = card.querySelector(".status");
      if (status) {
        status.className = `status ${module.stato}`;
        status.textContent = STATUS_LABELS[module.stato] || module.stato;
      }

      const title = card.querySelector("h3");
      if (title) title.textContent = module.nome;

      const description = card.querySelector(":scope > p");
      if (description) description.textContent = module.descrizione;

      const progress = card.querySelector(".progress span");
      const progressLabel = card.querySelector(":scope > small");
      if (progress) progress.style.width = `${Math.max(0, Math.min(100, Number(module.percentuale_avanzamento || 0)))}%`;
      if (progressLabel) progressLabel.textContent = `Avanzamento ${module.percentuale_avanzamento || 0}%`;
    });
  }

  function getVoteEligibleModules(modules) {
    return modules.filter((module) => ["developing","beta","testing","roadmap","research"].includes(module.stato));
  }

  function renderVotes(modules) {
    const container = document.getElementById("dynamicVoteList");
    if (!container) return;

    const eligible = getVoteEligibleModules(modules);
    const maxVotes = Math.max(1, ...eligible.map((module) => Number(module.conteggio_voti || 0)));
    const voted = getVotedModules();

    if (!eligible.length) {
      container.innerHTML = '<div class="vote-error">Non ci sono moduli votabili in questo momento.</div>';
      return;
    }

    container.innerHTML = eligible.map((module, index) => {
      const count = Number(module.conteggio_voti || 0);
      const width = Math.max(4, Math.round((count / maxVotes) * 100));
      const alreadyVoted = voted.has(module.slug);

      return `
        <article class="vote-row" data-vote-id="${module.slug}">
          <div>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>${escapeHtml(module.nome)}</strong>
              <small class="vote-module-status">${escapeHtml(STATUS_LABELS[module.stato] || module.stato)}</small>
            </div>
          </div>
          <div class="vote-meter"><span style="width:${width}%"></span></div>
          <b class="vote-count">${count}</b>
          <button type="button" class="${alreadyVoted ? "voted" : ""}" ${alreadyVoted ? "disabled" : ""}>
            ${alreadyVoted ? "Votato" : "Mi interessa"}
          </button>
        </article>`;
    }).join("");

    container.querySelectorAll(".vote-row button").forEach((button) => {
      button.addEventListener("click", handleVote);
    });
  }

  async function handleVote(event) {
    const button = event.currentTarget;
    const row = button.closest(".vote-row");
    const slug = row?.dataset.voteId;
    const countElement = row?.querySelector(".vote-count");
    if (!slug || !countElement) return;

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Invio…";

    try {
      const data = await fetchJson(ENDPOINTS.vote, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          slug,
          session_id: createSessionId()
        })
      });

      countElement.textContent = String(data.conteggio_voti ?? countElement.textContent);
      button.textContent = data.already_voted ? "Già votato" : "Grazie";
      button.classList.add("voted");
      rememberVote(slug);

      const module = roadmapModules.find((item) => item.slug === slug);
      if (module) module.conteggio_voti = Number(data.conteggio_voti || module.conteggio_voti || 0);
      renderVotes(roadmapModules);
    } catch (error) {
      button.disabled = false;
      button.textContent = originalText;
      alert(error.status === 429
        ? "Hai effettuato troppi tentativi. Riprova tra poco."
        : "Non è stato possibile registrare il voto. Riprova.");
    }
  }

  async function loadRoadmap() {
    const status = document.getElementById("roadmapStatus");
    if (status) status.textContent = "Aggiornamento dati roadmap…";

    try {
      const data = await fetchJson(ENDPOINTS.roadmap, {}, 12000);
      roadmapModules = Array.isArray(data.modules) ? data.modules : [];
      if (!roadmapModules.length) throw new Error("Nessun modulo ricevuto");

      updateModuleCards(roadmapModules);
      renderVotes(roadmapModules);

      if (status) {
        status.textContent = "Roadmap aggiornata in tempo reale da CarPractice.";
        status.className = "api-status success";
      }
    } catch (error) {
      roadmapModules = FALLBACK_MODULES;
      updateModuleCards(roadmapModules);
      renderVotes(roadmapModules);

      if (status) {
        status.textContent = "Dati temporaneamente offline: vengono mostrati i valori di riserva.";
        status.className = "api-status error";
      }
      console.error("Errore caricamento roadmap:", error);
    }
  }

  const modal = document.getElementById("moduleModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalStatus = document.getElementById("modalStatus");
  const modalDescription = document.getElementById("modalDescription");
  const modalFeatures = document.getElementById("modalFeatures");
  const modalAction = document.getElementById("modalAction");

  function openModal(slug) {
    const module = roadmapModules.find((item) => item.slug === slug) || FALLBACK_MODULES.find((item) => item.slug === slug);
    if (!module || !modal) return;

    lastFocusedElement = document.activeElement;
    modalTitle.textContent = module.nome;
    modalStatus.textContent = STATUS_LABELS[module.stato] || module.stato;
    modalDescription.textContent = module.descrizione;
    modalFeatures.innerHTML = `
      <li>Stato: ${escapeHtml(STATUS_LABELS[module.stato] || module.stato)}</li>
      <li>Avanzamento: ${Number(module.percentuale_avanzamento || 0)}%</li>
      <li>Interesse registrato: ${Number(module.conteggio_voti || 0)} voti</li>`;
    modalAction.href = module.stato === "available" ? "https://app.carpractice.it" : "#roadmap";
    modalAction.textContent = module.stato === "available" ? "Apri CarPractice" : "Vedi la roadmap";

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close")?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    lastFocusedElement?.focus?.();
  }

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.module));
  });
  document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  const suggestionForm = document.getElementById("featureSuggestionForm");
  const suggestionFeedback = document.getElementById("suggestionFeedback");

  suggestionForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = suggestionForm.querySelector("button[type='submit']");
    const formData = new FormData(suggestionForm);
    const payload = Object.fromEntries(formData.entries());

    suggestionFeedback.textContent = "";
    suggestionFeedback.className = "form-feedback";
    submitButton.disabled = true;
    submitButton.firstChild.textContent = "Invio in corso ";

    try {
      await fetchJson(ENDPOINTS.suggestion, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      suggestionForm.reset();
      suggestionFeedback.textContent = "Grazie. Il suggerimento è stato inviato al team CarPractice.";
      suggestionFeedback.className = "form-feedback success";
    } catch (error) {
      suggestionFeedback.textContent = error.status === 429
        ? "Hai inviato troppi suggerimenti in poco tempo. Riprova più tardi."
        : "Non è stato possibile inviare il suggerimento. Controlla i dati e riprova.";
      suggestionFeedback.className = "form-feedback error";
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Invia il suggerimento <span aria-hidden="true">→</span>';
    }
  });

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  loadRoadmap();
})();