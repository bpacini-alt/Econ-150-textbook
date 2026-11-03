/* Memory Match (approved interaction), ported from precise-memory-match.js.
 * activity: {pairs:[{id, left, right}, ...], board_size: 4 | 6}
 * Select two cards; a match turns green and disappears; a mismatch clears.
 * Tap a selected card again to unselect. Each finished board counts once.
 * A finished board offers Review pairs beside New board: it lists that board's
 * pairs, one per line, in the order they were matched, so students can take
 * notes. The list stays hidden until asked for (textbook-feedback#45, decided
 * November 3, 2026).
 */
(function (PP) {
  "use strict";
  const { esc, shuffle } = PP.util;

  PP.register("match", {
    render(host, activity, ctx) {
      const st = ctx.state;
      const size = Math.min(activity.board_size || 6, activity.pairs.length);
      // matched is a Set, so it keeps the order the pairs were found in.
      let tiles, picked = [], matched = new Set(), busy = false, finished = false, reviewing = false, timer = null;
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

      function newBoard() {
        const ids = PP.deal(st, "pairs", activity.pairs.length, size);
        ctx.save();
        tiles = shuffle(ids.flatMap((p) => [
          { id: p + "a", pair: p, side: "left", text: activity.pairs[p].left },
          { id: p + "b", pair: p, side: "right", text: activity.pairs[p].right }
        ]));
        picked = []; matched = new Set(); busy = false; finished = false; reviewing = false;
        ctx.shown("board");
      }

      function draw() {
        let h = '<div class="ppm-head"><b>Memory Match</b><span class="pp-tiny pp-muted">' + matched.size + " / " + size + " pairs</span></div>";
        h += '<p class="ppm-help">Choose a card, then its match. Tap a selected card again to unselect.</p>';
        h += '<div class="ppm-grid" role="group" aria-label="Match pairs">' + tiles.map((t) => {
          if (matched.has(t.pair)) return '<span class="ppm-empty" aria-hidden="true"></span>';
          const on = picked.includes(t.id);
          const success = busy && picked.length === 2 && tiles.filter((x) => picked.includes(x.id)).every((x) => x.pair === t.pair);
          return '<button type="button" class="ppm-tile' + (success ? " ppm-success" : "") + '" data-tile="' + t.id + '" aria-pressed="' + on + '"' + (busy ? " disabled" : "") + ">" + esc(t.text) + "</button>";
        }).join("") + "</div>";
        h += '<p class="ppm-status" role="status">' + (finished ? "All pairs matched." : busy ? (picked.length === 2 && tiles.find((x) => x.id === picked[0]).pair === tiles.find((x) => x.id === picked[1]).pair ? "A match!" : "Not a pair.") : picked.length ? "Choose its match." : "Find all " + size + " pairs at your own pace.") + "</p>";
        if (finished) {
          h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-again">New board</button>' +
            '<button type="button" id="ppm-review-btn" aria-expanded="' + reviewing + '" aria-controls="ppm-review">Review pairs</button></div>';
          h += '<div class="pp-card" id="ppm-review"' + (reviewing ? "" : " hidden") + '><b>Pairs on this board</b><ul>' +
            [...matched].map((p) => "<li>" + esc(activity.pairs[p].left) + " — " + esc(activity.pairs[p].right) + "</li>").join("") +
            "</ul></div>";
        }
        host.innerHTML = h;
        host.querySelectorAll("[data-tile]").forEach((b) => (b.onclick = () => choose(b.dataset.tile)));
        const again = host.querySelector("#pp-again");
        if (again) again.onclick = () => { newBoard(); if (!ctx.roundDone()) draw(); };
        const review = host.querySelector("#ppm-review-btn");
        if (review) review.onclick = () => {
          // Toggle in place rather than redrawing, so focus stays on the button.
          reviewing = !reviewing;
          review.setAttribute("aria-expanded", reviewing);
          host.querySelector("#ppm-review").hidden = !reviewing;
          ctx.resized();
        };
        ctx.resized();
      }

      function choose(id) {
        if (busy || finished) return;
        if (picked.includes(id)) { picked = picked.filter((x) => x !== id); draw(); return; }
        picked.push(id);
        if (picked.length < 2) { draw(); return; }
        const [a, b] = picked.map((x) => tiles.find((t) => t.id === x));
        const right = a.pair === b.pair;
        ctx.record(activity.pairs[a.pair], {
          key: "board", correct: right,
          resp: { with: activity.pairs[b.pair].id, first: a.side },
          extra: { board: size }
        });
        busy = true;
        draw();
        timer = setTimeout(() => {
          if (right) matched.add(a.pair);
          picked = []; busy = false;
          if (matched.size === size) { finished = true; ctx.count(); }
          draw();
        }, reduce ? 350 : right ? 680 : 850);
      }

      newBoard();
      draw();
      return () => { if (timer) clearTimeout(timer); };
    }
  });
})(window.PP);
