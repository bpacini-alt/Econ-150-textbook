/* Definition Detective: Grade the Students (approved interaction).
 * activity.rounds: [{id, term, answers:[{text, grade:"A"|"A-"|"F", why, misconception?}, x3]}]
 * activity.lead (optional): the line above each term; defaults to "Grade these students’ definitions of:".
 * The learner grades three named students. Grades are stored as "A", "A-",
 * "F" (machine-safe) and shown as A, A−, F. Order is shuffled per round;
 * names stay fixed for the round and never cue the answer.
 */
(function (PP) {
  "use strict";
  const { esc, order, grade } = PP.util;
  const NAMES = ["Bob", "Maya", "Leo", "Priya", "Sam", "Nina", "Eli", "Zoe", "Omar", "June", "Ava", "Theo"];
  const AVATAR = '<svg viewBox="0 0 64 94" width="40" height="58" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><circle cx="32" cy="15" r="11"/><path d="M32 27v32M13 40l19-10 19 10M32 59L18 83M32 59l14 24"/></svg>';

  PP.register("detective", {
    render(host, activity, ctx) {
      const st = ctx.state;
      if (st.cur == null || st.cur >= activity.rounds.length) newRound();

      function newRound() {
        st.cur = PP.deal(st, "rounds", activity.rounds.length, 1)[0];
        const r = activity.rounds[st.cur];
        st.ord = order(r.answers.length);
        const start = Math.floor(Math.random() * NAMES.length);
        st.names = r.answers.map((_, k) => NAMES[(start + k * 5) % NAMES.length]);
        st.picks = {};
        st.checked = false;
        ctx.save();
        ctx.shown("round");
      }

      function draw() {
        const r = activity.rounds[st.cur];
        let h = '<div class="pp-tiny pp-muted">' + esc(activity.lead || "Grade these students’ definitions of:") + '</div><div class="pp-term">' + esc(r.term) + "</div>";
        h += '<div class="pp-students">' + st.ord.map((ai, k) => {
          const a = r.answers[ai];
          return '<div class="pp-student"><div class="pp-student-id">' + AVATAR + "<b>" + esc(st.names[k]) + '</b></div><p class="pp-student-answer">' + esc(a.text) + "</p>" +
            '<div class="pp-grades" role="group" aria-label="Grade for ' + esc(st.names[k]) + '">' + ["A", "A-", "F"].map((g) =>
              '<button type="button" data-a="' + ai + '" data-g="' + g + '" aria-pressed="' + (st.picks[ai] === g) + '"' + (st.checked ? " disabled" : "") + ">" + grade(g) + "</button>").join("") + "</div></div>";
        }).join("") + "</div>";
        if (st.checked) {
          h += '<div class="pp-grade-feedback" role="status">' + st.ord.map((ai, k) => {
            const a = r.answers[ai], ok = st.picks[ai] === a.grade;
            return '<div class="pp-result ' + (ok ? "pp-ok" : "pp-no") + '"><b>' + esc(st.names[k]) + ": " + (ok ? "Right, " + grade(a.grade) + "." : "This one earns " + grade(a.grade) + ".") + "</b> " + esc(a.why) + "</div>";
          }).join("") + "</div>";
        }
        const n = Object.keys(st.picks).length;
        h += '<div class="pp-actions"><button type="button" class="pp-primary" id="pp-go"' + (!st.checked && n < r.answers.length ? " disabled" : "") + ">" +
          (st.checked ? "Grade another group" : "Check all three grades") + "</button></div>";
        host.innerHTML = h;
        host.querySelectorAll("[data-g]").forEach((b) => (b.onclick = () => { st.picks[b.dataset.a] = b.dataset.g; ctx.save(); draw(); }));
        host.querySelector("#pp-go").onclick = () => {
          if (!st.checked) {
            st.checked = true;
            r.answers.forEach((a, ai) => {
              const g = st.picks[ai], right = g === a.grade;
              ctx.record(r, {
                key: "round", correct: right,
                resp: { answer: ai, grade: g, pos: st.ord.indexOf(ai) },
                misc: [!right && a.misconception ? a.misconception : null]
              });
            });
            ctx.count(); ctx.save(); draw(); return;
          }
          newRound();
          if (!ctx.roundDone()) draw();
        };
        ctx.resized();
      }
      draw();
    }
  });
})(window.PP);
