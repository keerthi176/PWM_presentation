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
const mcuSimButton = document.getElementById("mcuSimButton");
const counterValue = document.getElementById("counterValue");
const compareValue = document.getElementById("compareValue");
const outputState = document.getElementById("outputState");
const counterFill = document.getElementById("counterFill");
const compareMarker = document.getElementById("compareMarker");
const wavePulse = document.getElementById("wavePulse");
const timerBlock = document.getElementById("timerBlock");
const compareBlock = document.getElementById("compareBlock");
const outputBlock = document.getElementById("outputBlock");
const signalDotA = document.getElementById("signalDotA");
const signalDotB = document.getElementById("signalDotB");

let currentSlide = 0;
let currentPanel = 0;
let wheelLock = false;
let pulseTimer;
let mcuTimer;
let mcuRunning = false;
let simulatedCount = 0;

const simulatedArr = 999;
const simulatedCcr = 250;

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

  if (slides[currentSlide]?.dataset.title === "MCU PWM Hardware" && mcuRunning) {
    stopMcuSimulation();
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

function setModuleState(activeModule) {
  [timerBlock, compareBlock, outputBlock].forEach((node) => {
    node?.classList.toggle("active", node === activeModule);
  });
}

function stopMcuSimulation() {
  window.clearInterval(mcuTimer);
  mcuRunning = false;
  simulatedCount = 0;
  if (mcuSimButton) {
    mcuSimButton.textContent = "Start PWM";
  }
  if (counterValue) {
    counterValue.textContent = "000";
  }
  if (compareValue) {
    compareValue.textContent = String(simulatedCcr);
  }
  if (outputState) {
    outputState.textContent = "LOW";
  }
  if (counterFill) {
    counterFill.style.width = "0%";
  }
  if (compareMarker) {
    compareMarker.style.left = `${(simulatedCcr / (simulatedArr + 1)) * 100}%`;
  }
  wavePulse?.classList.remove("running");
  [signalDotA, signalDotB].forEach((node) => node?.classList.remove("running"));
  setModuleState(null);
}

function stepMcuSimulation() {
  simulatedCount = (simulatedCount + 23) % (simulatedArr + 1);
  const dutyFraction = simulatedCount / (simulatedArr + 1);
  const isHigh = simulatedCount < simulatedCcr;

  if (counterValue) {
    counterValue.textContent = String(simulatedCount).padStart(3, "0");
  }
  if (compareValue) {
    compareValue.textContent = String(simulatedCcr);
  }
  if (outputState) {
    outputState.textContent = isHigh ? "HIGH" : "LOW";
  }
  if (counterFill) {
    counterFill.style.width = `${dutyFraction * 100}%`;
  }
  if (wavePulse) {
    wavePulse.style.backgroundImage = isHigh
      ? "linear-gradient(90deg, var(--accent) 0 25%, transparent 25% 100%)"
      : "linear-gradient(90deg, var(--accent-2) 0 8%, transparent 8% 100%)";
  }

  if (simulatedCount < simulatedCcr * 0.55) {
    setModuleState(timerBlock);
  } else if (simulatedCount < simulatedCcr) {
    setModuleState(compareBlock);
  } else {
    setModuleState(outputBlock);
  }
}

function toggleMcuSimulation() {
  if (!mcuSimButton) {
    return;
  }

  if (mcuRunning) {
    stopMcuSimulation();
    return;
  }

  mcuRunning = true;
  mcuSimButton.textContent = "Stop PWM";
  wavePulse?.classList.add("running");
  [signalDotA, signalDotB].forEach((node) => node?.classList.add("running"));
  if (compareMarker) {
    compareMarker.style.left = `${(simulatedCcr / (simulatedArr + 1)) * 100}%`;
  }
  stepMcuSimulation();
  mcuTimer = window.setInterval(stepMcuSimulation, 120);
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
mcuSimButton?.addEventListener("click", toggleMcuSimulation);

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
stopMcuSimulation();
