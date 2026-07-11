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
  const screenButtons = [...document.querySelectorAll(".screen-picker button")];

  function selectScreen(button) {
    if (!screenImage || !button) return;
    const next = button.dataset.screen;
    if (!next || screenImage.getAttribute("src") === next) return;

    screenButtons.forEach((item) => item.classList.toggle("active", item === button));
    screenImage.classList.add("switching");

    window.setTimeout(() => {
      screenImage.src = next;
      screenImage.onload = () => screenImage.classList.remove("switching");
    }, 180);
  }

  screenButtons.forEach((button) => {
    button.addEventListener("click", () => selectScreen(button));
  });

  let autoIndex = 0;
  let autoTimer = null;

  function startAutoScreens() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearInterval(autoTimer);
    autoTimer = window.setInterval(() => {
      autoIndex = (autoIndex + 1) % screenButtons.length;
      selectScreen(screenButtons[autoIndex]);
    }, 4200);
  }

  if (screenButtons.length) {
    startAutoScreens();
    document.querySelector(".device-stage")?.addEventListener("mouseenter", () => clearInterval(autoTimer));
    document.querySelector(".device-stage")?.addEventListener("mouseleave", startAutoScreens);
  }

  const heroModel = document.querySelector(".hero-car");
  if (heroModel) {
    heroModel.addEventListener("load", () => {
      heroModel.setAttribute("auto-rotate", "");
      heroModel.setAttribute("rotation-per-second", "6deg");
    });
  }
})();