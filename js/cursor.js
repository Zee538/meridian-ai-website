(function () {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let visible = false;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");
    }
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  window.addEventListener("mouseleave", () => {
    visible = false;
    dot.classList.add("is-hidden");
    ring.classList.add("is-hidden");
  });

  function tick() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const hoverables = document.querySelectorAll("[data-cursor-hover]");
  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.classList.add("is-hover");
      const text = el.getAttribute("data-cursor-text");
      if (text) ring.setAttribute("data-text", text);
    });
    el.addEventListener("mouseleave", () => {
      ring.classList.remove("is-hover");
      ring.removeAttribute("data-text");
    });
  });
})();
