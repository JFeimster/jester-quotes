# Dada Riot artwork inventory

The hero collage is the original generated master. Responsive and campaign art are optimized derivatives; six collection covers use distinct crops and restrained tonal variations of that master. Quote poster previews are rendered locally from the canonical quote registry in the Dada palette.

| Asset | Dimensions | Consumer |
|---|---:|---|
| `public/assets/dada-riot-hero-clean-16x9.png` | 1672 × 941 | Hero master; PNG fallback |
| `public/assets/dada-riot-hero-clean-16x9.webp` | 1440 × 810 | Desktop hero, collections feature, Studio promo |
| `public/assets/dada-riot-hero-mobile-4x5.webp` | 1080 × 1350 | Mobile hero |
| `public/assets/dada-riot-wordmark-horizontal.svg` | 980 × 180 viewBox, transparent | Site header |
| `public/assets/dada-riot-emblem-square.svg` | 512 × 512 viewBox, transparent | Brand mark and favicon source |
| `public/apple-touch-icon.png` | 180 × 180 | iOS home-screen icon |
| `public/assets/dada-riot-collection-01-cover-4x3.webp` … `06-cover-4x3.webp` | 960 × 720 each | Six collection cards and detail pages |
| `public/assets/dada-riot-poster-square.webp` | 1080 × 1080 | Homepage studio and video feature art |
| `public/assets/dada-riot-poster-portrait.webp` | 1080 × 1350 | Portrait social poster background |
| `public/assets/dada-riot-og-1200x630.png` | 1200 × 630 | Open Graph master |
| `public/og-jester-quotes.png` | 1200 × 630 | Open Graph/Twitter metadata |
| `public/social/quotes/jester-quote-001.png` … `jester-quote-100.png` | 1200 × 630 each | Quote cards and per-quote share previews |

`npm run social:generate` regenerates the 100 quote previews from `src/data/jester-quotes.json`; 12 previews use a visibly labeled excerpt where a full quote cannot fit the social aspect ratio. Quote Studio exports retain the complete quote and author attribution using PNG or paginated ZIP output.
