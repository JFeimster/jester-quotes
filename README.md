# Jester Quotes

**100 quotations. One midnight carnival of wit, wisdom, and mischief.**

[Live website](https://jester-quotes.vercel.app/) · [Project board](https://github.com/users/JFeimster/projects/11) · [Production deployments](https://vercel.com/jason-feimsters-projects/jester-quotes/deployments)

A responsive, static quotation collection built with **Astro 7, TypeScript, CSS, and Sharp**, hosted on Vercel. The **Midnight Carnival 2.0** public visual system uses editorial typography, a custom illustrated jester, and the midnight/velvet/gold/ivory/coral palette.

## What works today

- Browse 100 individually addressable quotation pages, with preserved authors and any supplied references.
- Explore six hand-curated themes across 96 distinct quotations at `/collections/` (quotes may appear in multiple themes).
- Create custom quote artwork in the browser at `/studio/` (4 canvas formats × 4 palettes; full-resolution PNG export).
- Review provenance, citation coverage, correction reporting, and reuse guidance at `/sources/`.
- Browse **11 independently sourced, original short Trickster profiles** at `/tricksters/`, with search, figure/media/tag filters, random discovery, and contextual source links.
- Browse a **Resource Vault of 9 verified links** at `/resources/` and a **Video Library of 5 verified YouTube lessons** at `/videos/`; searchable topic/publisher filters, related Trickster links, and user-initiated privacy-enhanced playback.
- Search quote text, people, and references; filter quotes with/without references.
- Save favorites in the browser (localStorage), with cross-tab synchronization; no account or server database.
- View a deterministic shared-UTC Daily Quote at `/daily/`, save/copy it, and jump to related editorial themes or a random verified Trickster.
- Open a private `/saved/` library with search, sorting, validated JSON import/export, clear/remove confirmations, and up to five selected quotes exported as complete PNG slides + a rights/attributions text file inside a ZIP. Existing `jester-quotes:favorites:v1` browser storage remains the sole favorites source.
- Find a random quote, copy text, and share/copy a quotation link.
- Download complete quotations and full author attribution as square **1080 × 1080** PNG artwork, or an automatic **ZIP of numbered PNG slides** when a quotation cannot fit legibly. Quote Studio supports four canvas dimensions and four palettes.
- Download **1200 × 630** social/OG previews; long excerpts are explicitly labeled inside their artwork and never represented as complete-quote downloads.
- Generate canonical URLs, XML sitemap, robots rules, Open Graph/Twitter metadata, and schema.org quotation structured data.
- Responsive desktop/mobile layout, accessible controls, keyboard skip link, and reduced-motion support.

## Run locally

Requirements: **Node.js 22** (see `.nvmrc`), npm, and Git. Prefer the project's existing lockfile.

```powershell
git clone https://github.com/JFeimster/jester-quotes.git
cd jester-quotes
npm ci
npm run dev
```

Open the local URL printed by Astro (normally `http://localhost:4321`).

### Validation

```powershell
npm run check
npm run build
npm test
npm audit --audit-level=high
```

**Run `npm run build` before `npm test` on a fresh clone:** the publication-readiness tests inspect the generated `dist/` output. The build also runs `npm run social:generate` automatically. To regenerate social assets without rebuilding the site, use `npm run social:generate`.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local Astro development server |
| `npm run check` | Astro/TypeScript diagnostics |
| `npm run build` | Generate social images and build the static site |
| `npm test` | Data, image, interaction, layout, and publication regression tests |
| `npm run preview` | Serve the generated production build locally |
| `npm run social:generate` | Regenerate the 100 PNG previews, OG image, and touch icon |

## Asset Architecture v2.0 — Task 1

The complete, future-ready `public/assets/` taxonomy is scaffolded with directories for branding, images, all six collections, ratio-specific social posts/stories/carousels/reels, videos, Studio, resources and reusable visual themes. **No existing assets were moved or URLs changed.** Uploads and integration follow in Task 2.

- [Full architecture, filenames and migration boundary](docs/IMAGE-ASSETS.md)
- [Machine-readable directory taxonomy](config/asset-architecture.json)
- [Future asset-entry JSON Schema](schemas/image-asset.schema.json)
- Run `npm run assets:validate` to verify directories and preserve legacy paths; `npm run check` runs this automatically.

## Repository structure

```text
.github/workflows/
  ci.yml                    Checks, build, tests, security audit
  auto-squash.yml           Merge validated trusted PRs automatically
data/jester-quotes.csv      Original CSV archive
data/tricksters.csv         Export of verified directory profiles
data/trickster-candidates.csv  Unpublished research leads (not displayed)
data/resources.csv         Export of sourced external reference links
data/videos.csv            Export of confirmed YouTube directory entries
public/                     Directly served static assets
  images/                   Approved manual artwork (see docs/IMAGE-ASSETS.md)
  social/quotes/            Generated quote PNGs (unchanged URLs)
scripts/
  generate-social-images.mjs
src/
  assets/                   Custom jester SVG and decorative assets
  components/               Hero, gallery, cards, favorites, share/poster UI
  data/jester-quotes.json   Canonical quote registry (100 entries)
  data/collections.json    Editorial quote-ID groupings (not a new quote database)
  data/tricksters.json     Independently sourced, verified profile data
  data/resources.json     Source-linked editorial Resource Vault
  data/videos.json        Verified YouTube directory metadata
  layouts/BaseLayout.astro  Shared SEO, metadata, navigation, styling
  lib/                      Quote data, SEO, filters, poster layout
  pages/
    index.astro             Collection home / quote search
    about.astro             Jester archetype introduction
    404.astro               Accessible 404 page
    quotes/[id].astro       100 static quote detail routes
    collections/index.astro  Six editorial themes
    collections/[slug].astro Curated quote pages
    studio.astro             Client-side poster customization
    daily.astro              Deterministic UTC daily selection (client-rendered)
    saved.astro              Browser-only favorites shelf (noindex)
    tricksters/index.astro  Searchable sourced directory
    tricksters/[slug].astro Verified individual profiles
    resources/index.astro  Filterable Resource Vault
    videos/index.astro     Privacy-conscious YouTube directory
    lab/index.astro        Unindexed, unlinked design variations (draft preview)
    sources.astro            Provenance and correction information
    sitemap.xml.ts          XML index of public routes
    robots.txt.ts           Robots policy and sitemap URL
  scripts/                  Favorites, explorer, downloadable posters
  styles/                   Tokens, global CSS, Midnight Carnival design
  types/                    Quote and registry interfaces
tests/                      Automated regression tests
astro.config.mjs            Astro static-site and canonical origin
vercel.json                 Production-only Git deployment policy
CREDITS.md                  Source and publication-rights information
```

### Source of truth and attribution

- **Canonical quote dataset:** `src/data/jester-quotes.json`.
- **CSV archive:** `data/jester-quotes.csv`; preserve this alongside the dataset when intentionally changing records.
- **Collection source:** [100 Jester Quotes — Know Your Archetypes](https://knowyourarchetypes.com/jester-quotes/).
- **Identifiers:** `jester-quote-001` through `jester-quote-100`; do not renumber existing IDs or silently rewrite quotations, people, or references.
- The collection currently has 100 quotations attributed to 92 distinct people. Reference metadata is provided for 14 entries; missing references must not be invented.
- The social image generator emits `public/social/quote-layouts.json` with measured text-region dimensions, author fit and excerpt status for all 100 previews; the CI test asserts geometric integrity. Existing `public/social/quotes/` URLs remain unchanged.
- `src/lib/artwork/` centralizes measured layout and local PNG/ZIP exports for Studio and individual quote pages; the Saved Library reuses the same renderer for small complete-quotation packs.
- Daily selections are computed in the browser using one UTC date across time zones, not regenerated as indexed pages. Saved items stay in `localStorage` and can be backed up as a versioned JSON export; validation rejects bad imports before persistence. `/saved/` is deliberately noindex and excluded from the sitemap. No client-side library or server endpoint is required.
- `src/data/collections.json` maps themes to existing quote IDs. Collections are intentionally non-exclusive editorial lists, and they must not duplicate or alter the canonical quote registry.
- `src/data/resources.json` and `src/data/videos.json` are small curated link registries. Their summaries are original, video IDs and creators are verified, and all media stays with its source publisher. Videos embed through `youtube-nocookie.com` **only after the visitor presses Load player**; links remain usable without scripts. No `/public/videos/` directory or third-party video files are created.
- The Trickster registry publishes only independently evidenced records. Each entry includes stable IDs, source URLs, verification date, original summary and contextual collection links. `data/trickster-candidates.csv` remains **unpublished**; no artwork is scraped or assumed licensed. Review `docs/TRICKSTER-EDITORIAL.md` before adding entries.
- Quote Studio imports the same registry, existing `poster-layout.ts` text-fitting helper and shared artwork renderer. Artwork is rendered locally in a browser canvas; long quotes are paginated rather than clipped, with one ZIP download for all slides.

**Copyright:** Attributions are not licenses. The site's existing quotations come from third-party sources and may require permission or a documented legal basis for reproduction. Review `CREDITS.md` and resolve publication rights before expanding distribution or adding third-party material.

### Image asset organization

Keep manually created brand and collection artwork flat in `public/images/`; the existing 100 generated social previews remain in `public/social/quotes/`. The live homepage already uses `midnight-carnival-hero-4x5.png`. Upload and integrate future assets only after confirming exact paths. See [Image assets and naming](docs/IMAGE-ASSETS.md) for the complete collection-cover and brand-asset registry.

## Design Lab (unindexed preview)

The optional `/lab/` route presents Midnight Carnival, Neo-Brutalist Jester, and Luxury Bento / Velvet Gallery as **three different page compositions**, not just recolors. The lab uses the same canonical quotations, quote-card actions, source registries and `/studio/` downloads as the published site. Theme specifications live in `src/design/themes/`; `src/design/layouts/` holds the three component compositions, with one scoped design stylesheet and an accessible no-storage tab selector.

The Lab remains **`noindex, nofollow`**, is excluded from the sitemap and public navigation, and does not change the public Midnight Carnival default. No new frameworks, CMS, root `assets/` folder, or cloned quote datasets are introduced.

## Deployment and automation

Vercel project: [jester-quotes](https://vercel.com/jason-feimsters-projects/jester-quotes)

- `main` is the **Production** branch. `vercel.json` disables automatic Vercel Preview deployments for non-`main` branches, avoiding a Vercel build for every work-in-progress commit.
- GitHub Actions runs `.github/workflows/ci.yml` on pushes and PRs: `npm ci`, Astro checks, the static build, tests, and a high-severity npm audit.
- `.github/workflows/auto-squash.yml` listens for **successful PR CI**, then automatically **squash-merges** an unchanged, non-draft, same-repository PR targeting `main`. The workflow verifies that the PR head is the exact SHA that passed validation.
- **Manual review is retained** for PRs from forks, draft PRs, failed/stale checks, and PRs changing `.github/workflows/**` or `vercel.json`. These privileged changes are intentionally excluded from unattended merges.
- After a merge into `main`, Vercel's existing Git integration handles the **Production** deployment. No Vercel deployment token or separate deployment pipeline is needed.
- This is a **repository-level** auto-merge policy, not a change to other repositories in the GitHub account.

> GitHub Actions merges performed with its built-in `GITHUB_TOKEN` do not start new GitHub Actions push-workflow runs. The associated PR validation is therefore the CI gate for automated merges; Vercel Production deployment status should be checked after release.

### Canonical domain

Canonical URLs and social metadata use `PUBLIC_SITE_URL`, falling back to `https://jester-quotes.vercel.app` when unset. For local builds, copy `.env.example` to `.env` only if you need to override the domain.

When introducing a custom domain, update the **Production** `PUBLIC_SITE_URL` value in Vercel to that domain and verify the resulting canonical URLs, sitemap, and Open Graph images. Avoid placeholders such as `https://your-domain.example`.

## Development conventions

Keep the static architecture and existing routes unless a new capability requires a change. Add content/features in coherent batches with targeted tests, preserve responsive behavior and accessibility, and prefer reusable components to duplicate pages or data registries. Check GitHub Actions and the Vercel Production deployment after release.

**Current status:** Midnight Carnival 2.0, publication metadata, six curated Collections, browser Quote Studio, Sources & Attribution, and the sourced Trickster Directory plus Resource/Video libraries are implemented. Possible later additions: a rotating daily quotation and a dedicated saved-quote library.
