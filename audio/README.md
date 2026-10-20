# Chapter audio

**Status:** the player is finished for stage 1 (device voice) and tested on every Econ 150 chapter. It is not on any live chapter yet. It goes in when the books move to the new website. See "Adding the player to the website" below.

This folder replaces the books' old audio version, which read the HTML along with the prose and often didn't work. The long-term plan is narration in Benjamin's own voice, generated with ElevenLabs. Until the chapters are polished, the same player reads each chapter with the student's own device voice. That costs nothing, needs no audio files, and always matches the current text.

## Decisions so far

- **Stage 1 now:** the player reads chapters with the device's built-in voice. No audio files are generated while chapters are still being edited.
- **Stage 2 later, one chapter at a time:** after a chapter's final edit pass, generate its narration in Benjamin's cloned voice with ElevenLabs.
- **Recordings live in the book's GitHub repo** next to the chapters, and the website serves them from there.
- **The player goes in when the books move to the new website**, added by the site's build step. Chapter files on EdTechBooks are not edited by hand.
- **One player for both books.** EDCOR 310 and Econ 150 use the same etb design system, and the player handles both. This repo and the EDCOR 310 repo carry identical copies of `player/`. A change to one should be copied to the other, or both books can load a single shared copy once the website exists.

## Adding the player to the website

The player is two files: `player/etb-audio.js` and `player/etb-audio.css`. Nothing inside a chapter file needs to change. The website's build step adds the player when it turns each chapter into a full page.

**1. Copy the two files into the site,** for example to `site/assets/etb-audio.js` and `site/assets/etb-audio.css`. If both books share one copy (for example on benjaminpacini.com), a fix to the player updates both books at once.

**2. On every chapter page, load them after the chapter's HTML:**

```html
<head>
  …
  <link rel="stylesheet" href="/assets/etb-audio.css">
  <style>.etb{overflow-x:clip}</style>  <!-- phone-width fix, see "Something found along the way" -->
</head>
<body>
  … the chapter's HTML, unchanged …
  <script src="/assets/etb-audio.js"></script>
</body>
```

The script has to come after the chapter (at the end of `<body>`, or in `<head>` with `defer`). It looks for the chapter's `.etb` container and the title card, then adds everything else on its own. A page without an etb chapter is left alone.

**3. That's all for stage 1.** Every chapter gets the Listen button, the section links, the player, and the text-only view.

**4. Stage 2, for a chapter with recordings:** add this block to that chapter's page, before the script tag. The player then plays the MP3s instead of the device voice.

```html
<script type="application/json" id="etb-audio-data">
{
  "book": "econ150",
  "book_title": "Econ 150 · Principles of Microeconomics",
  "author": "Benjamin Pacini",
  "chapter": "15",
  "base": "/audio/ch15/",
  "full_url": "/audio/ch15/chapter15-full.mp3",
  "sections": [
    { "id": "intro", "title": "Elasticity", "label": "Introduction", "audio": "01-intro.mp3", "est_seconds": 295 },
    { "id": "concept-1", "title": "Price Elasticity of Demand", "label": "Concept 1", "audio": "02-concept-1.mp3", "est_seconds": 613 }
  ]
}
</script>
```

The build step can write this block from a section list (see `tools/build_preview.py`, which already does it for previews). Section `id`s must match the player's: `intro`, `concept-1`, `concept-2`, and so on, then `applications`, `synthesis`, `synth`, `recap`, or `ledger` for closing blocks.

**To try it before the site exists,** open any page in `preview/`, or build one for another chapter:

```
python3 audio/tools/build_preview.py etb-live/Chapter9.html audio/preview/chapter9.html
```

## Two stages, one player

**Stage 1: device voice (now).** The player pulls the readable prose out of the chapter in the browser and reads it with the voice built into the student's device. It highlights each sentence as it goes. Nothing is generated or uploaded, and edits to a chapter show up in the audio immediately.

**Stage 2: recorded voice (when a chapter is final).** Generate that chapter's narration with ElevenLabs, add the MP3s to the repo, and the player plays them instead. Chapters switch over one at a time. A chapter without recordings keeps using the device voice.

The player decides automatically. If the chapter page includes a list of recorded files (a small `etb-audio-data` block), it plays those. Otherwise it uses the device voice.

## What's in this folder

| Path | What it is |
|---|---|
| `preview/chapter15.html` | Chapter 15 (Elasticity) with the device-voice player. Open it in a browser to try it. |
| `preview/introduction.html` | The introduction, which is laid out differently from the numbered chapters. |
| `player/etb-audio.js`, `player/etb-audio.css` | The player. Every chapter page on the website loads these two files. |
| `tools/build_preview.py` | Puts a chapter and the player together into one preview page. |

The EDCOR 310 repo's `audio/` folder also has a recorded-mode preview with silent placeholder MP3s, if you want to see how stage 2 behaves.

## How it looks in the chapter

**A Listen button on the title card**, under the subtitle, styled like the etb labels: "Listen · 30 min." If a student stops partway, it changes to "Resume · 12:27" next time. A "Text-only version" link sits next to it.

**A quiet "Listen" link on each section label** (or on the small green kicker above each section in the introduction), showing that section's length. It's gray until hovered, and turns green with a small moving sound indicator while that section plays.

**A player docked at the bottom.** It shows which section is playing (tap the title to scroll back to it), play/pause, a timeline with breaks between sections, speed from 0.75× to 2×, and a contents menu.
- With the device voice, the skip buttons jump to the previous or next sentence, and the menu has a voice picker.
- With recordings, the skip buttons jump 15 seconds, and the menu offers the whole chapter as an MP3.

**The sentence being read is highlighted** in light green, and the page scrolls to keep it on screen. If the student scrolls away on purpose, the page stops following for a few seconds.

**Text-only version.** This opens a clean reading view over the chapter with the title, real section headings, and paragraphs only. Screen readers can move through it by heading, and phone read-aloud features read it without the clutter. It's built from the same text the voice reads.

## What gets read aloud

| Read | Changed | Skipped |
|---|---|---|
| Chapter number, title, subtitle | Drills and checks: the question, then four seconds of quiet. The answer isn't read. | Vocabulary flip cards and "also know" chips |
| Hook, big picture, concept sections, key-idea notes | Retrieval practice: the question, then "Pause and try answering on your own before you go on." The answer isn't read. | Videos, images, "learn more" |
| Worked examples, including their steps | Tables: one sentence per row, using the column headings | "On the exam" and free-response practice |
| Synthesis, recap ("The story so far"), running ledger | Math and symbols: "−30% ÷ 10% = −3" becomes "minus 30% divided by 10% equals minus 3" | Graphs and interactive widgets (the figure caption is read) |
| Figure captions | | Hover definitions (the term is read, the pop-up isn't) |

Graphs carry a lot of the meaning in this book, and right now the listener only hears the caption. The `data-narrate-text` attribute below is the way to give important graphs a short spoken description.

Two attributes give control over any single element in a chapter:

- `data-narrate="skip"` leaves it out of the audio and the text-only version.
- `data-narrate-text="…"` reads something else in its place. This is the tool for graphs: `<div class="etb-figure" data-narrate-text="Figure 4.2 shows the demand curve shifting right …">`.

## About the device voices

Quality depends on the browser.

- **Good:** Microsoft Edge (its "Natural" voices) and Safari on Mac, iPhone, and iPad.
- **Usable but robotic:** Chrome on Windows.

The player picks the most natural English voice it finds. Students can change it in the menu, and the choice is remembered.

Known limits of stage 1:
- No MP3 to download.
- Listening with the screen locked is unreliable, especially on iPhones.
- The timeline is an estimate, because the device doesn't report how long speech will take. Skipping by sentence works well, and dragging the timeline lands at the nearest sentence.

## Stage 2: recordings

### What it costs

From the narration counts at a typical audiobook pace:

- Chapter 15 runs about 48 minutes.
- Chapters range from about 11 minutes (Ch. 23) to about an hour (Ch. 3). Chapters 1–16 are mostly 30–60 minutes, and Chapters 17–26 are mostly 11–23 minutes.
- The whole Econ 150 book, including the introduction and Chapter 0, is about 15½ hours, or very roughly 900,000 characters.

ElevenLabs charges about one credit per character at its best quality. As of fall 2026, the Creator plan (the cheapest with a Professional Voice Clone) includes about 121,000 credits a month, enough for about two to three of the long chapters or six to eight of the short ones. Check current pricing before deciding.

### Keeping regeneration cheap

Audio is generated per section. Each section has a fingerprint of its exact text, so after an edit only the changed sections are regenerated.

### Where the files live

In the book's GitHub repo, next to the chapters, so the website serves them like any other file. Two limits shape how they're saved:

- **Cloudflare serves files up to 25 MiB each.** Spoken voice sounds fine at 64 kbps mono, which keeps a 7-minute section near 3–4 MB. A full-chapter download file for a 60-minute chapter needs a lower bitrate (48 kbps) to stay under the limit.
- **GitHub recommends keeping a repository under about 1 GB**, and every replaced recording stays in the repo's history. A full book of section files at 64 kbps is roughly 400 MB, plus about 300 MB if each chapter also gets a full-chapter download. That fits, with room for regenerations. Generating only after a chapter's final edit pass keeps it that way.

Adding recordings for a chapter means adding its MP3s and a section list to the repo. The website build adds the `etb-audio-data` block to that chapter's page, and the player switches to the recordings on its own.

### One set of reading rules

The device voice and the ElevenLabs script should read exactly the same text. When the generation script is written, it should get its text from the player's own rules (by loading the chapter in a headless browser) so the two never drift apart.

## Listening outside the book

- **Stage 2:** "Download the whole chapter (MP3)" in the player.
- **Later, if wanted:** a podcast feed. A private feed URL works in Apple Podcasts and most podcast apps. Spotify only takes public shows.

## Something found along the way

**Phone width.** The hidden hover definitions (`data-tip`) make chapters wider than a phone screen. On a 390-pixel phone, Chapter 15 measured 461 pixels wide and Chapter 22 measured 399. The page can be dragged sideways, and a bottom-docked player gets pushed partly off screen. All 28 Econ chapter files use the same hover-definition style. The `.etb{overflow-x:clip}` line in the setup above works around it. The real fix is a small change to the tooltip CSS, which fits into the batch edits planned after the move.

**Broken interactive widgets.** Some chapter scripts no longer run in the current EdTechBooks copies. When the editor squashed each script onto one line, a `//` comment ended up commenting out everything after it.
- Chapter 2: two graph widgets (the first script, which logs "Missing Market widget," and the eighth).
- Chapter 4: Interactive practice 1 ("Predict the new equilibrium") and 2 ("Binding or not?").

These were broken before the player existed, and the player doesn't affect them. They should be fixed when the chapters move to the new site, either by restoring the scripts' line breaks or by changing `//` comments to `/* … */`. A check of every EDCOR 310 chapter found no similar problems.

## Next steps

1. Try the device-voice preview in Edge, Safari, and on a phone. Decide whether it's good enough for now.
2. Settle the open questions below.
3. When the site moves to Cloudflare, add the player as described in "Adding the player to the website."
4. Later, per chapter: final edit pass, generate recordings, add them to the repo.

## Open questions

- Should the vocabulary cards be read? They're skipped now because the terms are defined in the text.
- Is four seconds of quiet right after a drill question? Is the retrieval-practice cue right?
- Should "On the exam" practice be read?
- Which graphs need a spoken description?
- Should "Text-only version" stay on the title card, or live only in the player menu?
