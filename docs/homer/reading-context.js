import {chapters, readingGuides} from "./story.js?v=7";
import {backgrounds, chapterContexts} from "./backgrounds.js?v=1";
import {readingNames, readingNameById, namesForChapter} from "./names.js?v=1";
export {backgrounds, chapterContexts, readingNames, readingNameById, namesForChapter};

const escape = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const fa = value => Number(value).toLocaleString("fa-IR");
const chapterById = new Map(chapters.map(chapter=>[chapter.id,chapter]));
const storyById = new Map(backgrounds.map(story=>[story.id,story]));
const labels = {current:"رویدادِ این سرود",past:"ماجرای گذشته",context:"زمینهٔ شناخت",tradition:"روایت بیرون از دو منظومه"};
const timeLabels = {current:"اکنونِ روایت",recollection:"بازگوییِ گذشته",tradition:"بخش زمینه؛ میان دو منظومه"};
const kindLabels = {homer:"در متن هومر",mixed:"هومر و روایت‌های دیگر؛ با تفکیک منبع",tradition:"روایت بیرون از دو منظومه",glossary:"نام‌ها و زبان ترجمه‌ها"};
export const chapterUrl = (chapter,base) => `${base}${chapter.work === "bridge" ? `context/${chapter.number}` : `${chapter.work}/book-${chapter.number}`}/`;
const chapterLabel = chapter => `${chapter.work === "iliad" ? "ایلیاد" : chapter.work === "odyssey" ? "ادیسه" : "زمینه"}، ${chapter.work === "bridge" ? "بخش" : "سرود"} ${fa(chapter.number)}`;
const nameHtml = value => /[a-z]/i.test(value) ? `<bdi lang="en">${escape(value)}</bdi>` : `<bdi>${escape(value)}</bdi>`;

export function renderNameAliases(id, limit = Infinity) {
  const person = readingNameById.get(id);
  if(!person?.aliases.length) return "";
  const aliases = person.aliases.filter(alias=>!/[a-z]/i.test(alias)).slice(0,limit);
  return aliases.length ? `<span class="reading-aliases">نام‌های دیگر: ${aliases.map(nameHtml).join("، ")}</span>` : "";
}

export function renderNarrativeTime(chapterId) {
  const context=chapterContexts[chapterId];
  return `<div class="narrative-time"><span class="time-label ${context.time}">${timeLabels[context.time]}</span><p>${escape(context.text)}</p></div>`;
}

export function renderChapterBackgrounds(chapterId,base) {
  const context=chapterContexts[chapterId];
  return `<section class="chapter-backgrounds" aria-labelledby="chapter-backgrounds-heading"><div class="context-section-heading"><h2 id="chapter-backgrounds-heading">پشت این اشاره‌ها چه داستانی هست؟</h2><a class="text-link" href="${base}background/">همهٔ پیش‌داستان‌ها ←</a></div><div class="background-links">${context.refs.map(ref=>{const story=storyById.get(ref.id);return `<article class="chapter-background"><span class="time-label ${ref.timing}">${labels[ref.timing]}</span><h3><a href="${base}background/${story.id}/?from=${chapterId}">${escape(story.title)} ←</a></h3><p>${escape(ref.note)}</p>${story.firstMention?`<a class="background-first" href="${chapterUrl(chapterById.get(story.firstMention.chapterId),base)}">نخستین اشاره در ادیسه: سرود ${fa(chapterById.get(story.firstMention.chapterId).number)}، سطرهای <bdi>${escape(story.firstMention.lines)}</bdi> ↗</a>`:""}</article>`;}).join("")}</div></section>`;
}

export function renderChapterNames(chapterId,base) {
  const people=namesForChapter(chapterId);
  return `<section class="reader-section chapter-names" aria-labelledby="chapter-names-heading"><div class="context-section-heading"><h2 id="chapter-names-heading">راهنمای نام‌های این سرود</h2><span class="name-count">${fa(people.length)} نام و عنوان</span></div><p class="name-guide-intro">نام‌های رایج در ترجمه‌ها کنار هم آمده‌اند. این فهرست، نام‌های لازم برای خواندن راهنمای این سرود است؛ شخصیتِ حاضر، فردِ یادشده در خاطره و عنوانِ جمعی را از توضیح هر نام تشخیص بده.</p><div class="chapter-name-grid">${people.map(person=>`<article class="chapter-name"><div class="chapter-name-heading"><a href="${base}${person.path}">${escape(person.name)} ↗</a><bdi lang="en">${escape(person.englishName)}</bdi></div>${renderNameAliases(person.id,4)}<p>${escape(person.role)}</p></article>`).join("")}</div></section>`;
}

export function renderRelatedBackgrounds(id,base) {
  const related=backgrounds.filter(story=>story.people.includes(id));
  if(!related.length)return "";
  return `<section class="person-backgrounds"><h2>داستان‌ها و زمینه‌های مرتبط</h2><div class="background-topic-links">${related.map(story=>`<a href="${base}background/${story.id}/">${escape(story.title)} ←</a>`).join("")}</div></section>`;
}

export function renderBackgroundIndex(base) {
  return `<div class="page-shell background-index"><div class="page-heading"><span class="eyebrow">پشتِ نام‌ها و اشاره‌ها</span><h1>پیش‌داستان‌های ایلیاد و ادیسه</h1><p>هر جا یک نام، خاطره یا روایتِ کوتاه به گذشته‌ای بزرگ‌تر اشاره می‌کند، این پرونده‌ها کمک می‌کنند رشتهٔ ماجرا را پیدا کنی. خلاصهٔ هر سرود هم به پرونده‌های مربوط خودش وصل است.</p></div><div class="background-index-grid">${backgrounds.map(story=>`<article class="background-index-card"><span class="time-label ${story.kind}">${kindLabels[story.kind]}</span><h2><a href="${base}background/${story.id}/">${escape(story.title)} ←</a></h2><p>${escape(story.lead)}</p><small>${fa(Object.values(chapterContexts).filter(context=>context.refs.some(ref=>ref.id===story.id)).length)} بخشِ مرتبط در راهنما</small></article>`).join("")}</div></div>`;
}

export function renderBackground(storyId,base,fromId) {
  const story=storyById.get(storyId);
  if(!story)return renderBackgroundIndex(base);
  const from=chapterById.get(fromId);
  const related=chapters.filter(chapter=>chapterContexts[chapter.id].refs.some(ref=>ref.id===storyId));
  return `<div class="page-shell background-detail"><a class="back-link" href="${from?chapterUrl(from,base):`${base}background/`}">→ ${from?`بازگشت به ${chapterLabel(from)}`:"همهٔ پیش‌داستان‌ها"}</a><article><div class="page-heading"><span class="time-label ${story.kind}">${kindLabels[story.kind]}</span><h1>${escape(story.title)}</h1><p>${escape(story.lead)}</p></div>${story.firstMention?`<p class="background-first-note">این نام از <a href="${chapterUrl(chapterById.get(story.firstMention.chapterId),base)}">سرود اول ادیسه</a>، سطرهای <bdi>${escape(story.firstMention.lines)}</bdi>، در گفتار زئوس آمده است؛ بازگوییِ مفصل‌تر آن در سرود سوم، نخستین اشاره نیست.</p>`:""}${story.parts.map(part=>`<section class="background-part"><h2>${escape(part.title)}</h2>${part.kind==="tradition"?'<span class="time-label tradition">روایت بیرون از دو منظومه</span>':part.kind==="editorial"?'<span class="time-label context">توضیح راهنما</span>':""}<p>${escape(part.text)}</p></section>`).join("")}${story.sequence.length?`<section class="background-sequence"><h2>ترتیبِ خودِ ماجرا</h2><ol>${story.sequence.map(event=>`<li>${escape(event)}</li>`).join("")}</ol><p>جای بازگویی این رویدادها در منظومه می‌تواند با ترتیب رخ دادنشان فرق داشته باشد.</p></section>`:""}<section class="background-people"><h2>نام‌های این پرونده</h2><div class="people-chips">${story.people.map(id=>{const person=readingNameById.get(id);return `<a class="person-chip" href="${base}${person.path}">${escape(person.name)}</a>`;}).join("")}</div></section><section class="background-sources"><h2>از کجا می‌دانیم؟</h2><p>این متن، توضیح تألیفیِ راهنماست. مأخذِ روایت‌ها در زیر آمده؛ بخش‌های بیرون از دو منظومه جدا مشخص شده‌اند.</p><ul>${story.sources.map(source=>`<li><a href="${escape(source.href)}" target="_blank" rel="noopener noreferrer">${escape(source.label)} ↗</a>${source.work?` · <a href="${chapterUrl(chapters.find(chapter=>chapter.work===source.work&&chapter.number===source.book),base)}">راهنمای این سرود ←</a>`:""}</li>`).join("")}</ul></section><section class="background-chapters"><h2>این پیش‌داستان کجا به خواندن کمک می‌کند؟</h2><div class="chapter-list compact">${related.map(chapter=>`<a class="chapter-row" href="${chapterUrl(chapter,base)}"><span class="chapter-row-num">${fa(chapter.number)}</span><span class="chapter-row-content"><strong>${escape(chapter.title)}</strong><small>${chapterLabel(chapter)}</small></span><span class="row-arrow" aria-hidden="true">←</span></a>`).join("")}</div></section></article></div>`;
}

export function renderReadingGuide(chapterId, annotate = escape) {
  const guide=readingGuides[chapterId];
  return `<section class="reading-guide" aria-label="راهنمای خواندن این سرود"><h2>راهنمای این ${chapterId.startsWith("bridge-")?"بخش":"سرود"}</h2>${guide?`<div class="guide-step"><strong>پیش از این چه شده؟</strong><p>${annotate(guide.before)}</p></div><div class="guide-step"><strong>حالا کجای داستانیم؟</strong><p>${annotate(guide.scene)}</p>${renderNarrativeTime(chapterId)}</div><div class="guide-step"><strong>چه چیزی را دنبال کنم؟</strong><p>${annotate(guide.focus)}</p></div>`:renderNarrativeTime(chapterId)}</section>`;
}
