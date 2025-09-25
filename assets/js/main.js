(function () {
  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Smooth scroll for in-page links (basic, native is already smooth via CSS; this is fallback)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#" || !document.querySelector(id)) return;
      e.preventDefault();
      document
        .querySelector(id)
        .scrollIntoView({ behavior: "smooth", block: "start" });
      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Animated counters when visible
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count") || "0", 10);
    const duration = 1000;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(p * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countEls = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  countEls.forEach((el) => io.observe(el));

  // Institution finder form and filters
  const textInput = document.getElementById("find-keywords");
  const categorySelect = document.getElementById("find-category");
  const locationInput = document.getElementById("find-location");
  const searchBtn = document.getElementById("finderSearchBtn");
  const cardsWrap = document.getElementById("institutionCards");

  function matchesCard(card, q, cat, loc) {
    const name = (card.getAttribute("data-name") || "").toLowerCase();
    const category = (card.getAttribute("data-category") || "").toLowerCase();
    const city = (card.getAttribute("data-city") || "").toLowerCase();
    const qMatch = !q || name.includes(q);
    const cMatch = !cat || category === cat;
    const lMatch = !loc || city.includes(loc);
    return qMatch && cMatch && lMatch;
  }

  function applyFind() {
    const q = (textInput?.value || "").trim().toLowerCase();
    const cat = (categorySelect?.value || "").trim().toLowerCase();
    const loc = (locationInput?.value || "").trim().toLowerCase();
    const cards = cardsWrap?.querySelectorAll(".card") || [];
    cards.forEach((card) => {
      if (matchesCard(card, q, cat, loc)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  searchBtn?.addEventListener("click", applyFind);
  textInput?.addEventListener("input", (e) =>
    e.inputType === "insertReplacementText" ? applyFind() : null
  );
  categorySelect?.addEventListener("change", applyFind);
  locationInput?.addEventListener("input", applyFind);

  // Secondary filter controls
  const filterText = document.getElementById("filterText");
  const filterCategory = document.getElementById("filterCategory");
  function applySecondaryFilter() {
    const q = (filterText?.value || "").trim().toLowerCase();
    const cat = (filterCategory?.value || "").trim().toLowerCase();
    const cards = cardsWrap?.querySelectorAll(".card") || [];
    cards.forEach((card) => {
      const name = (card.getAttribute("data-name") || "").toLowerCase();
      const category = (card.getAttribute("data-category") || "").toLowerCase();
      const cond = (!q || name.includes(q)) && (!cat || category === cat);
      card.style.display = cond ? "" : "none";
    });
  }
  filterText?.addEventListener("input", applySecondaryFilter);
  filterCategory?.addEventListener("change", applySecondaryFilter);

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Prevent default submit on demo forms
  document.querySelectorAll("form").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      alert(
        "Form submission is disabled in this demo. Wire this to your backend or a service (e.g., Google Forms or Mailchimp)."
      );
    });
  });
})();
