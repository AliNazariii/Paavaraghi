# Homer Path

A Persian, right-to-left, static guide to Homer's *Iliad* and *Odyssey*. Readers can follow all 24 books of each poem, cross the clearly marked narrative bridge between them, explore character connections, and search the curated content without an AI service or account.

## Run locally

Serve the `docs` directory with any static HTTP server:

```sh
python3 -m http.server 8000 --directory docs
```

Then open `http://localhost:8000`. The site is dependency-free. For GitHub Pages, select **Deploy from a branch**, branch `master`, folder `/docs` in repository Pages settings.

## Content structure

- `docs/story.js` contains 24 Iliad books, a three-step bridge, 24 Odyssey books, character profiles, places, and source links.
- `docs/app.js` derives the reading route, local graph neighborhoods, search results, and progress from that content.
- `docs/styles.css` contains the responsive RTL interface.

The bridge is intentionally separated from the poems. The *Iliad* ends with Hector's funeral; the wooden horse and fall of Troy are not narrated in that poem. Odyssey books 9–12 are marked as Odysseus's retrospective account so readers can distinguish story chronology from Homer's presentation.

## Editorial rules

1. Keep all visitor-facing text in Persian.
2. Attach every poem chapter to its corresponding book and source link.
3. Label material from outside the two poems as narrative context.
4. Add alternate Persian spellings to character aliases for search.
5. Keep chapter summaries short enough to read independently, and explain why each chapter changes the story.

The Perseus Digital Library links provide a public reference text for each book. The Persian summaries are original guide prose, not a translation of a published Persian edition.

## Verification

Run `node --check docs/app.js`, `node --check docs/story.js`, and `node scripts/validate-content.mjs`. Browser interaction can be checked by serving `docs` locally.
