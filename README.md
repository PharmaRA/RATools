# RATools Portal

PharmaRA 三件套（Word / PDF / eCTD）的统一门户首页。

站点地址：`https://ratools.qzz.io/`。Word 手册挂载于 `/word/`，PDF 手册挂载于 `/pdf/`；以实际已部署版本为准。[统一构建、验证与上线步骤](docs/manuals-deployment.md)。

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

1. 先将两份手册所需版本推送到各自仓库的 `main`；PDF 的新文档 CI 先通过。
2. 将门户修改提交到 PR；合并到 `main` 前完成构建校验。本仓库的 PR 和 `main` 推送只构建，不发布。
3. 门户仓库 Settings → Pages → Source 选择 **GitHub Actions**，沿用 `ratools.qzz.io` 自定义域名及 HTTPS 设置，无需为 `/pdf/` 新增 DNS。
4. 在 Actions → **Deploy Portal & Manuals** → Run workflow，选择 `main`，先保持 `publish` 未勾选，检查完整产物；准备上线时手动运行并勾选 `publish`。
5. `build-word`、`build-pdf`、`assemble` 和 `deploy` 全部成功后，打开 `/word/`、`/pdf/` 检查手册和搜索。

完整说明、失败处理和回退方法见[手册发布指南](docs/manuals-deployment.md)。仅推送 PDF 或 Word 仓库不会自动更新门户；更新手册后需重新运行门户的统一发布工作流。

## 技术要点

- **静态门户**：首页使用原生 HTML / CSS / JS；发布时合并独立构建的两份 Starlight 手册
- **双语**：默认中文，顶部按钮一键切换英文，选择持久化到 localStorage
- **动态版本号**：页面加载时调用 GitHub REST API 获取 Word / PDF 仓库的最新 Release 信息，带 sessionStorage 缓存（5 分钟）；eCTD 暂显示为正在开发中
- **降级策略**：JS 禁用或 API 失败时，页面仍可正常阅读，已开放项目的下载按钮指向 Releases 列表页
- **响应式**：适配桌面（≥1200px）、平板（768–1199px）、手机（≤768px）

## 三个工具仓库

| 项目 | 仓库 | 语言 |
|------|------|------|
| RATools for Word | [PharmaRA/RATools-for-Word](https://github.com/PharmaRA/RATools-for-Word) | VBA |
| RATools for PDF | [PharmaRA/RATools-for-PDF](https://github.com/PharmaRA/RATools-for-PDF) | Python |
| RATools for eCTD | [PharmaRA/RATools-for-eCTD](https://github.com/PharmaRA/RATools-for-eCTD) | C# + TypeScript |

## 其他实用工具

| 项目 | 仓库 | 语言 | 说明 |
|------|------|------|------|
| FDA Downloader | [Fiveo9/FDADownloader](https://github.com/Fiveo9/FDADownloader) | Python | FDA 指导原则自动化下载与分类整理 |
| EMA Downloader | [Fiveo9/EMADownloader](https://github.com/Fiveo9/EMADownloader) | Python | 欧洲药品管理局（EMA）监管文件与科学指导原则自动化同步整理 |

## License

本门户站点代码采用 MIT 协议。三个工具项目各自采用其仓库中声明的许可证（GPL-3.0 / AGPL-3.0）。
