/* Matrix Click: read a payoff matrix by clicking it, one step at a time.
 * The Chapter 24 companion to Graph Click (renderers/graphclick.js).
 *
 * activity: {streak?: n}   with a streak, the activity counts clean games in a
 *                          row (every step right on the first try) toward n.
 * activity.items: [{id, prompt, figure (kind "matrix", see figure.js), why, steps: [STEP, ...]}]
 * STEP: {ask, kind, ...}
 *   kind "payoff" target: [row, col, player]  player 0 = row player, 1 = column player.
 *                 Click one payoff number (e.g. "A's best payoff when B holds").
 *   kind "cell"   target: [row, col]. Click a whole cell (e.g. the Nash equilibrium).
 *   kind "choose" options[], answer, option_why?, option_misconceptions?, shuffle_options?
 *   focus? {row: i} or {col: j}: dim everything outside that row or column while
 *          the step is open, so the student compares only the payoffs that matter
 *   mark?  for a cell: a short tag drawn in it once the step is right ("Nash")
 *          (a right payoff is always ringed, so best responses stay visible)
 *   ok?    one line shown when the step is right
 *   near?  [{at, why, misconception?}] wrong clicks worth naming (same shape as target)
 *   miss?  feedback for any other wrong click
 * Wrong clicks don't end the game: the student tries again until it's right.
 * Payoffs and cells are real buttons, so Tab and Enter work without extra code.
 */
(function (PP) {
  "use strict";
  const { esc, order } = PP.util;
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  /* Marks for the steps already done. */
  function marksFor(it, upto) {
    const marks = { payoffs: [], cells: [] };
    for (let k = 0; k < upto; k++) {
      const s = it.steps[k];
      if (s.kind === "payoff") marks.payoffs.push(s.target);
      else if (s.kind === "cell") marks.cells.push({ at: s.target, label: s.mark || "" });
    }
    return marks;
  }

  function dimFor(fig, s) {
    if (!s || !s.focus) return {};
    const all = (n) => Array.from({ length: n }, (_, i) => i);
    if (s.focus.col != null) return { cols: all(fig.cols.length).filter((c) => c !== s.focus.col) };
    if (s.focus.row != null) return { rows: all(fig.rows.length).filter((r) => r !== s.focus.row) };
    return {};
  }

  PP.register("matrixclick", {
    render(host, activity, ctx) {
      const st = ctx.state;
      const items = activity.items;
      const need = activity.streak || 0;
      st.streak = st.streak || 0;

      function newItem() {
        st.cur = PP.deal(st, "items", items.length, 1)[0];
        st.step = 0; st.clean = true; st.done = false;
        st.msg = null; st.good = null; st.wrong = null; st.tried = []; st.ord = null;
        ctx.save();
      }
      if (st.cur == null || st.cur >= items.length || !items[st.cur].steps[st.step || 0]) newItem();

      let shownKey = null;
      function finishStep(it) {
        st.step += 1; st.wrong = null; st.tried = []; st.ord = null;
        if (st.step >= it.steps.length) {
          st.done = true;
          ctx.count();
          if (need) st.streak = st.clean ? st.streak + 1 : 0;
        }
        ctx.save();
      }

      function submitClick(it, at) {
        if (st.done) return;
        const s = it.steps[st.step];
        const key = it.id + "#" + st.step;
        // A click on either payoff in a cell counts as a click on the cell.
        const got = s.kind === "cell" ? at.slice(0, 2) : at;
        const resp = { step: st.step, kind: s.kind, at: got };
        if (same(got, s.target)) {
          ctx.record(it, { key, correct: true, resp: { ...resp, hit: "target" } });
          st.good = s.ok || null; st.msg = null;
          finishStep(it);
          draw(true);
          return;
        }
        let why = null, misc = null, hit = "miss";
        (s.near || []).some((n, i) => {
          if (same(got, n.at)) { why = n.why; misc = n.misconception || null; hit = "near" + i; return true; }
          return false;
        });
        ctx.record(it, { key, correct: false, resp: { ...resp, hit }, misc: [misc] });
        st.clean = false; st.good = null;
        st.msg = why || s.miss || "Not quite. Try again.";
        st.wrong = got;
        ctx.save();
        draw(true);
      }

      function submitChoice(it, opt) {
        if (st.done) return;
        const s = it.steps[st.step];
        const key = it.id + "#" + st.step;
        const right = opt === s.answer;
        ctx.record(it, { key, correct: right, resp: { step: st.step, kind: "choose", opt, pos: st.ord.indexOf(opt) },
          misc: [right ? null : s.option_misconceptions && s.option_misconceptions[opt]] });
        if (right) { st.good = s.ok || null; st.msg = null; finishStep(it); }
        else {
          st.clean = false; st.good = null; st.tried.push(opt);
          st.msg = (s.option_why && s.option_why[opt]) || s.miss || "Not quite. Try again.";
        }
        ctx.save();
        draw(true);
      }

      function draw(keepFocus) {
        const it = items[st.cur];
        const s = it.steps[st.step];
        const key = it.id + "#" + st.step;
        if (!st.done && shownKey !== key) { ctx.shown(key); shownKey = key; }
        const multi = it.steps.length > 1;
        let h = '<div class="pp-card"><div class="pp-prompt">' + esc(it.prompt) + "</div>";
        if (!st.done) {
          h += '<div class="pp-gc-ask">' + (multi ? '<span class="pp-gc-step">Step ' + (st.step + 1) + " of " + it.steps.length + "</span> " : "") + esc(s.ask) + "</div>";
        }
        const click = st.done || s.kind === "choose" ? null : s.kind;
        h += '</div><div class="pp-mx-fig">' + PP.matrixFigure(it.figure, { click, marks: marksFor(it, st.step), dim: st.done ? {} : dimFor(it.figure, s) }) + "</div>";
        if (!st.done && s.kind === "choose") {
          if (!st.ord) st.ord = s.shuffle_options === false ? s.options.map((_, i) => i) : order(s.options.length);
          h += '<div class="pp-choices" role="group" aria-label="Answer choices">' + st.ord.map((i) =>
            '<button type="button" class="pp-choice' + (st.tried.includes(i) ? " pp-is-wrong" : "") + '" data-opt="' + i + '"' + (st.tried.includes(i) ? " disabled" : "") + ">" + esc(s.options[i]) + "</button>").join("") + "</div>";
        } else if (!st.done) {
          h += '<p class="pp-tiny pp-muted pp-gc-help">' + (s.kind === "payoff" ? "Click or tap a payoff (one number)." : "Click or tap a cell.") + " Keyboard: Tab to it and press Enter.</p>";
        }
        if (st.msg) h += '<div class="pp-feedback pp-bad" role="status"><b>Not quite.</b><p>' + esc(st.msg) + "</p></div>";
        else if (st.good && !st.done) h += '<div class="pp-feedback pp-gc-good" role="status"><b>Yes.</b> ' + esc(st.good) + "</div>";
        if (st.done) {
          h += '<div class="pp-feedback' + (st.clean ? "" : " pp-gc-retry") + '" role="status"><b>' + (st.clean ? "Correct." : "Got it.") + "</b>" +
            (st.good ? "<p>" + esc(st.good) + "</p>" : "") + "<p>" + esc(it.why) + "</p></div>";
        }
        if (need) {
          const n = Math.min(st.streak, need);
          h += '<div class="pp-gc-streak"><div class="pp-dots" role="img" aria-label="' + n + " of " + need + ' in a row">' +
            Array.from({ length: need }, (_, i) => '<span class="' + (i < n ? "pp-on" : "") + '"></span>').join("") + "</div>" +
            '<div class="pp-tiny pp-muted">' + (st.streak >= need ? need + " in a row. That’s fluency. Keep going if you like." : n + " of " + need + " in a row. A game counts when every step is right on the first try.") + "</div></div>";
        }
        h += '<div class="pp-actions">' + (st.done ? '<button type="button" class="pp-primary" id="pp-go">Next game</button>' : "") + "</div>";
        host.innerHTML = h;
        host.dataset.item = it.id;
        host.dataset.step = st.done ? "done" : String(st.step);

        if (st.wrong) {
          const sel = st.wrong.length === 3
            ? '[data-r="' + st.wrong[0] + '"][data-c="' + st.wrong[1] + '"][data-p="' + st.wrong[2] + '"]'
            : '.pp-mx-cellbtn[data-r="' + st.wrong[0] + '"][data-c="' + st.wrong[1] + '"]';
          const w = host.querySelector(sel);
          if (w) w.classList.add("pp-mx-wrong");
        }
        host.querySelectorAll(".pp-mx-live button[data-r]").forEach((b) => (b.onclick = () => {
          const at = [Number(b.dataset.r), Number(b.dataset.c)];
          if (b.dataset.p != null) at.push(Number(b.dataset.p));
          submitClick(it, at);
        }));
        host.querySelectorAll("[data-opt]").forEach((b) => (b.onclick = () => submitChoice(it, Number(b.dataset.opt))));
        const go = host.querySelector("#pp-go");
        if (go) go.onclick = () => { newItem(); if (!ctx.roundDone()) draw(); };
        if (keepFocus) {
          const first = host.querySelector(".pp-mx-live button[data-r]") || host.querySelector("[data-opt]") || go;
          if (first) first.focus({ preventScroll: true });
        }
        ctx.resized();
      }
      draw();
    }
  });
})(window.PP);
