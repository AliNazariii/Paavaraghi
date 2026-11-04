import {chapters, characters} from "./story.js?v=7";

import {additionalCharacters, overviewCharacters, overviewEdges} from "./graph-characters.js?v=1";
export {additionalCharacters, overviewCharacters, overviewEdges};

const escape = value => String(value).replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[char]);
const faNum = value => Number(value).toLocaleString("fa-IR");
export const graphGroups = [...new Set(overviewCharacters.map(person => person.group))].map((name, index) => ({name, color: ["#9a6335", "#a44f51", "#347c71", "#5e68a2", "#407f9f", "#846795", "#747245", "#7a6a57"][index]}));
export const graphEdges = characters.flatMap((person, index) => characters.slice(index + 1).flatMap(other => {
  const shared = chapters.filter(chapter => chapter.characters.includes(person.id) && chapter.characters.includes(other.id)).length;
  return shared ? [{source: person.id, target: other.id, shared}] : [];
}));

// A deterministic force layout keeps the complete graph stable between visits.
function layoutGraph(people = characters, edges = graphEdges, width = 1100, height = 820) {
  const nodes = people.map((person, index) => {
    const group = graphGroups.findIndex(item => item.name === person.group);
    const angle = group / graphGroups.length * Math.PI * 2 - Math.PI / 2;
    return {...person, color: graphGroups[group].color, x: width / 2 + Math.cos(angle) * width * .27 + Math.cos(index * 2.4) * 100, y: height / 2 + Math.sin(angle) * height * .3 + Math.sin(index * 2.4) * 80, homeX: width / 2 + Math.cos(angle) * width * .27, homeY: height / 2 + Math.sin(angle) * height * .3};
  });
  const byId = new Map(nodes.map(node => [node.id, node]));
  for (let step = 0; step < 420; step++) {
    const forces = new Map(nodes.map(node => [node.id, {x: (width / 2 - node.x) * .003 + (node.homeX - node.x) * .005, y: (height / 2 - node.y) * .003 + (node.homeY - node.y) * .005}]));
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
    for (const edge of edges) {
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
      node.x = Math.max(70, Math.min(width - 70, node.x + forces.get(node.id).x));
      node.y = Math.max(45, Math.min(height - 45, node.y + forces.get(node.id).y));
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
export const overviewNodes = layoutGraph(overviewCharacters, overviewEdges, 1900, 1420);

export function graphModes(basePath, all = false) {
  return `<nav class="graph-modes" aria-label="حالت نمایش گراف"><a href="${basePath}graph/#graph/achilles" ${!all ? 'aria-current="page"' : ""}>شخصیت مرکزی</a><a href="${basePath}graph/#graph/all" ${all ? 'aria-current="page"' : ""}>همهٔ شخصیت‌ها</a></nav>`;
}

export function selectOverview(includeAdditional = false, hiddenGroups = []) {
  const hidden = new Set(hiddenGroups);
  const candidates = includeAdditional ? overviewNodes : graphNodes.map(node => ({...node, additional: false, path: `characters/${node.id}/`}));
  const nodes = candidates.filter(node => !hidden.has(node.group));
  const ids = new Set(nodes.map(node => node.id));
  const edges = (includeAdditional ? overviewEdges : graphEdges).filter(edge => ids.has(edge.source) && ids.has(edge.target));
  return {nodes, edges, candidates, width: includeAdditional ? 1900 : 1100, height: includeAdditional ? 1420 : 820};
}

export function renderOverviewNodes(basePath, selection) {
  const byId = new Map(selection.nodes.map(node => [node.id, node]));
  return `<g class="graph-overview-edges" aria-hidden="true">${selection.edges.map(edge => {const a = byId.get(edge.source), b = byId.get(edge.target); return `<line data-source="${edge.source}" data-target="${edge.target}" x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}" stroke-width="${Math.min(.6 + edge.shared * .18, 3)}"/>`;}).join("")}</g>
  ${selection.nodes.map(node => `<a class="graph-overview-node${node.additional ? " is-additional" : ""}" data-graph-node="${node.id}" href="${basePath}${node.path}" aria-label="${escape(node.name)} (${escape(node.englishName)})؛ ${escape(node.group)}؛ باز کردن معرفی شخصیت" style="--group-color:${node.color}"><title>${escape(node.name)} — ${escape(node.group)}</title><rect x="${(node.x - 59).toFixed(2)}" y="${(node.y - 29).toFixed(2)}" width="118" height="58" rx="16"/><text x="${node.x.toFixed(2)}" y="${(node.y - 1).toFixed(2)}" text-anchor="middle" direction="rtl">${escape(node.name)}</text><text class="graph-english-label" x="${node.x.toFixed(2)}" y="${(node.y + 17).toFixed(2)}" text-anchor="middle" lang="en" direction="ltr">${escape(node.englishName)}</text></a>`).join("")}`;
}

export function renderAllGraph(basePath, interactive = true, filters = {}) {
  const selection = selectOverview(filters.includeAdditional, filters.hiddenGroups);
  return `<section class="graph-overview" aria-label="گراف همهٔ شخصیت‌ها">
    <div class="graph-overview-toolbar"><p data-graph-summary aria-live="polite"><strong>${faNum(selection.nodes.length)} شخصیت</strong> از ${faNum(selection.candidates.length)} · ${faNum(selection.edges.length)} پیوند</p><div class="graph-zoom" ${interactive ? "" : "hidden"} role="group" aria-label="بزرگ‌نمایی گراف"><button type="button" data-graph-zoom="in" aria-label="بزرگ‌نمایی">+</button><button type="button" data-graph-zoom="out" aria-label="کوچک‌نمایی" disabled>−</button><button type="button" data-graph-zoom="reset">نمای کامل</button><output id="graph-zoom-value" aria-live="polite">۱۰۰٪</output></div></div>
    <div class="graph-filter-panel" ${interactive ? "" : "hidden"}><div class="graph-filter-heading"><strong>گروه‌های قابل نمایش</strong><button type="button" data-graph-reset>بازنشانی فیلترها</button></div><div class="graph-group-filters" role="group" aria-label="نمایش یا پنهان کردن گروه‌ها">${graphGroups.map(group => {const count = selection.candidates.filter(node => node.group === group.name).length; return `<button type="button" data-graph-group="${escape(group.name)}" aria-pressed="${!new Set(filters.hiddenGroups).has(group.name)}" style="--group-color:${group.color}" ${count ? "" : "hidden"}><span class="graph-group-dot" aria-hidden="true"></span>${escape(group.name)} <span data-group-count>${faNum(count)}</span></button>`;}).join("")}</div><button type="button" class="graph-additional-toggle" data-graph-additional aria-pressed="${Boolean(filters.includeAdditional)}">شخصیت‌های بیشتر <span>+${faNum(additionalCharacters.length)}</span></button><p>نمای پیش‌فرض، ${faNum(characters.length)} شخصیتِ فهرست اصلی راهنماست. نام‌های بیشتر از واژه‌نامهٔ همین راهنما اضافه می‌شوند؛ این فهرست شامل همهٔ نام‌های متن هومر نیست.</p></div>
    <p class="graph-help" id="graph-help">${interactive ? "برای پنهان یا آشکار کردن هر گروه روی نامش بزن. روی هر شخصیت برو یا با کلید Tab انتخابش کن تا پیوندهایش روشن شوند؛ با زدن روی نام، معرفی او باز می‌شود." : "برای باز کردن معرفی هر شخصیت روی نامش بزن. با فعال کردن جاوااسکریپت، فیلتر گروه‌ها، شخصیت‌های بیشتر و بزرگ‌نمایی هم در دسترس است."}</p>
    <p class="graph-empty" data-graph-empty ${selection.nodes.length ? "hidden" : ""} role="status">همهٔ گروه‌ها پنهان شده‌اند. یک گروه را روشن کن یا فیلترها را بازنشانی کن.</p>
    <div class="graph-overview-viewport" ${selection.nodes.length ? "" : "hidden"} tabindex="0" role="region" aria-label="ناحیهٔ قابل پیمایش گراف" aria-describedby="graph-help"><svg class="graph-overview-svg" viewBox="0 0 ${selection.width} ${selection.height}" width="${selection.width}" height="${selection.height}" role="group" aria-label="شخصیت‌ها و پیوندهای حضور مشترکشان">${renderOverviewNodes(basePath, selection)}</svg></div>
    <p class="graph-more-note">پیوندها بر پایهٔ حضور نام‌ها در بخش‌های راهنما هستند؛ اندازهٔ نقش یا نسبت خانوادگی را نشان نمی‌دهند.</p>
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
  return `<section class="person-graph" aria-labelledby="person-graph-heading"><div class="person-graph-heading"><h2 id="person-graph-heading">پیوندهای ${escape(person.name)}</h2><a class="text-link" href="${basePath}graph/#graph/${id}">باز کردن گراف ←</a></div><p>این نام‌ها بیشترین حضور مشترک را با ${escape(person.name)} در بخش‌های راهنما دارند؛ خط‌ها به‌تنهایی نشانهٔ دوستی یا خویشاوندی نیستند. برای شناخت هر شخصیت روی نامش بزن.</p>${renderCenteredGraph(id, basePath, true)}<a class="text-link person-graph-all" href="${basePath}graph/#graph/all">دیدن همهٔ شخصیت‌ها در یک گراف ←</a></section>`;
}
