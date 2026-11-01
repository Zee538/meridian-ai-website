import { json, sessionCookie } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(req.headers.get("content-type") || "").includes("application/json")) return json({ error: "bad_request" }, 415);
  return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
};

export const config = { path: "/api/admin/logout" };
