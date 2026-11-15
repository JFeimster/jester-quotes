import { collections } from './collections';
import { quotes } from './quote-data';
import { tricksters } from './tricksters';
import { resources, videos } from './resource-catalog';
import { archetypes, mediaExamples, jesterBrands } from './research';

export type ContentKind = 'quote' | 'collection' | 'trickster' | 'archetype' | 'media' | 'brand' | 'resource' | 'video';
export type RelationshipType = 'featured-in' | 'related-collection' | 'example-of-archetype' | 'further-reading' | 'thematically-related';
export type ContentRef = { kind: ContentKind; id: string };
export interface Relationship {
  source: ContentRef; target: ContentRef; type: RelationshipType;
  rationale: string; evidence: string; status: 'published';
}
export interface RelatedLink { ref: ContentRef; title: string; href: string; type: RelationshipType; rationale: string; }

const quoteSource = 'https://knowyourarchetypes.com/jester-quotes/';
const byKind: Record<ContentKind, Map<string, { title: string; href: string }>> = {
  quote: new Map(quotes.map(x => [x.id, { title: x.quote, href: `/quotes/${encodeURIComponent(x.id)}/` }])),
  collection: new Map(collections.map(x => [x.slug, { title: x.title, href: `/collections/${x.slug}/` }])),
  trickster: new Map(tricksters.map(x => [x.id, { title: x.name, href: `/tricksters/${x.slug}/` }])),
  archetype: new Map(archetypes.filter(x => x.publication_status === 'published').map(x => [x.id, { title: x.name, href: `/archetypes/${x.slug}/` }])),
  media: new Map(mediaExamples.filter(x => x.publication_status === 'published').map(x => [x.id, { title: x.name, href: `/jesters-in-media/#${x.slug}` }])),
  brand: new Map(jesterBrands.filter(x => x.publication_status === 'published').map(x => [x.id, { title: x.name, href: `/jester-brands/#${x.slug}` }])),
  resource: new Map(resources.map(x => [x.id, { title: x.title, href: `/resources/#${x.id}` }])),
  video: new Map(videos.map(x => [x.id, { title: x.title, href: `/videos/#${x.id}` }]))
};
const kinds = new Set<ContentKind>(Object.keys(byKind) as ContentKind[]);
const types = new Set<RelationshipType>(['featured-in', 'related-collection', 'example-of-archetype', 'further-reading', 'thematically-related']);
const relationships: Relationship[] = [];
const seen = new Set<string>();
function add(source: ContentRef, target: ContentRef, type: RelationshipType, rationale: string, evidence: string) {
  if (!kinds.has(source.kind) || !kinds.has(target.kind) || !types.has(type)) throw new Error('Invalid relationship kind or type');
  const sourceRecord = byKind[source.kind].get(source.id);
  const targetRecord = byKind[target.kind].get(target.id);
  if (!sourceRecord || !targetRecord) throw new Error(`Unpublished or unknown relationship endpoint: ${source.kind}:${source.id} → ${target.kind}:${target.id}`);
  if (!sourceRecord.href.startsWith('/') || !targetRecord.href.startsWith('/')) throw new Error('Invalid relationship route');
  if (!rationale.trim() || !evidence.trim()) throw new Error('Relationship requires rationale and evidence');
  const key = `${source.kind}:${source.id}|${type}|${target.kind}:${target.id}`;
  if (seen.has(key)) throw new Error(`Duplicate relationship: ${key}`);
  seen.add(key);
  relationships.push({ source, target, type, rationale, evidence, status: 'published' });
}
const ref = (kind: ContentKind, id: string): ContentRef => ({ kind, id });

// Existing curated IDs are editorial connections, never claims of quote authorship.
for (const collection of collections) for (const id of collection.quoteIds)
  add(ref('quote', id), ref('collection', collection.slug), 'featured-in', 'This quotation appears in the curated collection.', quoteSource);
for (const item of tricksters) for (const slug of item.related_collection_slugs)
  add(ref('trickster', item.id), ref('collection', slug), 'related-collection', 'An editorial theme connects this profile and collection; quotation authors are not attributed to the figure.', item.sources[0].url);
for (const item of resources) {
  for (const id of item.related_quote_ids) add(ref('resource', item.id), ref('quote', id), 'further-reading', 'A curated reading connection, without a claim about the quotation author.', item.url);
  for (const id of item.related_trickster_ids) add(ref('resource', item.id), ref('trickster', id), 'further-reading', 'This source provides further reading for the profile.', item.url);
}
for (const item of videos) for (const id of item.related_trickster_ids)
  add(ref('video', item.id), ref('trickster', id), 'thematically-related', 'The video is curated alongside this profile; it does not establish attribution.', item.youtube_url);
for (const item of archetypes) if (item.publication_status === 'published') {
  for (const id of item.related_quote_ids) add(ref('archetype', item.id), ref('quote', id), 'thematically-related', 'An editorial theme, not a claim about the quotation author.', item.sources[0]);
  for (const id of item.related_trickster_ids) add(ref('archetype', item.id), ref('trickster', id), 'thematically-related', 'The cited framework names this figure; the profile retains its own cultural context.', item.sources[0]);
  for (const slug of item.related_collection_slugs) add(ref('archetype', item.id), ref('collection', slug), 'related-collection', 'The collection explores a related editorial theme.', item.sources[0]);
  const source = resources.find(x => x.url === item.sources[0]);
  if (source) add(ref('archetype', item.id), ref('resource', source.id), 'further-reading', 'Read the source of this attributed interpretation.', source.url);
}
for (const item of mediaExamples) if (item.publication_status === 'published') {
  const archetypeId = item.character_type === 'fool' ? 'fool' : item.character_type === 'jester interpretation' ? 'jester' : undefined;
  if (archetypeId) add(ref('media', item.id), ref('archetype', archetypeId), 'example-of-archetype', `The cited essay reads this character as ${item.character_type === 'fool' ? 'closer to a fool' : 'a jester example'}. This is an editorial interpretation.`, item.sources[0]);
  const source = resources.find(x => x.url === item.sources[0]);
  if (source) add(ref('media', item.id), ref('resource', source.id), 'further-reading', 'Read the essay behind this character interpretation.', source.url);
}
for (const item of jesterBrands) if (item.publication_status === 'published') {
  add(ref('brand', item.id), ref('archetype', 'jester'), 'example-of-archetype', 'The cited source uses this historical brand example to discuss the jester archetype; it does not establish current strategy or endorsement.', item.sources[0]);
  const source = resources.find(x => x.url === item.sources[0]);
  if (source) add(ref('brand', item.id), ref('resource', source.id), 'further-reading', 'Read the attributed source for this historical example.', source.url);
}
export const validatedRelationships: readonly Relationship[] = relationships;
export const validatedRelationshipCount = validatedRelationships.length;
export function relatedLinks(kind: ContentKind, id: string): RelatedLink[] {
  if (!kinds.has(kind) || !byKind[kind].has(id)) return [];
  return validatedRelationships.flatMap(edge => {
    const other = edge.source.kind === kind && edge.source.id === id ? edge.target
      : edge.target.kind === kind && edge.target.id === id ? edge.source : null;
    if (!other) return [];
    const record = byKind[other.kind].get(other.id)!;
    return [{ ref: other, title: record.title, href: record.href, type: edge.type, rationale: edge.rationale }];
  });
}
export const relatedToArchetype = (id: string) => relatedLinks('archetype', id);
export const relatedToMedia = (id: string) => relatedLinks('media', id);
export const relatedToBrand = (id: string) => relatedLinks('brand', id);
export const relatedToTrickster = (id: string) => relatedLinks('trickster', id);

// Preserve the quote page and daily quote return contract and limits.
const publishedIds = new Set(quotes.map(q => q.id));
export function relatedToQuote(id: string) {
  if (!publishedIds.has(id)) return { collections: [], tricksters: [], resources: [], videos: [] };
  const matchingCollections = collections.filter(c => c.quoteIds.includes(id)).slice(0, 3);
  const matchingSlugs = new Set(matchingCollections.map(c => c.slug));
  const relatedTricksters = tricksters.filter(t => t.verification_status === 'verified' &&
    t.related_collection_slugs.some(slug => matchingSlugs.has(slug))).slice(0, 3);
  const relatedResources = resources.filter(r => r.related_quote_ids.includes(id)).slice(0, 3);
  const themeIds = new Set(relatedTricksters.map(item => item.id));
  const relatedVideos = videos.filter(video => video.related_trickster_ids.some(id => themeIds.has(id))).slice(0, 2);
  return { collections: matchingCollections, tricksters: relatedTricksters, resources: relatedResources, videos: relatedVideos };
}
