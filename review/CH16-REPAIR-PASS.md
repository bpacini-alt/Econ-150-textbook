# Chapter 16 repair and quality pass (2026-10-31)

## Completed in this pass

- Repaired two corrupted applied questions (Markets Are Built and Property Rights): each split across two incomplete bank entries; replaced with coherent four-choice, keyed, explained scenarios.
- Normalized incomplete Definition Detective labels to Unicode `A−` in all four concepts.
- Corrected a misleading property-rights transfer example, a vague corruption foundation example, and added two applications emphasizing evidence and conditional rivalry.
- Added `etb-live/assets/chapter16-bank-validator.js` which rejects missing/invalid keys, too few choices, absent feedback, invalid detective labels, incomplete FRQ rubrics, and duplicate exam IDs before the exercise engine initializes.
- Removed misleading automatic “Understanding demonstrated” status; only participation is shown without a defensible mastery evaluation.
- Expanded chapter-end bank from 8 MC + 4 FRQ to **24 MC + 6 FRQ**, with original multi-concept coverage plus original new scenarios. All 30 items carry `reviewStatus:"draft"` and are **not marked instructor-approved**.
- Updated chapter-end session to use the expanded bank in its displayed order; the default 10-question session retains both applied and FRQ examples.

## Outstanding work before merge

- Editorial accuracy and distractor review of all 30 exam items, not merely schema checks.
- Concept-by-concept skill audit, including dedicated four-goods matrix and meaningful change/predict format; improve bank variants to avoid rote cycling.
- Browser/keyboard/narrow-screen tests, feedback and transitions, state persistence and iframe resizing.
- Kaylee/instructor review and student think-aloud pilot.
- Confirm latest main has no conflicting chapter edits before merging.
