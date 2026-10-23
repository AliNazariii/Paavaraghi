import {chapters, characters, places, sourceLink} from "../docs/story.js";

const ids = new Set();
const characterIds = new Set(characters.map(item => item.id));
const placeIds = new Set(places.map(item => item.id));

for (const chapter of chapters) {
  if (ids.has(chapter.id)) throw new Error(`Duplicate chapter: ${chapter.id}`);
  ids.add(chapter.id);
  if (!chapter.title || !chapter.recap || !chapter.why || !chapter.source) throw new Error(`Incomplete chapter: ${chapter.id}`);
  if (!placeIds.has(chapter.place)) throw new Error(`Unknown place in ${chapter.id}: ${chapter.place}`);
  for (const id of chapter.characters) if (!characterIds.has(id)) throw new Error(`Unknown character in ${chapter.id}: ${id}`);
  if (chapter.work !== "bridge" && !sourceLink(chapter)) throw new Error(`Missing source link: ${chapter.id}`);
}

for (const [work, expected] of [["iliad", 24], ["bridge", 3], ["odyssey", 24]]) {
  const actual = chapters.filter(item => item.work === work).length;
  if (actual !== expected) throw new Error(`${work}: expected ${expected}, got ${actual}`);
}

console.log(`Validated ${chapters.length} chapters, ${characters.length} characters, ${places.length} places.`);
