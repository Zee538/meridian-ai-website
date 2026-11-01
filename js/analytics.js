(function () {
  var host = location.hostname;
  if (host !== "meridian-aisolutions.com" && host !== "www.meridian-aisolutions.com") return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return;
  try {
    if (localStorage.getItem("mh_ignore") === "1") return;
  } catch (e) {}

  var path = location.pathname;
  if (path.indexOf("/admin") === 0) return;

  var body = JSON.stringify({ p: path, r: document.referrer || "", w: window.innerWidth || 0 });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/collect", new Blob([body], { type: "text/plain" }))) return;
  } catch (e) {}
  try {
    fetch("/api/collect", { method: "POST", body: body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(function () {});
  } catch (e) {}
})();
