import {readFile, mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {chapters, characters, characterDetails, places, readingGuides, extraGlossary, sourceLink} from "../../docs/homer/story.js";

const shell = await readFile(new URL("./shell.html", import.meta.url), "utf8");
let root, siteUrl, basePath, libraryPath, sitemap;
const escape = value => String(value).replace(/[&<>"']/g, character => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[character]);
const workName = {iliad: "ایلیاد", odyssey: "ادیسه", bridge: "میان دو داستان"};
const chapterPath = chapter => chapter.work === "bridge" ? `context/${chapter.number}/` : `${chapter.work}/book-${chapter.number}/`;
const chapterLink = chapter => `${basePath}${chapterPath(chapter)}`;
const section = (heading, content) => `<section class="reader-section"><h2>${escape(heading)}</h2><p>${escape(content)}</p></section>`;
const list = items => `<div class="chapter-list">${items.map(chapter => `<a class="chapter-row" href="${chapterLink(chapter)}"><span class="chapter-row-num">${chapter.work === "bridge" ? "◇" : chapter.number}</span><span class="chapter-row-content"><strong>${escape(chapter.title)}</strong><small>${escape(chapter.recap)}</small></span><span class="chapter-row-end">←</span></a>`).join("")}</div>`;
const sourceLabel = chapter => chapter.work === "bridge" ? "دیدن اشارهٔ هومری" : "دیدن متن مرجع";

function page(title, description, path, content, indexable = true, image = "share-cover.png") {
  const url = new URL(path, siteUrl).href;
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)} | راهِ هومر</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(description.slice(0, 220))}">`)
    .replace(/(<link rel="stylesheet" href=")[^"]+/, `$1${basePath}styles.css?v=6`)
    .replace(/(<script type="module" src=")[^"]+/, `$1${basePath}app.js?v=7`)
    .replace(/(<a class="brand" href=")[^"]+/, `$1${basePath}`)
    .replace(/(<a href="#library" data-nav="library">)/, `<a href="${libraryPath}" data-nav="library">`)
    .replace(/(<a href="#home" data-nav="home">)/, `<a href="${basePath}" data-nav="home">`)
    .replace(/(<a href="#story" data-nav="story">)/, `<a href="${basePath}story/" data-nav="story">`)
    .replace(/(<a href="#people" data-nav="people">)/, `<a href="${basePath}characters/" data-nav="people">`)
    .replace(/(<a href="#graph" data-nav="graph">)/, `<a href="${basePath}graph/" data-nav="graph">`)
    .replace(/<main id="main" tabindex="-1">[\s\S]*?<\/main>/, `<main id="main" tabindex="-1">${content}</main>`);
  const metadata = `${indexable ? "" : '<meta name="robots" content="noindex, follow">\n  '}<link rel="canonical" href="${escape(url)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:site_name" content="راهِ هومر">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description.slice(0, 220))}">
  <meta property="og:url" content="${escape(url)}">
  <meta property="og:image" content="${escape(new URL(image, siteUrl).href)}">
  <meta name="twitter:card" content="summary_large_image">`;
  html = html.replace("</head>", `  ${metadata}\n</head>`);
  return html;
}

async function save(path, title, description, content, indexable = true) {
  const file = join(root, path, "index.html");
  await mkdir(join(root, path), {recursive: true});
  await writeFile(file, page(title, description, path, content, indexable));
  if (indexable) sitemap.push(new URL(path, siteUrl).href);
}

function chapterPage(chapter) {
  const guide = readingGuides[chapter.id];
  const index = chapters.indexOf(chapter);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const people = chapter.characters.map(id => characters.find(item => item.id === id)).filter(Boolean);
  const place = places.find(item => item.id === chapter.place);
  return `<div class="reader-shell"><div class="reader-top"><a class="back-link" href="${basePath}story/">→ فهرست داستان</a><div class="reader-count">${escape(workName[chapter.work])}، ${chapter.work === "bridge" ? "زمینه" : "سرود"} ${chapter.number}</div></div><div class="reader-layout"><article class="reader-article"><div class="chapter-kicker"><span class="badge ${chapter.work}">${escape(workName[chapter.work])}</span><span>${chapter.work === "bridge" ? "بخش زمینه؛ نه سرود هومر" : `سرود ${chapter.number}`}</span></div><h1>${escape(chapter.title)}</h1>${guide ? `<section class="reading-guide"><h2>قبل از خواندن این سرود</h2><div class="guide-step"><strong>پیش از این چه شده؟</strong><p>${escape(guide.before)}</p></div><div class="guide-step"><strong>حالا کجای داستانیم؟</strong><p>${escape(guide.scene)}</p></div><div class="guide-step"><strong>فعلاً چه چیزی را دنبال کنم؟</strong><p>${escape(guide.focus)}</p></div></section>` : ""}<p class="chapter-lead">${escape(chapter.recap)}</p><div class="insight-box"><div><h2>چرا این بخش مهم است؟</h2><p>${escape(chapter.why)}</p></div></div><section class="reader-section"><h2>چه کسانی در این بخش‌اند؟</h2><div class="people-chips">${people.map(person => `<a class="person-chip" href="${basePath}characters/${person.id}/">${escape(person.name)} ↖</a>`).join("")}</div></section>${place ? `<section class="reader-section"><h2>کجا هستیم؟</h2><p><a href="${basePath}places/${place.id}/">${escape(place.name)}</a> — ${escape(place.bio)}</p></section>` : ""}<div class="source-line"><span>${escape(chapter.source)}</span><a href="${escape(sourceLink(chapter))}" target="_blank" rel="noopener noreferrer">${sourceLabel(chapter)} ↗</a></div><nav class="reader-pager" aria-label="بخش‌های مجاور">${prev ? `<a href="${chapterLink(prev)}"><small>بخش قبلی</small><strong>→ ${escape(prev.title)}</strong></a>` : "<span></span>"}${next ? `<a href="${chapterLink(next)}"><small>بخش بعدی</small><strong>${escape(next.title)} ←</strong></a>` : "<span></span>"}</nav></article></div></div>`;
}

function personPage(person) {
  const appearances = chapters.filter(chapter => chapter.characters.includes(person.id));
  return `<div class="page-shell person-detail"><a class="back-link" href="${basePath}characters/">→ همهٔ شخصیت‌ها</a><div class="person-hero"><span class="person-big-monogram" aria-hidden="true">${escape(person.name[0])}</span><div><span class="eyebrow">${escape(person.group)}</span><h1>${escape(person.name)}</h1><p>${escape(person.bio)}</p>${characterDetails[person.id] ? `<p>${escape(characterDetails[person.id])}</p>` : ""}${person.aliases.length ? `<p>نام‌های دیگر: ${person.aliases.map(escape).join("، ")}</p>` : ""}</div></div><section class="place-appearances"><h2>در کدام بخش‌ها نامش آمده؟</h2>${list(appearances)}</section></div>`;
}

const intro = {
  iliad: "ایلیاد روایت همهٔ جنگ تروا نیست. هومر از سال دهم جنگ و خشم آشیل آغاز می‌کند و با خاک‌سپاری هکتور پایان می‌دهد. کناره‌گیری آشیل، نبردها و سوگ پاتروکلوس مسیر اصلی این منظومه‌اند. سقوط تروا و اسب چوبی پس از پایان ایلیاد قرار می‌گیرند.",
  odyssey: "ادیسه پس از جنگ تروا می‌گذرد و بازگشت اودیسئوس به ایتاکا را دنبال می‌کند. روایت از خانهٔ در انتظار و جست‌وجوی تلماخوس شروع می‌شود؛ اودیسئوس در سرودهای نهم تا دوازدهم ماجراهای پیشین سفرش را برای فایاک‌ها تعریف می‌کند. پس از رسیدن پنهانی به خانه، باید جای خود را در خانواده و شهر بازیابد."
};

// Writes the Homer guide into outDir, served at bookUrl, and returns its indexable URLs.
export async function buildHomer(bookUrl, outDir, libraryUrl) {
  siteUrl = bookUrl;
  basePath = new URL(bookUrl).pathname;
  libraryPath = new URL(libraryUrl).pathname;
  root = outDir;
  sitemap = [];
  await save("", "ایلیاد و ادیسه به فارسی", "راهنمای فارسی خواندن ایلیاد و ادیسهٔ هومر، سرود به سرود و با توضیح شخصیت‌ها و زمینهٔ داستان.", `<div class="page-shell"><div class="page-heading"><span class="eyebrow">ایلیاد و ادیسهٔ هومر</span><h1>از خشم آشیل تا بازگشت اودیسئوس</h1><p>دو منظومه را به ترتیب سرودها دنبال کن. پیش از هر سرود، جای آن در داستان و نام‌های مهمش روشن شده است.</p></div><div class="route-cards"><a class="route-card" href="${basePath}iliad/"><h2>ایلیاد</h2><p>${intro.iliad}</p></a><a class="route-card" href="${basePath}odyssey/"><h2>ادیسه</h2><p>${intro.odyssey}</p></a></div><p><a href="${basePath}story/">فهرست همهٔ بخش‌ها ←</a> · <a href="${basePath}trojan-war/">پیش از ایلیاد چه شد؟ ←</a> · <a href="${basePath}compare/">تفاوت دو منظومه ←</a></p></div>`);
  await save("story/", "فهرست داستان ایلیاد و ادیسه", "همهٔ ۲۴ سرود ایلیاد، سه بخش زمینه و ۲۴ سرود ادیسه به ترتیب روایت.", `<div class="page-shell"><div class="page-heading"><h1>فهرست داستان</h1><p>سه بخشِ میان دو منظومه برای روشن کردن زمینه‌اند و سرود هومر نیستند.</p></div>${["iliad", "bridge", "odyssey"].map(work => `<section class="chapter-group"><h2>${escape(workName[work])}</h2>${list(chapters.filter(chapter => chapter.work === work))}</section>`).join("")}</div>`);
  for (const work of ["iliad", "odyssey"]) {
    await save(`${work}/`, `${workName[work]} چیست؟`, intro[work], `<div class="page-shell"><div class="page-heading"><span class="eyebrow">راهنمای آغاز</span><h1>${workName[work]} چیست؟</h1><p>${intro[work]}</p></div><p><a href="${basePath}${work === "iliad" ? "odyssey" : "iliad"}/">${work === "iliad" ? "ادیسه" : "ایلیاد"} را هم بشناس ←</a> · <a href="${basePath}compare/">تفاوت دو منظومه ←</a>${work === "iliad" ? ` · <a href="${basePath}trojan-war/">پیش‌زمینهٔ جنگ تروا ←</a>` : ""}</p><section class="chapter-group"><h2>سرودهای ${workName[work]}</h2>${list(chapters.filter(chapter => chapter.work === work))}</section></div>`);
  }
  await save("trojan-war/", "پیش از ایلیاد: جنگ تروا چگونه آغاز شد؟", "پیش‌زمینهٔ لازم برای خواندن ایلیاد؛ جای هلن و پاریس در داستان و تفاوت روایت هومر با افسانه‌های بیرون از آن.", `<div class="page-shell"><div class="page-heading"><span class="eyebrow">پیش از سرود اول</span><h1>جنگ تروا چگونه آغاز شد؟</h1><p>ایلیاد از آغاز جنگ شروع نمی‌شود. وقتی سرود اول آغاز می‌شود، سپاه یونان نزدیک به ده سال است تروا را محاصره کرده است. ما به میانهٔ جنگ وارد می‌شویم، جایی که اختلاف آشیل و آگاممنون مسیر نبرد را عوض می‌کند.</p></div><section class="reader-section"><h2>چه چیز را برای شروع بدانم؟</h2><p>هلن همسر منلائوس، پادشاه اسپارت، بود. رفتن او با پاریس، شاهزادهٔ تروایی، زمینهٔ لشکرکشی یونانیان به ترواست. خودِ ایلیاد این ماجرا را از ابتدا تعریف نمی‌کند؛ از گفت‌وگوها و یادآوری‌های شخصیت‌ها، به‌ویژه در سرود سوم، پیشینهٔ آن را می‌فهمیم.</p></section><section class="reader-section"><h2>کدام بخش از روایت هومر است؟</h2><p>داستان «داوری پاریس» و سیب زرین از سنت‌های دیگر جنگ ترواست. دانستن آن برای فهم خط اصلی ایلیاد لازم نیست. در این راهنما، هر جا از رویدادهای بیرون از دو منظومه گفته‌ایم، آن را جدا از سرودهای هومر نشان داده‌ایم.</p></section><p><a href="${basePath}iliad/book-1/">شروع ایلیاد از سرود اول ←</a> · <a href="${basePath}characters/helen/">هلن کیست؟ ←</a> · <a href="${basePath}characters/paris/">پاریس کیست؟ ←</a></p></div>`);
  await save("compare/", "تفاوت ایلیاد و ادیسه چیست؟", "ایلیاد و ادیسه چه زمانی از داستان جنگ تروا را روایت می‌کنند و چرا شیوهٔ خواندنشان متفاوت است؟", `<div class="page-shell"><div class="page-heading"><span class="eyebrow">راهنمای دو منظومه</span><h1>تفاوت ایلیاد و ادیسه چیست؟</h1><p>هر دو منظومه به جهان جنگ تروا تعلق دارند، اما موضوع و نقطهٔ شروعشان یکی نیست.</p></div><section class="reader-section"><h2>ایلیاد: چند هفته از سال دهم جنگ</h2><p>ایلیاد با خشم آشیل از آگاممنون آغاز می‌شود. پیامد کناره‌گیری او، مرگ پاتروکلوس، بازگشتش به نبرد و دیدارش با پریام محور داستان‌اند. منظومه با خاک‌سپاری هکتور پایان می‌یابد؛ سقوط تروا و اسب چوبی در آن روایت نمی‌شود.</p><p><a href="${basePath}iliad/">سرودهای ایلیاد ←</a></p></section><section class="reader-section"><h2>ادیسه: بازگشت پس از جنگ</h2><p>ادیسه خانه و خانوادهٔ اودیسئوس را پیش از خود او نشان می‌دهد. بعد به سفر او می‌رسیم و در سرودهای نهم تا دوازدهم، اودیسئوس بخشی از ماجراهای گذشته را برای میزبانانش تعریف می‌کند. روایت سپس بازگشت پنهانی و بازپس‌گیری خانه را دنبال می‌کند.</p><p><a href="${basePath}odyssey/">سرودهای ادیسه ←</a> · <a href="${basePath}voyage/">ترتیب رخدادهای سفر ←</a></p></section><section class="reader-section"><h2>میان این دو چه می‌گذرد؟</h2><p>ایلیاد پیش از سقوط تروا تمام می‌شود و ادیسه پس از پایان جنگ آغاز می‌شود. سه بخشِ زمینه در این سایت فاصلهٔ میان آن‌ها را توضیح می‌دهند و روشن می‌کنند کدام اشاره در خود ادیسه آمده است.</p><p><a href="${basePath}context/2/">اسب چوبی و سقوط تروا ←</a></p></section></div>`);
  for (const chapter of chapters) await save(chapterPath(chapter), `${workName[chapter.work]}، ${chapter.work === "bridge" ? "زمینه" : "سرود"} ${chapter.number}: ${chapter.title}`, chapter.recap, chapterPage(chapter));
  await save("characters/", "شخصیت‌های ایلیاد و ادیسه", "نام‌ها و معرفی شخصیت‌های اصلی ایلیاد و ادیسه همراه با سرودهای مرتبط.", `<div class="page-shell"><div class="page-heading"><h1>شخصیت‌ها</h1><p>برای هر نام، معرفی کوتاه و سرودهای مرتبط را ببین.</p></div><div class="people-directory static-directory">${characters.map(person => `<a class="person-card" href="${basePath}characters/${person.id}/"><h2>${escape(person.name)}</h2><p>${escape(person.bio)}</p></a>`).join("")}</div></div>`);
  for (const person of characters) await save(`characters/${person.id}/`, `${person.name} کیست؟`, person.bio, personPage(person));
  for (const place of places) {
    const appearances = chapters.filter(chapter => chapter.place === place.id);
    await save(`places/${place.id}/`, `${place.name} در ایلیاد و ادیسه`, place.bio, `<div class="page-shell place-detail"><a class="back-link" href="${basePath}story/">→ داستان</a><div class="place-hero"><h1>${escape(place.name)}</h1><p>${escape(place.bio)}</p></div><section class="place-appearances"><h2>سرودهای مرتبط</h2>${list(appearances)}</section></div>`);
  }
  for (const term of extraGlossary.filter(item => !item.characterId && !item.placeId)) {
    const appearances = chapters.filter(chapter => `${chapter.title} ${chapter.recap} ${chapter.why} ${Object.values(readingGuides[chapter.id] || {}).join(" ")}`.includes(term.name));
    await save(`terms/${term.id}/`, `${term.name} چیست؟`, term.description, `<div class="page-shell place-detail"><a class="back-link" href="${basePath}story/">→ داستان</a><div class="place-hero"><h1>${escape(term.name)}</h1><p>${escape(term.description)}</p></div>${appearances.length ? `<section class="place-appearances"><h2>سرودهای مرتبط</h2>${list(appearances)}</section>` : ""}</div>`, false);
  }
  await save("voyage/", "سفر اودیسئوس به ترتیب رویدادها", "ترتیب رخدادهای سفر اودیسئوس و تفاوت آن با ترتیب روایت هومر.", `<div class="page-shell"><div class="page-heading"><h1>سفر اودیسئوس به ترتیب رویدادها</h1><p>هومر داستان را از میانه آغاز می‌کند. برای شناختن ترتیب سفر، از <a href="${chapterLink(chapters.find(chapter => chapter.id === "odyssey-09"))}">سرود نهم ادیسه</a> شروع کن و پس از سرود دوازدهم به <a href="${chapterLink(chapters.find(chapter => chapter.id === "odyssey-05"))}">سرود پنجم</a> برگرد. جای دقیق برخی سرزمین‌های اسطوره‌ای قطعی نیست.</p></div>${list(chapters.filter(chapter => chapter.work === "odyssey"))}</div>`);
  await save("graph/", "گراف شخصیت‌های ایلیاد و ادیسه", "پیوند شخصیت‌ها بر اساس حضور نامشان در بخش‌های مشترک راهنما.", `<div class="page-shell"><div class="page-heading"><h1>پیوندهای شخصیت‌ها</h1><p>گراف تعاملی حضور مشترک شخصیت‌ها در سرودهای راهنما را نشان می‌دهد؛ پیوند در گراف لزوماً خویشاوندی یا دوستی نیست.</p></div><p><a href="${basePath}characters/achilles/">آشیل</a> · <a href="${basePath}characters/odysseus/">اودیسئوس</a> · <a href="${basePath}characters/athena/">آتنا</a></p></div>`);
  return sitemap;
}
