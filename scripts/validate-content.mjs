import {chapters, characters, places, readingGuides, extraGlossary, sourceLink} from "../docs/homer/story.js";
import {stories, characters as glassCharacters, themes, sources} from "./franny-and-zooey/content.mjs";

const ids = new Set();
const characterIds = new Set(characters.map(item => item.id));
const placeIds = new Set(places.map(item => item.id));

for (const chapter of chapters) {
  if (ids.has(chapter.id)) throw new Error(`Duplicate chapter: ${chapter.id}`);
  ids.add(chapter.id);
  if (!chapter.title || !chapter.recap || !chapter.why || !chapter.source) throw new Error(`Incomplete chapter: ${chapter.id}`);
  if (!placeIds.has(chapter.place)) throw new Error(`Unknown place in ${chapter.id}: ${chapter.place}`);
  for (const id of chapter.characters) if (!characterIds.has(id)) throw new Error(`Unknown character in ${chapter.id}: ${id}`);
  if (!sourceLink(chapter)) throw new Error(`Missing source link: ${chapter.id}`);
}

for (const [id, guide] of Object.entries(readingGuides)) {
  if (!ids.has(id) || !guide.before || !guide.scene || !guide.focus) throw new Error(`Incomplete reading guide: ${id}`);
}
const termIds = new Set();
for (const term of extraGlossary) {
  if (!term.id || termIds.has(term.id) || !term.name || !term.description || (term.characterId && !characterIds.has(term.characterId)) || (term.placeId && !placeIds.has(term.placeId))) throw new Error(`Invalid glossary term: ${term.name}`);
  termIds.add(term.id);
}

for (const [work, expected] of [["iliad", 24], ["bridge", 3], ["odyssey", 24]]) {
  const actual = chapters.filter(item => item.work === work).length;
  if (actual !== expected) throw new Error(`${work}: expected ${expected}, got ${actual}`);
}

console.log(`Validated ${chapters.length} chapters, ${characters.length} characters, ${places.length} places.`);

const uniqueIds = (items, label) => {
  const seen = new Set();
  for (const item of items) {
    if (!item.id || seen.has(item.id)) throw new Error(`Invalid ${label} ID: ${item.id}`);
    seen.add(item.id);
  }
  return seen;
};
const glassIds = uniqueIds(glassCharacters, "Glass character");
const sourceIds = uniqueIds(sources, "Franny and Zooey source");
uniqueIds(stories, "Franny and Zooey story");
uniqueIds(themes, "Franny and Zooey theme");
if (stories.map(story => story.id).join(",") !== "franny,zooey") throw new Error("Keep the two original stories in reading order.");
for (const story of stories) {
  for (const field of ["title", "description", "introduction", "scene", "recap"]) {
    if (!story[field]?.trim()) throw new Error(`Missing ${field} for ${story.id}`);
  }
  if (!sourceIds.has(story.source)) throw new Error(`Unknown source for ${story.id}`);
  if (!story.people.length || story.people.some(id => !glassIds.has(id))) throw new Error(`Invalid people for ${story.id}`);
  if (!story.prompts.length || story.prompts.some(prompt => !prompt.title || !prompt.text) || !story.discussion.length || story.discussion.some(text => !text.trim())) throw new Error(`Incomplete reading notes for ${story.id}`);
}
for (const source of sources) {
  if (new URL(source.url).protocol !== "https:" || !source.title || !source.note) throw new Error(`Invalid source: ${source.id}`);
}
for (const person of glassCharacters) {
  if (!person.name || !person.english || !person.role || !person.bio) throw new Error(`Incomplete character: ${person.id}`);
}
for (const theme of themes) {
  if (!theme.title || !theme.text || !theme.question) throw new Error(`Incomplete theme: ${theme.id}`);
}
console.log(`Validated Franny and Zooey: ${stories.length} stories, ${glassCharacters.length} characters, ${sources.length} sources.`);
