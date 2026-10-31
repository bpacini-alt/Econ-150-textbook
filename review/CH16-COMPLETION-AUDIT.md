# Chapter 16 Precise Practice — Completion Audit and Release Gates

**Date:** 2026-10-31  
**Branch / review PR:** `feat/ch16-precise-practice-current-revision-20261031` / #112  
**Status:** Not ready to merge. This is a code-and-bank inspection, **not** a live browser test or full economic item validation.  
**Scope:** Keep Chapter 16 prose and original Harbor Town FRQ intact unless independently approved.

## Agreed four-stage plan

1. **Backward design:** Four concept competencies plus independent diagnostic, explanatory, predictive, discriminating, and evaluative reasoning. Document actual skill and representation targets.
2. **Completion criteria:** Foundational skills/misconceptions/representations covered with fresh examples and feedback; chapter-end pilot aims for ~24 applied selected-response items + ~6 scored-criteria FRQs, **flexible by quality**; no duplicate padding or untested grade claims.
3. **Item-type design and coverage:** Retrieval/flip cards, rapid classification, matching/sort, Definition Detective, Missing Piece, applied scenario, Find & Fix, change/predict, and structured FRQ. Goods matrix is important; evidence interpretation is conditional on taught chapter content. No forced graph or numerical content.
4. **Build, validate, test:** Triage existing content first, repair defects, fill verified gaps, perform instructor/Kaylee and student reviews, browser/mobile/keyboard tests, then merge.

## Current inventory (counts, NOT approval)

| Chapter concept | Foundations | Applied decisions | Advanced prompts | Flashcards | Detective | Missing Piece | Error repair |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 Markets Are Built | 10 | 6 | 2 | 4 | 3 | 2 | 2 |
| 2 Property Rights | 10 | 6 | 2 | 4 | 3 | 2 | 2 |
| 3 Corruption | 10 | 10 | 3 | 6 | 3 | 2 | 2 |
| 4 Public Goods & Common Resources | 12 | 5 | 2 | 4 | 3 | 2 | 2 |
| **Total** | **42** | **27** | **9** | **18** | **12** | **8** | **8** |

Chapter-end bank: **8 applied multiple-choice + 4 rubric-assisted FRQs** = 12 draft items. Target: approximately **24 + 6** *approved, nonredundant* items; do not write the full difference until auditing existing quality.

## Priority 0 — blockers confirmed by static inspection

- [ ] **Concept 1 applied entries 1–2 are malformed.** Intended case about removing licensing barriers but not enforcing contracts is split across two question objects; both have `a:null` and invalid choice lists. Combine into one properly keyed, explained item; independently review economic accuracy.
- [ ] **Concept 2 applied entries 5–6 are malformed.** Intended property-taking/compensation item is split across two objects; both have `a:null`. Repair key, plausible alternatives, and explanation.
- [ ] **All four Definition Detective banks encode incomplete answers as `A-`,** while the interface uses the distinct `A−` (minus sign) value. Normalize keys or use an explicit machine-safe value like `incomplete`, and test scoring.
- [ ] Add automated question-schema validation so invalid keys, missing feedback, malformed answer sets, and invalid detective labels fail review rather than silently rendering.
- [ ] Browser-test actual iframe embed height, state transitions, mixed practice, question changes, self-review, accordion, keyboard and narrow screen. Static inspection does not establish functioning interactions.

## Priority 1 — learning design / item quality gaps to resolve

- [ ] Map **each** concept's skill targets to existing items and mark **adequate / revise / missing**; no format quotas.
- [ ] Test whether the rapid classification and six-item sorting board offer enough *substantively different* examples, or repeatedly reuse a narrow set.
- [ ] Add or designate **change the conditions / predict outcome** items in each concept; assess mechanism not superficial label.
- [ ] Build a genuine **four-goods rivalry × excludability grid interaction** (reuse the existing sorting engine if it supports the representation) and check examples with contextual nuance (congestion, access).
- [ ] Human-review Definition Detective A/A−/F statements to ensure distinctions are defensible, and error-repair explanations are instructive.
- [ ] Decide whether evidence interpretation belongs in this chapter based on *taught* material; do not add gratuitous graphs/tables.
- [ ] Ensure the “Mix it up” cycle rotates **skills**, not merely visible formats. Current sequencing is preprogrammed; advanced items remain self-review without scoring.

## Priority 2 — chapter-end bank and exam readiness

- [ ] Review the 8 MC items: correctness, plausible distractors, nonobvious keys, scenario authenticity, and alignment to Chapter 16 learning targets.
- [ ] Review the 4 FRQs: independent solution, scoring criteria, overlap with the original Harbor Town FRQ, level of synthesis, and meaningful feedback.
- [ ] Target ~24 applied MC and ~6 structured FRQs **if** necessary for concept/skill/context coverage and multiple genuinely varied 10-question sessions; quality outweighs quota.
- [ ] Ensure quiz-length default **10** contains meaningful mix of advanced applied items and FRQ-style items; check whether repeated sessions expose variety.
- [ ] Current picker displays real Units 1–4 and Chapter 14/15 as unavailable: this is honest UI, **not** functioning multi-chapter selection. Future chapters should be activated only when reviewed banks are connected.
- [ ] Current 20-question/open sessions repeat after 12 distinct exam-level questions; increase unique pool before suggesting robust long-form repetition.
- [ ] Keep self-review separate from validated mastery/readiness score.

## Priority 3 — student QA and release evidence

- [ ] Instructor/Kaylee review of chapter-end pool and a sample from **every** foundational/applied format.
- [ ] A few student think-aloud sessions: observe confusing directions, multiple defensible answers, or weak feedback.
- [ ] Verify browser performance at narrow and wide widths, keyboard access and screen-reader text, iframe height changes, reset and local storage behavior.
- [ ] Check original chapter content, synthesis, Harbor Town FRQ, and navigation were preserved after main-branch changes and PR merges.
- [ ] Log remaining nonblocking improvements separately. Student flagging and question-quality dashboard remain future roadmap; stable IDs and review statuses should support them later.

## Proposed go/no-go decision

**Ready to merge only when:** no invalid/ambiguous answer keys or severe interaction defects remain; all essential skills, misconceptions and representations are served by reviewed practice; chapter-end bank offers sufficient **distinct** exam-demand scenarios for repeated 10-question sessions; an instructor/Kaylee review and student usability pilot identify no serious unresolved problems; updated branch is checked against current main for conflicting changes.

**Not required:** adaptive selection, mastery badges, automatic FRQ grading, cross-chapter spiral review, student analytics dashboard, huge item counts, or universal use of every practice format.

**Next implementation action:** repair P0 structural defects and implement a bank linter, then perform the item-by-skill gap audit. **Do not bulk-generate new questions before that audit.**
