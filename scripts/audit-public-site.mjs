// Read-only production check; also accepts a staging URL as the first argument.
const base = new URL(process.argv[2] ?? "https://www.pathible.com");
const errors = [];
async function read(path) {
  const response = await fetch(new URL(path, base), {
    headers: { "User-Agent": "Googlebot" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.text();
}
try {
  const sitemap = await read("/sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  const articles = urls.filter((url) => url.pathname.startsWith("/learn/"));
  if (!articles.length) errors.push("Sitemap contains no published articles");
  for (const url of articles) {
    try {
      const html = await read(url.pathname);
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
      if (!title || /article not found/i.test(title))
        errors.push(`${url.pathname}: missing or incorrect title`);
      if (!html.includes("<article"))
        errors.push(`${url.pathname}: no article in server-rendered HTML`);
    } catch (error) {
      errors.push(error.message);
    }
  }
  const missing = await fetch(new URL("/learn/public-audit-missing-article", base), {
    headers: { "User-Agent": "Googlebot" },
    signal: AbortSignal.timeout(20000),
  });
  if (missing.status !== 404)
    errors.push(`Missing article returns HTTP ${missing.status}, expected 404`);
  const unsubscribe = await fetch(new URL("/unsubscribe", base), {
    signal: AbortSignal.timeout(20000),
  });
  if (!unsubscribe.ok) errors.push(`Email preferences link returns HTTP ${unsubscribe.status}`);
  console.log(`Checked ${articles.length} sitemap articles at ${base.origin}`);
} catch (error) {
  errors.push(error.message);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Public content checks passed");
