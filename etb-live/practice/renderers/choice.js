/* Single choice: applied questions, anchors ("which story?"), AP-style items.
 * activity.items: [{id, prompt, figure?, options:[...], answer:index, why, option_why?:[...]}]
 * Options are shuffled per attempt; the key always refers to the authored order.
 */
(function (PP) {
  "use strict";
  const { esc, order } = PP.util;

  PP.register("choice", {
    render(host, activity, ctx) {
      const st = ctx.state;
      const items = activity.items;
      let advanceTimer = null;

      function optionOrder(it) {
        // Graph panels are a visual reference system: Panel A is always first,
        // Panel B second, and so on. Ordinary answer choices still shuffle.
        if (it.shuffle_options === false || (it.figure && it.figure.kind === "panels")) {
          return it.options.map((_, i) => i);
        }
        return order(it.options.length);
      }

      function newItem() {
        if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
        st.cur = PP.deal(st, "items", items.length, 1)[0];
        st.ord = optionOrder(items[st.cur]);
        st.picked = null;
        st.checked = false;
        ctx.save();
      }

      if (st.cur == null || st.cur >= items.length) newItem();
      else {
        const expected = optionOrder(items[st.cur]);
        if (!st.ord || st.ord.some((v, i) => v !== expected[i])) {
          st.ord = expected;
          ctx.save();
        }
      }

      let markedFor = null;
      function draw() {
        const it = items[st.cur];
        if (markedFor !== st.cur && !st.checked) { ctx.shown(it.id); markedFor = st.cur; }
        let h = '<div class="pp-card"><div class="pp-prompt">' + esc(it.prompt) + "</div></div>" + PP.figure(it.figure);
        h += '<div class="pp-choices" role="group" aria-label="Answer choices">' + st.ord.map((i) => {
          let cls = "pp-choice";
          if (st.checked && i === it.answer) cls += " pp-is-right";
          else if (st.checked && i === st.picked) cls += " pp-is-wrong";
          return '<button type="button" class="' + cls + '" data-opt="' + i + '" aria-pressed="' + (st.picked === i) + '"' + (st.checked ? " disabled" : "") + ">" + esc(it.options[i]) + "</button>";
        }).join("") + "</div>";
        if (st.checked) {
          const ok = st.picked === it.answer;
          const specific = !ok && it.option_why && it.option_why[st.picked];
          h += '<div class="pp-feedback' + (ok ? "" : " pp-bad") + '" role="status"><b>' + (ok ? "Correct." : "Not quite.") + "</b>" +
            (specific ? "<p>" + esc(specific) + "</p>" : "") + "<p>" + esc(it.why) + "</p></div>";
        }
        h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-go"' + (!st.checked && st.picked == null ? " disabled" : "") + ">" +
          (st.checked ? "Next question" : "Check answer") + "</button></div>";
        host.innerHTML = h;
        host.querySelectorAll("[data-opt]").forEach((b) => (b.onclick = () => { st.picked = Number(b.dataset.opt); ctx.save(); draw(); }));
        host.querySelector("#pp-go").onclick = () => {
          if (!st.checked) {
            st.checked = true;
            ctx.record(it, {
              correct: st.picked === it.answer,
              resp: { opt: st.picked, pos: st.ord.indexOf(st.picked) },
              misc: [it.option_misconceptions && it.option_misconceptions[st.picked]]
            });
            ctx.count(); ctx.save(); draw();
            if (st.picked === it.answer) {
              const itemIndex = st.cur;
              advanceTimer = setTimeout(() => {
                if (st.cur !== itemIndex || !st.checked) return;
                newItem();
                if (!ctx.roundDone()) draw();
              }, 850);
            }
            return;
          }
          newItem();
          if (!ctx.roundDone()) draw();
        };
        ctx.resized();
      }
      draw();
      return () => { if (advanceTimer) clearTimeout(advanceTimer); };
    }
  });
})(window.PP);
