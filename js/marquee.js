(function () {
  const marquee = document.querySelector(".mh-marquee");
  if (!marquee) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const track = marquee.querySelector(".mh-marquee-track");
  const group = track.querySelector(".mh-marquee-group");
  const SPEED = 55;

  function build() {
    track.querySelectorAll(".mh-marquee-clone").forEach((el) => el.remove());

    const groupWidth = group.getBoundingClientRect().width;
    if (!groupWidth) return;

    const copies = Math.ceil(marquee.clientWidth / groupWidth) + 1;
    for (let i = 0; i < copies; i++) {
      const clone = group.cloneNode(true);
      clone.classList.add("mh-marquee-clone");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }

    marquee.style.setProperty("--shift", groupWidth + "px");
    marquee.style.setProperty("--dur", groupWidth / SPEED + "s");
    marquee.classList.add("is-running");
  }

  build();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
})();
