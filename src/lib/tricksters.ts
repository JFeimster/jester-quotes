import data from '../data/tricksters.json';
import type { Trickster, TricksterKind, TricksterMedium } from '../types/trickster';
import { collections } from './collections';
export const tricksters: Trickster[] = data as Trickster[];
export const tricksterKinds: Record<TricksterKind, string> = {
  'folklore':'Folklore & oral storytelling', 'deity':'Divine figures',
  'culture-hero':'Culture heroes','literary':'Literature'
};
export const tricksterMedia: Record<TricksterMedium,string> = {
  'oral-tradition':'Oral traditions','mythology':'Mythology','literature':'Literature'
};
const validCollections = new Set(collections.map(c=>c.slug));
const slugs = new Set<string>();
for(const record of tricksters) {
  if(record.verification_status !== 'verified' || !record.sources.length) {
    throw new Error(`Unverified profile must not be published: ${record.slug}`);
  }
  if(slugs.has(record.slug)) throw new Error(`Duplicate Trickster slug: ${record.slug}`);
  slugs.add(record.slug);
  if(record.related_collection_slugs.some(slug=>!validCollections.has(slug))) {
    throw new Error(`Invalid editorial collection link on ${record.slug}`);
  }
}
export function getTrickster(slug: string): Trickster | undefined {
  return tricksters.find(item=>item.slug===slug);
}
export function tricksterUrl(record: Trickster): string {
  return `/tricksters/${encodeURIComponent(record.slug)}/`;
}
