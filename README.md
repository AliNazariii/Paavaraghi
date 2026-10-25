# Paavarghi

Persian reading companions for good books. The home page is a shelf of book cards; each book has its own guide with a design that fits it.

**Read the site:** https://alinazariii.github.io/Paavarghi/

## Books

- **Homer: *Iliad* and *Odyssey*** at `/homer/`

## Homer guide

The Homer guide follows all 24 books of each poem in order. Each book has a short account of what happens, context for where it begins, and links to the people and places mentioned. It is meant to help readers keep their place in the story, whether they are reading the poems or exploring them on their own.

### What you can explore

- A book-by-book path through the *Iliad* and the *Odyssey*
- Brief explanations of names within the reading guides, with links to character and place pages
- Questions that come up while reading each book
- A character graph and a separate view of Odysseus's journey in story order
- Reading progress saved in your browser
- Introductory guides to the Trojan War and the differences between the two poems

Three context pages connect the end of the *Iliad* to the beginning of the *Odyssey*. They are labelled as background material, not as books written by Homer.

## Run locally

You need Node.js. There are no packages to install.

```sh
npm run build
npm run check
npm start
```

Open http://localhost:8000/Paavarghi/.

## Project files

| Path | Purpose |
| --- | --- |
| `scripts/site-config.mjs` | Site URL and base path (override with `SITE_URL`) |
| `scripts/build-site.mjs` | Builds the library page, every book, and `docs/sitemap.xml` |
| `scripts/library/books.mjs` | Book list and card colours for the home page |
| `scripts/library/build.mjs` and `docs/library.css` | Library home page |
| `docs/homer/story.js` | Homer book guides, characters, places, and source references |
| `docs/homer/app.js` | Homer navigation, questions, search, graph, and reading progress |
| `docs/homer/styles.css` | Homer guide styles |
| `scripts/homer/shell.html` and `scripts/homer/build.mjs` | Homer HTML template and page generator |
| `scripts/validate-content.mjs` and `scripts/validate-site.mjs` | Check the content and generated pages |

## Add a book

1. Put the book's assets in `docs/<book>/` with its own styles, and a generator in `scripts/<book>/build.mjs` that returns its sitemap URLs.
2. Call it from `scripts/build-site.mjs`.
3. Add an entry to `scripts/library/books.mjs` with the path, description and theme colours for its card.

After changing content or the template, run `npm run build` and `npm run check`, then commit the generated files in `docs/` with the source changes. GitHub Pages serves the `docs/` folder from the `master` branch.

## About the text

The Persian explanations are original guide prose, not a translation of a published edition. Each poem book links to a reference text in the Perseus Digital Library. Events from other Trojan War traditions are identified as background so they are not mistaken for scenes in the *Iliad* or the *Odyssey*.
