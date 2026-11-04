// All reading content and spoiler disclosures also work without JavaScript.
const storageKey = 'paavaraghi:nimeye-tarik-e-mah:read:v1';
const storyIds = (document.body.dataset.storyIds || '').split(',').filter(Boolean);
const fa = value => String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
let read = new Set();
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    read = new Set(Array.isArray(saved) ? saved.filter(id => storyIds.includes(id)) : []);
  } catch { read = new Set(); }
}
function renderProgress() {
  for (const button of document.querySelectorAll('[data-mark-read]')) {
    const done = read.has(button.dataset.markRead);
    button.hidden = false;
    button.setAttribute('aria-pressed', String(done));
    button.textContent = done ? 'خوانده‌ام ✓ — لغو علامت' : 'این داستان را خوانده‌ام';
  }
  for (const label of document.querySelectorAll('[data-read-state]')) label.hidden = !read.has(label.dataset.readState);
  for (const label of document.querySelectorAll('[data-progress]')) {
    label.hidden = false;
    label.textContent = `${fa(read.size)} از ${fa(storyIds.length)} داستان خوانده شده`;
  }
}
loadProgress();
renderProgress();
for (const button of document.querySelectorAll('[data-mark-read]')) button.addEventListener('click', () => {
  const id = button.dataset.markRead;
  if (!storyIds.includes(id)) return;
  if (read.has(id)) read.delete(id); else read.add(id);
  const status = document.querySelector('[data-progress-status]');
  try {
    localStorage.setItem(storageKey, JSON.stringify([...read]));
    if (status) status.textContent = 'وضعیت خواندن در این مرورگر ذخیره شد.';
  } catch {
    if (status) status.textContent = 'ذخیره در این مرورگر ممکن نیست؛ علامت فقط تا بستن این صفحه می‌ماند.';
  }
  renderProgress();
});
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) { loadProgress(); renderProgress(); }
});
const normalize = text => text.normalize('NFKC').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s\u200c\u200d]+/g,' ').trim().toLowerCase();
const input = document.querySelector('#story-search');
const select = document.querySelector('#story-theme');
if (input && select) {
  document.querySelector('[data-search-tools]').hidden = false;
  const cards = [...document.querySelectorAll('[data-story]')];
  const count = document.querySelector('[data-search-count]');
  function filter() {
    const query = normalize(input.value), terms = query.split(' ').filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const haystack = normalize(card.dataset.search);
      const matches = terms.every(term => haystack.includes(term)) && (!select.value || card.dataset.tags.split('|').includes(select.value));
      card.hidden = !matches;
      if (matches) visible++;
    }
    count.hidden = false;
    count.textContent = `${fa(visible)} داستان از ${fa(cards.length)}`;
    document.querySelector('[data-no-results]').hidden = visible !== 0;
  }
  input.addEventListener('input', filter);
  select.addEventListener('change', filter);
  filter();
}
