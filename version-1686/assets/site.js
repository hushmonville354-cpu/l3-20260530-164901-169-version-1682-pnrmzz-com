(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function initCardFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var search = panel.querySelector("[data-card-search]");
    var filters = Array.prototype.slice.call(panel.querySelectorAll("[data-card-filter]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");

    function matches(card) {
      var q = normalize(search && search.value);
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre")
      ].join(" "));
      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      return filters.every(function (filter) {
        var value = normalize(filter.value);
        var key = filter.getAttribute("data-card-filter");
        var current = normalize(card.getAttribute("data-" + key));
        return !value || current.indexOf(value) !== -1;
      });
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener("change", apply);
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class=\"movie-card\" href=\"" + movie.url + "\">",
      "<span class=\"poster-wrap\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"movie-badge\">" + escapeHtml(movie.categoryLabel) + "</span>",
      "<span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>",
      "<span class=\"play-mark\">▶</span>",
      "</span>",
      "<span class=\"movie-info\">",
      "<strong>" + escapeHtml(movie.title) + "</strong>",
      "<span class=\"movie-desc\">" + escapeHtml(movie.description) + "</span>",
      "<span class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.type) + "</span>",
      "<span class=\"movie-tags\">" + tags + "</span>",
      "</span>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.MovieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = normalize(params.get("q"));
    var input = document.querySelector("[data-search-page-input]");
    var empty = document.getElementById("search-empty");
    if (input) {
      input.value = params.get("q") || "";
    }
    var matches = window.MovieSearchIndex.filter(function (movie) {
      if (!q) {
        return movie.id <= 24;
      }
      var text = normalize([
        movie.title,
        movie.description,
        movie.region,
        movie.year,
        movie.type,
        movie.genre,
        (movie.tags || []).join(" ")
      ].join(" "));
      return text.indexOf(q) !== -1;
    }).slice(0, 96);
    results.innerHTML = matches.map(cardTemplate).join("");
    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
  });
}());
