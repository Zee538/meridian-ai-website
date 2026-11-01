(function () {
  const stats = document.querySelectorAll(".stat-num[data-count-to]");
  if (!stats.length) return;

  // HTML ships the real values (for no-JS and crawlers); zero them here so the count-up has somewhere to start.
  function zeroState(el) {
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    const target = parseFloat(el.getAttribute("data-count-to"));
    const zero = String(target).includes(".") ? "0.0" : "0".padStart(pad || 1, "0");
    el.textContent = prefix + zero + suffix;
  }

  function animateCount(el) {
    const target = parseFloat(el.getAttribute("data-count-to"));
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    const isDecimal = String(target).includes(".");
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      const rounded = isDecimal ? value.toFixed(1) : String(Math.round(value)).padStart(pad, "0");
      el.textContent = prefix + rounded + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    return;
  }

  stats.forEach(zeroState);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  stats.forEach((el) => observer.observe(el));
})();
