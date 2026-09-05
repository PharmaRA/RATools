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
const mainJs = read("assets/js/main.js");
const zh = loadLocale("locales/zh.js", "I18N_ZH");
const en = loadLocale("locales/en.js", "I18N_EN");

// --- 1. Hero Standards & Pipeline ------------------------------------------
assert.match(html, /class="hero-standards"/, "Hero should have regulatory standards bar");
assert.match(html, /class="hero-preview-window"/, "Hero should have pipeline preview window");
assert.match(css, /\.hero-standards\s*\{/, "CSS should define .hero-standards");
assert.match(css, /\.hero-preview-window\s*\{/, "CSS should define .hero-preview-window");

// --- 2. Workflow I/O Pills -------------------------------------------------
assert.match(html, /class="workflow-step-io"/, "Workflow steps should have I/O pills");
assert.match(css, /\.workflow-step-io\s*\{/, "CSS should define .workflow-step-io");
assert.match(css, /\.io-pill--input/, "CSS should define .io-pill--input");
assert.match(css, /\.io-pill--output/, "CSS should define .io-pill--output");

// --- 3. Window Frames & Lightbox -------------------------------------------
assert.match(html, /class="window-frame"/, "Product media should have window frames");
assert.match(html, /id="lightbox"/, "HTML should have lightbox modal");
assert.match(mainJs, /function initLightbox/, "main.js should initialize lightbox");
assert.match(css, /\.lightbox\s*\{/, "CSS should define .lightbox");

// --- 4. Utilities Region Badges & Copy Command ------------------------------
assert.match(html, /class="region-badge region-badge--fda"/, "FDA card should have region badge");
assert.match(html, /class="region-badge region-badge--ema"/, "EMA card should have region badge");
assert.match(html, /class="quick-cmd"/, "Utilities should have quick command boxes");
assert.match(mainJs, /function initCopyButtons/, "main.js should initialize copy buttons");
assert.match(css, /\.quick-cmd\s*\{/, "CSS should define .quick-cmd");

// --- 5. Scroll Progress & Shortcuts ----------------------------------------
assert.match(html, /id="scroll-progress"/, "HTML should have scroll progress bar in header");
assert.match(css, /\.scroll-progress\s*\{/, "CSS should define .scroll-progress");
assert.match(mainJs, /function initScrollProgress/, "main.js should initialize scroll progress");
assert.match(mainJs, /function initShortcuts/, "main.js should initialize keyboard shortcuts");
assert.doesNotMatch(css, /\.btn\[target="_blank"\]::after/, "Buttons should not have trailing arrow indicators");

console.log("All UI enhancement tests passed successfully!");
