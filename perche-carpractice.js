(() => {
  const revealNodes = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add("in-view"), delay);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealNodes.forEach((node) => revealObserver.observe(node));

  const tabs = [...document.querySelectorAll(".comparison-tabs [role='tab']")];
  const stage = document.querySelector(".comparison-stage");
  const beforePanel = document.querySelector(".before-panel");
  const afterPanel = document.querySelector(".after-panel");

  function setComparison(mode, focus = false) {
    if (!stage || !beforePanel || !afterPanel) return;
    const showAfter = mode === "after";

    stage.dataset.current = mode;
    beforePanel.hidden = showAfter;
    afterPanel.hidden = !showAfter;

    tabs.forEach((tab) => {
      const selected = tab.dataset.mode === mode;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setComparison(tab.dataset.mode));

    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;

      setComparison(tabs[nextIndex].dataset.mode, true);
    });
  });

  const jobs = document.getElementById("jobsRange");
  const minutes = document.getElementById("minutesRange");
  const saving = document.getElementById("savingRange");

  const jobsOutput = document.getElementById("jobsOutput");
  const minutesOutput = document.getElementById("minutesOutput");
  const savingOutput = document.getElementById("savingOutput");
  const weeklyHours = document.getElementById("weeklyHours");
  const annualHours = document.getElementById("annualHours");

  const formatHours = (value) => {
    return new Intl.NumberFormat("it-IT", {
      minimumFractionDigits: value < 10 ? 1 : 0,
      maximumFractionDigits: 1
    }).format(value);
  };

  function updateEstimator() {
    if (!jobs || !minutes || !saving) return;

    const jobCount = Number(jobs.value);
    const minutesPerJob = Number(minutes.value);
    const savingRate = Number(saving.value) / 100;

    const weekly = (jobCount * minutesPerJob * savingRate) / 60;
    const annual = weekly * 48;

    jobsOutput.textContent = String(jobCount);
    minutesOutput.textContent = `${minutesPerJob} min`;
    savingOutput.textContent = `${Math.round(savingRate * 100)}%`;
    weeklyHours.textContent = `${formatHours(weekly)} ore`;
    annualHours.textContent = `${formatHours(annual)} ore`;
  }

  [jobs, minutes, saving].forEach((input) => {
    input?.addEventListener("input", updateEstimator);
  });

  updateEstimator();
})();