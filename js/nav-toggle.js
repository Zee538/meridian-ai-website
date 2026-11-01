(function () {
  const nav = document.querySelector(".mh-nav");
  const btn = nav && nav.querySelector(".mh-nav-toggle");
  if (!btn) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  btn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".mh-nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();
