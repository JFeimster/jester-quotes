import { quotes } from './quote-data';
import { collections } from './collections';
import { tricksters } from './tricksters';
import { videos, resources } from './resource-catalog';

export type SiteSearchKind = 'quotes' | 'collections' | 'tricksters' | 'videos' | 'resources';
export interface SiteSearchItem {
  id: string;
  kind: SiteSearchKind;
  title: string;
  summary: string;
  source: string;
  href: string;
  tags: string[];
  searchText: string;
}
const excerpt = (text: string, max: number): string =>
  text.length > max ? text.slice(0,max).trimEnd()+'…' : text;
export const siteSearchIndex: SiteSearchItem[] = [
  ...quotes.map(quote=>({
    id:quote.id,kind:'quotes' as const,
    title:excerpt(quote.quote,100),
    summary:excerpt(quote.quote,240),
    source:quote.person,
    href:'/quotes/'+encodeURIComponent(quote.id)+'/',
    tags:['quotation'],
    searchText:[quote.quote,quote.person,quote.name,quote.reference??''].join(' ')
  })),
  ...collections.map(collection=>({
    id:'collection-'+collection.slug,kind:'collections' as const,
    title:collection.title,summary:collection.description,
    source:'Curated quotation collection',
    href:'/collections/'+encodeURIComponent(collection.slug)+'/',
    tags:['curated','quotes',collection.tone],
    searchText:[collection.title,collection.description,collection.eyebrow].join(' ')
  })),
  ...tricksters.map(trickster=>({
    id:trickster.id,kind:'tricksters' as const,
    title:trickster.name,summary:excerpt(trickster.description,230),
    source:trickster.culture_or_origin,
    href:'/tricksters/'+encodeURIComponent(trickster.slug)+'/',
    tags:trickster.tags,
    searchText:[trickster.name,trickster.culture_or_origin,trickster.description,...trickster.tags].join(' ')
  })),
  ...videos.map(video=>({
    id:video.id,kind:'videos' as const,
    title:video.title,summary:excerpt(video.summary,230),
    source:video.channel_title,
    href:'/videos/#'+video.id,
    tags:video.tags,
    searchText:[video.title,video.channel_title,video.summary,...video.tags].join(' ')
  })),
  ...resources.map(resource=>({
    id:resource.id,kind:'resources' as const,
    title:resource.title,summary:excerpt(resource.summary,230),
    source:resource.source_name,
    href:'/resources/#'+resource.id,
    tags:resource.tags,
    searchText:[resource.title,resource.source_name,resource.summary,...resource.tags].join(' ')
  }))
];
if(new Set(siteSearchIndex.map(item=>item.id)).size!==siteSearchIndex.length)
  throw new Error('Duplicate records in global search index');
