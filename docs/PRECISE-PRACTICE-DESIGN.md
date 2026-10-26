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


## Three practice tiers (instructional demand, not mandatory sequence)

| Tier | Aim | Representative tasks | Feedback/scaffolding |
|---|---|---|---|
| **1 — Foundational: knowledge, intuition, fluency** | Recognize, retrieve, discriminate, correct misconceptions, translate basic representations | Vocabulary Match, Definition Detective, Missing Piece, Spot the Concept, Rapid Sort, flash prediction, misconception flash practice, Graph Match | Fast low-friction batches; brief feedback; targeted new variants; optional test-out |
| **2 — Intermediate: guided and blocked application** | Reliably perform the actual moves of the discipline | Read/label a graph, fill a table, numeric entry, interpret data, guided calculations, manipulate a curve, complete a partially worked example, straightforward concept application | Block by skill; worked examples and faded hints; immediate step-specific feedback; independent attempts after guidance |
| **3 — Advanced: application and judgment** | Select, combine, justify, critique, and transfer ideas to unfamiliar real-world problems | AP Micro-style FRQs, AP Psychology Article Analysis Questions (AAQs), Evidence-Based Questions (EBQs), authentic classroom/economic cases, error analysis, missing-step problems, argument evaluation, evidence synthesis | Rubrics, model reasoning, targeted critique, consideration of assumptions/limits, optional AI-assisted formative explanation only after validation |

**Important:** These tiers describe cognitive demands, not a fixed sequence or a requirement to complete every activity. Students may test out of foundational work; difficulty and support should follow prior knowledge. Tier 2 deserves focused prototyping before scaling Tier 3. EDCOR advanced questions must culminate in decisions for classroom instruction, not simply knowing psychology.

### Tier 2 design priorities

Build a reusable blocked-practice engine with consistent controls and optional scaffolding: (1) complete worked example; (2) partially completed problem; (3) independent version; (4) fresh transfer check. Candidate task families: graph reading and labeling, table completion, numerical calculations, equation completion, simple model manipulation, and direct classroom scenario diagnosis. Use targeted hints, clear assumptions, accessible non-drag alternatives, and concise feedback. Avoid assuming that every procedure needs all four stages.

### Tier 3 design priorities

- **AP Micro FRQ pattern:** interpret/construct a graph, compute, predict a change, explain a mechanism, and justify with economic reasoning. Align with actual Econ 150 outcomes, not every AP unit.
- **AP Psychology AAQ pattern:** interpret a study's methods, variables, evidence, ethics, generalizability, and warranted implications.
- **AP Psychology EBQ pattern:** make a claim, integrate evidence from multiple research summaries, explain reasoning, acknowledge uncertainty.
- **EDCOR professional case:** diagnose classroom needs, choose an intervention, justify evidence, anticipate consequences, and reflect on limits and discipleship.
- **Additional high-leverage formats:** authentic cases, error analysis, critique/evaluate an argument, identify missing assumptions or steps, compare competing explanations, and multistep decisions with incomplete information.

## Broad item-format library — beyond traditional AP formats

Separate **cognitive operation** from **UI format**. Research and prototype formats for their instructional leverage, not novelty:

| Format | Best uses and cautions |
|---|---|
| Single-select MC; multiple response / select-all-that-apply | Precise misconceptions or complete sets; make distractors plausible and keys unambiguous |
| Animated term matching; card sort / drag buckets | Efficient associations, discrimination, categorization; equivalent tap/keyboard controls |
| Hotspot / click the region | Identify axes, graph features, diagram structures, evidence in a document; generous targets and accessible equivalents |
| Region shading / area selection | Consumer surplus, producer surplus, deadweight loss, feasible sets; accurate geometry, clear boundaries and alternative non-pointer interaction |
| Drag a point, curve, or label | Comparative statics, equilibrium, model manipulation; precise snap rules and keyboard support |
| Graph construction / graph match | Reading, producing, and translating graphical relationships; correct D/S and D′/S′ labeling |
| Table fill / spreadsheet-like entry | Marginal values, elasticities, experimental results; explicit units and tolerances |
| Numeric input / equation completion | Calculations without multiple-choice cues; equivalent answer formats and error-specific feedback |
| Ordering / sequencing | Causal chains, instructional processes; avoid false single-order assumptions |
| Highlight an error / annotate evidence | Find incorrect reasoning, identify study evidence, diagnose a misconception |
| Short text / own-words explanation | Retrieval, aphorism interpretation, mechanism explanation; rubric/self-check or validated AI feedback |
| Compare cases / classify examples and nonexamples | Distinguish concepts and boundary conditions |
| Prediction then reveal / interactive simulation | Intuition building; don't reveal answers before independent attempt |
| Confidence estimate / self-evaluation | Metacognitive calibration; not a mastery claim |
| FRQ / structured extended response | Multistep application and justification; rubric and model solution |
| Branching scenario | Professional/economic decisions and consequences; avoid arbitrary game outcomes |

**Quality bar for every format:** Explicit learning objective, correct model, short and readable prompt, plausible mistakes, instructional feedback, mobile/keyboard/screen-reader accessibility, clear evidence limits, and measurable benefit relative to student time. Hotspots and shading must not require fine motor precision or color discrimination.

## Existing textbook exercise audit before broad implementation

Inventory and evaluate what already exists. Initial Econ repository inspection identified substantial homework/skill-map prototypes in **Chapters 11 and 12**, including checkpoint practice and test-out; other chapters have expandable quick checks and retrieval prompts, and Chapters 3–4 contain embedded iframes. Locate the EDCOR experiments before drawing conclusions about reuse. Audit instructional value, accessibility, feedback, persistence, complexity, and consistency. Mark **keep / improve / adapt / retire**. Do not duplicate working infrastructure or treat raw HTML counts as proof of usability.

## Next steps

1. Instructor review of this playbook and prototype examples.
2. Pilot the aphorism AI feedback rubric on a small response corpus.
3. Refine the four foundational engines; test accessibility and delayed transfer.
4. Build a chapter-level pattern gallery and minimal spiral/dashboard proof of concept only after quality is established.
