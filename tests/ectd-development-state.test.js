const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const ref = process.env.RATOOLS_TEST_REF;

function readProjectFile(filePath) {
    if (ref) {
        return execFileSync("git", ["show", `${ref}:${filePath}`], {
            cwd: root,
            encoding: "utf8"
        });
    }

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
const releasesJs = readProjectFile("assets/js/releases.js");
const zh = loadLocale("locales/zh.js", "I18N_ZH");
const en = loadLocale("locales/en.js", "I18N_EN");

assert.match(
    html,
    /data-i18n="projects\.ectd\.status">正在开发中<\/span>/,
    "eCTD card should show the Chinese development status by default"
);

assert.equal(
    zh.projects.ectd.status,
    "正在开发中",
    "Chinese locale should define the eCTD development status"
);

assert.equal(
    en.projects.ectd.status,
    "In development",
    "English locale should define the eCTD development status"
);

assert.doesNotMatch(
    html,
    /data-repo="RATools-for-eCTD"/,
    "eCTD card should not expose release metadata while it is in development"
);

assert.doesNotMatch(
    html,
    /https:\/\/github\.com\/PharmaRA\/RATools-for-eCTD\/releases/,
    "eCTD release/download link should be hidden while it is in development"
);

assert.doesNotMatch(
    html,
    /https:\/\/github\.com\/PharmaRA\/RATools-for-eCTD\/issues/,
    "eCTD feedback link should be hidden while it is in development"
);

const releaseRepos = releasesJs.match(/var REPOS = \[([^\]]*)\]/);

assert.ok(
    releaseRepos,
    "release loader should declare its release repo list"
);

assert.doesNotMatch(
    releaseRepos[1],
    /RATools-for-eCTD/,
    "release loader should skip eCTD from release lookups while it is in development"
);
