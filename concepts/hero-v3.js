const root = document.documentElement;
const hero = document.querySelector(".hero");
const portrait = document.querySelector(".portrait-stage img");
const lineGhost = document.querySelector(".story-line-ghost");
const lineDrawn = document.querySelector(".story-line-drawn");
const penSignal = document.querySelector(".pen-signal");
const activeProject = document.querySelector(".active-project");
const nodes = [...document.querySelectorAll(".career-node")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function toHeroPoint(rect, heroRect) {
  return {
    x: rect.left + rect.width / 2 - heroRect.left,
    y: rect.top + rect.height / 2 - heroRect.top,
  };
}

function buildPath(points) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

    const previous = points[index - 1];
    const distance = Math.max(42, Math.abs(point.x - previous.x) * 0.42);
    return `${path} C ${(previous.x + distance).toFixed(1)} ${previous.y.toFixed(1)}, ${(point.x - distance).toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, "");
}

function updateStoryLine() {
  const heroRect = hero.getBoundingClientRect();
  const portraitRect = portrait.getBoundingClientRect();
  const anchors = nodes.map((node) => toHeroPoint(node.querySelector(".node-anchor").getBoundingClientRect(), heroRect));
  const pen = {
    x: portraitRect.left + portraitRect.width * 0.175 - heroRect.left,
    y: portraitRect.top + portraitRect.height * 0.265 - heroRect.top,
  };
  const path = buildPath([...anchors, pen]);

  lineGhost.setAttribute("d", path);
  lineDrawn.setAttribute("d", path);
  penSignal.style.left = `${pen.x}px`;
  penSignal.style.top = `${pen.y}px`;
}

function updatePointer(event) {
  if (reduceMotion.matches) return;

  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;
  root.style.setProperty("--pointer-x", x.toFixed(3));
  root.style.setProperty("--pointer-y", y.toFixed(3));
}

nodes.forEach((node) => {
  node.addEventListener("pointerenter", () => {
    activeProject.innerHTML = `<span>SELECTED PATH</span>${node.dataset.project}`;
    lineDrawn.style.stroke = "var(--active)";
  });

  node.addEventListener("pointerleave", () => {
    activeProject.innerHTML = "<span>NOW</span>继续探索 AI 产品体验";
    lineDrawn.style.stroke = "";
  });
});

window.addEventListener("pointermove", updatePointer, { passive: true });
window.addEventListener("pointerleave", () => {
  root.style.setProperty("--pointer-x", "0");
  root.style.setProperty("--pointer-y", "0");
});

window.addEventListener("resize", updateStoryLine);

if (portrait.complete) {
  updateStoryLine();
} else {
  portrait.addEventListener("load", updateStoryLine, { once: true });
}

requestAnimationFrame(() => {
  updateStoryLine();
  document.body.classList.add("is-ready");
});
