/**
 * RATools Portal — main.js
 *
 * Handles:
 * - Smooth scroll for anchor links (with offset for sticky header)
 * - Sticky header scroll shadow (add/remove .is-scrolled)
 * - Active nav link highlighting based on scroll position
 */
(function () {
    "use strict";

    var HEADER_SELECTOR = "#site-header";
    var NAV_LINK_SELECTOR = ".site-nav a[href^='#']";
    var SCROLL_THRESHOLD = 10;

    // ============= Header shadow on scroll =============
    function initHeaderShadow() {
        var header = document.querySelector(HEADER_SELECTOR);
        if (!header) return;

        function update() {
            if (window.scrollY > SCROLL_THRESHOLD) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    // ============= Active nav tracking =============
    function initNavHighlight() {
        var links = document.querySelectorAll(NAV_LINK_SELECTOR);
        if (!links.length) return;

        var sections = [];
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute("href");
            var target = document.querySelector(href);
            if (target) {
                sections.push({ el: target, link: links[i] });
            }
        }

        function update() {
            var scrollY = window.scrollY;
            var headerOffset = 120;
            var active = null;

            for (var i = sections.length - 1; i >= 0; i--) {
                if (sections[i].el.offsetTop - headerOffset <= scrollY) {
                    active = sections[i];
                    break;
                }
            }

            for (var j = 0; j < sections.length; j++) {
                sections[j].link.classList.toggle("is-active", sections[j] === active);
            }
        }

        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    // ============= Smooth scroll for all local anchors =============
    function initSmoothScroll() {
        document.addEventListener("click", function (e) {
            var link = e.target.closest("a[href^='#']");
            if (!link) return;

            var id = link.getAttribute("href").slice(1);
            if (!id) return;

            var target = document.getElementById(id);
            if (!target) return;

            e.preventDefault();
            var prefersReduced = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            target.scrollIntoView({
                behavior: prefersReduced ? "auto" : "smooth",
                block: "start"
            });

            // Update URL hash without jumping.
            if (history.replaceState) {
                history.replaceState(null, "", "#" + id);
            }
        });
    }

    // ============= Mobile nav toggle =============
    function initMobileNav() {
        var toggle = document.getElementById("nav-toggle");
        var nav = document.getElementById("site-nav");
        if (!toggle || !nav) return;

        function open() {
            nav.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", "Close menu");
        }

        function close() {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open menu");
        }

        toggle.addEventListener("click", function (e) {
            e.stopPropagation();
            if (nav.classList.contains("is-open")) {
                close();
            } else {
                open();
            }
        });

        // Close when a nav link is tapped.
        nav.addEventListener("click", function (e) {
            if (e.target.closest("a")) close();
        });

        // Close on Escape.
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("is-open")) {
                close();
                toggle.focus();
            }
        });

        // Close when clicking outside the header.
        document.addEventListener("click", function (e) {
            if (!nav.classList.contains("is-open")) return;
            if (e.target.closest("#site-header")) return;
            close();
        });
    }

    // ============= Init =============
    function init() {
        initHeaderShadow();
        initNavHighlight();
        initSmoothScroll();
        initMobileNav();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
