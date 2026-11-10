# Midnight Carnival 2.0 — Review notes

This is the **RUN 01/06 / Issue #9 draft**. The visual work is not approved and must not be merged until the design gate is cleared.

## Art direction

- **Flagship:** near-black editorial background, velvet accents, gold typography, warm ivory featured quote, coral action accents.
- **Homepage:** asymmetric jester portrait from the existing `/images/midnight-carnival-hero-4x5.png`; utility links to Collections and Studio; warm-paper feature spread.
- **Card system:** `compact` (charcoal), `editorial` (ivory full-text feature; also for long quotations), `poster` (social-image artwork preview + complete quotation as text). All cards retain Save, Copy, detail, Create Art actions.
- **Collections:** symbolic illustrated type treatments, varied gold/velvet/ivory/coral surface systems, 2-level bento teaser.
- **Studio:** tactile buttons for 4 formats and 4 palettes; the original select IDs remain available as keyboard/screen-reader-friendly fallbacks. No artwork renderer, download/ZIP, or quote-data changes.
- **Motion:** restrained entry and hover treatments, disabled for reduced-motion preferences.

## Visual check list

- Desktop homepage: header, hero crop, quick-entry bento, ivory featured quote, 3 quote-card styles.
- Mobile homepage: 320–420px header/nav, no horizontal overflow; full quote text and action buttons.
- Collections: `/collections/` and `/collections/wise-fools/` original quote links and filter hooks.
- Studio: `/studio/` format/palette button selection should update preview and export dimensions.
- Check quote #016 and #069 preserved with original full text and complete downloads.

**Preview constraint:** Vercel Preview builds are disabled by `vercel.json`. No Vercel Preview has been created or requested for this draft. Design review should use locally built screenshots or the source/asset references linked from the PR; this branch is not Production.
