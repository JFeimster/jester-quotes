# Design Lab Expansion — Four Original Visual Worlds

**Scope:** Four new Lab themes, extending the existing three to seven. The public site stays Midnight Carnival.

## Seven distinct page compositions

The original three are Midnight Carnival (art-deco editorial), Neo-Brutalist Jester (radical printshop), and Velvet Gallery (luxury bento). The four additional worlds are:

| Theme ID | Layout file | Visual identity and layout |
|---|---|---|
| `dada-riot` | `DadaRiotLayout.astro` | Punk zine collage, ripped-paper headlines, printshop tickets, redaction motifs and protest posters |
| `neon-trickster` | `NeonTricksterLayout.astro` | Cyberpunk signal console, glowing cyan/magenta orbital HUD, synthwave grid and data readouts |
| `impossible-court` | `ImpossibleCourtLayout.astro` | Surreal archway, moonlit impossible court, floating chess pieces and paradoxical checkerboard floor |
| `forbidden-library` | `ForbiddenLibraryLayout.astro` | Antique shelves, illuminated manuscripts, candlelight, archival labels and dark-academia color system |

These are four separate Astro hero/visual compositions, not four additional CSS color palettes. All decorative artwork is original CSS and semantic markup; no binary images or third-party assets were added.

## System architecture

- Theme definitions: `src/design/themes/{dada-riot,neon-trickster,impossible-court,forbidden-library}.ts`
- Four components: `src/design/layouts/{DadaRiotLayout,NeonTricksterLayout,ImpossibleCourtLayout,ForbiddenLibraryLayout}.astro`
- Shared catalog: `src/design/theme-registry.ts` and `src/design/theme-types.ts`, now containing seven entries.
- Shared accessible tab UI: `src/components/ThemeSwitcher.astro` and `src/scripts/theme-lab.ts`.
- New theme-only styles: `src/styles/lab-new-themes.css`, imported only by `src/pages/lab/index.astro`.
- Shared canonical quotations: `src/data/jester-quotes.json` and the existing `QuoteCard.astro` with Save/Copy/Studio actions.

## Review / readiness contract

Use `/lab/` to compare all seven on desktop and mobile. The Lab remains `noindex, nofollow`, excluded from the sitemap and public navigation. Theme selection remains ephemeral and keyboard accessible (left/right/Home/End); no extra storage, network calls, or quote data.

Run `npm run check`, `npm run build`, `npm test`, and `npm audit --audit-level=high` before merging. Browser QA checks the seven tabs, panel visibility, interactive cards and mobile horizontal overflow. New layouts honor reduced-motion preferences.

**Out of scope:** Converting the main homepage, public collection pages, or Quote Studio palettes into selectable themes; changing any of the 100 quotations; generating or uploading branded images. These would be separate authorized tasks.
