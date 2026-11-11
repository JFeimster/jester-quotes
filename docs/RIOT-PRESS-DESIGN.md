# The Riot Press — Production Candidate

## Status

**Implemented and usable at `/riot-press/`.** The public Midnight Carnival homepage remains canonical while the final brand direction is chosen. The Riot Press candidate is intentionally `noindex, follow` to avoid competing with the existing canonical quote archive.

## Creative foundation: 60% Neo-Brutalist + 40% Dada Riot

- **Brutalist framework:** strong geometric layout, industrial black borders, acid-lime structural accents, robust typography and usable controls.
- **Dada personality:** slanted paper strips, protest stamps, handbill-style panels, collage-inspired hero and red editorial punctuation.
- **Shared engine:** the same 100 canonical quotations, six curated collections, search/filter, favorites, copy and working Quote Studio exports.

### What ships now

| Feature | Location | Status |
|---|---|---|
| Usable 100-quote alternative experience | `/riot-press/` | Public route, noindex candidate |
| Discoverable entry point | Homepage promo + footer | Live |
| Third hybrid theme | `/lab/` | Added to existing 7 experimental themes |
| Riot Press artwork output | `/studio/?theme=riot` | Working canvas PNG / ZIP export |
| Dada poster export | `/studio/?theme=dada` | Working canvas PNG / ZIP export |
| Neo-Brutalist poster export | `/studio/?theme=brutalist` | Working canvas PNG / ZIP export |

The original four Studio palettes remain; all four canvas formats and long-quote pagination are unchanged. The new treatments draw original poster shapes in Canvas without overwriting text regions.

### Design decision (after reviewing the real pages)

Compare **Neo-Brutalist Jester**, **Dada Riot**, and **The Riot Press** inside `/lab/`, then test the fully usable Riot Press archive and three Studio exports. Select one flagship; do not deploy three competing homepage designs or duplicate quote databases. The existing Midnight Carnival homepage remains unchanged until the decision.

Review at 1440, 768 and 390px. Check keyboard tab switching, page overflow, quote filters, save/copy, canvas preview and downloads. Preserve source citations.

## Proposed new image assets — not generated or uploaded

Create these **after selecting the production design**. All paths are planned, not claims that files exist.

| Priority | Asset | Output | Canonical planned directory |
|---|---|---|---|
| P0 | Master hybrid hero collage (no text, free space for real HTML heading) | 16:9, 1920×1080; plus 4:5 crop | `public/assets/images/heroes/` |
| P0 | The Riot Press logo/wordmark, printmaker's seal | Transparent SVG/PNG, horizontal + square | `public/assets/branding/logos/` |
| P0 | Riot avatar and favicon source | 1:1, 1024×1024 source | `public/assets/branding/avatars/`, `favicons/` |
| P1 | Six collection cover pairs, clean + editorial | 4:3, 1600×1200 | `public/assets/collections/01-.../` through `06-.../` |
| P1 | Quote Studio promo poster mockup | 16:9, 1920×1080 | `public/assets/studio/promotional/` |
| P1 | Social quote backgrounds, text-safe | 1.91:1 and 4:5 | `public/assets/social/templates/` |
| P2 | Punk zine carousel slide templates | 4:5 / 1:1 | `public/assets/social/carousels/` |
| P2 | Video-thumbnail style templates | 16:9 | `public/assets/videos/thumbnails/` |

**Naming:** `riot-press-[asset]-[variant]-[ratio].png` (e.g. `riot-press-hero-clean-16x9.png`). Favor a consistent **clean** version without embedded titles so Astro can render accessible, responsive headings. Add editorial versions only for social/download use.

### Image prompts for the three contenders

- **The Riot Press:** Cinematic high-impact Dada-meets-neo-brutalist editorial collage. Black ink, acid-lime, tomato-red, distressed ivory paper. Mysterious intelligent jester symbolism, ripped-sheet layering, angular cutout paper, extreme print textures, sharp geometric negative space for HTML headings. Original artwork, no legible words or watermarks. Premium art direction, not childish clown.
- **Dada Riot:** Avant-garde art-paper collage, cutouts, cut-and-paste graphics, redactions, unbalanced composition and surreal found-paper imagery. Ink black, warm paper, cobalt and vermilion. Original symbolic jester mark. No embedded words; text-safe.
- **Neo-Brutalist Jester:** Oversized graphic shapes, hard black rules, acid-lime, vermilion, editorial stencils and stamped symbols. A clear geometric frame with bold asymmetry and room for actual text. No embedded words; not clipart.

### Deployment boundaries

Don't modify the production homepage treatment globally until one contender is approved. Do not migrate or replace the existing 15 asset registry entries for aesthetic reasons. No new visual files are needed for the working CSS hero or Canvas treatment.
