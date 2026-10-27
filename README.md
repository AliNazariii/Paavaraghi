# Paavaraghi

Paavaraghi (Persian for "footnote") is a collection of Persian reading guides for great books. Each guide sits beside the book you are reading: before every chapter it tells you where you are in the story, who is on stage, and what to watch for.

**Visit the site:** https://paavaraghi.ir/

The home page is a shelf of book cards. Pick a book to open its guide. Every guide has its own design, chosen to fit the book.

## On the shelf

| Book | Guide |
| --- | --- |
| Homer, *Iliad* and *Odyssey* | [/homer/](https://paavaraghi.ir/homer/) |

More books will be added over time.

### Homer: *Iliad* and *Odyssey*

The guide covers all 24 books of each poem, in order. For each book you get:

- what has happened so far, where the scene is set, and what to follow
- a short account of the book and why it matters
- links to the people and places involved
- a link to the reference text in the Perseus Digital Library

It also has character and place pages, a character graph, Odysseus's voyage in the order the events happen, short introductions to the Trojan War and to how the two poems differ, search, and reading progress saved in your browser.

Three context pages bridge the end of the *Iliad* and the start of the *Odyssey*. They are marked as background, not as part of Homer's text. Material from other Trojan War traditions is labelled the same way.

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
scripts/
  site-config.mjs             site URL and base path (override with SITE_URL)
  build-site.mjs              builds the library, every book, and sitemap.xml
  library/                    book list (books.mjs) and home page generator
  homer/                      Homer page template and generator
  validate-*.mjs              content and site checks
```

## Adding a book

1. Put the guide in `docs/<book>/` with its own styles and scripts.
2. Write `scripts/<book>/build.mjs` that generates its pages and returns their sitemap URLs.
3. Call that build from `scripts/build-site.mjs`.
4. Add the book to `scripts/library/books.mjs`, with its path, description, and the theme colours for its card.

## About the writing

The Persian text is original guide prose. It is not a translation of any published edition.
