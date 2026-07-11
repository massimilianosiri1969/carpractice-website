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

  const tabs = [...document.querySelectorAll(".share-tabs [role='tab']")];
  const panels = [...document.querySelectorAll(".share-panel")];

  function activateShare(type, focus = false) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.share === type;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });

    panels.forEach((panel) => {
      const selected = panel.dataset.panel === type;
      panel.hidden = !selected;
      panel.classList.toggle("active", selected);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateShare(tab.dataset.share));

    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;

      activateShare(tabs[nextIndex].dataset.share, true);
    });
  });

  const copyButton = document.querySelector(".copy-demo");
  const copyFeedback = document.querySelector(".copy-feedback");

  copyButton?.addEventListener("click", async () => {
    const code = copyButton.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(code);
      copyFeedback.textContent = "Codice copiato.";
      window.setTimeout(() => copyFeedback.textContent = "", 2200);
    } catch {
      copyFeedback.textContent = `Codice: ${code}`;
    }
  });
})();