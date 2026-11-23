"""Check the assembled portal, both manual mounts, local assets and anchors."""
from __future__ import annotations

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from assemble_site import ORIGIN, PORTAL_DIRS, PORTAL_FILES, public_files, validate_manual


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.canonical = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(values["id"])
        if tag == "link" and values.get("rel") == "canonical":
            # Canonical metadata is checked against its mount separately. Static
            # 404.html commonly declares /404/, which is not an output directory.
            self.canonical = values.get("href")
            return
        for key in ("href", "src", "poster", "data-lightbox"):
            if values.get(key):
                self.references.append(values[key])
        if values.get("srcset"):
            self.references.extend(part.strip().split()[0] for part in values["srcset"].split(",") if part.strip())


def check(site: Path) -> dict:
    site = site.resolve()
    allowed = {*PORTAL_FILES, *PORTAL_DIRS, "word", "pdf", ".nojekyll"}
    errors = []
    if {child.name for child in site.iterdir()} != allowed:
        errors.append("Unexpected or missing top-level published entry")
    for mount in ("word", "pdf"):
        validate_manual(site / mount, mount)
        list(public_files(site / mount))
    for directory in PORTAL_DIRS:
        list(public_files(site / directory))
    pages = {file.resolve(): Page(file.read_text(encoding="utf-8")) for file in site.rglob("*.html")}
    checked = 0
    mounts = {}
    for file, page in pages.items():
        relative = file.relative_to(site).as_posix()
        route = relative.removesuffix("index.html") if relative.endswith("index.html") else relative
        current = f"{ORIGIN}/{route}"
        mount = relative.split("/")[0]
        if mount in ("word", "pdf"):
            mounts[mount] = mounts.get(mount, 0) + 1
            if not page.canonical or not page.canonical.startswith(f"{ORIGIN}/{mount}/"):
                errors.append(f"Wrong canonical: {relative}")
        for reference in page.references:
            parsed = urlsplit(urljoin(current, reference))
            if parsed.scheme not in ("http", "https") or parsed.netloc.lower() != "ratools.qzz.io":
                continue
            target = (site / unquote(parsed.path).lstrip("/")).resolve()
            if not target.is_relative_to(site):
                errors.append(f"Escaped site: {relative}")
                continue
            if target.is_dir():
                target /= "index.html"
            checked += 1
            if not target.is_file():
                errors.append(f"Missing target: {relative} -> {reference}")
            elif parsed.fragment and target.suffix == ".html" and unquote(parsed.fragment) not in pages[target].ids:
                errors.append(f"Missing anchor: {relative} -> {reference}")
    home = pages.get(site / "index.html")
    if not home or not {"word/", "pdf/"}.issubset(home.references):
        errors.append("Portal homepage must link to both manuals")
    if (site / "CNAME").read_text(encoding="utf-8").strip() != "ratools.qzz.io":
        errors.append("Wrong CNAME")
    robots = (site / "robots.txt").read_text(encoding="utf-8")
    for mount in ("word", "pdf"):
        if f"{ORIGIN}/{mount}/sitemap-index.xml" not in robots:
            errors.append(f"Missing {mount} sitemap discovery")
    return {"html_pages": len(pages), "manual_html_pages": mounts,
            "local_links_and_assets": checked, "errors": errors}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-dir", required=True, type=Path)
    args = parser.parse_args()
    try:
        result = check(args.site_dir)
    except (ValueError, OSError) as error:
        print(f"Site validation failed: {error}")
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return int(bool(result["errors"]))


if __name__ == "__main__":
    raise SystemExit(main())
