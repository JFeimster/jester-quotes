# Dada Riot validation record

Validated from this independent directory:

- `npm ci` — clean dependency install; 0 vulnerabilities.
- `npm run check` — asset inventory passes; Astro reports 0 errors and 0 warnings, with one TypeScript deprecation hint for the existing `document.execCommand` clipboard fallback.
- `npm run build` — 132 static routes built into `dist/`.
- `npm test` — 30 tests pass, 0 fail. Includes 100-quote and six-collection integrity, output route and internal asset/link checks, metadata, quote discovery/favorites logic, Studio layout/export logic, and 100 social preview dimensions.
- `node --test tests/browser-e2e.test.mjs` — real Chrome checks routes, PNG/ZIP downloads, favorites persistence, quote filtering, reduced motion, keyboard focus and responsive UI. Includes a mobile menu and interaction checks at 390 and 768 CSS pixels.
- Responsive route sweep — all 17 main routes checked without horizontal overflow at 320, 390, 768, 1024 and 1440 CSS pixels.
- `npm audit --audit-level=high` — 0 vulnerabilities.

Screenshots are captured from the built Astro preview. The desktop homepage image shows the first viewport; the mobile homepage image shows the full page.

- [Homepage hero, desktop](../tests/screenshots/dada-riot-home-desktop.png)
- [Homepage hero, mobile 390 px](../tests/screenshots/dada-riot-home-mobile-hero-390.png)
- [Full homepage, mobile 390 px](../tests/screenshots/dada-riot-home-mobile-390.png)
- [Collections directory, desktop](../tests/screenshots/dada-riot-collections-desktop.png)
- [Collection detail, desktop](../tests/screenshots/dada-riot-collection-detail-desktop.png)
- [Quote archive, desktop](../tests/screenshots/dada-riot-quotes-desktop.png)
- [Quote detail, desktop](../tests/screenshots/dada-riot-quote-detail-desktop.png)
- [Daily quote, desktop](../tests/screenshots/dada-riot-daily-desktop.png)
- [Trickster directory, desktop](../tests/screenshots/dada-riot-tricksters-desktop.png)
- [Resource library, desktop](../tests/screenshots/dada-riot-resources-desktop.png)
- [About page, desktop](../tests/screenshots/dada-riot-about-desktop.png)
- [Quote Studio, desktop](../tests/screenshots/dada-riot-studio-desktop.png)

The site has `noindex` metadata while it remains a development candidate. Production root configuration, Vercel settings, and production deployment are unchanged.
