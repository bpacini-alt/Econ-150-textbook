/* Figures for practice items: exact economics graphs drawn from a spec.
 *
 * Figures are data, never pictures, so curves, points, and labels are exact
 * and the same every time (see docs/GRAPH-AUTHORING-AND-READABILITY.md).
 * Conventions from the design record: the starting curve is dotted, the new
 * curve is solid, and a shift has an arrow from old to new.
 *
 * Spec (one graph):
 *   {kind:"graph", alt, title?, label_mode?:"edge", x:{label, max, min?}, y:{label, max, min?},
 *    lines:[{points:[[x,y],...], label?, label_at?:[x,y], label_dx?:px, label_dy?:px, label_anchor?:"start"|"middle"|"end", role?, style?}],
 *    points:[{at:[x,y], label?}],
 *    guides:[{at:[x,y], x_label?, y_label?}],   dotted drops to both axes
 *    areas:[{polygon:[[x,y],...], label?, role?}],
 *    arrows:[{from:[x,y], to:[x,y]}],
 *    notes:[{at:[x,y], text, anchor?:"start"|"middle"|"end", bold?, role?}],
 *    interactive?: true}   graph students click (renderers/graphclick.js): the SVG
 *                          becomes focusable and carries its plot frame in data-* attributes
 * or several side by side: {kind:"panels", alt, panels:[graph, ...]}
 * or a schedule:  {kind:"table", alt, caption?, columns:[...], rows:[[...], ...]}
 * or a payoff matrix (Chapter 24 games; renderers/matrixclick.js makes it clickable):
 *   {kind:"matrix", alt, caption?, row_player:{name, short}, col_player:{name, short},
 *    rows:[strategy, ...], cols:[strategy, ...], payoffs:[[[row payoff, col payoff], ...], ...],
 *    prefix?:"$", suffix?:"", note?}
 *   Each cell shows both payoffs, each tagged with its player's short name ("A: $14").
 * role: demand | supply | tax | neutral | mark (sets color; mark is for labeled segments students pick from); style: solid | dotted
 * "alt" is required: it is the figure's text for screen readers.
 */
(function (PP) {
  "use strict";
  const { esc } = PP.util;
  const L = 46, B = 44;
  const COLORS = { demand: "#1a3a5c", supply: "#a33030", tax: "#b7791f", neutral: "#33556a", mark: "#7a3e9d" };
  const AREA = { neutral: "rgba(25,117,155,.16)", dwl: "rgba(163,48,48,.18)", buyer: "rgba(26,58,92,.16)", seller: "rgba(183,121,31,.2)" };

  // Full size for graphs with numbers to read; a smaller canvas (so the same
  // font sizes stay readable two to a row on a phone) for shape-only panels.
  function one(g, idPrefix, compact) {
    const edgeLabels = g.label_mode === "edge";
    const W = compact ? 210 : (edgeLabels ? 450 : 360), H = compact ? 180 : 270;
    const T = 30, R = edgeLabels ? 112 : 22;
    const xmin = g.x.min || 0, ymin = g.y.min || 0;
    const sx = (x) => L + ((x - xmin) / (g.x.max - xmin)) * (W - L - R);
    const sy = (y) => H - B - ((y - ymin) / (g.y.max - ymin)) * (H - T - B);
    const fmt = (n) => Math.round(n * 10) / 10;
    let s = "";
    for (const a of g.areas || []) {
      s += '<polygon points="' + a.polygon.map(([x, y]) => fmt(sx(x)) + "," + fmt(sy(y))).join(" ") + '" fill="' + (AREA[a.role] || AREA.neutral) + '" stroke="none"></polygon>';
      if (a.label) {
        const cx = a.polygon.reduce((t, p) => t + p[0], 0) / a.polygon.length, cy = a.polygon.reduce((t, p) => t + p[1], 0) / a.polygon.length;
        s += '<text x="' + fmt(sx(cx)) + '" y="' + fmt(sy(cy) + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#21313e">' + esc(a.label) + "</text>";
      }
    }
    // axes
    s += '<line x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R + 8) + '" y2="' + (H - B) + '" stroke="#333" stroke-width="2" marker-end="url(#' + idPrefix + 'ax)"></line>';
    s += '<line x1="' + L + '" y1="' + (H - B) + '" x2="' + L + '" y2="' + (T - 10) + '" stroke="#333" stroke-width="2" marker-end="url(#' + idPrefix + 'ax)"></line>';
    s += '<text x="' + (W - R) + '" y="' + (H - 12) + '" text-anchor="end" font-size="15" fill="#333">' + esc(g.x.label || "Quantity") + "</text>";
    s += '<text x="' + (L + 10) + '" y="' + (T - 10) + '" font-size="15" fill="#333">' + esc(g.y.label || "Price") + "</text>";
    for (const gd of g.guides || []) {
      const [x, y] = gd.at;
      s += '<path d="M' + fmt(sx(x)) + " " + fmt(sy(y)) + "V" + (H - B) + "M" + fmt(sx(x)) + " " + fmt(sy(y)) + "H" + L + '" stroke="#555" stroke-width="1.5" stroke-dasharray="4 4" fill="none"></path>';
      if (gd.x_label) s += '<text x="' + fmt(sx(x)) + '" y="' + (H - B + 18) + '" text-anchor="middle" font-size="14" fill="#21313e">' + esc(gd.x_label) + "</text>";
      if (gd.y_label) s += '<text x="' + (L - 6) + '" y="' + fmt(sy(y) + 5) + '" text-anchor="end" font-size="14" fill="#21313e">' + esc(gd.y_label) + "</text>";
    }
    for (const ln of g.lines || []) {
      const c = COLORS[ln.role] || COLORS.neutral;
      s += '<polyline points="' + ln.points.map(([x, y]) => fmt(sx(x)) + "," + fmt(sy(y))).join(" ") + '" fill="none" stroke="' + c + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"' + (ln.style === "dotted" ? ' stroke-dasharray="2 7"' : "") + "></polyline>";
      if (ln.label) {
        const at = ln.label_at || ln.points[ln.points.length - 1];
        if (edgeLabels) {
          s += '<text x="' + fmt(sx(at[0]) + 4) + '" y="' + fmt(sy(at[1]) + 3) + '" text-anchor="start" font-size="12" font-weight="700" fill="' + c + '">' + esc(ln.label) + "</text>";
        } else {
          // Explicit pixel offsets and anchoring keep labels beside individual curves.
          const defaultX = sx(at[0]) + 6, fits = defaultX + ln.label.length * 9 <= W - 2;
          const dx = Number.isFinite(ln.label_dx) ? ln.label_dx : (fits ? 6 : -10);
          const dy = Number.isFinite(ln.label_dy) ? ln.label_dy : (fits ? -6 : -10);
          const anchor = ["start", "middle", "end"].includes(ln.label_anchor) ? ln.label_anchor : (fits ? "start" : "end");
          s += '<text x="' + fmt(sx(at[0]) + dx) + '" y="' + fmt(sy(at[1]) + dy) + '" text-anchor="' + anchor + '" font-size="15" font-weight="700" fill="' + c + '">' + esc(ln.label) + "</text>";
        }
      }
    }
    for (const a of g.arrows || []) {
      s += '<line x1="' + fmt(sx(a.from[0])) + '" y1="' + fmt(sy(a.from[1])) + '" x2="' + fmt(sx(a.to[0])) + '" y2="' + fmt(sy(a.to[1])) + '" stroke="#21313e" stroke-width="2" marker-end="url(#' + idPrefix + 'ar)"></line>';
    }
    for (const p of g.points || []) {
      s += '<circle cx="' + fmt(sx(p.at[0])) + '" cy="' + fmt(sy(p.at[1])) + '" r="5" fill="#21313e"></circle>';
      if (p.label) s += '<text x="' + fmt(sx(p.at[0]) + 8) + '" y="' + fmt(sy(p.at[1]) - 8) + '" font-size="15" font-weight="700" fill="#21313e">' + esc(p.label) + "</text>";
    }
    for (const n of g.notes || []) {
      const anchor = ["middle", "end"].includes(n.anchor) ? ' text-anchor="' + n.anchor + '"' : "";
      s += '<text x="' + fmt(sx(n.at[0])) + '" y="' + fmt(sy(n.at[1])) + '"' + anchor + ' font-size="14"' + (n.bold ? ' font-weight="700"' : "") + ' fill="' + (COLORS[n.role] || "#21313e") + '">' + esc(n.text) + "</text>";
    }
    const defs = '<defs><marker id="' + idPrefix + 'ax" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#333"></path></marker>' +
      '<marker id="' + idPrefix + 'ar" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#21313e"></path></marker></defs>';
    const attrs = g.interactive
      ? ' role="application" tabindex="0" aria-label="Interactive graph" data-x-min="' + xmin + '" data-x-max="' + g.x.max + '" data-y-min="' + ymin + '" data-y-max="' + g.y.max +
        '" data-plot-left="' + L + '" data-plot-right="' + (W - R) + '" data-plot-top="' + T + '" data-plot-bottom="' + (H - B) + '"'
      : ' aria-hidden="true" focusable="false"';
    return '<svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg"' + attrs + ' style="width:100%;height:auto;display:block;font-family:system-ui,sans-serif">' + defs + s + "</svg>";
  }

  function table(t) {
    let h = '<figure class="pp-figure pp-table-fig" role="group" aria-label="' + esc(t.alt) + '">' +
      (t.caption ? '<figcaption class="pp-fig-cap">' + esc(t.caption) + "</figcaption>" : "") +
      '<div class="pp-table-wrap"><table class="pp-table"><thead><tr>' +
      t.columns.map((c) => '<th scope="col">' + esc(c) + "</th>").join("") + "</tr></thead><tbody>";
    for (const r of t.rows) h += "<tr>" + r.map((v) => "<td>" + esc(v) + "</td>").join("") + "</tr>";
    return h + "</tbody></table></div></figure>";
  }

  /* opts (from renderers/matrixclick.js): {click: "cell"|"payoff"|null,
     marks: {payoffs:[[r,c,p]...], cells:[{at:[r,c], label}]}, dim: {rows:[...], cols:[...]}} */
  function matrix(m, opts) {
    opts = opts || {};
    const marks = opts.marks || {}, dim = opts.dim || {};
    const pre = m.prefix == null ? "$" : m.prefix, suf = m.suffix || "";
    const money = (v) => (v < 0 ? "−" : "") + pre + Math.abs(v).toLocaleString("en-US") + suf;
    const who = [m.row_player.short, m.col_player.short];
    const marked = (r, c, p) => (marks.payoffs || []).some((k) => k[0] === r && k[1] === c && k[2] === p);
    const cellMark = (r, c) => (marks.cells || []).find((k) => k.at[0] === r && k.at[1] === c);
    const nc = m.cols.length;
    let h = '<figure class="pp-figure pp-matrix-fig" role="group" aria-label="' + esc(m.alt) + '">' +
      (m.caption ? '<figcaption class="pp-fig-cap">' + esc(m.caption) + "</figcaption>" : "") +
      '<div class="pp-table-wrap"><table class="pp-matrix' + (opts.click ? " pp-mx-live" : "") + '">' +
      '<tr><td colspan="2"></td><th class="pp-mx-player pp-mx-c" colspan="' + nc + '" scope="colgroup">' + esc(m.col_player.name) + "</th></tr>" +
      '<tr><td colspan="2"></td>' + m.cols.map((s, c) => '<th class="pp-mx-strat pp-mx-c' + ((dim.cols || []).includes(c) ? " pp-mx-dim" : "") + '" scope="col">' + esc(s) + "</th>").join("") + "</tr>";
    m.rows.forEach((rs, r) => {
      h += "<tr>";
      if (r === 0) h += '<th class="pp-mx-player pp-mx-r pp-mx-side" rowspan="' + m.rows.length + '" scope="rowgroup"><span>' + esc(m.row_player.name) + "</span></th>";
      h += '<th class="pp-mx-strat pp-mx-r' + ((dim.rows || []).includes(r) ? " pp-mx-dim" : "") + '" scope="row">' + esc(rs) + "</th>";
      m.cols.forEach((cs, c) => {
        const cm = cellMark(r, c);
        const dimmed = (dim.rows || []).includes(r) || (dim.cols || []).includes(c);
        const pay = (p) => {
          const txt = esc(who[p]) + ": " + esc(money(m.payoffs[r][c][p]));
          const cls = "pp-mx-pay pp-mx-p" + p + (marked(r, c, p) ? " pp-mx-ring" : "");
          const label = esc(m[p ? "col_player" : "row_player"].name) + " earns " + esc(money(m.payoffs[r][c][p])) +
            " when " + esc(m.row_player.name) + " plays " + esc(rs) + " and " + esc(m.col_player.name) + " plays " + esc(cs);
          return opts.click === "payoff" && !dimmed
            ? '<button type="button" class="' + cls + '" data-r="' + r + '" data-c="' + c + '" data-p="' + p + '" aria-label="' + label + '">' + txt + "</button>"
            : '<span class="' + cls + '">' + txt + "</span>";
        };
        const inner = pay(0) + pay(1) + (cm && cm.label ? '<span class="pp-mx-tag">' + esc(cm.label) + "</span>" : "");
        const cls = "pp-mx-cell" + (cm ? " pp-mx-picked" : "") + (dimmed ? " pp-mx-dim" : "");
        h += '<td class="' + cls + '">' + (opts.click === "cell"
          ? '<button type="button" class="pp-mx-cellbtn" data-r="' + r + '" data-c="' + c + '" aria-label="' + esc(m.row_player.name) + " plays " + esc(rs) + ", " + esc(m.col_player.name) + " plays " + esc(cs) + ": " +
            esc(who[0]) + " " + esc(money(m.payoffs[r][c][0])) + ", " + esc(who[1]) + " " + esc(money(m.payoffs[r][c][1])) + '">' + inner + "</button>"
          : inner) + "</td>";
      });
      h += "</tr>";
    });
    return h + "</table></div>" + (m.note ? '<div class="pp-tiny pp-muted pp-mx-note">' + esc(m.note) + "</div>" : "") + "</figure>";
  }
  PP.matrixFigure = matrix;

  let counter = 0;
  PP.figure = (spec) => {
    if (!spec) return "";
    if (spec.kind === "table") return table(spec);
    if (spec.kind === "matrix") return matrix(spec);
    const graphs = spec.kind === "panels" ? spec.panels : [spec];
    // Panels with nothing to read off the axes stay two to a row, even on phones.
    const compact = graphs.length > 1 && graphs.every((g) => !(g.guides || []).length && !(g.notes || []).length);
    const cols = Math.min(graphs.length, 2);
    const inner = graphs.map((g) => '<div class="pp-fig-panel">' + (g.title ? '<div class="pp-fig-cap">' + esc(g.title) + "</div>" : "") + one(g, "ppf" + (++counter) + "-", compact) + "</div>").join("");
    const role = graphs.some((g) => g.interactive) ? "group" : "img";
    return '<figure class="pp-figure" role="' + role + '" aria-label="' + esc(spec.alt) + '"><div class="pp-fig-grid' + (compact ? " pp-fig-compact" : "") + '" style="--pp-fig-cols:' + cols + '">' + inner + "</div></figure>";
  };
})(window.PP);
