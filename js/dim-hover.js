(function () {
  const grid = document.querySelector(".mh-who-grid");
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll(".mh-who-card"));

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      grid.classList.add("is-active");
      cards.forEach((c) => c.classList.toggle("is-focused", c === card));
    });
  });

  grid.addEventListener("mouseleave", () => {
    grid.classList.remove("is-active");
    cards.forEach((c) => c.classList.remove("is-focused"));
  });
})();
