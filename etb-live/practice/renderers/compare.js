/* Rapid A/B comparison.
 * activity.items: [{id, prompt, left, right, answer:0|1, why,
 *                   option_misconceptions?:[...]}]
 * A and B stay in authored order so the comparison itself is stable.
 */
(function (PP) {
  "use strict";
  const { esc } = PP.util;

  PP.register("compare", {
    render(host, activity, ctx) {
      const st = ctx.state;
      const size = Math.min(activity.round_size || 8, activity.items.length);
      let advanceTimer = null;
      const keys = [["arrowleft", "a"], ["arrowright", "d"]];
      if (!st.round || st.done || st.round.some((k) => k >= activity.items.length)) newRound();

      function newRound() {
        if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
        st.round = PP.deal(st, "items", activity.items.length, size);
        st.pos = 0; st.right = 0; st.missed = []; st.done = false; st.last = null;
        ctx.save();
      }

      function advance() {
        if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
        st.last = null; st.pos++;
        if (st.pos >= st.round.length) st.done = true;
        ctx.save(); draw();
      }

      function draw() {
        if (st.done) return summary();
        const it = activity.items[st.round[st.pos]];
        if (st.last == null) ctx.shown(it.id);
        let h = '<div class="pp-row" style="justify-content:space-between"><span class="pp-tiny pp-muted">' +
          (st.pos + 1) + ' of ' + st.round.length + '</span><span class="pp-tiny pp-muted">' + st.right + ' correct</span></div>';
        h += '<div class="pp-quick-stage"><div class="pp-prompt">' + esc(it.prompt) + "</div></div>";
        h += '<div class="pp-compare-options" role="group" aria-label="Compare option A and option B">' +
          [it.left, it.right].map((text, i) => {
            let cls = "pp-compare-option";
            if (st.last != null && i === it.answer) cls += " pp-is-right";
            else if (st.last != null && i === st.last) cls += " pp-is-wrong";
            return '<button type="button" class="' + cls + '" data-cmp="' + i + '"' + (st.last != null ? " disabled" : "") + '><span class="pp-compare-label">' +
              (i === 0 ? "A" : "B") + '</span>' + esc(text) + '</button>';
          }).join("") + "</div>";
        if (st.last != null) {
          const ok = st.last === it.answer;
          h += '<div class="pp-feedback' + (ok ? "" : " pp-bad") + '" role="status"><b>' +
            (ok ? "Correct." : "Not quite.") + "</b> " + esc(it.why) + "</div>";
          if (!ok) h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-next">Next comparison</button></div>';
        }
        host.innerHTML = h;
        host.querySelectorAll("[data-cmp]").forEach((b) => (b.onclick = () => answer(Number(b.dataset.cmp))));
        const next = host.querySelector("#pp-next"); if (next) next.onclick = advance;
        ctx.resized();
      }

      function answer(i) {
        if (st.done || st.last != null) return;
        const it = activity.items[st.round[st.pos]], ok = i === it.answer;
        st.last = i;
        ctx.record(it, { key:"prompt", correct:ok, resp:{choice:i,pos:i},
          misc:[it.option_misconceptions && it.option_misconceptions[i]], extra:{pos_in_round:st.pos} });
        if (ok) st.right++; else st.missed.push(st.round[st.pos]);
        ctx.count(); ctx.save(); draw();
        if (ok) advanceTimer = setTimeout(advance, 850);
      }

      function summary() {
        let h = '<div class="pp-feedback' + (st.missed.length ? " pp-bad" : "") + '" role="status"><b>' +
          st.right + " of " + st.round.length + " correct.</b>" +
          (st.missed.length ? "<p>Worth another look:</p>" : "<p>Clean round.</p>") + "</div>";
        if (st.missed.length) h += st.missed.map((k) => {
          const it = activity.items[k];
          return '<div class="pp-result pp-no"><b>' + esc(it.left) + " vs. " + esc(it.right) + "</b> → " + (it.answer === 0 ? "A" : "B") + ". " + esc(it.why) + "</div>";
        }).join("");
        h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-again">New round</button></div>';
        host.innerHTML = h;
        host.querySelector("#pp-again").onclick = () => { newRound(); if (!ctx.roundDone()) draw(); };
        ctx.resized();
      }

      function onKey(e) {
        if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
        const tag = (document.activeElement && document.activeElement.tagName) || "";
        if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
        const idx = keys.findIndex((pair) => pair.includes(e.key.toLowerCase()));
        if (idx < 0 || st.done || st.last != null) return;
        e.preventDefault(); answer(idx);
      }
      document.addEventListener("keydown", onKey);
      draw();
      return () => { document.removeEventListener("keydown", onKey); if (advanceTimer) clearTimeout(advanceTimer); };
    }
  });
})(window.PP);
