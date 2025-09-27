(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Smooth internal links
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

  // Animated counters
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count") || "0", 10);
    const duration = 1200;
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

  // Institution finder (home)
  const textInput = document.getElementById("find-keywords");
  const categorySelect = document.getElementById("find-category");
  const locationInput = document.getElementById("find-location");
  const searchBtn = document.getElementById("finderSearchBtn");
  const cardsWrap = document.getElementById("institutionCards");
  function matchesCard(card, q, cat, loc) {
    const name = (card.getAttribute("data-name") || "").toLowerCase();
    const category = (card.getAttribute("data-category") || "").toLowerCase();
    const city = (card.getAttribute("data-city") || "").toLowerCase();
    return (
      (!q || name.includes(q)) &&
      (!cat || category === cat) &&
      (!loc || city.includes(loc))
    );
  }
  function applyFind() {
    const q = (textInput?.value || "").trim().toLowerCase();
    const cat = (categorySelect?.value || "").trim().toLowerCase();
    const loc = (locationInput?.value || "").trim().toLowerCase();
    const cards = cardsWrap?.querySelectorAll(".card") || [];
    cards.forEach((card) => {
      card.style.display = matchesCard(card, q, cat, loc) ? "" : "none";
    });
  }
  searchBtn?.addEventListener("click", applyFind);
  textInput?.addEventListener("input", applyFind);
  categorySelect?.addEventListener("change", applyFind);
  locationInput?.addEventListener("input", applyFind);

  // Institutions page secondary filters
  const filterText = document.getElementById("filterText");
  const filterCategory = document.getElementById("filterCategory");
  function applySecondaryFilter() {
    const q = (filterText?.value || "").trim().toLowerCase();
    const cat = (filterCategory?.value || "").trim().toLowerCase();
    const cards = cardsWrap?.querySelectorAll(".card") || [];
    cards.forEach((card) => {
      const name = (card.getAttribute("data-name") || "").toLowerCase();
      const category = (card.getAttribute("data-category") || "").toLowerCase();
      card.style.display =
        (!q || name.includes(q)) && (!cat || category === cat) ? "" : "none";
    });
  }
  filterText?.addEventListener("input", applySecondaryFilter);
  filterCategory?.addEventListener("change", applySecondaryFilter);

  // Event filtering
  const eventSearch = document.getElementById("eventSearch");
  const eventCategory = document.getElementById("eventCategory");
  const eventStatus = document.getElementById("eventStatus");
  const upcomingContainer = document.getElementById("upcomingEvents");
  const pastContainer = document.getElementById("pastEvents");

  function filterEvents() {
    const q = (eventSearch?.value || "").trim().toLowerCase();
    const cat = (eventCategory?.value || "").trim();
    const status = (eventStatus?.value || "").trim();
    [upcomingContainer, pastContainer].forEach((group) => {
      if (!group) return;
      group.querySelectorAll(".event").forEach((evt) => {
        const title = (evt.getAttribute("data-title") || "").toLowerCase();
        const eCat = evt.getAttribute("data-category") || "";
        const eStatus = evt.getAttribute("data-status") || "";
        const matchQ = !q || title.includes(q);
        const matchC = !cat || eCat === cat;
        const matchS = !status || eStatus === status;
        evt.style.display = matchQ && matchC && matchS ? "" : "none";
      });
    });
  }
  eventSearch?.addEventListener("input", filterEvents);
  eventCategory?.addEventListener("change", filterEvents);
  eventStatus?.addEventListener("change", filterEvents);

  // Gallery tag filtering
  const galleryTags = document.querySelectorAll("[data-gallery-filter]");
  const galleryGrid = document.getElementById("galleryGrid");
  galleryTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      const filter = tag.getAttribute("data-gallery-filter");
      galleryTags.forEach((t) => t.classList.remove("is-active"));
      tag.classList.add("is-active");
      const panels = galleryGrid?.querySelectorAll(".gallery-panel") || [];
      panels.forEach((p) => {
        const cat = p.getAttribute("data-cat");
        p.style.display = !filter || filter === cat ? "" : "none";
      });
    });
  });

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Demo forms
  document.querySelectorAll("form").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Demo only. Connect this form to backend/service.");
    });
  });
})();
