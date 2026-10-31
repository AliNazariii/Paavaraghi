import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {stories, characters, themes, sources} from "./content.mjs";

const escape = value => String(value).replace(/[&<>"']/g, character => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[character]);
const paragraph = text => `<p>${escape(text)}</p>`;
const sourceLink = id => {
  const source = sources.find(item => item.id === id);
  return `<a href="${escape(source.url)}">${escape(source.title)} ↗</a>`;
};

// Like the other guides, all content is generated as directly addressable HTML.
export async function buildFrannyAndZooey(bookUrl, outDir, libraryUrl) {
  const base = new URL(bookUrl).pathname;
  const libraryPath = new URL(libraryUrl).pathname;
  const sitemap = [];
  const href = path => `${base}${path}`;
  const nav = [
    ["", "دربارهٔ کتاب"], ["franny/", "فرنی"], ["zooey/", "زویی"],
    ["characters/", "خانواده و شخصیت‌ها"], ["themes/", "نکته‌های خواندن"]
  ];
  const peopleLinks = ids => `<div class="people-links">${ids.map(id => `<a href="${href(`characters/#${id}`)}">${escape(characters.find(person => person.id === id).name)} ↖</a>`).join("")}</div>`;
  const heading = (eyebrow, title, description) => `<header class="page-heading"><span class="eyebrow">${escape(eyebrow)}</span><h1>${escape(title)}</h1><p class="lead">${escape(description)}</p></header>`;
  const note = text => `<p class="reading-note">${escape(text)}</p>`;

  async function save(path, title, description, content) {
    const url = new URL(path, bookUrl).href;
    const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f0e7">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)} | فرنی و زویی · پاورقی</title>
  <link rel="canonical" href="${escape(url)}">
  <link rel="stylesheet" href="${href("styles.css?v=1")}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:site_name" content="پاورقی">
  <meta property="og:title" content="${escape(title)} | فرنی و زویی">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(url)}">
  <meta property="og:image" content="${escape(new URL("share-cover.png", bookUrl).href)}">
  <meta property="og:image:alt" content="فرنی و زویی؛ راهنمای خواندن در پاورقی">
  <meta name="twitter:card" content="summary_large_image">
  <script type="module" src="${href("app.js?v=1")}"></script>
</head>
<body>
  <a class="skip-link" href="#main">رفتن به محتوای اصلی</a>
  <header class="masthead wrap"><a class="brand" href="${libraryPath}">پاورقی<sup aria-hidden="true">*</sup></a><a class="book-name" href="${base}">فرنی و زویی <span lang="en" dir="ltr">J. D. Salinger</span></a><a class="library-link" href="${libraryPath}">همهٔ کتاب‌ها ←</a></header>
  <nav class="book-nav wrap" aria-label="راهنمای فرنی و زویی">${nav.map(([route, label]) => `<a href="${href(route)}"${path === route ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
  <main id="main" class="wrap" tabindex="-1">${content}</main>
  <footer class="footer wrap"><div><a class="footer-brand" href="${libraryPath}">پاورقی<sup aria-hidden="true">*</sup></a><p>یک همراه، در حاشیهٔ کتاب.</p></div><div><a href="${href("sources/")}"${path === "sources/" ? ' aria-current="page"' : ""}>منابع و دربارهٔ این راهنما</a><p>یادداشت‌های فارسیِ تألیفی برای همراهی با خواندن</p></div></footer>
</body>
</html>
`;
    await mkdir(join(outDir, path), {recursive: true});
    await writeFile(join(outDir, path, "index.html"), html);
    sitemap.push(url);
  }

  await save("", "راهنمای خواندن", "راهنمای فارسی فرنی و زویی اثر جی. دی. سلینجر: همراه دو داستان، شخصیت‌های خانوادهٔ گلس و پرسش‌هایی برای خواندن، با خلاصه‌های اختیاری.", `
    <section class="hero">
      <div class="hero-copy"><span class="eyebrow">در قفسهٔ پاورقی / ادبیات آمریکا</span><h1>فرنی و زویی</h1><p class="author">جی. دی. سلینجر</p><p class="hero-line">میان هیاهوی دنیا<br>و صدای درون.</p><p class="lead">دو داستان به‌هم‌پیوسته، یک خواهر و برادر، و گفت‌وگوهایی که زیر حرف‌های معمولی‌شان چیزهای زیادی می‌گذرد. این راهنما را کنار کتاب باز نگه دار.</p><div class="hero-actions"><a class="button" href="${href("franny/")}">شروع با فرنی <span aria-hidden="true">←</span></a><a class="text-link" href="#reading">مسیر خواندن ↓</a></div></div>
      <div class="cover-art" aria-hidden="true"><span class="cover-top" lang="en" dir="ltr">TWO STORIES · J. D. SALINGER</span><div class="cover-letter" lang="en">f<span>&</span>z</div><div class="cover-rule"></div><span class="cover-title">فرنی<br>و زویی</span><span class="cover-bottom">دو صدا، در یک خانه.</span></div>
    </section>
    <div class="book-facts"><span><strong>۲</strong> داستان پیوسته</span><span><strong>۱۹۶۱</strong> انتشار نخست کتاب</span><a href="${href("characters/")}"><strong>گلس</strong> خانوادهٔ داستان</a></div>
    <section class="reading-path" id="reading"><div class="section-heading"><div><span class="eyebrow">از اینجا شروع کن</span><h2>دو داستان، به ترتیب کتاب</h2></div><span class="progress-label" data-progress hidden aria-live="polite"></span></div><p class="section-intro">اول «فرنی» و بعد «زویی» را بخوان. هر صفحه، پیشنهادهایی برای همراهی با متن و بخشی بسته برای بعد از خواندن دارد.</p><div class="story-grid">${stories.map(story => `<article class="story-card"><div class="story-card-top"><span>${story.kind}</span><span class="story-number" aria-hidden="true">${story.number}</span></div><h3><a href="${href(`${story.id}/`)}">${story.title}</a><span lang="en" dir="ltr">${story.english}</span></h3><p>${story.subtitle}</p><div class="story-card-bottom"><a href="${href(`${story.id}/`)}">راهنمای ${story.title} ←</a><span class="read-state" data-read-state="${story.id}" hidden>خوانده‌ام ✓</span></div></article>`).join("")}</div></section>
    <section class="companion"><div><span class="eyebrow">کنار دستت باشد</span><h2>اسم‌ها و پرسش‌ها</h2><p>لازم نیست پیش از شروع همه‌چیز را بدانی. هر جا نامی یا اشاره‌ای مکثت داد، به این دو صفحه سر بزن.</p></div><div class="companion-links"><a href="${href("characters/")}"><span>۰۱</span><div><h3>خانواده و شخصیت‌ها</h3><p>فرنی، زویی و آدم‌های اطرافشان</p></div><span aria-hidden="true">←</span></a><a href="${href("themes/")}"><span>۰۲</span><div><h3>نکته‌های خواندن</h3><p>خودنمایی، دعا، هنر و توجه به دیگری</p></div><span aria-hidden="true">←</span></a></div></section>
    <aside class="editorial-note"><span class="note-star" aria-hidden="true">*</span><div><h2>این راهنما چطور همراهت می‌شود؟</h2><p>بخش «پیش از خواندن» را اول ببین؛ خلاصه و بحث پایان فقط با بازکردن «بعد از خواندن» نمایش داده می‌شوند. کتاب دو داستان اصلی دارد و عنوان‌های این راهنما، فصل‌بندیِ کتاب نیستند. شمارهٔ صفحه نداده‌ایم تا بتوانی با ترجمه‌ها و چاپ‌های مختلف بخوانی.</p><a href="${href("sources/")}">دربارهٔ متن و منابع ←</a></div></aside>
  `);

  for (const [index, story] of stories.entries()) {
    const previous = stories[index - 1];
    const next = stories[index + 1];
    await save(`${story.id}/`, story.title, story.description, `
      ${heading(story.kind, story.title, story.subtitle)}
      <div class="reader-layout"><article class="reader"><section class="before-reading"><span class="eyebrow">پیش از خواندن</span><h2>از کجا شروع می‌کنیم؟</h2>${paragraph(story.introduction)}<p class="scene"><strong>فضای داستان</strong> ${escape(story.scene)}</p></section>
      <section class="reader-section" id="during"><h2>هنگام خواندن، همراهت باشد</h2><p class="muted">این پرسش‌ها پیشنهادِ خواندن‌اند؛ لازم نیست دنبال یک پاسخ قطعی بگردی.</p><div class="prompts">${story.prompts.map((prompt, i) => `<section class="prompt"><span class="prompt-number" aria-hidden="true">${["۰۱", "۰۲", "۰۳"][i]}</span><div><h3>${escape(prompt.title)}</h3>${paragraph(prompt.text)}</div></section>`).join("")}</div></section>
      <details class="spoiler" id="after"><summary><span><strong>بعد از خواندنِ «${story.title}»</strong><small>خلاصه و گفت‌وگو دربارهٔ پایان؛ با بازکردن، داستان فاش می‌شود.</small></span><span class="disclosure-icon" aria-hidden="true">+</span></summary><div class="spoiler-content"><h2>مرور کوتاه</h2>${paragraph(story.recap)}<p class="source-line">متن مرجع: ${sourceLink(story.source)}</p><h2>برای فکرکردن و گفت‌وگو</h2><p class="muted">این‌ها خوانش‌ها و پرسش‌های پیشنهادی‌اند، نه توضیح قطعی نیت نویسنده.</p><ol class="discussion">${story.discussion.map(text => `<li>${escape(text)}</li>`).join("")}</ol></div></details>
      <div class="reading-finish"><button type="button" class="button mark-read" data-mark-read="${story.id}" aria-pressed="false" hidden>این داستان را خوانده‌ام</button><p class="progress-status" data-progress-status role="status"></p><noscript><p class="muted">برای ذخیرهٔ علامت خواندن، جاوااسکریپت را فعال کن.</p></noscript></div>
      <nav class="reader-pager" aria-label="ادامهٔ خواندن"><a href="${previous ? href(`${previous.id}/`) : base}"><small>قبلی</small><strong>→ ${previous ? previous.title : "دربارهٔ کتاب"}</strong></a><a href="${next ? href(`${next.id}/`) : href("themes/")}"><small>${next ? "داستان بعدی" : "برای ادامهٔ فکرکردن"}</small><strong>${next ? next.title : "نکته‌های خواندن"} ←</strong></a></nav></article>
      <aside class="reader-aside"><span class="eyebrow">حاشیهٔ این داستان</span><h2>نام‌هایی که می‌بینی</h2>${peopleLinks(story.people)}<p>این فهرست، شخصیت‌های حاضر و کسانی را که در حرف‌ها و خاطره‌ها نامشان می‌آید در بر می‌گیرد.</p><hr><a href="${href("themes/")}">نکته‌های خواندن ←</a><a href="${href("sources/")}">منابع راهنما ←</a><p class="source-line">${sourceLink(story.source)}</p></aside></div>
    `);
  }

  await save("characters/", "خانواده و شخصیت‌ها", "آشنایی با فرنی، زویی، لین و خانوادهٔ گلس؛ نسبت شخصیت‌ها و پرسش‌هایی برای دنبال‌کردن آن‌ها در دو داستان.", `
    ${heading("آدم‌های این دو داستان", "خانوادهٔ گلس و اطرافیان", "یک راهنمای نام‌ها، برای وقتی که در میان گفت‌وگوها به کسی برمی‌خوری. لازم نیست پیش از شروع، همهٔ نسبت‌ها را حفظ کنی.")}
    <section class="family-strip"><h2>خانواده در یک نگاه</h2><p><strong>لس و بسی گلس</strong> والدین هفت فرزندند:</p><ol class="family-order" aria-label="فرزندان خانواده به ترتیب سن؛ والت و ویکر دوقلو هستند">${["seymour", "buddy", "boo-boo"].map(id => `<li><a href="#${id}">${characters.find(person => person.id === id).name.replace(" گلس", "")}</a></li>`).join("")}<li><a href="#walt">والت</a> و <a href="#waker">ویکر</a> <small>(دوقلو)</small></li><li><a href="#zooey">زویی</a></li><li><a href="#franny">فرنی</a></li></ol><p class="source-line">مرجع نسبت‌ها: ${sourceLink("glass")}</p></section>
    <div class="character-grid">${characters.map(person => `<article class="character-card" id="${person.id}"><span class="eyebrow">${escape(person.role)}</span><h2>${escape(person.name)}</h2><span class="english-name" lang="en" dir="ltr">${escape(person.english)}</span>${paragraph(person.bio)}${person.prompt ? `<p class="character-prompt"><strong>با این پرسش بخوان</strong>${escape(person.prompt)}</p>` : ""}</article>`).join("")}</div>
    ${note("املای نام‌ها در ترجمه‌های مختلف فرق می‌کند؛ نام انگلیسی را برای پیدا‌کردن معادل هر شخصیت آورده‌ایم. این صفحه به سرگذشت شخصیت‌ها در دیگر داستان‌های سلینجر نمی‌پردازد.")}
  `);

  await save("themes/", "نکته‌های خواندن", "پرسش‌هایی برای خواندن فرنی و زویی: اصالت و خودنمایی، دعا، محبت و بازیگری؛ همراه با پیشنهادهایی برای گفت‌وگوی پس از کتاب.", `
    ${heading("مکث در حاشیه", "چه چیزهایی را دنبال کنیم؟", "این یادداشت‌ها دعوت به دوباره‌دیدن جزئیات‌اند. اگر برداشتی داری، کنارش یک نشانه از خودِ متن بگذار.")}
    <div class="theme-list">${themes.map((theme, index) => `<section class="theme" id="${theme.id}"><span class="theme-number" aria-hidden="true">${["۰۱", "۰۲", "۰۳", "۰۴"][index]}</span><div><h2>${escape(theme.title)}</h2>${paragraph(theme.text)}<p class="theme-question"><strong>یک پرسش همراه</strong>${escape(theme.question)}</p></div></section>`).join("")}</div>
    <aside class="editorial-note"><span class="note-star" aria-hidden="true">*</span><div><h2>برای گفت‌وگو بعد از کتاب</h2><p>یک گفت‌وگو را دوباره بخوان و سه چیز را جدا یادداشت کن: معنای جمله، لحن گوینده و واکنش شنونده. بعد ببین اگر لحن عوض می‌شد، آیا معنای آن صحنه هم تغییر می‌کرد؟ بحث اختصاصی پایان هر داستان در بخش بستهٔ همان راهنماست.</p><div class="inline-links"><a href="${href("franny/#after")}">بعد از فرنی ←</a><a href="${href("zooey/#after")}">بعد از زویی ←</a></div></div></aside>
  `);

  await save("sources/", "منابع و دربارهٔ راهنما", "منابع راهنمای فرنی و زویی در پاورقی؛ اطلاعات انتشار کتاب و داستان‌ها، معرفی ناشران و مرجع نام‌های خانوادهٔ گلس.", `
    ${heading("پشت این یادداشت‌ها", "منابع و دربارهٔ راهنما", "متن فارسی این راهنما تألیفی است؛ برای همراهی با خواندن کتاب نوشته شده و ترجمه یا بازنشر متن آن نیست.")}
    <div class="sources-layout"><section class="reader-section"><h2>دو داستان؛ یک کتاب</h2><p>«فرنی» در شمارهٔ ۲۹ ژانویهٔ ۱۹۵۵ و «زویی» در شمارهٔ ۴ مهٔ ۱۹۵۷ نیویورکر منتشر شدند. این دو داستان در سال ۱۹۶۱ در یک کتاب، توسط لیتل، براون منتشر شدند.</p><p class="source-line">${sourceLink("franny")} · ${sourceLink("zooey")} · ${sourceLink("first-edition")}</p><h2>شیوهٔ استفاده از راهنما</h2><p>مبنای ترتیب، همان دو داستان اصلی است. پرسش‌ها و عنوان‌های داخلی، یادداشت‌های تحریریهٔ پاورقی‌اند. چون شمارهٔ صفحه در ترجمه‌ها و چاپ‌های مختلف یکسان نیست، ارجاع صفحه‌ای یا نقل‌قول از ترجمهٔ خاصی نداده‌ایم.</p><p>خلاصه‌ها و برداشت‌های مربوط به پایان در بخش‌های بسته قرار دارند. پرسش‌های تفسیری، یک امکان برای خواندن‌اند و قرار نیست جای داوری خودت دربارهٔ متن را بگیرند.</p></section><section class="source-list" aria-labelledby="source-title"><h2 id="source-title">برای مراجعه</h2>${sources.map(source => `<article id="${source.id}"><h3>${sourceLink(source.id)}</h3><p>${escape(source.note)}</p></article>`).join("")}</section></div>
  `);
  return sitemap;
}
