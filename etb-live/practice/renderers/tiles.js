/* Economics <-> English phrase tiles (approved interaction).
 * activity.items: [{id, title?, prompt, correct:[chunks], wrong:[chunks], why, hint?, wrong_misconceptions?}]
 * Students pick the chunks that make a defensible statement. Grading is by
 * meaning: the chosen set must equal the correct set; order is not graded.
 * Contrastive wrong chunks are the point, so every item needs real ones.
 */
(function (PP) {
  "use strict";
  const { esc, shuffle } = PP.util;

  PP.register("tiles", {
    render(host, activity, ctx) {
      const st = ctx.state;
      if (st.cur == null || st.cur >= activity.items.length) newItem();

      function newItem() {
        st.cur = PP.deal(st, "items", activity.items.length, 1)[0];
        const it = activity.items[st.cur];
        st.bank = shuffle(it.correct.map((t) => ({ t, ok: true })).concat(it.wrong.map((t) => ({ t, ok: false })))).map((x) => x.t);
        st.chosen = [];
        st.checked = false;
        st.hint = false;
        ctx.save();
        ctx.shown("item");
      }

      function draw() {
        const it = activity.items[st.cur];
        let h = '<div class="pp-card">' + (it.title ? '<div class="pp-eyebrow">' + esc(it.title) + "</div>" : "") + '<div class="pp-prompt">' + esc(it.prompt) + "</div></div>";
        h += '<div class="pp-answer-line" aria-label="Your statement">' + (st.chosen.length ? st.chosen.map((b) =>
          '<button type="button" class="pp-tile pp-placed" data-out="' + b + '"' + (st.checked ? " disabled" : "") + ">" + esc(st.bank[b]) + "</button>").join("") :
          '<span class="pp-tiny pp-muted">Tap tiles below to build your statement.</span>') + "</div>";
        h += '<div class="pp-tilebank">' + st.bank.map((t, b) =>
          '<button type="button" class="pp-tile' + (st.chosen.includes(b) ? " pp-used" : "") + '" data-in="' + b + '"' + (st.checked || st.chosen.includes(b) ? " disabled" : "") + ">" + esc(t) + "</button>").join("") + "</div>";
        if (st.hint && it.hint && !st.checked) h += '<div class="pp-support-box"><b>Hint:</b> ' + esc(it.hint) + "</div>";
        if (st.checked) {
          const picked = st.chosen.map((b) => st.bank[b]);
          const ok = picked.length === it.correct.length && it.correct.every((c) => picked.includes(c));
          h += '<div class="pp-feedback' + (ok ? "" : " pp-bad") + '" role="status"><b>' + (ok ? "That says it precisely." : "Not quite.") + "</b>" +
            (ok ? "" : "<p><b>A precise version:</b> " + esc(it.correct.join(" ")) + "</p>") + "<p>" + esc(it.why) + "</p></div>";
        }
        h += '<div class="pp-actions">';
        if (!st.checked) {
          h += '<button type="button" class="pp-primary" id="pp-go"' + (st.chosen.length ? "" : " disabled") + ">Check</button>";
          if (it.hint) h += '<button type="button" id="pp-hint">' + (st.hint ? "Hide hint" : "Show hint") + "</button>";
          if (st.chosen.length) h += '<button type="button" id="pp-clear">Clear</button>';
        } else h += '<button type="button" class="pp-primary" id="pp-go">Next</button>';
        h += "</div>";
        host.innerHTML = h;
        host.querySelectorAll("[data-in]").forEach((b) => (b.onclick = () => { st.chosen.push(Number(b.dataset.in)); ctx.save(); draw(); }));
        host.querySelectorAll("[data-out]").forEach((b) => (b.onclick = () => { st.chosen = st.chosen.filter((x) => x !== Number(b.dataset.out)); ctx.save(); draw(); }));
        const hint = host.querySelector("#pp-hint");
        if (hint) hint.onclick = () => { st.hint = !st.hint; ctx.save(); draw(); };
        const clear = host.querySelector("#pp-clear");
        if (clear) clear.onclick = () => { st.chosen = []; ctx.save(); draw(); };
        host.querySelector("#pp-go").onclick = () => {
          if (!st.checked) {
            st.checked = true;
            const it = activity.items[st.cur];
            const picked = st.chosen.map((b) => st.bank[b]);
            const ok = picked.length === it.correct.length && it.correct.every((c) => picked.includes(c));
            ctx.record(it, {
              key: "item", correct: ok,
              resp: { chosen: picked, hint: !!st.hint },
              misc: picked.map((c) => { const w = it.wrong.indexOf(c); return w >= 0 && it.wrong_misconceptions ? it.wrong_misconceptions[w] : null; })
            });
            ctx.count(); ctx.save(); draw(); return;
          }
          newItem();
          if (!ctx.roundDone()) draw();
        };
        ctx.resized();
      }
      draw();
    }
  });
})(window.PP);
