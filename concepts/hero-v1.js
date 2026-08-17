const root = document.documentElement;

window.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  root.style.setProperty("--pointer-x", x.toFixed(3));
  root.style.setProperty("--pointer-y", y.toFixed(3));
});
