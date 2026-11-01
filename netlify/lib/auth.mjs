// Session signing and password helpers. Pure Web Crypto, no Node-only APIs.

export const COOKIE_NAME = "mh_admin";
export const SESSION_SECONDS = 8 * 60 * 60;

const enc = new TextEncoder();
const dec = new TextDecoder();

function bytesToB64Url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBytes(s) {
  let t = String(s).replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacBytes(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hmacHex(secret, message) {
  const bytes = await hmacBytes(secret, message);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Compares two strings without leaking where they differ: both are hashed to a fixed length first.
export async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([hmacBytes("meridian-compare", String(a)), hmacBytes("meridian-compare", String(b))]);
  return bytesEqual(ha, hb);
}

export async function sign(secret, payload) {
  const body = bytesToB64Url(enc.encode(JSON.stringify(payload)));
  const sig = bytesToB64Url(await hmacBytes(secret, body));
  return `${body}.${sig}`;
}

// Returns the payload when the token is genuine and unexpired, otherwise null.
export async function verify(secret, token, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (typeof token !== "string" || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  let given;
  try {
    given = b64UrlToBytes(parts[1]);
  } catch {
    return null;
  }
  const expected = await hmacBytes(secret, parts[0]);
  if (!bytesEqual(given, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(dec.decode(b64UrlToBytes(parts[0])));
  } catch {
    return null;
  }
  if (!payload || typeof payload.exp !== "number" || payload.exp <= nowSeconds) return null;
  return payload;
}

export function readCookie(req, name = COOKIE_NAME) {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function sessionCookie(token, maxAgeSeconds) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
}

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extraHeaders },
  });
}
