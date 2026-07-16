/* ============================================================
 * RATools Portal — 中文文案字典
 * 通过普通 <script> 标签加载，挂载到 window.I18N_ZH
 * 任何修改请同步对应的 locales/en.js
 * ============================================================ */

window.I18N_ZH = {
    meta: {
        title: "RATools — 药品注册开源工具集",
        description: "RATools — 为药品注册（RA）打造的开源工具集，覆盖 Word 撰写、PDF 定稿、eCTD 发布全流程。",
        og_title: "RATools — 药品注册开源工具集",
        og_description: "Word 撰写、PDF 定稿、eCTD 发布——一套贯穿 RA 全流程的开源工具。"
    },

    nav: {
        skip: "跳到主内容",
        workflow: "工作流",
        word: "Word",
        pdf: "PDF",
        ectd: "eCTD",
        faq: "常见问题",
        lang: "EN"
    },

    hero: {
        eyebrow: "PHARMARA · 开源工具集",
        title: "为药品注册而生的开源工具集",
        subtitle: "三件套覆盖文档撰写 → 文档定稿 → eCTD 发布，沉淀一线 RA 经验，免费开源。",
        cta_primary: "查看工作流",
        cta_secondary: "访问 GitHub 主页"
    },

    workflow: {
        eyebrow: "WORKFLOW",
        title: "贯穿 RA 全流程的三件套",
        subtitle: "三个独立工具，按提交节奏依次接力，从草稿到 eCTD 包都能交给开源完成。",
        draft_stage: "撰写",
        draft_desc: "基于 Word 模板与宏，统一样式、加速申报文档撰写。",
        finalize_stage: "定稿",
        finalize_desc: "批量整理书签、超链接、页面规范，按 eCTD 要求输出 PDF。",
        publish_stage: "发布",
        publish_desc: "管理申请与序列，校验并生成符合 FDA 3.2.2 的 eCTD 提交包。"
    },

    projects: {
        release: {
            latest: "最新版本",
            changelog: "更新日志",
            empty: "本次发布未附带更新说明。",
            full: "在 GitHub 查看完整日志"
        },
        action: {
            download: "下载",
            source: "源码",
            issue: "反馈",
            stars: "GitHub Star 数"
        },

        word: {
            eyebrow: "01 · WRITING",
            name: "RATools for Word",
            tagline: "为药品注册而生的 Word 效率插件，沉淀一线 RA 撰写经验。",
            screenshot_alt: "RATools for Word 截图：Word 功能区中的 RATools 选项卡，包含编号标题、样式与宏工具",
            features: [
                "样式快速应用：基于 .dotx 标准模板，统一文档格式",
                "常用选项面板：聚合分散在 Word 各选项卡的高频功能",
                "增强型宏工具：批量改名、Word 转 PDF、域格式保护、提取缩略语等",
                "中英文模板自动切换，支持自定义样式与扩展自有宏"
            ]
        },

        pdf: {
            eyebrow: "02 · FINALIZING",
            name: "RATools for PDF",
            tagline: "面向 eCTD 递交场景的桌面端 PDF 批量处理工具。",
            screenshot_alt: "RATools for PDF 截图：批量处理主界面，包含功能模块、待处理队列与处理规则选项",
            features: [
                "中国 / 美国 eCTD 预设规则，可保存「我的常用」组合",
                "批量预检：扫描结构状态，标记建议处理项与人工复核项",
                "书签 / 超链接批量导入导出（CSV / JSON），保留相对目录层级",
                "页面标准化、版本转换、线性化、权限解除、内容合规清理",
                "支持并行处理、失败重试、日志筛选与导出"
            ]
        },

        ectd: {
            eyebrow: "03 · PUBLISHING",
            name: "RATools for eCTD",
            tagline: "基于 .NET + React 的 eCTD 发布系统，覆盖 application / sequence 全生命周期。",
            screenshot_alt: "RATools for eCTD 示意图：eCTD 发布系统的申请、序列与发布流程",
            features: [
                "application / sequence 全生命周期管理与导入",
                "基于模板的应用初始化（us-fda-ectd-3.2.2）",
                "规范的 CTD 章节文件夹存储，支持文档放置重指派",
                "序列校验：章节匹配、生命周期、文件存在性与可发布性",
                "FDA eCTD 3.2.2 backbone 生成，发布产物含 report / index / checksum / package.zip"
            ],
            status: "正在开发中"
        }
    },

    faq: {
        eyebrow: "FAQ",
        title: "常见问题",
        items: [
            {
                q: "这三个工具能单独使用吗？",
                a: "可以。三个工具完全独立，按你团队的工作流挑选即可：只用 Word 撰写也行，只用 PDF 整理也行，只用 eCTD 系统做发布也行。三者协同时收益最大，但不强制。"
            },
            {
                q: "支持非中国 / 非 FDA 的 eCTD 体系吗？",
                a: "PDF 工具内置中国 / 美国 eCTD 预设，且支持自定义规则组合。eCTD 发布系统当前优先支持 us-fda-ectd-3.2.2 模板，未来欢迎社区贡献其他法规体系的模板与校验规则。"
            },
            {
                q: "许可证是什么？是否可以商用？",
                a: "RATools-for-Word 采用 GPL-3.0；RATools-for-PDF 与 RATools-for-eCTD 采用 AGPL-3.0。请按各仓库 LICENSE 文件遵守对应条款，特别是 AGPL 在网络服务场景下的源码披露义务。"
            },
            {
                q: "在哪里反馈 bug 或提需求？",
                a: "已开放的项目可直接到对应仓库的 GitHub Issues 页提交；暂处于开发中的项目会先隐藏反馈入口。提交时麻烦附上版本号、操作步骤与最小可复现样例。"
            },
            {
                q: "想为这套工具贡献代码，从哪入手？",
                a: "先 fork 对应仓库、在 issue 区领认或开新 issue 描述你想做的事，再以 Pull Request 提交。所有改动建议带测试或人工复核脚本，便于审阅。"
            }
        ]
    },

    footer: {
        copy: "© 2026 PharmaRA",
        org: "PharmaRA on GitHub",
        site_source: "本站源码"
    }
};
