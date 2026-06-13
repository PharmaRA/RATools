/**
 * RATools Portal — i18n
 *
 * Strategy:
 * - Two dictionaries are pre-loaded as `window.I18N_ZH` / `window.I18N_EN`
 *   via plain <script> tags so we don't need fetch() / ES modules
 *   (works under both file:// and HTTP).
 * - HTML elements are tagged with `data-i18n="some.path"`. JS walks the DOM
 *   and replaces textContent on language change.
 * - Special handling: <feature> lists are rendered into <ul>; <meta> tags
 *   need their `content` attribute updated; <title> needs textContent.
 * - User selection is persisted in localStorage and reapplied on next visit.
 */
(function () {
    "use strict";

    var STORAGE_KEY = "ratoolsLang";
    var SUPPORTED = ["zh", "en"];
    var DEFAULT_LANG = "zh";

    var DICTS = {
        zh: window.I18N_ZH || {},
        en: window.I18N_EN || {}
    };

    /** Read a dotted path from a nested object. Returns undefined if missing. */
    function getPath(obj, path) {
        var parts = path.split(".");
        var cursor = obj;
        for (var i = 0; i < parts.length; i++) {
            if (cursor == null) return undefined;
            cursor = cursor[parts[i]];
        }
        return cursor;
    }

    /** Detect initial language: localStorage > navigator.language > default. */
    function detectInitialLang() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
        } catch (e) { /* storage may be blocked */ }

        var nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
        if (nav.indexOf("zh") === 0) return "zh";
        if (nav.indexOf("en") === 0) return "en";
        return DEFAULT_LANG;
    }

    /** Apply a translation value to a target element. */
    function applyToElement(el, value) {
        if (value === undefined || value === null) return;

        // Arrays only make sense for list-rendering elements.
        // Caller (renderFeatureLists) already handles those — skip here.
        if (Array.isArray(value)) return;

        var attr = el.getAttribute("data-i18n-attr");
        if (attr) {
            el.setAttribute(attr, value);
            return;
        }

        // Special-case <title> (we don't want to add data-i18n-attr to it)
        if (el.tagName === "TITLE") {
            el.textContent = value;
            return;
        }

        // Special-case <meta> with content attr
        if (el.tagName === "META") {
            el.setAttribute("content", value);
            return;
        }

        el.textContent = value;
    }

    /** Render features arrays into the matching <ul data-i18n-list="projects.<id>.features">. */
    function renderFeatureLists(dict) {
        var lists = document.querySelectorAll("[data-i18n-list]");
        for (var i = 0; i < lists.length; i++) {
            var ul = lists[i];
            var path = ul.getAttribute("data-i18n-list");
            var items = getPath(dict, path);
            if (!Array.isArray(items)) continue;

            ul.innerHTML = "";
            for (var j = 0; j < items.length; j++) {
                var li = document.createElement("li");
                li.textContent = items[j];
                ul.appendChild(li);
            }
        }
    }

    /** Walk all [data-i18n] elements and rewrite their text. */
    function applyTranslations(lang) {
        var dict = DICTS[lang];
        if (!dict) {
            console.warn("[i18n] missing dictionary for", lang);
            return;
        }

        var nodes = document.querySelectorAll("[data-i18n]");
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var path = el.getAttribute("data-i18n");
            var value = getPath(dict, path);

            if (value === undefined) {
                // Surface missing keys during development without breaking the page.
                console.warn("[i18n] missing key:", path, "for", lang);
                continue;
            }
            applyToElement(el, value);
        }

        renderFeatureLists(dict);

        // Update <html lang="..."> for accessibility / SEO.
        document.documentElement.setAttribute(
            "lang",
            lang === "zh" ? "zh-CN" : "en"
        );

        // Update toggle button label: zh shows "EN", en shows "中".
        var toggleLabel = document.querySelector("#lang-toggle [data-i18n='nav.lang']");
        if (toggleLabel) {
            toggleLabel.textContent = lang === "zh" ? "EN" : "中";
        }
    }

    /** Persist language and apply. */
    function setLang(lang) {
        if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* ignore */ }
        applyTranslations(lang);

        // Notify any other module that may want to react (e.g. SVG text labels).
        document.dispatchEvent(new CustomEvent("ratools:langchange", {
            detail: { lang: lang }
        }));
    }

    /** Wire up the header toggle button. */
    function bindToggle() {
        var btn = document.getElementById("lang-toggle");
        if (!btn) return;
        btn.addEventListener("click", function () {
            var current = document.documentElement.getAttribute("lang") || "";
            var next = current.indexOf("zh") === 0 ? "en" : "zh";
            setLang(next);
        });
    }

    function init() {
        var initial = detectInitialLang();
        applyTranslations(initial);
        bindToggle();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Expose minimal API for debugging / future use.
    window.RAToolsI18n = {
        setLang: setLang,
        getLang: function () {
            return document.documentElement.getAttribute("lang") || "";
        }
    };
})();
