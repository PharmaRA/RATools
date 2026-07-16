/**
 * RATools Portal — GitHub Releases dynamic loader
 *
 * Fetches latest release info from GitHub API for released projects,
 * then populates version tags and adjusts download links.
 *
 * Degradation:
 * - On fetch failure (rate limit, network), keeps the default "—"
 *   and links fallback to the Releases list page (already set in HTML).
 * - Caches successful responses in sessionStorage for 5 minutes.
 */
(function () {
    "use strict";

    var REPOS = [
        "RATools-for-Word",
        "RATools-for-PDF"
    ];

    // Repos whose star count is shown; includes in-development projects.
    var STAR_REPOS = [
        "RATools-for-Word",
        "RATools-for-PDF",
        "RATools-for-eCTD"
    ];

    var CACHE_PREFIX = "ratools.release.";
    var STARS_CACHE_PREFIX = "ratools.stars.";
    var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /** Try reading a cached entry from sessionStorage by full key. */
    function readCache(key) {
        try {
            var raw = sessionStorage.getItem(key);
            if (!raw) return null;
            var entry = JSON.parse(raw);
            if (Date.now() - entry.ts > CACHE_TTL) {
                sessionStorage.removeItem(key);
                return null;
            }
            return entry.data;
        } catch (e) {
            return null;
        }
    }

    /** Write an entry to sessionStorage by full key. */
    function writeCache(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify({
                ts: Date.now(),
                data: data
            }));
        } catch (e) { /* quota exceeded or blocked — ignore */ }
    }

    /** Format ISO date string to YYYY-MM-DD. */
    function formatDate(iso) {
        if (!iso) return "";
        return iso.slice(0, 10);
    }

    /**
     * Normalize a release tag for display.
     * The CSS adds a leading "v" via ::before, so strip any existing
     * leading "v"/"V" here to avoid rendering "vv1.2.0".
     */
    function normalizeTag(tag) {
        if (!tag) return "";
        return tag.replace(/^v/i, "");
    }

    /** Current UI language, derived from <html lang>. Falls back to "zh". */
    function currentLang() {
        var lang = document.documentElement.getAttribute("lang") || "";
        return lang.indexOf("en") === 0 ? "en" : "zh";
    }

    /**
     * Resolve a dotted i18n key from the pre-loaded dictionaries
     * (window.I18N_ZH / window.I18N_EN), with a fallback string.
     */
    function t(key, fallback) {
        var dict = currentLang() === "en" ? window.I18N_EN : window.I18N_ZH;
        var parts = key.split(".");
        var cursor = dict;
        for (var i = 0; i < parts.length; i++) {
            if (cursor == null) return fallback;
            cursor = cursor[parts[i]];
        }
        return (typeof cursor === "string" && cursor) ? cursor : fallback;
    }

    /** Escape HTML-special characters so raw release text can't inject markup. */
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /** Render inline markdown (links, bold, italic, code) on already-escaped text. */
    function renderInline(escaped) {
        return escaped
            // inline code — protect first so its contents aren't re-processed
            .replace(/`([^`]+)`/g, function (m, code) {
                return "<code>" + code + "</code>";
            })
            // links [text](url) — only http/https URLs allowed
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, text, url) {
                return '<a href="' + url + '" target="_blank" rel="noopener">' + text + "</a>";
            })
            // bold
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            // italic
            .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    }

    /**
     * Minimal, safe Markdown-to-HTML for GitHub release bodies.
     * Handles headings, unordered/ordered lists, fenced code blocks,
     * and paragraphs. All text is HTML-escaped before inline formatting,
     * so no raw HTML from the release survives.
     */
    function renderMarkdown(md) {
        var lines = String(md).replace(/\r\n/g, "\n").split("\n");
        var html = [];
        var listType = null; // "ul" | "ol" | null
        var inCode = false;
        var codeBuf = [];

        function closeList() {
            if (listType) {
                html.push("</" + listType + ">");
                listType = null;
            }
        }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            // fenced code block toggle
            if (/^```/.test(line.trim())) {
                if (inCode) {
                    html.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
                    codeBuf = [];
                    inCode = false;
                } else {
                    closeList();
                    inCode = true;
                }
                continue;
            }
            if (inCode) {
                codeBuf.push(line);
                continue;
            }

            var trimmed = line.trim();

            if (trimmed === "") {
                closeList();
                continue;
            }

            // heading
            var h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
            if (h) {
                closeList();
                var level = Math.min(h[1].length + 2, 6); // map # -> h3 to keep hierarchy below section titles
                html.push("<h" + level + ">" + renderInline(escapeHtml(h[2])) + "</h" + level + ">");
                continue;
            }

            // unordered list item
            var ul = /^[-*+]\s+(.*)$/.exec(trimmed);
            if (ul) {
                if (listType !== "ul") { closeList(); html.push("<ul>"); listType = "ul"; }
                html.push("<li>" + renderInline(escapeHtml(ul[1])) + "</li>");
                continue;
            }

            // ordered list item
            var ol = /^\d+\.\s+(.*)$/.exec(trimmed);
            if (ol) {
                if (listType !== "ol") { closeList(); html.push("<ol>"); listType = "ol"; }
                html.push("<li>" + renderInline(escapeHtml(ol[1])) + "</li>");
                continue;
            }

            // paragraph
            closeList();
            html.push("<p>" + renderInline(escapeHtml(trimmed)) + "</p>");
        }

        if (inCode) {
            html.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
        }
        closeList();
        return html.join("");
    }

    /** Apply fetched release info to the DOM for a given repo. */
    function applyRelease(repo, data) {
        // Find the section with data-repo matching this repo name.
        var section = document.querySelector('[data-repo="' + repo + '"]');
        if (!section) return;

        // Update version tag.
        var tagEl = section.querySelector(".release-tag");
        if (tagEl && data.tag) {
            tagEl.textContent = data.tag;
            tagEl.classList.remove("is-fallback");
        }

        // Append release date if we have a date element or create one.
        if (data.date) {
            var versionLink = section.querySelector(".release-version");
            if (versionLink) {
                var dateSpan = versionLink.querySelector(".release-date");
                if (!dateSpan) {
                    dateSpan = document.createElement("span");
                    dateSpan.className = "release-date";
                    versionLink.appendChild(dateSpan);
                }
                dateSpan.textContent = " · " + data.date;
            }
        }

        // Update the release link URL.
        if (data.url) {
            var releaseLink = section.querySelector(".release-version");
            if (releaseLink) releaseLink.href = data.url;

            // Also update the download button.
            var dlBtn = section.querySelector('[data-action="download"]');
            if (dlBtn) dlBtn.href = data.url;
        }

        applyReleaseNotes(repo, data);
    }

    // Remember the last fetched data per repo so we can re-render the
    // changelog when the user switches language.
    var LAST_DATA = {};

    /** Populate (and reveal) the collapsible changelog panel for a repo. */
    function applyReleaseNotes(repo, data) {
        LAST_DATA[repo] = data;

        var panel = document.querySelector('.release-notes[data-repo="' + repo + '"]');
        if (!panel) return;

        // Show the version tag next to the "Changelog" label.
        var tagEl = panel.querySelector(".release-notes-tag");
        if (tagEl) tagEl.textContent = data.tag ? "v" + data.tag : "";

        var bodyEl = panel.querySelector(".release-notes-body");
        if (!bodyEl) return;

        if (data.body) {
            var full = data.url
                ? '<a class="release-notes-full" href="' + data.url +
                  '" target="_blank" rel="noopener">' +
                  escapeHtml(t("projects.release.full", "View the full changelog on GitHub")) +
                  "</a>"
                : "";
            bodyEl.innerHTML = renderMarkdown(data.body) + full;
        } else {
            bodyEl.innerHTML = '<p class="release-notes-empty">' +
                escapeHtml(t("projects.release.empty", "This release ships without release notes.")) +
                "</p>";
        }

        panel.hidden = false;
    }

    /** Re-render all known changelog panels (e.g. after a language switch). */
    function refreshReleaseNotes() {
        for (var repo in LAST_DATA) {
            if (LAST_DATA.hasOwnProperty(repo)) {
                applyReleaseNotes(repo, LAST_DATA[repo]);
            }
        }
    }

    /** Fetch latest release for a single repo. */
    function fetchRelease(repo) {
        var cached = readCache(CACHE_PREFIX + repo);
        if (cached) {
            applyRelease(repo, cached);
            return;
        }

        var url = "https://api.github.com/repos/PharmaRA/" + repo + "/releases/latest";

        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (json) {
                var data = {
                    tag: normalizeTag(json.tag_name),
                    url: json.html_url || "",
                    date: formatDate(json.published_at),
                    body: (json.body || "").trim()
                };
                writeCache(CACHE_PREFIX + repo, data);
                applyRelease(repo, data);
            })
            .catch(function () {
                // Silently degrade — HTML already has fallback links.
            });
    }

    /** Format a star count the way GitHub does (1234 -> "1.2k"). */
    function formatStars(count) {
        if (count >= 1000) {
            return (Math.round(count / 100) / 10) + "k";
        }
        return String(count);
    }

    /** Reveal the star chip for a repo with its fetched count. */
    function applyStars(repo, count) {
        if (typeof count !== "number" || count < 1) return;
        var chips = document.querySelectorAll('[data-stars-repo="' + repo + '"]');
        for (var i = 0; i < chips.length; i++) {
            var countEl = chips[i].querySelector(".repo-stars-count");
            if (countEl) countEl.textContent = formatStars(count);
            chips[i].hidden = false;
        }
    }

    /** Fetch repo metadata (star count) for a single repo. */
    function fetchStars(repo) {
        var cached = readCache(STARS_CACHE_PREFIX + repo);
        if (cached !== null) {
            applyStars(repo, cached);
            return;
        }

        fetch("https://api.github.com/repos/PharmaRA/" + repo)
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (json) {
                var count = json.stargazers_count;
                if (typeof count !== "number") return;
                writeCache(STARS_CACHE_PREFIX + repo, count);
                applyStars(repo, count);
            })
            .catch(function () {
                // Silently degrade — the chip simply stays hidden.
            });
    }

    function init() {
        // Only proceed if fetch is available (IE11 won't have it — acceptable).
        if (typeof fetch !== "function") return;

        for (var i = 0; i < REPOS.length; i++) {
            fetchRelease(REPOS[i]);
        }

        for (var j = 0; j < STAR_REPOS.length; j++) {
            fetchStars(STAR_REPOS[j]);
        }

        // Re-render changelog panels when the UI language changes, so the
        // "empty" / "full changelog" labels follow the active locale.
        document.addEventListener("ratools:langchange", refreshReleaseNotes);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
