(function () {
  "use strict";

  var chapters = [
    { file: "introduction.html", label: "Introduction" },
    { file: "how-to-get-the-most-out-of-this-book.html", label: "How to Get the Most Out of This Book" },
    { file: "Chapter0.html", label: "Chapter 0" },
    { file: "Chapter1.html", label: "Chapter 1" },
    { file: "Chapter2.html", label: "Chapter 2" },
    { file: "Chapter3.html", label: "Chapter 3" },
    { file: "Chapter4.html", label: "Chapter 4" },
    { file: "Chapter5.html", label: "Chapter 5" },
    { file: "Chapter6.html", label: "Chapter 6" },
    { file: "Chapter7.html", label: "Chapter 7" },
    { file: "Chapter8.html", label: "Chapter 8" },
    { file: "Chapter9.html", label: "Chapter 9" },
    { file: "Chapter10.html", label: "Chapter 10" },
    { file: "Chapter11.html", label: "Chapter 11" },
    { file: "Chapter12.html", label: "Chapter 12" },
    { file: "Chapter13.html", label: "Chapter 13" },
    { file: "Chapter14.html", label: "Chapter 14" },
    { file: "Chapter15.html", label: "Chapter 15" },
    { file: "Chapter16.html", label: "Chapter 16" },
    { file: "Chapter17.html", label: "Chapter 17" },
    { file: "Chapter18.html", label: "Chapter 18" },
    { file: "Chapter19.html", label: "Chapter 19" },
    { file: "Chapter20.html", label: "Chapter 20" },
    { file: "Chapter21.html", label: "Chapter 21" },
    { file: "Chapter22.html", label: "Chapter 22" },
    { file: "Chapter23.html", label: "Chapter 23" },
    { file: "Chapter24.html", label: "Chapter 24" },
    { file: "Chapter25.html", label: "Chapter 25" },
    { file: "Chapter26.html", label: "Chapter 26" }
  ];

  // Cloudflare serves pages at clean addresses (/Chapter3, not /Chapter3.html), so compare names without ".html".
  function pageName(name) { return (name || "index.html").toLowerCase().replace(/\.html$/, ""); }
  var current = pageName(window.location.pathname.split("/").pop());
  var index = -1;
  chapters.forEach(function (chapter, i) {
    if (pageName(chapter.file) === current) index = i;
  });
  if (index < 0) return;

  function init() {
    if (!document.body || document.querySelector(".etb-nav")) return;

    var style = document.createElement("style");
    style.textContent = [
      ".etb-nav{position:fixed;left:0;right:0;bottom:0;z-index:1000;background:rgba(255,255,255,.97);border-top:1px solid #dce3ea;box-shadow:0 -1px 5px rgba(26,58,92,.12);backdrop-filter:blur(8px);font-family:Arial,sans-serif}",
      "body{padding-bottom:60px!important}",
      "body:has(.etb-nav) .etb-ap{bottom:51px}",  /* the audio player docks just above this bar instead of covering it */
      ".etb-nav-inner{max-width:740px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px}",
      ".etb-nav a,.etb-nav span{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 11px;border:1px solid #d6e0e8;border-radius:6px;color:#1a3a5c;background:#fff;font-size:12px;font-weight:700;text-decoration:none;white-space:nowrap}",
      ".etb-nav a:hover,.etb-nav a:focus{background:#eef4fb;border-color:#9aaebe;outline:none}",
      ".etb-nav .etb-nav-home{border-color:#1a3a5c;background:#1a3a5c;color:#fff}",
      ".etb-nav .etb-nav-home:hover,.etb-nav .etb-nav-home:focus{background:#274e70;color:#fff}",
      ".etb-nav .etb-nav-disabled{color:#aab4bd;background:#f7f9fb;border-color:#e5eaee}",
      "@media(max-width:620px){.etb-nav-inner{padding:7px 8px;gap:6px}.etb-nav a,.etb-nav span{min-height:32px;padding:0 8px;font-size:11px}.etb-nav .etb-nav-label{display:none}}"
    ].join("");
    document.head.appendChild(style);

    var previous = index > 0
      ? '<a href="' + chapters[index - 1].file + '" aria-label="Go to ' + chapters[index - 1].label + '">← Previous</a>'
      : '<span class="etb-nav-disabled" aria-disabled="true">← Previous</span>';
    var next = index < chapters.length - 1
      ? '<a href="' + chapters[index + 1].file + '" aria-label="Go to ' + chapters[index + 1].label + '">Next →</a>'
      : '<span class="etb-nav-disabled" aria-disabled="true">Next →</span>';

    var nav = document.createElement("nav");
    nav.className = "etb-nav";
    nav.setAttribute("aria-label", "Textbook chapter navigation");
    nav.innerHTML = '<div class="etb-nav-inner">' +
      previous +
      '<a class="etb-nav-home" href="/contents/index.html" aria-label="Table of contents">Contents</a>' +
      next +
      "</div>";
    document.body.insertBefore(nav, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();