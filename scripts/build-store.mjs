import {cp, mkdir, readdir, readFile, rm, writeFile} from "node:fs/promises";
import {join, resolve, extname} from "node:path";
import {fileURLToPath} from "node:url";
import {books} from "./library/books.mjs";
import {buildLibrary} from "./library/build.mjs";
import {buildPricing} from "./library/pricing.mjs";
import {products} from "../server/catalog.mjs";
import {page, offerContent, decorateReader} from "../server/html.mjs";
import {SITE_URL, docsRoot} from "./site-config.mjs";

if (new URL(SITE_URL).pathname !== "/") throw new Error("The store must be deployed at the root of its domain.");
const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
await mkdir(root, {recursive: true});
for (const folder of ["public", "private"]) {
  await rm(join(root, folder), {recursive: true, force: true});
  await mkdir(join(root, folder), {recursive: true});
}
const publicRoot = join(root, "public"), privateRoot = join(root, "private");
await cp(join(docsRoot, "homer"), join(publicRoot, "homer"), {recursive: true});
await cp(join(docsRoot, "library.css"), join(publicRoot, "library.css"));
await cp(new URL("../server/store.css", import.meta.url), join(publicRoot, "store.css"));

async function copyAssets(from, to) {
  await mkdir(to, {recursive: true});
  for (const entry of await readdir(from, {withFileTypes: true})) {
    const source = join(from, entry.name), target = join(to, entry.name);
    if (entry.isDirectory()) await copyAssets(source, target);
    else if ([".css", ".js", ".png", ".svg", ".jpg", ".webp", ".ttf", ".woff", ".woff2", ".txt"].includes(extname(entry.name))) await cp(source, target);
  }
}

const catalog = {books: books.map(({theme, parts, ...book}) => book), products: products.map(product => ({...product, title: product.title || books.find(book => book.id === product.id).title}))};
const bundle = catalog.products.find(product => product.id === "collection");
const publicUrls = [SITE_URL];
for (const product of catalog.products.filter(product => product.samplePath)) {
  const book = books.find(book => book.id === product.id);
  await cp(join(docsRoot, book.path), join(privateRoot, book.path), {recursive: true});
  await copyAssets(join(docsRoot, book.path), join(publicRoot, book.path));
  const offerUrl = new URL(book.path, SITE_URL).href;
  const offer = page(book.title, offerContent(book, product, bundle), {description: book.description, canonical: offerUrl, noindex: false});
  await writeFile(join(publicRoot, book.path, "index.html"), offer);
  const sampleDir = join(publicRoot, book.path, product.samplePath);
  await mkdir(sampleDir, {recursive: true});
  const sample = await readFile(join(docsRoot, book.path, product.samplePath, "index.html"), "utf8");
  await writeFile(join(sampleDir, "index.html"), decorateReader(sample, {sample: true, book, product}));
  // Source bibliographies remain public so readers can assess the guide before buying.
  await cp(join(docsRoot, book.path, "sources"), join(publicRoot, book.path, "sources"), {recursive: true});
  publicUrls.push(offerUrl, new URL(`${book.path}${product.samplePath}`, SITE_URL).href, new URL(`${book.path}sources/`, SITE_URL).href);
}
await buildLibrary(SITE_URL, publicRoot, {products: catalog.products, salesEnabled: true});
publicUrls.push(...await buildPricing(SITE_URL, publicRoot, {salesEnabled: true}));
const originalSitemap = await readFile(join(docsRoot, "sitemap.xml"), "utf8");
publicUrls.push(...[...originalSitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]).filter(url => new URL(url).pathname.startsWith("/homer/")));
await writeFile(join(publicRoot, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(publicUrls)].map(url => `<url><loc>${url}</loc></url>`).join("")}</urlset>\n`);
await writeFile(join(publicRoot, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /account/\nDisallow: /checkout/\nDisallow: /payments/\nSitemap: ${new URL("sitemap.xml", SITE_URL).href}\n`);
await writeFile(join(root, "catalog.json"), JSON.stringify(catalog, null, 2));
console.log("Built storefront: Homer is free; three sample guides and source pages are public; full paid HTML is private.");
