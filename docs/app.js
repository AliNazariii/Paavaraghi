import {chapters, characters, places, readingGuides, extraGlossary, sourceLink} from "./story.js?v=4";

const main = document.querySelector("#main");
const searchDialog = document.querySelector("#search-dialog");
const searchInput = document.querySelector("#search-input");
const searchResults = document.querySelector("#search-results");
const chapterById = new Map(chapters.map(item => [item.id, item]));
const characterById = new Map(characters.map(item => [item.id, item]));
const placeById = new Map(places.map(item => [item.id, item]));
const extraTermById = new Map(extraGlossary.map(item => [item.id, item]));
const WORK_NAMES = {iliad: "ایلیاد", bridge: "میان دو داستان", odyssey: "ادیسه"};
const STORAGE_KEY = "homer-path-read-v1";
let readChapters = new Set();

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (Array.isArray(saved)) readChapters = new Set(saved.filter(id => chapterById.has(id)));
} catch { /* Reading still works when storage is unavailable. */ }

const faNum = n => Number(n).toLocaleString("fa-IR");
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[char]);
const normalize = value => String(value).toLowerCase().replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\u064b-\u065f\u0670]/g, "").replace(/\u200c/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const chapterLabel = c => c.work === "bridge" ? `زمینهٔ ${faNum(c.number)}` : `سرود ${faNum(c.number)}`;
const chapterHref = c => `#chapter/${c.id}`;
const characterHref = c => `#person/${c.id}`;
const placeHref = place => `#place/${place.id}`;
const termHref = term => `#term/${term.id}`;
const smallBadge = (text, cls = "") => `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
const glossaryEntries = [
  ...characters.flatMap(person => [person.name, ...person.aliases].map(name => ({name, description: person.bio, href: characterHref(person)}))),
  ...places.map(place => ({name: place.name, description: place.bio, href: placeHref(place)})),
  ...extraGlossary.map(term => ({...term, href: term.characterId ? characterHref(characterById.get(term.characterId)) : term.placeId ? placeHref(placeById.get(term.placeId)) : termHref(term)}))
].sort((a, b) => b.name.length - a.name.length);
const glossaryByName = new Map(glossaryEntries.map(entry => [entry.name, entry]));
const regexEscape = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const glossaryPattern = new RegExp(`(?<![\\p{L}\\p{N}])(${glossaryEntries.map(entry => regexEscape(entry.name)).join("|")})[\\p{M}]*(?![\\p{L}\\p{N}])`, "gu");
let tooltipSerial = 0;

function renderAnnotated(value) {
  const content = String(value);
  let html = "", lastIndex = 0;
  for (const match of content.matchAll(glossaryPattern)) {
    const entry = glossaryByName.get(match[1]);
    html += escapeHtml(content.slice(lastIndex, match.index));
    const id = `term-tip-${++tooltipSerial}`;
    html += `<span class="inline-term">${entry.href ? `<a href="${entry.href}" aria-describedby="${id}">${escapeHtml(match[0])}</a>` : `<span class="inline-term-label">${escapeHtml(match[0])}</span>`}<button class="term-info" type="button" aria-label="توضیح ${escapeHtml(match[0])}" aria-controls="${id}" aria-expanded="false">؟</button><span class="term-tip" id="${id}" role="tooltip">${escapeHtml(entry.description)}</span></span>`;
    lastIndex = match.index + match[0].length;
  }
  return html + escapeHtml(content.slice(lastIndex));
}
const bridgeNotes = {
  "bridge-01": "مرگ آشیل در ایلیاد روایت نمی‌شود. ادیسه، سرود ۲۴، از خاک‌سپاری او یاد می‌کند؛ چگونگی مرگش را از روایت‌های دیگر می‌شناسیم.",
  "bridge-02": "اسب چوبی در ادیسه، سرود ۸، در آواز دِمودوکوس آمده است. ایلیاد پیش از سقوط تروا تمام می‌شود؛ شرح پیوستهٔ سقوط شهر در این دو منظومه نیست.",
  "bridge-03": "قتل آگاممنون در ادیسه، از جمله سرودهای ۱ و ۱۱، بازگو می‌شود. این رویداد در ایلیاد روایت نمی‌شود."
};

const questions = [
  ["چرا آشیل از جنگ کنار کشید؟", "آگاممنون بریسئیس را از آشیل گرفت؛ این کار برای آشیل بی‌حرمتی به جایگاهش بود.", "iliad-01"],
  ["خریسئیس و بریسئیس یکی‌اند؟", "نه. خریسئیس دختر کاهن آپولون است و آگاممنون او را به پدرش برمی‌گرداند. بریسئیس نزد آشیل بود و آگاممنون پس از آن او را از آشیل می‌گیرد.", "iliad-01"],
  ["آشیل چرا از تتیس کمک می‌خواهد؟", "تتیس مادر آشیل است. آشیل می‌خواهد زئوس مدتی به ترواییان برتری بدهد تا سپاه یونان بفهمد به او نیاز دارد.", "iliad-01"],
  ["باید همهٔ نام‌های فهرست کشتی‌ها را حفظ کنم؟", "نه. این فهرست اندازهٔ لشکرها و گستردگی متحدان دو طرف را نشان می‌دهد. برای دنبال کردن داستان فعلاً شناختن چند فرماندهٔ اصلی کافی است.", "iliad-02"],
  ["پاریس و الکساندروس دو نفرند؟", "نه. الکساندروس نام دیگر پاریس، شاهزادهٔ تروایی است.", "iliad-03"],
  ["اگر منلائوس برنده شد، چرا جنگ تمام نشد؟", "آفرودیت پاریس را از میدان بیرون برد. یونانیان پیروزی منلائوس را اعلام کردند، اما سرود بعدی نشان می‌دهد پیمان صلح پایدار نمی‌ماند.", "iliad-03"],
  ["منلائوس با تیر پانداروس کشته شد؟", "نه. زخمی می‌شود و درمانش می‌کنند؛ اهمیت تیر در شکستن پیمان آتش‌بس است.", "iliad-04"],
  ["آینیاس چه نسبتی با آفرودیت دارد؟", "آینیاس پسر آفرودیت است. او هنگام نبرد زخمی می‌شود و آفرودیت برای نجاتش وارد میدان می‌شود.", "iliad-05"],
  ["چرا دیومدس و گلاوکوس با هم نمی‌جنگند؟", "آن‌ها می‌فهمند نیاکانشان روزی میزبان و مهمان یکدیگر بوده‌اند. برای پاس داشتن این پیوند زره عوض می‌کنند و از نبرد با هم می‌گذرند.", "iliad-06"],
  ["دوئل هکتور و آیاس را چه کسی برد؟", "هیچ‌کدام پیروزی قطعی به دست نیاوردند. شب که رسید، نبرد را متوقف کردند و به نشانهٔ احترام هدیه ردوبدل کردند.", "iliad-07"],
  ["چرا ترواییان شب را در دشت می‌مانند؟", "هکتور می‌خواهد نزدیک اردوگاه یونانیان بماند تا صبح حمله را ادامه دهد و نگذارد سپاه یونان پنهانی با کشتی‌ها برود.", "iliad-08"],
  ["آشیل چرا هدیه‌های آگاممنون را نمی‌پذیرد؟", "او گرفتن بریسئیس را تحقیر جایگاه خود می‌داند و به قول‌های آگاممنون اعتماد ندارد؛ ارزش جانش را هم بیشتر از غنیمت جنگی می‌بیند.", "iliad-09"],
  ["دولون و رِسوس چه کسانی‌اند؟", "دولون جاسوس تروایی است که در راه اردوگاه یونان گرفتار می‌شود. رِسوس فرماندهٔ تراکیانِ هم‌پیمان ترواست که آن شب در اردوگاه خود خوابیده است.", "iliad-10"],
  ["فکر پوشیدن زره آشیل از کجا آمد؟", "نستور در سرود یازدهم به پاتروکلوس می‌گوید اگر آشیل نمی‌جنگد، از او بخواهد زره و سپاه میرمیدون‌ها را به پاتروکلوس بدهد تا ترواییان او را آشیل بپندارند.", "iliad-11"],
  ["آیا شکستن دیوار یعنی یونانیان شکست خورده‌اند؟", "نه. هکتور راه ورود به محدودهٔ کشتی‌ها را باز می‌کند، اما یونانیان هنوز آنجا می‌جنگند و نبرد برای کشتی‌ها در سرودهای بعد ادامه دارد.", "iliad-12"],
  ["چرا پوزئیدون در چهرهٔ کالخاس ظاهر می‌شود؟", "او می‌خواهد بی‌آنکه آشکارا با فرمان زئوس روبه‌رو شود، یونانیان را برای دفاع از کشتی‌ها دلگرم کند.", "iliad-13"],
  ["آیا هکتور در سرود چهاردهم می‌میرد؟", "نه. سنگی که آیاس پرتاب می‌کند او را از میدان خارج می‌کند؛ یاران تروایی‌اش نجاتش می‌دهند و بعد دوباره به نبرد برمی‌گردد.", "iliad-14"],
  ["کشتی یونانیان در کدام سرود آتش می‌گیرد؟", "هکتور در پایان سرود پانزدهم آتش می‌خواهد، اما آیاس هنوز از کشتی دفاع می‌کند. آتش در آغاز سرود شانزدهم به کشتی می‌رسد.", "iliad-15"],
  ["پاتروکلوس را دقیقاً چه کسی کشت؟", "آپولون او را از پا انداخت و زره و توان دفاعش را گرفت، اوفوربوس زخمی‌اش کرد و هکتور ضربهٔ مرگبار را زد.", "iliad-16"],
  ["زره آشیل و پیکر پاتروکلوس چه شدند؟", "هکتور زرهی را که پاتروکلوس پوشیده بود برداشت و خود پوشید؛ یونانیان پس از نبردی سخت، پیکر بی‌زره پاتروکلوس را به اردوگاه برگرداندند.", "iliad-17"],
  ["آیا آشیل در سرود هجدهم دوباره می‌جنگد؟", "نه. او کنار خندق ظاهر می‌شود و فریاد می‌کشد تا ترواییان عقب بروند، اما برای نبرد به زره تازه نیاز دارد که هفائستوس در پایان سرود می‌سازد.", "iliad-18"],
  ["بریسئیس پس از بازگشت چه می‌گوید؟", "او با دیدن پیکر پاتروکلوس برایش سوگواری می‌کند و می‌گوید پاتروکلوس با او مهربان بود. این صحنه رنج و گذشتهٔ خودِ بریسئیس را هم نشان می‌دهد.", "iliad-19"],
  ["چرا پوزئیدون آینیاس را نجات می‌دهد؟", "با آنکه پوزئیدون معمولاً به یونانیان کمک می‌کند، در این صحنه نمی‌گذارد آینیاس به دست آشیل کشته شود، چون بناست تبار آینیاس ادامه یابد.", "iliad-20"],
  ["زانتوس اسب است یا رود؟", "هر دو نام در ایلیاد هست: اسب زانتوس در سرود نوزدهم حرف می‌زند؛ زانتوس نام دیگر رود اسکاماندر است که در سرود بیست‌ویکم با آشیل درگیر می‌شود.", "iliad-21"],
  ["دئیفوبوس واقعاً کنار هکتور بود؟", "نه. آتنا به شکل دئیفوبوس، برادر هکتور، درآمد تا هکتور گمان کند در نبرد با آشیل تنها نیست.", "iliad-22"],
  ["چرا بعد از خاک‌سپاری پاتروکلوس مسابقه برگزار می‌شود؟", "این مسابقه‌ها بخشی از آیین بزرگداشت اوست؛ آشیل به جنگجویان جایزه می‌دهد و سپاه در کنار سوگواری، یاد پاتروکلوس را زنده نگه می‌دارد.", "iliad-23"],
  ["آیا ایلیاد با پایان جنگ تروا تمام می‌شود؟", "نه. ایلیاد با بازگشت پیکر هکتور و خاک‌سپاری او پایان می‌یابد. سقوط تروا و اسب چوبی در این منظومه روایت نمی‌شوند.", "iliad-24"],
  ["آیا اسب تروا در ایلیاد است؟", "نه. ایلیاد با خاک‌سپاری هکتور تمام می‌شود؛ اسب چوبی در ادیسه یاد می‌شود و شرح مفصل سقوط شهر در روایت‌های دیگر است.", "bridge-02"],
  ["چرا آشیل دوباره جنگید؟", "مرگ پاتروکلوس، یار نزدیکش، او را برای انتقام به میدان برگرداند.", "iliad-18"],
  ["چرا اودیسئوس دیر به خانه رسید؟", "سفرش با رویارویی‌های خطرناک، خطاهای همراهان و دشمنی پوزئیدون طولانی شد.", "odyssey-09"],
  ["ادیسه از کجای سفر شروع می‌شود؟", "داستان از سال‌های پایانی غیبت اودیسئوس و وضعیت خانه‌اش در ایتاکا شروع می‌شود؛ ماجراهای مشهور سفر را خودش بعداً بازگو می‌کند.", "odyssey-01"],
  ["منتس کیست؟", "در این صحنه، کسی که با تلماخوس حرف می‌زند خودِ آتناست؛ او ظاهر منتس را گرفته است.", "odyssey-01"],
  ["منتس و منتور یک نفرند؟", "نه. آتنا در سرود اول به شکل منتس و در سرود دوم به شکل منتور، دوست اودیسئوس، ظاهر می‌شود.", "odyssey-02"],
  ["آیا نستور جای اودیسئوس را می‌داند؟", "نه. او از بازگشت‌های پس از جنگ تروا و سرگذشت آگاممنون می‌گوید، اما برای خبر بیشتر تلماخوس را نزد منلائوس در اسپارت می‌فرستد.", "odyssey-03"],
  ["منلائوس از کجا می‌داند اودیسئوس نزد کالیپسوست؟", "او در بازگشت خودش، در مصر، از پروتئوسِ ایزد دریایی این خبر را شنیده و اکنون آن را برای تلماخوس تعریف می‌کند.", "odyssey-04"],
  ["چرا اودیسئوس نزد کالیپسو نمی‌ماند؟", "کالیپسو جاودانگی را به او پیشنهاد می‌کند، اما او با آگاهی از سختی سفر، بازگشت به خانه و دیدن پنلوپه را ترجیح می‌دهد.", "odyssey-05"],
  ["چرا نائوسیکا اودیسئوس را همراه خود به کاخ نمی‌برد؟", "از حرف مردم دربارهٔ همراهی با مردی ناشناس پرهیز می‌کند؛ راه کاخ را به او می‌گوید تا جداگانه نزد خانواده‌اش برود.", "odyssey-06"],
  ["چرا آره‌ته دربارهٔ لباس اودیسئوس می‌پرسد؟", "لباس را می‌شناسد، چون خودش و خدمتکارانش آن را ساخته‌اند؛ می‌خواهد بداند این غریبه چگونه آن را از نائوسیکا گرفته است.", "odyssey-07"],
  ["آیا اودیسئوس در سرود هشتم سفرش را تعریف می‌کند؟", "نه. دِمودوکوس از جنگ تروا و اسب چوبی می‌خواند؛ آلکینوس در پایان از مهمان ناشناس نام و داستانش را می‌پرسد و پاسخ از سرود نهم آغاز می‌شود.", "odyssey-08"],
  ["چرا نیرنگ «هیچ‌کس» به‌تنهایی کافی نبود؟", "این نام به فرار از غار کمک کرد، اما اودیسئوس بعد از دور شدن نام واقعی‌اش را فریاد زد؛ پولیفموس توانست او را برای پدرش پوزئیدون نام ببرد و نفرین کند.", "odyssey-09"],
  ["چرا خدایان از آگاممنون و آیگیستوس حرف می‌زنند؟", "آیگیستوس پس از بازگشت آگاممنون او را می‌کشد. این نمونه‌ای از یک بازگشت بدفرجام است؛ فعلاً لازم نیست جزئیات آن را حفظ کنی. مسئلهٔ اصلی، بازگشت اودیسئوس و وضعیت خانه‌اش است.", "odyssey-01"],
  ["پاتروکلوس چه نسبتی با آشیل داشت؟", "پاتروکلوس یار بسیار نزدیک آشیل بود. او با زره آشیل به جنگ رفت و به دست هکتور کشته شد.", "iliad-16"],
  ["پنلوپه چطور اودیسئوس را شناخت؟", "او با اشاره به راز تخت‌خوابی که اودیسئوس ساخته بود، هویت مرد بازگشته را آزمود.", "odyssey-23"],
  ["تفاوت ایلیاد و ادیسه چیست؟", "ایلیاد بر خشم آشیل در بخشی از جنگ تروا متمرکز است؛ ادیسه از بازگشت اودیسئوس و خانهٔ در انتظارش می‌گوید.", "iliad-01"]
].map(([question, answer, chapterId]) => ({question, answer, chapterId}));

function progressText() { return `${faNum(readChapters.size)} از ${faNum(chapters.length)} بخش خوانده‌شده`; }
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...readChapters])); } catch { /* optional */ }
}

function route() {
  const raw = decodeURIComponent(location.hash.slice(1) || "home");
  const [section, id] = raw.split("/");
  if (section === "chapter" && chapterById.has(id)) return {section, id};
  if (section === "person" && characterById.has(id)) return {section, id};
  if (section === "place" && placeById.has(id)) return {section, id};
  if (section === "term" && extraTermById.has(id)) return {section, id};
  if (section === "graph") return {section, id: characterById.has(id) ? id : "achilles"};
  if (["home", "story", "people", "voyage"].includes(section)) return {section};
  return {section: "home"};
}

function updateNav(section) {
  const target = ["chapter", "place", "term"].includes(section) ? "story" : section === "person" ? "people" : section;
  document.querySelectorAll("[data-nav]").forEach(link => {
    link.classList.toggle("active", link.dataset.nav === target);
    if (link.dataset.nav === target) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function render() {
  const current = route();
  updateNav(current.section);
  if (current.section === "home") main.innerHTML = renderHome();
  if (current.section === "story") main.innerHTML = renderStoryIndex();
  if (current.section === "chapter") main.innerHTML = renderChapter(chapterById.get(current.id));
  if (current.section === "people") main.innerHTML = renderPeople();
  if (current.section === "person") main.innerHTML = renderPerson(characterById.get(current.id));
  if (current.section === "place") main.innerHTML = renderPlace(placeById.get(current.id));
  if (current.section === "term") main.innerHTML = renderTerm(extraTermById.get(current.id));
  if (current.section === "graph") main.innerHTML = renderGraph(current.id);
  if (current.section === "voyage") main.innerHTML = renderVoyage();
  document.title = `${current.section === "home" ? "از خشم آشیل تا بازگشت اودیسئوس" : main.querySelector("h1")?.textContent || "راهِ هومر"} | راهِ هومر`;
  window.scrollTo({top: 0, behavior: "instant"});
}

function renderHome() {
  const next = chapters.find(c => !readChapters.has(c.id)) || chapters[0];
  const percentage = Math.round(readChapters.size / chapters.length * 100);
  return `<div class="home-view">
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow"><span class="eyebrow-line"></span> ایلیاد و ادیسهٔ هومر</span>
        <h1>از خشم آشیل<br>تا <em>بازگشت اودیسئوس</em></h1>
        <div class="hero-actions"><a class="button button-primary" href="${chapterHref(next)}">${readChapters.size ? "ادامهٔ داستان" : "شروع داستان"} <span aria-hidden="true">←</span></a><a class="button button-outline" href="#story">دیدن همهٔ بخش‌ها</a></div>
        <div class="progress-summary"><span>${progressText()}</span><span>${faNum(percentage)}٪</span></div><div class="progress-bar"><span style="width:${percentage}%"></span></div>
      </div>
      <div class="hero-art" aria-hidden="true"><div class="art-ring ring-one"></div><div class="art-ring ring-two"></div><div class="art-sun"></div><div class="art-sea"></div><div class="art-ship"><span class="ship-mast"></span><span class="ship-sail"></span><span class="ship-hull"></span></div><span class="art-label top">ΤΡΟΙΑ</span><span class="art-label bottom">ΙΘΑΚΗ</span></div>
    </section>
    <section class="route-section section-wrap"><div class="section-intro"><span class="eyebrow">راهِ داستان</span><h2>ایلیاد، میان دو داستان، ادیسه</h2><p>سرودهای دو منظومه به‌ترتیب آمده‌اند. سه بخش زمینه هم میان آن‌هاست؛ کنار هرکدام آمده که چه چیز در متن هومر ذکر شده است.</p></div>
      <div class="route-cards">
        <a class="route-card" href="#chapter/iliad-01"><span class="route-number">۰۱ / خشم</span><span class="route-icon" aria-hidden="true">⚔</span><h3>ایلیاد</h3><p>اختلاف آشیل، نبردهای تروا و دیداری که پس از مرگ هکتور رخ می‌دهد.</p><span class="route-meta">۲۴ سرود <span aria-hidden="true">←</span></span></a>
        <a class="route-card route-bridge" href="#chapter/bridge-01"><span class="route-number">۰۲ / گذر</span><span class="route-icon" aria-hidden="true">◇</span><h3>میان دو داستان</h3><p>سه توضیح کوتاه دربارهٔ پایان جنگ و بازگشت‌ها؛ با اشاره به جای آن‌ها در ادیسه و روایت‌های دیگر.</p><span class="route-meta">۳ بخش زمینه <span aria-hidden="true">←</span></span></a>
        <a class="route-card" href="#chapter/odyssey-01"><span class="route-number">۰۳ / خانه</span><span class="route-icon" aria-hidden="true">⛵</span><h3>ادیسه</h3><p>خانهٔ در انتظار، سفر پرخطر و بازگشتی که هنوز باید ثابت شود.</p><span class="route-meta">۲۴ سرود <span aria-hidden="true">←</span></span></a>
      </div>
    </section>
    <section class="explore-section section-wrap"><div class="section-intro"><span class="eyebrow">بخش‌های دیگر</span><h2>شخصیت‌ها و ترتیب رویدادها</h2></div><div class="explore-grid">
      <a href="#people" class="explore-card"><span class="explore-symbol">✳</span><h3>شخصیت‌ها</h3><p>معرفی کوتاه، نام‌های دیگر و بخش‌های مرتبط با هر شخصیت.</p><span>دیدن شخصیت‌ها ←</span></a>
      <a href="#graph" class="explore-card"><span class="explore-symbol">⌘</span><h3>پیوندهای شخصیت‌ها</h3><p>شخصیت‌هایی که نامشان در بخش‌های مشترک آمده است.</p><span>دیدن گراف ←</span></a>
      <a href="#voyage" class="explore-card"><span class="explore-symbol">◌</span><h3>ترتیب سفر اودیسئوس</h3><p>ترتیب رخدادهای سفر در کنار ترتیب روایت آن‌ها در ادیسه.</p><span>دیدن مسیر سفر ←</span></a>
    </div></section>
    <section class="question-section section-wrap"><div><span class="eyebrow">یک سؤال رایج</span><h2>اسب تروا در ایلیاد است؟</h2><p>نه. ایلیاد با خاک‌سپاری هکتور تمام می‌شود؛ ادیسه در سرود ۸ از اسب چوبی یاد می‌کند.</p><a class="text-link" href="#chapter/bridge-02">دیدن بخش اسب چوبی ←</a></div><div class="quote-mark" aria-hidden="true">؟</div></section>
  </div>`;
}

function renderStoryIndex() {
  return `<div class="page-shell"><div class="page-heading"><span class="eyebrow">مسیر خواندن</span><h1>فهرست داستان</h1><p>پس از سرودهای ایلیاد، سه بخشِ زمینه و سپس سرودهای ادیسه آمده‌اند. بخش‌های زمینه سرودهای هومر نیستند؛ جای اشاره‌های ادیسه و روایت‌های دیگر در هر بخش مشخص شده است.</p></div>
    <div class="story-toolbar"><span>${progressText()}</span><a href="#voyage" class="text-link">دیدن ترتیب سفر اودیسئوس ←</a></div>
    ${["iliad", "bridge", "odyssey"].map(work => `<section class="chapter-group" id="${work}"><div class="group-heading"><span class="group-mark ${work}">${work === "iliad" ? "Ⅰ" : work === "bridge" ? "◇" : "Ⅱ"}</span><div><span class="eyebrow">${work === "bridge" ? "مرز روایت‌ها" : "۲۴ سرود"}</span><h2>${WORK_NAMES[work]}</h2></div></div><div class="chapter-list">${chapters.filter(c => c.work === work).map(c => chapterRow(c)).join("")}</div></section>`).join("")}
  </div>`;
}

function chapterRow(c) {
  return `<a class="chapter-row" href="${chapterHref(c)}"><span class="chapter-row-num">${c.work === "bridge" ? "◇" : faNum(c.number).padStart(2, "۰")}</span><span class="chapter-row-content"><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.recap)}</small></span><span class="chapter-row-end">${readChapters.has(c.id) ? `<span class="read-check" aria-label="خوانده‌شده">✓</span>` : `<span class="row-arrow" aria-hidden="true">←</span>`}</span></a>`;
}

function renderChapter(c) {
  const index = chapters.indexOf(c);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const place = placeById.get(c.place);
  const source = sourceLink(c);
  const guide = readingGuides[c.id];
  const relatedQuestions = questions.filter(q => q.chapterId === c.id);
  return `<div class="reader-shell"><div class="reader-top"><a class="back-link" href="#story">→ فهرست داستان</a><div class="reader-count">بخش ${faNum(index + 1)} از ${faNum(chapters.length)}</div></div>
    <div class="reader-layout"><aside class="reader-sidebar"><div class="sidebar-label">مسیر خواندن</div>${["iliad", "bridge", "odyssey"].map(work => `<div class="sidebar-group"><h3>${WORK_NAMES[work]}</h3>${chapters.filter(item => item.work === work).map(item => `<a href="${chapterHref(item)}" class="sidebar-item ${item.id === c.id ? "current" : ""}" ${item.id === c.id ? 'aria-current="page"' : ""}><span>${item.work === "bridge" ? "◇" : faNum(item.number)}</span>${escapeHtml(item.title)}${readChapters.has(item.id) ? '<i aria-label="خوانده‌شده">✓</i>' : ""}</a>`).join("")}</div>`).join("")}</aside>
    <article class="reader-article"><div class="chapter-kicker">${smallBadge(WORK_NAMES[c.work], c.work)}<span>${chapterLabel(c)}</span></div><h1>${escapeHtml(c.title)}</h1>
      ${guide ? `<section class="reading-guide" aria-label="راهنمای شروع این سرود"><h2>قبل از خواندن این سرود</h2><p class="guide-hint">روی اسم‌های نقطه‌چین مکث کن یا علامت «؟» را بزن؛ خودِ اسم به صفحهٔ کاملش می‌رود.</p><div class="guide-step"><strong>پیش از این چه شده؟</strong><p>${renderAnnotated(guide.before)}</p></div><div class="guide-step"><strong>حالا کجای داستانیم؟</strong><p>${renderAnnotated(guide.scene)}</p></div><div class="guide-step"><strong>فعلاً چه چیزی را دنبال کنم؟</strong><p>${renderAnnotated(guide.focus)}</p></div></section>` : ""}
      <p class="chapter-lead">${renderAnnotated(c.recap)}</p>
      <div class="insight-box"><span class="insight-icon" aria-hidden="true">✦</span><div><h2>چرا این بخش مهم است؟</h2><p>${renderAnnotated(c.why)}</p></div></div>
      ${c.work === "bridge" ? `<div class="source-note"><strong>این روایت از کجاست؟</strong><p>${renderAnnotated(bridgeNotes[c.id])}</p></div>` : ""}
      <section class="reader-section"><h2>چه کسانی در این بخش‌اند؟</h2><div class="people-chips">${c.characters.map(id => {const person = characterById.get(id); return `<a href="${characterHref(person)}" class="person-chip">${escapeHtml(person.name)} <span aria-hidden="true">↖</span></a>`;}).join("")}</div></section>
      <section class="reader-section"><h2>کجا هستیم؟</h2><div class="place-card"><span class="place-pin" aria-hidden="true">⌖</span><div><strong><a href="${placeHref(place)}">${escapeHtml(place.name)} ↖</a></strong><p>${renderAnnotated(place.bio)}</p></div></div></section>
      ${relatedQuestions.length ? `<section class="reader-section"><h2>اگر این سؤال را داری…</h2>${relatedQuestions.map(q => `<details class="faq-item"><summary>${escapeHtml(q.question)}</summary><p>${renderAnnotated(q.answer)}</p></details>`).join("")}</section>` : `<section class="reader-section"><h2>برای به‌خاطر سپردن</h2><details class="faq-item"><summary>چرا «${escapeHtml(c.title)}» در داستان مهم است؟</summary><p>${renderAnnotated(c.why)}</p></details></section>`}
      <div class="source-line"><span>جایگاه در روایت: ${escapeHtml(c.source.replace(/\d+/g, number => faNum(Number(number))))}</span>${source ? `<a href="${source}" target="_blank" rel="noopener noreferrer">${c.work === "bridge" ? "دیدن اشاره در ادیسه ↗" : "دیدن متن مرجع ↗"}</a>` : ""}</div>
      <button class="mark-read ${readChapters.has(c.id) ? "is-read" : ""}" data-mark-read="${c.id}" type="button">${readChapters.has(c.id) ? "✓ خوانده شد — برای برداشتن علامت بزن" : "✓ این بخش را خواندم"}</button>
      <nav class="reader-pager" aria-label="بخش‌های مجاور">${prev ? `<a href="${chapterHref(prev)}"><small>بخش قبلی</small><strong>→ ${escapeHtml(prev.title)}</strong></a>` : `<span></span>`}${next ? `<a href="${chapterHref(next)}"><small>بخش بعدی</small><strong>${escapeHtml(next.title)} ←</strong></a>` : `<span></span>`}</nav>
    </article><aside class="context-sidebar"><div class="context-card"><span class="eyebrow">در این نقطه</span><h2>${WORK_NAMES[c.work]}</h2><p>${chapterLabel(c)} · بخش ${faNum(index + 1)} از ${faNum(chapters.length)}</p><div class="context-progress"><span style="height:${Math.max(4, (index + 1) / chapters.length * 100)}%"></span></div></div><div class="context-card muted"><h2>بعد چه می‌شود؟</h2><p>${next ? escapeHtml(next.title) : "به پایان مسیر رسیده‌ای."}</p>${next ? `<a class="text-link" href="${chapterHref(next)}">ادامه بده ←</a>` : `<a class="text-link" href="#home">بازگشت به آغاز ←</a>`}</div></aside></div></div>`;
}

function renderPeople() {
  const groups = [...new Set(characters.map(c => c.group))];
  return `<div class="page-shell"><div class="page-heading"><span class="eyebrow">آدم‌ها و خدایان</span><h1>شخصیت‌ها</h1><p>نام‌های دیگر، معرفی کوتاه و بخش‌های مرتبط با هر شخصیت.</p></div><div class="people-directory">${groups.map(group => `<section><h2>${escapeHtml(group)}</h2><div class="people-grid">${characters.filter(c => c.group === group).map(c => `<a class="person-card" href="${characterHref(c)}"><span class="person-monogram" aria-hidden="true">${escapeHtml(c.name[0])}</span><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.bio)}</p><span class="person-card-link">شناختن ${escapeHtml(c.name)} ←</span></a>`).join("")}</div></section>`).join("")}</div></div>`;
}

function renderPerson(person) {
  const appearances = chapters.filter(c => c.characters.includes(person.id));
  const related = characters.map(other => ({person: other, shared: chapters.filter(c => c.characters.includes(person.id) && c.characters.includes(other.id)).length})).filter(item => item.person.id !== person.id && item.shared).sort((a,b) => b.shared - a.shared).slice(0, 8);
  return `<div class="page-shell person-detail"><a class="back-link" href="#people">→ همهٔ شخصیت‌ها</a><div class="person-hero"><span class="person-big-monogram" aria-hidden="true">${escapeHtml(person.name[0])}</span><div><span class="eyebrow">${escapeHtml(person.group)}</span><h1>${escapeHtml(person.name)}</h1><p>${escapeHtml(person.bio)}</p>${person.aliases.length ? `<div class="aliases">نام‌های دیگر: ${person.aliases.map(escapeHtml).join("، ")}</div>` : ""}</div></div><div class="person-detail-grid"><section><h2>در کدام بخش‌ها نامش آمده؟</h2><div class="chapter-list compact">${appearances.map(chapterRow).join("")}</div></section><aside><div class="context-card"><h2>پیوندهای داستانی</h2><p>نام این شخصیت‌ها در یک یا چند بخش مشترک آمده است.</p><div class="related-list">${related.map(item => `<a href="${characterHref(item.person)}">${escapeHtml(item.person.name)} <span>${faNum(item.shared)} بخش مشترک ←</span></a>`).join("")}</div><a class="button button-dark" href="#graph/${person.id}">دیدن در گراف</a></div></aside></div></div>`;
}

function renderPlace(place) {
  const appearances = chapters.filter(c => c.place === place.id);
  return `<div class="page-shell place-detail"><a class="back-link" href="#story">→ فهرست داستان</a><div class="place-hero"><span class="eyebrow">جای داستان</span><h1>${escapeHtml(place.name)}</h1><p>${escapeHtml(place.bio)}</p></div><section class="place-appearances"><h2>در کدام بخش‌ها می‌بینیم؟</h2><div class="chapter-list compact">${appearances.map(chapterRow).join("")}</div></section></div>`;
}

function renderTerm(term) {
  const questionChapters = new Set(questions.filter(q => `${q.question} ${q.answer}`.includes(term.name)).map(q => q.chapterId));
  const appearances = chapters.filter(c => questionChapters.has(c.id) || `${c.title} ${c.recap} ${c.why} ${Object.values(readingGuides[c.id] || {}).join(" ")}`.includes(term.name));
  return `<div class="page-shell place-detail"><a class="back-link" href="#story">→ فهرست داستان</a><div class="place-hero"><span class="eyebrow">نام و مفهوم</span><h1>${escapeHtml(term.name)}</h1><p>${escapeHtml(term.description)}</p></div>${appearances.length ? `<section class="place-appearances"><h2>در کدام بخش‌ها نامش آمده؟</h2><div class="chapter-list compact">${appearances.map(chapterRow).join("")}</div></section>` : ""}</div>`;
}

function renderGraph(id) {
  const center = characterById.get(id);
  const related = characters.map(other => ({person: other, shared: chapters.filter(c => c.characters.includes(id) && c.characters.includes(other.id)).length})).filter(item => item.person.id !== id && item.shared).sort((a,b) => b.shared - a.shared).slice(0, 7);
  const cx = 300, cy = 230, radius = 178;
  const positions = related.map((item, i) => ({...item, x: cx + Math.cos((i / related.length) * Math.PI * 2 - Math.PI / 2) * radius, y: cy + Math.sin((i / related.length) * Math.PI * 2 - Math.PI / 2) * radius}));
  const relatedChapters = chapters.filter(c => c.characters.includes(id));
  return `<div class="page-shell"><div class="page-heading"><span class="eyebrow">گراف داستان</span><h1>پیوندهای شخصیت‌ها</h1><p>خط‌ها نشان می‌دهند نام دو شخصیت در چند بخشِ راهنما کنار هم آمده است؛ به‌تنهایی نشانهٔ دوستی یا خویشاوندی نیستند.</p></div><div class="graph-layout"><div class="graph-canvas" role="group" aria-label="نمودار پیوندهای ${escapeHtml(center.name)} با شخصیت‌های مرتبط"><svg viewBox="0 0 600 460" aria-hidden="true">${positions.map(p => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#bfa97c" stroke-width="${Math.min(1 + p.shared * .45, 6)}" opacity=".65"/>`).join("")}</svg><a class="graph-node center" href="${characterHref(center)}" style="left:${cx / 6}%;top:${cy / 4.6}%"><strong>${escapeHtml(center.name)}</strong><small>شناختن شخصیت</small></a>${positions.map(p => `<a class="graph-node" href="#graph/${p.person.id}" style="left:${p.x / 6}%;top:${p.y / 4.6}%" title="${faNum(p.shared)} بخش مشترک"><strong>${escapeHtml(p.person.name)}</strong><small>${faNum(p.shared)} بخش</small></a>`).join("")}</div><aside class="graph-panel"><label for="graph-person">شخصیت مرکزی</label><select id="graph-person">${characters.map(c => `<option value="${c.id}" ${c.id === id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}</select><h2>${escapeHtml(center.name)}</h2><p>${escapeHtml(center.bio)}</p><a class="text-link" href="${characterHref(center)}">پروندهٔ شخصیت ←</a><hr><h3>بخش‌های مرتبط</h3><div class="graph-chapters">${relatedChapters.slice(0, 10).map(c => `<a href="${chapterHref(c)}">${escapeHtml(c.title)} <small>${WORK_NAMES[c.work]} ${chapterLabel(c)}</small></a>`).join("")}${relatedChapters.length > 10 ? `<span class="more-note">و ${faNum(relatedChapters.length - 10)} بخش دیگر در پروندهٔ شخصیت</span>` : ""}</div></aside></div></div>`;
}

function renderVoyage() {
  const stops = [
    ["تروا", "پایان جنگ و آغاز راه خانه", "bridge-02"], ["ایسماروس و لوتوس‌خواران", "نخستین آزمون‌ها", "odyssey-09"],
    ["سرزمین سیکلوپ‌ها", "پولیفموس و خشم پوزئیدون", "odyssey-09"], ["کیسهٔ بادها", "بازگشتی که نزدیک بود", "odyssey-10"],
    ["لایستریگون‌ها و سیرسه", "از دست رفتن کشتی‌ها و راهنمایی سیرسه", "odyssey-10"], ["جهان مردگان", "هشدار تیرسیاس", "odyssey-11"],
    ["سیرن‌ها، اسکیلا و گاوهای خورشید", "پایان همراهان اودیسئوس", "odyssey-12"], ["جزیرهٔ کالیپسو", "سال‌های ماندن در اوژیژیا", "odyssey-05"],
    ["فایاک‌ها", "پناه، روایت خاطرات و کشتیِ بازگشت", "odyssey-06"], ["ایتاکا", "خانه‌ای که هنوز باید بازپس گرفته شود", "odyssey-13"]
  ];
  return `<div class="page-shell"><div class="page-heading"><span class="eyebrow">دو جور دنبال کردن ادیسه</span><h1>سفر اودیسئوس به ترتیب رخدادها</h1><p>هومر داستان را از میانه آغاز می‌کند. این مسیر نشان می‌دهد اتفاق‌ها برای اودیسئوس چه ترتیبی داشته‌اند؛ شمارهٔ سرود کنار هر توقف، جای روایت آن در منظومه است.</p></div><div class="voyage-note"><strong>نکتهٔ جغرافیایی</strong><p>جای دقیق بسیاری از جزیره‌ها و سرزمین‌های اسطوره‌ای روشن نیست. این مسیر ترتیب داستانی است، نه نقشه‌ای با مختصات قطعی.</p></div><ol class="voyage-list">${stops.map(([name, subtitle, chapterId], i) => {const c = chapterById.get(chapterId); return `<li><span class="voyage-dot">${faNum(i + 1)}</span><div><h2>${escapeHtml(name)}</h2><p>${escapeHtml(subtitle)}</p></div><a href="${chapterHref(c)}">${WORK_NAMES[c.work]}، ${chapterLabel(c)} ←</a></li>`;}).join("")}</ol><a class="button button-dark" href="#chapter/odyssey-01">خواندن به ترتیب روایت هومر ←</a></div>`;
}

function search(query) {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(" ").filter(Boolean);
  const items = [
    ...chapters.map(c => ({type: "بخش داستان", title: c.title, subtitle: `${WORK_NAMES[c.work]} · ${chapterLabel(c)}`, body: `${c.title} ${c.recap} ${c.why} ${c.source} ${Object.values(readingGuides[c.id] || {}).join(" ")} ${c.characters.map(id => characterById.get(id)?.name).join(" ")}`, href: chapterHref(c)})),
    ...characters.map(c => ({type: "شخصیت", title: c.name, subtitle: c.group, body: `${c.name} ${c.aliases.join(" ")} ${c.bio}`, href: characterHref(c)})),
    ...places.map(place => ({type: "جا", title: place.name, subtitle: "جای داستان", body: `${place.name} ${place.bio}`, href: placeHref(place)})),
    ...extraGlossary.filter(term => !term.characterId && !term.placeId).map(term => ({type: "نام و مفهوم", title: term.name, subtitle: "واژه‌نامه", body: `${term.name} ${term.description}`, href: termHref(term)})),
    ...questions.map(q => ({type: "پرسش", title: q.question, subtitle: q.answer, body: `${q.question} ${q.answer}`, href: `#chapter/${q.chapterId}`}))
  ];
  return items.map(item => {
    const title = normalize(item.title), body = normalize(item.body);
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 5 : 0) + (body.includes(term) ? 1 : 0), 0);
    return {...item, score};
  }).filter(item => item.score && terms.every(term => normalize(item.body).includes(term))).sort((a,b) => b.score - a.score).slice(0, 12);
}

function renderSearch() {
  const query = searchInput.value.trim();
  if (!query) { searchResults.innerHTML = `<p class="search-empty">نام شخصیت، اتفاق یا سؤال خودت را بنویس.</p><div class="search-suggestions">${["آشیل", "اسب تروا", "پنلوپه"].map(term => `<button type="button" data-search-term="${term}">${term}</button>`).join("")}</div>`; return; }
  const results = search(query);
  searchResults.innerHTML = results.length ? results.map(item => `<a href="${item.href}" class="search-result"><span>${item.type}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subtitle)}</small></a>`).join("") : `<p class="search-empty">برای «${escapeHtml(query)}» نتیجه‌ای پیدا نشد. نام کوتاه‌تر یا املای دیگری را امتحان کن.</p>`;
}

document.addEventListener("click", event => {
  const info = event.target.closest(".term-info");
  document.querySelectorAll(".term-info[aria-expanded='true']").forEach(button => {
    if (button !== info) { button.setAttribute("aria-expanded", "false"); button.closest(".inline-term").classList.remove("is-open"); }
  });
  if (info) {
    const open = info.getAttribute("aria-expanded") !== "true";
    info.setAttribute("aria-expanded", String(open));
    info.closest(".inline-term").classList.toggle("is-open", open);
  }
  const trigger = event.target.closest("#search-open");
  if (trigger) { searchDialog.showModal(); searchInput.focus(); renderSearch(); }
  const mark = event.target.closest("[data-mark-read]");
  if (mark) { const id = mark.dataset.markRead; readChapters.has(id) ? readChapters.delete(id) : readChapters.add(id); saveProgress(); render(); }
  const term = event.target.closest("[data-search-term]");
  if (term) { searchInput.value = term.dataset.searchTerm; renderSearch(); searchInput.focus(); }
  const result = event.target.closest(".search-result");
  if (result) searchDialog.close();
});

document.addEventListener("change", event => {
  if (event.target.id === "graph-person") location.hash = `#graph/${event.target.value}`;
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") document.querySelectorAll(".term-info[aria-expanded='true']").forEach(button => { button.setAttribute("aria-expanded", "false"); button.closest(".inline-term").classList.remove("is-open"); });
  if (event.key === "/" && !searchDialog.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
    event.preventDefault(); searchDialog.showModal(); searchInput.focus(); renderSearch();
  }
});

searchInput.addEventListener("input", renderSearch);
window.addEventListener("hashchange", render);
render();
