/* Calculation Lab (v5 spec in docs/PRECISE-PRACTICE-ASSESSMENT-DESIGN.md).
 * activity.deck: {formula, hint, worked_example:{prompt, steps[], answer},
 *                 rounding_rule, progression:[1,3,5],
 *                 problems:[{id, prompt, answer:{value, tolerance, unit},
 *                            classify?:{answer, options[]}, solution:[...],
 *                            common_errors:[{value, tolerance, label, feedback}]}]}
 *
 * One skill per deck. Stage 1 is guided (supports on, checked alone). Stages
 * 2 and 3 show 3 and 5 compact rows with one Check All; supports start off and
 * each checkbox shows its content directly. Wrong rows can be fixed and
 * rechecked. Worked solutions to the active problems appear only after Check.
 */
(function (PP) {
  "use strict";
  const { esc, parseNumber } = PP.util;

  PP.register("calc", {
    render(host, activity, ctx) {
      const deck = activity.deck;
      const prog = deck.progression || [1, 3, 5];
      const st = ctx.state;
      if (st.stage == null || !st.rows || st.rows.some((k) => k >= deck.problems.length)) newStage(0);

      function newStage(s) {
        st.stage = s;
        st.rows = PP.deal(st, "problems", deck.problems.length, prog[s]);
        st.entries = {}; st.classes = {}; st.results = {}; st.counted = {};
        const guided = s === 0;
        st.show = { formula: guided, hints: guided, example: guided };
        ctx.save();
        ctx.shown("stage");
      }

      function supports() {
        let h = '<fieldset class="pp-supports"><legend class="pp-sr">Supports</legend>' +
          [["formula", "Show formula"], ["hints", "Show hints"], ["example", "Show worked example"]].map(([k, lab]) =>
            '<label><input type="checkbox" data-sup="' + k + '"' + (st.show[k] ? " checked" : "") + "> " + lab + "</label>").join("") + "</fieldset>";
        if (st.show.formula) h += '<div class="pp-support-box"><b>Formula:</b> ' + esc(deck.formula) + (deck.rounding_rule ? '<div class="pp-tiny">' + esc(deck.rounding_rule) + "</div>" : "") + "</div>";
        if (st.show.hints) h += '<div class="pp-support-box"><b>Hint:</b> ' + esc(deck.hint) + "</div>";
        if (st.show.example && deck.worked_example) {
          const w = deck.worked_example;
          h += '<div class="pp-support-box"><b>Worked example (different numbers):</b> ' + esc(w.prompt) + "<ol>" + w.steps.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ol><b>" + esc(w.answer) + "</b></div>";
        }
        return h;
      }

      function row(k, n) {
        const p = deck.problems[k];
        const r = st.results[k];
        let h = '<div class="pp-calc-row' + (r ? (r.ok ? " pp-row-good" : " pp-row-bad") : "") + '">';
        h += "<div><b>" + (n + 1) + ".</b> " + esc(p.prompt) + "</div>" + PP.figure(p.figure);
        h += '<div class="pp-calc-inputs"><label class="pp-sr" for="pp-in' + k + '">Answer ' + (n + 1) + "</label>" +
          '<input id="pp-in' + k + '" data-in="' + k + '" inputmode="decimal" autocomplete="off" value="' + esc(st.entries[k] || "") + '"' + (r && r.ok ? " disabled" : "") + ">" +
          (p.answer.unit ? "<span>" + esc(p.answer.unit) + "</span>" : "");
        if (p.classify) {
          h += '<label class="pp-sr" for="pp-cl' + k + '">Classify ' + (n + 1) + "</label>" +
            '<select id="pp-cl' + k + '" data-cl="' + k + '"' + (r && r.ok ? " disabled" : "") + '><option value="">Classify…</option>' +
            p.classify.options.map((o) => '<option value="' + esc(o) + '"' + (st.classes[k] === o ? " selected" : "") + ">" + esc(o) + "</option>").join("") + "</select>";
        }
        if (st.stage === 0) h += '<button type="button" class="pp-primary" data-one="' + k + '">Check</button>';
        h += "</div>";
        if (r) {
          h += '<div class="pp-result ' + (r.ok ? "pp-ok" : "pp-no") + '" role="status">' + esc(r.msg) + "</div>";
          h += '<details><summary class="pp-tiny">Worked solution</summary><ol class="pp-tiny">' + p.solution.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ol></details>";
        }
        return h + "</div>";
      }

      function grade(k) {
        const p = deck.problems[k];
        const v = parseNumber(st.entries[k]);
        if (Number.isNaN(v)) return { ok: false, msg: "Enter a number" + (p.answer.unit === "%" ? " (a negative number for a decrease)." : ".") };
        const numOk = Math.abs(v - p.answer.value) <= p.answer.tolerance + 1e-9;
        const clsOk = !p.classify || st.classes[k] === p.classify.answer;
        if (numOk && clsOk) return { ok: true, msg: "Correct.", v };
        if (numOk && !clsOk) return { ok: false, v, classOnly: true, msg: st.classes[k] ? "The number is right. Check the classification: compare it with 1." : "The number is right. Now classify it." };
        const err = (p.common_errors || []).find((e) => Math.abs(v - e.value) <= e.tolerance + 1e-9);
        return { ok: false, v, err, msg: err ? err.feedback : "Not quite. Check each step" + (st.show.hints ? "." : ", or turn on the hint.") };
      }

      function check(keys) {
        keys.forEach((k) => {
          const r = st.results[k] = grade(k);
          const p = deck.problems[k];
          ctx.record(p, {
            key: "stage", correct: r.ok,
            resp: { raw: PP.clip(st.entries[k], 24), value: Number.isFinite(r.v) ? r.v : null, cls: st.classes[k] || null,
                    error: r.err ? r.err.label : r.classOnly ? "classification" : null },
            misc: [r.err && r.err.misconception],
            extra: { stage: prog[st.stage], supports: Object.assign({}, st.show) }
          });
          delete r.err; delete r.v;
          if (!st.counted[k]) { st.counted[k] = true; ctx.count(); }
        });
        ctx.save(); draw();
      }

      function draw() {
        const n = prog[st.stage];
        let h = '<div class="pp-stage" aria-label="Progress through this deck">' + prog.map((p, i) => '<span class="' + (i === st.stage ? "pp-on" : "") + '">' + p + "</span>").join("") +
          "<span style=\"border:none\">" + (st.stage === 0 ? "Guided problem" : n + " problems") + "</span></div>";
        h += supports();
        h += st.rows.map(row).join("");
        const checked = st.rows.every((k) => st.results[k]);
        const allOk = st.rows.every((k) => st.results[k] && st.results[k].ok);
        h += '<div class="pp-actions">';
        if (st.stage > 0 && !allOk) h += '<button type="button" class="pp-primary" id="pp-all">' + (checked ? "Recheck" : "Check all") + "</button>";
        if (checked) {
          const last = st.stage === prog.length - 1;
          h += '<button type="button" class="' + (allOk ? "pp-primary" : "") + '" id="pp-next">' + (last ? "New set of " + prog[st.stage] : "Continue to " + prog[st.stage + 1] + " problems") + "</button>";
        }
        h += "</div>";
        host.innerHTML = h;
        host.querySelectorAll("[data-sup]").forEach((c) => (c.onchange = () => { st.show[c.dataset.sup] = c.checked; ctx.save(); draw(); }));
        host.querySelectorAll("[data-in]").forEach((i) => (i.oninput = () => { st.entries[i.dataset.in] = i.value; ctx.save(); }));
        host.querySelectorAll("[data-cl]").forEach((s) => (s.onchange = () => { st.classes[s.dataset.cl] = s.value; ctx.save(); }));
        host.querySelectorAll("[data-one]").forEach((b) => (b.onclick = () => check([Number(b.dataset.one)])));
        const all = host.querySelector("#pp-all");
        if (all) all.onclick = () => check(st.rows.filter((k) => !(st.results[k] && st.results[k].ok)));
        const next = host.querySelector("#pp-next");
        if (next) next.onclick = () => {
          const last = st.stage === prog.length - 1;
          newStage(last ? st.stage : st.stage + 1);
          if (!(last && ctx.roundDone())) draw();
        };
        ctx.resized();
      }
      draw();
    }
  });
})(window.PP);
