# RATools Portal Implementation Plan

> 跟随 spec：`docs/superpowers/specs/2026-06-13-ratools-portal-design.md`

**Goal:** 实现 PharmaRA 三件套（Word / PDF / eCTD）的静态门户首页，单页、双语、动态获取最新版本号。

**Architecture:** 纯静态 HTML/CSS/JS，无构建步骤；i18n 通过普通 `<script>` 加载字典对象到 `window.I18N_*`；版本号在浏览器端调用 GitHub Releases API。

**Tech Stack:** HTML5、CSS3（自定义属性、Grid/Flex）、原生 JavaScript（ES2015+，不用模块）、SVG。

---

## Task 1: 视觉基线与全局样式

**Files:**
- Create: `index.html`
- Create: `assets/css/style.css`

工作内容：
- 写最小可用的 HTML 骨架（语义化标签、`<meta>`、引用 css）
- 写全局变量、Reset、字体、容器、节奏律样式
- 此时还没有项目数据，先用占位文本

验证：浏览器双击 `index.html` 能看到空白白底页与一个标题。

提交：`feat(portal): scaffold html skeleton and global styles`

## Task 2: 顶部导航与 Hero

**Files:**
- Modify: `index.html`
- Modify: `assets/css/style.css`

工作内容：
- sticky 顶部导航：左 logo 文字、中锚点、右 `中/EN` 切换 + GitHub 图标
- Hero 区：主标题、副标题、双 CTA（暂用静态中文文本）

验证：浏览器看见完整导航与 Hero，CTA 锚点暂时不能跳转，但可视。

提交：`feat(portal): add header and hero section`

## Task 3: 工作流示意图

**Files:**
- Create: `assets/img/workflow.svg`
- Modify: `index.html`
- Modify: `assets/css/style.css`

工作内容：
- 用 inline SVG 直接画三阶段流程：Word → PDF → eCTD
- 每个矩形用 `<a xlink:href="#word-section">` 等做内部锚点
- 节标题 + 引导文案

验证：能看见三个矩形与箭头，点击跳到（暂未存在的）项目 section（先不报错即可）。

提交：`feat(portal): add workflow diagram`

## Task 4: 三个项目详情卡片骨架

**Files:**
- Create: `assets/img/word.svg`
- Create: `assets/img/pdf.svg`
- Create: `assets/img/ectd.svg`
- Modify: `index.html`
- Modify: `assets/css/style.css`

工作内容：
- 每个项目一个 section（id=`word-section` / `pdf-section` / `ectd-section`）
- 左 SVG，右文字：项目名、tagline、4-6 条特性、技术栈徽章、版本占位 + 三个按钮（Release / 源码 / Issues）
- 移动端单列堆叠

验证：能看到三个完整的项目卡片，按钮链接到 GitHub 仓库。版本号显示「—」占位。

提交：`feat(portal): add three project detail sections`

## Task 5: FAQ 与页脚

**Files:**
- Modify: `index.html`
- Modify: `assets/css/style.css`

工作内容：
- FAQ：用 `<details><summary>` 实现折叠
- 页脚：左版权、中仓库快速链接、右本站源码

验证：FAQ 能展开折叠，页脚链接正确。

提交：`feat(portal): add FAQ and footer`

## Task 6: 双语字典文件

**Files:**
- Create: `locales/zh.js`
- Create: `locales/en.js`

工作内容：
- 每个文件挂载 `window.I18N_ZH = {...}` / `window.I18N_EN = {...}`
- 字典完整覆盖：nav、hero、workflow、projects.word/pdf/ectd（含 features 数组）、faq（数组）、footer
- 中英文同步对齐

验证：在浏览器 Console 输入 `window.I18N_ZH.hero.title` 能看到字符串。

提交：`feat(portal): add zh/en locale dictionaries`

## Task 7: i18n 切换逻辑

**Files:**
- Create: `assets/js/i18n.js`
- Modify: `index.html`（给文案元素加 `data-i18n="path.key"`、加载 i18n.js）

工作内容：
- `i18n.js`：
  - 读取 `localStorage.ratoolsLang`（zh/en），缺省按 `navigator.language` 决定
  - 暴露 `setLang(lang)`、`applyLang()`、`t(key)` 三个函数
  - `applyLang()` 遍历所有 `[data-i18n]`，按 `path.path` 取值并 `textContent` 替换
  - 支持数组场景：`[data-i18n-list="projects.word.features"]` 渲染成 `<li>`
  - 切换语言时同时更新 `<html lang>` 属性
- HTML 端：所有静态文本全部加 `data-i18n` 标记
- 顶部 `中/EN` 按钮触发 `setLang`

验证：
- 默认进页面是中文；点击 `EN` 全部翻译到英文
- 刷新后保持上次选择
- 控制台无错误

提交：`feat(portal): add i18n switcher`

## Task 8: GitHub Releases 动态加载

**Files:**
- Create: `assets/js/releases.js`
- Modify: `index.html`（加载 releases.js）

工作内容：
- 每个项目卡片版本占位元素加唯一 id（`version-word` 等），下载按钮加 `data-release-link="word"`
- `releases.js` 启动后并行三个仓库：
  - 命中 `sessionStorage` 缓存（key `ratools.release.<repo>`、5min TTL）则直接用
  - 否则 `fetch('https://api.github.com/repos/PharmaRA/RATools-for-<X>/releases/latest')`
  - 成功：填 `tag_name`、`published_at`（YYYY-MM-DD），按钮 href 改为 `html_url`
  - 失败：版本占位保持「—」，按钮 href 走 `https://github.com/PharmaRA/<repo>/releases`

验证：
- 联网时能看到三个真实版本号
- 离线时按钮仍能跳到 Releases 列表，无 console 致命错误（fetch 失败被 catch）

提交：`feat(portal): add github releases dynamic loader`

## Task 9: 交互细节与最终联调

**Files:**
- Create: `assets/js/main.js`
- Modify: `index.html`

工作内容：
- `main.js`：
  - 顶部导航锚点点击平滑滚动（`scrollIntoView({behavior:'smooth'})`）
  - 滚动时给 `<header>` 加/去掉 `is-scrolled` class（带阴影）
  - SVG 工作流框点击（保留默认锚点行为，但记录到 hash）
- 移动端断点 final pass（≤768px / ≤480px）
- 验收清单逐条过

验证按 spec §12.2 验收清单：
- [ ] 中英切换 OK
- [ ] 三个版本号能加载
- [ ] 离线降级 OK
- [ ] 工作流框点击跳转 OK
- [ ] 移动端 OK
- [ ] 键盘 Tab OK
- [ ] Console 无错

提交：`feat(portal): finalize interactions and responsive polish`

## Task 10: README

**Files:**
- Create: `README.md`

工作内容：
- 中文为主：项目说明、本地预览、部署到 GitHub Pages 的指引
- 链接到 spec 文档与三个仓库

提交：`docs: add README`

---

## 自检（执行前）

- 覆盖：spec §3 范围全部映射到 Task 1-10 ✓
- 占位符：无 TBD/TODO/「类似 Task X」 ✓
- 命名一致：`window.I18N_ZH` / `window.I18N_EN`、`data-i18n`、`data-release-link`、id 命名 `<repo>-section` 在所有 Task 中一致 ✓
- 顺序合理：先骨架/样式 → 再内容 → 再脚本逻辑 → 最后联调 ✓
