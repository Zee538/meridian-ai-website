// Analytics events are stored as blob KEYS (no values to fetch), so a dashboard
// read is one list call per day. Fields are base64url-encoded and joined with "~".

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toB64Url(str) {
  const bytes = enc.encode(String(str));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromB64Url(s) {
  let t = String(s).replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return dec.decode(out);
}

const OWN_HOST = /(^|\.)meridian-aisolutions\.com$/;

// Returns a normalised path, or null when the visit shouldn't be recorded.
export function cleanPath(p) {
  if (typeof p !== "string") return null;
  let path = p.split("?")[0].split("#")[0];
  if (!path.startsWith("/") || path.length > 120 || /[\u0000-\u001f]/.test(path)) return null;
  path = path.replace(/\/index\.html$/, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/") || path.startsWith("/.netlify")) return null;
  return path;
}

// Referrer reduced to a bare hostname; own site and preview URLs count as direct.
export function cleanReferrer(r) {
  if (typeof r !== "string" || !r) return "";
  try {
    const host = new URL(r).hostname.toLowerCase().replace(/^www\./, "");
    if (!host || host.length > 80) return "";
    if (OWN_HOST.test(host) || host.endsWith(".netlify.app")) return "";
    return host;
  } catch {
    return "";
  }
}

export function deviceFor(width) {
  const w = Number(width) || 0;
  if (w <= 0) return "unknown";
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function dayOf(date) {
  return date.toISOString().slice(0, 10);
}

export function buildKey({ day, ts, rand, path, ref, cc, device, visitor }) {
  return `e/${day}/${ts}${rand}~${toB64Url(path)}~${toB64Url(ref)}~${cc}~${device}~${visitor}`;
}

export function parseKey(key) {
  const m = /^e\/(\d{4}-\d{2}-\d{2})\/([^~]*)~([^~]*)~([^~]*)~([^~]*)~([^~]*)~([^~]*)$/.exec(String(key));
  if (!m) return null;
  try {
    return { day: m[1], path: fromB64Url(m[3]), ref: fromB64Url(m[4]), cc: m[5], device: m[6], visitor: m[7] };
  } catch {
    return null;
  }
}

function bump(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function top(map, n) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, n)
    .map(([k, v]) => ({ k, v }));
}

// dates: ascending list of YYYY-MM-DD. keysByDate: { date: [blob keys] }.
export function aggregate(dates, keysByDate) {
  const pages = new Map();
  const refs = new Map();
  const countries = new Map();
  const devices = new Map();
  const days = [];
  let views = 0;
  let visitors = 0;

  for (const date of dates) {
    const seen = new Set();
    let dayViews = 0;
    let anonymous = 0;
    for (const key of keysByDate[date] || []) {
      const e = parseKey(key);
      if (!e) continue;
      dayViews++;
      if (e.visitor) seen.add(e.visitor);
      else anonymous++;
      bump(pages, e.path);
      bump(refs, e.ref || "(direct)");
      bump(countries, e.cc || "??");
      bump(devices, e.device || "unknown");
    }
    const dayVisitors = seen.size + anonymous;
    days.push({ date, views: dayViews, visitors: dayVisitors });
    views += dayViews;
    visitors += dayVisitors;
  }

  return {
    days,
    totals: { views, visitors },
    pages: top(pages, 10),
    referrers: top(refs, 10),
    countries: top(countries, 10),
    devices: top(devices, 4),
  };
}
