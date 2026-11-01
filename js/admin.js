(function () {
  var $ = function (id) { return document.getElementById(id); };
  var loginView = $("login"), dashView = $("dash"), boot = $("boot"), logoutBtn = $("logout");
  var days = 7;

  function show(which) {
    boot.hidden = true;
    loginView.hidden = which !== "login";
    dashView.hidden = which !== "dash";
    logoutBtn.hidden = which !== "dash";
    document.title = (which === "dash" ? "Analytics" : "Developer login") + " | Meridian AI Solutions";
    if (which === "login") $("password").focus();
  }

  function setMsg(text, info) {
    var m = $("loginMsg");
    m.textContent = text || "";
    m.className = "ad-msg" + (info ? " is-info" : "");
  }

  function fmt(n) { return Number(n).toLocaleString("en-US"); }

  function shortDate(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }

  function niceMax(v) {
    if (v <= 4) return 4;
    var pow = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / pow;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * pow;
  }

  var NS = "http://www.w3.org/2000/svg";
  function svgEl(name, attrs, text) {
    var el = document.createElementNS(NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (text != null) el.textContent = text;
    return el;
  }

  function drawChart(list) {
    var box = $("chart");
    box.textContent = "";
    var W = 800, H = 260, L = 44, R = 8, T = 10, B = 28;
    var plotW = W - L - R, plotH = H - T - B;
    var max = niceMax(Math.max.apply(null, list.map(function (d) { return d.views; }).concat([1])));
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Daily page views and visitors" });

    [0, 0.5, 1].forEach(function (f) {
      var y = T + plotH - plotH * f;
      svg.appendChild(svgEl("line", { x1: L, x2: W - R, y1: y, y2: y, stroke: "rgba(255,255,255,0.07)", "stroke-width": 1 }));
      svg.appendChild(svgEl("text", { x: L - 8, y: y + 4, "text-anchor": "end" }, fmt(Math.round(max * f))));
    });

    var slot = plotW / list.length;
    var bw = Math.max(2, Math.min(34, slot * 0.7));
    list.forEach(function (d, i) {
      var cx = L + slot * i + slot / 2;
      var hv = (d.views / max) * plotH, hu = (d.visitors / max) * plotH;
      var tip = shortDate(d.date) + ": " + fmt(d.views) + " views, " + fmt(d.visitors) + " visitors";
      var g = svgEl("g", {});
      g.appendChild(svgEl("title", {}, tip));
      g.appendChild(svgEl("rect", { x: cx - bw / 2, y: T + plotH - hv, width: bw, height: Math.max(hv, d.views ? 1 : 0), rx: 3, fill: "#8b6bff" }));
      g.appendChild(svgEl("rect", { x: cx - bw / 4, y: T + plotH - hu, width: bw / 2, height: Math.max(hu, d.visitors ? 1 : 0), rx: 2, fill: "#1fe0b0" }));
      g.appendChild(svgEl("rect", { x: cx - slot / 2, y: T, width: slot, height: plotH, fill: "transparent" }));
      svg.appendChild(g);
    });

    var idx = list.length > 2 ? [0, Math.floor((list.length - 1) / 2), list.length - 1] : list.map(function (_, i) { return i; });
    idx.forEach(function (i) {
      var cx = L + slot * i + slot / 2;
      var anchor = i === 0 ? "start" : i === list.length - 1 ? "end" : "middle";
      var x = i === 0 ? L : i === list.length - 1 ? W - R : cx;
      svg.appendChild(svgEl("text", { x: x, y: H - 6, "text-anchor": anchor }, shortDate(list[i].date)));
    });
    box.appendChild(svg);
  }

  var regionNames = null;
  try { regionNames = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) {}
  function countryName(code) {
    if (!code || code === "??") return "Unknown";
    try { return (regionNames && regionNames.of(code)) || code; } catch (e) { return code; }
  }
  var deviceNames = { mobile: "Phone", tablet: "Tablet", desktop: "Desktop", unknown: "Unknown" };

  function fillList(id, items, label) {
    var ul = $(id);
    ul.textContent = "";
    if (!items.length) {
      var li = document.createElement("li");
      var p = document.createElement("p");
      p.className = "ad-none";
      p.textContent = "Nothing yet.";
      li.appendChild(p);
      ul.appendChild(li);
      return;
    }
    var max = items[0].v || 1;
    items.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "ad-row";
      li.style.setProperty("--pct", Math.max(4, Math.round((it.v / max) * 100)) + "%");
      var a = document.createElement("span");
      a.textContent = label(it.k);
      var b = document.createElement("span");
      b.textContent = fmt(it.v);
      li.appendChild(a);
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  function render(d) {
    $("kViews").textContent = fmt(d.totals.views);
    $("kVisitors").textContent = fmt(d.totals.visitors);
    $("kRatio").textContent = d.totals.visitors ? (d.totals.views / d.totals.visitors).toFixed(1) : "0";
    $("empty").hidden = d.totals.views > 0;
    drawChart(d.days);
    fillList("lPages", d.pages, function (k) { return k; });
    fillList("lRefs", d.referrers, function (k) { return k; });
    fillList("lCountries", d.countries, countryName);
    fillList("lDevices", d.devices, function (k) { return deviceNames[k] || k; });
    $("updated").textContent = "Updated " + new Date(d.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  function load() {
    return fetch("/api/admin/stats?days=" + days, { credentials: "same-origin", cache: "no-store" })
      .then(function (r) {
        if (r.status === 401) { show("login"); return null; }
        if (!r.ok) throw new Error("status " + r.status);
        return r.json();
      })
      .then(function (d) { if (d) { render(d); show("dash"); } })
      .catch(function () {
        show("login");
        setMsg("Couldn't load the analytics. Please try again in a moment.");
      });
  }

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("loginBtn");
    btn.disabled = true;
    setMsg("Checking…", true);
    fetch("/api/admin/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: $("password").value })
    }).then(function (r) {
      if (r.ok) { $("password").value = ""; setMsg(""); return load(); }
      if (r.status === 401) setMsg("That password isn't right.");
      else if (r.status === 429) setMsg("Too many attempts. Please wait 15 minutes and try again.");
      else if (r.status === 503) setMsg("Login isn't set up yet. The site owner needs to add the ADMIN_PASSWORD and SESSION_SECRET settings in Netlify.");
      else setMsg("Something went wrong. Please try again.");
    }).catch(function () {
      setMsg("Couldn't reach the server. Check your connection and try again.");
    }).then(function () { btn.disabled = false; });
  });

  logoutBtn.addEventListener("click", function () {
    fetch("/api/admin/logout", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: "{}" })
      .then(function () { setMsg(""); show("login"); });
  });

  [].forEach.call(document.querySelectorAll(".ad-chip"), function (chip) {
    chip.addEventListener("click", function () {
      days = parseInt(chip.getAttribute("data-days"), 10);
      [].forEach.call(document.querySelectorAll(".ad-chip"), function (c) { c.classList.toggle("is-on", c === chip); });
      load();
    });
  });

  var ignore = $("ignoreMe");
  try { ignore.checked = localStorage.getItem("mh_ignore") === "1"; } catch (e) {}
  ignore.addEventListener("change", function () {
    try {
      if (ignore.checked) localStorage.setItem("mh_ignore", "1");
      else localStorage.removeItem("mh_ignore");
    } catch (e) {}
  });

  load();
})();
