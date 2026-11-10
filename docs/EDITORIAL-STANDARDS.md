# Jester Quotes — Editorial Standards (v2.0)

## Canonical data and provenance

- `src/data/jester-quotes.json` is the authoritative, immutable-by-default registry of the original 100 quotations. Do not silently rewrite supplied quote text, people, IDs or references.
- `src/data/collections.json` contains non-exclusive **editorial groupings**; tags do not establish the quoted author's intent.
- `src/data/tricksters.json` contains **verified, original summaries** of documented figures. The six research leads in `data/trickster-candidates.csv` are not publishable profiles. Do not copy or mirror Aadip Desai's copyrighted 139-entry compilation.
- `src/data/resources.json` and `src/data/videos.json` hold sourced external references. Check titles, credited publishers/channels, IDs and URLs before publishing. Never fabricate metrics or hosting rights.
- Only import an image into the published asset registry after establishing origin, ownership/permission, licensing details, a meaningful alt description and correct dimensions. The current `public/assets/` taxonomy is documented in `docs/IMAGE-ASSETS.md`.

## Relationship and recommendation integrity

`src/lib/related-content.ts` builds links from curated Collection membership, independently verified Trickster theme tags and explicit `related_quote_ids`. These are **editorial thematic connections**, not claims that quotation authors discussed or supported a given figure.

## Reuse rights and downloaded artwork

Complete quote PNG/ZIP exports and saved-quote share packs preserve all original words and author attribution. This technical fidelity is **not** a copyright license. The downloadable `RIGHTS-AND-ATTRIBUTIONS.txt` names the upstream collection, confirms the third-party rights caveat, and supplies the complete included text.

Do not add unlicensed screenshots, movie stills, copyrighted character images or YouTube media files to the repository. YouTube remains opt-in click-to-load embedding or external linking.

## Acceptance rules for new records

- Unique, stable ID and slug
- Original, contextual description
- At least one independent, credible source with an HTTPS URL; no `example.com` placeholders
- Verification date, correct medium/figure classification and supporting evidence
- Respect living cultural or religious traditions and specific community accounts; do not collapse all stories into one generic trickster label
- New public routes get canonical metadata, valid sitemap inclusion, appropriate indexing and automated tests
- Private personalized or experimental pages remain noindexed

## External link checks

The CI checks URL syntax, uniqueness, provenance fields and route integrity. It does **not** treat transient external website outages as build failures. Recheck important third-party links during editorial updates.
