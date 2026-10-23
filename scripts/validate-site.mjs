import {readFile, readdir, stat} from "node:fs/promises";
import {join, resolve, sep} from "node:path";
import {chapters, characters, places} from "../docs/story.js";

const root = resolve(new URL("../docs/", import.meta.url).pathname);
const base = "https://alinazariii.github.io/iliad-odyssey/";
const pages = [];
async function walk(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name === "index.html") pages.push(path);
  }
}
await walk(root);
if (pages.length < 1 + chapters.length + characters.length + places.length + 5) throw new Error(`Too few generated pages: ${pages.length}`);
const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]));
if (sitemapUrls.size < 90) throw new Error(`Too few sitemap URLs: ${sitemapUrls.size}`);

for (const file of pages) {
  const html = await readFile(file, "utf8");
  const relative = file.slice(root.length + 1).replace(/index\.html$/, "");
  const url = new URL(relative, base).href;
  if (!html.includes(`<link rel="canonical" href="${url}">`)) throw new Error(`Wrong canonical: ${relative}`);
  if (!/<main id="main"[^>]*>[\s\S]*?<h1>/.test(html)) throw new Error(`Missing initial content: ${relative}`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) throw new Error(`Missing description: ${relative}`);
  if (!html.includes('property="og:image"')) throw new Error(`Missing image metadata: ${relative}`);
  if (!html.includes('<meta name="google-site-verification" content="q3r2SLr-4UNs_6PULPqjv8PYGrFdWRCT8ec3pYtZzxQ">')) throw new Error(`Missing Search Console verification: ${relative}`);
  const noindex = html.includes('name="robots" content="noindex, follow"');
  if (noindex === sitemapUrls.has(url)) throw new Error(`Sitemap and indexability disagree: ${relative}`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith("/iliad-odyssey/")) continue;
    const path = new URL(href, base).pathname.slice("/iliad-odyssey/".length);
    const target = resolve(root, path, path.endsWith("/") ? "index.html" : "");
    if (target !== root && !target.startsWith(root + sep)) throw new Error(`Unsafe link: ${href}`);
    try { await stat(target); } catch { throw new Error(`Broken internal link in ${relative}: ${href}`); }
  }
}
await stat(join(root, "share-cover.png"));
console.log(`Validated ${pages.length} HTML pages, ${sitemapUrls.size} sitemap URLs and internal links.`);
