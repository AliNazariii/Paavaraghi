import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {books} from "./books.mjs";

const escape = value => String(value).replace(/[&<>"']/g, character => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[character]);
const faNum = value => String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);

const title = "پاورقی";
const tagline = "راهنمای خواندن کتاب‌های خوب";
const description = "پاورقی راهنمای فارسی خواندن کتاب‌های خوب است؛ بخش به بخش، با زمینهٔ داستان، شخصیت‌ها و نکته‌هایی که پیش از هر فصل باید بدانی.";

function card(book, index, basePath) {
  const href = `${basePath}${book.path}`;
  const style = Object.entries(book.theme).map(([key, value]) => `--book-${key}:${value}`).join(";");
  return `<article class="book-card" style="${style}"><span class="book-note" aria-hidden="true">${faNum(index + 1)}</span><div class="book-cover" aria-hidden="true"><span class="book-mark">${escape(book.mark)}</span><span class="book-cover-title">${escape(book.title)}</span><span class="book-cover-author">${escape(book.author)}</span></div><div class="book-body"><span class="book-author">${escape(book.author)}</span><h3><a class="book-link" href="${href}">${escape(book.title)}</a></h3><p>${escape(book.description)}</p><span class="book-meta">${escape(book.meta)}</span>${book.parts.length ? `<div class="book-parts">${book.parts.map(part => `<a href="${href}${part.path}">${escape(part.label)}</a>`).join("")}</div>` : ""}<span class="book-cta" aria-hidden="true">ورود به راهنما ←</span></div></article>`;
}

// Writes the library home page into outDir, served at siteUrl, and returns its indexable URLs.
export async function buildLibrary(siteUrl, outDir) {
  const basePath = new URL(siteUrl).pathname;
  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f1e7">
  <meta name="description" content="${escape(description)}">
  <title>${title} | ${tagline}</title>
  <link rel="stylesheet" href="${basePath}library.css?v=2">
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
  <header class="masthead"><a class="brand" href="${basePath}">${title}<sup aria-hidden="true">*</sup></a><span class="brand-tagline">${tagline}</span></header>
  <main id="main" tabindex="-1">
    <section class="intro"><h1>کتاب‌های خوب را با یک همراه بخوان</h1><p>برای هر کتاب، راهنمایی بخش به بخش: پیش از هر فصل بدانی کجای داستانی، چه کسانی حاضرند و چه چیزی را دنبال کنی. هر کتاب طراحی و حال‌وهوای خودش را دارد.</p></section>
    <section class="shelf" aria-labelledby="shelf-title"><h2 id="shelf-title">کتاب‌ها</h2><div class="book-grid">${books.map((book, index) => card(book, index, basePath)).join("")}</div><p class="shelf-note">کتاب‌های بعدی به‌زودی به این قفسه اضافه می‌شوند.</p></section>
  </main>
  <footer class="footer"><span><sup aria-hidden="true">*</sup> ${title} — ${tagline}</span></footer>
</body>
</html>
`;
  await writeFile(join(outDir, "index.html"), html);
  return [siteUrl];
}
