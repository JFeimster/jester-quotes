# B03 Design Lab — approval brief

**RUN:** 04/06 · **Issue:** #12 · **Status:** DRAFT until the user explicitly approves the three visual directions.

## Architecture
- The site remains Astro static-first and public pages remain Midnight Carnival 2.0.
- `src/design/theme-registry.ts` composes three typed theme specs with shared typography, ink/surface, outline, shadow and radius tokens.
- Three distinct Astro layout components consume **real canonical Quote objects**, reuse `src/components/QuoteCard.astro`, and link to existing Collections, Trickster, Resource, Video and Studio destinations.
- `/lab/` is **noindex, nofollow**, excluded from `sitemap.xml.ts`, and intentionally unlinked from site navigation; experiments are previewable only via an explicit URL.
- `src/scripts/theme-lab.ts` provides a keyboard-operable three-tab selector, no localStorage or network requests. The existing `src/scripts/quote-explorer.ts` supplies Save, Copy and Studio links without a second interaction system.

## Three unmistakably different design compositions

1. **Midnight Carnival (Editorial)** — near-black theatrical split hero and framed existing jester image, gold/ivory typography, mixed paper/editorial/poster cards, compact collection links.
2. **Neo-Brutalist Jester (Printshop)** — acid chartreuse and hot orange, thick industrial rules, stacked oversized display type, checkerboard/stamp-like symbol and harsh physical-offset card shadows.
3. **Luxury Bento / Velvet Gallery (Curatorial)** — warm porcelain and aubergine palette, rounded boutique panels, asymmetrical exhibition intro and curatorial statement, refined bento quotation grid.

The three directions are compositional implementations, not merely palette toggles. No new generated images are required; only the existing original Midnight Carnival portrait is reused.

## Validation and limitations
- Branch and PR CI: Astro/TS, build, source/content regressions, accessibility semantics and mobile/reduced-motion CSS contracts.
- No live Vercel Preview is created because the repo's `vercel.json` intentionally disables branch deployments.
- **Illustrative reference comps are not browser screenshots.** Real browser-rendered responsive QA is covered by the later #14 batch (or a separately authorized preview environment).

## Stop requirement
Submit this batch as a **draft PR** with the three design preview references, CI results, and exact links to the Astro/CSS sources. Do not mark ready, merge or deploy until the user says `APPROVE`. Respond to `REVISE` by working on this draft, not creating a new PR or reworking the public flagship.
