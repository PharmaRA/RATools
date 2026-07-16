/* ============================================================
 * RATools Portal — English locale dictionary
 * Loaded via plain <script> tag, attached to window.I18N_EN
 * Keep keys in sync with locales/zh.js
 * ============================================================ */

window.I18N_EN = {
    meta: {
        title: "RATools — Open-source toolkit for pharmaceutical regulatory affairs",
        description: "RATools is an open-source toolkit for pharmaceutical regulatory affairs, covering Word authoring, PDF finalization, and eCTD publishing.",
        og_title: "RATools — Open-source toolkit for pharmaceutical regulatory affairs",
        og_description: "Word plugin, PDF batch processor, and eCTD publishing system for RA workflow."
    },

    nav: {
        skip: "Skip to main content",
        workflow: "Workflow",
        word: "Word",
        pdf: "PDF",
        ectd: "eCTD",
        faq: "FAQ",
        lang: "中"
    },

    hero: {
        eyebrow: "PHARMARA · OPEN SOURCE",
        title: "Open-source toolkit built for pharmaceutical regulatory affairs",
        subtitle: "Three tools cover authoring, finalization, and eCTD publishing. Built from front-line RA experience, free and open source.",
        cta_primary: "See the workflow",
        cta_secondary: "Visit GitHub"
    },

    workflow: {
        eyebrow: "WORKFLOW",
        title: "End-to-end coverage for RA submissions",
        subtitle: "Three independent tools, picking up where the previous one ends — from a draft document all the way to a submission package.",
        draft_stage: "Author",
        draft_desc: "Word templates and macros that standardize styles and accelerate submission writing.",
        finalize_stage: "Finalize",
        finalize_desc: "Batch-clean bookmarks, hyperlinks, and page settings. Output PDFs that match eCTD requirements.",
        publish_stage: "Publish",
        publish_desc: "Manage applications and sequences, validate them, then generate FDA 3.2.2 eCTD submission packages."
    },

    projects: {
        release: {
            latest: "Latest release",
            changelog: "Changelog",
            empty: "This release ships without release notes.",
            full: "View the full changelog on GitHub"
        },
        action: {
            download: "Download",
            source: "Source",
            issue: "Issues"
        },

        word: {
            eyebrow: "01 · AUTHORING",
            name: "RATools for Word",
            tagline: "A Word add-in built for pharmaceutical regulatory affairs, distilled from front-line authoring experience.",
            screenshot_alt: "Screenshot of RATools for Word: the RATools ribbon tab in Word with numbered-heading, style, and macro tools",
            features: [
                "Quick style application: a .dotx template that standardizes document formatting",
                "Frequent-action panel: aggregates high-use commands scattered across Word's tabs",
                "Enhanced macro tools: batch rename, Word-to-PDF, field format protection, abbreviation extraction, and more",
                "Auto-switching CN/EN templates with support for custom styles and your own macros"
            ]
        },

        pdf: {
            eyebrow: "02 · FINALIZING",
            name: "RATools for PDF",
            tagline: "A desktop batch processor for eCTD-ready PDFs.",
            screenshot_alt: "Screenshot of RATools for PDF: the main batch-processing window with feature modules, file queue, and rule options",
            features: [
                "Built-in CN / US eCTD presets with a savable \"My favorites\" rule set",
                "Batch precheck: scan structural state and flag suggested or manual-review items",
                "Bulk import / export of bookmarks and hyperlinks (CSV / JSON), preserving relative path layout",
                "Page standardization, version conversion, linearization, permission unlock, content compliance cleanup",
                "Parallel processing, failure retry, log filtering and export"
            ]
        },

        ectd: {
            eyebrow: "03 · PUBLISHING",
            name: "RATools for eCTD",
            tagline: ".NET + React eCTD publishing system covering the full application / sequence lifecycle.",
            screenshot_alt: "Illustration of RATools for eCTD: application, sequence, and publishing workflow of the eCTD system",
            features: [
                "Application and sequence lifecycle management plus existing-workspace import",
                "Template-driven application setup (us-fda-ectd-3.2.2)",
                "Canonical CTD section folder storage with placement reassignment",
                "Sequence validation: section match, lifecycle target, file existence, publish readiness",
                "FDA eCTD 3.2.2 backbone generation; publish artifacts include report / index / checksum / package.zip"
            ],
            status: "In development"
        }
    },

    faq: {
        eyebrow: "FAQ",
        title: "Frequently asked questions",
        items: [
            {
                q: "Can the three tools be used independently?",
                a: "Yes. The three projects are entirely independent — pick whichever fits your workflow. Use Word alone for authoring, PDF alone for finalization, or eCTD alone for publishing. Together they form a complete pipeline, but it's not required."
            },
            {
                q: "Do they support eCTD systems other than CN / FDA?",
                a: "The PDF tool ships with CN and US eCTD presets and supports custom rule combinations. The eCTD publishing system currently focuses on us-fda-ectd-3.2.2; templates and validation rules for other regulatory regions are welcome via community contributions."
            },
            {
                q: "What licenses are used? Can I use them commercially?",
                a: "RATools-for-Word is GPL-3.0; RATools-for-PDF and RATools-for-eCTD are AGPL-3.0. Please follow each repository's LICENSE file, especially AGPL's source-disclosure obligation when you offer the software as a network service."
            },
            {
                q: "Where do I report bugs or request features?",
                a: "Open an issue on the corresponding GitHub repository for projects that are already available. Projects still in development hide the feedback entry for now. Please include version, steps to reproduce, and a minimal sample whenever possible."
            },
            {
                q: "I'd like to contribute. Where do I start?",
                a: "Fork the repo, claim or open an issue describing what you want to do, and submit a Pull Request. Tests or manual-review scripts attached to your changes make review much smoother."
            }
        ]
    },

    footer: {
        copy: "© 2026 PharmaRA",
        org: "PharmaRA on GitHub",
        site_source: "Source for this site"
    }
};
