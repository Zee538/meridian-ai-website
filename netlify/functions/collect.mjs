import { getStore } from "@netlify/blobs";
import { hmacHex } from "../lib/auth.mjs";
import { buildKey, cleanPath, cleanReferrer, dayOf, deviceFor } from "../lib/events.mjs";

const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python|monitor|uptime|pingdom/i;

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOTS.test(ua)) return new Response(null, { status: 204 });

  let data;
  try {
    const raw = await req.text();
    if (raw.length > 2000) return new Response(null, { status: 413 });
    data = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = cleanPath(data && data.p);
  if (!path) return new Response(null, { status: 204 });

  const now = new Date();
  const day = dayOf(now);
  const secret = process.env.SESSION_SECRET || "";
  const ip = context.ip || req.headers.get("x-nf-client-connection-ip") || "";
  // Anonymous daily code: changes every day, and the IP itself is never stored.
  const visitor = secret ? (await hmacHex(secret, `${day}|${ip}|${ua}`)).slice(0, 16) : "";

  const key = buildKey({
    day,
    ts: now.getTime(),
    rand: Math.random().toString(36).slice(2, 6),
    path,
    ref: cleanReferrer(data.r),
    cc: ((context.geo && context.geo.country && context.geo.country.code) || "??").toUpperCase().slice(0, 2),
    device: deviceFor(data.w),
    visitor,
  });

  await getStore("analytics").set(key, "1");
  return new Response(null, { status: 204 });
};

export const config = {
  path: "/api/collect",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
