(function () {
    var header = document.querySelector("[data-site-header]");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 16) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
        });
    }

    document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-search-input]");
        var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
        var empty = scope.querySelector("[data-empty-state]");

        function applyFilters() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var activeSelects = selects.map(function (select) {
                return {
                    key: select.getAttribute("data-filter-select"),
                    value: select.value
                };
            }).filter(function (item) {
                return item.value !== "";
            });
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var queryMatch = !query || text.indexOf(query) !== -1;
                var selectMatch = activeSelects.every(function (item) {
                    return (card.getAttribute("data-" + item.key) || "") === item.value;
                });
                var matched = queryMatch && selectMatch;
                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });
    });
})();
