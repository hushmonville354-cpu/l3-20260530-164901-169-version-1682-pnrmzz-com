(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = all("[data-hero-slide]");
    var dots = all("[data-hero-dot]");
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var slider = document.querySelector("[data-hero-slider]");
    var slideIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === slideIndex);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === slideIndex);
      });
    }

    function startSlider() {
      if (!slides.length) {
        return;
      }
      stopSlider();
      timer = window.setInterval(function () {
        showSlide(slideIndex + 1);
      }, 5200);
    }

    function stopSlider() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length) {
      showSlide(0);
      startSlider();

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startSlider();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(slideIndex - 1);
          startSlider();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(slideIndex + 1);
          startSlider();
        });
      }

      if (slider) {
        slider.addEventListener("mouseenter", stopSlider);
        slider.addEventListener("mouseleave", startSlider);
      }
    }

    all("[data-search-area]").forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var empty = area.querySelector("[data-empty]");

      if (!input) {
        return;
      }

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;

        all("[data-search-item]", area).forEach(function (item) {
          var text = (item.getAttribute("data-filter") || item.textContent || "").toLowerCase();
          var match = !keyword || text.indexOf(keyword) !== -1;
          item.hidden = !match;
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
      window.addEventListener("scroll", function () {
        backTop.classList.toggle("visible", window.scrollY > 520);
      });

      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
})();
