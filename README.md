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
- Reading guides provide context before difficult openings; inline names open short explanations on hover, keyboard focus, or the adjacent touch button, and link to character or place pages.
- `docs/styles.css` contains the responsive RTL interface.

The three bridge pages are editorial context, not books of either poem. The *Iliad* ends with Hector's funeral. The *Odyssey* mentions Achilles's funeral (book 24), recounts the wooden horse (book 8), and tells of Agamemnon's murder (including books 1 and 11). Other details come from later or separate Trojan War traditions and are identified on each bridge page. Odyssey books 9–12 are marked as Odysseus's retrospective account so readers can distinguish story chronology from Homer's presentation.

## Editorial rules

1. Keep all visitor-facing text in Persian.
2. Attach every poem chapter to its corresponding book and source link.
3. Label material from outside the two poems as narrative context.
4. Add alternate Persian spellings to character aliases for search.
5. Keep chapter summaries short enough to read independently, and explain why each chapter changes the story.

The Perseus Digital Library links provide a public reference text for each book. The Persian summaries are original guide prose, not a translation of a published Persian edition.

## Verification

Run `node --check docs/app.js`, `node --check docs/story.js`, and `node scripts/validate-content.mjs`. Browser interaction can be checked by serving `docs` locally.
