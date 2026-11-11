import resourcesJson from '../data/resources.json';
import videosJson from '../data/videos.json';
import { tricksters } from './tricksters';
import { quotes } from './quote-data';
import type { ResourceEntry, VideoEntry } from '../types/resource';

export const resources: ResourceEntry[] = resourcesJson as ResourceEntry[];
export const videos: VideoEntry[] = videosJson as VideoEntry[];
export const resourceTypes: Record<string, string> = {
  reference: 'Research & reference',
  article: 'Articles & lessons',
  book: 'Books',
  essay: 'Essays',
  podcast: 'Podcasts',
  organization: 'Organizations',
  other: 'Other'
};
const verifiedTricksters = new Set(tricksters.map(x => x.id));
const verifiedQuotes = new Set(quotes.map(x => x.id));

function checkHttps(value: string, label: string) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(`Invalid ${label} URL: ${value}`); }
  if (url.protocol !== 'https:' || !url.hostname || url.hostname.endsWith('.example'))
    throw new Error(`Not a verified HTTPS ${label} URL: ${value}`);
}
function unique(records: Array<{ id: string; slug: string }>, type: string) {
  if (new Set(records.map(x=>x.id)).size !== records.length ||
      new Set(records.map(x=>x.slug)).size !== records.length) {
    throw new Error(`Duplicate ${type} id or slug`);
  }
}
unique(resources, 'resource');
unique(videos, 'video');
for (const entry of resources) {
  checkHttps(entry.url, 'resource');
  if (!entry.id.startsWith('resource-') || entry.slug !== entry.id.slice(9) ||
      !resourceTypes[entry.type] || !entry.title.trim() || !entry.summary.trim() ||
      !entry.source_name.trim() || !entry.verified_at || !entry.tags.length)
    throw new Error(`Invalid resource record: ${entry.id}`);
  if (entry.related_trickster_ids.some(id=>!verifiedTricksters.has(id)) ||
      entry.related_quote_ids.some(id=>!verifiedQuotes.has(id)))
    throw new Error(`Unknown related record for ${entry.id}`);
}
for (const entry of videos) {
  checkHttps(entry.youtube_url, 'video');
  if (!/^[A-Za-z0-9_-]{11}$/.test(entry.video_id) ||
      entry.youtube_url !== `https://www.youtube.com/watch?v=${entry.video_id}` ||
      !entry.id.startsWith('video-') || entry.slug !== entry.id.slice(6) ||
      !entry.channel_title.trim() || !entry.summary.trim() || !entry.verified_at ||
      !entry.tags.length || entry.related_trickster_ids.some(id=>!verifiedTricksters.has(id)))
    throw new Error(`Invalid video record: ${entry.id}`);
}
export const resourceTags = [...new Set(resources.flatMap(entry=>entry.tags))].sort();
export const videoTags = [...new Set(videos.flatMap(entry=>entry.tags))].sort();
export const resourceById = new Map(resources.map(entry=>[entry.id,entry]));
export const videoById = new Map(videos.map(entry=>[entry.id,entry]));
