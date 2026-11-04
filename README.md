# Paavaraghi

Paavaraghi (Persian for "footnote") is a collection of Persian reading guides for great books. Each guide sits beside the book you are reading: before every chapter it tells you where you are in the story, who is on stage, and what to watch for.

**Visit the site:** https://paavaraghi.ir/

The home page is a shelf of book cards. Pick a book to open its guide. Every guide has its own design, chosen to fit the book.

## On the shelf

| Book | Guide |
| --- | --- |
| Homer, *Iliad* and *Odyssey* | [/homer/](https://paavaraghi.ir/homer/) |
| J. D. Salinger, *Franny and Zooey* | [/franny-and-zooey/](https://paavaraghi.ir/franny-and-zooey/) |
| Moniru Ravanipour, *Ahl-e Gharq (The Drowned)* | [/ahl-e-gharq/](https://paavaraghi.ir/ahl-e-gharq/) |
| Houshang Golshiri, *Nimeye Tarik-e Mah (The Dark Half of the Moon)* | [/nimeye-tarik-e-mah/](https://paavaraghi.ir/nimeye-tarik-e-mah/) |

More books will be added over time.

### Homer: *Iliad* and *Odyssey*

The guide covers all 24 books of each poem, in order. For each book you get:

- what has happened so far, where the scene is set, and what to follow
- a short account of the book and why it matters
- links to the people and places involved
- a link to the reference text in the Perseus Digital Library

It also has character and place pages, a character graph, Odysseus's voyage in the order the events happen, short introductions to the Trojan War and to how the two poems differ, search, and reading progress saved in your browser.

Three context pages bridge the end of the *Iliad* and the start of the *Odyssey*. They are marked as background, not as part of Homer's text. Material from other Trojan War traditions is labelled the same way.

### Salinger: *Franny and Zooey*

The guide follows the book's two original stories, *Franny* and *Zooey*. Each has a before-reading introduction, prompts to follow while reading, and a closed disclosure with a brief recap and discussion of the ending. There are also family and character notes, reading themes, and a source bibliography. The notes are independent of page numbers and translations; they do not invent chapter divisions.

This guide has its own paper-and-burgundy design. The pages and spoiler disclosures work without JavaScript. With JavaScript, readers can mark either story as read; progress is stored only in their browser, separately from the Homer guide.

### Ravanipour: *Ahl-e Gharq (The Drowned)*

The guide follows all 34 numbered chapters of the Khaneh Aftab second printing (winter 1369), with original chapter labels and four editorial reading paths. Each chapter has a before-reading note, a question, and a closed disclosure containing its recap and interpretation. The forty pages also include 18 character profiles, 16 local words and motifs, seven critical discussions, and an annotated bibliography that distinguishes the reference scan from later editions.

The sea-and-paper design includes original artwork and locally served Vazirmatn fonts (SIL Open Font License, included with the font files). Content and disclosures work without JavaScript. Optional chapter search accepts Persian and Arabic digits and letter variants; reading progress stays in the browser under its own book-specific key. The novel and research scan are not redistributed.

### Golshiri: *Nimeye Tarik-e Mah (The Dark Half of the Moon)*

The guide follows the 36 stories in the Niloofar first printing (spring 1380), with a searchable index, original before-reading notes, closed short recaps, discussion questions, five editorial reading themes, and an annotated source page. Titles, order, page references, and dates were checked against a research scan; the source page explains date and spelling discrepancies in web lists. Recaps are brief reading aids rather than exhaustive plot summaries. The scan is not redistributed.

The indigo-and-paper guide uses the existing local Vazirmatn fonts. Search normalizes Persian/Arabic letters and digits. Story progress is saved only in the browser under a separate book key; content and spoiler disclosures work without JavaScript.

## Run locally

You need Node.js. There is nothing to install.

```sh
npm run build   # generate pages into docs/
npm run check   # validate content, pages and internal links
npm start       # serve at http://localhost:8000/
```

GitHub Pages serves the `docs/` folder from `master`. After you edit content or templates, build and check, then commit the generated files together with the source changes.

## How it is organised

```
docs/
  index.html, library.css     library home page (generated / hand-written)
  homer/                      Homer guide: story.js, app.js, styles.css, generated pages
  franny-and-zooey/            Salinger guide: styles, progress script, share cover, generated pages
  ahl-e-gharq/                 Ravanipour guide: styles, local fonts, artwork, progress script, generated pages
  nimeye-tarik-e-mah/          Golshiri guide: 36 story pages, index, themes, source notes, progress script
scripts/
  site-config.mjs             site URL and base path (override with SITE_URL)
  build-site.mjs              builds the library, every book, and sitemap.xml
  library/                    book list (books.mjs) and home page generator
  homer/                      Homer page template and generator
  franny-and-zooey/            Salinger content and page generator
  ahl-e-gharq/                 Ravanipour chapter notes, research references, and page generator
  nimeye-tarik-e-mah/          Golshiri catalog, original reading notes, sources, and page generator
  validate-*.mjs              content and site checks
```

## Adding a book

1. Put the guide in `docs/<book>/` with its own styles and scripts.
2. Write `scripts/<book>/build.mjs` that generates its pages and returns their sitemap URLs.
3. Call that build from `scripts/build-site.mjs`.
4. Add the book to `scripts/library/books.mjs`, with its path, description, and the theme colours for its card.

## About the writing

The Persian text is original guide prose. It is not a translation of any published edition.
