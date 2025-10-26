(function () {
  const body = document.body;
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointerFine = window.matchMedia("(pointer: fine)").matches;

  // Passive option helper
  const passive = { passive: true };

  // Focus-trap helpers for mobile nav
  let lastFocused = null;
  function getFocusableWithin(el) {
    if (!el) return [];
    return Array.from(
      el.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((x) => x.offsetParent !== null);
  }
  function openNav() {
    if (!nav) return;
    lastFocused = document.activeElement;
    nav.classList.add("open");
    toggle?.setAttribute("aria-expanded", "true");
    body.classList.add("no-scroll");
    const focusables = getFocusableWithin(nav);
    focusables[0]?.focus();
  }
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
    lastFocused?.focus?.();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => (nav.classList.contains("open") ? closeNav() : openNav()));
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && nav?.classList.contains("open")) closeNav();
      // Focus trap
      if (e.key === "Tab" && nav?.classList.contains("open")) {
        const focusables = getFocusableWithin(nav);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    passive
  );

  nav?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeNav();
  });

  // Smooth internal links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#" || !document.querySelector(id)) return;
      e.preventDefault();
      document.querySelector(id).scrollIntoView({ behavior: "smooth", block: "start" });
      if (nav?.classList.contains("open")) closeNav();
    });
  });

  // Animated counters (cheap)
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count") || "0", 10);
    if (!Number.isFinite(target)) return;
    const duration = prefersReduced ? 0 : 900;
    if (duration === 0) {
      el.textContent = target.toLocaleString();
      return;
    }
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
    { threshold: 0.35 }
  );
  countEls.forEach((el) => io.observe(el));

  // Helper: path to pages
  const inPagesDir = location.pathname.includes("/pages/");
  const pathTo = (file) => (inPagesDir ? file : `pages/${file}`);

  // Finder (home)
  const textInput = document.getElementById("find-keywords");
  const categorySelect = document.getElementById("find-category");
  const locationInput = document.getElementById("find-location");
  const searchBtn = document.getElementById("finderSearchBtn");
  const cardsWrap = document.getElementById("institutionCards");
  function matchesCard(card, q, cat, loc) {
    const name = (card.getAttribute("data-name") || "").toLowerCase();
    const category = (card.getAttribute("data-category") || "").toLowerCase();
    const city = (card.getAttribute("data-city") || "").toLowerCase();
    return ((!q || name.includes(q)) && (!cat || category === cat) && (!loc || city.includes(loc)));
  }
  function applyFind() {
    const q = (textInput?.value || "").trim().toLowerCase();
    const cat = (categorySelect?.value || "").trim().toLowerCase();
    const loc = (locationInput?.value || "").trim().toLowerCase();
    const cards = cardsWrap?.querySelectorAll(".card") || [];
    if (cardsWrap && cards.length) {
      cards.forEach((card) => {
        card.style.display = matchesCard(card, q, cat, loc) ? "" : "none";
      });
    } else if (searchBtn) {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat) params.set("cat", cat);
      if (loc) params.set("loc", loc);
      const qp = params.toString();
      const url = `${pathTo("institutions.html")}${qp ? "?" + qp : ""}`;
      location.href = url;
    }
  }
  searchBtn?.addEventListener("click", applyFind);
  textInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFind();
    }
  });
  categorySelect?.addEventListener("change", applyFind);
  locationInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFind();
    }
  });

  // Institutions filters + query prefill
  const filterText = document.getElementById("filterText");
  const filterCategory = document.getElementById("filterCategory");
  const filterCity = document.getElementById("filterCity");
  function applySecondaryFilter() {
    const q = (filterText?.value || "").trim().toLowerCase();
    const cat = (filterCategory?.value || "").trim().toLowerCase();
    const city = (filterCity?.value || "").trim().toLowerCase();
    const cards = cardsWrap?.querySelectorAll(".card") || [];
    cards.forEach((card) => {
      const name = (card.getAttribute("data-name") || "").toLowerCase();
      const category = (card.getAttribute("data-category") || "").toLowerCase();
      const c = (card.getAttribute("data-city") || "").toLowerCase();
      card.style.display = ((!q || name.includes(q)) && (!cat || category === cat) && (!city || c.includes(city))) ? "" : "none";
    });
  }
  filterText?.addEventListener("input", applySecondaryFilter, passive);
  filterCategory?.addEventListener("change", applySecondaryFilter, passive);
  filterCity?.addEventListener("input", applySecondaryFilter, passive);

  if (inPagesDir && /institutions\.html$/.test(location.pathname)) {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const cat = params.get("cat") || "";
    const loc = params.get("loc") || "";
    if (q && filterText) filterText.value = q;
    if (cat && filterCategory) filterCategory.value = cat;
    if (loc && filterCity) filterCity.value = loc;
    applySecondaryFilter();
  }

  // Event filtering + sorting
  const eventSearch = document.getElementById("eventSearch");
  const eventCategory = document.getElementById("eventCategory");
  const eventStatus = document.getElementById("eventStatus");
  const upcomingContainer = document.getElementById("upcomingEvents");
  const pastContainer = document.getElementById("pastEvents");

  function sortEventsByDate(container, ascending = true) {
    if (!container) return;
    const items = Array.from(container.querySelectorAll(".event"));
    items.sort((a, b) => {
      const da = new Date(a.getAttribute("data-date") || 0).getTime();
      const db = new Date(b.getAttribute("data-date") || 0).getTime();
      return ascending ? da - db : db - da;
    });
    items.forEach((n) => container.appendChild(n));
  }
  sortEventsByDate(upcomingContainer, true);
  sortEventsByDate(pastContainer, false);

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
        evt.style.display = (matchQ && matchC && matchS) ? "" : "none";
      });
    });
  }
  eventSearch?.addEventListener("input", filterEvents, passive);
  eventCategory?.addEventListener("change", filterEvents, passive);
  eventStatus?.addEventListener("change", filterEvents, passive);

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

  // Demo forms -> inline status with aria-live
  document.querySelectorAll("form").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      let status = f.querySelector(".form-status[role='status']");
      if (!status) {
        status = document.createElement("div");
        status.className = "form-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        f.appendChild(status);
      }
      status.textContent = "Thanks! This is a demo — connect this form to your backend/service.";
    });
  });

  // Timeline renderer (JSON)
  const timelineMount = document.getElementById("timelineMount");
  const timelineDataEl = document.getElementById("timelineData");
  if (timelineMount && timelineDataEl) {
    try {
      const data = JSON.parse(timelineDataEl.textContent || "[]");
      const frag = document.createDocumentFragment();
      const rail = document.createElement("div");
      rail.className = "timeline-rail";
      timelineMount.appendChild(rail);

      data.forEach((item) => {
        const wrap = document.createElement("div");
        wrap.className = "tl-item reveal";
        wrap.setAttribute("data-status", item.status || "planned");

        const inner = document.createElement("div");
        inner.className = "tl-item__inner";

        const date = document.createElement("span");
        date.className = "tl-date";
        date.textContent = item.date || "YYYY-MM";

        const dot = document.createElement("span");
        dot.className = "tl-dot";
        dot.setAttribute("aria-hidden", "true");

        const card = document.createElement("article");
        card.className = "tl-card";
        const h = document.createElement("h3");
        h.className = "card__title";
        h.textContent = item.title || "Milestone";
        const desc = document.createElement("p");
        desc.className = "card__desc";
        desc.textContent = item.desc || "Short description of this step.";

        const meta = document.createElement("ul");
        meta.className = "card__meta";
        if (item.phase) {
          const li = document.createElement("li");
          li.innerHTML = `<strong>Phase:</strong> ${item.phase}`;
          meta.appendChild(li);
        }
        if (item.owner) {
          const li = document.createElement("li");
          li.innerHTML = `<strong>Owner:</strong> ${item.owner}`;
          meta.appendChild(li);
        }

        const badges = document.createElement("div");
        badges.className = "tl-badges";
        const badge = document.createElement("span");
        const st = (item.status || "planned").toLowerCase();
        const map = { planned: "Planned", progress: "In Progress", done: "Done" };
        badge.className = `tl-badge tl-badge--${st}`;
        badge.textContent = map[st] || "Planned";
        badges.appendChild(badge);

        card.appendChild(h);
        card.appendChild(desc);
        if (meta.children.length) card.appendChild(meta);
        card.appendChild(badges);

        inner.appendChild(card);
        inner.appendChild(date);

        wrap.appendChild(dot);
        wrap.appendChild(inner);
        frag.appendChild(wrap);
      });

      timelineMount.appendChild(frag);

      const tlObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("is-visible");
              tlObserver.unobserve(en.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      timelineMount.querySelectorAll(".reveal").forEach((el) => tlObserver.observe(el));
    } catch (e) {
      console.warn("Invalid timeline JSON", e);
    }
  }

  // Global micro-interactions (performance-friendly)
  // Ripple (desktop only, no reduced motion)
  if (pointerFine && !prefersReduced) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "btn__ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }, passive);
  }

  // 3D tilt is disabled by default (opt-in with class="tilt")
  if (pointerFine && !prefersReduced) {
    const tiltTargets = document.querySelectorAll(".tilt");
    const maxTilt = 8;
    tiltTargets.forEach((el) => {
      let rAF = null;
      let last = null;
      const onMove = (e) => {
        last = e;
        if (rAF) return;
        rAF = requestAnimationFrame(() => {
          rAF = null;
          const rect = el.getBoundingClientRect();
          const px = (last.clientX - rect.left) / rect.width;
          const py = (last.clientY - rect.top) / rect.height;
          const rx = (py - 0.5) * -2 * maxTilt;
          const ry = (px - 0.5) * 2 * maxTilt;
          el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
      };
      const onLeave = () => { el.style.transform = ""; };
      el.addEventListener("mousemove", onMove, passive);
      el.addEventListener("mouseleave", onLeave, passive);
    });
  }

  // Scroll reveal
  const revealables = document.querySelectorAll(".card, .card-soft, .card-lined, .sponsor-tile, .gallery-panel, .partner, .story, .event, .highlight, .counter, .tier");
  revealables.forEach((el) => el.classList.add("reveal"));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          revealObserver.unobserve(en.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  revealables.forEach((el) => revealObserver.observe(el));
})();