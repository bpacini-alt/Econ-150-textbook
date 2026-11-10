/* Preview copy of the graph renderer updated in practice-engines#37. */
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
 *    notes:[{at:[x,y], text}]}
 * or several side by side: {kind:"panels", alt, panels:[graph, ...]}
 * role: demand | supply | tax | neutral (sets color); style: solid | dotted
 * "alt" is required: it is the figure's text for screen readers.
 */
(function (PP) {
  "use strict";
  const { esc } = PP.util;
  const L = 46, B = 44;
  const COLORS = { demand: "#1a3a5c", supply: "#a33030", tax: "#b7791f", neutral: "#33556a" };
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
      s += '<text x="' + fmt(sx(n.at[0])) + '" y="' + fmt(sy(n.at[1])) + '" font-size="14" fill="#21313e">' + esc(n.text) + "</text>";
    }
    const defs = '<defs><marker id="' + idPrefix + 'ax" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#333"></path></marker>' +
      '<marker id="' + idPrefix + 'ar" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#21313e"></path></marker></defs>';
    return '<svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="width:100%;height:auto;display:block;font-family:system-ui,sans-serif">' + defs + s + "</svg>";
  }

  let counter = 0;
  PP.figure = (spec) => {
    if (!spec) return "";
    const graphs = spec.kind === "panels" ? spec.panels : [spec];
    // Panels with nothing to read off the axes stay two to a row, even on phones.
    const compact = graphs.length > 1 && graphs.every((g) => !(g.guides || []).length && !(g.notes || []).length);
    const cols = Math.min(graphs.length, 2);
    const inner = graphs.map((g) => '<div class="pp-fig-panel">' + (g.title ? '<div class="pp-fig-cap">' + esc(g.title) + "</div>" : "") + one(g, "ppf" + (++counter) + "-", compact) + "</div>").join("");
    return '<figure class="pp-figure" role="img" aria-label="' + esc(spec.alt) + '"><div class="pp-fig-grid' + (compact ? " pp-fig-compact" : "") + '" style="--pp-fig-cols:' + cols + '">' + inner + "</div></figure>";
  };
})(window.PP);
