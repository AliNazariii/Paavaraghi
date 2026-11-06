import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import {resolve, join, sep} from 'node:path';
import {chapters, arcs} from './ahl-e-gharq/chapters.mjs';
import {characters, glossary, essays, sources} from './ahl-e-gharq/content.mjs';
import {BASE_PATH, SITE_URL, docsRoot} from './site-config.mjs';

const unique = (items, label) => {
  const ids = items.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length, `Duplicate ${label} IDs`);
  assert(ids.every(id => /^[a-z][a-z0-9-]*$/.test(id)), `Invalid ${label} ID`);
  return new Set(ids);
};
const characterIds = unique(characters, 'character');
const sourceIds = unique(sources, 'source');
unique(chapters, 'chapter');
unique(arcs, 'arc');
unique(glossary, 'glossary');
unique(essays, 'essay');
const validChapter = number => Number.isInteger(number) && number >= 1 && number <= chapters.length;

assert.equal(chapters.length, 34, 'The reference edition has 34 numbered chapters');
for (const [index, chapter] of chapters.entries()) {
  assert.equal(chapter.number, index + 1, 'Chapters must stay in source order');
  assert.equal(chapter.id, `chapter-${chapter.number}`);
  for (const key of ['title', 'scene', 'before', 'focus', 'recap', 'reading']) {
    assert(chapter[key]?.trim(), `Chapter ${chapter.number}: missing ${key}`);
  }
  assert(chapter.people.length && chapter.people.every(id => characterIds.has(id)), `Unknown person in chapter ${chapter.number}`);
  const matchingArcs = arcs.filter(arc => chapter.number >= arc.range[0] && chapter.number <= arc.range[1]);
  assert.equal(matchingArcs.length, 1, `Overlapping/missing reading arc for chapter ${chapter.number}`);
  assert.equal(chapter.arc, matchingArcs[0].id);
  const [start, end] = chapter.scanPages;
  assert(start <= end && end <= 399, 'Invalid source scan page range');
  if (index) assert.equal(start, chapters[index - 1].scanPages[1] + 1, 'Gap in source scan references');
}
for (const person of characters) {
  assert(person.name && person.bio && person.question);
  assert(person.chapters.length && person.chapters.every(validChapter), `Invalid chapter for ${person.id}`);
}
for (const term of glossary) assert(term.name && term.text && validChapter(term.chapter), `Invalid glossary entry ${term.id}`);
for (const essay of essays) {
  assert(essay.title && essay.question && essay.paragraphs.length >= 2, `Incomplete essay ${essay.id}`);
  assert(essay.chapters.every(validChapter), `Invalid chapter in essay ${essay.id}`);
  assert(essay.sources.length && essay.sources.every(id => sourceIds.has(id)), `Unknown source in essay ${essay.id}`);
}
for (const source of sources) {
  assert(source.title && source.kind && source.note);
  assert.equal(new URL(source.url).protocol, 'https:');
}

const root = resolve(docsRoot);
const bookRoot = join(root, 'ahl-e-gharq');
const pages = [];
async function collect(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.name === 'index.html') pages.push(file);
  }
}
await collect(bookRoot);
assert.equal(pages.length, chapters.length + 6, 'Missing or stale book pages');
const htmlCache = new Map();
async function htmlAt(file) {
  if (!htmlCache.has(file)) htmlCache.set(file, await readFile(file, 'utf8'));
  return htmlCache.get(file);
}

// Check fragment targets as well as assets: these links connect the reading
// notes to specific characters, concepts and citations across forty pages.
for (const file of pages) {
  const html = await htmlAt(file);
  const relative = file.slice(root.length + 1).replace(/index\.html$/, '');
  const pageUrl = new URL(relative, SITE_URL);
  assert(html.includes('<html lang="fa" dir="rtl">'), `Missing RTL metadata: ${relative}`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate element IDs: ${relative}`);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(raw.replaceAll('&amp;', '&'), pageUrl);
    if (url.origin !== pageUrl.origin) continue;
    assert(url.pathname.startsWith(BASE_PATH), `Link escapes base path: ${raw}`);
    const path = decodeURIComponent(url.pathname.slice(BASE_PATH.length));
    const target = resolve(root, path, url.pathname.endsWith('/') ? 'index.html' : '');
    assert(target.startsWith(root + sep), `Unsafe asset/link: ${raw}`);
    await stat(target);
    if (url.hash && target.endsWith('.html')) {
      const targetHtml = await htmlAt(target);
      assert(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Broken anchor ${raw} in ${relative}`);
    }
  }
}
for (const chapter of chapters) {
  const html = await htmlAt(join(bookRoot, 'chapters', String(chapter.number), 'index.html'));
  assert(html.includes(`data-mark-read="${chapter.id}"`));
  assert(html.includes('<details class="spoiler" id="after" open>'));
}
const fontCss = await readFile(join(bookRoot, 'fonts/font.css'), 'utf8');
for (const [, filename] of fontCss.matchAll(/url\(([^)]+)\)/g)) await stat(join(bookRoot, 'fonts', filename));
await stat(join(bookRoot, 'fonts/OFL.txt'));
const cover = await readFile(join(bookRoot, 'share-cover.png'));
assert.equal(cover.subarray(1, 4).toString(), 'PNG', 'Missing PNG share cover');
console.log(`Validated Ahl-e Gharq: ${chapters.length} chapters, ${characters.length} people, ${glossary.length} terms, ${essays.length} essays and ${pages.length} linked pages.`);
