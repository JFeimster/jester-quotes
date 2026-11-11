# Dada Riot artwork inventory

The complete visual rebuild uses a generated collage as a responsive hero and six separately composed, collection-specific covers. Quote poster previews are rendered locally from the canonical quote registry. Generated PNG masters are retained outside the repository; optimized WebP derivatives are committed here.

| Asset | Dimensions | Consumer |
|---|---:|---|
| `public/assets/dada-riot-v2/hero-desktop.webp` | 2000 × 1125 | Full-bleed desktop home hero |
| `public/assets/dada-riot-v2/hero-mobile.webp` | 1080 × 1350 | Portrait home hero at mobile widths |
| `public/assets/dada-riot-v2/cover-wise-fools.webp` | 1200 × 900 | Wise Fools directory card and detail |
| `public/assets/dada-riot-v2/cover-truth-to-power.webp` | 1200 × 900 | Truth to Power directory card and detail |
| `public/assets/dada-riot-v2/cover-laughter-and-life.webp` | 1200 × 900 | Laughter and Life directory card and detail |
| `public/assets/dada-riot-v2/cover-masks-and-identity.webp` | 1200 × 900 | Masks and Identity directory card and detail |
| `public/assets/dada-riot-v2/cover-carnival-absurdity.webp` | 1200 × 900 | Carnival Absurdity directory card and detail |
| `public/assets/dada-riot-v2/cover-art-of-the-jester.webp` | 1200 × 900 | Art of the Jester directory card and detail |
| `public/assets/dada-riot-wordmark-light.svg` | 980 × 180 viewBox | High-contrast masthead wordmark |
| `public/assets/dada-riot-hero-clean-16x9.png` | 1672 × 941 | Original first-pass hero master, retained |
| `public/assets/dada-riot-hero-clean-16x9.webp` | 1440 × 810 | Existing campaign art, retained |
| `public/assets/dada-riot-hero-mobile-4x5.webp` | 1080 × 1350 | Existing portrait campaign art, retained |
| `public/assets/dada-riot-wordmark-horizontal.svg` | 980 × 180 viewBox | Existing dark wordmark, retained |
| `public/assets/dada-riot-emblem-square.svg` | 512 × 512 viewBox | Brand mark and favicon source |
| `public/apple-touch-icon.png` | 180 × 180 | iOS home-screen icon |
| `public/assets/dada-riot-collection-01-cover-4x3.webp` … `06-cover-4x3.webp` | 960 × 720 each | First-pass art, retained for fallback references |
| `public/assets/dada-riot-poster-square.webp` | 1080 × 1080 | Existing poster artwork |
| `public/assets/dada-riot-poster-portrait.webp` | 1080 × 1350 | Existing portrait social poster background |
| `public/assets/dada-riot-og-1200x630.png` | 1200 × 630 | Open Graph master |
| `public/og-jester-quotes.png` | 1200 × 630 | Open Graph/Twitter metadata |
| `public/social/quotes/jester-quote-001.png` … `jester-quote-100.png` | 1200 × 630 each | Quote cards, broadside and Studio print proofs |

`npm run social:generate` regenerates the quote previews from `src/data/jester-quotes.json`; 12 previews use a visibly labeled excerpt where the full quote cannot fit the social aspect ratio. Quote Studio exports retain the complete quote and author attribution using PNG or paginated ZIP output.
