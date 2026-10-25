# Precise Practice — Design Playbook (working draft)

**Status:** Agreed direction; patterns are provisional pending student testing. Applies to Econ 150 and EDCOR 310 with discipline-specific applications. **Do not turn this into a mandatory activity checklist.**

## Purpose and six principles

We use questions to develop capable, thoughtful, principled people—not IQ, test-taking performance, or scores. Econ students should learn to think like economists; EDCOR students should become wise, evidence-informed educators and disciples able to make classroom decisions.

1. **Practice for life, not tests.** Aim at disciplinary reasoning, professional competence, judgment, character, and discipleship; don't claim a quiz measures goodness.
2. **Build foundations until intuitive.** Vocabulary, concepts, retrieval, rapid predictions, and accurate automatic discrimination.
3. **Make misconceptions visible and correctable.** Identify plausible faulty mental models, explain why they fail, repair, then practice the correct distinction repeatedly.
4. **Scaffold early; challenge later.** Blocked guided practice first, then fading supports, interleaving, missing steps, and authentic transfer.
5. **Make practice compelling and economical.** Interesting, culturally varied, surprising, sometimes playful cases; every question earns student attention. Reduce irrelevant reading, especially for accessibility.
6. **Make learning visible without overstating mastery.** Practice feedback differs from homework completion. Students can test out, skip, revisit, and self-evaluate; dashboard language is 'some evidence of understanding,' never 'done forever.'

## Three instructional layers

- **Teaching / anchors:** Deliberately establish a canonical example, prototype, nonexample, contrast, and explanatory visual for high-leverage concepts. Test whether the anchor illuminates the mechanism without creating a new misconception. Coordinate prose and visuals; don't stack graph, equation, photo, and table by default.
- **Foundational engines:** Vocabulary & Concepts; Intuition & Fluency (including discrimination); Misconception Correction; Representation Translator (Rule of Four).
- **Application & judgment (later):** Authentic cases, evaluation of arguments and evidence, error analysis, missing-step challenges, decision-making with uncertainty, and transfer to economics or classroom practice.

**Spiral retrieval is shared infrastructure**, not a fifth required engine: brief opening review plus cumulative interleaved end practice where appropriate; tag concepts and return with varied representations and increased complexity. Align review spacing with homework/calendar rather than chapter order alone.

## Foundational engine patterns

### Vocabulary & Concepts
- **Animated Match:** Six face-up term/meaning pairs; correct pairs briefly highlight/fade and disappear; remaining cards close gaps. Respect reduced-motion settings. Recognition is only the first step.
- **Definition Detective:** Sort into **A** (fully correct), **A−** (correct concept but missing one essential feature), **F** (fundamentally wrong or describes a different concept). Author unmistakable distinctions and feedback.
- **Find the Missing Piece:** Match six A− definitions to six missing ideas; avoid accidental duplicate answers unless reuse is explicitly allowed. Supported and optional independent repair.
- **Spot the Concept:** Match concepts to short, meaningful scenarios; later contrast plausible neighboring concepts.

### Intuition & Fluency
- **Rapid Sort / Flash Prediction:** One familiar context (e.g. coffee market), six cognitive decisions on one screen, few words, consistent response buckets, batch feedback; extra *fresh variants* for missed relationships. Block price predictions, then quantity, then mix.
- **Discrimination:** Yes/No/Depends, examples/nonexamples, categorization, and conceptual boundaries. 'It depends' requires explicit conditions, not a sophisticated-sounding escape.

### Misconception Correction
Two complementary moves: **careful conceptual change** (surface tempting error, explain, contrast visually, repair) and **rapid correction practice** (six varied classifications, targeted fresh variants, later spiral check). Example: a **shift in demand** versus **change in quantity demanded**. A successful yes/no judgment does not by itself prove a misconception is gone.

### Representation Translator
Practice translations among **story, graph, table, equation** (Rule of Four), in multiple directions, not merely displaying them together. Don't force all four when irrelevant. Label original curves **D/S** and new curves **D′/S′**; keep unchanged curve visible, use dashed new curve, reveal equilibria/answers in feedback. Graphs must be mathematically accurate and accessible. Graph Match can remediate rapid intuition errors.

## High-leverage question-type repertoire (not per-page quotas)

Match; classify/sort; flash prediction; example/nonexample; A/A−/F; missing-piece repair; select-all-that-apply; ordering/sequence; compare/contrast; graph/table/story/equation translation; find-the-error; repair reasoning; missing-step; explanation in own words; evaluate an argument; interpret evidence; authentic case; interleaved application. For each question, record **cognitive target, conditions/assumptions, plausible errors, feedback, accessibility, and a fresh transfer variant**. Reuse a small number of interaction interfaces across cognitive tasks.

## Aphorisms

Aphorisms are **conceptual anchors, not merely vocabulary** and not a fifth engine. Revisit by recall, interpretation, discrimination, application, qualification, and (optionally) explanation in students' own words. Preserve the approved aphorism wording. E.g. 'Profit is a flare': signals possible opportunities for value creation relative to costs, attracts resources/competition, and is imperfect where market prices omit social effects. Allow legitimate alternative interpretations and caveats.

## Student experience and implementation

- Six quick cognitive moves per batch is a promising default, not a universal dosage. Minimize repeated instructions and reading. One familiar scenario can support multiple moves; later vary contexts for transfer.
- Prefer sort buckets and drag-and-drop where useful, with equivalent tap-to-place and keyboard/screen-reader paths. Keep subtle animation and reduced-motion support.
- Feedback teaches mechanism; don't interrupt each flash decision with long explanations. Errors trigger targeted new items, not identical retries.
- Optional test-out; short diagnostics are evidence, not definitive mastery. Minimal dashboard distinguishes **homework submitted** from **understanding demonstrated** and supports student self-evaluation.
- Keep question bank tagged by concept, source chapter, cognitive task, misconception, difficulty, representation, feedback, and spiral eligibility. Preserve content/outcome alignment: AP Micro for Econ rigor, AP Psychology AAQ/EBQ for scientific rigor, EDCOR extends into classroom practice.
- Do not reuse copyrighted or secure external assessment questions without permission.

## AI feedback pilot — do not roll out before validation

**Use case:** An aphorism explanation box: 'What does this mean in your own words?' Give **2–3 concise sentences**: captured idea, missing/incorrect idea, one next step. Low-stakes formative feedback only; avoid false precision from 0–10 scores. Optional rubric-based self-check fallback.

**Pilot design:**
1. Choose 3–5 aphorisms representing straightforward, nuanced, and misconception-prone principles. Write instructor-approved rubrics: essential ideas, acceptable alternatives, common errors, limits, and exemplars.
2. Build a corpus of ~40–60 diverse student-style responses (brief but right, eloquent but wrong, partly correct, unconventional but defensible, adversarial).
3. Have instructor score independently; compare AI accuracy, misconception detection, calibration, consistency, and instructional usefulness. Explicitly inspect false criticism of good answers.
4. Test whether students improve on a *new related question* after feedback, not just a rewritten original.
5. Only then pilot an embedded box: textbook -> Cloudflare Worker (secret API key, rubric, rate limit, abuse controls) -> inexpensive model -> short feedback. No student names, no consequential grades, clear data notice, verify university policy and cost. Graceful non-AI fallback.

**Pilot success criterion:** Reliable, actionable feedback that supports learning and accepts legitimate phrasing; not mere numerical agreement or student delight. Log costs and errors without unnecessary identifying data.

## Next steps

1. Instructor review of this playbook and prototype examples.
2. Pilot the aphorism AI feedback rubric on a small response corpus.
3. Refine the four foundational engines; test accessibility and delayed transfer.
4. Build a chapter-level pattern gallery and minimal spiral/dashboard proof of concept only after quality is established.
