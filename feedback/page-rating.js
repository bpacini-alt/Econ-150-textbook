/* Anonymous one-tap ratings for textbook pages. */
(function () {
  "use strict";

  function init(root) {
    var book = root.getAttribute("data-book");
    var page = root.getAttribute("data-page");
    var endpoint = root.getAttribute("data-endpoint") || "/api/ratings";
    var reading = "page-" + page;
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-page-rating-value]"));
    var status = root.querySelector("[data-page-rating-status]");
    var busy = false;

    if (!book || !page || buttons.length !== 4 || !status) return;

    function ratingUrl(extra) {
      var params = ["book=" + encodeURIComponent(book)];
      Object.keys(extra || {}).forEach(function (key) {
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(extra[key]));
      });
      return endpoint + "?" + params.join("&");
    }

    function paint(value) {
      buttons.forEach(function (button) {
        var selected = Number(button.getAttribute("data-page-rating-value")) === Number(value);
        button.setAttribute("aria-pressed", String(selected));
      });
      if (value) status.textContent = "Your rating: " + value + " / 4";
    }

    function parse(response) {
      if (!response.ok) throw new Error("rating request failed");
      return response.json();
    }

    fetch(ratingUrl({ mine: "1" }), { credentials: "same-origin" })
      .then(parse)
      .then(function (data) {
        var ratings = data && data.ratings || {};
        if (ratings[reading]) paint(ratings[reading]);
      })
      .catch(function () {
        /* Ratings are optional; the page remains fully usable. */
      });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (busy) return;
        busy = true;
        var value = Number(button.getAttribute("data-page-rating-value"));
        buttons.forEach(function (item) { item.disabled = true; });
        status.textContent = "Saving…";
        fetch(endpoint, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book: book, reading: reading, rating: value })
        })
          .then(parse)
          .then(function (data) {
            paint(data && data.yourRating ? data.yourRating : value);
            status.textContent = "Saved. Thanks.";
          })
          .catch(function () {
            status.textContent = "Ratings are unavailable right now.";
          })
          .then(function () {
            busy = false;
            buttons.forEach(function (item) { item.disabled = false; });
          });
      });
    });
  }

  document.querySelectorAll("[data-page-rating]").forEach(init);
})();
