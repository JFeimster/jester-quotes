# Shared Jester editorial data

**Canonical home:** \`src/data/\`. **Dada Riot build mirror:** \`sites/dada-riot/src/data/\`.

These are separate Astro site roots; imports must remain local to each site's build. Run \`node scripts/sync-shared-editorial-data.mjs\` from the repository root to refresh the seven shared editorial registries. Primary and Dada data must remain byte-identical; dedicated tests guard against drift.

Shared across both sites: \`jester-branding-guide.json\`, \`jester-editorial-voice.json\`, \`jester-brands.json\`, \`archetypes.json\`, \`jesters-in-media.json\`, \`jesters-in-media-images.json\`, \`jesters-in-media-notes.json\`.

**Intentionally variant-specific:** \`sites/dada-riot/src/data/editions.json\` describes the Dada design variant, not shared editorial content. The two sites retain their own \`collections.json\`, \`resources.json\`, \`tricksters.json\`, \`videos.json\`, and \`image-assets.json\` registries, which are already duplicated for separate builds. Do not create more manual registries for these subjects.

## Evidence status and publication

- \`source_attributed\` + \`published\`: a named external article discusses the brand. These editorial profiles appear as cards and may include externally served site **favicons** (not a licensed full logo).
- \`research_candidate\` + \`draft\`: included from the site owner's supplied vertical list, **without** an independent campaign source. These names appear only in a clearly labeled research-leads disclosure, not in published case-study cards or search indexing.
- \`industry_vertical\` identifies the operating industry. \`brand_category\` is a broad consumer/business/service/digital grouping; it does **not** replace source/evidence status.
- \`video\` exists only when the supplied source or a verified original publication links to a specific YouTube video. Do not invent video IDs, logos, ratings, or endorsement claims.
- Old \`historical_examples\` remain in JSON for provenance, not public cards. The previous repeated Follow the Thread boxes were removed from brand cards.

## Adding research

Research one pending brand, attach an actual source URL and independent description, set \`evidence_status\` to \`source_attributed\`, set \`publication_status\` to \`published\`, then sync and run checks. The source list is not a license to rehost campaign footage or corporate artwork.
