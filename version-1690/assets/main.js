(function () {
  const body = document.body;
  const toggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      body.classList.toggle('nav-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const thumbs = Array.from(document.querySelectorAll('.hero-thumb'));
  let currentSlide = 0;
  let slideTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('active', idx === currentSlide);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('active', idx === currentSlide);
    });
    thumbs.forEach(function (thumb, idx) {
      thumb.classList.toggle('active', idx === currentSlide);
    });
  }

  function startSlideTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      setSlide(Number(dot.getAttribute('data-slide') || 0));
      startSlideTimer();
    });
  });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('mouseenter', function () {
      setSlide(Number(thumb.getAttribute('data-slide') || 0));
    });
  });

  startSlideTimer();

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function applyFilters(scope) {
    const root = scope || document;
    const searchInput = root.querySelector('.movie-search') || document.querySelector('.hero-search');
    const yearSelect = root.querySelector('.year-filter');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const query = normalize(searchInput ? searchInput.value : '');
    const year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      const haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.getAttribute('data-region')
      ].join(' '));
      const matchQuery = !query || haystack.indexOf(query) !== -1;
      const matchYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('hidden-by-filter', !(matchQuery && matchYear));
    });
  }

  document.querySelectorAll('.movie-search, .hero-search').forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilters(document);
      if (input.classList.contains('hero-search')) {
        const firstSection = document.querySelector('.section-wrap');
        if (firstSection && input.value.trim().length > 0) {
          firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  document.querySelectorAll('.year-filter').forEach(function (select) {
    select.addEventListener('change', function () {
      applyFilters(document);
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const button = player.querySelector('.player-start');
    const src = video ? video.getAttribute('data-video') : '';
    let hls = null;
    let ready = false;

    function bindVideo() {
      if (!video || !src || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      ready = true;
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }

      bindVideo();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}());
