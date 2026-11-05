import {overviewCharacters} from "./graph-characters.js?v=1";

const byId = new Map(overviewCharacters.map(person => [person.id, person]));
const escape = value => String(value).replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[char]);
const faNum = value => Number(value).toLocaleString("fa-IR");
const relation = (from, to, type, work, book, lines) => ({from, to, type, work, book, lines});
const node = (id, x, y) => ({id, x, y});
const pair = (id, title, parent, child, type, work, book, lines, note = "") => ({id, title, width:420, height:250, nodes:[node(parent,210,50),node(child,210,200)], relations:[relation(parent,child,type,work,book,lines)], note});

// Curated kinship statements: no relationship is inferred from co-occurrence.
export const families = [
  {id:"ithaca",title:"خانوادهٔ اودیسئوس",width:660,height:470,
    nodes:[node("laertes",150,55),node("anticleia",450,55),node("odysseus",270,235),node("penelope",540,235),node("telemachus",410,415)],
    relations:[relation("laertes","odysseus","father","odyssey",16,"۱۱۲–۱۲۸"),relation("anticleia","odysseus","mother","odyssey",11,"۸۴–۸۹"),relation("odysseus","penelope","spouse","odyssey",23,"۱۶۶–۲۳۰"),relation("odysseus","telemachus","father","odyssey",16,"۱۸۶–۲۱۹"),relation("penelope","telemachus","mother","odyssey",16,"۱۱۲–۱۵۳")]},
  {id:"troy",title:"خانوادهٔ هکتور",width:660,height:470,
    nodes:[node("priam",200,55),node("hecuba",450,55),node("paris",100,235),node("hector",320,235),node("andromache",560,235),node("astyanax",440,415)],
    relations:[relation("priam","hector","father","iliad",24,"۴۸۶–۵۰۶"),relation("priam","paris","father","iliad",6,"۵۰۳–۵۱۴"),relation("hecuba","hector","mother","iliad",6,"۲۳۷–۲۸۵"),relation("hector","andromache","spouse","iliad",6,"۳۹۰–۴۰۳"),relation("hector","astyanax","father","iliad",6,"۳۹۰–۴۰۳"),relation("andromache","astyanax","mother","iliad",6,"۳۹۰–۴۳۹")]},
  {id:"olympus",title:"زئوس، هرا و فرزندان",width:660,height:330,
    nodes:[node("zeus",450,55),node("hera",210,55),node("athena",330,275),node("hephaestus",90,275),node("sarpedon",570,275)],
    relations:[relation("zeus","hera","spouse","iliad",1,"۵۴۴–۵۵۰"),relation("zeus","athena","father","iliad",6,"۲۹۷–۳۱۰"),relation("hera","hephaestus","mother","iliad",1,"۵۷۱–۶۰۰"),relation("zeus","sarpedon","father","iliad",16,"۴۳۰–۴۶۱")],
    note:"هر خط فقط نسبتِ نوشته‌شده روی خودش را نشان می‌دهد؛ مادر سارپدون در این نما نیامده و هرا مادر او نشان داده نشده است. دربارهٔ خدایان، این نما از اشاره‌های هومر پیروی می‌کند."},
  {id:"nestor",title:"نستور و پسرانش",width:660,height:330,
    nodes:[node("nestor",330,55),node("pisistratus",150,275),node("antilochus",510,275)],
    relations:[relation("nestor","pisistratus","father","odyssey",3,"۴۷۸–۴۹۷"),relation("nestor","antilochus","father","iliad",6,"۲۹–۳۶")]},
  pair("achilles","آشیل و تتیس","thetis","achilles","mother","iliad",1,"۳۴۸–۳۵۹"),
  pair("cyclops","پوزئیدون و پولیفموس","poseidon","polyphemus","father","odyssey",9,"۵۲۶–۵۳۶"),
  pair("aeneas","آفرودیت و آینیاس","aphrodite","aeneas","mother","iliad",5,"۲۴۷–۲۵۰؛ ۳۱۱–۳۱۷"),
  pair("agamemnon","آگاممنون و اورستس","agamemnon","orestes","father","odyssey",3,"۳۰۳–۳۱۰"),
  {id:"sparta",title:"منلائوس و هلن",width:420,height:160,nodes:[node("menelaus",95,75),node("helen",325,75)],relations:[relation("menelaus","helen","spouse","odyssey",4,"۱۲۰–۱۸۲")],note:"اینجا همسریِ منلائوس و هلن در بازگشتِ روایت‌شده در ادیسه نشان داده شده است؛ وضعیت آن‌ها در پیشینهٔ جنگ و در تروا یکسان نیست."}
];

export const familyForPerson = id => families.filter(family => family.nodes.some(node => node.id === id));
const sourceHref = edge => `https://www.theoi.com/Text/Homer${edge.work === "iliad" ? "Iliad" : "Odyssey"}${edge.book}.html`;
const labels = {father:"پدر",mother:"مادر",spouse:"همسر"};
const sentence = edge => edge.type === "spouse" ? `${byId.get(edge.from).name} و ${byId.get(edge.to).name} همسرند.` : `${byId.get(edge.from).name} ${labels[edge.type]} ${byId.get(edge.to).name} است.`;

function familyCard(family, basePath, focus) {
  const nodes = new Map(family.nodes.map(node => [node.id, node]));
  return `<article class="family-card" data-family="${family.id}"><h2>${escape(family.title)}</h2>${family.width > 420 ? '<p class="family-scroll-hint">برای دیدن همهٔ شاخه‌ها، نمودار را به چپ و راست بکش.</p>' : ""}<div class="family-viewport" tabindex="0" role="region" aria-label="شجرنامهٔ ${escape(family.title)}"><svg viewBox="0 0 ${family.width} ${family.height}" width="${family.width}" height="${family.height}" style="--family-min-width:${family.width > 420 ? 600 : 0}px" role="group" aria-label="نمودار نسبت‌های خانوادگی؛ توضیح متنی و مأخذ زیر نمودار است">
  ${family.relations.map((edge,index)=>{const a=nodes.get(edge.from),b=nodes.get(edge.to);const spouse=edge.type==="spouse";const direction=Math.sign(b.x-a.x);const x1=spouse?a.x+59*direction:a.x,y1=spouse?a.y:a.y+29,x2=spouse?b.x-59*direction:b.x,y2=spouse?b.y:b.y-29;const mid=(y1+y2)/2;const lx=(x1+x2)/2,ly=spouse?y1-12:mid+(index%2?12:-12);return `<path class="family-edge ${edge.type}" d="${spouse?`M${x1} ${y1}H${x2}`:`M${x1} ${y1}C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`}"/><text class="family-edge-label" x="${lx}" y="${ly}" text-anchor="middle" direction="rtl">${labels[edge.type]}</text>`;}).join("")}
  ${family.nodes.map(node=>{const person=byId.get(node.id);return `<a class="family-node" href="${basePath}${person.path}" ${focus===node.id?'aria-current="true"':""} aria-label="${escape(person.name)}؛ باز کردن معرفی شخصیت"><rect x="${node.x-59}" y="${node.y-29}" width="118" height="58" rx="12"/><text x="${node.x}" y="${node.y-1}" text-anchor="middle" direction="rtl">${escape(person.name)}</text><text class="family-node-english" x="${node.x}" y="${node.y+17}" text-anchor="middle" direction="ltr" lang="en">${escape(person.englishName)}</text></a>`;}).join("")}
  </svg></div>${family.note?`<p class="family-note">${escape(family.note)}</p>`:""}<details class="family-sources"><summary>توضیح نسبت‌ها و مأخذ</summary><ul>${family.relations.map(edge=>`<li>${escape(sentence(edge))} <a href="${sourceHref(edge)}" target="_blank" rel="noopener noreferrer">${edge.work==="iliad"?"ایلیاد":"ادیسه"}، سرود ${faNum(edge.book)}، سطرهای ${edge.lines} ↗</a></li>`).join("")}</ul></details></article>`;
}

export function renderFamilyGraph(basePath, focus = "all", interactive = true) {
  const selectedFamily = families.find(family=>family.id===focus);
  const person = byId.get(focus);
  const selected = selectedFamily ? [selectedFamily] : person ? familyForPerson(focus) : families;
  const shown = selected.length ? selected : families;
  return `<section class="family-view"><div class="family-toolbar"><div ${interactive ? "" : "hidden"}><label for="family-select">انتخاب خانواده</label><select id="family-select"><option value="all">همهٔ خانواده‌ها</option>${person&&!selectedFamily?`<option value="${person.id}" selected>مرتبط با ${escape(person.name)}</option>`:""}${families.map(family=>`<option value="${family.id}" ${selectedFamily?.id===family.id?"selected":""}>${escape(family.title)}</option>`).join("")}</select></div><a class="text-link" href="${basePath}graph/family/">دیدن همهٔ خانواده‌ها ←</a></div><p class="family-intro">پیوندهای ثبت‌شدهٔ این نما از اشاره‌های ایلیاد و ادیسه‌اند؛ این شجرنامه شامل همهٔ خویشاوندان و همهٔ روایت‌های اسطوره‌ای نیست. «پدر» و «مادر» از ردیف بالاتر به فرزند می‌رسند؛ خط افقی «همسر» را نشان می‌دهد.</p><div class="families-grid">${shown.map(family=>familyCard(family,basePath,focus)).join("")}</div></section>`;
}
