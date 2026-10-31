# Precise Practice — reusable format registry

Updated: 2026-10-31. **Purpose:** make approved exercise interactions reusable across Econ 150 and EDCOR 310 while separating interface approval from editorial and accessibility validation.

## Status labels

- **Approved interaction:** Instructor likes the interaction pattern enough to reuse in Tier 1 when conceptually suitable. A chapter still requires a reviewed, accurate question bank and browser/accessibility QA.
- **Pilot:** A playable implementation exists, but instructor/student testing and refinement remain before general adoption.
- **Candidate:** Brainstormed or partly implemented, not an approved recurring format. Do not automatically require it in every concept or chapter.
- **Retired:** No longer considered a preferred format; retain no obligation to migrate old exercises.

## Approved interaction 01 — Drag-and-drop classification / categorization

**Status: Approved interaction (2026-10-31)**. Canonical pilot: Econ 16, Precise Practice → Tier 1 → Rapid Sort; implementation currently inside `etb-live/assets/chapter16-precise-practice.html`.

- Unsorted, draggable cards sit in a tray; each successfully placed card **leaves the tray** and appears in the student's chosen bin.
- Students can rearrange cards or return them to the tray before submitting; a visual placement is **not** a correctness confirmation.
- Only after clicking Check do students receive correctness, best categorization, and feedback.
- Default is manipulation. **Try a more accessible version** switches to labeled selection controls with the same underlying picks, answer key, and scoring.
- Tier 1 should **normally begin with two or three clean, discriminable categories** to reduce extraneous difficulty, when the concept permits. Tier 2 can include more complex scenarios or four categories. Use four immediately if a genuine four-quadrant concept requires it, and avoid fake categories added just to hit a quota.
- Sort order and examples should vary so students cannot memorize positions. Cards, drop targets, and feedback should be authored from stable IDs; avoid hardcoded text in the interaction engine.
- **Engineering extraction task:** move the current drop implementation into a shared standalone renderer with a structured `{cards, categories, feedback}` contract; reuse in Econ and EDCOR rather than copying chapter-local markup.
- **Accessibility/release gate:** test touch dragging, keyboard-only completion through the equivalent mode, focus visibility, screen-reader prompts, responsive layout, and feedback clarity. Instructor approval is not a claim of completed accessibility certification.

## Approved interaction 02 — Memory Match

**Status: Approved interaction (2026-10-31; instructor-approved after unselect and animation refinements)**. Independent reusable engine: `etb-live/assets/precise-memory-match.js`. Canonical pilot: Econ 16, Tier 1 → **Memory Match · Approved**.

**Contract:** `PreciseMemoryMatch.mount(element, [[term, definition], ...], {onComplete, onAgain})`.

- A board shows six shuffled term-and-definition pairs (12 selectable tiles). Individual terms and meanings appear as separate buttons, not term/definition columns.
- Students select any two. Matching pairs turn green, briefly remain visible, then disappear; incorrect guesses clear after a short delay and remain available.
- A compact pair counter shows progress. Completing the board is one counted Tier 1 practice activity, **not six individually graded questions**; a replay starts a fresh shuffle.
- All cards are ordinary focusable buttons, keyboard-operable, with no sound or graded penalty.
- Question bank currently provides six carefully selected pairs per Econ 16 concept in `etb-live/assets/chapter16-question-bank.js`.
- **Release criteria:** test button/focus behavior after disappearance, mismatch feedback, mobile layouts, timing and reduced-motion preferences, screen-reader status, ambiguity in definitions, and memory benefit beyond visual recognition. Consider rounds of four pairs for novice learners when appropriate; do not force six on every concept.

## Approved interaction 03 — Definition Detective: Grade the Students

**Status: Approved interaction (2026-10-31; instructor-approved UX, question wording not yet approved).** Canonical prototype: Econ Chapter 16, Tier 1 → Definition Detective, in `etb-live/assets/chapter16-precise-practice.html`.

- Prominently display **the term being defined** above three named, simple stick-figure students (for example Bob, Maya, Leo).
- Show a short explanation by each student; the learner acts as teacher and assigns **A = accurate and sufficient**, **A− = true but incomplete**, or **F = fundamentally mistaken** using three large, computer-scored grade buttons.
- Shuffle the order of student answers per round without changing answer keys; names remain stable for that round and should not cue correctness.
- Reveal a precise explanation after students submit all three grades, distinguishing *what is true*, *what is missing*, and *what is false*.
- Reuse in high Tier 1 for important defining features; potentially introduce more subtle evaluation of explanations and causal claims in Tier 2, with a separately reviewed question bank.
- **Known weakness, explicitly flagged by instructor:** Some current Chapter 16 definitions are hard to follow. Improve clarity, specificity, reading level, and the unambiguous A/A−/F distinctions **before content approval**. Do not confuse approval of the engine with approval of the current question text.
- Future items need not guarantee exactly one of each grade; ensure grading remains fair and transparent, with plausible explanations rather than artificial wording.
- General release remains contingent on mobile, keyboard, screen-reader and usability QA.

## Candidate formats — not automatically approved

- Quick classification buttons (working, review for enough variability)
- Definition Detective (A/A-minus/F) (**approved interaction**; currently used in Tier 1 for defining features, with a possible Tier 2 expansion for evaluating explanations; individual definitions still require clarity and editorial review)
- Missing Piece (current fill-in-the-blank version **recommended for retirement**; retain worthwhile missing-step reasoning as ordinary Tier 2 questions, pending instructor agreement)
- Four-goods matrix (content-specific, Econ)
- Find & Fix the Error (working, editorial and usability review)
- Change & Predict (working, editorial and usability review)
- Flip cards (working, separate from Memory Match)
- AP-style selected-response reasoning (Tier 3 content standard; quality and distractors need human review)
- Short AAQ/EBQ/FRQ reasoning (Tier 4; rubric and source quality need human review)

**Policy:** Chapter authors select formats backwards from the concepts and real assessment demands. Approved means it is available, not mandated in every chapter. Avoid a long dropdown of untested prototypes presented as if all are equally polished. Keep some choices explicitly marked **Pilot** during trials; remove or label weak ones.

## Implementation next steps

1. Test Memory Match with the instructor and students before labeling it Approved.
2. Extract the approved drag-sort renderer into its own portable module and wire it to concept-specific banks in both books.
3. Build configurable two-/three-bucket Tier 1 decks, with more nuanced four-bucket application only when justified; the current Econ 16 boards still have their original three/four categories.
4. Verify browser rendering and input behaviors; use a standard JS syntax test and semantic bank lint before sharing preview links.
5. Update the cross-textbook practice playbooks to link this registry when broader adoption is approved.

## Current design review — Definition Detective versus Missing Piece

The current Missing Piece items have obvious semantic or grammatical cues and add little beyond standard selected response. Prefer removing the standalone format after instructor confirmation. An actually missing *causal step* can appear in Tier 2 as an ordinary application item, without a separate game. Definition Detective has a clearer distinctive function: discriminate **A = correct and sufficient**, **A− = true but missing a necessary element**, and **F = incorrect**. Use straightforward definitional triads in upper Tier 1; use explanation-quality and causal-overclaim discrimination in Tier 2. Avoid introducing ambiguity through subjective or contestable definitions. User confirmation and item testing are still needed before promoting Definition Detective.

## Pilot 04 — Odd One Out

**Status: Pilot, not approved (2026-10-31).** Econ Chapter 16 Tier 1 now offers two example sets per concept.

- Four shuffled options: three share an important economic property, one violates it. Students select the exception and receive a brief *why* explanation after checking.
- Do not give away the grouping rule in the prompt when the challenge is to discover it; use concrete, unambiguous contrasts. A correct answer should require distinguishing economic mechanisms, not word length or style.
- Randomized displayed positions preserve the canonical answer key. A single checked set counts once toward the optional practice tracker.
- Existing approved formats remain visible in Tier 1: Rapid Sort, Memory Match, Definition Detective. Odd One Out is visibly labeled Pilot.
- **Other experimental games are hidden, not deleted.** Their engines and question banks remain in source for future review. Tier 2 currently shows its ordinary applied questions, Tier 3 AP-style MC. Former localStorage selections are ignored when not allowed in the current tier.
- Approval criteria: review distractor plausibility, clarity of the common grouping property, repeat variety, actual browser behavior, and accessibility.
