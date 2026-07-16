const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function readProjectFile(filePath) {
    return fs.readFileSync(path.join(root, filePath), "utf8");
}

function loadLocale(filePath, globalName) {
    const context = { window: {} };
    vm.runInNewContext(readProjectFile(filePath), context, {
        filename: filePath
    });
    return context.window[globalName];
}

const html = readProjectFile("index.html");
const css = readProjectFile("assets/css/style.css");
const zh = loadLocale("locales/zh.js", "I18N_ZH");
const en = loadLocale("locales/en.js", "I18N_EN");

assert.doesNotMatch(
    html,
    /hero-stats|Quick stats|hero-stat-num|hero-stat-label/,
    "hero statistics block should be removed from the page"
);

for (const locale of [zh, en]) {
    assert.equal(
        Object.hasOwn(locale.hero, "stat_projects"),
        false,
        "hero stat project copy should be removed from locale dictionaries"
    );
    assert.equal(
        Object.hasOwn(locale.hero, "stat_oss"),
        false,
        "hero stat license copy should be removed from locale dictionaries"
    );
    assert.equal(
        Object.hasOwn(locale.hero, "stat_regions"),
        false,
        "hero stat region copy should be removed from locale dictionaries"
    );
}

assert.match(
    css,
    /\.hero\s*\{[\s\S]*min-height:\s*calc\(100svh - var\(--header-height\)\);[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;/,
    "the hero should fill the opened viewport beneath the sticky header"
);

assert.match(
    css,
    /\.hero\s*>\s*\.container\s*\{[\s\S]*width:\s*100%;/,
    "the hero container should keep its full content width inside the viewport-height hero"
);

assert.doesNotMatch(
    css,
    /\.hero-stats|\.hero-stat-num|\.hero-stat-label/,
    "hero statistics styles should be removed with the markup"
);
