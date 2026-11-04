import {chapters, characters} from "./story.js?v=7";

const escape = value => String(value).replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[char]);
const faNum = value => Number(value).toLocaleString("fa-IR");
export const graphGroups = [...new Set(characters.map(person => person.group))].map((name, index) => ({name, color: ["#9a6335", "#a44f51", "#347c71", "#5e68a2", "#407f9f", "#846795", "#747245"][index]}));
export const graphEdges = characters.flatMap((person, index) => characters.slice(index + 1).flatMap(other => {
  const shared = chapters.filter(chapter => chapter.characters.includes(person.id) && chapter.characters.includes(other.id)).length;
  return shared ? [{source: person.id, target: other.id, shared}] : [];
}));

// A deterministic force layout keeps the complete graph stable between visits.
function layoutGraph() {
  const nodes = characters.map((person, index) => {
    const group = graphGroups.findIndex(item => item.name === person.group);
    const angle = group / graphGroups.length * Math.PI * 2 - Math.PI / 2;
    return {...person, color: graphGroups[group].color, x: 550 + Math.cos(angle) * 290 + Math.cos(index * 2.4) * 100, y: 410 + Math.sin(angle) * 250 + Math.sin(index * 2.4) * 80, homeX: 550 + Math.cos(angle) * 290, homeY: 410 + Math.sin(angle) * 250};
  });
  const byId = new Map(nodes.map(node => [node.id, node]));
  for (let step = 0; step < 420; step++) {
    const forces = new Map(nodes.map(node => [node.id, {x: (550 - node.x) * .003 + (node.homeX - node.x) * .005, y: (410 - node.y) * .003 + (node.homeY - node.y) * .005}]));
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x || .1, dy = a.y - b.y || .1;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = 16000 / (distance * distance);
      forces.get(a.id).x += dx / distance * force;
      forces.get(a.id).y += dy / distance * force;
      forces.get(b.id).x -= dx / distance * force;
      forces.get(b.id).y -= dy / distance * force;
    }
    for (const edge of graphEdges) {
      const a = byId.get(edge.source), b = byId.get(edge.target);
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance - 190) * .0006 * Math.sqrt(edge.shared);
      forces.get(a.id).x += dx / distance * force;
      forces.get(a.id).y += dy / distance * force;
      forces.get(b.id).x -= dx / distance * force;
      forces.get(b.id).y -= dy / distance * force;
    }
    for (const node of nodes) {
      node.x = Math.max(70, Math.min(1030, node.x + forces.get(node.id).x));
      node.y = Math.max(45, Math.min(775, node.y + forces.get(node.id).y));
    }
    // Resolve label collisions as rectangles rather than point-sized nodes.
    for (let pass = 0; pass < 3; pass++) for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x || .1, dy = a.y - b.y || .1;
      const overlapX = 132 - Math.abs(dx), overlapY = 80 - Math.abs(dy);
      if (overlapX <= 0 || overlapY <= 0) continue;
      if (overlapX < overlapY) {
        a.x += Math.sign(dx) * overlapX / 2; b.x -= Math.sign(dx) * overlapX / 2;
      } else {
        a.y += Math.sign(dy) * overlapY / 2; b.y -= Math.sign(dy) * overlapY / 2;
      }
    }
  }
  return nodes;
}

export const graphNodes = layoutGraph();
const nodeById = new Map(graphNodes.map(node => [node.id, node]));

export function graphModes(basePath, all = false) {
  return `<nav class="graph-modes" aria-label="حالت نمایش گراف"><a href="${basePath}graph/#graph/achilles" ${!all ? 'aria-current="page"' : ""}>شخصیت مرکزی</a><a href="${basePath}graph/#graph/all" ${all ? 'aria-current="page"' : ""}>همهٔ شخصیت‌ها</a></nav>`;
}

export function renderAllGraph(basePath, interactive = true) {
  return `<section class="graph-overview" aria-label="گراف همهٔ شخصیت‌ها">
    <div class="graph-overview-toolbar"><p><strong>${faNum(characters.length)} شخصیت</strong> · ${faNum(graphEdges.length)} پیوند</p><div class="graph-zoom" ${interactive ? "" : "hidden"} role="group" aria-label="بزرگ‌نمایی گراف"><button type="button" data-graph-zoom="in" aria-label="بزرگ‌نمایی">+</button><button type="button" data-graph-zoom="out" aria-label="کوچک‌نمایی" disabled>−</button><button type="button" data-graph-zoom="reset">نمای کامل</button><output id="graph-zoom-value" aria-live="polite">۱۰۰٪</output></div></div>
    <p class="graph-help" id="graph-help">${interactive ? "روی هر نام برو یا با کلید Tab انتخابش کن تا پیوندهایش روشن شوند؛ برای باز کردن صفحهٔ شخصیت روی نامش بزن. پس از بزرگ‌نمایی، گراف را با پیمایش جابه‌جا کن." : "برای باز کردن صفحهٔ هر شخصیت روی نامش بزن. با فعال کردن جاوااسکریپت، جابه‌جایی بین حالت‌ها و بزرگ‌نمایی گراف هم در دسترس است."}</p>
    <div class="graph-overview-viewport" tabindex="0" role="region" aria-label="ناحیهٔ قابل پیمایش گراف" aria-describedby="graph-help"><svg class="graph-overview-svg" viewBox="0 0 1100 820" width="1100" height="820" role="group" aria-label="همهٔ شخصیت‌ها و پیوندهای حضور مشترکشان">
      <g class="graph-overview-edges" aria-hidden="true">${graphEdges.map(edge => {const a = nodeById.get(edge.source), b = nodeById.get(edge.target); return `<line data-source="${edge.source}" data-target="${edge.target}" x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}" stroke-width="${Math.min(.6 + edge.shared * .18, 3)}"/>`;}).join("")}</g>
      ${graphNodes.map(node => `<a class="graph-overview-node" data-graph-node="${node.id}" href="${basePath}characters/${node.id}/" aria-label="${escape(node.name)} (${escape(node.englishName)})؛ ${escape(node.group)}؛ باز کردن صفحهٔ شخصیت" style="--group-color:${node.color}"><title>${escape(node.name)} — ${escape(node.group)}</title><rect x="${(node.x - 59).toFixed(2)}" y="${(node.y - 29).toFixed(2)}" width="118" height="58" rx="16"/><text x="${node.x.toFixed(2)}" y="${(node.y - 1).toFixed(2)}" text-anchor="middle" direction="rtl">${escape(node.name)}</text><text class="graph-english-label" x="${node.x.toFixed(2)}" y="${(node.y + 17).toFixed(2)}" text-anchor="middle" lang="en" direction="ltr">${escape(node.englishName)}</text></a>`).join("")}
    </svg></div>
    <ul class="graph-legend" aria-label="گروه‌های شخصیت‌ها">${graphGroups.map(group => `<li><span style="background:${group.color}" aria-hidden="true"></span>${escape(group.name)}</li>`).join("")}</ul>
  </section>`;
}

export function relatedCharacters(id, limit = 7) {
  return graphEdges.filter(edge => edge.source === id || edge.target === id)
    .map(edge => ({person: characters.find(person => person.id === (edge.source === id ? edge.target : edge.source)), shared: edge.shared}))
    .sort((a, b) => b.shared - a.shared || characters.indexOf(a.person) - characters.indexOf(b.person))
    .slice(0, limit);
}

export function renderCenteredGraph(id, basePath, profileLinks = false) {
  const center = characters.find(person => person.id === id);
  const related = relatedCharacters(id);
  const cx = 300, cy = 230, radius = 178;
  const positions = related.map((item, index) => ({...item,
    x: cx + Math.cos(index / related.length * Math.PI * 2 - Math.PI / 2) * radius,
    y: cy + Math.sin(index / related.length * Math.PI * 2 - Math.PI / 2) * radius
  }));
  const centerContent = `<strong>${escape(center.name)}</strong><small>${profileLinks ? "در مرکز گراف" : "شناختن شخصیت"}</small>`;
  return `<div class="graph-canvas" role="group" aria-label="نمودار پیوندهای ${escape(center.name)} با شخصیت‌های مرتبط">
    <svg viewBox="0 0 600 460" preserveAspectRatio="none" aria-hidden="true">${positions.map(node => `<line x1="${cx}" y1="${cy}" x2="${node.x}" y2="${node.y}" stroke="#bfa97c" stroke-width="${Math.min(1 + node.shared * .45, 6)}" opacity=".65"/>`).join("")}</svg>
    ${profileLinks ? `<span class="graph-node center" style="left:50%;top:50%">${centerContent}</span>` : `<a class="graph-node center" href="${basePath}characters/${center.id}/" style="left:50%;top:50%">${centerContent}</a>`}
    ${positions.map(node => `<a class="graph-node" href="${basePath}${profileLinks ? `characters/${node.person.id}/` : `graph/#graph/${node.person.id}`}" style="left:${node.x / 6}%;top:${node.y / 4.6}%" title="${faNum(node.shared)} بخش مشترک"><strong>${escape(node.person.name)}</strong><small>${faNum(node.shared)} بخش مشترک</small></a>`).join("")}
  </div>`;
}

export function renderProfileGraph(id, basePath) {
  const person = characters.find(person => person.id === id);
  return `<section class="person-graph" aria-labelledby="person-graph-heading"><div class="person-graph-heading"><h2 id="person-graph-heading">پیوندهای ${escape(person.name)}</h2><a class="text-link" href="${basePath}graph/#graph/${id}">باز کردن گراف ←</a></div><p>شخصیت‌های پیرامون، بیشترین بخش‌های مشترک را با ${escape(person.name)} دارند. خط‌ها نشانهٔ حضور مشترک در راهنما هستند؛ به‌تنهایی نسبت خانوادگی یا دوستی را نشان نمی‌دهند. با زدن روی هر نام، صفحهٔ همان شخصیت باز می‌شود.</p>${renderCenteredGraph(id, basePath, true)}<a class="text-link person-graph-all" href="${basePath}graph/#graph/all">دیدن همهٔ شخصیت‌ها در یک گراف ←</a></section>`;
}
