# RATools Portal Page — Design Spec

- 日期：2026-06-13
- 项目：RATools 三件套门户首页
- 形态：静态单页 + GitHub Pages
- 状态：已批准，进入实现阶段

## 1. 背景与目标

PharmaRA 组织目前维护三个面向药品注册（Regulatory Affairs，RA）场景的开源工具：

- `RATools-for-Word`：基于 VBA 的 Word 插件，提升注册申报文档撰写效率
- `RATools-for-PDF`：基于 PySide6 + PyMuPDF + qpdf 的桌面工具，批量整理 eCTD 提交所需的 PDF
- `RATools-for-eCTD`：基于 .NET + React 的 eCTD 发布系统，覆盖 application/sequence 全生命周期

三者一起覆盖了 RA 工作的「文档撰写 → 文档定稿 → eCTD 发布」全流程，但在 GitHub 上是 3 个独立仓库，缺乏一个统一的入口让 RA 同行快速理解三者的关系与用途。

本项目要做的就是这个统一入口：一个静态单页门户首页。

## 2. 目标读者与使用场景

- **首要读者**：药品注册（RA）从业者，可能熟悉 Word/PDF 工作流但不一定是开发者
- **次要读者**：对 RA 工具链感兴趣的开发者、潜在贡献者
- **典型场景**：访客通过搜索/口耳相传找到组织主页 → 想快速判断「这套工具能不能解决我的问题」→ 决定下载哪个工具/去哪个仓库

页面目标是让一个第一次到访的 RA 同行在 1 分钟内：

1. 明白这套工具是做什么的
2. 看清三个工具的分工与连接关系
3. 知道每个工具的当前最新版本与下载入口
4. 找到对应仓库继续深入

## 3. 整体叙事结构

页面采用「工作流为主线」的单页锚点结构：

```
Hero (slogan + CTA)
  ↓
工作流示意图：编写 (Word) → 定稿 (PDF) → 发布 (eCTD)
  ↓
项目详细卡片（Word / PDF / eCTD，各占独立 section）
  ↓
FAQ（兼容性、许可证、反馈渠道等）
  ↓
页脚（GitHub 组织、License、联系方式）
```

工作流图中每个框可点击跳转到对应项目卡片（锚点跳转 + 平滑滚动）。

## 4. 仓库与文件结构

整个门户作为静态站点，放在本仓库根目录，可直接通过 GitHub Pages 托管。无 build step，所有文件可直接在浏览器打开。

```
RATools/
├── index.html              # 主页面（语义化结构）
├── assets/
│   ├── css/
│   │   └── style.css       # 全部样式
│   ├── js/
│   │   ├── i18n.js         # 中英切换
│   │   ├── releases.js     # GitHub API 拉取最新版本
│   │   └── main.js         # 滚动锚点 / 切换交互 / 入口
│   └── img/
│       ├── workflow.svg    # 工作流总图（Hero 下方）
│       ├── word.svg        # Word 项目示意图
│       ├── pdf.svg         # PDF 项目示意图
│       └── ectd.svg        # eCTD 项目示意图
├── locales/
│   ├── zh.js               # 中文文案字典（赋值给 window.I18N_ZH）
│   └── en.js               # 英文文案字典（赋值给 window.I18N_EN）
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-06-13-ratools-portal-design.md
├── README.md               # 仓库说明（中文为主）
└── LICENSE                 # 站点本身的开源协议（与三个项目独立）
```

约束：

- 全部静态资源，无构建步骤
- 不使用任何前端框架（React/Vue 等）；只用原生 HTML/CSS/JS
- 不引入 JS bundler 与 ES 模块；所有 JS 文件用普通 `<script src="...">` 顺序加载，避免 `file://` 协议下的 CORS 限制
- 多语言资源以 JS 形式提供（`locales/zh.js` 文件内挂载到 `window.I18N_ZH = {...}`），同样避免 `fetch()` 在 `file://` 下失败的问题
- 本地预览支持两种方式：浏览器直接双击 `index.html`，或在仓库根目录运行 `python -m http.server 8000` 后访问 `http://localhost:8000`

## 5. 视觉系统（专业净化风）

### 5.1 调色板

| 用途 | 颜色 | 备注 |
|------|------|------|
| 主色 | `#1a4d8c` | 医药蓝，链接、主要按钮、标题强调 |
| 强调色 | `#0aa67d` | 通过 / 合规语义，少量使用 |
| 文本主色 | `#212529` | 主要正文 |
| 文本次色 | `#6c757d` | 副标、辅助说明 |
| 背景 | `#ffffff` / `#f8f9fa` | 主背景 / section 交替背景 |
| 分隔线 | `#e9ecef` | 1px 细线 |

### 5.2 排版

- 中文字体优先级：`PingFang SC`, `Source Han Sans CN`, `Microsoft YaHei`, `sans-serif`
- 英文字体优先级：`Inter`, `Helvetica Neue`, `Arial`, `sans-serif`
- 等宽字体：`JetBrains Mono`, `Consolas`, `monospace`
- 主标题 H1 ≈ 48px，section 标题 ≈ 32px，正文 16px / 1.7 行高
- 内容最大宽度 1200px，section 之间 96~128px 垂直留白

### 5.3 元素细节

- 卡片：1px 边框 (`#e9ecef`) + 极轻阴影 (`0 1px 2px rgba(0,0,0,0.04)`)，圆角 8px
- 按钮：主按钮实心 `#1a4d8c`，次按钮 outline，圆角 6px，内边距 12px 24px
- 不使用大面积渐变 / 卡通插画 / 动效装饰
- 图标：使用 SVG inline 或 `<img>`，统一线条粗细 1.5px，颜色继承当前文本色

## 6. 内容章节细化

### 6.1 顶部导航条

- 左：`RATools` logo 文字（暂不出图）
- 中：锚点链接「工作流 / Word / PDF / eCTD / FAQ」
- 右：`中 / EN` 语言切换按钮 + GitHub 组织链接图标
- sticky 固定在顶部，滚动时背景从透明渐变到带轻微阴影的白色

### 6.2 Hero

- 主标语（zh/en 双份）：
  - zh: 「为药品注册而生的开源工具集」
  - en: "Open-source toolkit built for pharmaceutical regulatory affairs"
- 副标语：一句话总结三个工具覆盖「撰写 → 定稿 → 发布」的关系
- CTA：
  - 主按钮：「查看工作流」→ 锚点滚动到工作流 section
  - 次按钮：「访问 GitHub 组织」→ 跳到 `https://github.com/PharmaRA`

### 6.3 工作流示意图

- 居中横向布局：3 个圆角矩形 + 2 个箭头
- 每个矩形：图标 + 项目名 + 1 行说明
- 矩形可点击，跳转到对应项目 section
- SVG 内部使用 `<a xlink:href="#word-section">` 等做锚点
- 移动端（≤768px）改为竖向布局，箭头改为向下

### 6.4 项目详细卡片（共 3 个，结构一致）

每个 section 采用左右布局（移动端单列）：

- 左侧：SVG 示意图（占约 40% 宽度）
- 右侧：
  - 项目名（大）
  - 一句话定位
  - 关键特性 4-6 条 bullet（节选自该项目 README 的核心能力）
  - 技术栈徽章（小标签风格，不依赖 shields.io，本地 CSS 渲染）
  - 「最新版本」行：默认 placeholder「加载中...」，JS 拉到结果后显示 `vx.y.z · YYYY-MM-DD`，失败时不显示版本号、按钮直接跳到 Releases 页面
  - 三个按钮：
    - 下载最新版（主按钮，链接到 Latest Release URL）
    - 源代码（次按钮，链接到仓库主页）
    - 反馈 Issue（次按钮，链接到 issues 页面）

#### 各项目内容要点

**RATools-for-Word**

- 定位：药品注册申报场景下的 Word 效率插件
- 关键特性：
  - 实战导向，源自一线 RA 经验
  - 标准化样式模板（中英文双套）
  - 高频功能聚合，减少选项卡切换
  - 内置 13+ 实用宏（PDF 转换、批量改名、域格式保护等）
  - 兼容 Office 2010 以来主流版本
- 技术栈：VBA · .dotm · .dotx
- 仓库：`PharmaRA/RATools-for-Word`

**RATools-for-PDF**

- 定位：面向 eCTD 递交的桌面端 PDF 批量处理工具
- 关键特性：
  - 中国 / 美国 eCTD 预设规则一键应用
  - 批量预检 + 自动建议处理项
  - 书签 / 超链接批量导入导出（CSV / JSON）
  - 内容合规清理（链接、附件、JS、元数据）
  - 串行 / 并行处理 + 失败重试
- 技术栈：Python · PySide6 · PyMuPDF · qpdf
- 仓库：`PharmaRA/RATools-for-PDF`

**RATools-for-eCTD**

- 定位：覆盖 application/sequence 全生命周期的 eCTD 发布系统
- 关键特性：
  - 模板化应用创建（FDA eCTD 3.2.2）
  - 文档上传与规范化 CTD section 存储
  - sequence 校验（章节匹配、生命周期、文件存在性、可发布性）
  - 一键 backbone 生成 + Publish job 执行
  - 发布历史 / 报告 / 校验和 / 工件下载 / 审计日志
- 技术栈：.NET · C# · React · TypeScript · PostgreSQL
- 仓库：`PharmaRA/RATools-for-eCTD`

### 6.5 FAQ

- 这三个工具能单独使用吗？
- 这套工具支持非中国 / 非 FDA 的 eCTD 体系吗？
- 许可证是什么？是否可以商用？
- 在哪里反馈 bug 或提需求？
- 我能为这套工具贡献代码吗？

每条用 details/summary 折叠，默认全部收起。

### 6.6 页脚

- 左：`© 2026 PharmaRA · 三个项目分别采用对应仓库声明的开源协议`
- 中：项目仓库快速链接
- 右：本站源码链接

## 7. 国际化（i18n）

### 7.1 技术方案

- 文案外置到 `locales/zh.js` 和 `locales/en.js`，每个文件以普通 `<script>` 加载，并在内部分别赋值给 `window.I18N_ZH` 和 `window.I18N_EN`（避免 `file://` 协议下 `fetch()` 失败）
- HTML 里使用 `data-i18n="path.to.key"` 标记需要翻译的元素
- `i18n.js` 启动时：
  1. 读取 `localStorage.ratoolsLang`（用户上次的选择）
  2. 没有则读取 `navigator.language`，匹配 zh-* → zh，否则 → en
  3. 从 `window.I18N_ZH` 或 `window.I18N_EN` 取出字典，遍历所有 `[data-i18n]` 元素并替换 `textContent`
- 切换按钮点击时写入 `localStorage` 并重新填充全部文案

### 7.2 字典结构示例（locales/zh.js）

```js
window.I18N_ZH = {
  nav: {
    workflow: "工作流",
    faq: "常见问题",
    lang: "EN"
  },
  hero: {
    title: "为药品注册而生的开源工具集",
    subtitle: "覆盖文档撰写 → 定稿 → eCTD 发布的全流程",
    cta_primary: "查看工作流",
    cta_secondary: "访问 GitHub 组织"
  },
  projects: {
    word: { name: "RATools for Word", tagline: "...", features: ["...", "..."] },
    pdf:  { name: "RATools for PDF",  tagline: "...", features: ["...", "..."] },
    ectd: { name: "RATools for eCTD", tagline: "...", features: ["...", "..."] }
  },
  faq: [
    { q: "...", a: "..." }
  ]
};
```

### 7.3 注意

- 工作流 SVG 内部的文字也走 i18n（通过 JS 替换 `<text>` 节点的 textContent）
- HTML 根元素根据当前语言切换 `lang="zh-CN"` 或 `lang="en"`，便于无障碍读屏

## 8. 动态版本获取

### 8.1 接口

`GET https://api.github.com/repos/PharmaRA/{repo}/releases/latest`

返回的关键字段：

- `tag_name`：版本号
- `html_url`：Release 详情页
- `published_at`：发布时间

### 8.2 行为

- 页面加载完成后，并行请求三个仓库的 latest release
- 成功：填充版本号 + 发布日期，下载按钮直接链接到 Release 详情页
- 失败（限频 / 网络）：版本号占位符显示「—」，下载按钮改为跳到 `https://github.com/PharmaRA/{repo}/releases`
- 缓存：成功结果写入 `sessionStorage`，5 分钟内重复访问不再调 API

### 8.3 限频对策

- GitHub API 未授权请求约 60 次/小时/IP；门户场景下完全够用
- 每次访问最多 3 次请求，且有 sessionStorage 缓存

## 9. 错误处理与降级

| 场景 | 行为 |
|------|------|
| GitHub API 失败 | 隐藏版本号，下载按钮指向 Releases 列表页 |
| 中断的 fetch（用户切语言、刷新） | 取消旧请求；不影响 UI |
| JS 全部禁用 | 页面仍可阅读默认中文内容；下载按钮直接走 Releases 列表页（HTML 默认 href） |
| 未匹配的 i18n key | 显示 key 本身（开发可发现） |
| SVG 无法加载 | section 高度不会塌陷；img 有 alt 文字 |

## 10. 可访问性与 SEO

- HTML 全部用语义标签（`<header> <nav> <main> <section> <article> <footer>`）
- 每个 section 用 `aria-labelledby` 关联标题
- 颜色对比度满足 WCAG AA（主色 `#1a4d8c` 在白底对比度 7.5:1）
- 所有按钮 / 链接可键盘 Tab 到达，焦点状态有可见 outline
- `<meta>` 中写好 `description`、`og:title`、`og:description`、`og:type=website`
- 不依赖 robots.txt 或 sitemap（首版）；标签合理即可

## 11. 响应式断点

- ≤ 480px：单列、字号略缩、Hero CTA 改为纵向堆叠
- 481–768px：单列布局，工作流 SVG 改为竖向
- 769–1199px：标准两列布局，最大宽度按内容限制
- ≥ 1200px：使用 1200px 内容容器居中

## 12. 测试与验收

### 12.1 本地预览

```powershell
python -m http.server 8000
```

或直接双击 `index.html`。

### 12.2 验收清单

- [ ] 中文 / 英文切换正常，刷新后保留语言选择
- [ ] 三个项目最新版本号都能正确显示，按钮链接无误
- [ ] 断网或 API 失败时，仍可正常使用（按钮降级为 Releases 列表）
- [ ] 工作流 SVG 框可点击跳转到对应项目 section
- [ ] 移动端（Chrome DevTools 模拟 iPhone 12 / Pixel 5）显示正常
- [ ] 键盘 Tab 顺序合理，焦点可见
- [ ] 浏览器：Chrome / Edge / Firefox 最新版无 console 错误
- [ ] HTML / CSS 通过 W3C validator 无致命错误（warning 可接受）

### 12.3 不在范围内

- 暗色模式（首版不做）
- 多页面 / 博客 / 文档站
- 服务端动态内容
- 站点统计、Cookie 通知
- 自动化 CI 部署（首版手动 push 即可）

## 13. 后续可能的扩展

- 暗色模式跟随系统
- 增加每个项目的截图轮播
- 引入 GitHub Actions 自动校验链接 / 部署 Pages
- 增加日文支持
- 增加 RSS 或更新公告区域

## 14. 风险与权衡

| 风险 | 影响 | 缓解 |
|------|------|------|
| GitHub API 限频 | 部分访客看不到版本号 | sessionStorage 缓存 + 失败降级 |
| SVG 在老旧浏览器渲染异常 | 视觉退化 | 限定 IE 不支持，文档中说明最低浏览器 |
| 文案双语维护成本 | 后续更新两边对齐 | 字典文件集中管理，diff 友好 |
| 版本号显示与下载链接错位 | 用户下错版本 | 下载按钮始终走 Release HTML URL，而不是拼接 tag |
