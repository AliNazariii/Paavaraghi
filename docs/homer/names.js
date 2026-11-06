import {chapters, characters, extraGlossary} from "./story.js?v=7";
import {additionalCharacters} from "./graph-characters.js?v=1";

// Aliases are spelling/translation equivalents, not different people in a family.
export const aliasOverrides = {
  achilles:["آخیلوس","آخیل","اخیلس","آکیلس","Achille","Achilleus"],
  agamemnon:["آگاممنُن","آگاممنن"], briseis:["بریزئیس","بریزیس","بریسئید","Briséis"],
  hector:["هکتُر","Hektor"], patroclus:["پاتروکل","پاتروکلس","Patroklos","Patrocle"],
  odysseus:["اولیس","اودیسیوس","اودیسوس","Ulysses","Ulixes","Ulysse"],
  penelope:["پنه‌لوپه","پنلوپ","Pénélope"],telemachus:["تلماک","تلمخوس","Telemachos","Télémaque"],
  athena:["آتنه","آتن","پالاس آتنا","مینروا","Athene","Minerva","Pallas"],
  zeus:["زیوس","زوس","ژوپیتر","یوپیتر","Jupiter","Jove"],
  poseidon:["پوسایدون","پوزیدون","پوسیدون","نپتون","Neptune","Neptunus"],
  paris:["الکساندروس","آلکساندروس","Alexandros","Alexander","Pâris"],helen:["هلنه","هلنا","Helena","Hélène"],
  menelaus:["منلاس","منلائُس","Menelaos","Ménélas"],andromache:["آندروماک","Andromaque","Andromakhe"],
  priam:["پریاموس","Priamos","Priamus"],ajax:["آژاکس","آژاکس بزرگ","آیاس بزرگ","Aias","Telamonian Ajax"],
  diomedes:["دیومد","دیومیدس","Diomède"],hera:["ژونو","یونون","Juno"],aphrodite:["افرودیت","ونوس","Venus"],
  thetis:["تِتیس","Thétis"],calypso:["کالیپسُ","Kalypso"],nausicaa:["نائوزیکا","نوزیکا","Nausikaa","Nausicaä"],
  alcinous:["آلکینوئوس","الکینووس","Alkinoos","Alcinoüs"],polyphemus:["پولیفم","Polyphemos","Polyphème"],
  circe:["کیرکه","سیرس","Kirke","Circé"],tiresias:["تیرزیاس","ترزیاس","Teiresias","Tirésias"],
  eumaeus:["ائومائوس","اوماوس","Eumaios","Eumée"],eurycleia:["اوری‌کلئا","اوروکلیا","Eurykleia","Euryclée"],nestor:["نستُر"],
  aegisthus:["اژیست","اگیستوس","اژیستوس","ایگیستوس","Aigisthos","Égisthe"],
  orestes:["اورست","اورِستس","Oreste"],pisistratus:["پیزیستراتوس","Peisistratos","Pisistrate"],
  proteus:["پروته","Proteus","Protée"],ino:["لوکوتئا","لوکوتوئه","Leucothea","Leukothea"],
  eurylochus:["اوریلوکوس","Eurylochos","Euryloque"],elpenor:["الپنور","Elpénor"],anticleia:["آنتیکله","Antikleia","Anticlée"],
  theoclymenus:["تئوکلیمنوس","Theoklymenos"],"argos-dog":["آرگوس","Argos","Argus"],
  eurymachus:["اوریماکوس","Eurymachos","Eurymaque"],philoetius:["فیلویتیوس","فیلوئتیوس","Philoitios"],
  aeolus:["ائولوس","ایولوس","اُئول","Aiolos","Éole"],apollo:["آپولو","آپولن","فبوس","Phoebus","Apollon"],
  chryses:["خریسس","کریسس","Chrysès"],chryseis:["کریسئیس","خریزیس","Chryséis"],
  calchas:["کالکاس","کالخاس","Kalkhas"],glaucus:["گلوکوس","Glaukos","Glaucos"],hecuba:["هکوبا","هکابه","Hekabe","Hécube"],
  astyanax:["آستیاناکس","اسکاماندریوس","Scamandrius"],pandarus:["پاندار","Pandaros"],
  ares:["مارس","Mars"],phoenix:["فنیکس","فینیکس","Phoinix","Phénix"],meleager:["ملیاگر","Meleagros","Méléagre"],
  rhesus:["رسوس","رزوس","Rhesos","Rhésus"],polydamas:["پولیداماس","Polydamas","Poulydamas"],
  sarpedon:["سارپدون","Sarpédon"],idomeneus:["ایدومنه","Idoménée"],meriones:["مریون","Mérion"],
  hypnos:["هیپنوس","هوپنوس","Hypnos","Somnus"],euphorbus:["اوفورب","Euphorbos"],antilochus:["آنتیلوکوس","Antilochos","Antiloque"],
  "xanthus-horse":["زانتوس","Xanthos","Xanthe"],"xanthus-river":["رود زانتوس","Xanthus","Xanthos"],
  lycaon:["لیکائون","Lykaon"],deiphobus:["دئیفوب","Deiphobos","Déiphobe"],hermes:["مرکور","مرکوری","Mercury","Mercurius","Hermès"],
  hephaestus:["هفستوس","هفایستوس","وولکان","Vulcan","Hephaistos"],aeneas:["ائنیاس","انه","Aineias","Énée"],
  arete:["آرته","آرته‌","Arété"],demodocus:["دمودوکوس","دِمودوک","Demodokos","Démodocos"],
  scylla:["سکیلا","اسکیلا","Skylla"],charybdis:["خاریبدیس","کاریبدیس","Charybde"],helios:["هلیوس","هلیوس خورشید","Helios","Hélios"],
  laertes:["لائرت","Laërte"],mentes:["منتِس","Mentès"],mentor:["منتُر"],
  clytemnestra:["کلیتمنسترا","کلیتمنستر","کلوتمنسترا","Clytaemnestra","Klytaimnestra","Clytemnestre"],
  peleus:["پله","پلئوس","Pélée"],"ajax-lesser":["آژاکس کوچک","آیاس کوچک","Oilean Ajax","Ajax the Lesser"],
  achaeans:["آخایی","اخایی","آخایی‌ها","آخاییان","آکاییان","Achaeans","Akhaians","Achaioi"],
  argives:["آرگوسی","آرگیوها","Argives","Argiens"],danaans:["دانایی","داناییان","داناها","Danaans","Danai"],
  atreides:["آترید","آتریدها","آترئیدها","پسر آتروئس","پسران آتروئس","Atreides","Atreidae"]
};

export const readingTerms = [
  {id:"clytemnestra",name:"کلوتایمنسترا",englishName:"Clytemnestra",description:"همسر آگاممنون و مادر اورستس؛ در غیبت آگاممنون با اژیست همراه می‌شود و در قتل او نقش دارد.",group:"خاندان آگاممنون"},
  {id:"peleus",name:"پلئوس",englishName:"Peleus",description:"پدرِ انسانی آشیل و همسر تتیس؛ پریام در دیدار با آشیل، یادِ این پدر را پیش می‌کشد.",group:"یونانیان"},
  {id:"ajax-lesser",name:"آیاس کوچک",englishName:"Ajax the Lesser",description:"پسر اویلئوس؛ از جنگجویان یونانی. با آیاس بزرگ، پسر تلامون، دو شخصیت متفاوت‌اند.",group:"یونانیان"},
  {id:"achaeans",name:"آخاییان",englishName:"Achaeans",description:"یکی از نام‌های جمعی یونانیان در هومر؛ «ما مردم آخایی» معمولاً یعنی «ما یونانیان».",kind:"collective"},
  {id:"argives",name:"آرگوسیان",englishName:"Argives",description:"نامی که هومر در بسیاری از صحنه‌ها برای طرف یونانی به کار می‌برد؛ همیشه فقط مردم شهر آرگوس نیستند.",kind:"collective"},
  {id:"danaans",name:"داناییان",englishName:"Danaans",description:"از نام‌های جمعی یونانیان در ایلیاد و ادیسه؛ به معنی ورودِ یک سپاهِ تازه در کنار آخاییان نیست.",kind:"collective"},
  {id:"atreides",name:"آتریدها",englishName:"Atreides",description:"پسران آتروئس: آگاممنون و منلائوس. عنوان مفرد «آترید» با توجه به صحنه می‌تواند به هر یک از این دو برادر اشاره کند.",kind:"title"}
];

export const normalizeName = value => String(value).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ").replace(/[^\p{L}\p{N}]+/gu," ").replace(/\s+/g," ").trim();
const extraById = new Map(additionalCharacters.map(person => [person.id, person]));
const records = [
  ...characters.map(person => ({...person, description:person.bio, path:`characters/${person.id}/`,kind:"person"})),
  ...extraGlossary.filter(term=>term.id!=="argos").map(term=>({...extraById.get(term.id),...term,englishName:extraById.get(term.id)?.englishName || term.id[0].toUpperCase()+term.id.slice(1),path:term.characterId?`characters/${term.characterId}/`:term.placeId?`places/${term.placeId}/`:`terms/${term.id}/`,kind:term.characterId?"identity":extraById.has(term.id)?"person":"term"})),
  ...readingTerms.map(term=>({...term,path:`terms/${term.id}/`,kind:term.kind||"person"}))
];
export const readingNames = records.map(person=>({...person,aliases:[...new Set([...(person.aliases||[]),...(aliasOverrides[person.id]||[])])].filter(alias=>alias!==person.name)}));
export const readingNameById = new Map(readingNames.map(person=>[person.id,person]));

const overrides = {
  "iliad-01":"chryses chryseis calchas apollo achaeans atreides clytemnestra", "iliad-02":"thersites achaeans argives danaans", "iliad-03":"achaeans atreides", "iliad-05":"aeneas ares", "iliad-06":"glaucus hecuba astyanax", "iliad-09":"phoenix meleager peleus", "iliad-11":"machaon eurypylus", "iliad-13":"idomeneus meriones ajax-lesser calchas", "iliad-14":"hypnos", "iliad-17":"euphorbus antilochus meriones ajax-lesser", "iliad-18":"hephaestus antilochus", "iliad-19":"xanthus-horse", "iliad-20":"aeneas", "iliad-21":"lycaon agenor xanthus-river", "iliad-22":"deiphobus hecuba", "iliad-24":"hermes peleus",
  "bridge-01":"paris apollo", "bridge-02":"demodocus", "bridge-03":"aegisthus clytemnestra orestes",
  "odyssey-01":"aegisthus clytemnestra orestes achaeans mentes", "odyssey-02":"mentor antinous achaeans laertes", "odyssey-03":"aegisthus clytemnestra orestes pisistratus agamemnon menelaus", "odyssey-04":"proteus aegisthus clytemnestra pisistratus", "odyssey-05":"hermes ino", "odyssey-08":"demodocus", "odyssey-11":"anticleia elpenor aegisthus clytemnestra agamemnon achilles ajax", "odyssey-16":"medon", "odyssey-17":"argos-dog theoclymenus", "odyssey-18":"irus amphinomus eurymachus melantho", "odyssey-19":"laertes", "odyssey-20":"philoetius melanthius ctesippus theoclymenus", "odyssey-21":"philoetius", "odyssey-22":"phemius medon eurymachus", "odyssey-24":"aegisthus clytemnestra agamemnon eupeithes"
};
const roles = {
  "odyssey-01":{aegisthus:"اژیست در سخن زئوس؛ سرگذشت او پیش از زمانِ اصلیِ داستان رخ داده است.",mentes:"منتس نامِ صاحب ظاهری است که آتنا در دیدار تلماخوس به خود گرفته است."},
  "odyssey-03":{nestor:"میزبان تلماخوس در پیلوس؛ از گذشتهٔ جنگ و بازگشت‌ها خبر می‌دهد.",aegisthus:"اژیست؛ نستور داستان او را مفصل‌تر بازمی‌گوید. نامش پیش‌تر در سرود اول آمده است.",orestes:"پسر آگاممنون که از اژیست انتقام گرفته؛ نمونه‌ای برای مقایسه با تلماخوس.",pisistratus:"پسر نستور؛ تلماخوس را در ادامهٔ سفر به اسپارت همراهی می‌کند."},
  "odyssey-09":{odysseus:"اودیسئوس یا اولیس؛ در مهمانیِ فایاک‌ها ماجرای گذشتهٔ سفرش را تعریف می‌کند."},
  "odyssey-14":{odysseus:"صاحبِ ناشناسِ خانه؛ داستانِ کرت را برای پوشاندن هویتش تعریف می‌کند.",eumaeus:"خوک‌بان وفادار؛ هنوز نمی‌داند مهمانش اودیسئوس است."},
  "odyssey-16":{telemachus:"پسر اودیسئوس؛ در این سرود هویت پدر را می‌فهمد.",eumaeus:"هنگام آشکار شدن هویتِ پدر و پسر در کلبه حاضر نیست."},
  "odyssey-19":{eurycleia:"دایه‌ای که زخم قدیمی را می‌شناسد؛ دانستهٔ او با پنلوپه یکسان نیست."},
  "iliad-16":{patroclus:"با اجازهٔ آشیل، زره او را پوشیده است؛ خودِ آشیل وارد میدان نشده است."},
  "iliad-21":{"xanthus-river":"زانتوس در این نبرد، رود اسکاماندر است؛ با اسبِ زانتوس فرق دارد."}
};
export function namesForChapter(chapterId) {
  const chapter=chapters.find(chapter=>chapter.id===chapterId);
  if(!chapter) return [];
  const ids=[...chapter.characters,...additionalCharacters.filter(person=>person.chapterIds.includes(chapterId)).map(person=>person.id),...(overrides[chapterId]||"").split(" ").filter(Boolean)];
  return [...new Set(ids)].map(id=>{const person=readingNameById.get(id);if(!person)throw new Error(`Unknown reading name: ${chapterId}/${id}`);return {...person,role:roles[chapterId]?.[id]||person.description};});
}
