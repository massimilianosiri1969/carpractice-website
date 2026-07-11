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

  const workflow = document.querySelector(".workflow-track");
  if (workflow) {
    const workflowObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        workflow.classList.add("in-view");
        const steps = [...workflow.querySelectorAll(".workflow-step")];
        steps.forEach((step, index) => {
          window.setTimeout(() => step.classList.add("active"), 160 * index);
        });
        workflowObserver.disconnect();
      }
    }, { threshold: 0.35 });
    workflowObserver.observe(workflow);
  }

  const screenImage = document.getElementById("deviceScreen");
  const screenLoading = document.getElementById("deviceLoading");
  const screenButtons = [...document.querySelectorAll(".screen-picker [role='tab']")];

  function activateScreen(button, moveFocus = false) {
    if (!screenImage || !button) return;

    const nextSource = button.dataset.screen;
    const nextAlt = button.dataset.alt || "Anteprima CarPractice";
    if (!nextSource) return;

    screenButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
    });

    if (moveFocus) button.focus();

    if (screenImage.getAttribute("src") === nextSource) {
      screenImage.alt = nextAlt;
      return;
    }

    screenImage.classList.add("switching");
    screenLoading?.classList.add("visible");

    const preload = new Image();
    preload.onload = () => {
      screenImage.src = nextSource;
      screenImage.alt = nextAlt;
      requestAnimationFrame(() => {
        screenImage.classList.remove("switching");
        screenLoading?.classList.remove("visible");
      });
    };
    preload.onerror = () => {
      screenImage.classList.remove("switching");
      screenLoading?.classList.remove("visible");
      console.error(`Impossibile caricare la schermata: ${nextSource}`);
    };
    preload.src = nextSource;
  }

  screenButtons.forEach((button, index) => {
    button.addEventListener("click", () => activateScreen(button));

    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % screenButtons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + screenButtons.length) % screenButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = screenButtons.length - 1;

      activateScreen(screenButtons[nextIndex], true);
    });
  });

  if (screenButtons.length) {
    activateScreen(screenButtons.find((button) => button.classList.contains("active")) || screenButtons[0]);
  }


  const heroModel = document.querySelector(".hero-car");
  if (heroModel) {
    heroModel.addEventListener("load", () => {
      heroModel.setAttribute("auto-rotate", "");
      heroModel.setAttribute("rotation-per-second", "6deg");
    });
  }
})();