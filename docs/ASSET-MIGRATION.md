# Asset Migration Map — v2.0

**Status: plan only. No binaries or URLs have been moved by Task 2.** Preserve live assets while the local artwork is uploaded in separately reviewed batches.

## Existing paths → intended v2 destinations

| Currently served URL / source | Intended future location | State |
|---|---|---|
| `/images/midnight-carnival-hero-16x9.png` | `/assets/images/heroes/midnight-carnival-hero-16x9.png` | Existing URL preserved; not migrated |
| `/images/midnight-carnival-hero-4x5.png` | `/assets/images/heroes/midnight-carnival-hero-4x5.png` | Existing URL preserved; referenced in `src/components/Hero.astro` |
| `/social/quotes/jester-quote-001.png` through `100.png` | **Remain at current URLs** | Generated previews; no migration |
| `/og-jester-quotes.png` | **Remain at current URL** | Generated default Open Graph image |
| `/favicon.svg` | **Remain at current URL** | Active favicon |
| `/apple-touch-icon.png` | **Remain at current URL** | Active touch icon |
| `/site.webmanifest` | **Remain at current URL** | Active manifest |
| `src/assets/*.svg` | **Remain in Astro source tree** | Imported SVG assets |

## Planned incoming local artwork (not yet in GitHub)

- Horizontal logo → `public/assets/branding/logos/`
- Profile/bio → `public/assets/branding/profiles/`
- Avatar → `public/assets/branding/avatars/`
- Favicon design source → `public/assets/branding/favicons/`; active root favicon stays unchanged until reviewed
- Six collections: clean and editorial pair → `public/assets/collections/01-wise-fool/` through `06-art-of-jester/`
- Quote Studio banner → `public/assets/studio/promotional/`
- Social carousels and story/post formats → matching ratio-specific `public/assets/social/` folders
- Video thumbnails → `public/assets/videos/thumbnails/`

## Safe migration rules

1. Upload new copies and record real dimensions. Do not delete legacy files in the same step.
2. Update registry `path`, then consuming Astro components; validate every reference.
3. Preserve old URLs with existing files or deliberate redirects if any external links need them.
4. Review CI, build, and production. Only after confirming equivalent behavior should removing redundant old binaries be discussed.
5. Do not change `src/data/jester-quotes.json`, generated quote filenames or image generator paths for organizational convenience.

**Task 2 creates tooling and documentation only; it does not authorize migrating images.**
