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

        var ticking = false;

        function apply() {
            ticking = false;
            if (window.scrollY > SCROLL_THRESHOLD) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(apply);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        apply();
    }

    // ============= Active nav tracking =============
    function initNavHighlight() {
        var links = document.querySelectorAll(NAV_LINK_SELECTOR);
        if (!links.length) return;

        var sections = [];
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute("href");
            var target = href && href.length > 1 ? document.querySelector(href) : null;
            if (target) {
                sections.push({ el: target, link: links[i] });
            }
        }
        if (!sections.length) return;

        function setActive(activeSection) {
            for (var k = 0; k < sections.length; k++) {
                sections[k].link.classList.toggle(
                    "is-active",
                    sections[k] === activeSection
                );
            }
        }

        // Preferred path: IntersectionObserver (no per-frame work).
        if ("IntersectionObserver" in window) {
            var visible = {};
            var observer = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    var idx = sections.findIndex(function (s) {
                        return s.el === entries[i].target;
                    });
                    if (idx === -1) continue;
                    visible[idx] = entries[i].isIntersecting;
                }

                // Highlight the topmost section currently in view.
                var chosen = null;
                for (var j = 0; j < sections.length; j++) {
                    if (visible[j]) { chosen = sections[j]; break; }
                }
                if (chosen) setActive(chosen);
            }, {
                // Activate a section once it reaches the upper third.
                rootMargin: "-120px 0px -65% 0px",
                threshold: 0
            });

            for (var m = 0; m < sections.length; m++) {
                observer.observe(sections[m].el);
            }
            return;
        }

        // Fallback: rAF-throttled scroll handler.
        var ticking = false;

        function compute() {
            ticking = false;
            var scrollY = window.scrollY;
            var headerOffset = 120;
            var active = null;
            for (var i = sections.length - 1; i >= 0; i--) {
                if (sections[i].el.offsetTop - headerOffset <= scrollY) {
                    active = sections[i];
                    break;
                }
            }
            setActive(active);
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(compute);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        compute();
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

    // ============= Back to top =============
    function initBackToTop() {
        var btn = document.getElementById("back-to-top");
        if (!btn) return;

        var ticking = false;

        function apply() {
            ticking = false;
            btn.classList.toggle("is-visible", window.scrollY > window.innerHeight);
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(apply);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        apply();

        btn.addEventListener("click", function () {
            var prefersReduced = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
        });
    }

    // ============= Image Lightbox =============
    function initLightbox() {
        var lightbox = document.getElementById("lightbox");
        if (!lightbox) return;

        var img = lightbox.querySelector(".lightbox-img");
        var caption = lightbox.querySelector(".lightbox-caption");
        var closeBtn = lightbox.querySelector(".lightbox-close");
        var backdrop = lightbox.querySelector(".lightbox-backdrop");
        var lastFocused = null;

        function open(src, alt) {
            lastFocused = document.activeElement;
            img.src = src;
            img.alt = alt || "";
            caption.textContent = alt || "";
            lightbox.hidden = false;
            // Force reflow for transition
            void lightbox.offsetHeight;
            lightbox.classList.add("is-open");
            document.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
        }

        function close() {
            lightbox.classList.remove("is-open");
            document.body.style.overflow = "";
            setTimeout(function () {
                lightbox.hidden = true;
                img.src = "";
                if (lastFocused && lastFocused.focus) {
                    lastFocused.focus();
                }
            }, 200);
        }

        document.addEventListener("click", function (e) {
            var link = e.target.closest("[data-lightbox]");
            if (!link) return;
            e.preventDefault();
            var src = link.getAttribute("data-lightbox") || link.getAttribute("href");
            var alt = link.getAttribute("data-lightbox-alt") ||
                (link.querySelector("img") && link.querySelector("img").getAttribute("alt")) || "";
            open(src, alt);
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", close);
        }
        if (backdrop) {
            backdrop.addEventListener("click", close);
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
                close();
            }
        });
    }

    // ============= Quick Command Copy =============
    function initCopyButtons() {
        function fallbackCopy(text, cb) {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
                cb();
            } catch (err) { /* ignore */ }
            document.body.removeChild(ta);
        }

        document.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-copy]");
            if (!btn) return;
            var text = btn.getAttribute("data-copy");
            if (!text) return;

            function onDone() {
                btn.classList.add("is-copied");
                setTimeout(function () {
                    btn.classList.remove("is-copied");
                }, 2000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(onDone, function () {
                    fallbackCopy(text, onDone);
                });
            } else {
                fallbackCopy(text, onDone);
            }
        });
    }

    // ============= Scroll Progress Bar =============
    function initScrollProgress() {
        var bar = document.getElementById("scroll-progress");
        if (!bar) return;

        var ticking = false;
        function update() {
            ticking = false;
            var docEl = document.documentElement;
            var total = docEl.scrollHeight - docEl.clientHeight;
            var progress = total > 0 ? (window.scrollY / total) * 100 : 0;
            bar.style.width = Math.min(100, Math.max(0, progress)) + "%";
        }

        window.addEventListener("scroll", function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });
        update();
    }

    // ============= Keyboard Shortcuts =============
    function initShortcuts() {
        document.addEventListener("keydown", function (e) {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            var tag = e.target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) {
                return;
            }

            var key = e.key ? e.key.toLowerCase() : "";
            if (key === "t") {
                var themeBtn = document.getElementById("theme-toggle");
                if (themeBtn) themeBtn.click();
            } else if (key === "l") {
                var langBtn = document.getElementById("lang-toggle");
                if (langBtn) langBtn.click();
            }
        });
    }

    // ============= Init =============
    function init() {
        initHeaderShadow();
        initNavHighlight();
        initSmoothScroll();
        initMobileNav();
        initBackToTop();
        initLightbox();
        initCopyButtons();
        initScrollProgress();
        initShortcuts();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
