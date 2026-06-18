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

    var CACHE_PREFIX = "ratools.release.";
    var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /** Try reading cached release from sessionStorage. */
    function readCache(repo) {
        try {
            var raw = sessionStorage.getItem(CACHE_PREFIX + repo);
            if (!raw) return null;
            var entry = JSON.parse(raw);
            if (Date.now() - entry.ts > CACHE_TTL) {
                sessionStorage.removeItem(CACHE_PREFIX + repo);
                return null;
            }
            return entry.data;
        } catch (e) {
            return null;
        }
    }

    /** Write release info to sessionStorage. */
    function writeCache(repo, data) {
        try {
            sessionStorage.setItem(CACHE_PREFIX + repo, JSON.stringify({
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
    }

    /** Fetch latest release for a single repo. */
    function fetchRelease(repo) {
        var cached = readCache(repo);
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
                    date: formatDate(json.published_at)
                };
                writeCache(repo, data);
                applyRelease(repo, data);
            })
            .catch(function () {
                // Silently degrade — HTML already has fallback links.
            });
    }

    function init() {
        // Only proceed if fetch is available (IE11 won't have it — acceptable).
        if (typeof fetch !== "function") return;

        for (var i = 0; i < REPOS.length; i++) {
            fetchRelease(REPOS[i]);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
