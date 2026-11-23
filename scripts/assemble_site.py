"""Assemble the portal and two verified static manuals into a NEW directory."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import stat
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://ratools.qzz.io"
PORTAL_FILES = ("index.html", "404.html", "CNAME", "robots.txt", "sitemap.xml")
PORTAL_DIRS = ("assets", "locales")
PUBLIC_EXTENSIONS = {".html", ".css", ".js", ".mjs", ".json", ".svg", ".png", ".jpg", ".jpeg",
                     ".webp", ".gif", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".wasm",
                     ".xml", ".txt", ".pagefind", ".pf_meta", ".pf_index", ".pf_fragment", ".pf_filter"}
PRIVATE_DIRS = {"node_modules", "backups", "tests", "scripts", "release", "bin", "obj"}


def assert_plain(path: Path, *, walk_parents: bool = False) -> None:
    candidates = (path, *path.parents) if walk_parents else (path,)
    for candidate in candidates:
        if not candidate.exists() and not candidate.is_symlink():
            continue
        info = candidate.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(info, "st_file_attributes", 0) & 0x400:
            raise ValueError("Linked or reparse paths are not accepted")
        if stat.S_ISREG(info.st_mode) and info.st_nlink > 1:
            raise ValueError("Hard-linked files are not accepted")


def public_files(directory: Path):
    assert_plain(directory, walk_parents=True)
    if not directory.is_dir():
        raise ValueError("Static source directory is missing")
    for child in sorted(directory.iterdir()):
        assert_plain(child)
        if child.name.startswith(".") or child.name.lower() in PRIVATE_DIRS:
            raise ValueError("Private/generated source entry found inside public assets")
        if child.is_dir():
            yield from public_files(child)
        elif child.is_file() and child.suffix.lower() in PUBLIC_EXTENSIONS:
            yield child
        else:
            raise ValueError("Unexpected file type in static assets")


def validate_manual(directory: Path, mount: str) -> None:
    assert_plain(directory, walk_parents=True)
    for relative in ("index.html", "manual/index.html", "404.html", "pagefind/pagefind.js",
                     "pagefind/pagefind-entry.json", "sitemap-index.xml"):
        file = directory / relative
        assert_plain(file, walk_parents=True)
        if not file.is_file():
            raise ValueError(f"Incomplete {mount} manual: missing {relative}")
    metadata = json.loads((directory / "pagefind/pagefind-entry.json").read_text(encoding="utf-8"))
    chinese = metadata.get("languages", {}).get("zh-cn", {})
    if not isinstance(chinese.get("page_count"), int) or chinese["page_count"] < 2:
        raise ValueError(f"Missing Chinese search index for {mount}")
    sitemap = directory / "sitemap-0.xml"
    assert_plain(sitemap)
    locations = [element.text or "" for element in ET.parse(sitemap).iter() if element.tag.endswith("}loc")]
    prefix = f"{ORIGIN}/{mount}/"
    if prefix not in locations or not all(location.startswith(prefix) for location in locations):
        raise ValueError(f"Wrong site/base for {mount}: rebuild for {prefix}")


def assemble(portal: Path, word: Path, pdf: Path, output: Path) -> dict:
    for source in (portal, word, pdf):
        assert_plain(source, walk_parents=True)
    assert_plain(output, walk_parents=True)
    portal, word, pdf, output = (p.resolve() for p in (portal, word, pdf, output))
    if output.exists():
        raise ValueError("Output already exists; choose a new directory or recycle the old output")
    relative = output.relative_to(portal)
    if not relative.parts or relative.parts[0] not in {"_site", ".artifacts"}:
        raise ValueError("Output must be inside the portal _site or .artifacts directory")
    if relative.parts[0] == "_site" and len(relative.parts) != 1:
        raise ValueError("Use portal/_site or a fresh portal/.artifacts run directory")
    for source in (word, pdf):
        if output.is_relative_to(source) or source.is_relative_to(output):
            raise ValueError("Output must not overlap a manual input")

    validate_manual(word, "word")
    validate_manual(pdf, "pdf")
    copies: list[tuple[Path, Path]] = []
    for name in PORTAL_FILES:
        source = portal / name
        assert_plain(source, walk_parents=True)
        if not source.is_file():
            raise ValueError(f"Missing portal file: {name}")
        copies.append((source, output / name))
    if (portal / "CNAME").read_text(encoding="utf-8").strip() != "ratools.qzz.io":
        raise ValueError("Unexpected portal CNAME")
    for name in PORTAL_DIRS:
        for source in public_files(portal / name):
            copies.append((source, output / source.relative_to(portal)))
    for mount, directory in (("word", word), ("pdf", pdf)):
        for source in public_files(directory):
            copies.append((source, output / mount / source.relative_to(directory)))

    # All source validation precedes the first write. Never clone the whole repository.
    output.mkdir(parents=True)
    for source, destination in copies:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
    (output / ".nojekyll").write_text("", encoding="utf-8")
    with (output / "robots.txt").open("a", encoding="utf-8") as stream:
        stream.write(f"\nSitemap: {ORIGIN}/word/sitemap-index.xml\nSitemap: {ORIGIN}/pdf/sitemap-index.xml\n")
    result = {"copied_files": len(copies), "manuals": ["/word/", "/pdf/"], "output": str(output)}
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--word-dist", required=True, type=Path)
    parser.add_argument("--pdf-dist", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(assemble(ROOT, args.word_dist, args.pdf_dist, args.output), ensure_ascii=False, indent=2))
        return 0
    except (ValueError, OSError, ET.ParseError) as error:
        print(f"Assembly refused: {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
