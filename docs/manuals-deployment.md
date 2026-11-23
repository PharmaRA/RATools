# Word / PDF 手册统一构建与上线

门户使用一个 GitHub Pages 部署，同时包含首页、Word 和 PDF 两份手册。域名继续由门户仓库的 `CNAME` 与 Pages 设置管理，不要给 PDF 仓库再次绑定同一域名。

| 地址 | 来源 | 构建目标 |
| --- | --- | --- |
| `https://ratools.qzz.io/` | 本门户 | 原生静态首页及资源 |
| `https://ratools.qzz.io/word/` | `PharmaRA/RATools-for-Word` 的 main | `DOCS_SITE=https://ratools.qzz.io`、`DOCS_BASE=/word` |
| `https://ratools.qzz.io/pdf/` | `PharmaRA/RATools-for-PDF` 的 main | `npm run build:portal` 固定正式域名和 `/pdf` |

## 发布流程

`.github/workflows/pages.yml` 包含四个作业：

1. `build-word`：沿用 Word 的 Ubuntu 构建、同步和链接校验，上传 `word-manual`。
2. `build-pdf`：在 Windows 上安装锁定依赖，使用回收站保护，执行 PDF 的 `build:portal`，上传 `pdf-manual`。
3. `assemble`：下载两份产物，测试首页入口与装配保护，按发布清单装配，检查完整站点，上传 `portal-preview`。
4. `deploy`：仅允许手动运行、选择 main 且勾选 `publish` 时执行，将完整站点交给 GitHub Pages。

PR 和 main 推送只构建检查，不更新线上网站。手动运行默认也只检查；`publish` 初始值为 false。部署权限只赋予 deploy 作业，普通构建保留 contents: read。

PDF 使用 Windows 是为了保持本机与 CI 同一构建入口及回收保护，不要求迁移 Word 的既有构建平台。两份手册互不覆盖，任一构建或完整站点校验失败，均不会发布半套结果。

## 第一次上线的准确顺序

1. **先准备 PDF 仓库。** 提交并推送使用手册、`website/`（含 package-lock.json）、文档说明、忽略规则和 `.github/workflows/docs.yml`，合并到 PDF 仓库 main。不要提交 `node_modules`、`dist`、生成手册镜像、缓存、备份或本机测试目录。
2. 在 PDF 仓库 Actions 等待 **PDF Documentation** 成功。该工作流只生成 `pdf-manual-preview`，不会单独发布到域名。
3. **再准备门户仓库。** 提交主页 PDF 手册按钮、pages.yml、两个装配/校验脚本、两个专项测试、忽略规则和本说明，合并 main。门户 CI 使用远程 PDF main，不能读取另一个本机工作区的未推送内容。
4. 门户 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。确认 Custom domain 为 `ratools.qzz.io`；保留现有 DNS 和 HTTPS 设置。`/pdf/` 是路径，无需新增 DNS 记录。
5. 在门户 Actions → **Deploy Portal & Manuals** → Run workflow，选择 main，不勾选 `publish`，等三个构建/装配作业成功。可下载 `portal-preview` 查看完整静态包。
6. 准备发布时，同一入口选择 main 并勾选 `publish`。这次会重新拉取 Word/PDF main、构建和验证，再运行 deploy。
7. 等 deploy 成功，通过 GitHub Pages 的部署链接及下列地址验证：主页 PDF“使用手册”按钮、`/word/`、`/pdf/`、`/pdf/manual/feature-index/`，以及搜索“字体”“审计包”。

手动检查与正式发布是两次构建；期间如果手册 main 变化，正式发布会使用较新的 main。需精确控制版本时，在门户工作流 checkout 的 ref 中使用已审查的提交 SHA，并在后续更新时显式调整。

## 本地验证与预览

PDF 仓库中运行：

```powershell
Set-Location C:\Repositories\RATools-for-PDF\website
npm run build:portal
$env:DOCS_SITE = "https://ratools.qzz.io"
$env:DOCS_BASE = "/pdf"
npm run preview -- --host 127.0.0.1 --port 4322
```

访问 `http://127.0.0.1:4322/pdf/`，Ctrl+C 停止。`build:portal` 在子进程中固定环境，不会替你修改当前 PowerShell 的环境变量，所以预览时仍需上面的两项设置。

已有正式 `/word/` 和 `/pdf/` 两份构建产物时，在门户根目录运行：

```powershell
node tests/manual-entry.test.js
py -3 -B tests/site_assembly_test.py
py -3 -B scripts/assemble_site.py --word-dist C:\Repositories\RATools-for-Word\website\dist --pdf-dist C:\Repositories\RATools-for-PDF\website\dist --output .artifacts\portal-preview
py -3 -B scripts/check_site.py --site-dir .artifacts\portal-preview
py -3 -m http.server 4323 --bind 127.0.0.1 --directory .artifacts\portal-preview
```

输出目录必须尚不存在；再次执行请选择新的 `.artifacts` 子目录，或审查后将旧目录移入回收站。服务启动后访问 `http://127.0.0.1:4323/`、`/word/`、`/pdf/`；Ctrl+C 停止。测试样本位于 `.artifacts/assembly-tests/`，需要时移入回收站，不运行物理删除命令。

不要从 file:// 打开手册来检查搜索。上述命令是本机工作流，不代表 GitHub Actions 已实际运行。

## 发布清单和校验范围

装配只读取门户五个根文件（index.html、404.html、CNAME、robots.txt、sitemap.xml）、assets/、locales/ 和两份构建产物。不会整仓复制，也不执行“复制后再删除源码”的操作。

装配脚本在写入前拒绝：已存在输出、源与目标重叠、非指定输出区域、符号链接/重解析点/硬链接、静态目录中的私有目录或非发布文件，以及域名/挂载前缀错误、缺少中文索引的手册。`.nojekyll` 在装配时生成，保证 `_astro` 等资源正确发布；robots.txt 加入两份手册的 sitemap 入口。

最终校验覆盖首页两手册入口、各手册 canonical 前缀、站内页面/图片/脚本/样式/锚点、CNAME 和搜索元数据。它不访问外部链接，也不替代真实浏览器中的搜索交互、样式检查或 PDF 软件功能验收。

## 失败与后续更新

- `build-pdf` 找不到 website/build:portal：先确认 PDF 站点代码已推送到该仓库 main。
- Windows 回收失败：查看对应日志；保留失败，不能绕过保护改成物理删除。
- 装配提示 Wrong site/base：重新按 `/word` 或 `/pdf` 构建，不能只把旧前缀的 dist 目录换个名字。
- 完整校验失败：修复列出的路径或锚点，再重新构建；失败时不进入 deploy。
- Word/PDF 更新后：各自提交并合并 main，再手动运行门户工作流。单独更新源仓库不会自动触发门户发布。
- 需要回退：将对应手册 checkout ref 固定为上一已知可用提交，确保其支持当前构建命令，再重新检查并手动发布。不要销毁现有 Pages 站点或修改 DNS 来回退内容。

本轮是本地实施与验证。GitHub Actions 首次运行、Pages 配置和线上交互检查需按上述上线步骤完成。

## 本次本机验证结果（2026-11-23）

| 检查 | 实际结果 |
| --- | --- |
| PDF `npm run build:portal` | 退出 0；Astro 0 errors / 0 warnings / 0 hints，正式 `/pdf/` 23 页、1421 个本地链接/资源、42/42 规则覆盖通过 |
| Word 正式 `/word/` 构建 | 退出 0；28 页正文、30 个 HTML 及中文索引。使用可用的 Python Launcher 同步，绕过本机失效的旧 Python311 虚拟环境；没有修改 Word 正式源码 |
| 门户 `node tests/manual-entry.test.js` | 退出 0；Word/PDF 手册按钮、原下载/源码按钮及中英文文案通过 |
| 门户 `py -3 -X utf8 -B tests/site_assembly_test.py` | 退出 0；7/7，通过覆盖拒绝、错前缀拒绝、私有文件拒绝、输出范围、锚点/canonical 检查和双手册装配 |
| 两份 GitHub workflow YAML | 解析无错误；检查作业依赖、Windows PDF 作业以及 main + 手动 + publish 的部署条件通过 |
| 真实联合装配 | 退出 0；复制 207 个公开文件，额外生成 `.nojekyll`，未带入仓库配置和源码 |
| `scripts/check_site.py` | 退出 0；55 个 HTML（门户 2、Word 30、PDF 23），3206 个本地链接/资源与锚点，errors 为空 |
| 只读 review / Git diff 检查 | 完成，未发现交付阻断；没有远程提交、推送或部署 |

本机联合产物：`.artifacts/portal-pdf-20261123/site/`。对应证据在同级 `manual-entry.log`、`assembly-tests.log`、`site-check.json`。两个项目的改前重要文件备份分别位于各自 `backups/portal-pdf-20261123/`。

本轮首次装配检查发现 `.pagefind` 搜索运行文件未列入发布扩展名，已补入并增加回归断言；404 canonical 被误作实体导航的检查已修正，同时保留错误域名失败用例。最终结果以上表为准。

PDF 既有 404 路由优先级提示、Word 既有缺少自定义 404 内容提示仍出现在构建日志，实际两份 404 页面均存在并通过联合路径检查。未进行浏览器视觉/搜索交互测试，也未运行 GitHub 托管 Windows/Ubuntu 作业；不能把本机结果称为远程 CI 或线上验收已通过。
