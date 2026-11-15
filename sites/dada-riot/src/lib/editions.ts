import raw from '../data/editions.json';
import { themeCatalog } from '../design/theme-registry';
import type { ThemeId } from '../design/theme-types';

export type EditionStatus = 'full' | 'preview' | 'unavailable';
export interface Edition {
  id: ThemeId;
  slug: string;
  name: string;
  description: string;
  category: string;
  default: boolean;
  status: EditionStatus;
  destination: string | null;
  previewAsset: string | null;
  layout: string;
  sharedContent: boolean;
  indexing: 'index' | 'noindex';
  revision: string;
}

const validStatus = new Set<EditionStatus>(['full', 'preview', 'unavailable']);
const themeIds = new Set(themeCatalog.map(theme => theme.id));
export const editions: Edition[] = raw.map((item) => {
  if (!themeIds.has(item.id as ThemeId) || !validStatus.has(item.status as EditionStatus)) throw new Error(`Invalid edition: ${item.id}`);
  if (item.status !== 'unavailable' && !item.destination?.startsWith('/')) throw new Error(`Missing local edition route: ${item.id}`);
  if (item.status === 'preview' && item.indexing !== 'noindex') throw new Error(`Preview must be noindex: ${item.id}`);
  return item as Edition;
});
if (editions.length !== themeIds.size || new Set(editions.map(item => item.id)).size !== editions.length || new Set(editions.map(item => item.slug)).size !== editions.length || editions.filter(item => item.default).length !== 1 || editions.find(item => item.default)?.id !== 'dada-riot') throw new Error('Edition registry does not match the design catalog or Dada Riot default');
export const previewEditions = editions.filter(item => item.status === 'preview');
