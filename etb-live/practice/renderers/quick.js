/* Quick Practice / three-key fluency (approved interaction).
 * activity: {labels:[2 or 3 short answers], items:[{id, prompt, answer:index, why, label_misconceptions?}], round_size}
 * Two labels: Left/Right (or A/D). Three labels: Left/Down/Right (or A/S/D).
 * Immediate feedback, then an automatic advance (timing from the approved
 * prototype). No timer and no speed pressure. A round ends with a review of
 * anything missed.
 */
(function (PP) {
  "use strict";
  const { esc } = PP.util;
  const KEYS3 = [["arrowleft", "a"], ["arrowdown", "s"], ["arrowright", "d"]];
  const KEYS2 = [["arrowleft", "a"], ["arrowright", "d"]];
  const CAPS3 = ["← or A", "↓ or S", "→ or D"];
  const CAPS2 = ["← or A", "→ or D"];

  PP.register("quick", {
    render(host, activity, ctx) {
      const st = ctx.state;
      const two = activity.labels.length === 2;
      const keys = two ? KEYS2 : KEYS3, caps = two ? CAPS2 : CAPS3;
      const size = Math.min(activity.round_size || 8, activity.items.length);
      let timer = null, locked = false;
      if (!st.round || st.done || st.round.some((k) => k >= activity.items.length)) newRound();
      if (st.last != null) { st.last = null; st.pos++; if (st.pos >= st.round.length) st.done = true; }

      function newRound() {
        st.round = PP.deal(st, "items", activity.items.length, size);
        st.pos = 0; st.right = 0; st.missed = []; st.done = false; st.last = null;
        ctx.save();
      }

      function draw() {
        if (st.done) return summary();
        const it = activity.items[st.round[st.pos]];
        if (st.last == null) ctx.shown("prompt");
        let h = '<div class="pp-row" style="justify-content:space-between"><span class="pp-tiny pp-muted">' + (st.pos + 1) + " of " + st.round.length + "</span>" +
          '<span class="pp-tiny pp-muted">' + st.right + " correct</span></div>";
        h += '<div class="pp-quick-stage"><div class="pp-prompt">' + esc(it.prompt) + "</div></div>";
        h += '<div class="pp-quick-keys ' + (two ? "pp-two" : "pp-three") + '" role="group" aria-label="Answers">' + activity.labels.map((lab, i) => {
          let cls = "";
          if (st.last != null) { if (i === it.answer) cls = "pp-is-right"; else if (i === st.last) cls = "pp-is-wrong"; }
          return '<button type="button" class="' + cls + '" data-k="' + i + '"' + (st.last != null ? " disabled" : "") + "><span>" + esc(lab) + '</span><span class="pp-keycap">' + caps[i] + "</span></button>";
        }).join("") + "</div>";
        if (st.last != null) {
          const ok = st.last === it.answer;
          h += '<div class="pp-feedback' + (ok ? "" : " pp-bad") + '" role="status"><b>' + (ok ? "Correct." : "Not quite.") + "</b> " + esc(it.why) + "</div>";
        } else h += '<p class="pp-tiny pp-muted">Use the keys or tap an answer.</p>';
        host.innerHTML = h;
        host.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => answer(Number(b.dataset.k))));
        ctx.resized();
      }

      function answer(i) {
        if (locked || st.done || st.last != null) return;
        locked = true;
        const it = activity.items[st.round[st.pos]];
        const ok = i === it.answer;
        st.last = i;
        ctx.record(it, {
          key: "prompt", correct: ok, resp: { label: i },
          misc: [!ok && it.label_misconceptions ? it.label_misconceptions[i] : null],
          extra: { pos_in_round: st.pos }
        });
        if (ok) st.right++; else st.missed.push(st.round[st.pos]);
        ctx.count(); ctx.save(); draw();
        timer = setTimeout(() => {
          st.last = null; st.pos++; locked = false;
          if (st.pos >= st.round.length) st.done = true;
          ctx.save(); draw();
        }, ok ? 1050 : 1900);
      }

      function summary() {
        let h = '<div class="pp-feedback' + (st.missed.length ? " pp-bad" : "") + '" role="status"><b>' + st.right + " of " + st.round.length + " correct.</b>" +
          (st.missed.length ? "<p>Worth another look:</p>" : "<p>Clean round.</p>") + "</div>";
        if (st.missed.length) h += st.missed.map((k) => {
          const it = activity.items[k];
          return '<div class="pp-result pp-no"><b>' + esc(it.prompt) + "</b> → " + esc(activity.labels[it.answer]) + ". " + esc(it.why) + "</div>";
        }).join("");
        h += '<p class="pp-tiny pp-muted">Quick rounds build fast, accurate recognition. Pair them with the calculation, sorting, and applied practice for deeper understanding.</p>';
        h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-again">New round</button></div>';
        host.innerHTML = h;
        host.querySelector("#pp-again").onclick = () => { newRound(); if (!ctx.roundDone()) draw(); };
        ctx.resized();
      }

      function onKey(e) {
        if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
        const tag = (document.activeElement && document.activeElement.tagName) || "";
        if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
        const k = e.key.toLowerCase();
        const idx = keys.findIndex((pair) => pair.includes(k));
        if (idx < 0 || st.done) return;
        e.preventDefault();
        answer(idx);
      }
      document.addEventListener("keydown", onKey);
      draw();
      return () => { document.removeEventListener("keydown", onKey); if (timer) clearTimeout(timer); };
    }
  });
})(window.PP);
