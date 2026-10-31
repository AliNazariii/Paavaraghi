// Progressive enhancement: every page and spoiler disclosure works without JS.
const storageKey = "paavaraghi:franny-and-zooey:read:v1";
const storyIds = ["franny", "zooey"];
let read = new Set();

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    read = new Set(Array.isArray(stored) ? stored.filter(id => storyIds.includes(id)) : []);
  } catch { read = new Set(); }
}

function renderProgress() {
  for (const button of document.querySelectorAll("[data-mark-read]")) {
    const done = read.has(button.dataset.markRead);
    button.hidden = false;
    button.setAttribute("aria-pressed", String(done));
    button.textContent = done ? "خوانده‌ام ✓ — لغو علامت" : "این داستان را خوانده‌ام";
  }
  for (const label of document.querySelectorAll("[data-read-state]")) {
    label.hidden = !read.has(label.dataset.readState);
  }
  const summary = document.querySelector("[data-progress]");
  if (summary) {
    summary.hidden = false;
    summary.textContent = `${String(read.size).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d])} از ۲ داستان خوانده شده`;
  }
}

loadProgress();
renderProgress();
for (const button of document.querySelectorAll("[data-mark-read]")) {
  button.addEventListener("click", () => {
    const id = button.dataset.markRead;
    if (!storyIds.includes(id)) return;
    if (read.has(id)) read.delete(id); else read.add(id);
    const status = document.querySelector("[data-progress-status]");
    try {
      localStorage.setItem(storageKey, JSON.stringify([...read]));
      if (status) status.textContent = "وضعیت خواندن در این مرورگر ذخیره شد.";
    } catch {
      if (status) status.textContent = "ذخیره در این مرورگر ممکن نیست؛ علامت فقط تا بستن این صفحه می‌ماند.";
    }
    renderProgress();
  });
}
window.addEventListener("storage", event => {
  if (event.key === storageKey || event.key === null) {
    loadProgress();
    renderProgress();
  }
});
