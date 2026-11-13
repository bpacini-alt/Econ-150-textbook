/* Drag-and-drop sorting (approved interaction).
 * activity: {bins:[label,...], cards:[{id, text, bin:index, why}], round_size}
 *
 * Three ways to place a card, all scored the same:
 *   - drag it (pointer events, so it works with a mouse, a finger, or a pen);
 *   - tap or press Enter on a card, then tap a category;
 *   - "Use menus instead" switches to one labeled select per card.
 * Placing a card is not a correctness signal; feedback comes only after Check.
 */
(function (PP) {
  "use strict";
  const { esc, shuffle } = PP.util;

  function buildRound(activity) {
    const size = Math.min(activity.round_size || 6, activity.cards.length);
    const all = shuffle(activity.cards.map((_, i) => i));
    const chosen = [];
    activity.bins.forEach((_, b) => {
      const k = all.find((i) => activity.cards[i].bin === b && !chosen.includes(i));
      if (k != null && chosen.length < size) chosen.push(k);
    });
    for (const i of all) { if (chosen.length >= size) break; if (!chosen.includes(i)) chosen.push(i); }
    return shuffle(chosen);
  }

  PP.register("sort", {
    render(host, activity, ctx) {
      const st = ctx.state;
      let selected = null;
      let drag = null;
      let advanceTimer = null;
      // After the declarations: newRound() reads advanceTimer.
      if (!st.round || st.round.some((i) => i >= activity.cards.length)) newRound();

      function newRound() {
        if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
        st.round = buildRound(activity); st.picks = {}; st.how = {}; st.checked = false; ctx.save();
      }
      let marked = false;
      const placed = () => st.round.filter((i) => st.picks[i] != null).length;

      function cardButton(i) {
        const c = activity.cards[i];
        let cls = "pp-sortcard";
        if (st.checked) cls += st.picks[i] === c.bin ? " pp-is-right" : " pp-is-wrong";
        return '<button type="button" class="' + cls + '" data-card="' + i + '" aria-pressed="' + (selected === i) + '"' + (st.checked ? " disabled" : "") + ">" + esc(c.text) + "</button>";
      }

      function draw() {
        if (!marked && !st.checked) { ctx.shown("board"); marked = true; }
        const remaining = st.round.filter((i) => st.picks[i] == null);
        let h = '<div class="pp-row" style="justify-content:space-between"><span class="pp-tiny pp-muted">' +
          (st.checked ? "" : "Drag a card into a category, or tap a card and then tap a category.") + "</span>" +
          '<button type="button" class="pp-link" id="pp-mode">' + (st.menus ? "Use drag and drop instead" : "Use menus instead") + "</button></div>";
        if (st.menus) {
          h += st.round.map((i) => {
            const c = activity.cards[i];
            return '<div class="pp-sortrow"><label for="pp-s' + i + '">' + esc(c.text) + "</label>" +
              '<select id="pp-s' + i + '" data-menu="' + i + '"' + (st.checked ? " disabled" : "") + '><option value="">Choose a category…</option>' +
              activity.bins.map((b, j) => '<option value="' + j + '"' + (st.picks[i] === j ? " selected" : "") + ">" + esc(b) + "</option>").join("") + "</select>" +
              (st.checked ? result(i) : "") + "</div>";
          }).join("");
        } else {
          h += '<div class="pp-tray" data-zone="tray" aria-label="Cards to sort"><b class="pp-tiny">Cards to sort · ' + remaining.length + " left</b>" + remaining.map(cardButton).join("") + "</div>";
          h += '<div class="pp-bins">' + activity.bins.map((b, j) =>
            '<div class="pp-bin" data-zone="' + j + '"><div class="pp-bin-head"><b>' + esc(b) + "</b>" +
            (selected != null && !st.checked ? '<button type="button" class="pp-bin-place" data-place="' + j + '">Place here</button>' : "") + "</div>" +
            st.round.filter((i) => st.picks[i] === j).map(cardButton).join("") + "</div>").join("") + "</div>";
          if (st.checked) h += '<div style="margin-top:10px">' + st.round.map(result).join("") + "</div>";
        }
        const allRight = st.checked && st.round.every((i) => st.picks[i] === activity.cards[i].bin);
        if (st.checked) {
          const right = st.round.filter((i) => st.picks[i] === activity.cards[i].bin).length;
          h += '<div class="pp-feedback' + (allRight ? "" : " pp-bad") + '" role="status"><b>' + right + " of " + st.round.length + " in the best category.</b></div>";
        }
        h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-go"' + (!st.checked && placed() < st.round.length ? " disabled" : "") + ">" +
          (st.checked ? (allRight ? "Next board" : "Continue to next board") : "Check all " + st.round.length) + "</button></div>";
        host.innerHTML = h;
        wire();
        ctx.resized();
      }

      // Every result names its card, so a student can tell which card a
      // "Best fit" note is about (textbook-feedback#66). A missed card also
      // shows where the student put it.
      function result(i) {
        const c = activity.cards[i], pick = st.picks[i], ok = pick === c.bin;
        const yours = pick != null && activity.bins[pick] != null ? " (you chose " + esc(activity.bins[pick]) + ")" : "";
        return '<div class="pp-result ' + (ok ? "pp-ok" : "pp-no") + '"><span aria-hidden="true">' + (ok ? "✓ " : "✗ ") + "</span>" +
          '<b class="pp-sort-card">' + esc(c.text) + "</b> → " + (ok ? "Right: " + esc(activity.bins[c.bin]) + ". " : "Best fit: " + esc(activity.bins[c.bin]) + yours + ". ") +
          esc(c.why) + "</div>";
      }

      function place(i, zone, how) {
        if (st.checked || i == null) return;
        st.how = st.how || {};
        if (zone === "tray") delete st.picks[i]; else { st.picks[i] = Number(zone); st.how[i] = how || "tap"; }
        selected = null; ctx.save(); draw();
      }

      function wire() {
        host.querySelector("#pp-mode").onclick = () => { st.menus = !st.menus; selected = null; ctx.save(); draw(); };
        host.querySelectorAll("[data-menu]").forEach((s) => (s.onchange = () => {
          const i = Number(s.dataset.menu);
          st.how = st.how || {};
          if (s.value === "") delete st.picks[i]; else { st.picks[i] = Number(s.value); st.how[i] = "menu"; }
          ctx.save(); draw();
        }));
        host.querySelectorAll("[data-place]").forEach((b) => (b.onclick = () => place(selected, b.dataset.place)));
        host.querySelectorAll("[data-zone]").forEach((z) => (z.onclick = (e) => {
          if (e.target.closest("button")) return;
          if (selected != null) place(selected, z.dataset.zone);
        }));
        host.querySelectorAll("[data-card]").forEach((b) => {
          b.onclick = () => { if (drag && drag.moved) return; const i = Number(b.dataset.card); selected = selected === i ? null : i; draw(); };
          b.onpointerdown = (e) => startDrag(e, b);
        });
        host.querySelector("#pp-go").onclick = () => {
          if (!st.checked) {
            st.checked = true;
            st.round.forEach((i) => {
              const c = activity.cards[i], b = st.picks[i];
              ctx.record(c, {
                key: "board", correct: b === c.bin,
                resp: { bin: b, how: (st.how && st.how[i]) || null },
                misc: [c.bin_misconceptions && c.bin_misconceptions[b]],
                extra: { board: st.round.length }
              });
            });
            ctx.count(); ctx.save(); draw();
            if (st.round.every((i) => st.picks[i] === activity.cards[i].bin)) {
              const round = st.round;
              advanceTimer = setTimeout(() => {
                if (!st.checked || st.round !== round) return;
                newRound();
                if (!ctx.roundDone()) draw();
              }, 850);
            }
            return;
          }
          newRound();
          marked = false;
          if (!ctx.roundDone()) draw();
        };
      }

      function startDrag(e, el) {
        if (st.checked || e.button > 0) return;
        drag = { i: Number(el.dataset.card), el, x: e.clientX, y: e.clientY, moved: false, ghost: null };
        el.setPointerCapture(e.pointerId);
        el.onpointermove = (ev) => {
          if (!drag) return;
          if (!drag.moved && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) < 6) return;
          if (!drag.moved) {
            drag.moved = true;
            drag.ghost = el.cloneNode(true);
            drag.ghost.classList.add("pp-ghost");
            drag.ghost.style.width = el.getBoundingClientRect().width + "px";
            document.body.appendChild(drag.ghost);
            el.classList.add("pp-dragging");
          }
          drag.ghost.style.left = ev.clientX - 20 + "px";
          drag.ghost.style.top = ev.clientY - 20 + "px";
          host.querySelectorAll(".pp-bin").forEach((z) => z.classList.remove("pp-drop-hover"));
          const z = zoneAt(ev.clientX, ev.clientY);
          if (z && z.classList.contains("pp-bin")) z.classList.add("pp-drop-hover");
        };
        el.onpointerup = el.onpointercancel = (ev) => {
          const d = drag;
          el.onpointermove = el.onpointerup = el.onpointercancel = null;
          if (!d) return;
          if (d.ghost) d.ghost.remove();
          if (d.moved) {
            const z = ev.type === "pointerup" ? zoneAt(ev.clientX, ev.clientY) : null;
            setTimeout(() => { drag = null; }, 0);
            if (z) place(d.i, z.dataset.zone, "drag"); else draw();
          } else drag = null;
        };
      }

      function zoneAt(x, y) {
        const el = document.elementFromPoint(x, y);
        return el ? el.closest("[data-zone]") : null;
      }

      draw();
      return () => { if (advanceTimer) clearTimeout(advanceTimer); };
    }
  });
})(window.PP);
