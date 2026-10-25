import {writeFile} from "node:fs/promises";
import {SITE_URL, docsRoot} from "./site-config.mjs";
import {buildLibrary} from "./library/build.mjs";
import {buildHomer} from "./homer/build.mjs";

const sitemap = [
  ...await buildLibrary(SITE_URL, docsRoot),
  ...await buildHomer(new URL("homer/", SITE_URL).href, `${docsRoot}homer/`, SITE_URL)
];
const escape = value => String(value).replace(/[&<>"']/g, character => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[character]);
await writeFile(`${docsRoot}sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(url => `  <url><loc>${escape(url)}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log(`Built ${sitemap.length} static pages and sitemap.xml for ${SITE_URL}`);
