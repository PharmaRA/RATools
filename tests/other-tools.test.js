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
const css = read("assets/css/style.css");
const releasesJs = read("assets/js/releases.js");
const i18nJs = read("assets/js/i18n.js");
const zh = loadLocale("locales/zh.js", "I18N_ZH");
const en = loadLocale("locales/en.js", "I18N_EN");

// --- 1. Navigation item ----------------------------------------------------

assert.match(
    html,
    /<a href="#other" data-i18n="nav\.other">其他<\/a>/,
    "Site navigation should include link to #other with data-i18n='nav.other'"
);

for (const [lang, dict] of [["zh", zh], ["en", en]]) {
    assert.equal(typeof dict.nav.other, "string", `${lang} should have nav.other`);
    assert.ok(dict.nav.other.length > 0, `${lang} nav.other should not be empty`);
}

// --- 2. Section & Content in HTML ------------------------------------------

assert.match(
    html,
    /<section id="other" class="other-tools" aria-labelledby="other-title">/,
    "HTML should contain section#other with class 'other-tools'"
);

const fdaPos = html.indexOf("FDA Downloader");
const emaPos = html.indexOf("EMA Downloader");
assert.ok(
    fdaPos !== -1 && emaPos !== -1 && fdaPos < emaPos,
    "FDA Downloader should appear before EMA Downloader in HTML"
);

assert.match(
    html,
    /https:\/\/github\.com\/Fiveo9\/FDADownloader/,
    "HTML should include GitHub link to Fiveo9/FDADownloader"
);

assert.match(
    html,
    /https:\/\/github\.com\/Fiveo9\/EMADownloader/,
    "HTML should include GitHub link to Fiveo9/EMADownloader"
);

// --- 3. JSON-LD structured data --------------------------------------------

assert.match(
    html,
    /"name":\s*"EMA Downloader"/,
    "JSON-LD schema should include EMA Downloader"
);

assert.match(
    html,
    /"name":\s*"FDA Downloader"/,
    "JSON-LD schema should include FDA Downloader"
);

// --- 4. Locale dictionaries completeness -----------------------------------

for (const [lang, dict] of [["zh", zh], ["en", en]]) {
    assert.ok(dict.other, `${lang} should define 'other' object`);
    assert.equal(typeof dict.other.title, "string", `${lang} should define other.title`);
    assert.equal(typeof dict.other.subtitle, "string", `${lang} should define other.subtitle`);

    assert.match(dict.other.fda.eyebrow, /01/, `${lang} FDA Downloader eyebrow should start with 01`);
    assert.match(dict.other.ema.eyebrow, /02/, `${lang} EMA Downloader eyebrow should start with 02`);

    for (const tool of ["ema", "fda"]) {
        assert.ok(dict.other[tool], `${lang} should define other.${tool}`);
        assert.equal(typeof dict.other[tool].name, "string", `${lang} should define other.${tool}.name`);
        assert.equal(typeof dict.other[tool].tagline, "string", `${lang} should define other.${tool}.tagline`);
        assert.ok(Array.isArray(dict.other[tool].features), `${lang} should define other.${tool}.features as array`);
        assert.ok(dict.other[tool].features.length >= 3, `${lang} should have at least 3 features for ${tool}`);
        for (const feature of dict.other[tool].features) {
            assert.equal(typeof feature, "string");
            assert.ok(feature.length > 0);
        }
    }
}

// --- 5. CSS Styles ---------------------------------------------------------

assert.match(css, /\.other-tools\s*\{/, "CSS should define .other-tools");
assert.match(css, /\.other-grid\s*\{/, "CSS should define .other-grid");
assert.match(css, /\.other-card\s*\{/, "CSS should define .other-card");

// --- 6. releases.js handles repo with owner prefix -------------------------

assert.match(
    releasesJs,
    /Fiveo9\/EMADownloader/,
    "releases.js STAR_REPOS should include Fiveo9/EMADownloader"
);

assert.match(
    releasesJs,
    /Fiveo9\/FDADownloader/,
    "releases.js STAR_REPOS should include Fiveo9/FDADownloader"
);

assert.match(
    releasesJs,
    /repo\.indexOf\(["']\/["']\)\s*!==\s*-1/,
    "releases.js fetchStars should support repo names with owner"
);

// --- 7. i18n DOM translation simulation ------------------------------------

function simulateI18n(dict) {
    const listMatches = [...html.matchAll(/data-i18n-list="([^"]+)"/g)].map(m => m[1]);
    assert.ok(listMatches.includes("other.ema.features"), "should have data-i18n-list='other.ema.features'");
    assert.ok(listMatches.includes("other.fda.features"), "should have data-i18n-list='other.fda.features'");

    for (const key of listMatches) {
        const parts = key.split(".");
        let cursor = dict;
        for (const p of parts) {
            cursor = cursor ? cursor[p] : undefined;
        }
        assert.ok(Array.isArray(cursor), `dict should resolve list key '${key}' to an array`);
    }

    const textMatches = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
    for (const key of textMatches) {
        // Skip keys that are dynamically handled or in sub-scopes
        const parts = key.split(".");
        let cursor = dict;
        for (const p of parts) {
            cursor = cursor ? cursor[p] : undefined;
        }
        assert.notEqual(cursor, undefined, `dict should resolve data-i18n key '${key}'`);
    }
}

simulateI18n(zh);
simulateI18n(en);

console.log("All other-tools tests passed successfully!");
