/*
  Meridian contract portal: shared signing logic for every contract page.
  A contract page needs:
    - <body data-contract-id="..." data-contract-title="..." data-client-company="...">
    - the hidden Netlify form named "contract-signature" (copy it from the template)
    - #clientBody, #status, #statusText, #partyClientRep, #clauseRep and .repSync inputs
  On signing, the page submits the "contract-signature" Netlify form with the drawn
  signature as a PNG file. Netlify stores the submission and emails it to the
  addresses set in Netlify > Forms > Form notifications.
*/
(function () {
  var body = document.body;
  var CONTRACT_ID = body.getAttribute("data-contract-id") || "";
  var CONTRACT_TITLE = body.getAttribute("data-contract-title") || "Services Agreement";
  var DEFAULT_COMPANY = body.getAttribute("data-client-company") || "";
  var repName = "";
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(d) {
    try { return d.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" }); } catch (e) { return d.toISOString(); }
  }

  // Keep every first-and-last-name line in sync.
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (!t.classList || !t.classList.contains("repSync")) return;
    repName = t.value;
    Array.prototype.forEach.call(document.querySelectorAll(".repSync"), function (el) { if (el !== t) el.value = repName; });
  });

  function setClientName(n) {
    Array.prototype.forEach.call(document.querySelectorAll(".clientName"), function (el) { el.textContent = n; });
  }

  function makePad(canvas) {
    var ctx = canvas.getContext("2d"), drawing = false, dirty = false, last = null;
    function size() {
      var r = canvas.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(r.width * d));
      canvas.height = Math.max(1, Math.round(r.height * d));
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#0c201b";
      dirty = false;
    }
    function pt(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    canvas.addEventListener("pointerdown", function (e) {
      drawing = true; last = pt(e); canvas.setPointerCapture(e.pointerId);
      ctx.beginPath(); ctx.arc(last.x, last.y, 1.1, 0, Math.PI * 2); ctx.fillStyle = "#0c201b"; ctx.fill(); dirty = true;
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      var p = pt(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; dirty = true;
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { canvas.addEventListener(t, function () { drawing = false; }); });
    size();
    return {
      clear: size,
      isEmpty: function () { return !dirty; },
      toCanvas: function () {
        var w = canvas.width, h = canvas.height, img = ctx.getImageData(0, 0, w, h).data;
        var minX = w, minY = h, maxX = 0, maxY = 0;
        for (var y = 0; y < h; y += 2) for (var x = 0; x < w; x += 2) {
          if (img[(y * w + x) * 4 + 3] > 20) { if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
        }
        if (maxX <= minX || maxY <= minY) return null;
        var pad = 12; minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(w, maxX + pad); maxY = Math.min(h, maxY + pad);
        var cw = maxX - minX, ch = maxY - minY, scale = Math.min(1, 600 / cw, 180 / ch);
        var out = document.createElement("canvas"); out.width = Math.round(cw * scale); out.height = Math.round(ch * scale);
        var o = out.getContext("2d"); o.fillStyle = "#ffffff"; o.fillRect(0, 0, out.width, out.height);
        o.drawImage(canvas, minX, minY, cw, ch, 0, 0, out.width, out.height);
        return out;
      }
    };
  }

  function formHtml() {
    return '<label>Company legal name<input type="text" id="cCompany" autocomplete="organization" value="' + esc(DEFAULT_COMPANY) + '"></label>' +
      '<label>First and last name<input type="text" id="cName" class="repSync" autocomplete="name" placeholder="First and last name" value="' + esc(repName) + '"></label>' +
      '<label>Title<input type="text" id="cTitle" autocomplete="organization-title" placeholder="e.g. Owner, Director"></label>' +
      '<label>Email<input type="email" id="cEmail" autocomplete="email" placeholder="you@company.com"></label>' +
      '<div><label for="cPad">Signature</label><div class="pad-wrap"><canvas class="pad" id="cPad" aria-label="Draw your signature here"></canvas><span class="pad-line"></span><span class="pad-hint">Sign with your finger, stylus or mouse</span></div></div>' +
      '<label class="check"><input type="checkbox" id="cAgree"><span>I have read this agreement and agree to its terms on behalf of the company named above.</span></label>' +
      '<div class="row"><button class="btn-primary" id="cSign" type="button">Sign agreement</button><button class="btn-ghost" id="cClear" type="button">Clear signature</button></div>' +
      '<p class="msg" id="cMsg" aria-live="polite"></p>';
  }

  function showSigned(rec, sigUrl) {
    $("clientBody").innerHTML =
      '<div class="signed-sig"><img alt="Signature of ' + esc(rec.name) + '" src="' + sigUrl + '"></div>' +
      '<div class="signed-meta"><strong>' + esc(rec.name) + '</strong><br>' + esc(rec.title) + ', ' + esc(rec.company) +
      (rec.email ? '<br>' + esc(rec.email) : '') + '<br>Signed ' + esc(fmt(rec.when)) + '</div><span class="stamp">Signed</span>';
    $("partyClientRep").textContent = "Represented by " + rec.name + ", " + rec.title;
    $("clauseRep").textContent = rec.name;
    setClientName(rec.company);
    $("status").className = "status done";
    $("statusText").textContent = "Signed by the Client on " + fmt(rec.when) + ". Meridian will countersign and email the executed copy.";
    var a = $("actions"); a.innerHTML = "";
    var pb = document.createElement("button"); pb.type = "button"; pb.className = "btn-ghost"; pb.textContent = "Print or save as PDF";
    pb.addEventListener("click", function () { window.print(); });
    a.appendChild(pb);
    window.scrollTo({ top: $("clientCard").getBoundingClientRect().top + window.scrollY - 24, behavior: "smooth" });
  }

  function encodeForm(fields, file) {
    var fd = new FormData();
    Object.keys(fields).forEach(function (k) { fd.append(k, fields[k]); });
    if (file) fd.append("signature", file, file.name);
    return fd;
  }

  function init() {
    $("clientBody").innerHTML = formHtml();
    var pad = makePad($("cPad"));
    $("cClear").addEventListener("click", pad.clear);
    $("cCompany").addEventListener("input", function (e) { setClientName(e.target.value || DEFAULT_COMPANY); });
    $("cSign").addEventListener("click", function () {
      var msg = $("cMsg"); msg.textContent = "";
      var company = $("cCompany").value.trim(), name = $("cName").value.trim(), title = $("cTitle").value.trim(), email = $("cEmail").value.trim();
      if (!company) { msg.textContent = "Enter the company's legal name."; return; }
      if (!name || name.split(/\s+/).length < 2) { msg.textContent = "Enter your first and last name."; return; }
      if (!title) { msg.textContent = "Enter your title."; return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = "Enter a valid email so we can send you the signed copy."; return; }
      if (pad.isEmpty()) { msg.textContent = "Draw your signature in the box."; return; }
      if (!$("cAgree").checked) { msg.textContent = "Tick the box to confirm you agree to the terms."; return; }
      var sigCanvas = pad.toCanvas(); if (!sigCanvas) { msg.textContent = "Draw your signature in the box."; return; }
      var when = new Date();
      var btn = $("cSign"); btn.disabled = true; btn.textContent = "Sending…";
      sigCanvas.toBlob(function (blob) {
        var safe = (CONTRACT_ID || "contract").replace(/[^a-z0-9-]/gi, "");
        var file = new File([blob], "signature-" + safe + ".png", { type: "image/png" });
        var fields = {
          "form-name": "contract-signature",
          "bot-field": "",
          "contract-id": CONTRACT_ID,
          "contract-title": CONTRACT_TITLE,
          "contract-url": location.href.split("#")[0],
          "client-company": company,
          "client-name": name,
          "client-title": title,
          "client-email": email,
          "agreed": "Yes",
          "signed-at": when.toISOString(),
          "signed-at-local": fmt(when)
        };
        fetch("/", { method: "POST", body: encodeForm(fields, file) }).then(function (r) {
          if (!r.ok) throw new Error("status " + r.status);
          showSigned({ name: name, title: title, company: company, email: email, when: when }, sigCanvas.toDataURL("image/png"));
        }).catch(function () {
          btn.disabled = false; btn.textContent = "Sign agreement";
          msg.textContent = "We couldn't send your signature. Check your connection and try again, or email info@meridian-aisolutions.com.";
        });
      }, "image/png");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
