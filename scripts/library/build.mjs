import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {books} from "./books.mjs";

const escape = value => String(value).replace(/[&<>"']/g, character => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[character]);
const faNum = value => String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);

const title = "پاورقی";
const tagline = "راهنمای خواندن کتاب‌های خوب";
const description = "پاورقی راهنمای فارسی خواندن کتاب‌های خوب است؛ بخش به بخش، با زمینهٔ داستان، شخصیت‌ها و نکته‌هایی که پیش از هر فصل باید بدانی.";

function card(book, index, basePath, offer, salesEnabled) {
  const href = offer ? `${basePath}products/${offer.id}/` : `${basePath}${book.path}`;
  const style = Object.entries(book.theme).map(([key, value]) => `--book-${key}:${value}`).join(";");
  return `<article class="book-card" style="${style}"><span class="book-note" aria-hidden="true">${faNum(index + 1)}</span><div class="book-cover" aria-hidden="true"><span class="book-mark">${escape(book.mark)}</span><span class="book-cover-title">${escape(book.title)}</span><span class="book-cover-author">${escape(book.author)}</span></div><div class="book-body"><div class="book-byline"><span class="book-author">${escape(book.author)}</span>${book.freeShowcase ? '<span class="book-access">راهنمای کامل رایگان</span>' : offer ? '<span class="book-access">نمونهٔ رایگان دارد</span>' : ""}</div><h3><a class="book-link" href="${href}">${escape(book.title)}</a></h3><p>${escape(book.description)}</p><span class="book-meta">${escape(book.meta)}</span>${offer ? `<p class="store-card-price">${new Intl.NumberFormat("fa-IR").format(offer.priceToman)} تومان · خرید یک‌باره</p>` : book.parts.length ? `<div class="book-parts">${book.parts.map(part => `<a href="${href}${part.path}">${escape(part.label)}</a>`).join("")}</div>` : ""}<span class="book-cta" aria-hidden="true">${book.freeShowcase ? "خواندن راهنمای رایگان" : offer ? salesEnabled ? "دیدن نمونه و خرید" : "دیدن نمونه و قیمت" : "ورود به راهنما"} ←</span></div></article>`;
}

function freeShowcase(book, basePath) {
  const href = `${basePath}${book.path}`;
  return `<section class="free-showcase" aria-labelledby="free-showcase-title"><div class="showcase-copy"><span class="showcase-kicker">برای آشنایی با پاورقی</span><h2 id="free-showcase-title">راهنمای ${escape(book.title)}، کامل و رایگان</h2><p>${escape(book.description)} همهٔ بخش‌های راهنما، معرفی شخصیت‌ها و توضیح اشاره‌ها را رایگان بخوان.</p><a class="showcase-cta" href="${href}">خواندن راهنمای کامل و رایگان ←</a></div><div class="showcase-details"><p>${escape(book.meta)}</p><span>بدون نیاز به ثبت‌نام</span>${book.parts.map(part => `<a href="${href}${part.path}">${escape(part.label)} ←</a>`).join("")}</div></section>`;
}

// Writes the library home page into outDir, served at siteUrl, and returns its indexable URLs.
export async function buildLibrary(siteUrl, outDir, {products = [], salesEnabled = false} = {}) {
  const basePath = new URL(siteUrl).pathname;
  const showcaseBook = books.find(book => book.freeShowcase);
  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f1e7">
  <meta name="description" content="${escape(description)}">
  <title>${title} | ${tagline}</title>
  <link rel="stylesheet" href="${basePath}library.css?v=3">
  ${products.length ? `<link rel="stylesheet" href="${basePath}store.css?v=1">` : ""}
  <link rel="canonical" href="${escape(siteUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:site_name" content="${title}">
  <meta property="og:title" content="${title} | ${tagline}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(siteUrl)}">
  <meta property="og:image" content="${escape(new URL("homer/share-cover.png", siteUrl).href)}">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <a class="skip-link" href="#main">رفتن به محتوای اصلی</a>
  <header class="masthead"><a class="brand" href="${basePath}">${title}<sup aria-hidden="true">*</sup></a><span class="brand-tagline">${tagline}</span><a class="store-account" href="${basePath}pricing/">قیمت راهنماها</a>${salesEnabled ? `<a class="store-account" href="${basePath}account/library">کتابخانهٔ من</a>` : ""}</header>
  <main id="main" tabindex="-1">
    <section class="intro"><h1>با داستان‌ها و کتاب‌های بیشتری آشنا شو</h1><p>با روایت داستان، شناخت آدم‌ها و توضیح اشاره‌ها، خواندن کتاب‌های خوب را ساده‌تر کن. هر کتاب در پاورقی حال‌وهوا و راهنمای خودش را دارد.</p></section>
    ${showcaseBook ? freeShowcase(showcaseBook, basePath) : ""}
    <section class="shelf" aria-labelledby="shelf-title"><h2 id="shelf-title">کتاب‌ها</h2><div class="book-grid">${books.map((book, index) => card(book, index, basePath, products.find(product => product.id === book.id), salesEnabled)).join("")}</div><p class="shelf-note">کتاب‌های بعدی به‌زودی به این قفسه اضافه می‌شوند.</p></section>
  </main>
  <footer class="footer"><span><sup aria-hidden="true">*</sup> ${title} — ${tagline}</span></footer>
</body>
</html>
`;
  await writeFile(join(outDir, "index.html"), html);
  return [siteUrl];
}
