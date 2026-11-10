# Asset Migration Map — v2.0

**Status: hero migration complete.** Both hero PNGs are at their v2 locations. Existing public URLs receive permanent Vercel redirects. Remaining brand/collection integration is a separate task.

## Existing paths → intended v2 destinations

| Currently served URL / source | Intended future location | State |
|---|---|---|
| `/images/midnight-carnival-hero-16x9.png` | `/assets/images/heroes/midnight-carnival-hero-16x9.png` | Migrated; original URL redirects permanently |
| `/images/midnight-carnival-hero-4x5.png` | `/assets/images/heroes/midnight-carnival-hero-4x5.png` | Migrated; original URL redirects permanently; current Hero and Editorial Layout references updated |
| `/social/quotes/jester-quote-001.png` through `100.png` | **Remain at current URLs** | Generated previews; no migration |
| `/og-jester-quotes.png` | **Remain at current URL** | Generated default Open Graph image |
| `/favicon.svg` | **Remain at current URL** | Active favicon |
| `/apple-touch-icon.png` | **Remain at current URL** | Active touch icon |
| `/site.webmanifest` | **Remain at current URL** | Active manifest |
| `src/assets/*.svg` | **Remain in Astro source tree** | Imported SVG assets |

## Other artwork and future integration

- Horizontal logo → `public/assets/branding/logos/`
- Profile/bio → `public/assets/branding/profiles/`
- Avatar → `public/assets/branding/avatars/`
- Favicon design source → `public/assets/branding/favicons/`; active root favicon stays unchanged until reviewed
- Six collections: clean and editorial pair → `public/assets/collections/01-wise-fool/` through `06-art-of-jester/`
- Quote Studio banner → `public/assets/studio/promotional/`
- Social carousels and story/post formats → matching ratio-specific `public/assets/social/` folders
- Video thumbnails → `public/assets/videos/thumbnails/`

## Safe migration rules

1. Verify each new asset exists at its canonical path before updating consumers.
2. Update the registry path and all consuming Astro components and tests together; validate every reference.
3. Preserve old URLs with deliberate permanent redirects (currently configured for the two hero URLs).
4. Review CI, build, and production; do not introduce duplicate copies solely for compatibility.
5. Do not change `src/data/jester-quotes.json`, generated quote filenames or image generator paths for organizational convenience.

**Hero migration:** Two canonical v2 hero files are present, and `public/images/` has been retired. The 100 quote previews, default OG image, favicon, touch icon, manifest and Astro-imported source art remain unchanged.
