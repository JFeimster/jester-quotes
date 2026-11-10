# B05 Resource Vault + YouTube Library — Source Registry

**Issue:** #11 · **Run:** 03/06 · **Publication gate:** automatic after verified records and passing CI.

## Canonical data

- `src/data/resources.json` is the authoritative source for external article/reference links (9 entries); `data/resources.csv` is a human-friendly export.
- `src/data/videos.json` is the authoritative source for external YouTube lessons (5 entries); `data/videos.csv` is the export. Exact video IDs, link URLs, creator/channel names and summaries are source-checked; no fabricated durations, metrics or dates.
- The records are small and manually curated: do not scrape or bulk copy third-party pages, transcripts, artworks or video files. Source publishers retain their rights.
- `src/lib/resource-catalog.ts` validates IDs, HTTPS URLs, relationship IDs and YouTube ID syntax at build time. Only real, verified public Trickster profile IDs may appear in `related_trickster_ids`.

## Verified institutional resources
1. Library of Congress American Folklife Center: animal and trickster tales.
2. Library of Congress: folktales and oral storytelling overview.
3. Library of Congress: World Treasures Anansi section.
4. Bowling Green State University Libraries: Ananse folklore resources.
5. UNESCO: Nasreddin Anecdotes intangible heritage listing.
6. Smithsonian National Postal Museum: Raven Story.
7. Te Ara — Encyclopedia of New Zealand: early Māori traditions.
8. TED-Ed: Anansi lesson.
9. TED-Ed: Loki and the master builder lesson.

These are **outbound** URLs and short original summaries, not hosted or mirrored source material.

## Verified YouTube videos
- CrashCourse: `RW1ChiWyiZQ` — Tricksters: An Introduction, World Mythology #20.
- TED-Ed: `6nWba9Ii5Lo` — The Myth of Anansi, the Trickster Spider.
- TED-Ed: `MTz2f9yjmK8` — The Myth of Loki and the Master Builder.
- TED-Ed: `8Poklx9Ifz4` — The Myth of Loki and the Deadly Mistletoe.
- TED-Ed: `Xs-9vfWDJfU` — The Monkey King and the Realm of the Dead.

No runtime YouTube API, keys, view counts, duration claims or local video storage. Embeds are `youtube-nocookie.com/embed/ID` and are created only on user activation, with no autoplay parameter. Every card includes its original YouTube watch URL. If an owner later disables embeds, that link still works.

## Quality and release safeguards

- User-facing catalog cards remain usable with JavaScript disabled; filters are client-side progressive enhancements.
- Relations are curated by stable IDs. No automated association by name matching.
- Dataset extensions should add verified source links, independent original descriptions, real publisher/channel credits and traceable dates; reject placeholder content.
- Existing quote registry, Trickster profiles, SEO, asset directories and Vercel configuration remain intact.
- Future visual/rendered browser QA is addressed by #14; this batch supplies focused build-time and interface contract tests.
