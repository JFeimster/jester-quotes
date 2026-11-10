# Jester Quotes — Release and Browser QA Checklist

The repository uses a **production-only** Vercel Git connection and the existing trusted same-repo CI → auto-squash release workflow.

## Per-PR release checks

- [ ] Compare the branch with current `main`; avoid duplicate or conflicting branches and existing PRs.
- [ ] Preserve `src/data/jester-quotes.json`, all 100 `/social/quotes/` URLs, the `public/assets/` taxonomy and existing browser favorite storage key.
- [ ] Run `npm ci`, `npm run check`, `npm run build`, `npm test`, `npm audit --audit-level=high`. **The test suite now runs actual Chrome browser QA in GitHub Actions** when Chrome is available.
- [ ] Capture browser screenshots at desktop (1440px), tablet (768px) and mobile (390px) with `tests/browser-e2e.test.mjs`; use geometry/DOM assertions instead of brittle pixel-diff blocking tests. Screenshot output is local in `.qa-screenshots/`, not a Vercel Preview URL.
- [ ] Validate quote #016 full PNG download, quote #069 multi-slide ZIP export and a two-quote complete Saved pack ZIP. Ensure no clipping, missing author text or nonexistent file.
- [ ] Check functional search/filter links, Studio palette/format changes, Daily UTC selection, Saved localStorage persistence, import rejection and keyboard focus.
- [ ] Check responsive overflow, meaningful alt, reduced-motion behavior, canonical/sitemap/noindex, internal links and source provenance.
- [ ] When changing visual design, review actual browser screenshots before marking a draft PR ready.

## Browser test prerequisites

- Node.js 22 (global `WebSocket`), current `npm ci`, and a locally installed Google Chrome/Chromium in headless mode.
- On Windows, set `CHROME_BIN` to the Chrome executable if it is not at a standard Program Files location. On Linux, the test autodetects `google-chrome`, `google-chrome-stable`, `chromium` or `chromium-browser`.
- Run `npm run build` before `npm test`; browser tests serve the generated `dist/` locally without external calls.
- If Chrome is absent on an ordinary developer machine, the browser test reports a **skip**. **In GitHub Actions, missing Chrome fails the build**—it must never silently pretend the browser QA passed.
- Screenshot output is written to the local `.qa-screenshots/` directory, which is gitignored.

## Protected changes and deployment

- Do not alter `.github/workflows/**` or `vercel.json` in an ordinary auto-merging feature PR.
- If workflow wiring or deployment policy truly needs changing, use a **separate draft protected-config PR** and seek explicit manual merge approval.
- Eligible non-draft PRs merge only after successful same-head CI; Vercel deploys merged `main` to Production.
- Verify the exact merged SHA in Vercel target=Production, state=READY, then smoke-check live routes.
- Close the batch issue and update [Roadmap #7](https://github.com/JFeimster/jester-quotes/issues/7) **only after release verification**.

## Rights reminder

Technical functionality is not rights clearance. Quoted text and linked media may be third-party copyrighted work. Attribution alone is not permission.
