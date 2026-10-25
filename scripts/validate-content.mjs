import {chapters, characters, places, readingGuides, extraGlossary, sourceLink} from "../docs/homer/story.js";

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
