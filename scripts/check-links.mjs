// Link check for the built site. Plain Node, no dependencies.
// Usage: node scripts/check-links.mjs [baseUrl]   (default http://localhost:3000)
//
// Internal links, assets and in-page anchors must resolve (2xx/3xx, anchor id present) or the run fails.
// External links are listed and probed; failures there are warnings only, because the sandbox may block them.

const base = new URL(process.argv[2] ?? "http://localhost:3000");
const PAGES = ["/", "/website-design", "/ai-agents-automation", "/claude-integration", "/ai-teaching", "/privacy"];
const EXTERNAL_TIMEOUT_MS = 10_000;
const INTERNAL_TIMEOUT_MS = 20_000;

const errors = [];
const warnings = [];
const pageCache = new Map(); // path -> html (or null when the page itself failed)

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Collect href="..." and src="..." values from HTML.
function extractUrls(html) {
  const out = [];
  const re = /\s(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(html))) out.push(decodeEntities(m[2] ?? m[3] ?? ""));
  return out;
}

function extractIds(html) {
  const ids = new Set();
  const re = /\sid\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(html))) ids.add(m[1] ?? m[2] ?? "");
  return ids;
}

async function fetchWithTimeout(url, { method = "GET", timeoutMs }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { method, redirect: "manual", signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getPage(path) {
  if (pageCache.has(path)) return pageCache.get(path);
  const url = new URL(path, base).toString();
  let html = null;
  try {
    const res = await fetchWithTimeout(url, { timeoutMs: INTERNAL_TIMEOUT_MS });
    if (res.status >= 200 && res.status < 300) html = await res.text();
    else errors.push(`${url} -> HTTP ${res.status} (page)`);
  } catch (err) {
    errors.push(`${url} -> ${err.message} (page)`);
  }
  pageCache.set(path, html);
  return html;
}

// Resolve a target to { url, path, hash } when it points at this site; null when it is external or not a web link.
function classify(raw, fromPath) {
  if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) return null;
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return null;
  let u;
  try {
    u = new URL(raw, new URL(fromPath, base));
  } catch {
    return { invalid: true, raw };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (u.origin === base.origin) return { internal: true, url: u, raw };
  return { internal: false, url: u, raw };
}

const internalSeen = new Map(); // full url -> status string
const externalSeen = new Map(); // full url -> { status, where }

async function checkInternal(target, where) {
  const { url } = target;
  const key = url.toString();

  // Plain resource or page: request it (once per distinct URL).
  if (!internalSeen.has(key)) {
    try {
      let res = await fetchWithTimeout(key, { method: "HEAD", timeoutMs: INTERNAL_TIMEOUT_MS });
      // Some dev/static servers reject HEAD; retry with GET before calling it broken.
      if (res.status === 405 || res.status === 501) res = await fetchWithTimeout(key, { timeoutMs: INTERNAL_TIMEOUT_MS });
      if (res.status >= 200 && res.status < 400) internalSeen.set(key, "ok");
      else {
        internalSeen.set(key, `HTTP ${res.status}`);
        errors.push(`${key} -> HTTP ${res.status} (linked from ${where})`);
      }
    } catch (err) {
      internalSeen.set(key, err.message);
      errors.push(`${key} -> ${err.message} (linked from ${where})`);
    }
  } else if (internalSeen.get(key) !== "ok") {
    // Already reported; nothing more to add.
    return;
  }

  // In-page anchor: the id must exist on the target page.
  if (url.hash && url.hash.length > 1) {
    const id = decodeURIComponent(url.hash.slice(1));
    const targetPath = url.pathname;
    const html = await getPage(targetPath);
    if (html !== null && !extractIds(html).has(id)) {
      errors.push(`${key} -> no element with id="${id}" on ${targetPath} (linked from ${where})`);
    }
  }
}

async function checkExternal(url, where) {
  const key = url.toString();
  if (externalSeen.has(key)) {
    externalSeen.get(key).where.add(where);
    return;
  }
  const entry = { status: "pending", where: new Set([where]) };
  externalSeen.set(key, entry);
  try {
    let res = await fetchWithTimeout(key, { method: "HEAD", timeoutMs: EXTERNAL_TIMEOUT_MS });
    if (res.status === 405 || res.status === 403 || res.status >= 400) {
      res = await fetchWithTimeout(key, { timeoutMs: EXTERNAL_TIMEOUT_MS });
    }
    entry.status = res.status >= 200 && res.status < 400 ? `ok (${res.status})` : `HTTP ${res.status}`;
    if (!(res.status >= 200 && res.status < 400)) warnings.push(`${key} -> HTTP ${res.status} (linked from ${[...entry.where].join(", ")})`);
  } catch (err) {
    entry.status = `unreachable: ${err.name === "AbortError" ? "timeout" : err.message}`;
    warnings.push(`${key} -> ${entry.status} (linked from ${[...entry.where].join(", ")})`);
  }
}

async function main() {
  console.log(`Checking ${base.origin} across ${PAGES.length} pages\n`);

  const links = []; // { target, where }
  for (const path of PAGES) {
    const html = await getPage(path);
    if (html === null) continue;
    for (const raw of extractUrls(html)) {
      const target = classify(raw, path);
      if (!target) continue;
      if (target.invalid) {
        errors.push(`invalid URL "${raw}" (on ${path})`);
        continue;
      }
      links.push({ target, where: path, raw });
    }
  }

  const internal = links.filter((l) => l.target.internal);
  const external = links.filter((l) => !l.target.internal);

  console.log(`Internal links/assets: ${new Set(internal.map((l) => l.target.url.toString())).size} distinct`);
  for (const l of internal) {
    // Sequential on purpose: keeps the dev/prod server calm and the output ordered.
    await checkInternal(l.target, l.where);
  }

  const externalUnique = [...new Set(external.map((l) => l.target.url.toString()))];
  console.log(`External links: ${externalUnique.length} distinct (probed, warnings only)`);
  for (const l of external) await checkExternal(l.target.url, l.where);

  console.log("\nExternal links:");
  for (const [url, e] of externalSeen) console.log(`  ${e.status.padEnd(28)} ${url}`);

  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);

  console.log(`\nErrors (${errors.length}):`);
  for (const e of errors) console.log(`  x ${e}`);

  if (errors.length) {
    console.log("\nLink check FAILED.");
    process.exit(1);
  }
  console.log("\nLink check passed: no broken internal links or anchors.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
