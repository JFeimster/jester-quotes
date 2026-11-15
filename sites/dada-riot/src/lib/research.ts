import archetypeData from '../data/archetypes.json';
import mediaData from '../data/jesters-in-media.json';
import brandData from '../data/jester-brands.json';
import { quotes } from './quote-data';
import { collections } from './collections';
import { tricksters } from './tricksters';

export interface ResearchRecord {
  id: string; slug: string; name: string; summary: string; description: string;
  tags: string[]; source_document: string; sources: string[];
  verification_status: 'source_interpretation' | 'needs_enrichment';
  publication_status: 'published' | 'draft';
  related_quote_ids: string[]; related_trickster_ids: string[];
  related_collection_slugs: string[];
}
export interface Archetype extends ResearchRecord { characteristics: string[]; adjacent_archetype: string; context: string; }
export interface MediaExample extends ResearchRecord { character: string; originating_work: string; medium: string; character_type: string; }
export interface JesterBrand extends ResearchRecord { jester_characteristics: string[]; historical_examples: string[]; attribution: string; }
export const archetypes = archetypeData as Archetype[];
export const mediaExamples = mediaData as MediaExample[];
export const jesterBrands = brandData as JesterBrand[];

const quoteIds = new Set(quotes.map(item => item.id));
const tricksterIds = new Set(tricksters.map(item => item.id));
const collectionSlugs = new Set(collections.map(item => item.slug));
for (const [group, records] of Object.entries({archetypes,mediaExamples,jesterBrands})) {
  if (new Set(records.map(item => item.slug)).size !== records.length) throw new Error(`Duplicate slug in ${group}`);
  for (const item of records) {
    if (!item.id || !item.slug || !item.name || !item.summary || !item.source_document || !item.sources.length) throw new Error(`Incomplete ${group} record: ${item.slug}`);
    if (item.sources.some(url => { try { return new URL(url).protocol !== 'https:'; } catch { return true; } })) throw new Error(`Invalid source URL on ${item.slug}`);
    if (item.related_quote_ids.some(id => !quoteIds.has(id)) || item.related_trickster_ids.some(id => !tricksterIds.has(id)) || item.related_collection_slugs.some(slug => !collectionSlugs.has(slug))) throw new Error(`Invalid content relationship on ${item.slug}`);
  }
}
