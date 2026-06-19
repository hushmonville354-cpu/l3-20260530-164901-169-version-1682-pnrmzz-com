(function () {
    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var count = scope.querySelector("[data-filter-count]");
            var list = scope.parentElement.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);

            function apply() {
                var query = normalize(input && input.value);
                var year = normalize(yearSelect && yearSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.tags,
                        card.textContent
                    ].join(" "));
                    var yearValue = normalize(card.dataset.year);
                    var regionValue = normalize(card.dataset.region);
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && yearValue !== year) {
                        matched = false;
                    }
                    if (region && regionValue !== region) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + " 部影片";
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query) {
                    input.value = query;
                }
                input.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            if (regionSelect) {
                regionSelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
