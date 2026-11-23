const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const mount of ['word', 'pdf']) {
    const section = html.match(new RegExp(`<section id="${mount}"[\\s\\S]*?</section>`))?.[0];
    assert.ok(section, `${mount} project section exists`);
    assert.match(section, new RegExp(`href="${mount}/" data-i18n="projects\\.action\\.manual"`));
    assert.match(section, /data-action="download"/);
    assert.match(section, /data-i18n="projects\.action\.source"/);
}
for (const language of ['zh', 'en']) {
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, `locales/${language}.js`), 'utf8'), context);
    assert.equal(typeof context.window[`I18N_${language.toUpperCase()}`].projects.action.manual, 'string');
}
console.log('Manual entries: Word + PDF links, existing actions and both translations passed.');
