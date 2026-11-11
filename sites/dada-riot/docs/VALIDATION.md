# Dada Riot validation record

Validated from this independent directory:

- `npm run check` — asset inventory passes; Astro reports 0 errors and 0 warnings, with one TypeScript deprecation hint for the existing `document.execCommand` clipboard fallback.
- `npm run build` — 132 static routes built into `dist/`.
- `npm test` — 30 tests pass, 0 fail. Includes 100-quote and six-collection integrity, output route and internal asset/link checks, metadata, quote discovery/favorites logic, Studio layout/export logic, and 100 social preview dimensions.
- Browser verification — no horizontal overflow at 1440, 1024, 768, 390, or 320 CSS pixels; the mobile navigation opens at 320 pixels. Search narrows the archive; a saved favorite survives reload; copy feedback appears; Studio offers all 100 quotes, selects Dada by default, and downloads a complete PNG.

Screenshots are captured from the live Astro preview:

- [Full homepage, desktop](../tests/screenshots/dada-riot-home-desktop.png)
- [Full homepage, mobile 390 px](../tests/screenshots/dada-riot-home-mobile-390.png)
- [Collections directory, desktop](../tests/screenshots/dada-riot-collections-desktop.png)
- [Quote archive, desktop](../tests/screenshots/dada-riot-quotes-desktop.png)
- [Daily quote, desktop](../tests/screenshots/dada-riot-daily-desktop.png)
- [Trickster directory, desktop](../tests/screenshots/dada-riot-tricksters-desktop.png)
- [Resource library, desktop](../tests/screenshots/dada-riot-resources-desktop.png)
- [About page, desktop](../tests/screenshots/dada-riot-about-desktop.png)
- [Quote Studio, desktop](../tests/screenshots/dada-riot-studio-desktop.png)

The site has `noindex` metadata while it remains a development candidate. Production root configuration, Vercel settings, and production deployment are unchanged.
