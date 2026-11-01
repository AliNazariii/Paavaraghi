import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {chapters, arcs} from './chapters.mjs';
import {characters, glossary, sources, essays} from './content.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const fa = value => String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const p = text => `<p>${escape(text)}</p>`;
const title = 'اهل غرق';

export async function buildAhlEGharq(bookUrl, outDir, libraryUrl) {
  const base = new URL(bookUrl).pathname;
  const library = new URL(libraryUrl).pathname;
  const href = path => `${base}${path}`;
  const chapterHref = n => href(`chapters/${n}/`);
  const sitemap = [];
  const nav = [['', 'دربارهٔ کتاب'], ['chapters/', 'همراه فصل‌ها'], ['characters/', 'آدم‌های جفره'], ['world/', 'دریا و واژه‌ها'], ['analysis/', 'نقد و گفت‌وگو']];
  const heading = (eyebrow, name, lead) => `<header class="page-heading"><span class="eyebrow">${escape(eyebrow)}</span><h1>${escape(name)}</h1><p class="lead">${escape(lead)}</p></header>`;
  const chapterLinks = numbers => `<div class="chapter-links">${numbers.map(n => `<a href="${chapterHref(n)}">فصل ${fa(n)} <span aria-hidden="true">↖</span></a>`).join('')}</div>`;
  const citations = ids => `<p class="source-line">برای مراجعه: ${ids.map(id => `<a href="${href(`sources/#${id}`)}">${escape(sources.find(s => s.id === id).title)}</a>`).join('؛ ')}</p>`;
  const people = ids => `<div class="people-links">${ids.map(id => `<a href="${href(`characters/#${id}`)}">${escape(characters.find(c => c.id === id).name)}</a>`).join('')}</div>`;
  const progress = () => `<div class="progress-box" data-progress-box hidden><div><span data-progress aria-live="polite"></span><a data-resume href="${chapterHref(1)}">ادامهٔ خواندن ←</a></div><progress data-progress-bar value="0" max="${chapters.length}" aria-label="پیشرفت خواندن فصل‌ها"></progress></div>`;

  async function save(path, name, description, content) {
    const url = new URL(path, bookUrl).href;
    const current = path.startsWith('chapters/') ? 'chapters/' : path;
    const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#173f45">
  <meta name="description" content="${escape(description)}">
  <title>${escape(name)} | ${title} · پاورقی</title>
  <link rel="canonical" href="${escape(url)}">
  <link rel="stylesheet" href="${href('fonts/font.css')}">
  <link rel="stylesheet" href="${href('styles.css?v=1')}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:site_name" content="پاورقی">
  <meta property="og:title" content="${escape(name)} | ${title}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(url)}">
  <meta property="og:image" content="${escape(new URL('share-cover.png', bookUrl).href)}">
  <meta property="og:image:alt" content="اهل غرق، منیرو روانی‌پور؛ راهنمای خواندن در پاورقی">
  <meta name="twitter:card" content="summary_large_image">
  <script type="module" src="${href('app.js?v=1')}"></script>
</head>
<body data-chapter-count="${chapters.length}" data-book-base="${base}">
  <a class="skip-link" href="#main">رفتن به محتوای اصلی</a>
  <header class="masthead wrap"><a class="brand" href="${library}">پاورقی<sup aria-hidden="true">*</sup></a><a class="book-name" href="${base}">اهل غرق <span>منیرو روانی‌پور</span></a><a class="library-link" href="${library}">همهٔ کتاب‌ها ←</a></header>
  <nav class="book-nav wrap" aria-label="راهنمای اهل غرق">${nav.map(([route, label]) => `<a href="${href(route)}"${current === route ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
  <main id="main" class="wrap" tabindex="-1">${content}</main>
  <footer class="footer wrap"><div><a class="brand" href="${library}">پاورقی<sup aria-hidden="true">*</sup></a><p>یک همراه، در حاشیهٔ کتاب.</p></div><div><a href="${href('sources/')}"${path === 'sources/' ? ' aria-current="page"' : ''}>منابع و نسخهٔ مبنا ↗</a><p>راهنمای تألیفی؛ متن رمان در این سایت بازنشر نشده است.</p></div><a href="#main" class="back-top">بازگشت به بالا ↑</a></footer>
</body>
</html>
`;
    await mkdir(join(outDir, path), {recursive: true});
    await writeFile(join(outDir, path, 'index.html'), html);
    sitemap.push(url);
  }

  await save('', 'راهنمای خواندن', 'راهنمای ۳۴ فصل اهل غرق اثر منیرو روانی‌پور؛ آدم‌های جفره، واژه‌های جنوب و نقدی برای پس از خواندن، بر اساس متن کتاب.', `
    <section class="hero">
      <div class="hero-copy"><span class="eyebrow">قفسهٔ سوم / ادبیات ایران</span><h1>اهل غرق</h1><p class="author">منیرو روانی‌پور</p><p class="hero-line">دریا،<br> همهٔ جهان بود.</p><p class="lead">به جفره برگرد؛ جایی میان آب و خشکی، قصه و تاریخ. همراهی برای خواندنِ فصل‌ها و مکثی دوباره بر جهانی که کتاب در ذهنمان باقی می‌گذارد.</p><div class="hero-actions"><a class="button" href="${href('analysis/#full-analysis')}">کتاب را خوانده‌ام <span aria-hidden="true">←</span></a><a class="text-link" href="${chapterHref(1)}">شروع راهنمای فصل‌ها ↖</a></div><p class="microcopy">نقد و گفت‌وگو برای بعد از پایان کتاب است.</p></div>
      <figure class="hero-art"><img src="${href('sea.svg')}" width="480" height="580" alt="طرحی از ماه، موج‌ها و یک ماهی؛ میان سطح روشن آب و ژرفای دریا"><figcaption>برای جهانِ اهل غرق <span lang="en" dir="ltr">THE DROWNED</span></figcaption></figure>
    </section>
    <div class="book-facts"><span><strong>${fa(chapters.length)}</strong> فصل در نسخهٔ مبنا</span><span><strong>۱۳۶۸</strong> نخستین انتشار</span><span><strong>جفره</strong> جهان داستان</span><a href="${href('sources/#primary')}">دربارهٔ نسخهٔ بررسی‌شده ↗</a></div>
    <section class="section" id="reading"><div class="section-heading"><div><span class="eyebrow">از ساحل تا دوردست</span><h2>چهار مسیر، در امتداد کتاب</h2></div><a class="text-link" href="${href('chapters/')}">دیدن همهٔ فصل‌ها ←</a></div><p class="section-intro">شماره‌ها از فصل‌بندی کتاب‌اند؛ نامِ مسیرها و عنوانِ فصل‌ها را برای این راهنما انتخاب کرده‌ایم. خلاصهٔ هر فصل فقط با انتخاب تو باز می‌شود.</p>${progress()}<div class="arc-grid">${arcs.map((arc, i) => `<a class="arc-card" href="${href(`chapters/#${arc.id}`)}"><span class="arc-number" aria-hidden="true">${fa(i + 1).padStart(2, '۰')}</span><span class="eyebrow">فصل‌های ${fa(arc.range[0])} تا ${fa(arc.range[1])}</span><h3>${escape(arc.title)}</h3><p>${escape(arc.description)}</p><span class="card-arrow" aria-hidden="true">←</span></a>`).join('')}</div></section>
    <section class="return-section"><div><span class="eyebrow">اگر آخرین صفحه را بسته‌ای</span><h2>حالا از کجا<br> دوباره نگاه کنیم؟</h2><p>از تغییرِ صدای دریا، از تردید مه‌جمال، یا از کارهایی که خیجو برای ادامهٔ زندگی می‌کند.</p><a class="button button-light" href="${href('analysis/')}">نقد و گفت‌وگو ←</a></div><div class="return-prompts"><p><span>۰۱</span>چه چیزی در جفره از دست می‌رود؟</p><p><span>۰۲</span>آیا جادو از روایت بیرون می‌رود؟</p><p><span>۰۳</span>قهرمانِ این قصه برای تو کیست؟</p></div></section>
    <section class="companion section"><div><span class="eyebrow">در حاشیهٔ خواندن</span><h2>اسم‌ها، صداها، نشانه‌ها</h2><p>لازم نیست همه‌چیز را از پیش بدانی. هر جا نامی یا واژه‌ای مکثت داد، از اینجا به متن برگرد.</p></div><div class="companion-links"><a href="${href('characters/')}"><span>۰۱</span><div><h3>آدم‌های جفره</h3><p>نسبت‌ها و پرسش‌هایی برای شناخت شخصیت‌ها</p></div><span aria-hidden="true">←</span></a><a href="${href('world/')}"><span>۰۲</span><div><h3>دریا و واژه‌ها</h3><p>از آبی‌ها و بوسلمه تا راسه و ورار</p></div><span aria-hidden="true">←</span></a><a href="${href('sources/')}"><span>۰۳</span><div><h3>منابع و نسخه‌ها</h3><p>متن مبنا و راه‌های ادامهٔ مطالعه</p></div><span aria-hidden="true">←</span></a></div></section>
  `);

  await save('chapters/', 'همراه فصل‌ها', 'فهرست و راهنمای ۳۴ فصل اهل غرق، به ترتیب نسخهٔ خانهٔ آفتاب؛ با پرسش خواندن، خلاصهٔ اختیاری و ذخیرهٔ پیشرفت.', `
    ${heading('مسیر خواندن', 'همراهِ ۳۴ فصل', 'پیش از هر فصل، جای خودت در داستان را پیدا کن. بعد از خواندن، خلاصه و یادداشت همان فصل را باز کن.')}
    <p class="reading-note">شماره‌ها مطابق ۳۴ فصلِ نسخهٔ خانهٔ آفتاب‌اند. عنوان‌های این صفحه و چهار دستهٔ زیر، عنوان‌های تألیفی راهنما هستند. اگر چاپ تو متفاوت است، از موقعیت آغاز هر فصل کمک بگیر.</p>
    ${progress()}
    <div class="reading-tools" data-reading-tools hidden><div class="search-field"><label for="chapter-search">جست‌وجوی شماره یا عنوان فصل</label><input id="chapter-search" type="search" placeholder="مثلاً ۲۸ یا رادیو" autocomplete="off" data-chapter-search></div><button class="button button-outline" type="button" data-mark-all aria-pressed="false">همهٔ فصل‌ها را خوانده‌ام</button></div>
    <p data-progress-status class="status" role="status" aria-live="polite"></p>
    <div class="filters" data-filters hidden role="group" aria-label="انتخاب مسیر خواندن"><button type="button" data-arc-filter="all" aria-pressed="true">همهٔ فصل‌ها</button>${arcs.map(arc => `<button type="button" data-arc-filter="${arc.id}" aria-pressed="false">${escape(arc.title)}</button>`).join('')}</div>
    <p class="search-status" data-search-status aria-live="polite" hidden></p>
    <p class="empty-state" data-empty hidden>فصلی با این عبارت در مسیر انتخاب‌شده پیدا نشد. عبارت یا مسیر را تغییر بده.</p>
    ${arcs.map((arc, index) => `<section class="chapter-group" id="${arc.id}" data-chapter-group><div class="group-heading"><span class="group-number" aria-hidden="true">${fa(index + 1).padStart(2, '۰')}</span><div><span class="eyebrow">فصل‌های ${fa(arc.range[0])} تا ${fa(arc.range[1])}</span><h2>${escape(arc.title)}</h2></div><p>${escape(arc.description)}</p></div><ol class="chapter-list" start="${arc.range[0]}">${chapters.filter(c => c.arc === arc.id).map(c => `<li data-chapter-item data-arc="${arc.id}" data-search-value="${escape(`${c.number} ${c.title} ${arc.title}`)}"><a href="${chapterHref(c.number)}"><span class="chapter-number">${fa(c.number).padStart(2, '۰')}</span><h3>${escape(c.title)}</h3><span class="read-state" data-read-state="${c.id}" hidden>خوانده‌ام ✓</span><span class="row-arrow" aria-hidden="true">←</span></a></li>`).join('')}</ol></section>`).join('')}
  `);

  for (const [index, chapter] of chapters.entries()) {
    const previous = chapters[index - 1];
    const next = chapters[index + 1];
    await save(`chapters/${chapter.number}/`, `فصل ${fa(chapter.number)}: ${chapter.title}`, `راهنمای فصل ${fa(chapter.number)} اهل غرق: ${chapter.title}؛ پیش از خواندن، پرسشی برای دنبال‌کردن متن و مرور اختیاری پس از خواندن.`, `
      <div class="breadcrumb"><a href="${href('chapters/')}">همراه فصل‌ها</a><span aria-hidden="true">/</span><span>فصل ${fa(chapter.number)} از ${fa(chapters.length)}</span></div>
      ${heading(`فصل ${fa(chapter.number)} · ${arcs.find(a => a.id === chapter.arc).title}`, chapter.title, chapter.scene)}
      <div class="reader-layout"><article class="reader"><section class="before-reading" id="before"><span class="eyebrow">پیش از خواندن</span><h2>کجای داستانیم؟</h2>${p(chapter.before)}</section><section class="focus-section" id="during"><span class="section-index" aria-hidden="true">*</span><div><h2>این بار، به این نکته نگاه کن</h2>${p(chapter.focus)}</div></section>
      <details class="spoiler" id="after"><summary><span><strong>بعد از خواندنِ فصل ${fa(chapter.number)}</strong><small>مرور و برداشت؛ رویدادهای همین فصل فاش می‌شوند.</small></span><span class="disclosure-icon" aria-hidden="true">+</span></summary><div class="spoiler-content"><h2>مرور کوتاه</h2>${p(chapter.recap)}<h2>مکث در حاشیه</h2>${p(chapter.reading)}<p class="reading-note">این یادداشت یک پیشنهاد برای خواندن است؛ می‌توان با تکیه بر متن، خوانش دیگری داشت.</p>${citations(['primary'])}</div></details>
      <div class="reading-finish"><button type="button" class="button" data-mark-read="${chapter.id}" aria-pressed="false" hidden>این فصل را خوانده‌ام</button><p data-progress-status class="status" role="status" aria-live="polite"></p><noscript><p class="reading-note">متن و بخش‌های بازشونده بدون جاوااسکریپت کار می‌کنند. ثبت پیشرفت به جاوااسکریپت نیاز دارد.</p></noscript></div>
      <nav class="reader-pager" aria-label="فصل قبل و بعد"><a href="${previous ? chapterHref(previous.number) : href('chapters/')}"><small>${previous ? `فصل ${fa(previous.number)}` : 'آغاز مسیر'}</small><strong>→ ${escape(previous ? previous.title : 'همهٔ فصل‌ها')}</strong></a><a href="${next ? chapterHref(next.number) : href('analysis/')}"><small>${next ? `فصل ${fa(next.number)}` : 'پس از پایان کتاب'}</small><strong>${escape(next ? next.title : 'نقد و گفت‌وگو')} ←</strong></a></nav></article>
      <aside class="reader-aside"><h2>آدم‌های این بخش</h2>${people(chapter.people)}<hr><h2>در این صفحه</h2><a href="#before">پیش از خواندن</a><a href="#during">نکتهٔ خواندن</a><a href="#after">بعد از خواندن</a><hr><a href="${href('world/')}">دریا و واژه‌ها ↗</a><a href="${href('chapters/')}">فهرست همهٔ فصل‌ها ←</a><p>عنوانِ این فصل را برای راهنما انتخاب کرده‌ایم؛ شماره از خود کتاب است.</p></aside></div>
    `);
  }

  await save('characters/', 'آدم‌های جفره', 'شخصیت‌های اهل غرق: مه‌جمال، خیجو، زایر احمد، مدینه و آدم‌های پیرامونشان؛ نسبت‌ها و مسیر بازگشت به فصل‌ها.', `
    ${heading('راهنمای شخصیت‌ها', 'آدم‌های جفره', 'یک آبادی، صداهایی متفاوت. این معرفی‌ها را برای پیدا‌کردن نسبت‌ها و برگشتن به صحنه‌ها کنار دستت داشته باش.')}
    <p class="reading-note">معرفی‌ها بعضی نسبت‌های خانوادگیِ ادامهٔ داستان را نشان می‌دهند. سرگذشت‌های مفصل‌تر در بخش‌های بسته قرار دارند.</p>
    <section class="family-note"><span class="eyebrow">یک نسبتِ مهم</span><h2>زایر احمد و زایر غلام، دو نفرند</h2><p>زایر احمد حکیم، همسر مدینه و پدر خیجو است. زایر غلام، پدر نباتی است. «دی‌منصور» هم یعنی مادر منصور.</p><details class="small-disclosure"><summary>نسل بعدِ خانوادهٔ زایر احمد</summary><p>خیجو و مه‌جمال صاحب فرزند می‌شوند؛ بهادر، مریم، شمایل و حمایل در سرگذشت خانواده حضور دارند. هم‌نامیِ آواییِ شمایل و حمایل را با یکی‌بودن آن‌ها اشتباه نکن.</p></details></section>
    <nav class="name-index" aria-label="نام شخصیت‌ها">${characters.map(c => `<a href="#${c.id}">${escape(c.name)}</a>`).join('')}</nav>
    <div class="character-grid">${characters.map(c => `<article class="character-card" id="${c.id}"><span class="eyebrow">${escape(c.role)}</span><h2>${escape(c.name)}</h2>${p(c.bio)}<p class="character-question"><strong>برای دنبال‌کردن در متن</strong>${escape(c.question)}</p>${c.after ? `<details class="small-disclosure"><summary>سرگذشت و نقش؛ با اشاره به ادامهٔ داستان</summary>${p(c.after)}</details>` : ''}<span class="micro-label">بازگشت به متن</span>${chapterLinks(c.chapters)}</article>`).join('')}</div>${citations(['primary'])}
  `);

  await save('world/', 'دریا و واژه‌ها', 'واژه‌ها و نشانه‌های اهل غرق: جفره، بوسلمه، آبی‌ها، مروارید، راسه، ورار و جهان دریایی داستان منیرو روانی‌پور.', `
    ${heading('جهان داستان', 'دریا و واژه‌ها', 'بعضی واژه‌ها نامِ چیزها هستند؛ بعضی، راهی برای دیدن و فهمیدنِ جهان. هر دو را با جمله‌ها و صحنه‌های کتاب بخوان.')}
    <section class="world-map" aria-labelledby="world-title"><div class="world-map-heading"><span class="eyebrow">نقشهٔ مفهومی؛ نه جغرافیایی</span><h2 id="world-title">سه سوی یک جهان</h2></div><div class="world-regions"><a href="#sea"><span aria-hidden="true">≈</span><strong>دریا</strong><small>معاش، خطر، رفتگان</small></a><a href="#jofreh"><span aria-hidden="true">⌂</span><strong>آبادی</strong><small>خانه، آیین، گفت‌وگو</small></a><a href="${chapterHref(17)}"><span aria-hidden="true">↗</span><strong>شهر و بیرون</strong><small>راه، اداره، مدرسه</small></a></div><p>این مرزها در طول روایت جابه‌جا می‌شوند؛ آدم‌ها و قصه‌ها مدام از آن‌ها می‌گذرند.</p></section>
    <p class="reading-note">توضیح موجودات و بادها، شرحِ جهان رمان است و ادعای وجود واقعی یا تعریف یگانهٔ باورهای جنوب نیست. معنی واژه‌های محلی با پانوشت‌ها و بافت نسخهٔ مبنا سنجیده شده است.</p>
    <nav class="name-index" aria-label="فهرست واژه‌ها">${glossary.map(t => `<a href="#${t.id}">${escape(t.name)}</a>`).join('')}</nav>
    <dl class="glossary">${glossary.map(t => `<div id="${t.id}"><dt><span class="eyebrow">${escape(t.type)}</span>${escape(t.name)}</dt><dd>${p(t.text)}<a href="${chapterHref(t.chapter)}">همراه فصل ${fa(t.chapter)} ←</a></dd></div>`).join('')}</dl>${citations(['primary'])}
  `);

  await save('analysis/', 'نقد و گفت‌وگو', 'بررسی اهل غرق پس از خواندن: جفره و نفت، رئالیسم جادویی، اخلاق مقاومت، زنان، ساختمان رمان و پایان؛ با ارجاع به فصل‌ها و منابع.', `
    ${heading('برای پس از آخرین صفحه', 'دوباره به دریا نگاه کنیم', 'هفت مکث دربارهٔ اهل غرق؛ با شاهدهای مشخص، چند داوری انتقادی و پرسش‌هایی که می‌شود بر سرشان اختلاف داشت.')}
    <div class="analysis-intro"><span class="big-asterisk" aria-hidden="true">*</span><div><h2>این بررسی از پایان کتاب حرف می‌زند</h2><p>اگر هنوز می‌خوانی، فعلاً <a href="${href('chapters/')}">همراه فصل‌ها</a> بمان. اگر کتاب را تمام کرده‌ای، بررسی را باز کن و از هر پرسشی که برایت زنده‌تر است شروع کن.</p></div></div>
    <details class="spoiler full-analysis" id="full-analysis"><summary><span><strong>کتاب را خوانده‌ام؛ بررسی را باز کن</strong><small>با بازکردن، رویدادهای مهم و پایان رمان نمایش داده می‌شوند.</small></span><span class="disclosure-icon" aria-hidden="true">+</span></summary><div class="analysis-body"><nav class="essay-index" aria-label="فهرست بررسی">${essays.map((e, i) => `<a href="#${e.id}"><span>${fa(i + 1).padStart(2, '۰')}</span>${escape(e.title)}</a>`).join('')}</nav><p class="reading-note">تفسیرهای این صفحه، خوانش پیشنهادیِ پاورقی‌اند. گزارشِ نظر منتقدان با نام و منبع آمده؛ هیچ برداشت واحدی به‌عنوان نیت قطعی نویسنده معرفی نمی‌شود.</p>
    ${essays.map((e, i) => `<article class="essay" id="${e.id}"><div class="essay-number" aria-hidden="true">${fa(i + 1).padStart(2, '۰')}</div><div><span class="eyebrow">${escape(e.kicker)}</span><h2>${escape(e.title)}</h2>${e.paragraphs.map(p).join('')}<div class="discussion-question"><strong>برای گفت‌وگو</strong>${p(e.question)}</div><span class="micro-label">صحنه‌ها را دوباره ببین</span>${chapterLinks(e.chapters)}${citations(e.sources)}</div></article>`).join('')}
    <aside class="cross-book"><span class="eyebrow">از این قفسه به قفسه‌ای دیگر</span><h2>دریا در ادیسه و اهل غرق</h2><p>می‌توان دو پرسش را کنار هم گذاشت: در ادیسه، بازگشت به خانه چه می‌طلبد؟ در اهل غرق، وقتی خودِ خانه و جهان پیرامونش عوض شده، بازگشت چه معنایی دارد؟ این پیشنهادِ مقایسه است، نه ادعای تأثیرپذیری.</p><a href="${library}homer/odyssey/">راهنمای ادیسه در پاورقی ←</a></aside></div></details>
  `);

  await save('sources/', 'منابع و نسخهٔ مبنا', 'متن مبنا، تفاوت نسخه‌ها و منابع راهنمای اهل غرق؛ چاپ دوم خانهٔ آفتاب، منابع نویسنده، ایرانیکا و پژوهش‌های ادبی.', `
    ${heading('دربارهٔ این راهنما', 'متن، نسخه‌ها و منابع', 'این راهنما از خودِ کتاب شروع شده است. منابع پژوهشی برای سنجیدن خوانش‌ها و دیدن زاویه‌های دیگر کنار آن قرار گرفته‌اند.')}
    <div class="sources-layout"><section class="method"><h2>چه متنی بررسی شده؟</h2><p>نسخهٔ مبنا، اسکنِ چاپ دومِ خانهٔ آفتاب، زمستان ۱۳۶۹ است. شناسنامهٔ همین نسخه، چاپ نخست را زمستان ۱۳۶۸ ثبت می‌کند. تصویر صفحهٔ عنوان، شناسنامه، فصل‌بندی و صحنه‌های کلیدی برای کنترل نام‌ها و ارجاع‌ها بررسی شده‌اند.</p><p>۳۴ فصلِ شماره‌دار کتاب به همان ترتیب در راهنما آمده‌اند. عنوان‌های توصیفیِ فصل‌ها و چهار مسیرِ خواندن، انتخابِ راهنما هستند؛ عنوان اصلیِ فصل‌های کتاب محسوب نمی‌شوند.</p><h2>چرا شمارهٔ صفحه نداده‌ایم؟</h2><p>چاپ‌های فارسی و ترجمهٔ انگلیسی صفحه‌بندی یکسانی ندارند؛ در پژوهش‌ها از نسخهٔ بازنگری‌شده هم سخن رفته است. ارجاع این راهنما به شمارهٔ فصلِ نسخهٔ مبناست. اگر کتابت با آن تفاوت دارد، موقعیت آغازِ فصل را تطبیق بده.</p><h2>خلاصه، خوانش و منبع</h2><p>«مرور کوتاه» گزارش فشردهٔ رخداد است. «مکث در حاشیه» و متن نقد، پیشنهادِ تفسیرند. معنی واژه‌های محلی از پانوشت و بافت کتاب گرفته شده و باورهای دریایی به‌عنوان بخشی از جهان داستان توضیح داده شده‌اند.</p><p>متن رمان و فایل اسکن در سایت بازنشر نشده‌اند. برای تهیهٔ نسخهٔ نویسنده، به پیوندهای وب‌سایت رسمی و Google Play Books در همین صفحه رجوع کن.</p><h2>پیشرفت خواندن</h2><p>علامت‌های خواندن فقط در همین مرورگر ذخیره می‌شوند و مستقل از راهنماهای هومر و سلینجرند. با پاک‌کردن داده‌های مرورگر از بین می‌روند. متن، پیوندها و بخش‌های بازشونده بدون جاوااسکریپت هم قابل استفاده‌اند.</p></section><section class="source-list" aria-label="فهرست منابع">${sources.map((s, i) => `<article id="${s.id}"><span class="eyebrow">${fa(i + 1).padStart(2, '۰')} / ${escape(s.kind)}</span><h2><a href="${escape(s.url)}">${escape(s.title)} ↗</a></h2>${p(s.note)}</article>`).join('')}</section></div>
  `);

  return sitemap;
}
