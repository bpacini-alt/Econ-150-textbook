# Precise Practice — Design Playbook (working draft)

**Status: Deliberate, thoughtful brainstorming.** Applies to Econ 150 and EDCOR 310, with discipline-specific possibilities.

This is a design notebook: a place to collect promising ideas, working hypotheses, prototype patterns, and questions worth testing. It is not a required chapter template, implementation protocol, scoring rubric, or promise that every chapter will use every engine, tier, question type, or sequence. The ideas below should become more settled only through instructor review, small pilots, student experience, accessibility checks, and evidence of learning.

**Current pilot boundary:** The Econ 15 pilot with Tayleigh and the Econ 16 pilot Benjamin is testing are live experiments. Do not refactor, standardize, or otherwise alter them as part of this documentation work.

## Purpose and working principles worth exploring

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

## Candidate foundational engine patterns

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

## Student experience and implementation questions

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


## A possible three-tier architecture

| Tier | Aim | Representative tasks | Feedback/scaffolding |
|---|---|---|---|
| **1 — Foundational: knowledge, intuition, fluency** | Recognize, retrieve, discriminate, correct misconceptions, translate basic representations | Vocabulary Match, Definition Detective, Missing Piece, Spot the Concept, Rapid Sort, flash prediction, misconception flash practice, Graph Match | Fast low-friction batches; brief feedback; targeted new variants; optional test-out |
| **2 — Intermediate: guided and blocked application** | Reliably perform the actual moves of the discipline | Read/label a graph, fill a table, numeric entry, interpret data, guided calculations, manipulate a curve, complete a partially worked example, straightforward concept application | Block by skill; worked examples and faded hints; immediate step-specific feedback; independent attempts after guidance |
| **3 — Advanced: application and judgment** | Select, combine, justify, critique, and transfer ideas to unfamiliar real-world problems | AP Micro-style FRQs, AP Psychology Article Analysis Questions (AAQs), Evidence-Based Questions (EBQs), authentic classroom/economic cases, error analysis, missing-step problems, argument evaluation, evidence synthesis | Rubrics, model reasoning, targeted critique, consideration of assumptions/limits, optional AI-assisted formative explanation only after validation |

**Important:** These tiers describe cognitive demands, not a fixed sequence or a requirement to complete every activity. Students may test out of foundational work; difficulty and support should follow prior knowledge. Tier 2 deserves focused prototyping before scaling Tier 3. EDCOR advanced questions must culminate in decisions for classroom instruction, not simply knowing psychology.

### Tier 2 ideas worth prototyping

Build a reusable blocked-practice engine with consistent controls and optional scaffolding: (1) complete worked example; (2) partially completed problem; (3) independent version; (4) fresh transfer check. Candidate task families: graph reading and labeling, table completion, numerical calculations, equation completion, simple model manipulation, and direct classroom scenario diagnosis. Use targeted hints, clear assumptions, accessible non-drag alternatives, and concise feedback. Avoid assuming that every procedure needs all four stages.

### Tier 3 ideas worth prototyping

- **AP Micro FRQ pattern:** interpret/construct a graph, compute, predict a change, explain a mechanism, and justify with economic reasoning. Align with actual Econ 150 outcomes, not every AP unit.
- **AP Psychology AAQ pattern:** interpret a study's methods, variables, evidence, ethics, generalizability, and warranted implications.
- **AP Psychology EBQ pattern:** make a claim, integrate evidence from multiple research summaries, explain reasoning, acknowledge uncertainty.
- **EDCOR professional case:** diagnose classroom needs, choose an intervention, justify evidence, anticipate consequences, and reflect on limits and discipleship.
- **Additional high-leverage formats:** authentic cases, error analysis, critique/evaluate an argument, identify missing assumptions or steps, compare competing explanations, and multistep decisions with incomplete information.

## Candidate item-format library — ideas to test

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

**Questions to ask about any format:** Explicit learning objective, correct model, short and readable prompt, plausible mistakes, instructional feedback, mobile/keyboard/screen-reader accessibility, clear evidence limits, and measurable benefit relative to student time. Hotspots and shading must not require fine motor precision or color discrimination.

## Questions for auditing existing exercises

Inventory and evaluate what already exists. Initial Econ repository inspection identified substantial homework/skill-map prototypes in **Chapters 11 and 12**, including checkpoint practice and test-out; other chapters have expandable quick checks and retrieval prompts, and Chapters 3–4 contain embedded iframes. Locate the EDCOR experiments before drawing conclusions about reuse. Audit instructional value, accessibility, feedback, persistence, complexity, and consistency. Mark **keep / improve / adapt / retire**. Do not duplicate working infrastructure or treat raw HTML counts as proof of usability.

## Working hypothesis: representation-specific practice

**Current working hypothesis: Econ and EDCOR do not share one Tier 2 instructional engine.** Share UI components, item-bank infrastructure, accessibility and feedback patterns, but tailor the *cognitive moves* to course outcomes. Econ emphasizes reading/completing tables, graphs and equations, calculations, comparative statics and economic decisions. EDCOR emphasizes classroom/student-work observations, research evidence, instructional diagnosis, selection and justification of classroom action, and evaluation of consequences. Avoid forcing EDCOR into graph/table-first Econ practice.

**Rule of Four is a fluency goal, not a screen-layout mandate.** Evidence on multiple external representations supports coordinating representations and cultivating translation and sense-making; it does not imply every question should simultaneously display story, table, graph and equation. Too many representations can introduce unnecessary cognitive load or reveal the answer. The research does not establish this exact three-mode UI as a uniquely optimal sequence.

- **Connect (supported):** Show aligned table and graph together, with corresponding quantities/points deliberately highlighted. Explain *why* they represent the same mechanism.
- **Translate (independent):** Supply one representation and require a second—table to graph **and** graph to table, story to graph, equation to table, etc. Keep the target representation hidden until students attempt it.
- **Choose (strategic):** In more demanding tasks, select the appropriate representation for a purpose and justify the choice.

**MRP Tier 2 prototype revision:** Keep the production table persistent in calculation mode; let students enter missing MP/MRP and select the last worthwhile hire directly. An optional worked connection view shows the matching MRP graph and highlights corresponding table/graph entries. A separate graph-to-table mode presents the graph as the source for reading values (not the pre-completed table). Do not show the graph as an answer key during independent calculation. Use ten or more checked parameter sets or authored variants, targeted fresh retries, optional hints, and a low-friction single-screen interface. The first ten variants are a content bank, not a requirement to do all ten.

**Progress/evidence:** A small vertical bar tracks practice attempts or homework progress, separately from performance. Use **Not yet assessed**, **Practice recommended**, **Understanding demonstrated**, and a carefully qualified gold **Likely mastered** *only* for strong independent advanced FRQ-like transfer plus other evidence (ideally delayed). No current quick check establishes durable mastery. Offer short skills-based test-out on fresh cases, and keep homework submission distinct from understanding indicators.

**Specific QA issues:** Check hiring decisions at MRP = wage; explicitly state price-taker/constant wage assumptions; keep discrete worker MRP points distinct from a continuous interpolated curve; verify chart scales and labels; provide accessible alternatives for graph manipulation; ensure entering and changing responses cannot double-count attempts. Compare novice and advanced students for comprehension, time, and delayed retention.

## Current brainstorming: possible pilots

These are concrete ideas worth testing, not commitments to build or standardize.

### Econ: a possible MRP Tier 2 pilot

One promising pilot would move through **Read → Construct → Reason economically**:
read a discrete marginal revenue product graph; construct a table from a graph or a graph from a table; then make and justify a hiring decision as wages or output prices change.

We might explore 10+ validated variants, targeted feedback, a small progress indicator for attempts rather than mastery, and a fresh integrated test-out. “Connect” views could show linked representations as optional scaffolding, while independent translation would hide the target representation until the student attempts it.

### EDCOR: a possible hidden curriculum of effective learning

Another promising direction is to let students repeatedly encounter retrieval, spacing, feedback, worked examples, useful representations, and evidence-informed judgment while learning course content. The goal would be to model and practice these ideas without turning them into slogans or a second lecture about study skills.

Highlighting and rereading would be treated with nuance: they may help focus or organize attention, but by themselves they are generally weaker than retrieval and distributed practice for durable learning.

### Possible EDCOR practice families

Worth exploring:
- noticing diagnostically relevant evidence in student work or classroom cases;
- distinguishing forgetting, nonunderstanding, motivation, attention, and performance;
- choosing and refining a teaching move;
- sequencing a practice schedule, feedback cycle, or worked-example fade;
- interpreting results while acknowledging limits and competing explanations.

These should remain distinct from the Econ graph/table practice engine even if the two books share technical components.

### Possible integrated test-out

A future EDCOR test-out might present a fresh classroom situation and student evidence, then ask students to identify the evidence, construct an actionable learning plan, justify the choice, anticipate an outcome, and distinguish competing explanations. This is a hypothesis to test, not a required assessment format.

## Working design insight: blocked practice, then interleaving (2026-10-31)

**Core hypothesis to preserve for both books:** Give students abundant, approachable chances to practice *one specific distinction or procedure* with feedback, then offer mixed/interleaved practice where they must decide **which** idea or tool applies. Make the transition visible, optional, and responsive to students' needs. The current Econ Chapter 16 pilot's **Mix it up** versus focused practice-style choice is a promising interface; it is a pilot to evaluate, not a mandatory pattern or a validated algorithm.

**Blocked practice (focus on one thing):** Students deliberately choose a target such as property-rights classification, definition precision (A/A−/F), recognizing public versus common goods, or correcting one common reasoning error. Keep enough fresh variations for repeated, successful discrimination and targeted correction. This can lower the initial burden of deciding *what kind of problem it is* while the student learns the underlying move.

**Interleaved practice (mix it up):** Once some basic familiarity develops, mix concepts, problem types, representations, and plausible distractors so students must **identify the appropriate tool** before using it. Interleaving should be thoughtfully sequenced, not purely random; avoid repetitive streaks and irrelevant switching. Mix across different concepts as well as within a concept when enough material has been learned. A student may choose interleaving early, or return to blocked practice if mixed work exposes a gap.

**Instructional distinction:** Rotating *interaction formats* (flashcards, sorting, missing piece) while testing the same concept is varied practice, not necessarily concept interleaving. Genuine interleaving requires discriminating among multiple relevant categories, procedures, or concepts without being told which one applies. This distinction matters for both the item bank and claims about learning benefits.

**Student-facing language to test:** “Focus on one skill” and “Mix it up” may be clearer than technical vocabulary alone. Optionally label them **Blocked practice** and **Interleaved practice** in small explanatory text so EDCOR students learn the pedagogy they are experiencing. Avoid requiring students to learn jargon before they can use the practice. Brief explanations: “Focus: repeat one kind of problem until it feels more comfortable” and “Mix: choose among ideas and strategies in varied situations.”

**Self-assessment and support:** Periodically ask “Can I explain this without hints?” or “Would I like more focused practice, mixed practice, or a harder challenge?” Encourage voluntary return to targeted items and suggest consulting the instructor or TAs when repeated attempts and explanations do not resolve confusion. **Feeling confident is not the same as verified mastery.** Use accuracy on fresh, different problems and delayed mixed review as additional evidence, while letting students decide what to practice next.

**Research-informed caution:** Blocked practice can facilitate initial acquisition and fluency; interleaving often improves discrimination and longer-term retention in suitable domains, but results vary with task, prior knowledge, spacing, difficulty, and how students compare examples. Neither “always block until mastery” nor “interleaving is always superior” is an evidence-supported universal rule. Some students may benefit from comparisons early in learning. Prototype sensible transitions and monitor transfer, burden, and student experience rather than enforcing a fixed threshold.

**Do not modify** the in-progress Econ 15 or Econ 16 pilot as part of recording this idea. Any later UI change should be evaluated separately.

## Possible next experiments

1. Instructor review of this playbook and prototype examples.
2. Pilot the aphorism AI feedback rubric on a small response corpus.
3. Refine the four foundational engines; test accessibility and delayed transfer.
4. Build a chapter-level pattern gallery and minimal spiral/dashboard proof of concept only after quality is established.
