const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "assets/css/style.css"), "utf8");

const featureBeforeRule = css.match(/\.feature-list li::before\s*\{[\s\S]*?\}/);
const featureAfterRule = css.match(/\.feature-list li::after\s*\{[\s\S]*?\}/);

assert.ok(featureBeforeRule, "feature list should keep a marker background");
assert.doesNotMatch(
    featureBeforeRule[0],
    /linear-gradient\([^)]*45deg[\s\S]*linear-gradient\([^)]*-45deg/,
    "feature marker should not be drawn from crossing diagonal gradients"
);

assert.ok(featureAfterRule, "feature list should draw the check mark as a separate pseudo-element");
assert.match(
    featureAfterRule[0],
    /border(?:-right)?:[^;]*var\(--color-accent\)|border(?:-bottom)?:[^;]*var\(--color-accent\)/,
    "feature check mark should use the accent color"
);
assert.match(
    featureAfterRule[0],
    /transform:\s*rotate\(45deg\)/,
    "feature check mark should be rotated into a tick shape"
);
