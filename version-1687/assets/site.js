(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    const carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        const input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initCardFilters() {
    document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
      const container = panel.parentElement;
      const list = container ? container.querySelector("[data-card-list]") : null;
      const cards = list ? Array.from(list.children) : [];
      const input = panel.querySelector("[data-card-search]");
      const year = panel.querySelector("[data-filter-year]");
      const type = panel.querySelector("[data-filter-type]");
      const reset = panel.querySelector("[data-filter-reset]");
      const empty = container ? container.querySelector("[data-empty-state]") : null;

      function apply() {
        const keyword = text(input ? input.value : "");
        const yearValue = text(year ? year.value : "");
        const typeValue = text(type ? type.value : "");
        let shown = 0;
        cards.forEach(function (card) {
          const haystack = text([
            card.dataset.title,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.region,
            card.textContent
          ].join(" "));
          const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          const matchedYear = !yearValue || text(card.dataset.year) === yearValue;
          const matchedType = !typeValue || text(card.dataset.type) === typeValue;
          const visible = matchedKeyword && matchedYear && matchedType;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }
    });
  }

  function cardTemplate(movie) {
    const safe = function (value) {
      return String(value || "").replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    };
    const tags = (movie.tags || "").split(/[，,、/\s]+/).filter(Boolean).slice(0, 3);
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + safe(movie.url) + "\" aria-label=\"" + safe(movie.title) + "\">",
      "<img src=\"" + safe(movie.cover) + "\" alt=\"" + safe(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-badge\">" + safe(movie.year || movie.type) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-line\"><span>" + safe(movie.region) + "</span><span>" + safe(movie.type) + "</span></div>",
      "<h3><a href=\"" + safe(movie.url) + "\">" + safe(movie.title) + "</a></h3>",
      "<p>" + safe(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags.map(function (tag) { return "<span>" + safe(tag) + "</span>"; }).join("") + "</div>",
      "<a class=\"card-button\" href=\"" + safe(movie.url) + "\">立即观看</a>",
      "</div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    const results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const input = document.querySelector("[data-global-search]");
    const typeSelect = document.querySelector("[data-search-type]");
    const yearSelect = document.querySelector("[data-search-year]");
    const empty = document.querySelector("[data-search-empty]");
    const movies = window.SEARCH_MOVIES;
    const typeValues = Array.from(new Set(movies.map(function (movie) { return movie.type; }).filter(Boolean))).sort();
    const yearValues = Array.from(new Set(movies.map(function (movie) { return movie.year; }).filter(Boolean))).sort().reverse();

    function fill(select, values) {
      if (!select) {
        return;
      }
      values.slice(0, 60).forEach(function (value) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fill(typeSelect, typeValues);
    fill(yearSelect, yearValues);
    if (input) {
      input.value = params.get("q") || "";
    }

    function apply() {
      const keyword = text(input ? input.value : "");
      const typeValue = text(typeSelect ? typeSelect.value : "");
      const yearValue = text(yearSelect ? yearSelect.value : "");
      const matched = movies.filter(function (movie) {
        const haystack = text([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" "));
        const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchedType = !typeValue || text(movie.type) === typeValue;
        const matchedYear = !yearValue || text(movie.year) === yearValue;
        return matchedKeyword && matchedType && matchedYear;
      });
      results.innerHTML = matched.slice(0, 160).map(cardTemplate).join("");
      if (empty) {
        empty.hidden = matched.length !== 0;
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initCardFilters();
    initSearchPage();
  });
})();
