# Jester Quotes Site

Astro + TypeScript + CSS static collection of 100 jester quotes.

## Local setup
- Install Node.js 22 or newer (a current LTS release).
- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`

The canonical quote dataset is `src/data/jester-quotes.json`, copied from your local source folder.
The CSV archive is `data/jester-quotes.csv`.

The first build invokes `npm run social:generate` to produce 100 PNG social preview cards at `public/social/quotes/`.
Individual quote pages are statically generated from quote IDs.

Set `PUBLIC_SITE_URL` to the site's actual canonical production origin (currently `https://jester-quotes.vercel.app`) in Vercel when a production domain changes. Local and preview builds without that variable use the production URL as their canonical fallback, not a preview hostname.

The Midnight Carnival 1.1 artwork is a custom SVG in `src/assets/jester-hero.svg`, with visual refinements isolated in `src/styles/midnight-carnival.css`. Review quotation publication rights and attributions before broader distribution.

The root folder's name may contain spaces; the npm package and GitHub repo use `jester-quotes`.
