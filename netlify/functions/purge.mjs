import { getStore } from "@netlify/blobs";

const KEEP_DAYS = 425;

export default async () => {
  const store = getStore("analytics");
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86400000).toISOString().slice(0, 10);
  const { directories } = await store.list({ directories: true, prefix: "e/" });

  let deleted = 0;
  for (const dir of directories || []) {
    const match = /(\d{4}-\d{2}-\d{2})/.exec(dir);
    if (!match || match[1] >= cutoff) continue;
    const { blobs } = await store.list({ prefix: `e/${match[1]}/` });
    for (let i = 0; i < blobs.length; i += 25) {
      await Promise.all(blobs.slice(i, i + 25).map((b) => store.delete(b.key)));
    }
    deleted += blobs.length;
  }
  console.log(`analytics purge: removed ${deleted} records older than ${cutoff}`);
};

export const config = { schedule: "@daily" };
