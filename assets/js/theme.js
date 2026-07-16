/**
 * RATools Portal — theme.js
 *
 * Manual light/dark toggle on top of the system preference.
 * Loaded synchronously in <head> so a saved preference applies
 * before first paint (no flash of the wrong theme).
 *
 * Behavior:
 * - No saved preference: follow the system (CSS media query handles it).
 * - Saved "light"/"dark": force via html[data-theme=...] and keep the
 *   theme-color metas in sync.
 */
(function () {
    "use strict";

    var STORAGE_KEY = "ratoolsTheme";
    var THEME_COLORS = { light: "#1a4d8c", dark: "#14171c" };

    function savedTheme() {
        try {
            var v = localStorage.getItem(STORAGE_KEY);
            return v === "light" || v === "dark" ? v : null;
        } catch (e) {
            return null;
        }
    }

    function systemTheme() {
        return window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    /** The theme currently in effect (forced attr wins over system). */
    function currentTheme() {
        return document.documentElement.getAttribute("data-theme") || systemTheme();
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);

        // Keep the browser UI color in sync with the forced theme.
        var metas = document.querySelectorAll('meta[name="theme-color"]');
        for (var i = 0; i < metas.length; i++) {
            metas[i].setAttribute("content", THEME_COLORS[theme]);
        }
    }

    // Apply a saved preference immediately (this runs during <head> parsing).
    var saved = savedTheme();
    if (saved) applyTheme(saved);

    function bindToggle() {
        var btn = document.getElementById("theme-toggle");
        if (!btn) return;
        btn.addEventListener("click", function () {
            var next = currentTheme() === "dark" ? "light" : "dark";
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) { /* storage may be blocked — theme still applies */ }
            applyTheme(next);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindToggle);
    } else {
        bindToggle();
    }
})();
