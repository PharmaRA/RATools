const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(filePath) {
    return fs.readFileSync(path.join(root, filePath), "utf8");
}

function loadLocale(filePath, globalName) {
    const context = { window: {} };
    vm.runInNewContext(read(filePath), context, { filename: filePath });
    return context.window[globalName];
}

const html = read("index.html");
const releasesJs = read("assets/js/releases.js");
const css = read("assets/css/style.css");
const zh = loadLocale("locales/zh.js", "I18N_ZH");
const en = loadLocale("locales/en.js", "I18N_EN");

// --- Locale keys -----------------------------------------------------------

for (const [lang, dict] of [["zh", zh], ["en", en]]) {
    for (const key of ["changelog", "empty", "full"]) {
        assert.equal(
            typeof dict.projects.release[key],
            "string",
            `${lang} locale should define projects.release.${key}`
        );
        assert.ok(
            dict.projects.release[key].length > 0,
            `${lang} locale projects.release.${key} should be non-empty`
        );
    }
}

// --- HTML: panels exist for released tools, not for eCTD -------------------

for (const repo of ["RATools-for-Word", "RATools-for-PDF"]) {
    const re = new RegExp(
        `<details class="release-notes" data-repo="${repo}" hidden>`
    );
    assert.match(
        html,
        re,
        `${repo} should have a hidden changelog panel that JS reveals`
    );
}

assert.doesNotMatch(
    html,
    /class="release-notes" data-repo="RATools-for-eCTD"/,
    "eCTD should not expose a changelog panel while in development"
);

assert.match(
    html,
    /data-i18n="projects\.release\.changelog"/,
    "changelog label should be translatable"
);

// --- releases.js: fetches body and renders it safely -----------------------

assert.match(
    releasesJs,
    /body:\s*\(json\.body\s*\|\|\s*""\)/,
    "release loader should capture the release body from the GitHub API"
);

assert.match(
    releasesJs,
    /function renderMarkdown/,
    "release loader should render the changelog markdown"
);

assert.match(
    releasesJs,
    /function escapeHtml/,
    "release loader should escape release text before inserting markup"
);

// --- Markdown rendering behaviour (exercise the real function) -------------

const sandbox = {
    window: { I18N_ZH: zh, I18N_EN: en },
    document: {
        documentElement: { getAttribute: () => "zh-CN" },
        readyState: "complete",
        addEventListener() {},
        querySelector: () => null,
        querySelectorAll: () => []
    }
};
// Expose internals for testing without changing production behaviour.
const instrumented = releasesJs.replace(
    /\}\)\(\);\s*$/,
    "window.__test = { renderMarkdown: renderMarkdown, escapeHtml: escapeHtml };\n})();"
);
vm.runInNewContext(instrumented, sandbox, { filename: "releases.js" });
const { renderMarkdown } = sandbox.window.__test;

// Script/HTML in a release body must be neutralized.
const malicious = renderMarkdown("<img src=x onerror=alert(1)>\n\n- safe item");
assert.doesNotMatch(malicious, /<img/, "raw HTML tags must be escaped, not emitted");
assert.match(malicious, /&lt;img/, "raw HTML should be shown as escaped text");
assert.match(malicious, /<li>safe item<\/li>/, "list items should still render");

// Headings map below the section title level (>= h3).
const heading = renderMarkdown("# Release 1.0");
assert.match(heading, /<h3>Release 1\.0<\/h3>/, "top-level heading should render as h3");

// Only http(s) links are turned into anchors.
const links = renderMarkdown(
    "[ok](https://example.com) and [bad](javascript:alert(1))"
);
assert.match(links, /<a href="https:\/\/example\.com"/, "https links should render");
assert.doesNotMatch(links, /href="javascript:/, "javascript: links must not render as anchors");

// --- CSS: panel styling present -------------------------------------------

assert.match(css, /\.release-notes\s*\{/, "changelog panel should be styled");
assert.match(
    css,
    /\.release-notes\[open\] \.faq-icon::after/,
    "changelog panel should collapse its toggle icon when open"
);

console.log("PASS");
