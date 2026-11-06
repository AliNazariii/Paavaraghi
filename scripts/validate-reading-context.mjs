import assert from "node:assert/strict";
import {readFile, stat} from "node:fs/promises";
import {chapters} from "../docs/homer/story.js";
import {backgrounds, chapterContexts, namesForChapter, renderChapterBackgrounds, renderChapterNames} from "../docs/homer/reading-context.js";
import {readingNames, readingNameById, readingTerms, normalizeName} from "../docs/homer/names.js";

const sourceRoot = new URL("../docs/homer/", import.meta.url);
const chapterById = new Map(chapters.map(chapter=>[chapter.id,chapter]));
const storyIds = new Set(backgrounds.map(story=>story.id));
assert.equal(storyIds.size,backgrounds.length);
assert.equal(readingNames.length,new Set(readingNames.map(person=>person.id)).size);
for(const chapter of chapters) {
  const context=chapterContexts[chapter.id];
  assert(context && ["current","recollection","tradition"].includes(context.time),`No chronology for ${chapter.id}`);
  assert(context.text.length>40 && context.refs.length>0 && context.refs.length<=3);
  assert.equal(new Set(context.refs.map(ref=>ref.id)).size,context.refs.length);
  for(const ref of context.refs) assert(storyIds.has(ref.id) && ref.note.length>25 && ["past","current","context","tradition"].includes(ref.timing));
  const names=namesForChapter(chapter.id);
  assert(names.length>0);
  assert.equal(new Set(names.map(person=>person.id)).size,names.length);
  for(const person of names){assert(person.role?.length>10);await stat(new URL(`${person.path}index.html`,sourceRoot));}
  const route=chapter.work==="bridge"?`context/${chapter.number}/`:`${chapter.work}/book-${chapter.number}/`;
  const html=await readFile(new URL(`${route}index.html`,sourceRoot),"utf8");
  assert(html.includes(renderChapterBackgrounds(chapter.id,"/homer/")),`Missing static references: ${chapter.id}`);
  assert(html.includes(renderChapterNames(chapter.id,"/homer/")),`Missing static names: ${chapter.id}`);
  assert(html.includes(chapter.recap),`Recap must remain visible: ${chapter.id}`);
}
for(const story of backgrounds) {
  assert(story.lead && story.parts.length>=3 && story.people.length && story.sources.length);
  assert(Object.values(chapterContexts).some(context=>context.refs.some(ref=>ref.id===story.id)),`Unlinked background: ${story.id}`);
  for(const id of story.people)assert(readingNameById.has(id),`Unknown background character: ${story.id}/${id}`);
  for(const source of story.sources){assert.equal(new URL(source.href).protocol,"https:");if(source.work)assert(chapters.some(chapter=>chapter.work===source.work&&chapter.number===source.book));}
  if(story.kind==="mixed")assert(story.parts.some(part=>part.kind==="tradition"));
  const html=await readFile(new URL(`background/${story.id}/index.html`,sourceRoot),"utf8");
  for(const part of story.parts)assert(html.includes(part.text));
}
const aegisthus=backgrounds.find(story=>story.id==="agamemnon-return");
assert.equal(aegisthus.firstMention.chapterId,"odyssey-01");
assert(chapterContexts["odyssey-01"].refs.some(ref=>ref.id===aegisthus.id));
assert(chapterContexts["odyssey-03"].refs.find(ref=>ref.id===aegisthus.id).note.includes("سرود اول"));
for(const id of ["odyssey-09","odyssey-10","odyssey-11","odyssey-12"])assert.equal(chapterContexts[id].time,"recollection");
assert.equal(chapterContexts["odyssey-13"].time,"current");
assert(chapterContexts["odyssey-14"].text.includes("هویت‌پوشی"));
for(const [query,id] of [["اولیس","odysseus"],["Ulysses","odysseus"],["اژیست","aegisthus"],["Égisthe","aegisthus"],["ایگیستوس","aegisthus"],["ژوپیتر","zeus"],["مینروا","athena"],["آخایی","achaeans"],["نپتون","poseidon"]]) {
  const name=readingNameById.get(id);
  assert([name.name,name.englishName,...name.aliases].some(alias=>normalizeName(alias)===normalizeName(query)),`Alias missing: ${query}`);
}
assert.equal(normalizeName("اُوليس"),normalizeName("اولیس"));
assert.equal(normalizeName("كالیپسو"),normalizeName("کالیپسو"));
assert.equal(normalizeName("Égisthe"),normalizeName("egisthe"));
assert(!readingNameById.get("odysseus").aliases.includes("ادیسه"),"Keep poem and person distinct");
assert(!readingNameById.get("athena").aliases.includes("منتور"),"An assumed identity is not a synonym");
console.log(`Validated chronology and contextual names for ${chapters.length} sections, ${backgrounds.length} linked background dossiers, translation aliases and explicit first-mention references.`);

// Reading content is visible on arrival throughout the library.
const {stories:glass}=await import('./franny-and-zooey/content.mjs');
const {chapters:seaChapters}=await import('./ahl-e-gharq/chapters.mjs');
const {stories:moon}=await import('./nimeye-tarik-e-mah/content.mjs');
const visiblePages=[...glass.map(story=>`franny-and-zooey/${story.id}/`),...seaChapters.map(chapter=>`ahl-e-gharq/chapters/${chapter.number}/`),...moon.map(story=>`nimeye-tarik-e-mah/stories/${story.id}/`)];
for(const route of visiblePages){const html=await readFile(new URL(`../docs/${route}index.html`,import.meta.url),"utf8");assert(html.includes('<details class="spoiler" id="after" open>'),`Reading notes hidden: ${route}`);}
console.log(`Validated ${visiblePages.length} story/chapter recaps shown by default across the other guides.`);
