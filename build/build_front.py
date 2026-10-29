"""Build the book's front pages into etb-live/:

  etb-live/index.html            the cover
  etb-live/contents/index.html   the table of contents
  etb-live/assets/book.css       styles for those pages
  etb-live/assets/cover.jpg      the web-sized cover image

The page design is frontmatter/frontmatter.py, shared with EDCOR 310 (keep the two copies
identical). This script supplies Econ 150's own data and colors.

The units and chapter titles below are the book's table of contents; edit them here.
Each chapter's subtitle is read from its own title card, so a subtitle is fixed in the chapter.

Run from the repository root:  python3 build/build_front.py
"""
import html
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "etb-live"
sys.path.insert(0, str(ROOT / "frontmatter"))
import frontmatter  # noqa: E402  (shared with EDCOR 310)

BOOK = {
    "title": "Principles of Microeconomics",
    "subtitle": "The Science of Choice, Incentives, and Human Flourishing",
    "course": "Econ 150",
    "school": "Brigham Young University–Idaho",
    "byline": "Benjamin Pacini, Ed.D.",
    "site": "https://econ.benjaminpacini.com",
    "cover_alt": "Book cover: a satellite photo of the Korean peninsula at night. South Korea is full of light; North Korea is almost completely dark.",
}

# Colors from the cover: night navy, with brass for numerals and labels.
THEME = {
    "accent": "#1b2430", "accent_hover": "#2c3a4c", "numeral": "#94702c",
    "badge_bg": "#1b2430", "badge_fg": "#e0b866", "kicker": "#85601f",
    "tint": "#f7f2e8", "tint_line": "#e0cfa6", "watermark": "#f5f0e6",
}

FRONT = [
    ("i", "Introduction: The Wealth of Nations", "introduction.html"),
    ("ii", "How to Get the Most Out of This Book", "how-to-get-the-most-out-of-this-book.html"),
    ("iii", "Algebra Review", "Chapter0.html"),
    ("iv", "Joy of Econ", "joy-of-econ.html"),
]

UNITS = [
    ("I", "The Case for the Market", [
        (1, "Thinking Like an Economist"),
        (2, "Consumer Choice"),
        (3, "Supply and Demand I: The Price System"),
        (4, "Supply and Demand II: Shifts, Shocks, and Price Controls"),
        (5, "Trade, Specialization, and Efficiency"),
        (6, "Welfare Analysis"),
        (7, "Intervention Distortions I: Taxes, Subsidies, and Incidence"),
        (8, "Gains from Trade: The Case for International Cooperation"),
    ]),
    ("II", "The Logic of Competition", [
        (9, "Firm Model I: Costs"),
        (10, "Firm Model II: Short-Run Decisions"),
        (11, "Firm Model III: Long-Run Decisions"),
        (12, "Factor Markets"),
        (13, "Labor Markets and Discrimination"),
        (14, "Unit Capstone: The Free Market Prescription for Poverty"),
    ]),
    ("III", "The Critique of the Market", [
        (15, "Elasticity"),
        (16, "Institutions"),
        (17, "Market Failures I: The Tragedy of the Commons"),
        (18, "Market Failures II: Externalities"),
        (19, "Market Failures III: Taxes, Subsidies, and Incentives"),
        (20, "Unit Capstone: The Economics of Healthcare"),
    ]),
    ("IV", "When Competition Breaks Down", [
        (21, "Market Power I: Monopoly"),
        (22, "Market Power II: Addressing Market Power"),
        (23, "Imperfect Competition I: Monopolistic Competition"),
        (24, "Imperfect Competition II: Oligopoly, Cartels, and Collusion"),
        (25, "Behavioral Economics"),
        (26, "The Case for (and Limits of) Markets"),
    ]),
]

# A small subheading inside a unit, shown on the contents page before the chapter it names.
DIVIDERS = {25: "The Closing Reckoning"}

# One or two sentences under each unit's name on the contents page. Empty until written.
HOOKS = {
    "I": "Nobody is in charge of London's bread, and the shelves are full every morning anyway. "
         "This unit is about how that happens, and why it leaves economists a little starry-eyed about prices.",
    "II": "Airlines fly billions of people every year and still barely make money; Warren Buffett once joked that "
          "a farsighted investor at Kitty Hawk would have shot Orville Wright down. That's competition doing its job, "
          "rough on the airline and great for anyone buying a ticket. This unit follows a firm's costs to see how it "
          "happens, and what the same pressure means for the people it hires.",
    "III": "A student can walk away from a twelve-dollar sandwich. A patient can't walk away from insulin. "
           "This unit looks at where markets start to struggle: when buyers can't leave, when nobody owns the lake, "
           "when the cost lands on someone who never agreed to the deal, and in healthcare, where it all happens at once.",
    "IV": "Some companies get big because millions of people keep choosing them. Others get big because they own "
          "the only bridge into town, or because their lobbyists won them protection from competitors, which economists "
          "call rent-seeking. This unit is about telling the two apart, and it ends with a question markets can't answer "
          "for us: they're very good at getting us what we want, so what should we want?",
}


def subtitle(file):
    page = (SITE / file).read_text(encoding="utf-8")
    m = re.search(r'class="etb-title-sub"[^>]*>(.*?)</', page, re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m.group(1)))).strip() if m else ""


def build_cover_image():
    im = Image.open(ROOT / "build" / "cover-web.png").convert("RGB")
    w = 600
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    (SITE / "assets").mkdir(exist_ok=True)
    im.save(SITE / "assets" / "cover.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    return im.size


def main():
    width, height = build_cover_image()
    n_chapters = sum(len(chs) for _, _, chs in UNITS)
    units = []
    for i, (roman, title, chs) in enumerate(UNITS, 1):
        nums = [n for n, _ in chs]
        units.append({
            "roman": roman, "kicker": f"Unit {i} · Chapters {min(nums)}–{max(nums)}", "title": title,
            "hook": HOOKS.get(roman, ""), "outcomes": [],
            "chapters": [{"n": str(n), "t": t, "s": subtitle(f"Chapter{n}.html"), "m": "", "href": f"/Chapter{n}.html",
                          "divider": DIVIDERS.get(n, "")}
                         for n, t in chs],
        })
    book = dict(BOOK)
    book.update({
        "footer_html": [f"© 2026 {html.escape(BOOK['byline'].split(',')[0])}.", f"{BOOK['course']} · {BOOK['school']}"],
        "cover": {"src": "/assets/cover.jpg", "width": width, "height": height, "alt": BOOK["cover_alt"]},
        "theme": THEME,
        "stats": f"{n_chapters} chapters in {len(units)} units · free and open",
        "contents_sub": f"{n_chapters} chapters in {len(units)} units",
        "count": str(n_chapters),
        "front": [{"n": n, "t": t, "s": subtitle(f), "m": "", "href": "/" + f} for n, t, f in FRONT],
        "units": units,
        "about": None,
    })
    for path, content in frontmatter.render(book).items():
        out = SITE / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(content, encoding="utf-8")
        print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
