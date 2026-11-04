import {readFile} from "node:fs/promises";
import assert from "node:assert/strict";
import {chapters, characters} from "../docs/homer/story.js";
import {graphNodes, graphEdges, renderAllGraph, relatedCharacters, renderProfileGraph} from "../docs/homer/graph.js";

assert.deepEqual(new Set(graphNodes.map(node => node.id)), new Set(characters.map(person => person.id)));
const edgeByPair = new Map(graphEdges.map(edge => [`${edge.source}/${edge.target}`, edge]));
assert.equal(edgeByPair.size, graphEdges.length, "Duplicate graph edges");
for (let i = 0; i < characters.length; i++) for (let j = i + 1; j < characters.length; j++) {
  const a = characters[i], b = characters[j];
  const expected = chapters.filter(chapter => chapter.characters.includes(a.id) && chapter.characters.includes(b.id)).length;
  assert.equal(edgeByPair.get(`${a.id}/${b.id}`)?.shared || 0, expected, `Wrong shared-section count: ${a.id}/${b.id}`);
}
for (let i = 0; i < graphNodes.length; i++) {
  const node = graphNodes[i];
  assert(Number.isFinite(node.x) && Number.isFinite(node.y), `Invalid position: ${node.id}`);
  assert(node.x >= 60 && node.x <= 1040 && node.y >= 30 && node.y <= 790, `Clipped node: ${node.id}`);
  for (const other of graphNodes.slice(i + 1)) {
    assert(Math.abs(node.x - other.x) >= 118 || Math.abs(node.y - other.y) >= 58, `Overlapping labels: ${node.id}/${other.id}`);
  }
}
const html = renderAllGraph("/homer/");
for (const person of characters) assert(html.includes(`href="/homer/characters/${person.id}/"`), `Missing profile link: ${person.id}`);
console.log(`Validated complete graph: ${graphNodes.length} nodes, ${graphEdges.length} weighted edges, unclipped labels and profile links.`);

for (const person of characters) {
  const related = relatedCharacters(person.id);
  assert(related.length <= 7);
  assert(related.every(item => item.person.id !== person.id && item.shared > 0));
  const expected = graphEdges.filter(edge => edge.source === person.id || edge.target === person.id).map(edge => edge.shared).sort((a, b) => b - a).slice(0, 7);
  assert.deepEqual(related.map(item => item.shared), expected);
  const profileGraph = renderProfileGraph(person.id, "/homer/");
  const html = await readFile(new URL(`../docs/homer/characters/${person.id}/index.html`, import.meta.url), "utf8");
  assert(html.includes(profileGraph), `Missing centered graph on profile: ${person.id}`);
  for (const item of related) assert(profileGraph.includes(`href="/homer/characters/${item.person.id}/"`));
  assert(profileGraph.includes(`<strong>${person.name}</strong><small>در مرکز گراف</small>`));
}
console.log(`Validated centered graphs and strongest related characters on all ${characters.length} profiles.`);

const {additionalCharacters, overviewCharacters, overviewEdges, overviewNodes, graphGroups, selectOverview} = await import('../docs/homer/graph.js');
assert.equal(new Set(overviewCharacters.map(person => person.id)).size, overviewCharacters.length);
assert.equal(overviewCharacters.filter(person => person.name === 'آرگوس').length, 1, 'Duplicate Argos');
const peopleById = new Map(overviewCharacters.map(person => [person.id, person]));
for (const person of additionalCharacters) {
  assert(person.chapterIds.length > 0, `No evidence for ${person.id}`);
  assert(person.chapterIds.every(id => chapters.some(chapter => chapter.id === id)));
  await readFile(new URL(`../docs/homer/${person.path}index.html`, import.meta.url));
}
assert.deepEqual(peopleById.get('xanthus-horse').chapterIds, ['iliad-19'], 'Do not confuse horse Xanthus with the river');
assert.deepEqual(peopleById.get('hypnos').chapterIds, ['iliad-14'], 'Do not count ordinary sleep as Hypnos');
for (const edge of overviewEdges) {
  const a = peopleById.get(edge.source), b = peopleById.get(edge.target);
  assert(a && b && a !== b);
  assert.equal(edge.shared, a.chapterIds.filter(id => b.chapterIds.includes(id)).length);
}
for (let i = 0; i < overviewNodes.length; i++) {
  const node = overviewNodes[i];
  assert(node.x >= 60 && node.x <= 1840 && node.y >= 30 && node.y <= 1390, `Expanded node clipped: ${node.id}`);
  for (const other of overviewNodes.slice(i + 1)) assert(Math.abs(node.x - other.x) >= 118 || Math.abs(node.y - other.y) >= 58, `Expanded labels overlap: ${node.id}/${other.id}`);
}
for (const expanded of [false, true]) for (let mask = 0; mask < 2 ** graphGroups.length; mask++) {
  const hidden = graphGroups.filter((_, i) => mask & (1 << i)).map(group => group.name);
  const selected = selectOverview(expanded, hidden);
  const ids = new Set(selected.nodes.map(person => person.id));
  assert(selected.nodes.every(person => !hidden.includes(person.group)));
  assert(selected.edges.every(edge => ids.has(edge.source) && ids.has(edge.target)));
}
assert.equal(selectOverview(true, graphGroups.map(group => group.name)).nodes.length, 0);
assert.equal(selectOverview(false).nodes.length, characters.length);
console.log(`Validated ${additionalCharacters.length} additional names, ${overviewEdges.length} expanded links, evidence, unique labels and every group-filter combination.`);
