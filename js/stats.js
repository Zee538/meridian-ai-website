(function () {
  const stats = document.querySelectorAll(".stat-num[data-count-to]");
  if (!stats.length) return;

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

  if (!("IntersectionObserver" in window)) {
    stats.forEach(animateCount);
    return;
  }

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
