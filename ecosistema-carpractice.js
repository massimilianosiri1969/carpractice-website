(() => {
  const moduleData = {
    "ricerca-targa": {
      title: "Ricerca Targa",
      status: "Disponibile",
      description: "Avvia la pratica identificando il veicolo dalla targa e recuperando i dati tecnici necessari.",
      features: ["Identificazione veicolo", "Dati tecnici", "Collegamento alla pratica"],
      action: "https://app.carpractice.it"
    },
    "pratiche": {
      title: "Gestione Pratiche",
      status: "Disponibile",
      description: "Un unico dossier digitale per cliente, veicolo, fotografie, documenti e lavorazione.",
      features: ["Timeline pratica", "Dossier completo", "Stato lavorazione"],
      action: "scopri-carpractice.html"
    },
    "danni-3d": {
      title: "Danni 3D",
      status: "Disponibile",
      description: "Seleziona visivamente le parti del veicolo e assegna difficoltà e tipo di intervento.",
      features: ["Modello 3D", "Selezione parti", "Classificazione danno"],
      action: "scopri-carpractice.html"
    },
    "foto-documenti": {
      title: "Foto e Documenti",
      status: "Disponibile",
      description: "Organizza immagini, libretto, polizza, CID e allegati nella pratica corretta.",
      features: ["Foto per fase", "Archivio documenti", "OCR e classificazione"],
      action: "scopri-carpractice.html"
    },
    "club": {
      title: "CarPractice Club",
      status: "Disponibile",
      description: "Presenta nuove carrozzerie, segui le attivazioni e ottieni crediti.",
      features: ["Referral", "Pass personale", "Livelli e premi"],
      action: "club-carpractice.html"
    },
    "ai-assistant": {
      title: "AI Assistant",
      status: "In sviluppo",
      description: "Un assistente operativo per cercare informazioni, interpretare dati e suggerire azioni.",
      features: ["Supporto pratiche", "Ricerca intelligente", "Suggerimenti operativi"],
      action: "https://app.carpractice.it"
    },
    "business-intelligence": {
      title: "Business Intelligence",
      status: "In sviluppo",
      description: "Dashboard evolute per comprendere produttività, fatturato, tempi e marginalità.",
      features: ["KPI operativi", "Analisi performance", "Report personalizzati"],
      action: "https://app.carpractice.it"
    },
    "magazzino": {
      title: "Magazzino",
      status: "In sviluppo",
      description: "Gestione di ricambi e materiali collegata direttamente alle pratiche.",
      features: ["Scorte", "Soglie", "Riordini"],
      action: "https://app.carpractice.it"
    },
    "app-mobile": {
      title: "App Mobile",
      status: "Roadmap",
      description: "Foto, aggiornamenti, notifiche e attività operative direttamente da smartphone.",
      features: ["iOS", "Android", "Notifiche"],
      action: "https://app.carpractice.it"
    },
    "centralino-ai": {
      title: "Centralino AI",
      status: "Roadmap",
      description: "Gestione automatica delle chiamate con comprensione delle richieste e instradamento.",
      features: ["Voce AI", "Prenotazioni", "Aggiornamenti automatici"],
      action: "https://app.carpractice.it"
    },
    "preventivatore-ai": {
      title: "Preventivatore AI",
      status: "Roadmap",
      description: "Supporto alla creazione del preventivo partendo da fotografie e danni rilevati.",
      features: ["Analisi immagini", "Suggerimenti", "Preventivi assistiti"],
      action: "https://app.carpractice.it"
    },
    "crm-evoluto": {
      title: "CRM Evoluto",
      status: "Roadmap",
      description: "Follow-up, comunicazioni e relazione cliente dopo la consegna.",
      features: ["Comunicazioni", "Promemoria", "Marketing"],
      action: "https://app.carpractice.it"
    }
  };

  const revealNodes = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add("in-view"), delay);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.13 });

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

  const modal = document.getElementById("moduleModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalStatus = document.getElementById("modalStatus");
  const modalDescription = document.getElementById("modalDescription");
  const modalFeatures = document.getElementById("modalFeatures");
  const modalAction = document.getElementById("modalAction");

  function openModal(id) {
    const data = moduleData[id];
    if (!data || !modal) return;

    modalTitle.textContent = data.title;
    modalStatus.textContent = data.status;
    modalDescription.textContent = data.description;
    modalFeatures.innerHTML = data.features.map((feature) => `<li>${feature}</li>`).join("");
    modalAction.href = data.action;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close")?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
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

  document.querySelectorAll(".vote-row button").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".vote-row");
      const count = row?.querySelector(".vote-count");
      if (!count) return;

      count.textContent = String(Number(count.textContent) + 1);
      button.textContent = "Grazie";
      button.disabled = true;
    });
  });
})();