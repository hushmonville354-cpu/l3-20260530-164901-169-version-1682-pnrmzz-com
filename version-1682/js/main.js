(function() {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function() {
                activate(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function() {
                activate(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                activate(current + 1);
                startTimer();
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                activate(dotIndex);
                startTimer();
            });
        });

        activate(0);
        startTimer();
    }

    var filterScope = document.querySelector('[data-filter-scope]');

    if (filterScope) {
        var searchInput = filterScope.querySelector('[data-page-search]');
        var typeFilter = filterScope.querySelector('[data-type-filter]');
        var yearFilter = filterScope.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card]'));
        var emptyState = filterScope.querySelector('[data-empty-state]');
        var countBox = filterScope.querySelector('[data-search-count]');
        var form = filterScope.querySelector('[data-search-form]');

        function uniqueValues(attr) {
            var values = [];
            cards.forEach(function(card) {
                var value = card.getAttribute(attr);
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            return values.sort().reverse();
        }

        function fillSelect(select, attr) {
            if (!select || select.options.length > 1) {
                return;
            }

            uniqueValues(attr).forEach(function(value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(typeFilter, 'data-type');
        fillSelect(yearFilter, 'data-year');

        function readQuery() {
            var params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        }

        function applyFilters() {
            var keyword = (searchInput ? searchInput.value : '').trim().toLowerCase();
            var typeValue = typeFilter ? typeFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function(card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }

                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('visible', visible === 0);
            }

            if (countBox) {
                countBox.textContent = visible ? '已找到 ' + visible + ' 部影片' : '';
            }
        }

        if (searchInput) {
            var query = readQuery();
            if (query) {
                searchInput.value = query;
            }
            searchInput.addEventListener('input', applyFilters);
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }

        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                applyFilters();
            });
        }

        applyFilters();
    }
}());
