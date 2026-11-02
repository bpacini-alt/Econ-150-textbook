# Chapter 16 shared-bank and chapter-end exam practice pilot

This version extends PR #112 without rewriting the revised chapter prose or removing any concept-checkpoint practice.

## Architecture

- `etb-live/assets/chapter16-question-bank.js`: the *single chapter-owned content source* for the four concept item groups (foundations, applied cases, advanced prompts), optional variation formats, and 12 designated exam-level items.
- `etb-live/assets/chapter16-precise-practice.html`: the presentation/feedback engine loads the bank as a script and uses its data for both concept checkpoints and the chapter-end exam-practice experience. This is a static-host-friendly prototype; a later engine can load JSON banks dynamically for multi-chapter sessions.
- No question bank is pasted into `etb-live/Chapter16.html`; the chapter retains five compact iframe placements.
- Exam-level pool: eight scenario-based applied multiple-choice items with explanations and four free-response synthesis prompts with scoring criteria. These are **pilot draft items, pending instructor review**, not validated AP questions.
- Session length: 4, 8, or all 12; manually controlled sequential selection, no adaptive algorithm. This chapter only for now. Explicitly tells learners that earlier chapters can be included after their banks are available.
- Students can choose the chapter-end exam practice immediately or return to foundational concept practice.

## Product decisions

- The chapter-end bank *is* the first exam-preparation experience. A separate exam-prep page is unnecessary for this pilot; the future cross-chapter view should use the same bank and renderer.
- **Deferred**: mastery evidence, scores for written work, adaptive selection, smart scheduling, cross-chapter bank loading, learning-history storage beyond existing local drafts, and automatic determination of exam readiness.
- Existing Chapter 16 harbor-town FRQ is untouched; it remains a separate authored illustration until the instructor decides how to integrate or reduce overlap.
- Follow-up QA: browser flow, chapter media loading, keyboard navigation, item economics and distractors, mobile sizing and high-quality FRQ rubric review.

## Preview

`https://raw.githack.com/bpacini-alt/Econ-150-textbook/feat/ch16-precise-practice-current-revision-20261031/etb-live/Chapter16.html`
