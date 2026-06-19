(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function reset() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        reset();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });

    show(0);
    start();
  }

  var list = document.querySelector('[data-filter-list]');
  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var countNode = document.querySelector('[data-filter-count]');

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
  }

  function applyFilters() {
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var index = card.getAttribute('data-index') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = true;

      if (query && index.indexOf(query) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (countNode) {
      countNode.textContent = visible + ' 部匹配影片';
    }
  }

  [searchInput, yearFilter, typeFilter].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
