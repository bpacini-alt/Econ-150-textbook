# Working in this repository

This file is for every collaborator, human or AI (Claude, ChatGPT/Codex). Read it before changing anything, then read:

- `REPOSITORY-HOUSEKEEPING.md`: how collaborators coordinate, and the cleanup rules
- `PROJECT-PRIORITIES.md`: what matters most right now and what is deliberately deferred

Those two documents are identical in both textbook repositories (`edcor-310-textbook` and `Econ-150-textbook`). Keep them that way: a change to one goes into the other in a matching pull request.

## The short version

1. Start from the current `main`. Check open pull requests and the last few merges for the same task.
2. Claim the work: open a draft pull request titled with the task as soon as you start.
3. Every change goes through a branch and a pull request. Never push directly to `main`.
4. Before you ask for review, open the pull request's **Files changed** tab and confirm it touches only the files you meant to change.
5. Merging is Benjamin's approval. Don't merge, close, or overwrite someone else's pull request.
6. Ask Benjamin before deleting files or branches.

## How this book is built (Econ 150)

The website is econ.benjaminpacini.com, served by Cloudflare directly from the `etb-live/` folder (see `wrangler.jsonc`).

| Folder or file | What it is | Edit it? |
|---|---|---|
| `etb-live/` | The chapter pages as published. `build/wrap_pages.py` adds a page header and the audio player to each chapter, between marker comments | Yes, but only the chapter's own HTML, **between** the `ETB PAGE HEADER` and `ETB PAGE FOOTER` markers. The script rewrites everything outside them. |
| `etb-live/navigation.js` | The Previous / Home / Next bar | Yes |
| `etb-live/index.html` | The book's home page | Yes |
| `etb-live/assets/` | Copies of the audio player placed by `wrap_pages.py` | **Never by hand.** Edit `audio/player/` and rerun the script. |
| `build/wrap_pages.py` | Adds the page header and player to each chapter | Yes |
| `site/` | An old placeholder page. Cloudflare does not serve it. | No. Benjamin decides whether to remove it. |
| `original/` | The October 2026 import from Google Drive, including older chapter versions and drafts | No. Archive only. |

After adding a chapter or changing the player, run `python3 build/wrap_pages.py` from the repository root and commit the result in the same pull request.

## Shared between the two books

- **Audio player:** `audio/player/etb-audio.js` and `audio/player/etb-audio.css` are the one place to edit the player, and both repositories must carry identical copies. Change both in matching pull requests. Never edit the copies the builds place in the published folder.
- **Covers:** the full-size EdTechBooks cover is archived at `etb-live/cover.png`. The web version, cleaned up for the new site, is `build/cover-web.png`.

## Known Cloudflare behavior

Cloudflare's build check shows a red X on every branch and pull request. That comes from Cloudflare's preview-build settings, not from the changes. The build that matters runs on `main` after a merge. After merging, open the live site and check the pages you changed.

## Writing for students

Anything students read should be clear and simple, in a plain human voice. Use AI-cadence constructions sparingly: reveal pairs, drumroll setups, strings of fragments, punchy pairs, "not this, but that."

## Open decision

The two books are built differently (see "How this book is built"). Benjamin has not yet decided whether to make them match. Until he does, follow each repository's own method and don't convert one to the other.
