(function () {
  const heroScreen = document.querySelector(".hero-screen");
  const workLink = document.querySelector("[data-scroll-to-works]");
  const resumeLink = document.querySelector("[data-resume-download]");

  const scrollToWorks = () => {
    const works = document.querySelector("#works");
    if (!works) {
      return;
    }

    works.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      history.replaceState(null, "", "#works");
    } catch (error) {
      window.location.hash = "works";
    }
  };

  const downloadResume = () => {
    const resumeUrl = resumeLink ? resumeLink.getAttribute("href") : "./assets/resume/resume.pdf";
    const downloadName = resumeLink ? resumeLink.getAttribute("download") || "resume.pdf" : "resume.pdf";
    const downloadLink = document.createElement("a");

    downloadLink.href = resumeUrl;
    downloadLink.download = downloadName;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  };

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");

    if (actionTarget?.dataset.action === "works") {
      event.preventDefault();
      scrollToWorks();
      return;
    }

    if (actionTarget?.dataset.action === "resume") {
      event.preventDefault();
      downloadResume();
      return;
    }

    if (!heroScreen) {
      return;
    }

    const heroRect = heroScreen.getBoundingClientRect();
    const xPercent = ((event.clientX - heroRect.left) / heroRect.width) * 100;
    const yPercent = ((event.clientY - heroRect.top) / heroRect.height) * 100;
    const isInButtonImageRow = yPercent >= 63 && yPercent <= 83;

    if (!isInButtonImageRow) {
      return;
    }

    if (xPercent >= 7.55 && xPercent <= 26.1) {
      scrollToWorks();
      return;
    }

    if (xPercent >= 27.45 && xPercent <= 47.35) {
      downloadResume();
    }
  });
})();
