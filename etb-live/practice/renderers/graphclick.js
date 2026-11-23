/* Graph Click: find things on a graph by clicking them, one step at a time.
 *
 * activity: {streak?: n}   with a streak, the activity counts clean graphs in a
 *                          row (every step right on the first try) toward n.
 * activity.items: [{id, prompt, figure (one graph), why, steps: [STEP, ...]}]
 * STEP: {ask, kind, ...}
 *   kind "x"      target: a quantity. The click must land on the quantity axis.
 *   kind "y"      target: a price. The click must land on the price axis.
 *   kind "point"  target: [x, y]. The click must land near the point.
 *   kind "region" target: [[x, y], ...]. The click must land inside the polygon.
 *   kind "choose" options[], answer, option_why?, option_misconceptions?, shuffle_options?
 *   tol?   for x / y: how far off (in data units) still counts; a minimum on
 *          screen keeps targets usable with a thumb
 *   mark?  label drawn on the graph once the step is right (e.g. "Qm")
 *   span?  for x / y: [from, to] in the other axis's units, so the dotted line
 *          drawn after a right answer can stop at a point (default: the whole graph)
 *   ok?    one line shown when the step is right
 *   near?  [{at, why, misconception?}] wrong spots worth naming (same shape as target)
 *   miss?  feedback for any other wrong click
 * Wrong clicks don't end the graph: the student tries again until it's right.
 */
(function (PP) {
  "use strict";
  const { esc, order } = PP.util;
  const NS = "http://www.w3.org/2000/svg";

  function pointInPolygon(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > p.y) !== (yj > p.y) && p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  /* Map between data units and the SVG's own coordinates, read from the
     data-* attributes figure.js puts on an interactive graph. */
  function frame(svg) {
    const n = (k) => Number(svg.dataset[k]);
    const f = { L: n("plotLeft"), R: n("plotRight"), T: n("plotTop"), B: n("plotBottom"),
      x0: n("xMin"), x1: n("xMax"), y0: n("yMin"), y1: n("yMax") };
    f.sx = (x) => f.L + (x - f.x0) / (f.x1 - f.x0) * (f.R - f.L);
    f.sy = (y) => f.B - (y - f.y0) / (f.y1 - f.y0) * (f.B - f.T);
    f.dx = (vx) => f.x0 + (vx - f.L) / (f.R - f.L) * (f.x1 - f.x0);
    f.dy = (vy) => f.y0 + (f.B - vy) / (f.B - f.T) * (f.y1 - f.y0);
    // Screen pixels per SVG unit: on a phone the graph shrinks, so minimum
    // target sizes are set in screen pixels, not SVG units.
    f.scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width || 1;
    return f;
  }

  /* Does a click (SVG units vx, vy) hit a target of this kind? "axis" reports a
     click at the right spot along an axis that missed the axis itself. */
  function hits(kind, target, tol, f, vx, vy) {
    const px = (p) => p / f.scale;
    if (kind === "x" || kind === "y") {
      const along = kind === "x" ? Math.abs(vx - f.sx(target)) : Math.abs(vy - f.sy(target));
      const unit = kind === "x" ? (f.R - f.L) / (f.x1 - f.x0) : (f.B - f.T) / (f.y1 - f.y0);
      const close = along <= Math.max((tol || 0) * unit, 10, px(16));
      const band = Math.max(22, px(28));
      const onAxis = kind === "x" ? (vy >= f.B - band && vy <= f.B + 34) : (vx <= f.L + band && vx >= f.L - 46);
      return close && onAxis ? "yes" : (close ? "axis" : "no");
    }
    if (kind === "point") {
      const d = Math.hypot(vx - f.sx(target[0]), vy - f.sy(target[1]));
      return d <= Math.max(14, px(22)) ? "yes" : "no";
    }
    if (kind === "region") return pointInPolygon({ x: f.dx(vx), y: f.dy(vy) }, target) ? "yes" : "no";
    return "no";
  }

  /* The item's figure plus marks for the steps already done. */
  function figureFor(it, upto) {
    const g = JSON.parse(JSON.stringify(it.figure));
    g.interactive = true;
    g.lines = g.lines || []; g.notes = g.notes || []; g.points = g.points || []; g.areas = g.areas || [];
    const x0 = g.x.min || 0, y0 = g.y.min || 0;
    const xspan = g.x.max - x0, yspan = g.y.max - y0;
    for (let k = 0; k < upto; k++) {
      const s = it.steps[k];
      const span = s.span || null;
      if (s.kind === "x") {
        g.lines.push({ points: [[s.target, span ? span[0] : y0], [s.target, span ? span[1] : g.y.max]], role: "mark", style: "dotted" });
        if (s.mark) g.notes.push({ at: [s.target, y0 - yspan * 0.095], text: s.mark, anchor: "middle", bold: true, role: "mark" });
      } else if (s.kind === "y") {
        g.lines.push({ points: [[span ? span[0] : x0, s.target], [span ? span[1] : g.x.max, s.target]], role: "mark", style: "dotted" });
        if (s.mark) g.notes.push({ at: [x0 - xspan * 0.02, s.target - yspan * 0.02], text: s.mark, anchor: "end", bold: true, role: "mark" });
      } else if (s.kind === "point") {
        g.points.push({ at: s.target, label: s.mark || "" });
      } else if (s.kind === "region") {
        g.areas.push({ polygon: s.target, role: "dwl", label: s.mark || "" });
      }
    }
    return g;
  }

  PP.register("graphclick", {
    render(host, activity, ctx) {
      const st = ctx.state;
      const items = activity.items;
      const need = activity.streak || 0;
      st.streak = st.streak || 0;

      function newItem() {
        st.cur = PP.deal(st, "items", items.length, 1)[0];
        st.step = 0; st.clean = true; st.done = false;
        st.msg = null; st.good = null; st.wrong = null; st.tried = [];
        st.cursor = null; st.ord = null;
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

      function submitClick(it, svg, vx, vy) {
        if (st.done) return;
        const s = it.steps[st.step];
        const f = frame(svg);
        const key = it.id + "#" + st.step;
        const data = { x: Math.round(f.dx(vx) * 100) / 100, y: Math.round(f.dy(vy) * 100) / 100 };
        const res = hits(s.kind, s.target, s.tol, f, vx, vy);
        if (res === "yes") {
          ctx.record(it, { key, correct: true, resp: { step: st.step, kind: s.kind, x: data.x, y: data.y, hit: "target" } });
          st.good = s.ok || null; st.msg = null;
          finishStep(it);
          draw();
          return;
        }
        let why = null, misc = null, hit = "miss";
        (s.near || []).some((n, i) => {
          if (hits(s.kind, n.at, s.tol, f, vx, vy) === "yes") { why = n.why; misc = n.misconception || null; hit = "near" + i; return true; }
          return false;
        });
        if (!why && res === "axis") {
          why = s.kind === "x" ? "Right quantity, but click on the quantity axis itself (the horizontal axis)." : "Right price, but click on the price axis itself (the vertical axis).";
          hit = "off-axis";
        }
        ctx.record(it, { key, correct: false, resp: { step: st.step, kind: s.kind, x: data.x, y: data.y, hit }, misc: [misc] });
        st.clean = false; st.good = null;
        st.msg = why || s.miss || "Not quite. Try again.";
        st.wrong = { vx, vy };
        ctx.save();
        draw();
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
        draw();
      }

      function drawOverlay(svg) {
        svg.querySelectorAll(".pp-gc-over").forEach((n) => n.remove());
        const add = (tag, attrs) => {
          const n = document.createElementNS(NS, tag);
          n.setAttribute("class", "pp-gc-over");
          Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
          svg.appendChild(n);
          return n;
        };
        if (st.wrong) {
          const { vx, vy } = st.wrong;
          add("path", { d: `M${vx - 6} ${vy - 6}L${vx + 6} ${vy + 6}M${vx + 6} ${vy - 6}L${vx - 6} ${vy + 6}`, stroke: "#a33030", "stroke-width": "3", "stroke-linecap": "round" });
        }
        if (st.cursor) {
          const { vx, vy } = st.cursor;
          add("circle", { cx: vx, cy: vy, r: 7, fill: "none", stroke: "#21313e", "stroke-width": "2" });
          add("path", { d: `M${vx - 12} ${vy}H${vx + 12}M${vx} ${vy - 12}V${vy + 12}`, stroke: "#21313e", "stroke-width": "1.5" });
        }
      }

      function draw() {
        const it = items[st.cur];
        const s = it.steps[st.step];
        const key = it.id + "#" + st.step;
        if (!st.done && shownKey !== key) { ctx.shown(key); shownKey = key; }
        const multi = it.steps.length > 1;
        let h = '<div class="pp-card"><div class="pp-prompt">' + esc(it.prompt) + "</div>";
        if (!st.done) {
          h += '<div class="pp-gc-ask">' + (multi ? '<span class="pp-gc-step">Step ' + (st.step + 1) + " of " + it.steps.length + "</span> " : "") + esc(s.ask) + "</div>";
        }
        h += "</div>" + PP.figure(figureFor(it, st.step));
        if (!st.done && s.kind === "choose") {
          if (!st.ord) st.ord = s.shuffle_options === false ? s.options.map((_, i) => i) : order(s.options.length);
          h += '<div class="pp-choices" role="group" aria-label="Answer choices">' + st.ord.map((i) =>
            '<button type="button" class="pp-choice' + (st.tried.includes(i) ? " pp-is-wrong" : "") + '" data-opt="' + i + '"' + (st.tried.includes(i) ? " disabled" : "") + ">" + esc(s.options[i]) + "</button>").join("") + "</div>";
        } else if (!st.done) {
          h += '<p class="pp-tiny pp-muted pp-gc-help">Click or tap the graph. Keyboard: focus the graph, move the crosshair with the arrow keys (Shift for bigger steps), and press Enter.</p>';
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
            '<div class="pp-tiny pp-muted">' + (st.streak >= need ? need + " in a row. That’s fluency. Keep going if you like." : n + " of " + need + " in a row. A graph counts when every step is right on the first try.") + "</div></div>";
        }
        h += '<div class="pp-actions">' + (st.done ? '<button type="button" class="pp-primary" id="pp-go">Next graph</button>' : "") + "</div>";
        host.innerHTML = h;
        host.dataset.item = it.id;
        host.dataset.step = st.done ? "done" : String(st.step);

        const svg = host.querySelector('svg[role="application"]');
        if (svg && !st.done && s.kind !== "choose") {
          svg.setAttribute("aria-label", "Interactive graph. " + s.ask);
          drawOverlay(svg);
          const toView = (e) => {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX; pt.y = e.clientY;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
          };
          svg.addEventListener("click", (e) => { const v = toView(e); st.cursor = null; submitClick(it, svg, v.x, v.y); });
          svg.addEventListener("keydown", (e) => {
            const f = frame(svg);
            if (!st.cursor) st.cursor = { vx: (f.L + f.R) / 2, vy: (f.T + f.B) / 2 };
            const stepX = (f.R - f.L) / (e.shiftKey ? 12 : 60), stepY = (f.B - f.T) / (e.shiftKey ? 10 : 45);
            const c = st.cursor;
            if (e.key === "ArrowLeft") c.vx = Math.max(f.L - 30, c.vx - stepX);
            else if (e.key === "ArrowRight") c.vx = Math.min(f.R, c.vx + stepX);
            else if (e.key === "ArrowUp") c.vy = Math.max(f.T, c.vy - stepY);
            else if (e.key === "ArrowDown") c.vy = Math.min(f.B + 20, c.vy + stepY);
            else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); submitClick(it, svg, c.vx, c.vy); const again = host.querySelector('svg[role="application"]'); if (again) again.focus(); return; }
            else return;
            e.preventDefault(); drawOverlay(svg);
          });
        } else if (svg) {
          svg.removeAttribute("role"); svg.removeAttribute("tabindex");
          svg.setAttribute("aria-hidden", "true");
        }
        host.querySelectorAll("[data-opt]").forEach((b) => (b.onclick = () => submitChoice(it, Number(b.dataset.opt))));
        const go = host.querySelector("#pp-go");
        if (go) go.onclick = () => { newItem(); if (!ctx.roundDone()) draw(); };
        ctx.resized();
      }
      draw();
    }
  });
})(window.PP);
