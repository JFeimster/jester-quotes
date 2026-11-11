import type {ThemeSpec,ThemeId} from './theme-types';
import {midnightCarnival} from './themes/midnight-carnival';
import {neoBrutalist} from './themes/neo-brutalist';
import {velvetGallery} from './themes/velvet-gallery';
import {dadaRiot} from './themes/dada-riot';
import {neonTrickster} from './themes/neon-trickster';
import {impossibleCourt} from './themes/impossible-court';
import {forbiddenLibrary} from './themes/forbidden-library';
import {riotPress} from './themes/riot-press';

export const themeCatalog:readonly ThemeSpec[]=[
  midnightCarnival,neoBrutalist,velvetGallery,
  dadaRiot,neonTrickster,impossibleCourt,forbiddenLibrary,riotPress
];
export const defaultThemeId:ThemeId='midnight-carnival';
if(new Set(themeCatalog.map(theme=>theme.id)).size!==themeCatalog.length)
  throw new Error('Duplicate design Lab theme id');
export function labThemeStyle(theme:ThemeSpec):string {
  const t=theme.tokens;
  return [
    `--lab-ink:${t.ink}`,`--lab-paper:${t.paper}`,`--lab-accent:${t.accent}`,
    `--lab-contrast:${t.contrast}`,`--lab-surface:${t.surface}`,`--lab-border:${t.border}`,
    `--lab-shadow:${t.shadow}`,`--lab-radius:${t.radius}`,`--lab-font:${t.displayFont}`
  ].join(';');
}
export function getTheme(id:ThemeId):ThemeSpec {
  const item=themeCatalog.find(theme=>theme.id===id);
  if(!item) throw new Error(`Unknown Lab theme: ${id}`);
  return item;
}
