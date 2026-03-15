const slides = [...document.querySelectorAll(".slide")];
const dotNav = document.getElementById("dotNav");
const progressFill = document.getElementById("progressFill");
const sectionLabel = document.getElementById("sectionLabel");
const overview = document.getElementById("overview");
const overviewGrid = document.getElementById("overviewGrid");
const overviewButton = document.getElementById("overviewButton");
const closeOverview = document.getElementById("closeOverview");
const jumpButtons = [...document.querySelectorAll("[data-jump]")];
const pulseTransition = document.getElementById("pulseTransition");

const panelTrack = document.querySelector("[data-panel-track]");
const panels = panelTrack ? [...panelTrack.querySelectorAll(".panel")] : [];
const panelDots = document.getElementById("panelDots");
const panelPrev = document.getElementById("panelPrev");
const panelNext = document.getElementById("panelNext");

const dutySlider = document.getElementById("dutySlider");
const ledDutyReadout = document.getElementById("ledDutyReadout");
const avgVoltageReadout = document.getElementById("avgVoltageReadout");
const opticalReadout = document.getElementById("opticalReadout");

let currentSlide = 0;
let currentPanel = 0;
let wheelLock = false;
let pulseTimer;

function renderDots() {
  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Go to ${slide.dataset.title}`);
    button.addEventListener("click", () => goToSlide(index));
    dotNav.appendChild(button);

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "overview-tile";
    tile.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${slide.dataset.title}</strong>`;
    tile.addEventListener("click", () => {
      goToSlide(index);
      toggleOverview(false);
    });
    overviewGrid.appendChild(tile);
  });
}

function renderPanelDots() {
  if (!panelDots) {
    return;
  }

  panels.forEach((panel, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Show ${panel.dataset.panelTitle}`);
    button.addEventListener("click", () => goToPanel(index));
    panelDots.appendChild(button);
  });
}

function updateSlideState() {
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentSlide);
  });

  [...dotNav.children].forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });

  const pct = ((currentSlide + 1) / slides.length) * 100;
  progressFill.style.height = `${pct}%`;
  sectionLabel.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${slides[currentSlide].dataset.title}`;
}

function playPulseTransition() {
  if (!pulseTransition) {
    return;
  }

  pulseTransition.classList.remove("active");
  window.clearTimeout(pulseTimer);

  window.requestAnimationFrame(() => {
    pulseTransition.classList.add("active");
    pulseTimer = window.setTimeout(() => {
      pulseTransition.classList.remove("active");
    }, 700);
  });
}

function updatePanelState() {
  if (!panelTrack) {
    return;
  }

  panelTrack.style.transform = `translateX(-${currentPanel * 100}%)`;
  panels.forEach((panel, index) => {
    panel.classList.toggle("active", index === currentPanel);
  });

  [...panelDots.children].forEach((dot, index) => {
    dot.classList.toggle("active", index === currentPanel);
  });
}

function goToSlide(index) {
  const next = Math.max(0, Math.min(index, slides.length - 1));
  if (next === currentSlide) {
    return;
  }

  playPulseTransition();
  currentSlide = next;
  updateSlideState();
}

function goToPanel(index) {
  if (!panels.length) {
    return;
  }

  const next = Math.max(0, Math.min(index, panels.length - 1));
  currentPanel = next;
  updatePanelState();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function nextPanel() {
  if (currentPanel >= panels.length - 1) {
    return false;
  }

  goToPanel(currentPanel + 1);
  return true;
}

function prevPanel() {
  if (currentPanel <= 0) {
    return false;
  }

  goToPanel(currentPanel - 1);
  return true;
}

function toggleOverview(forceState) {
  const shouldShow = typeof forceState === "boolean"
    ? forceState
    : overview.classList.contains("hidden");

  overview.classList.toggle("hidden", !shouldShow);
  overview.setAttribute("aria-hidden", String(!shouldShow));
}

function updateLedDemo(value) {
  const duty = Number(value);
  const avgVoltage = (12 * duty) / 100;
  const powerLevel = duty / 100;

  document.documentElement.style.setProperty("--page-power", powerLevel.toFixed(2));

  if (ledDutyReadout) {
    ledDutyReadout.textContent = `${duty}%`;
  }

  if (avgVoltageReadout) {
    avgVoltageReadout.textContent = `${avgVoltage.toFixed(2)} V`;
  }

  if (opticalReadout) {
    let label = "Low";
    if (duty >= 85) {
      label = "Near-max";
    } else if (duty >= 60) {
      label = "High";
    } else if (duty >= 35) {
      label = "Medium-high";
    } else if (duty >= 15) {
      label = "Medium-low";
    }
    opticalReadout.textContent = label;
  }
}

function activeSlideHasPanels() {
  return slides[currentSlide]?.classList.contains("has-panels");
}

document.addEventListener("keydown", (event) => {
  if (!overview.classList.contains("hidden") && event.key !== "Escape") {
    return;
  }

  switch (event.key) {
    case "ArrowDown":
    case "PageDown":
      nextSlide();
      break;
    case "ArrowUp":
    case "PageUp":
      prevSlide();
      break;
    case "ArrowRight":
      if (activeSlideHasPanels()) {
        if (!nextPanel()) {
          nextSlide();
        }
      } else {
        nextSlide();
      }
      break;
    case "ArrowLeft":
      if (activeSlideHasPanels()) {
        if (!prevPanel()) {
          prevSlide();
        }
      } else {
        prevSlide();
      }
      break;
    case "o":
    case "O":
      toggleOverview();
      break;
    case "Escape":
      toggleOverview(false);
      break;
    default:
      break;
  }
});

document.addEventListener(
  "wheel",
  (event) => {
    if (window.innerWidth <= 980 || wheelLock || !overview.classList.contains("hidden")) {
      return;
    }

    wheelLock = true;
    window.setTimeout(() => {
      wheelLock = false;
    }, 600);

    if (Math.abs(event.deltaY) < 12) {
      return;
    }

    if (event.deltaY > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  },
  { passive: true }
);

panelPrev?.addEventListener("click", prevPanel);
panelNext?.addEventListener("click", nextPanel);
overviewButton?.addEventListener("click", () => toggleOverview(true));
closeOverview?.addEventListener("click", () => toggleOverview(false));
dutySlider?.addEventListener("input", (event) => {
  updateLedDemo(event.target.value);
});

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = Number(button.dataset.jump);
    if (!Number.isNaN(target)) {
      goToSlide(target);
    }
  });
});

renderDots();
renderPanelDots();
updateSlideState();
updatePanelState();
updateLedDemo(dutySlider?.value ?? 55);
