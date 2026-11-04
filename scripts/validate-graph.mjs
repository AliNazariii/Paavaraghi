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
