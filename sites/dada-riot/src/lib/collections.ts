import definitions from '../data/collections.json';
import { quotes } from './quote-data';
import type { Quote } from '../types/quote';

export interface CuratedCollection {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  tone: 'gold' | 'coral' | 'ivory' | 'velvet';
  quoteIds: string[];
  quotes: Quote[];
}

const byId = new Map(quotes.map((quote) => [quote.id, quote]));

export const collections: CuratedCollection[] = definitions.map((definition) => {
  const selected = definition.quoteIds.map((id) => {
    const quote = byId.get(id);
    if (!quote) throw new Error(`Collection "${definition.slug}" references missing quote "${id}"`);
    return quote;
  });
  return { ...definition, tone: definition.tone as CuratedCollection['tone'], quotes: selected };
});

export function getCollection(slug: string): CuratedCollection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

const dadaArtworkBySlug: Record<string, string> = {
  'wise-fools': 'cover-wise-fools.webp',
  'truth-to-power': 'cover-truth-to-power.webp',
  'laughter-and-life': 'cover-laughter-and-life.webp',
  'masks-and-identity': 'cover-masks-and-identity.webp',
  'carnival-absurdity': 'cover-carnival-absurdity.webp',
  'art-of-the-jester': 'cover-art-of-the-jester.webp'
};

export function collectionArtworkPath(slug: string): string | undefined {
  const filename = dadaArtworkBySlug[slug];
  return filename ? `/assets/dada-riot-v2/${filename}` : undefined;
}
