/* Precise Practice engine core.
 *
 * One engine for every chapter. A chapter's practice is data (a bank file
 * generated from items/<book>/chNN-practice.json); this file renders it.
 *
 * Page URL:  precise-practice.html?bank=<bank-id>&concept=<n|ready>&embed=1
 * Bank file: banks/<bank-id>.js, which sets window.PP_BANKS[<bank-id>]
 *
 * Messages to the host chapter (same contract as the Chapter 16 prototype):
 *   {kind:"etb-precise-height", height}   size the iframe
 *   {kind:"etb-precise-unlock-frq"}       readiness reached, show the FRQ
 *   {kind:"etb-precise-relock-frq"}       student restarted readiness
 *   {kind:"etb-precise-go-frq"}           scroll the host to the FRQ
 */
(function (root) {
  "use strict";

  const PP = root.PP = root.PP || {};
  PP.renderers = PP.renderers || {};
  root.PP_BANKS = root.PP_BANKS || {};

  /* ---------- utilities ---------- */
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const order = (n) => shuffle(Array.from({ length: n }, (_, i) => i));
  const grade = (g) => (g === "A-" ? "A−" : g);
  /* Parse a typed number: accepts commas, %, $, a Unicode minus, and spaces. */
  const parseNumber = (raw) => {
    if (raw == null) return NaN;
    const s = String(raw).trim().replace(/[−–—]/g, "-").replace(/[,$%\s]/g, "");
    if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return Number(s);
  };
  PP.util = { esc, shuffle, order, grade, parseNumber };

  PP.register = (type, renderer) => { PP.renderers[type] = renderer; };

  /* Walk through a pool in a fresh shuffled order, reshuffling when used up,
     so repeated rounds don't show items in the same sequence. A reshuffle in
     the middle of a deal puts the items already dealt at the back of the new
     deck, so one deal (a round, a board) never repeats an item. */
  PP.deal = (state, key, poolSize, count) => {
    state.decks = state.decks || {};
    let d = state.decks[key];
    if (!d || d.size !== poolSize) d = state.decks[key] = { size: poolSize, order: order(poolSize), pos: 0 };
    const out = [];
    for (let k = 0; k < Math.min(count, poolSize); k++) {
      if (d.pos >= d.order.length) {
        const fresh = order(poolSize);
        d.order = fresh.filter((i) => !out.includes(i)).concat(fresh.filter((i) => out.includes(i)));
        d.pos = 0;
      }
      out.push(d.order[d.pos++]);
    }
    return out;
  };

  /* Deal a round from a pool whose items each have an answer, with an even
     mix of answers and no more than maxRun of the same answer in a row. Plain
     shuffles make long streaks common (in a round of 8 from a 16/16 two-key
     pool, a run of 5 or more about 12% of the time), and streaks invite
     guessing from the pattern instead of reading the item. Each answer keeps
     its own deck, so items still cycle through the whole pool. */
  PP.dealBalanced = (state, key, answers, count, maxRun) => {
    const byAns = new Map();
    answers.forEach((a, i) => { if (!byAns.has(a)) byAns.set(a, []); byAns.get(a).push(i); });
    const labels = Array.from(byAns.keys());
    const quota = new Map(labels.map((l) => [l, 0]));
    let left = Math.min(count, answers.length);
    while (left > 0) {
      let moved = false;
      for (const l of shuffle(labels)) {
        if (left > 0 && quota.get(l) < byAns.get(l).length) { quota.set(l, quota.get(l) + 1); left--; moved = true; }
      }
      if (!moved) break;
    }
    const remaining = new Map(labels.map((l) => [l, PP.deal(state, key + "#" + l, byAns.get(l).length, quota.get(l)).map((j) => byAns.get(l)[j])]));
    const out = [];
    let runLabel = null, run = 0;
    for (;;) {
      const live = labels.filter((l) => remaining.get(l).length);
      if (!live.length) break;
      let pool = live.filter((l) => !(l === runLabel && run >= (maxRun || 3)));
      if (!pool.length) pool = live;
      let r = Math.random() * pool.reduce((n, l) => n + remaining.get(l).length, 0), pick = pool[pool.length - 1];
      for (const l of pool) { r -= remaining.get(l).length; if (r < 0) { pick = l; break; } }
      out.push(remaining.get(pick).shift());
      run = pick === runLabel ? run + 1 : 1; runLabel = pick;
    }
    return out;
  };

  /* ---------- storage ---------- */
  function makeStore(key) {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { data = {}; }
    return {
      data,
      save() { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* storage blocked: keep going */ } },
      reset() { data = this.data = {}; try { localStorage.removeItem(key); } catch (e) {} }
    };
  }

  /* ---------- host messages ---------- */
  const embedded = new URLSearchParams(location.search).get("embed") === "1";
  PP.post = (msg) => { if (embedded && root.parent !== root) root.parent.postMessage(msg, "*"); };

  function watchHeight(el) {
    let last = -1;
    const send = () => {
      const h = Math.ceil(el.getBoundingClientRect().bottom + 16);
      if (h !== last) { last = h; PP.post({ kind: "etb-precise-height", height: h }); }
    };
    if ("ResizeObserver" in root) new ResizeObserver(send).observe(el);
    root.addEventListener("load", send);
    root.addEventListener("resize", send);
    requestAnimationFrame(send);
    PP.resized = send;
  }

  /* ---------- interaction data (standard: docs/INTERACTION-DATA.md) ----------
   * Every scored response produces one "pp-event/1" object. Events always go
   * to an in-memory buffer (PP.data.events, used by QA and ?pp_debug=1).
   * They leave the browser only when the bank sets settings.data.endpoint,
   * and never when the page URL has pp_data=off. No names, no free text
   * beyond short typed numbers and the tiles a student chose.
   */
  const params = new URLSearchParams(location.search);
  PP.data = { events: [], queue: [], endpoint: null, debug: params.get("pp_debug") === "1", context: {} };
  const randomId = () => (root.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

  PP.configureData = (bank) => {
    const cfg = (bank.settings && bank.settings.data) || {};
    const off = params.get("pp_data") === "off";
    PP.data.endpoint = !off && typeof cfg.endpoint === "string" && /^(https:\/\/|\/)/.test(cfg.endpoint) ? cfg.endpoint : null;
    let sid = null;
    if (PP.data.endpoint) {
      try { sid = localStorage.getItem("pp:session"); if (!sid) { sid = randomId(); localStorage.setItem("pp:session", sid); } } catch (e) { sid = null; }
    }
    PP.data.context = { bank: bank.bank_id, bank_v: bank.version || null, ch: bank.chapter, sid: sid || "local-" + randomId().slice(0, 8) };
  };

  /* Low-level: record a complete event. Renderers use ctx.record instead. */
  PP.recordEvent = (fields) => {
    const ev = Object.assign({ schema: "pp-event/1", t: new Date().toISOString() }, PP.data.context, fields);
    PP.data.events.push(ev);
    if (PP.data.events.length > 300) PP.data.events.shift();
    if (PP.data.debug && root.console) console.log("[pp-event]", ev);
    if (PP.data.endpoint) { PP.data.queue.push(ev); if (PP.data.queue.length >= 10) PP.flushData(); }
    return ev;
  };

  PP.flushData = () => {
    if (!PP.data.endpoint || !PP.data.queue.length) return;
    const batch = PP.data.queue.splice(0, PP.data.queue.length);
    const body = JSON.stringify({ schema: "pp-batch/1", events: batch });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(PP.data.endpoint, new Blob([body], { type: "application/json" }))) return;
      fetch(PP.data.endpoint, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    } catch (e) { /* losing a batch is acceptable; practice must never break */ }
  };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") PP.flushData(); });
  root.addEventListener("pagehide", () => PP.flushData());

  /* Keep short typed text short. */
  PP.clip = (s, n) => String(s == null ? "" : s).slice(0, n || 40);

  /* ---------- default instructions by interaction ---------- */
  const DEFAULT_INSTRUCTIONS = {
    sort: "Sort every card into its best category, then check the whole board.",
    match: "Match each term to its meaning. Matched pairs disappear.",
    detective: "You are the teacher. Grade each student: A is complete and correct, A− is true but missing something essential, F has a fundamental error.",
    quick: "Choose quickly, but read carefully. Use the arrow keys or tap a button.",
    compare: "Choose which option has more elastic demand. Use the keys or tap A or B.",
    calc: "Work each problem, then check. Turn on the formula, hints, or a worked example whenever you want them.",
    choice: "Choose the best answer, then check your reasoning.",
    tiles: "Build the statement from the tiles. Use only the tiles that belong; order doesn't matter unless the prompt says so."
  };
  const TIER_LABELS = { 1: "Foundations", 2: "Apply", 3: "AP-style", 4: "Review" };

  /* ---------- concept checkpoint ---------- */
  function mountCheckpoint(rootEl, bank, conceptIndex, store) {
    const concept = bank.concepts.find((c) => Number(c.number) === conceptIndex + 1);
    if (!concept) { rootEl.innerHTML = '<div class="pp-panel">This checkpoint isn’t available.</div>'; return; }
    const goals = (bank.settings && bank.settings.goals) || { 1: 10, 2: 5, 3: 3 };
    /* A bank can rename a tier (settings.tier_labels). Tier 4 appears only in banks
       that have Tier 4 activities, such as a review bank's missed-exam twins. */
    const tierLabel = (t) => (bank.settings && bank.settings.tier_labels && bank.settings.tier_labels[t]) || TIER_LABELS[t];
    const S = store.data;
    S.concepts = S.concepts || {};
    const cs = S.concepts[concept.id] = S.concepts[concept.id] || { tier: null, style: {}, counts: {}, mixTurn: {}, act: {} };
    const tiers = [1, 2, 3, 4].filter((t) => concept.activities.some((a) => a.tier === t && PP.renderers[a.type]));
    if (!tiers.includes(cs.tier)) cs.tier = tiers[0];
    let cleanup = null;
    const marks = {};

    function activitiesFor(t) { return concept.activities.filter((a) => a.tier === t && PP.renderers[a.type]); }

    function current() {
      const list = activitiesFor(cs.tier);
      /* concept.ladder lists tiers whose activities are ordered steps: start on the
         first step instead of "Mix it up", and number the steps in the picker. */
      const ladder = (concept.ladder || []).includes(cs.tier);
      const pick = cs.style[cs.tier] || (list.length > 1 && !ladder ? "mix" : list[0].id);
      if (pick === "mix") return { mix: true, activity: list[(cs.mixTurn[cs.tier] || 0) % list.length], list, ladder };
      return { mix: false, activity: list.find((a) => a.id === pick) || list[0], list, ladder };
    }

    function render() {
      if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
      const { mix, activity, list, ladder } = current();
      const goal = goals[cs.tier] || 5;
      const done = cs.counts[cs.tier] || 0;
      const pick = mix ? "mix" : activity.id;
      let h = '<div class="pp-panel">';
      h += '<div class="pp-eyebrow">Concept ' + esc(concept.number) + ' practice</div>';
      h += '<div class="pp-title">' + esc(concept.name) + "</div>";
      h += '<div class="pp-tiers" role="group" aria-label="Practice level">' + tiers.map((t) =>
        '<button type="button" data-tier="' + t + '" aria-pressed="' + (t === cs.tier) + '">' + '<span class="pp-tier-n">Tier ' + t + "</span>" + esc(tierLabel(t)) + "</button>").join("") + "</div>";
      if (list.length > 1) {
        h += '<div class="pp-controls"><label for="pp-style">Practice style</label><select id="pp-style">' +
          (ladder ? "" : '<option value="mix"' + (pick === "mix" ? " selected" : "") + ">Mix it up</option>") +
          list.map((a, i) => '<option value="' + esc(a.id) + '"' + (pick === a.id ? " selected" : "") + ">" + (ladder ? "Step " + (i + 1) + ": " : "") + esc(a.title) + "</option>").join("") +
          (ladder ? '<option value="mix"' + (pick === "mix" ? " selected" : "") + ">Mix them all</option>" : "") +
          "</select></div>";
      }
      h += '<p class="pp-instruction"><b>' + esc(activity.title) + (/[.?!:]$/.test(activity.title) ? "" : ".") + "</b> " + esc(activity.instructions || DEFAULT_INSTRUCTIONS[activity.type] || "") + "</p>";
      h += '<div class="pp-progress"><div class="pp-bar"><span style="width:' + Math.min(100, (done / goal) * 100) + '%"></span></div><div class="pp-tiny pp-muted">' +
        Math.min(done, goal) + " / " + goal + " suggested. " + (done >= goal ? "Move on when you feel ready." : "A guide, not a grade.") + "</div></div>";
      h += '<div id="pp-activity" aria-live="polite"></div></div>';
      rootEl.innerHTML = h;

      rootEl.querySelectorAll("[data-tier]").forEach((b) => (b.onclick = () => { cs.tier = Number(b.dataset.tier); store.save(); render(); }));
      const sel = rootEl.querySelector("#pp-style");
      if (sel) sel.onchange = () => { cs.style[cs.tier] = sel.value; store.save(); render(); };

      const host = rootEl.querySelector("#pp-activity");
      const ast = cs.act[activity.id] = cs.act[activity.id] || {};
      const ctx = {
        state: ast,
        save: () => store.save(),
        count: () => { cs.counts[cs.tier] = (cs.counts[cs.tier] || 0) + 1; store.save(); updateProgress(); },
        roundDone: () => {
          if (mix) { cs.mixTurn[cs.tier] = (cs.mixTurn[cs.tier] || 0) + 1; store.save(); render(); return true; }
          return false;
        },
        rerender: () => render(),
        resized: () => PP.resized && PP.resized(),
        mix,
        /* Mark when a unit appeared, so its event can report time on task. */
        shown: (key) => { marks[key] = performance.now(); },
        /* Record one scored response (pp-event/1). unit must carry id and _v.
           fields: {correct, resp, misc?, key?, extra?} */
        record: (unit, fields) => {
          S.attempts = S.attempts || {};
          const n = S.attempts[unit.id] = (S.attempts[unit.id] || 0) + 1;
          store.save();
          const key = fields.key || unit.id;
          return PP.recordEvent({
            concept: concept.number, act: activity.id, type: activity.type, tier: activity.tier, mode: mix ? "mix" : "chosen",
            unit: unit.id, unit_v: unit._v || null, attempt: n,
            ms: marks[key] != null ? Math.round(performance.now() - marks[key]) : null,
            correct: fields.correct == null ? null : !!fields.correct,
            resp: fields.resp || {}, misc: (fields.misc || []).filter(Boolean), extra: fields.extra || undefined
          });
        }
      };
      cleanup = PP.renderers[activity.type].render(host, activity, ctx) || null;
      PP.resized && PP.resized();
    }

    function updateProgress() {
      const goal = goals[cs.tier] || 5, done = cs.counts[cs.tier] || 0;
      const bar = rootEl.querySelector(".pp-progress .pp-bar span");
      const txt = rootEl.querySelector(".pp-progress .pp-tiny");
      if (bar) bar.style.width = Math.min(100, (done / goal) * 100) + "%";
      if (txt) txt.textContent = Math.min(done, goal) + " / " + goal + " suggested. " + (done >= goal ? "Move on when you feel ready." : "A guide, not a grade.");
    }

    render();
  }

  /* ---------- boot ---------- */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = () => reject(new Error("Could not load " + src));
      document.head.appendChild(s);
    });
  }
  PP.loadBank = async (id) => {
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Bad bank id");
    if (!root.PP_BANKS[id]) await loadScript("banks/" + id + ".js");
    if (!root.PP_BANKS[id]) throw new Error("Bank " + id + " did not register");
    return root.PP_BANKS[id];
  };

  PP.boot = async () => {
    const params = new URLSearchParams(location.search);
    if (embedded) document.documentElement.classList.add("pp-embedded");
    const rootEl = document.getElementById("pp-root");
    watchHeight(rootEl);
    try {
      const bankId = params.get("bank");
      const bank = await PP.loadBank(bankId);
      PP.configureData(bank);
      const store = makeStore("pp:" + bankId + ":" + (bank.storage_version || 1));
      const which = params.get("concept") || "1";
      if (which === "ready") {
        if (!PP.mountReadiness) throw new Error("Readiness module missing");
        await PP.mountReadiness(rootEl, bank, store);
      } else {
        mountCheckpoint(rootEl, bank, Number(which) - 1, store);
      }
    } catch (err) {
      rootEl.innerHTML = '<div class="pp-panel"><b>Practice didn’t load.</b><p class="pp-muted">' + esc(err.message) + "</p></div>";
    }
    PP.resized && PP.resized();
  };
})(window);
