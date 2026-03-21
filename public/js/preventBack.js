window.addEventListener('pageshow', function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    if (document.referrer.includes("checkout.stripe.com")) {
      window.location.href = "/donation-cancelled";
    }
  }
});
