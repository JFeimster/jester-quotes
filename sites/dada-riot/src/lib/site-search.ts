import { quotes } from './quote-data';
import { collections } from './collections';
import { tricksters } from './tricksters';
import { videos, resources } from './resource-catalog';
import { archetypes, mediaExamples, jesterBrands } from './research';
import { relatedLinks, type ContentKind } from './related-content';

export type SiteSearchKind = 'quotes' | 'collections' | 'tricksters' | 'videos' | 'resources' | 'archetypes' | 'media' | 'brands';
export interface SiteSearchItem {
  id: string;
  kind: SiteSearchKind;
  title: string;
  summary: string;
  source: string;
  href: string;
  tags: string[];
  searchText: string;
  metadata?: string;
  relationshipTerms?: string;
}
const excerpt = (text: string, max: number): string =>
  text.length > max ? text.slice(0,max).trimEnd()+'…' : text;
// Only direct, validated editorial links contribute terms. Quote text on a linked
// record is deliberately excluded: a connection must not suggest authorship.
const connectionTerms = (kind: ContentKind, id: string) =>
  relatedLinks(kind, id).filter(link => link.ref.kind !== 'quote').map(link => link.title).join(' ');
export const siteSearchIndex: SiteSearchItem[] = [
  ...archetypes.filter(item=>item.publication_status==='published').map(item=>({id:'archetype-'+item.id,kind:'archetypes' as const,title:item.name,summary:item.summary,source:'Attributed archetype framework',href:'/archetypes/'+item.slug+'/',tags:item.tags,metadata:item.context,relationshipTerms:connectionTerms('archetype',item.id),searchText:[item.name,item.summary,item.context,...item.tags,connectionTerms('archetype',item.id)].join(' ')})),
  ...mediaExamples.filter(item=>item.publication_status==='published').map(item=>({id:'media-'+item.id,kind:'media' as const,title:item.name,summary:item.summary,source:item.originating_work,href:'/jesters-in-media/#'+item.slug,tags:item.tags,metadata:[item.originating_work,item.medium,item.character_type].join(' '),relationshipTerms:connectionTerms('media',item.id),searchText:[item.name,item.originating_work,item.medium,item.character_type,item.summary,...item.tags,connectionTerms('media',item.id)].join(' ')})),
  ...jesterBrands.filter(item=>item.publication_status==='published').map(item=>({id:'brand-'+item.id,kind:'brands' as const,title:item.name,summary:item.summary,source:'Attributed brand example',href:'/jester-brands/#'+item.slug,tags:item.tags,relationshipTerms:connectionTerms('brand',item.id),searchText:[item.name,item.summary,...item.tags,connectionTerms('brand',item.id)].join(' ')})),
  ...quotes.map(quote=>({
    id:quote.id,kind:'quotes' as const,
    title:excerpt(quote.quote,100),
    summary:excerpt(quote.quote,240),
    source:quote.person,
    href:'/quotes/'+encodeURIComponent(quote.id)+'/',
    tags:['quotation'],
    metadata:[quote.person,quote.name,quote.reference??''].join(' '),
    relationshipTerms:connectionTerms('quote',quote.id),
    searchText:[quote.id,quote.quote,quote.person,quote.name,quote.reference??'',connectionTerms('quote',quote.id)].join(' ')
  })),
  ...collections.map(collection=>({
    id:'collection-'+collection.slug,kind:'collections' as const,
    title:collection.title,summary:collection.description,
    source:'Curated quotation collection',
    href:'/collections/'+encodeURIComponent(collection.slug)+'/',
    tags:['curated','quotes',collection.tone],
    metadata:collection.eyebrow,
    relationshipTerms:connectionTerms('collection',collection.slug),
    searchText:[collection.title,collection.description,collection.eyebrow,connectionTerms('collection',collection.slug)].join(' ')
  })),
  ...tricksters.map(trickster=>({
    id:trickster.id,kind:'tricksters' as const,
    title:trickster.name,summary:excerpt(trickster.description,230),
    source:trickster.culture_or_origin,
    href:'/tricksters/'+encodeURIComponent(trickster.slug)+'/',
    tags:trickster.tags,
    metadata:trickster.culture_or_origin,
    relationshipTerms:connectionTerms('trickster',trickster.id),
    searchText:[trickster.name,trickster.culture_or_origin,trickster.description,...trickster.tags,connectionTerms('trickster',trickster.id)].join(' ')
  })),
  ...videos.map(video=>({
    id:video.id,kind:'videos' as const,
    title:video.title,summary:excerpt(video.summary,230),
    source:video.channel_title,
    href:'/videos/#'+video.id,
    tags:video.tags,
    metadata:video.channel_title,
    relationshipTerms:connectionTerms('video',video.id),
    searchText:[video.title,video.channel_title,video.summary,...video.tags,connectionTerms('video',video.id)].join(' ')
  })),
  ...resources.map(resource=>({
    id:resource.id,kind:'resources' as const,
    title:resource.title,summary:excerpt(resource.summary,230),
    source:resource.source_name,
    href:'/resources/#'+resource.id,
    tags:resource.tags,
    metadata:resource.source_name,
    relationshipTerms:connectionTerms('resource',resource.id),
    searchText:[resource.title,resource.source_name,resource.summary,...resource.tags,connectionTerms('resource',resource.id)].join(' ')
  }))
];
if(new Set(siteSearchIndex.map(item=>item.id)).size!==siteSearchIndex.length)
  throw new Error('Duplicate records in global search index');
