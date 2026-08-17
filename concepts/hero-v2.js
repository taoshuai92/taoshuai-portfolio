const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updatePointer(event) {
  if (reduceMotion.matches) return;

  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  root.style.setProperty("--pointer-x", x.toFixed(3));
  root.style.setProperty("--pointer-y", y.toFixed(3));
}

window.addEventListener("pointermove", updatePointer, { passive: true });
window.addEventListener("pointerleave", () => {
  root.style.setProperty("--pointer-x", "0");
  root.style.setProperty("--pointer-y", "0");
});
