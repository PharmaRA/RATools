"""Exercise assembly publication boundaries with isolated synthetic site fixtures."""
from pathlib import Path
import json
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from assemble_site import assemble
from check_site import check


class AssemblyTests(unittest.TestCase):
    def setUp(self):
        fixture_root = ROOT / ".artifacts" / "assembly-tests"
        fixture_root.mkdir(parents=True, exist_ok=True)
        self.root = Path(tempfile.mkdtemp(prefix="case-", dir=fixture_root))
        self.portal = self.root / "portal"
        self.word = self.root / "word"
        self.pdf = self.root / "pdf"
        self.output = self.portal / "_site"
        self.write(self.portal / "index.html", '<a href="word/">Word</a><a href="pdf/">PDF</a>')
        for name, text in (("404.html", "Not found"), ("CNAME", "ratools.qzz.io"), ("robots.txt", "User-agent: *\n"), ("sitemap.xml", "<urlset/>")):
            self.write(self.portal / name, text)
        self.write(self.portal / "assets/style.css", "body {}")
        self.write(self.portal / "locales/zh.js", "// public locale")
        for mount, directory in (("word", self.word), ("pdf", self.pdf)):
            canonical = f'<link rel="canonical" href="https://ratools.qzz.io/{mount}/">'
            for relative in ("index.html", "manual/index.html", "404.html"):
                page_canonical = canonical if relative != "404.html" else f'<link rel="canonical" href="https://ratools.qzz.io/{mount}/404/">'
                self.write(directory / relative, page_canonical + f'<a href="/{mount}/manual/#target">Manual</a><h2 id="target">Target</h2>')
            self.write(directory / "pagefind/pagefind.js", "// generated")
            self.write(directory / "pagefind/wasm.zh-cn.pagefind", "synthetic search runtime")
            self.write(directory / "pagefind/pagefind-entry.json", json.dumps({"languages": {"zh-cn": {"page_count": 2}}}))
            self.write(directory / "sitemap-index.xml", "<sitemapindex/>")
            self.write(directory / "sitemap-0.xml", f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ratools.qzz.io/{mount}/</loc></url></urlset>')

    @staticmethod
    def write(file, content):
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(content, encoding="utf-8")

    def test_publishes_both_manuals_without_repository_files(self):
        self.write(self.portal / ".env.synthetic", "not-a-real-credential")
        self.write(self.portal / ".github/workflows/private.yml", "not-public")
        self.write(self.portal / "docs/private.md", "not-public")
        assemble(self.portal, self.word, self.pdf, self.output)
        self.assertFalse((self.output / ".env.synthetic").exists())
        self.assertFalse((self.output / ".github").exists())
        self.assertFalse((self.output / "docs").exists())
        self.assertTrue((self.output / "pdf/pagefind/wasm.zh-cn.pagefind").is_file())
        self.assertEqual(check(self.output)["errors"], [])

    def test_rejects_wrong_base_before_writing(self):
        self.write(self.pdf / "sitemap-0.xml", '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ratools.qzz.io/RATools-for-PDF/</loc></url></urlset>')
        with self.assertRaisesRegex(ValueError, "Wrong site/base"):
            assemble(self.portal, self.word, self.pdf, self.output)
        self.assertFalse(self.output.exists())

    def test_existing_output_is_not_overwritten(self):
        self.write(self.output / "sentinel.txt", "keep")
        with self.assertRaisesRegex(ValueError, "already exists"):
            assemble(self.portal, self.word, self.pdf, self.output)
        self.assertEqual((self.output / "sentinel.txt").read_text(), "keep")

    def test_rejects_private_file_in_manual_before_writing(self):
        self.write(self.pdf / ".env.synthetic", "not-a-real-credential")
        with self.assertRaisesRegex(ValueError, "Private/generated"):
            assemble(self.portal, self.word, self.pdf, self.output)
        self.assertFalse(self.output.exists())

    def test_missing_anchor_fails_combined_validation(self):
        assemble(self.portal, self.word, self.pdf, self.output)
        self.write(self.output / "pdf/manual/index.html", '<link rel="canonical" href="https://ratools.qzz.io/pdf/manual/">')
        self.assertTrue(any("Missing anchor" in error for error in check(self.output)["errors"]))

    def test_refuses_output_outside_owned_directories(self):
        with self.assertRaises(ValueError):
            assemble(self.portal, self.word, self.pdf, self.portal / "assets/output")
        self.assertFalse((self.portal / "assets/output").exists())

    def test_wrong_canonical_fails_combined_validation(self):
        assemble(self.portal, self.word, self.pdf, self.output)
        self.write(self.output / "pdf/404.html", '<link rel="canonical" href="https://example.invalid/pdf/404/">')
        self.assertTrue(any("Wrong canonical" in error for error in check(self.output)["errors"]))


if __name__ == "__main__":
    # No destructive tearDown: local fixtures are recycled after validation;
    # hosted CI keeps them only inside its disposable workspace.
    unittest.main(verbosity=2)
