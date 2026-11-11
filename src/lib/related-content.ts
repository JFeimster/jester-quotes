import { collections } from './collections';
import { quotes } from './quote-data';
import { tricksters } from './tricksters';
import { resources, videos } from './resource-catalog';
const publishedIds = new Set(quotes.map(q=>q.id));
export function relatedToQuote(id: string) {
  if (!publishedIds.has(id)) return { collections: [], tricksters: [], resources: [], videos: [] };
  const matchingCollections = collections.filter(c=>c.quoteIds.includes(id)).slice(0,3);
  const matchingSlugs = new Set(matchingCollections.map(c=>c.slug));
  const relatedTricksters = tricksters.filter(t=>t.verification_status === 'verified' &&
    t.related_collection_slugs.some(slug=>matchingSlugs.has(slug))).slice(0,3);
  const relatedResources = resources.filter(r=>r.related_quote_ids.includes(id)).slice(0,3);
  const themeIds = new Set(relatedTricksters.map(item=>item.id));
  const relatedVideos = videos.filter(video=>video.related_trickster_ids.some(id=>themeIds.has(id))).slice(0,2);
  // Profiles and videos are editorial theme connections, NEVER author associations.
  return { collections: matchingCollections, tricksters: relatedTricksters, resources: relatedResources, videos: relatedVideos };
}
