
  /* =========================
     PRELOADER (with min time)
  ========================= */
  const MIN_LOADING_TIME = 1700; // adjust: 1000–2000 is ideal
  const startTime = Date.now();

  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_LOADING_TIME - elapsedTime;

    setTimeout(() => {
      preloader.style.opacity = "0";

      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);

    }, remainingTime > 0 ? remainingTime : 0);
  });


  /* =========================
     PAGE FADE IN
  ========================= */
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
  });


  /* =========================
     PAGE FADE OUT ON CLICK
  ========================= */
  document.querySelectorAll("a").forEach(link => {
    const url = link.getAttribute("href");

    if (
      url &&
      !url.startsWith("#") &&
      !url.startsWith("mailto:") &&
      !url.startsWith("tel:") &&
      !link.hasAttribute("target")
    ) {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        document.body.classList.remove("loaded");
        document.body.classList.add("fade-out");

        setTimeout(() => {
          window.location.href = url;
        }, 500);
      });
    }
  });
