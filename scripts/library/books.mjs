import {chapters} from "../../docs/homer/story.js";

const faNum = value => String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);
const count = work => chapters.filter(chapter => chapter.work === work).length;

// Each book lives in docs/<path>/ with its own build, styles and look.
// `theme` colours the book's card on the library page so it previews the book's own design.
export const books = [
  {
    id: "homer",
    path: "homer/",
    title: "ایلیاد و ادیسه",
    author: "هومر",
    description: "دو منظومهٔ یونانی، سرود به سرود: از خشم آشیل در سال دهم جنگ تروا تا بازگشت اودیسئوس به ایتاکا.",
    meta: `${faNum(count("iliad") + count("odyssey"))} سرود · ${faNum(count("bridge"))} بخش زمینه`,
    mark: "✦",
    theme: {bg: "#102b35", panel: "#173540", ink: "#ffffff", soft: "#c6d5d3", accent: "#e6c184"},
    parts: [{label: "ایلیاد", path: "iliad/"}, {label: "ادیسه", path: "odyssey/"}]
  }
];
