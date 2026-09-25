(function () {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  items.forEach((el) => {
    const delay = el.getAttribute("data-reveal-delay");
    if (delay) el.style.setProperty("--reveal-delay", delay);
  });

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => observer.observe(el));
})();
