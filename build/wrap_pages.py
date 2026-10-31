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
import urllib.parse
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
<link rel="stylesheet" href="assets/page-rating.css">
<style>
/* Keeps hidden hover definitions from making the page wider than a phone screen. */
.etb{{overflow-x:clip}}
/* Pop-up definitions: open on tap and on keyboard focus too (see TIP_JS below). */
[data-tip].tip-open::after,[data-tip]:focus-visible:not(.tip-hide)::after{{opacity:1}}
[data-tip].tip-hide::after{{opacity:0 !important}}
[data-tip]:focus-visible,.etb-ak-item:focus-visible{{outline:2px solid #2a7a4f;outline-offset:2px;border-radius:2px}}
</style>
</head>
<body>
""" + HEAD_END + "\n"

# Pop-up definitions ([data-tip]) and "Also know" terms (.etb-ak-item): tap a term to
# open or close it, Tab to a term to open it, Escape to close it, and Enter or Space
# to open an Also-know term. The click listener runs first (capture phase) and stops
# the click there, so each chapter's older tap script doesn't toggle a second time.
# EDCOR 310's build/build_site.py carries the same script.
TIP_JS = """<script>
(function () {
  function closeAll(keep) {
    document.querySelectorAll('[data-tip].tip-open').forEach(function (t) { if (t !== keep) t.classList.remove('tip-open'); });
  }
  document.querySelectorAll('[data-tip], .etb-ak-item').forEach(function (t) {
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0');
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-tip]') : null;
    if (!t) { closeAll(); return; }
    e.stopPropagation();
    var open = t.classList.contains('tip-open');
    closeAll(t);
    t.classList.toggle('tip-open', !open);
    t.classList.toggle('tip-hide', open);
  }, true);
  document.addEventListener('keydown', function (e) {
    var t = document.activeElement;
    if (!t || !t.matches) return;
    if (e.key === 'Escape' && t.matches('[data-tip]')) { t.classList.remove('tip-open'); t.classList.add('tip-hide'); }
    if ((e.key === 'Enter' || e.key === ' ') && t.matches('.etb-ak-item')) { e.preventDefault(); t.click(); }
  });
  document.addEventListener('focusout', function (e) {
    if (e.target.matches && e.target.matches('[data-tip]')) e.target.classList.remove('tip-hide', 'tip-open');
  });
})();
</script>"""

FOOTER = "\n" + FOOT_START + "\n" + TIP_JS + """
<script src="assets/report.js" data-book="Econ 150" defer></script>
<script src="assets/page-rating.js"></script>
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
    shutil.copyfile(ROOT / "feedback" / "page-rating.js", ASSETS / "page-rating.js")
    shutil.copyfile(ROOT / "feedback" / "page-rating.css", ASSETS / "page-rating.css")

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
        rating = ""
        if title.startswith("Chapter "):
            page_id = page.stem.lower()
            rating = f'<!-- PAGE RATING START -->\n<div class="etb-page-rating-config" data-page-rating data-book="econ-150" data-page="{page_id}" hidden></div>\n<!-- /PAGE RATING -->'
        rendered = HEADER.format(title=html.escape(f"{title} · {BOOK}")) + body + rating + FOOTER
        if page.name in titles and body.strip():
            edit_path = urllib.parse.quote("etb-live/" + page.name, safe="/")
            edit_link = f'<a class="etb-author-edit" href="/editor/?book=econ-150&amp;path={edit_path}">Edit</a>'
            edit_style = '<style>.etb-author-edit{position:fixed;right:14px;top:14px;z-index:2000;background:#1b2430;color:#fff;padding:7px 11px;border-radius:6px;font:600 12px Arial,sans-serif;text-decoration:none;opacity:.78}.etb-author-edit:hover{opacity:1}</style>\n'
            rendered = rendered.replace("<body>\n", "<body>\n" + edit_style + edit_link + "\n", 1)
        with open(page, "w", encoding="utf-8", newline="") as f:
            f.write(rendered)
        wrapped += 1

    # Private prose editor; Access protects /editor/* and the Worker checks its JWT.
    (SITE / "editor").mkdir(exist_ok=True)
    shutil.copyfile(ROOT / "editor" / "index.html", SITE / "editor" / "index.html")
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
