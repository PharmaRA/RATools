# RATools Portal

PharmaRA 三件套（Word / PDF / eCTD）的统一门户首页。

## 项目结构

```
├── index.html        # 单页面入口
├── assets/
│   ├── css/style.css # 全局样式
│   ├── js/
│   │   ├── i18n.js      # 中英文切换
│   │   ├── releases.js  # GitHub Releases 动态加载
│   │   └── main.js      # 滚动交互 / 导航高亮
│   └── img/*.svg     # 项目示意图
├── locales/
│   ├── zh.js         # 中文文案字典
│   └── en.js         # 英文文案字典
└── docs/             # 设计 spec + 实现计划
```

## 本地预览

### 方式一：直接双击

直接在浏览器中打开 `index.html` 即可（多语言、滚动交互均可正常使用）。

> 注：由于 GitHub API 有跨域限制，版本号动态加载在 `file://` 协议下可能受限。

### 方式二：本地 HTTP 服务器

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 部署到 GitHub Pages

1. 将本仓库推送到 GitHub（例如 `PharmaRA/PharmaRA.github.io` 或 `PharmaRA/ratools-portal`）。
2. 在仓库 Settings → Pages 中，选择 `main` 分支、`/ (root)` 目录。
3. 保存后几分钟即可通过 `https://pharmara.github.io` 访问。

## 技术要点

- **纯静态**：无构建步骤、无框架依赖，全部原生 HTML / CSS / JS
- **双语**：默认中文，顶部按钮一键切换英文，选择持久化到 localStorage
- **动态版本号**：页面加载时调用 GitHub REST API 获取三个仓库的最新 Release 信息，带 sessionStorage 缓存（5 分钟）
- **降级策略**：JS 禁用或 API 失败时，页面仍可正常阅读，下载按钮指向 Releases 列表页
- **响应式**：适配桌面（≥1200px）、平板（768–1199px）、手机（≤768px）

## 三个工具仓库

| 项目 | 仓库 | 语言 |
|------|------|------|
| RATools for Word | [PharmaRA/RATools-for-Word](https://github.com/PharmaRA/RATools-for-Word) | VBA |
| RATools for PDF | [PharmaRA/RATools-for-PDF](https://github.com/PharmaRA/RATools-for-PDF) | Python |
| RATools for eCTD | [PharmaRA/RATools-for-eCTD](https://github.com/PharmaRA/RATools-for-eCTD) | C# + TypeScript |

## License

本门户站点代码采用 MIT 协议。三个工具项目各自采用其仓库中声明的许可证（GPL-3.0 / AGPL-3.0）。
