# Jester Quotes — Asset Architecture v2.0 (Task 1)

**Scope:** Future-facing directory taxonomy, metadata schema, naming rules and structural validation only. No images migrated, uploaded, integrated or changed. The canonical asset registry and optimization/ingestion tooling belong to **Task 2**, after approval.

## Architecture: purpose → content family → ratio where production volume warrants

`public/assets/` is the new canonical destination for **future approved manual assets**. Keep existing Astro source imports in `src/assets/` and the active production URLs for the current two hero PNGs, generated quote PNGs, browser icons and social/OG images unchanged until a separately validated migration.

The directory list lives in [`config/asset-architecture.json`](../config/asset-architecture.json) and is checked by [`scripts/validate-assets.mjs`](../scripts/validate-assets.mjs). Empty directories use a tracked `.gitkeep` file. Do **not** replace those with dummy images.

### Complete directory inventory

```text
public/assets/
├── branding/
│   ├── logos/
│   ├── avatars/
│   ├── profiles/
│   ├── favicons/
│   └── icons/
├── images/
│   ├── heroes/
│   ├── banners/
│   ├── thumbnails/
│   ├── backgrounds/
│   ├── illustrations/
│   └── featured/
├── collections/
│   ├── 01-wise-fool/
│   ├── 02-truth-power/
│   ├── 03-laughter-life/
│   ├── 04-masks-identity/
│   ├── 05-carnival-absurdity/
│   └── 06-art-of-jester/
├── social/
│   ├── open-graph/
│   ├── posts/
│   │   ├── 1x1/
│   │   ├── 4x5/
│   │   └── 16x9/
│   ├── stories/
│   │   └── 9x16/
│   ├── carousels/
│   │   ├── 1x1/
│   │   ├── 4x5/
│   │   └── 9x16/
│   ├── reels/
│   │   └── 9x16/
│   └── templates/
├── videos/
│   ├── promotional/
│   ├── explainers/
│   ├── shorts/
│   ├── backgrounds/
│   └── thumbnails/
├── studio/
│   ├── templates/
│   ├── mockups/
│   ├── presets/
│   └── promotional/
├── resources/
│   ├── articles/
│   ├── videos/
│   └── downloads/
└── themes/
    ├── midnight-carnival/
    ├── neo-brutalist/
    └── velvet-gallery/
```

**Classification rules:** Use **purpose first**, the collection's numbered folder for collection-specific artwork, and ratio-specific folders in high-volume social production (`posts`, `stories`, `carousels`, `reels`). Place a video thumbnail in `videos/thumbnails/`, not `images/thumbnails/`; put reusable decorative textures/patterns in `themes/` but collection artwork in `collections/`. A carousel slide belongs under `social/carousels/<ratio>/`, rather than `collections/` even if it features a collection. Do not duplicate files across categories just to support multiple uses; reference one URL from multiple pages.

## Naming

For assets with a ratio, use `[style]-[subject-or-purpose]-[variant?]-[ratio].[ext]`. Use lowercase kebab-case, zero-padded collection numbers and normalized ratios **16x9, 4x5, 4x3, 1x1, 9x16**. Keep filenames self-explanatory without duplicating the whole directory path. Do not encode dimensions redundantly when the ratio is sufficient.

| Destination | Example |
|---|---|
| `branding/logos/` | `midnight-carnival-logo-horizontal.png` |
| `branding/avatars/` | `midnight-carnival-avatar-1x1.png` |
| `images/heroes/` | `midnight-carnival-hero-16x9.png` |
| `collections/01-wise-fool/` | `midnight-carnival-collection-01-wise-fool-clean-4x3.png` |
| `collections/01-wise-fool/` | `midnight-carnival-collection-01-wise-fool-editorial-4x3.png` |
| `social/carousels/4x5/` | `midnight-carnival-wisdom-slide-01-4x5.png` |
| `social/stories/9x16/` | `midnight-carnival-wisdom-story-9x16.png` |
| `videos/thumbnails/` | `midnight-carnival-archetype-thumbnail-16x9.png` |
| `studio/promotional/` | `midnight-carnival-studio-16x9.png` |
| `themes/neo-brutalist/` | `neo-brutalist-background-16x9.webp` |

If a previously approved file is named differently (e.g. `midnight-carnival-collection-01-wise-fool-4x3.png`), retain its original filename on upload and document its canonical path in Task 2; avoid duplicate renamed copies.

### Future metadata contract

[`schemas/image-asset.schema.json`](../schemas/image-asset.schema.json) specifies the shape of *future* asset entries: ID, published path, type, style, optional collection/variant, ratio and actual pixel dimensions, usage, alt text, provenance/licensing and status (`planned` → `generated` → `approved` → `uploaded` → `integrated` → `archived`). The schema **does not claim** a planned path exists. A future registry may use an array of records validated against this schema; it will be added in Task 2, not Stage 1.

## Verification

```powershell
npm run assets:validate
npm run check
npm run build
npm test
```

The structural validator checks every expected directory, rejects unknown top-level asset categories, checks basic filename/format conventions for files in the new tree, enforces ratio-folder consistency and confirms legacy file locations exist. It **does not** inspect image contents, dimensions, licensing, or the future asset registry; those are Task 2 responsibilities.

## Migration boundary — protect live site

Existing URLs and consumers remain unchanged:
- `/images/midnight-carnival-hero-16x9.png`
- `/images/midnight-carnival-hero-4x5.png` (currently in `Hero.astro`)
- `/social/quotes/jester-quote-001.png` through `100.png`
- `/favicon.svg`, `/apple-touch-icon.png`, `/og-jester-quotes.png`, `/site.webmanifest`
- `src/assets/` Astro component imports

The newly committed `.gitkeep` files are not functional website assets. A production deploy may now include empty-category folders, but no site imagery is switched until explicit Task 2 approval.
