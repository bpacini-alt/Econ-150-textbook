#!/usr/bin/env python3
"""
wrap_pages.py — turn each chapter file in etb-live/ into a complete web page
and add the audio player.

The site serves etb-live/ directly (see wrangler.jsonc). The chapter files came
from EdTechBooks as bare fragments with no page header, so phones showed them as
zoomed-out desktop pages. This script gives every page:

  - a page header: doctype, character set, the phone-width (viewport) setting,
    and a page title from etb-live/manifest.json
  - the audio player (Listen button, docked player, text-only view), loaded
    from etb-live/assets/
  - a one-line fix that keeps chapters from being wider than a phone screen

It also copies the player from audio/player/ into etb-live/assets/, so
audio/player/ stays the one place to edit the player, and builds the Joy of
Econ reading menu (etb-live/joy-of-econ.html) from menus/joy-of-econ.json.

Run it from the repo root after adding a chapter or changing the player:

    python3 build/wrap_pages.py

It is safe to run again. The added lines sit between marker comments, and a
second run replaces them instead of adding a second copy. The chapter's own
HTML between the markers is never changed.
"""

import html
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "etb-live"
PLAYER = ROOT / "audio" / "player"
ASSETS = SITE / "assets"
BOOK = "Econ 150"
SKIP = {"index.html"}  # already a complete page

HEAD_END = "<!-- /ETB PAGE HEADER -->"
FOOT_START = "<!-- ETB PAGE FOOTER -->"

HEADER = """<!doctype html>
<html lang="en">
<head>
<!-- ETB PAGE HEADER: added by build/wrap_pages.py. Edit the chapter below the marker, not this header. -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="assets/etb-audio.css">
<style>
/* Keeps hidden hover definitions from making the page wider than a phone screen. */
.etb{{overflow-x:clip}}
</style>
</head>
<body>
""" + HEAD_END + "\n"

FOOTER = "\n" + FOOT_START + """
<script src="assets/report.js" data-book="Econ 150" defer></script>
<script src="assets/etb-audio.js"></script>
</body>
</html>
"""


def unwrap(text):
    """Return the chapter's own HTML, removing a header and footer from an earlier run."""
    if HEAD_END in text:
        text = text.split(HEAD_END + "\n", 1)[1]
    if FOOT_START in text:
        text = text.rsplit("\n" + FOOT_START, 1)[0]
    return text


def main():
    ASSETS.mkdir(exist_ok=True)
    for name in ("etb-audio.js", "etb-audio.css"):
        shutil.copyfile(PLAYER / name, ASSETS / name)
    # The Report a problem button; feedback/report.js is the one place to edit it.
    shutil.copyfile(ROOT / "feedback" / "report.js", ASSETS / "report.js")

    titles = {c["file"]: c["title"] for c in json.loads((SITE / "manifest.json").read_text(encoding="utf-8"))["chapters"]}
    wrapped, skipped = 0, []
    for page in sorted(SITE.glob("*.html")):
        if page.name in SKIP:
            continue
        with open(page, encoding="utf-8", newline="") as f:  # keep the file's own line endings
            text = f.read()
        if not text.strip():
            skipped.append(page.name + " (empty)")
            continue
        body = unwrap(text)
        if body.lstrip()[:15].lower().startswith("<!doctype"):
            skipped.append(page.name + " (already a full page)")
            continue
        title = titles.get(page.name, page.stem)
        with open(page, "w", encoding="utf-8", newline="") as f:
            f.write(HEADER.format(title=html.escape(f"{title} · {BOOK}")) + body + FOOTER)
        wrapped += 1

    print(f"Wrapped {wrapped} pages; player copied to {ASSETS.relative_to(ROOT)}/")
    for s in skipped:
        print("  skipped", s)

    # The Joy of Econ reading menu: a complete page built from menus/joy-of-econ.json,
    # so the loop above skips it as "already a full page".
    import subprocess
    import sys
    subprocess.run(
        [sys.executable, str(ROOT / "menus" / "build_menu.py"),
         str(ROOT / "menus" / "joy-of-econ.json"), str(SITE / "joy-of-econ.html")],
        check=True,
    )


if __name__ == "__main__":
    main()
