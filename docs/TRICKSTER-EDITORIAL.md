# Trickster Directory — Editorial and provenance gate

**Issue:** [#10](https://github.com/JFeimster/jester-quotes/issues/10) · **RUN 02/06** · **Status:** draft; publication requires explicit editorial approval before the PR is made ready/merged.

## What is being published (after approval)

- Eleven original short factual/contextual summaries in `src/data/tricksters.json`, with corresponding export `data/tricksters.csv`.
- Each item has a unique stable slug and ID, constrained kind and medium, documented source links, a verification date, and editor-selected Collection theme links.
- Every public profile links out to supporting references; `/tricksters/` provides search by text, figure kind, medium and theme.
- **No copied article passages, unlicensed images or scraped character portraits.** The symbolic illustration-free treatment is intentional; the source publishers' image rights have not been inferred.
- The six selected additional names in `data/trickster-candidates.csv` are unpublished research leads; `src/lib/tricksters.ts` imports only the independently sourced public registry.

## Inspiration and third-party rights

[Aadip Desai, *Trickster Hit List!*](https://www.aadip.com/trickster/) currently includes **139 numbered entries** and states © 2026, all rights reserved. It is a **research starting point**, not a reusable database, and its wording, long-form list, descriptions, images, and ordering must not be copied into the public product. The handful of `source_list_number` values in the verified registry are provenance breadcrumbs, **not** assertions that the source's broad cultural classifications have been independently proved.

The imported source is intentionally **not** the same thing as the published directory. No claim is made to publish every candidate from the 139-item list.

## Evidence and interpretive boundaries

Published profiles are based on independent links present inside each `sources[]` field. Source organizations represented in the first seed set include the **Library of Congress**, **Smithsonian Institution**, **Bowling Green State University Library**, **Te Ara / New Zealand encyclopedia**, **UNESCO**, **The Metropolitan Museum of Art**, **National Geographic**, and reference material from **Encyclopedia.com** or older Britannica text.

Important cautions:
- **Raven and Coyote** are not treated as universal, interchangeable Native stories; specific Tlingit and documented Native storytelling sources are referenced.
- **Māui** is a culture hero rather than being reduced to a generic prankster. This entry references Māori traditions, not an undifferentiated account of all Polynesian peoples.
- **Èṣù (Eshu)** is described as a Yoruba messenger associated with crossings and change. A label like "trickster" covers only one dimension of a living religious tradition; Eshu is not asserted equivalent to Legba/Eleggua.
- **Sun Wukong** is treated as a literary figure known from *Journey to the West*, not confused with other monkey deities.
- **The candidate list** is not verified: no public pages or metadata are generated for entries without independent evidence.

## Adding a verified profile

1. Add a research candidate to `data/trickster-candidates.csv` with provenance and a note. Do not auto-create public pages from this file.
2. Review authoritative/primary or institutionally supported references, checking names, cultural context, role, and story variants. Mark uncertainty explicitly.
3. Draft a short **original** summary. Do not transfer the source publisher's exact prose.
4. Add a unique stable slug, ID, constrained medium/kind/tags, reference URL, verification date and optional *editorial* related Collection links to `src/data/tricksters.json`.
5. Add its CSV export row to `data/tricksters.csv`. The import is generated statically by Astro; there is no new database or backend.
6. Check `npm run check`, build/test, page canonical, sources, and responsive navigation before making a verified profile public.
7. Add any image **only with independently established reuse rights**, then store the asset in existing `public/images/` with creator/license/source details. Otherwise retain the abstract motif.

## Editorial review questions — for STOP 2

- Are the eleven proposed names and descriptions accurate enough for publication?
- Do the cultural labels and broad editorial-theme connections seem appropriate?
- Should any seed entry be held back pending deeper research or community-led sources?
- Does the text-only, symbolic-art direction meet the desired quality without unlicensed character portraits?

**Do not mark the PR ready, merge, or deploy the directory until editorial approval.**
