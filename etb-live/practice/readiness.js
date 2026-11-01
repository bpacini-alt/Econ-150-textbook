/* Chapter-end readiness (ported from precise-readiness-pilot.js, PR #112).
 * bank.readiness: {streak:5, items:[{id, prompt, options, answer, why}],
 *                  spiral:[{chapter, unit, title, bank?:"<bank-id>", items?:[...]}]}
 *
 * Five correct answers in a row, each followed by "I could explain it,"
 * interleaving this chapter with earlier ones. A wrong or uncertain answer
 * restarts the streak. Reaching the streak unlocks the chapter FRQ through a
 * message to the host page. This is a readiness signal, not a mastery claim.
 */
(function (PP) {
  "use strict";
  const { esc, order } = PP.util;

  PP.mountReadiness = async (el, bank, store) => {
    const cfg = bank.readiness || {};
    const need = cfg.streak || 5;
    const current = { chapter: bank.chapter, title: bank.title, items: cfg.items || [] };
    if (!current.items.length) { el.innerHTML = '<div class="pp-panel">No readiness questions yet.</div>'; return; }

    const prior = [];
    for (const s of cfg.spiral || []) {
      let items = s.items || [];
      if (s.bank) {
        try { const b = await PP.loadBank(s.bank); if (b.readiness && b.readiness.items && b.readiness.items.length) items = b.readiness.items; }
        catch (e) { /* fall back to inline items */ }
      }
      if (items.length) prior.push({ chapter: s.chapter, unit: s.unit, title: s.title, items });
    }

    const S = store.data;
    const R = S.ready = S.ready || { chosen: prior.map((p) => p.chapter), started: false, streak: 0, attempts: 0, stage: "q", turn: 0, cursors: {}, pending: null, unlocked: false };
    const save = () => store.save();
    const chosen = () => prior.filter((p) => R.chosen.includes(p.chapter));

    function nextItem() {
      const usePrior = chosen().length && R.streak % 2 === 1;
      const pools = usePrior ? chosen() : [current];
      const pool = pools[R.turn % pools.length];
      const key = String(pool.chapter);
      R.cursors[key] = R.cursors[key] || { ord: order(pool.items.length), pos: 0 };
      const c = R.cursors[key];
      if (c.ord.length !== pool.items.length || c.pos >= c.ord.length) { c.ord = order(pool.items.length); c.pos = 0; }
      const idx = c.ord[c.pos++];
      return { chapter: pool.chapter, idx, opt: order(pool.items[idx].options.length), picked: null, correct: null, shownAt: Date.now() };
    }
    const itemOf = (p) => (p.chapter === current.chapter ? current : prior.find((x) => x.chapter === p.chapter)).items[p.idx];

    function render() {
      let h = '<div class="pp-panel"><div class="pp-eyebrow">Chapter ' + esc(bank.chapter) + " readiness check</div>";
      h += '<div class="pp-title">' + need + " in a row, and you can explain each one</div>";
      if (!R.started) {
        h += '<p>Practice here is always optional. Answer ' + need + " questions correctly in a row, and confirm you could explain each answer, to open the chapter’s final reasoning task." +
          (prior.length ? " Questions mix this chapter with earlier chapters." : "") + "</p>";
        if (prior.length) {
          h += '<fieldset class="pp-check-list"><legend>Earlier chapters to include</legend>' + prior.map((p) =>
            '<label><input type="checkbox" data-ch="' + p.chapter + '"' + (R.chosen.includes(p.chapter) ? " checked" : "") + "> Chapter " + esc(p.chapter) + " · " + esc(p.title) + "</label>").join("") + "</fieldset>";
        }
        h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-start">Start the readiness check</button></div>';
      } else if (R.unlocked) {
        h += '<div class="pp-feedback" role="status"><b>Ready for the final reasoning task.</b><p>' + need + " correct answers in a row that you said you could explain. That’s encouraging evidence, not proof of mastery.</p></div>";
        h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-frq">Go to the final reasoning task</button><button type="button" id="pp-again">Practice another round</button></div>';
      } else {
        if (!R.pending) { R.pending = nextItem(); save(); }
        const p = R.pending, it = itemOf(p);
        h += '<div class="pp-dots" role="img" aria-label="' + R.streak + " of " + need + ' in a row">' + Array.from({ length: need }, (_, i) => '<span class="' + (i < R.streak ? "pp-on" : "") + '"></span>').join("") + "</div>";
        h += '<div class="pp-tiny pp-muted">' + R.streak + " of " + need + (p.chapter !== current.chapter ? " · from Chapter " + esc(p.chapter) : "") + "</div>";
        h += '<div class="pp-card"><div class="pp-prompt">' + esc(it.prompt) + "</div></div>" + PP.figure(it.figure);
        if (R.stage === "q") {
          h += '<div class="pp-choices">' + p.opt.map((i) => '<button type="button" class="pp-choice" data-ans="' + i + '">' + esc(it.options[i]) + "</button>").join("") + "</div>";
        } else {
          h += '<div class="pp-feedback' + (p.correct ? "" : " pp-bad") + '" role="status"><b>' + (p.correct ? "Correct." : "Not this time.") + "</b><p>" + esc(it.why) + "</p>" +
            (p.correct ? "" : "<p><b>Best answer:</b> " + esc(it.options[it.answer]) + "</p>") + "</div>";
          if (p.correct) h += '<fieldset><legend>Could you explain why, without looking?</legend><div class="pp-actions" style="margin-top:4px"><button type="button" class="pp-primary" data-sure="1">Yes, I could explain it</button><button type="button" data-sure="0">Not yet</button></div></fieldset>';
          else h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-next">Try another question</button></div>';
        }
      }
      h += '<p class="pp-tiny pp-muted">Stuck? Go back to a concept’s practice, or ask your instructor or a TA.</p></div>';
      el.innerHTML = h;
      wire();
      PP.resized && PP.resized();
    }

    function record(p, fields) {
      const it = itemOf(p);
      S.attempts = S.attempts || {};
      const n = S.attempts[it.id] = (S.attempts[it.id] || 0) + 1;
      PP.recordEvent(Object.assign({
        concept: "ready", type: "choice", tier: 3, mode: "readiness",
        unit: it.id, unit_v: it._v || null, attempt: n,
        ms: p.shownAt ? Date.now() - p.shownAt : null
      }, fields));
    }

    function advance(understood) {
      if (R.pending && R.pending.correct) record(R.pending, { act: "readiness-confirm", correct: null, resp: { understood: !!understood, streak_before: R.streak }, misc: [] });
      R.streak = understood ? R.streak + 1 : 0;
      R.turn++; R.stage = "q"; R.pending = null;
      if (R.streak >= need) { R.unlocked = true; PP.post({ kind: "etb-precise-unlock-frq" }); }
      save(); render();
    }

    function wire() {
      el.querySelectorAll("[data-ch]").forEach((c) => (c.onchange = () => {
        const n = Number(c.dataset.ch);
        R.chosen = c.checked ? Array.from(new Set(R.chosen.concat(n))) : R.chosen.filter((x) => x !== n);
        save();
      }));
      const start = el.querySelector("#pp-start");
      if (start) start.onclick = () => { R.started = true; save(); render(); };
      el.querySelectorAll("[data-ans]").forEach((b) => (b.onclick = () => {
        const p = R.pending, it = itemOf(p);
        p.picked = Number(b.dataset.ans); p.correct = p.picked === it.answer;
        record(p, {
          act: "readiness", correct: p.correct,
          resp: { opt: p.picked, pos: p.opt.indexOf(p.picked), from_ch: p.chapter, streak_before: R.streak },
          misc: [it.option_misconceptions && it.option_misconceptions[p.picked]].filter(Boolean)
        });
        R.attempts++; R.stage = "f"; save(); render();
      }));
      el.querySelectorAll("[data-sure]").forEach((b) => (b.onclick = () => advance(b.dataset.sure === "1")));
      const next = el.querySelector("#pp-next");
      if (next) next.onclick = () => advance(false);
      const frq = el.querySelector("#pp-frq");
      if (frq) frq.onclick = () => { PP.post({ kind: "etb-precise-unlock-frq" }); PP.post({ kind: "etb-precise-go-frq" }); };
      const again = el.querySelector("#pp-again");
      if (again) again.onclick = () => { R.unlocked = false; R.streak = 0; R.stage = "q"; R.pending = null; R.turn++; save(); PP.post({ kind: "etb-precise-relock-frq" }); render(); };
    }

    render();
    if (R.unlocked) PP.post({ kind: "etb-precise-unlock-frq" });
  };
})(window.PP);
