# Homer Path

A Persian reading companion for Homer's *Iliad* and *Odyssey*.

The site follows all 24 books of each poem in order. Each book has a short account of what happens, context for where it begins, and links to the people and places mentioned. It is meant to help readers keep their place in the story, whether they are reading the poems or exploring them on their own.

**Read the site:** https://alinazariii.github.io/iliad-odyssey/

## What you can explore

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

Open http://localhost:8000/iliad-odyssey/.

## Project files

| Path | Purpose |
| --- | --- |
| `docs/story.js` | Book guides, characters, places, and source references |
| `docs/app.js` | Navigation, questions, search, graph, and reading progress |
| `docs/styles.css` | Site styles |
| `scripts/site-shell.html` | Shared HTML template |
| `scripts/build-site.mjs` | Generates the HTML pages and sitemap in `docs/` |
| `scripts/validate-content.mjs` and `scripts/validate-site.mjs` | Check the content and generated pages |

After changing content or the template, run `npm run build` and `npm run check`, then commit the generated files in `docs/` with the source changes. GitHub Pages serves the `docs/` folder from the `master` branch.

## About the text

The Persian explanations are original guide prose, not a translation of a published edition. Each poem book links to a reference text in the Perseus Digital Library. Events from other Trojan War traditions are identified as background so they are not mistaken for scenes in the *Iliad* or the *Odyssey*.
