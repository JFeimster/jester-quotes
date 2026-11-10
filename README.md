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

Add a real website origin to `.env` as `PUBLIC_SITE_URL=https://your-domain.example` before production deployment.
Replace the placeholder hero artwork and review quotation rights before making the website publicly accessible.

The root folder's name may contain spaces; the npm package and GitHub repo use `jester-quotes`.
