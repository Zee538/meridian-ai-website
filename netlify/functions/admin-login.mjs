import { getStore } from "@netlify/blobs";
import { SESSION_SECONDS, hmacHex, json, safeEqual, sessionCookie, sign } from "../lib/auth.mjs";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(req.headers.get("content-type") || "").includes("application/json")) return json({ error: "bad_request" }, 415);

  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret || secret.length < 32) return json({ error: "not_configured" }, 503);

  const ip = context.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
  const store = getStore({ name: "auth", consistency: "strong" });
  const key = `fails/${await hmacHex(secret, `ip:${ip}`)}`;
  const now = Date.now();
  const record = (await store.get(key, { type: "json" })) || { n: 0, t: now };

  if (record.n >= MAX_FAILS && now - record.t < LOCK_MS) {
    const wait = Math.ceil((LOCK_MS - (now - record.t)) / 1000);
    return json({ error: "locked" }, 429, { "retry-after": String(wait) });
  }

  let attempt = "";
  try {
    const body = await req.json();
    if (body && typeof body.password === "string") attempt = body.password.slice(0, 200);
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  const ok = attempt.length > 0 && (await safeEqual(attempt, password));
  if (!ok) {
    const windowOver = now - record.t >= LOCK_MS;
    await store.setJSON(key, { n: windowOver ? 1 : record.n + 1, t: windowOver ? now : record.t });
    return json({ error: "invalid" }, 401);
  }

  await store.delete(key);
  const token = await sign(secret, { exp: Math.floor(now / 1000) + SESSION_SECONDS });
  return json({ ok: true }, 200, { "set-cookie": sessionCookie(token, SESSION_SECONDS) });
};

export const config = {
  path: "/api/admin/login",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
