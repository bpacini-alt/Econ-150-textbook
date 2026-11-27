# Unit 3 reorder: decision and change map

**Decided:** November 18, 2026 (Benjamin).
**Takes effect:** Winter 2027. Nothing students can see changes during Fall 2026.
**Status:** Recorded. Not started. See "Deferred structural revisions" in `PROJECT-PRIORITIES.md`.

## The decision

Unit 3 jumps around. Elasticity opens the unit, then the book moves to institutions, externalities, the commons, Pigouvian repairs, and healthcare. The commons sits between externalities and the chapter that fixes them, and it sits apart from the institutions chapter it builds on. The new order pairs the chapters by week:

| Week | Theme | New # | Chapter | Old # |
|---|---|---|---|---|
| 8 | Markets need rules | 15 | Institutions | 16 |
| 8 | | 16 | The Tragedy of the Commons | 18 |
| 9 | Spillovers and how to fix them | 17 | Externalities | 17 |
| 9 | | 18 | Pigouvian Taxes, Subsidies, and Incentives | 19 |
| 10 | When you can't walk away, or can't see | 19 | Elasticity | 15 |
| 10 | | 20 | Unit Capstone: The Economics of Healthcare (with information problems) | 20 |

Number map: **16→15, 18→16, 15→19, 19→18.** Chapters 17 and 20 keep their numbers. Units 1, 2, and 4 are not affected.

Why it reads better:

- **Institutions → Commons.** The two chapters already point at each other. Institutions builds the four-kinds-of-goods grid and says the commons chapter "comes back to this grid." The commons chapter opens on that grid, and its repairs (fences, rules, Ostrom's user-run governance) are institutions.
- **Externalities → Pigouvian.** The Pigouvian chapter taxes the paper mills from the externalities chapter and erases its $200 deadweight loss. Right now the commons chapter interrupts that sequence.
- **Elasticity → Healthcare.** Elasticity already opens on insulin, and the healthcare chapter's failure table starts with "Escapability." Elasticity at the end of Unit 3 also leads straight into Unit 4, where Chapter 21 says "Elasticity is escape power" and uses it for price discrimination.
- The Pigouvian chapter ends on its catch: someone has to *know* the true costs. That leads naturally into Week 10's information problems.

## Rollout: don't disrupt current students

1. **Fall 2026 stays as it is.** Students are reading these chapters by number now. The Unit 3 exam runs November 20–24, Unit 4 runs through early December, and the Canvas reading items link to `econ.benjaminpacini.com/ChapterN`. After a renumber, an old link opens a different chapter instead of breaking, which is the worst way for it to fail.
2. **Draft the prose rewrites early, renumber late.** The private editor commits prose straight to `main` all semester, so a long-lived branch that renames files will conflict constantly. Instead:
   - Before the break, draft the content rewrites in section B below in a draft pull request, as a preview. Leave the file names alone.
   - At the break, make the renumber one scripted step: rename the files through temporary names (for example `Chapter15.html → tmp-elasticity.html → Chapter19.html`), apply the reference table in section C, then rebuild. Run it on a fresh `main` the day it merges.
3. **Freeze a Fall 2026 copy** before merging, so students with an Incomplete or a grade question can still read the old numbering. One option is a static copy of `etb-live/` at a `/fall-2026/` path. Another is a tagged commit plus a Cloudflare preview link.
4. **If the Chapter 9–12 firm-sequence reorder also happens this break, merge it in the same pass,** so chapter numbers change only once.
5. **Open pull requests that touch these files:** #149 (Chapters 17–18 practice prototype; edits Chapters 16–20, their banks, the manifest, and `build_front.py`). Settle it or rebase it onto the new numbering before the renumber merges.

## A. File moves and generated files

| What | Change |
|---|---|
| `etb-live/Chapter15.html` … `Chapter19.html` | Rename per the number map (through temporary names). Update each page's `<title>` and the "Chapter N" title card. |
| Chapter titles | Commons becomes "Market Failures I: The Tragedy of the Commons." Externalities becomes "Market Failures II: Externalities." Pigouvian stays "Market Failures III." Elasticity's eyebrow "The Critique of Markets, Part I" needs a new line. |
| `build/build_front.py` (Unit III list) | New order and titles; then run `python3 build/build_front.py`. |
| `etb-live/manifest.json` | Titles for `Chapter15`–`Chapter19`. |
| `etb-live/navigation.js` | No change (it lists files by number). |
| `build/wrap_pages.py` | Rerun after the move. |
| `audio/preview/chapter15.html` | An audio preview of Elasticity. Regenerate it, or treat it as historical. |
| Images (`content_images/2777`) | Paths don't change. |
| `review/CH16-*` and `review/ch16-rebuild/` | Historical notes about Institutions under its old number. Leave them as they are; add one line to `review/README.md` saying CH16 = Institutions, now Chapter 15. |

### Practice banks (edit in `practice-engines`, then rerun its embed script)

| Bank now | Becomes | Spiral readiness today | Needed |
|---|---|---|---|
| `econ-150-ch15` Elasticity | ch19 | none | Add a spiral from Externalities/Pigouvian. |
| `econ-150-ch16` Institutions | ch15 | Ch 14 and **Ch 15 (Elasticity)** | Elasticity now comes later. Drop it; spiral from Ch 14 or Ch 7 instead. |
| `econ-150-ch17` Externalities | ch17 | `econ-150-ch16` (four kinds of goods) | Point it at the new Institutions bank id, or at the Commons bank. |
| `econ-150-ch18` Commons | ch16 | `econ-150-ch17` (**Externalities**) | Externalities now comes later. Spiral from Institutions instead. |
| `econ-150-ch19` Pigouvian | ch18 | none | Add a spiral from Externalities. |

Worth considering: give banks topic ids (`econ-150-elasticity`) instead of chapter-number ids, so the next reorder doesn't touch them. Either way, bump `storage_version` on any bank whose id is reused for a different chapter, so a returning student's saved progress doesn't carry over to the wrong chapter.

## B. Content rewrites (more than a number change)

These need writing, not search-and-replace. Locations are by the chapter's **current** file.

**Elasticity (`Chapter15.html` → 19)**
- The opening says "In the following chapters, we will detail how markets occasionally fail… In this chapter, however, we will let markets do their thing." It now comes *after* the market-failure chapters. Reframe it: Week 10 takes up two failures that remain, thin exits (elasticity) and hidden information (healthcare).
- **Move "The Limits of Efficiency" section out** (with Critiques & Repairs: "compared to what?", the nirvana fallacy, strawmanning). It is the lens for the whole unit and belongs at its start. Put it in the Institutions opener, or on the Unit III page (`gstnnaevlx.html`, about 350 words now).
- **Cut what repeats Chapter 7.** Chapter 7 already teaches "escape is elasticity in plain clothes," the determinants, and tax incidence with the 1990 yacht tax. Reduce Ch 15's Determinants and Tax Incidence sections to a short recall of Chapter 7 plus whatever is new (the numbers). This also lightens Week 10, which is the heaviest week (about 14.5k words for Elasticity and Healthcare against about 11k for the other weeks) and the exam week.
- The ending hands off to Institutions ("The next chapter asks the question we skipped: where does a price even come from?"). Rewrite it to hand off to healthcare.

**Institutions (`Chapter16.html` → 15)**
- The opening says "In the previous chapter, we began our critique of markets… We have now offered two such critiques: elasticity…" It now opens the unit. Its own line "There is no such thing as a free market" works well as the unit's first sentence. Add the Limits of Efficiency material here if that's where it goes.
- "First, the next chapter looks at a related problem: costs and benefits that spill onto people outside a deal." Delete it; the next chapter is now the commons.
- "Chapter 18 comes back to this grid…" becomes "The next chapter comes back to this grid…" Also the glossary line "Chapter 18 gives it a full treatment," and "is Chapter 18's job" (twice).
- **Existing error:** "The idea returns in Chapter 17. The economist Ronald Coase showed…" Coase is in the Pigouvian chapter (old 19, new 18), not Chapter 17.

**Commons (`Chapter18.html` → 16).** This is the one real dependency problem. The chapter treats externalities as already taught.
- Glossary: "The commons is one big negative externality (Chapter 17)."
- "In Chapter 17's terms, this is a negative externality."
- "That is the externality from Chapter 17, in its most tragic form."
- Fix: name the idea in plain words here ("each boat's cost lands on every other boat, and it pays none of it"), then point forward: "Chapter 17 gives this a name and a graph." Teaching the concrete case first and the general idea next is arguably better anyway.
- "You saw the same logic in Chapter 17 with positive externalities like vaccination and research, and Chapter 19 works out how big a subsidy should be" becomes a forward reference: Chapter 17, then Chapter 18.
- The ending ("The next chapter turns to the economist's general-purpose tool for externalities of every kind: put the missing cost…") hands off to Pigouvian taxes. Rewrite it to hand off to Externalities as the general problem.
- "In Chapter 16 you learned to sort any good," "(from Chapter 16)," "property rights and courts from Chapter 16," "Chapter 16 pointed out that a library could exclude people" all become Chapter 15, or "the last chapter."

**Externalities (`Chapter17.html`, stays 17)**
- Opening: add a line connecting it to the commons ("You have already seen one: the commons…").
- "Chapter 18 studies the special case of shared resources. Chapter 19 studies ways to correct those gaps." becomes "Chapter 16 showed one special case… Chapter 18 studies ways to correct them."

**Pigouvian (`Chapter19.html` → 18)**
- The summary lists "escapability, missing institutions, the commons, externalities, hidden information… The last chapter puts them all in one room." Reorder the list to match the unit, and hand off to Elasticity: two failures remain, then the capstone.
- "Chapter 16 taught that markets need property rights" and "Chapter 16's institutions come back in" become Chapter 15.

**Healthcare (`Chapter20.html`, stays 20)**
- "Chapter 15's inescapable demand" becomes Chapter 19.
- Failure table: "Escapability · Ch 15" → Ch 19, "Institutions · Ch 16" → Ch 15, "The commons · Ch 18" → Ch 16, "Pigouvian repair · Ch 19" → Ch 18. Consider reordering the rows to follow the unit.
- Answer text: "corrected with a Pigouvian subsidy (Chapter 19)" → Chapter 18.
- Information problems (adverse selection, moral hazard, signaling) stay here as Week 10's second half. Decide whether the capstone should keep introducing a whole new failure, or whether that material gets its own heading as a "concept" before the synthesis.

## C. Number-only references outside Unit 3

| File | Text now | Change |
|---|---|---|
| `Chapter0.html` | "A calculation you'll run constantly from Ch 15 on" (total revenue) | Reword; the total revenue test is now in Ch 19. |
| `Chapter0.html` | "We will use this repeatedly in Chapters 15 and 16" (elasticity) | Already off: elasticity is used mostly in Ch 7, 8, 12, 21, and 23. Reword to "starting in Chapter 7, and formally in Chapter 19." |
| `Chapter3.html` | "beginning in Chapter 15" (markets' failure conditions) | Keep. Institutions now begins the critique, so it is more accurate than before. |
| `Chapter3.html` | "beginning with Chapter 4 and returning in Chapter 19" | → Chapter 18. |
| `Chapter5.html` | "pollution, which returns in Chapter 19" | → Chapter 17 (externalities is the better target). |
| `Chapter7.html` | `etb-xref` chip "Ch 15" after "cases where markets genuinely fail" | Keep; it now points to Institutions, which fits. |
| `Chapter14.html` | "Chapter 19 calls this public choice," with link `Chapter19.html` | → Chapter 18 / `Chapter18.html`. |
| `Chapter6.html` | chips "Ch 18 Ch 20" (efficient vs. fair) and "Ch 17 Ch 18" (monopsony) | **Already wrong.** Neither topic is in those chapters (no Unit 3 chapter mentions monopsony). Retarget them while doing this pass: efficiency vs. fairness → Ch 15 (wherever Limits of Efficiency lands) and Ch 26; monopsony → Ch 12/13 or Ch 20. |
| `Chapter4.html`, `Chapter9.html` | "a later chapter gives that steepness a name," "when we reach elasticity" | No number; still true. |

After the move, rerun the cross-reference sweep (search every `etb-live/*.html` for `Chapter 1[5-9]`, `Ch 1[5-9]`, `Chapter1[5-9].html`, and "next/previous/last chapter" inside Chapters 15–20) and confirm each hit by reading it.

## D. Course side (ECON 150 Canvas, Winter 2027 copy)

- **Reading items** (`course/week-08`–`week-10/chapter-N-reading.json`) link by number and already go two per week (15+16, 17+18, 19+20). They need no change; the content behind each number changes.
- **Homework .docx files** ("Chapter Fifteen Homework," and so on) follow the content, so swap the files behind each slot. Homework runs a week behind the readings (Week 8: Ch 14 and 15; Week 9: 16 and 17; Week 10: 18 and 19). Healthcare has no homework.
- **Unit 3 concept study guide** (SharePoint) and **Exam 3 / Exam 3 Practice:** reorder or retag by the new numbers. The exam title "Elasticity and Market Failures" still fits.
- **Top Hat class quizzes** are built per session (`quizzes/top-hat/econ-150/session-17.json` is Ch 17 Externalities). Remap sessions to chapters for Weeks 8–10.
- **Joy of Econ menu** (`menus/joy-of-econ.json`): "Chapters 15–20" is still right. Re-sort Unit 3 readings among Weeks 8–10 so elasticity and healthcare pieces sit in Week 10 and institutions and commons pieces in Week 8.

## Open questions for Benjamin

1. Where does "The Limits of Efficiency" go: the Institutions opener, or the Unit III page?
2. Do information problems stay inside the healthcare capstone, or get their own concept heading?
3. Does the Chapter 9–12 firm-sequence reorder also happen this break?
4. Separately: Chapter 25 (Behavioral Economics) sits in a unit about imperfect competition. Leave it as part of "The Closing Reckoning" with Ch 26, or move it?
