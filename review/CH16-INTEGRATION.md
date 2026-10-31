# Chapter 16 Precise Practice integrated pilot

This PR now adds actual practice sections to `etb-live/Chapter16.html`, without rewriting or deleting the existing chapter, quick checks, retrieval questions, or the existing end-of-chapter FRQ.

- Each of six major concepts ends with a checkpoint: Tier 1 foundations, Tier 2 application, Tier 3 reasoning. Users may choose freely and skip ahead at any time.
- An optional cumulative **Chapter Challenge** appears after the final concept, before the existing synthesis material.
- The interactive question engine is contained in a reusable standalone asset: `etb-live/assets/chapter16-precise-practice.html`. It is embedded through responsive iframes and can also open directly. The review-only full-page standalone prototype is preserved separately.
- The checkpoint shells have no dependency on concept wording or HTML offsets after initial placement. Changing the chapter prose should not disturb the activity engine, though moving concepts may require moving the corresponding checkpoint.
- Child frame sends its content height to its parent for resizing, with same-origin source verification on the parent. Mobile layout and native keyboard-accessible select controls are supported.
- Practice progress and drafts are stored in the browser only; no gradebook submission is implied. Scores from short practice are provisional; written FRQs are self-reviewed, not automatically graded.
- The existing chapter's FRQ remains alongside the new cumulative challenge. We can rationalize duplicative material after instructor review.
- No changes to the live deployment until PR merge; inspect all six placements and chapter challenge in the branch preview.

## Remaining before release

Browser QA (including mobile, dark-mode if applicable, screen reader, keyboard tab order); validate question answers and rubrics with instructor; test iframe resizing, lazy loading, external fallback, and localStorage restrictions; strengthen targeting and varied practice. Consider extracting a generic multi-chapter engine from this chapter-specific asset once validated.
