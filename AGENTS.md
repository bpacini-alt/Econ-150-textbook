# Working in this repository

This file is for every collaborator, human or AI (Claude, ChatGPT/Codex). Read it before changing anything, then read:

- `REPOSITORY-HOUSEKEEPING.md`: how collaborators coordinate, and the cleanup rules
- `PROJECT-PRIORITIES.md`: what matters most right now and what is deliberately deferred

Those two documents are identical in both textbook repositories (`edcor-310-textbook` and `Econ-150-textbook`). Keep them that way: a change to one goes into the other in a matching pull request.

## The short version

1. Start from the current `main`. Check open pull requests and the last few merges for the same task.
2. Claim the work: open a draft pull request titled with the task as soon as you start.
3. Every collaborator change goes through a branch and a pull request. The private prose editor is the documented exception: Benjamin's Save and publish action commits chapter prose directly to `main`.
4. Before you ask for review, open the pull request's **Files changed** tab and confirm it touches only the files you meant to change.
5. Merging is Benjamin's approval. Don't merge, close, or overwrite someone else's pull request.
6. Ask Benjamin before deleting files or branches.

## How this book is built (Econ 150)

The website is econ.benjaminpacini.com, served by Cloudflare directly from the `etb-live/` folder (see `wrangler.jsonc`). Requests to `/api/*` go to `feedback/worker.js` instead.

| Folder or file | What it is | Edit it? |
|---|---|---|
| `etb-live/` | The chapter pages as published. `build/wrap_pages.py` adds a page header and the audio player to each chapter, between marker comments | Yes, but only the chapter's own HTML, **between** the `ETB PAGE HEADER` and `ETB PAGE FOOTER` markers. The private editor changes the page prose and commits it directly. |
| `etb-live/images/` | Chapter images, copied from EdTechBooks and kept at the same paths the pages use (`/images/content_images/…`) | Yes |
| `etb-live/navigation.js` | The Previous / Home / Next bar | Yes |
| `etb-live/index.html`, `etb-live/contents/index.html` | The cover and the table of contents, **generated** by `build/build_front.py` | **Never by hand.** Edit the units and chapter titles in `build/build_front.py`; each chapter's subtitle comes from its own title card. |
| `build/build_front.py` | Builds the cover, the contents page, `etb-live/assets/book.css`, and `etb-live/assets/cover.jpg` | Yes |
| `etb-live/assets/` | Copies of the audio player and report button placed by `wrap_pages.py` | **Never by hand.** Edit `audio/player/` or `feedback/` and rerun the script. |
| `build/wrap_pages.py` | Adds the page header, the audio player, and the Report a problem button to each chapter | Yes |
| `feedback/` | The Report a problem button and the function that receives reports | Yes (see "Shared") |
| `menus/` | The Joy of Econ reading menu: `joy-of-econ.json` holds every reading. `build/wrap_pages.py` turns it into `etb-live/joy-of-econ.html`, which is never edited by hand | Yes, the data file (see `menus/README.md` and "Shared") |
| `site/` | An old placeholder page. Cloudflare does not serve it. | No. Benjamin decides whether to remove it. |
| `original/` | The October 2026 import from Google Drive, including older chapter versions and drafts | No. Archive only. |

After adding a chapter, changing the player, or editing anything in `menus/`, run `python3 build/wrap_pages.py` from the repository root and commit the result in the same pull request.

After adding or renaming a chapter, or changing a chapter's subtitle, run `python3 build/build_front.py` as well, so the contents page matches.

## Private prose editor

# Private prose editor

The book pages include an **Edit** link for the content pages listed in `etb-live/manifest.json`. The editor is served at `/editor/`; Cloudflare Access must protect `econ.benjaminpacini.com/editor/*`. The Worker also validates the Access JWT and allows only the three email addresses in `feedback/worker.js`.

For each Worker, set these top-level Worker variables and secrets in Cloudflare:

- Text variable `ACCESS_TEAM_DOMAIN`: the full Access team origin, such as `https://your-team.cloudflareaccess.com`.
- Text variable `ACCESS_AUD`: the Application Audience tag for that book's `/editor/*` Access application.
- Secret `EDITOR_GITHUB_TOKEN`: a fine-grained token with Contents: Read and write for this textbook repository only.

The two repositories use the same `feedback/worker.js` and `editor/index.html`, but each has its own Access application audience and its own Worker secret. The token is never stored in Git or sent to the browser.

The editor writes to `main` when Benjamin selects **Save and publish**. Econ 150's source page is also its published page, so one file is committed. Cloudflare deploys the commit through the repository's existing deployment connection.

The editor changes only page text. It keeps every style, script, and link the page already has, and it refuses to publish if a save would remove any of them. (An earlier version stripped scripts inside the page, which would have broken interactive widgets; see the October 24, 2026 fix.)

## Shared between the two books

- **Audio player:** `audio/player/etb-audio.js` and `audio/player/etb-audio.css` are the one place to edit the player, and both repositories must carry identical copies. Change both in matching pull requests. Never edit the copies the builds place in the published folder.
- **Report a problem button:** `feedback/report.js` (the button and form) and `feedback/worker.js` (receives reports at `/api/report` and files each one as an issue in the private `bpacini-alt/textbook-feedback` repository) are shared the same way as the audio player: identical copies in both repositories, changed in matching pull requests. The builds copy `report.js` into the published folder; never edit that copy. The function needs a `GITHUB_TOKEN` secret, set in each Worker's settings in Cloudflare. It never goes in the repository.
  - **Where it goes:** Worker → **Settings** → the top-level **Variables and Secrets** section → **Add variable**, Type **Secret**, then **Deploy**. Not the "Variables and secrets" box inside the **Build** section: that one is only available while the site builds, and the button can't see it. A plain **Text** variable gets wiped by the next deploy, so it must be a Secret.
  - **The token:** a fine-grained GitHub token limited to `textbook-feedback`, with Issues: Read and write. It expires yearly. To renew, regenerate it on GitHub and click **Rotate** on the secret in both Workers. If the button says "That didn't send," a missing or expired token is the first thing to check (the function answers `not_configured` when it has none).
- **Joy reading menus:** `menus/build_menu.py`, `menus/joy-menu.css`, and `menus/joy-menu.js` are identical in both repositories and change in matching pull requests. Each repository keeps its own menu data (`menus/joy-of-learning.json` in EDCOR 310, `menus/joy-of-econ.json` here in Econ 150). See `menus/README.md`.
- **Front pages:** `frontmatter/frontmatter.py` draws both books' cover, contents, and About pages from one design. Both repositories carry identical copies; change it in matching pull requests. Each book passes its own titles, chapters, and colors from its build script (EDCOR 310: `build/build_site.py`; Econ 150: `build/build_front.py`). Never edit the generated pages by hand.
- **Covers:** the full-size EdTechBooks cover is archived at `etb-live/cover.png`. The web version, cleaned up for the new site, is `build/cover-web.png`.

## Known Cloudflare behavior

Every pull request gets a Cloudflare preview. A few minutes after you push, Cloudflare's bot comments on the pull request with a preview address (for example `https://<branch-name>-science-of-learning.bpacini.workers.dev` for EDCOR 310, or `…-econ-150-textbook.bpacini.workers.dev` for Econ 150). Use it to check the pages you changed before asking Benjamin to merge, and give him the links. The live site updates after a merge to `main`; after merging, open the live site and check the pages you changed.

## Writing for students

Anything students read should be clear and simple, in a plain human voice. Use AI-cadence constructions sparingly: reveal pairs, drumroll setups, strings of fragments, punchy pairs, "not this, but that."

## Open decision

The two books are built differently (see "How this book is built"). Benjamin has not yet decided whether to make them match. Until he does, follow each repository's own method and don't convert one to the other.
