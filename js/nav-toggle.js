(function () {
  var nav = document.getElementById("top");
  var btn = document.getElementById("menuBtn");
  if (!nav || !btn) return;

  function setOpen(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  btn.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
  [].forEach.call(nav.querySelectorAll(".links a"), function (a) {
    a.addEventListener("click", function () { setOpen(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  window.matchMedia("(min-width: 1001px)").addEventListener("change", function (e) { if (e.matches) setOpen(false); });
})();
