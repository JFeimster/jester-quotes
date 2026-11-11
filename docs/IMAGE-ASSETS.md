# Jester Quotes — Asset Architecture v2.0

This is the operational guide for the **existing Stage 1 folder taxonomy** and **Task 2 asset tooling**. The repository already has the full `public/assets/` directory tree, including 42 tracked leaf folders for brand, imagery, collections, social by ratio, videos, Studio, resources and themes.

- **Taxonomy:** [`config/asset-architecture.json`](../config/asset-architecture.json)
- **Metadata contract:** [`schemas/image-asset.schema.json`](../schemas/image-asset.schema.json)
- **Canonical manual-image registry:** [`src/data/image-assets.json`](../src/data/image-assets.json)
- **Typed lookup API:** [`src/lib/assets.ts`](../src/lib/assets.ts)
- **Local inventory:** [`data/asset-inventory.csv`](../data/asset-inventory.csv)
- **Preserved-path mapping:** [`docs/ASSET-MIGRATION.md`](ASSET-MIGRATION.md)

## Directory logic

Organize by **purpose first**; use numbered collection folders when the image belongs to one collection; use **ratio folders** for high-volume `social/posts/`, `social/stories/`, `social/carousels/` and `social/reels/`. The Stage 1 folders already include all planned sections—not merely folders with existing images.

```text
public/assets/
├── branding/{logos,avatars,profiles,favicons,icons}/
├── images/{heroes,banners,thumbnails,backgrounds,illustrations,featured}/
├── collections/{01-wise-fool,02-truth-power,03-laughter-life,
│                04-masks-identity,05-carnival-absurdity,06-art-of-jester}/
├── social/{open-graph,posts/{1x1,4x5,16x9},stories/9x16,
│           carousels/{1x1,4x5,9x16},reels/9x16,templates}/
├── videos/{promotional,explainers,shorts,backgrounds,thumbnails}/
├── studio/{templates,mockups,presets,promotional}/
├── resources/{articles,videos,downloads}/
└── themes/{midnight-carnival,neo-brutalist,velvet-gallery}/
```

**Categorization:** Movie/video thumbnail → `videos/thumbnails/`; collection clean/editorial pair → that numbered collection folder; carousel slide → `social/carousels/<ratio>/`, even if based on a collection; reusable motif/ornament → `themes/<style>/`. Cross-publish by reference rather than copying the same binary to several folders.

## Filenames and formats

Use lowercase kebab-case: `[style]-[subject]-[variant?]-[ratio].[extension]`. Choose `1x1`, `4x3`, `4x5`, `16x9`, `9x16` etc.; use `01`–`06` for collections and `slide-01`, `slide-02` for sequential carousel slides.

Examples:
- `branding/logos/midnight-carnival-logo-horizontal.png`
- `branding/avatars/midnight-carnival-avatar-1x1.png`
- `collections/04-masks-identity/midnight-carnival-collection-04-masks-identity-editorial-4x3.png`
- `social/carousels/4x5/midnight-carnival-wisdom-slide-01-4x5.png`
- `videos/thumbnails/midnight-carnival-trickster-thumbnail-16x9.png`
- `studio/promotional/midnight-carnival-studio-16x9.png`

The filename's ratio is an editorial descriptor, **not verified pixel dimensions**. Preserve an already approved original filename; don't generate duplicates solely to impose a new naming pattern.

## Registry contract

`src/data/image-assets.json` is a JSON **array** of image records, validated against the properties/enums in `schemas/image-asset.schema.json`. Each entry needs a unique `id`, public `path`, `assetType`, `style`, and `status`. Add optional collection, variant, ratio, actual dimensions, usage, alt, source, license and notes. **Only confirmed files belong in uploaded/integrated statuses.**

- `planned`: concept/future asset, not on disk.
- `generated`: image created locally, not yet approved or uploaded.
- `approved`: approved local file; path is reserved but cannot yet be resolved.
- `uploaded`: file exists at the exact public path; not necessarily rendered by a page.
- `integrated`: uploaded file is already referenced by the live application.
- `archived`: excluded from regular use.

Existing hero URLs now use canonical `/assets/images/heroes/...` paths; the old `/images/...` URLs are preserved through permanent Vercel redirects. The registry stores verified binary dimensions where available, and the validator checks declared dimensions against actual image metadata.

`src/lib/assets.ts` exports `getAsset(id)`, `findAssets(filter)`, `selectAsset(filter)`, `resolveAssetPath(id)`, and `imageAssets`. Resolution is gated on `uploaded`/`integrated`; planned artwork never creates a broken URL.

## Midnight Carnival artwork integration

The 13 approved PNGs (logo, Studio promo, collection covers, and Collections feature art) are present at their canonical paths and integrated into the site header, collection cards/details, Collections overview, and Quote Studio. Their registry entries use `integrated` only where the application renders them. Registered WebP derivatives reduce transfer weight while preserving each approved PNG as the `<picture>` fallback. The separate wide hero remains `uploaded` because it is not currently rendered.

No avatar, profile/bio illustration, favicon source, standalone carousel slide or separate social post image was included in this set. Those folders remain reserved.

No avatar, profile/bio illustration, favicon source, standalone carousel slide or separate social post image was attached in this set. Those folders remain reserved.

## Upload & integration workflow

1. Place approved artwork under its purpose/ratio/collection folder in `public/assets/`.
2. Add/update exactly one registry record with the **real file path** and verified metadata. For image files, the structural validator flags unregistered files (no silent orphans).
3. Run `npm run assets:validate`; when dimensions are supplied, it checks the PNG/JPEG/WebP/AVIF/GIF pixel size using Sharp.
4. Regenerate the human-facing inventory: `npm run assets:inventory -- --write`; commit the CSV with the registry.
5. Integrate the path in Astro with `resolveAssetPath` or a typed selection. Supply alt text and accurate intrinsic size and responsive `sizes`.
6. Run `npm run check`, `npm run build`, `npm test`. Review the generated page and CI before merging.

### Optional optimization (originals preserved)

```powershell
# Read-only preview — default
npm run assets:optimize -- --input public/assets/collections/01-wise-fool

# Explicit opt-in creates a new, non-overwriting WebP derivative
npm run assets:optimize -- --input public/assets/collections/01-wise-fool --format webp --width 1600 --quality 82 --write

# Alternative AVIF
npm run assets:optimize -- --input public/assets/images/heroes/example.png --format avif --width 1200 --write
```

The optimizer limits inputs to `public/assets/`, refuses symlinks, never enlarges, uses exclusive-create (no overwrite), and emits `*-optimized-1600w.webp` / `*.avif` next to the source. Generated derivatives **must be registered** before committing; the validator will otherwise flag them as orphaned images. This is intentionally an explicit local operator command, **not** a build-time or CI-side auto-transform.

## Protected legacy assets

The two original `/images/midnight-carnival-hero-*.png` URLs redirect permanently to `/assets/images/heroes/`; there is no longer a `public/images/` folder. Keep all `public/social/quotes/` generated PNGs, `public/og-jester-quotes.png`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/site.webmanifest` and existing `src/assets/` files at their working paths.

The programmatic quote image generator is separate from the manual image registry; its 100 generated quote PNGs and the OG image are **not** individual records in `image-assets.json`.

## Check commands

```powershell
npm run assets:validate
npm run assets:inventory
npm run assets:optimize -- --help
npm run check
npm run build
npm test
```

`npm run check` runs the asset validator before Astro checks. It will fail on missing registered files, duplicate IDs/paths, undeclared folders, ratio-folder naming mismatches, unregistered new image files and incorrect claimed pixel dimensions.
