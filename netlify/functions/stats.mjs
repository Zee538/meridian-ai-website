import { getStore } from "@netlify/blobs";
import { json, readCookie, verify } from "../lib/auth.mjs";
import { aggregate, dayOf } from "../lib/events.mjs";

export default async (req) => {
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const secret = process.env.SESSION_SECRET;
  if (!secret || !(await verify(secret, readCookie(req)))) return json({ error: "unauthorized" }, 401);

  const asked = parseInt(new URL(req.url).searchParams.get("days") || "7", 10);
  const days = Math.min(90, Math.max(1, Number.isFinite(asked) ? asked : 7));

  const dates = [];
  for (let i = days - 1; i >= 0; i--) dates.push(dayOf(new Date(Date.now() - i * 86400000)));

  const store = getStore({ name: "analytics", consistency: "strong" });
  const keysByDate = {};
  await Promise.all(
    dates.map(async (date) => {
      const { blobs } = await store.list({ prefix: `e/${date}/` });
      keysByDate[date] = blobs.map((b) => b.key);
    })
  );

  return json({ ...aggregate(dates, keysByDate), generatedAt: new Date().toISOString() });
};

export const config = { path: "/api/admin/stats" };
