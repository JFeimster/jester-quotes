# Jester Quotes — Dada Riot

A standalone Astro edition of Jester Quotes. It carries the canonical quote archive, six collection mappings, supporting route families, and the existing client-side search, saved quotes, copy/share, and poster export behavior. The current root website remains the live Midnight Carnival edition.

## Run independently

```powershell
cd "sites/dada-riot"
npm ci
npm run dev
```

Other commands: `npm run check`, `npm run build`, `npm test`, and `npm run preview`. Build output stays in this directory's `dist/`. Every route sets `noindex, nofollow, noarchive` metadata while this is a development candidate.

## Content and interactions

- All 100 canonical quotes and existing attribution/reference records
- Quote directory/detail pages, daily quote, saved quotes, search, and sharing
- Six collections using existing slugs, quote IDs, and mappings
- Trickster directory/profiles, resource vault, video library, sources, about, sitemap, robots, 404, and Quote Studio
- Quote Studio retains all formats and functioning styles; Dada Riot is the default and long quotations export as complete paginated PNGs/ZIPs

## Artwork

Original Dada Riot hero collage and derived responsive, social, and collection artwork are in `public/assets/`. The six collection covers use different crops and tonal treatments of the generated collage master. Source asset registries remain available in this self-contained tree; Dada Riot templates use the new art set.

## Promotion procedure (manual, after explicit release authorization)

1. Preserve the current root edition by creating and verifying a tagged backup or archival branch from the then-current production commit. Keep its root `src/`, `public/`, and package/configuration files intact in that archive.
2. On a separate promotion branch, stage the Dada edition's `src/`, `public/`, `data/`, `schemas/`, `scripts/`, package files, Astro config, and TypeScript config at the repository root. Compare route manifests, asset paths, and lockfiles before replacing anything.
3. Run `npm ci`, `npm run check`, `npm test`, and `npm run build` at the root. Review routes, metadata, accessibility, and responsive captures.
4. Confirm the existing Vercel project still builds the repository root on its existing production branch. Do not change Vercel root directory or production settings as part of promotion.
5. After explicit authorization, merge the approved promotion change and deploy through the existing project. Verify core routes, assets, search, saved quotes, and Studio exports.
6. To restore Midnight Carnival, revert the promotion commit (or restore the archived root files), rebuild and verify, then deploy the rollback through the same existing project.

No root-site promotion, merge, or deployment is performed by this standalone build.
