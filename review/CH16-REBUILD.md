# Chapter 16 rebuild (Institutions)

**Status:** Merged October 31, 2026 (#105, with Chapter 12 changes in #106). Follow-ups below. Branch `rebuild/ch16-institutions-20261031`.

**Why:** Chapter 16 was doing too much. About a third of it repeated material taught elsewhere in the book (the introduction, Chapters 1, 11, 12, 18, and 26). The rebuild keeps what only Chapter 16 teaches and moves the rest.

## New structure

| # | Concept | What's in it |
|---|---|---|
| Hook | Lima and the diamond district | De Soto and Bernstein, trimmed from about 780 words; one closing paragraph with Romer's "rules of the game" |
| 1 | Markets Are Built | Opening argument; **Two Kinds of Failure** (market vs. institutional failure, moved up from Concept 2); **Big question box: What is prosperity for?** |
| 2 | Property Rights | Bundle, Friedman's airplane, slavery box (property-rights point only), rule of law, quiet-assumptions table, institutions as technology, charter cities |
| 3 | Corruption | Inclusive vs. extractive, Fig 16.1, sands the wheels, rent-seeking; **The Hidden Price of a Deal** (transaction costs as a short bridge, pointing to Ch 11 and Ch 18) |
| 4 | Public Goods and Common Resources | Four-goods grid (Ch 17 depends on it), California's paper rivers, education note; hands off to Ch 17 |
| Back | Exam items, FRQ, synthesis | Three exam items kept; **new FRQ "The harbor town"**; synthesis bullets updated |

About 9,000 words down to about 5,900. Title card read time changed from 38 to 25 minutes (scaled by word count; the numbers are hand-set).

## What moved out, and where it's held

| Material | Held in | Destination |
|---|---|---|
| Christian roots, Restorationist thought, LDS range-of-voices table, bourgeois virtues, libertarian box, "A Larger Confluence," Christianity-and-slavery paragraphs | `review/ch16-rebuild/essay-material.html` | Supplemental essay, working title "What Is Prosperity For?" |
| Old Concept 6, "The Rights You Do Not Have" (wedding, NIMBY, laundromat case, real harm vs. dressed-up veto) | `review/ch16-rebuild/ch12-candidate.html` | Chapter 12 already teaches the argument (right to build). Consider moving the laundromat case file there. |
| Old intro paragraphs, old Concept 4 (transaction costs and Coase), old FRQ "The vacant lot" | `review/ch16-rebuild/cut-from-ch16.html` | Reference only. Coase is taught in Ch 18; Munger and Uber in Ch 11. |

## Changes needed in other chapters and tools

Checked October 31, 2026, by searching the whole book for references to Chapter 16.

**Needs action**
- [ ] **Supplemental essay (low priority):** main points in `review/ch16-rebuild/essay-plan.md`; source material in `review/ch16-rebuild/essay-material.html`. Decide where essays live on the site, then link it from the Ch 16 "What is prosperity for?" box.
- [x] **Chapter 0 (Algebra Review):** the total-revenue note said "from Ch 16 on"; now "from Ch 15 on" (elasticity). Done October 31, 2026.
- [ ] **Precise practice pilot** (Benjamin is handling this elsewhere; PR #100, `feat/ch16-precise-practice-pilot-20261030`): built on the old six concepts. Re-cut to the new four; drop the "rights versus objections" checkpoint (now Ch 12 material) and fold "transaction costs" into Corruption; update the lake-management chapter challenge.
- [ ] **Course quizzes and slides (outside the repo; Benjamin):** check the Ch 16 session slides and any common-quiz or Top Hat items on Coase (now taught only in Ch 18), the veto/NIMBY material (now Ch 12), or the Christianity and Restorationist material (now the essay).
- [x] **PROJECT-PRIORITIES.md:** Chapter 16 redraft marked done; textbook-feedback#5 closed. October 31, 2026.
- [ ] **docs/APHORISM-CANDIDATE-BANK.md (low priority; Benjamin wants a better aphorism first):** records "An Objection Is Not a Veto" as an existing Ch 16 heading that "is not being deleted or changed." The heading left Ch 16 with the rebuild, and the idea now lives in Ch 12 without it. Add a note; optionally restore the phrase as a heading in Ch 12.

**Optional**
- [ ] **Chapter 17:** California's paper rivers could move to "Fences and Rules."
- [ ] **Chapter 26:** the Ch 16 box says Ch 26 "takes this question up directly." True today; Ch 26 could add a one-line link back to Ch 16's question.
- [ ] **Ch 16 cadence pass:** a few lines still read as AI-cadence ("Prices supply neither," "The diagnosis decides the cure, so get the diagnosis right first").

**Checked, no change needed**
- [x] **Chapter 12:** done in PR #106 (merged): wedding example, harm-vs-preference paragraph, laundromat case, gentrification box.
- [x] **Chapter 11:** Ch 16's bridge points to Ch 11 for Munger and Uber; Ch 11 covers both.
- [x] **Chapter 17:** "Recall the four-goods grid from the last chapter" stays true.
- [x] **Chapter 18:** "Chapter 16 taught that markets need property rights, courts, contracts, and rule of law" stays true, and Ch 18 introduces Coase on its own.
- [x] **Chapter 20:** the capstone table's "Institutions · Ch 16" row stays accurate.
- [x] **Introduction:** the Ch 16 box cites the Liberal Synthesis, which the introduction names and defines.
- [x] **Contents page:** no rerun needed; the title and subtitle are unchanged.
- [ ] **Holding files:** `review/ch16-rebuild/ch12-candidate.html` has been used. Ask Benjamin before removing any holding file.
