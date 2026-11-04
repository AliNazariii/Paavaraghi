import {chapters, characters, extraGlossary, readingGuides} from "./story.js?v=7";

// These groups describe the guide's narrative contexts, rather than ancestry.
const additionalGroups = {
  "یونانیان": "orestes pisistratus aegisthus chryseis calchas thersites phoenix meleager machaon eurypylus idomeneus meriones antilochus xanthus-horse",
  "ترواییان": "glaucus hecuba astyanax pandarus dolon rhesus polydamas sarpedon euphorbus lycaon agenor deiphobus aeneas",
  "ایتاکا": "antinous theoclymenus argos-dog melanthius irus amphinomus eurymachus melantho philoetius ctesippus phemius medon eupeithes laertes",
  "خدایان": "proteus ino apollo ares hypnos hermes hephaestus helios",
  "سفر اودیسئوس": "eurylochus elpenor aeolus scylla charybdis",
  "فایاک‌ها": "arete demodocus",
  "جهان مردگان": "anticleia",
  "پیرامون تروا": "chryses"
};
const glossaryById = new Map(extraGlossary.map(term => [term.id, term]));
const englishNames = {"argos-dog": "Argos", "xanthus-horse": "Xanthus"};
const normalize = value => String(value).replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\u064b-\u065f\u0670]/g, "").replace(/\u200c/g, " ");
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const additionalCharacters = Object.entries(additionalGroups).flatMap(([group, ids]) => ids.split(" ").map(id => {
  const term = glossaryById.get(id);
  if (!term) throw new Error(`Missing character glossary entry: ${id}`);
  const names = id === "xanthus-horse" ? ["زانتوس"] : [term.name];
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${names.map(name => escapeRegex(normalize(name))).join("|")})(?![\\p{L}\\p{N}])`, "u");
  // Hypnos's name is also an ordinary Persian word; use his specific scene.
  const chapterIds = id === "hypnos" ? ["iliad-14"] : id === "xanthus-horse" ? ["iliad-19"] : chapters.filter(chapter => pattern.test(normalize(`${chapter.title} ${chapter.recap} ${chapter.why} ${Object.values(readingGuides[chapter.id] || {}).join(" ")}`))).map(chapter => chapter.id);
  return {id, name: term.name, englishName: englishNames[id] || id[0].toUpperCase() + id.slice(1), group, bio: term.description, additional: true, chapterIds, path: `terms/${id}/`};
}));

export const overviewCharacters = [...characters.map(person => ({...person, additional: false, chapterIds: chapters.filter(chapter => chapter.characters.includes(person.id)).map(chapter => chapter.id), path: `characters/${person.id}/`})), ...additionalCharacters];
export const overviewEdges = overviewCharacters.flatMap((person, index) => overviewCharacters.slice(index + 1).flatMap(other => {
  const chapterIds = person.chapterIds.filter(id => other.chapterIds.includes(id));
  return chapterIds.length ? [{source: person.id, target: other.id, shared: chapterIds.length}] : [];
}));
