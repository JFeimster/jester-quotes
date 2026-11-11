import { resources, videos } from './resource-catalog';
import type { ResourceEntry, VideoEntry } from '../types/resource';
import type { Trickster } from '../types/trickster';

// Editorial discovery only: shared tags are not source citations or creator endorsements.
function tagKey(value: string): string {
  const tag = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (tag === 'jungian-psychology' || tag === 'jung') return 'jung';
  if (tag === 'archetypes' || tag === 'archetype') return 'archetype';
  if (tag === 'fools') return 'fool';
  return tag;
}
const distinctive = new Set(['joker','trickster','jester','fool','alan-watts','anansi','loki','jung','shadow','mythology','folklore','norse','tarot','branding']);
function tagScore(a: string[], b: string[]): number {
  const source = new Set(a.map(tagKey));
  const common = [...new Set(b.map(tagKey))].filter(tag => source.has(tag));
  if (!common.length || (common.length < 2 && !common.some(tag => distinctive.has(tag)))) return 0;
  return common.length * 4 + common.filter(tag => distinctive.has(tag)).length * 3;
}
export function relatedReadingForVideo(video: VideoEntry, count = 2): ResourceEntry[] {
  return resources.map(resource => { const match=tagScore(video.tags,resource.tags); return {resource,score:match>0?match+(resource.featured?1:0):0}; })
    .filter(item => item.score>0)
    .sort((a,b)=>b.score-a.score || a.resource.id.localeCompare(b.resource.id))
    .slice(0,count).map(item=>item.resource);
}
export function relatedVideosForResource(resource: ResourceEntry, count = 2): VideoEntry[] {
  return videos.map(video => { const match=tagScore(resource.tags,video.tags); return {video,score:match>0?match+(video.featured?1:0):0}; })
    .filter(item => item.score>0)
    .sort((a,b)=>b.score-a.score || a.video.id.localeCompare(b.video.id))
    .slice(0,count).map(item=>item.video);
}
export function relatedMediaForTrickster(trickster: Trickster) {
  const matchingResources = resources.filter(resource => resource.related_trickster_ids.includes(trickster.id)).slice(0,3);
  const matchingVideos = videos.filter(video => video.related_trickster_ids.includes(trickster.id)).slice(0,3);
  return {resources:matchingResources,videos:matchingVideos};
}
