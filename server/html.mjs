export const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[char]);
export const money = value => `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

export function page(title, content, {description = title, canonical, noindex = true, sandbox = false, accountLink = true} = {}) {
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · پاورقی</title><meta name="description" content="${escape(description)}">${noindex ? '<meta name="robots" content="noindex,nofollow">' : ""}${canonical ? `<link rel="canonical" href="${escape(canonical)}">` : ""}<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${escape(canonical ? new URL("/homer/share-cover.png", canonical).href : "/homer/share-cover.png")}"><link rel="stylesheet" href="/library.css?v=3"><link rel="stylesheet" href="/store.css?v=1"></head><body><a class="skip-link" href="#main">رفتن به محتوای اصلی</a><header class="masthead"><a class="brand" href="/">پاورقی<sup aria-hidden="true">*</sup></a><a class="store-account" href="${accountLink ? "/account/library" : "/pricing/"}">${accountLink ? "کتابخانهٔ من" : "قیمت راهنماها"}</a></header>${sandbox ? '<p class="store-sandbox">نسخهٔ آزمایشی — پرداخت‌ها واقعی نیستند.</p>' : ""}<main id="main" tabindex="-1" class="store-main">${content}</main><footer class="footer">پاورقی · روایت و راهنمای کتاب‌ها</footer></body></html>`;
}

export function offerContent(book, product, bundle) {
  return `<article class="store-offer"><span class="store-eyebrow">نمونه را بخوان، بعد انتخاب کن</span><h1>${escape(book.title)}</h1><p class="book-author">${escape(book.author)}</p><p class="store-lead">${escape(book.description)}</p><p>${escape(book.meta)}</p><div class="store-actions"><a class="store-button secondary" href="/${book.path}${product.samplePath}">خواندن رایگان ${escape(product.sampleLabel)} ←</a><a class="store-button" href="/checkout/${product.id}">خرید راهنمای کامل · ${money(product.priceToman)}</a></div><section class="store-included"><h2>با خرید این راهنما چه می‌گیری؟</h2><p>دسترسی به همهٔ یادداشت‌ها، مرور داستان، معرفی شخصیت‌ها، نکته‌های خواندن و منابع همین مجموعه. این محصول راهنمای تألیفی پاورقی است.</p><p>خرید یک‌باره است. راهنما در کتابخانهٔ حساب تو می‌ماند و می‌توانی با همان ایمیل دوباره وارد شوی.</p></section>${bundle ? `<aside class="store-bundle"><h2>${escape(bundle.title)}</h2><p>فرنی و زویی، اهل غرق و نیمهٔ تاریک ماه</p><a href="/checkout/${bundle.id}">خرید مجموعه · ${money(bundle.priceToman)} ←</a></aside>` : ""}<p><a href="/homer/">راهنمای ایلیاد و ادیسه را کامل و رایگان بخوان ←</a></p></article>`;
}

export function readerBar({sample = false, book, product} = {}) {
  return `<nav class="store-bar" aria-label="دسترسی پاورقی"><a href="/">همهٔ کتاب‌ها</a>${sample ? `<span>نمونهٔ رایگان</span><a href="/checkout/${escape(product.id)}">خرید راهنمای کامل ${escape(book.title)} ←</a>` : '<a href="/account/library">کتابخانهٔ من ←</a>'}</nav>`;
}

export function decorateReader(html, options) {
  return html.replace("</head>", '<link rel="stylesheet" href="/store.css?v=1"></head>').replace(/(<body\b[^>]*>)/, `$1${readerBar(options)}`);
}

