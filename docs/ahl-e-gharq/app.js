// Optional enhancements only: the guide, navigation and disclosures are HTML.
const storageKey = 'paavaraghi:ahl-e-gharq:read:v1';
const count = Number(document.body.dataset.chapterCount);
const base = document.body.dataset.bookBase;
const ids = Array.from({length: count}, (_, index) => `chapter-${index + 1}`);
const validIds = new Set(ids);
const fa = value => String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
let read = new Set();

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    read = new Set(Array.isArray(stored) ? stored.filter(id => validIds.has(id)) : []);
  } catch {
    read = new Set();
  }
}

function renderProgress() {
  for (const button of document.querySelectorAll('[data-mark-read]')) {
    const done = read.has(button.dataset.markRead);
    button.hidden = false;
    button.setAttribute('aria-pressed', String(done));
    button.textContent = done ? 'خوانده‌ام ✓ — برداشتن علامت' : 'این فصل را خوانده‌ام';
  }
  for (const label of document.querySelectorAll('[data-read-state]')) {
    label.hidden = !read.has(label.dataset.readState);
  }
  for (const box of document.querySelectorAll('[data-progress-box]')) box.hidden = false;
  for (const label of document.querySelectorAll('[data-progress]')) {
    label.textContent = `${fa(read.size)} از ${fa(count)} فصل خوانده شده`;
  }
  for (const bar of document.querySelectorAll('[data-progress-bar]')) bar.value = read.size;
  for (const link of document.querySelectorAll('[data-resume]')) {
    const next = ids.find(id => !read.has(id));
    link.href = next ? `${base}chapters/${next.slice('chapter-'.length)}/` : `${base}analysis/`;
    link.textContent = next ? `ادامه از فصل ${fa(next.slice('chapter-'.length))} ←` : 'همه را خوانده‌ای؛ نقد و گفت‌وگو ←';
  }
  for (const button of document.querySelectorAll('[data-mark-all]')) {
    const done = read.size === count;
    button.setAttribute('aria-pressed', String(done));
    button.textContent = done ? 'برداشتن علامتِ همهٔ فصل‌ها' : 'همهٔ فصل‌ها را خوانده‌ام';
  }
}

function saveProgress() {
  let message;
  try {
    localStorage.setItem(storageKey, JSON.stringify(ids.filter(id => read.has(id))));
    message = 'وضعیت خواندن در همین مرورگر ذخیره شد.';
  } catch {
    message = 'ذخیره در مرورگر ممکن نیست؛ علامت‌ها فقط تا بستن این صفحه می‌مانند.';
  }
  renderProgress();
  for (const status of document.querySelectorAll('[data-progress-status]')) status.textContent = message;
}

loadProgress();
renderProgress();
for (const button of document.querySelectorAll('[data-mark-read]')) {
  button.addEventListener('click', () => {
    const id = button.dataset.markRead;
    if (!validIds.has(id)) return;
    if (read.has(id)) read.delete(id); else read.add(id);
    saveProgress();
  });
}
for (const button of document.querySelectorAll('[data-mark-all]')) {
  button.addEventListener('click', () => {
    read = read.size === count ? new Set() : new Set(ids);
    saveProgress();
  });
}
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) {
    loadProgress();
    renderProgress();
  }
});

const normalize = text => text.replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
  .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
  .replace(/[\u064B-\u065F\u0670\u200c]/g, '').toLowerCase().trim();
const search = document.querySelector('[data-chapter-search]');
const filterButtons = [...document.querySelectorAll('[data-arc-filter]')];
let activeArc = 'all';

function filterChapters() {
  const query = normalize(search?.value || '');
  let visible = 0;
  for (const row of document.querySelectorAll('[data-chapter-item]')) {
    const matches = (activeArc === 'all' || row.dataset.arc === activeArc) && normalize(row.dataset.searchValue).includes(query);
    row.hidden = !matches;
    if (matches) visible++;
  }
  for (const group of document.querySelectorAll('[data-chapter-group]')) {
    group.hidden = ![...group.querySelectorAll('[data-chapter-item]')].some(row => !row.hidden);
  }
  const status = document.querySelector('[data-search-status]');
  if (status) {
    status.hidden = !query && activeArc === 'all';
    status.textContent = `${fa(visible)} فصل از ${fa(count)} فصل`;
  }
  const empty = document.querySelector('[data-empty]');
  if (empty) empty.hidden = visible !== 0;
  for (const button of filterButtons) button.setAttribute('aria-pressed', String(button.dataset.arcFilter === activeArc));
}

if (search) {
  document.querySelector('[data-reading-tools]').hidden = false;
  document.querySelector('[data-filters]').hidden = false;
  search.addEventListener('input', filterChapters);
  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      activeArc = button.dataset.arcFilter;
      filterChapters();
    });
  }
}

// A deliberate link to a discussion/recap anchor opens its native disclosure.
// Opening the page itself never reveals spoilers.
function revealAnchor() {
  if (!location.hash) return;
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  if (search && target.matches('[data-chapter-group]')) {
    activeArc = 'all';
    search.value = '';
    filterChapters();
  }
  let current = target;
  while (current) {
    if (current.tagName === 'DETAILS') current.open = true;
    current = current.parentElement;
  }
  target.scrollIntoView({block: 'start'});
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();
