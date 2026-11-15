import type { SiteSearchItem, SiteSearchKind } from './site-search';

export type SearchFilter = SiteSearchKind | 'all';
export const SEARCH_PAGE_SIZE = 30;
export const SEARCH_KINDS: readonly SiteSearchKind[] = ['quotes','collections','tricksters','videos','resources','archetypes','media','brands'];

export function normalizeSearch(value: string): string {
  return value.toLocaleLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2019']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

function contains(text: string, phrase: string): boolean {
  return (` ${text} `).includes(` ${phrase} `);
}

export function searchScore(item: SiteSearchItem, query: string): number {
  const phrase = normalizeSearch(query);
  if (!phrase) return 0;
  const terms = phrase.split(' ');
  const title = normalizeSearch(item.title);
  const metadata = normalizeSearch([item.metadata, item.source].filter(Boolean).join(' '));
  const tags = normalizeSearch(item.tags.join(' '));
  const relationships = normalizeSearch(item.relationshipTerms ?? '');
  const description = normalizeSearch(item.summary);
  const corpus = normalizeSearch([item.searchText, title, metadata, tags, relationships, description].join(' '));
  // Keep partial-word matches from the previous search, including title
  // prefixes. The compact fallback also bridges punctuation like hyphens.
  if (!terms.every(term => corpus.includes(term)) && !corpus.replaceAll(' ', '').includes(phrase.replaceAll(' ', ''))) return 0;

  // The strongest matching field wins; term bonuses break ties without
  // overwhelming an exact name or title. All weights are deterministic.
  let score = title === phrase ? 1000 : contains(title, phrase) && !title.startsWith(phrase) ? 850
    : title.startsWith(phrase) ? 750 : contains(metadata, phrase) ? 600
    : contains(tags, phrase) ? 500 : contains(relationships, phrase) ? 350
    : contains(description, phrase) ? 250 : 100;
  for (const term of terms) {
    score += contains(title, term) ? 20 : contains(metadata, term) ? 14
      : contains(tags, term) ? 10 : contains(relationships, term) ? 6
      : contains(description, term) ? 3 : 1;
  }
  return score;
}

export function searchResults(items: readonly SiteSearchItem[], query: string): SiteSearchItem[] {
  if (!normalizeSearch(query)) return [...items];
  return items.map(item => ({ item, score: searchScore(item, query) }))
    .filter(hit => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'en')
      || a.item.kind.localeCompare(b.item.kind, 'en') || a.item.id.localeCompare(b.item.id, 'en'))
    .map(hit => hit.item);
}

export function categoryCounts(results: readonly SiteSearchItem[]): Record<SearchFilter, number> {
  const counts = Object.fromEntries(['all', ...SEARCH_KINDS].map(kind => [kind, 0])) as Record<SearchFilter, number>;
  for (const item of results) {
    counts.all++;
    counts[item.kind]++;
  }
  return counts;
}

export function searchPage(results: readonly SiteSearchItem[], shown: number): SiteSearchItem[] {
  return results.slice(0, Math.max(0, shown));
}

export function readSearchState(url: URL): { query: string; filter: SearchFilter } {
  const category = url.searchParams.get('category');
  return {
    query: (url.searchParams.get('q') ?? '').slice(0, 180),
    filter: SEARCH_KINDS.includes(category as SiteSearchKind) ? category as SiteSearchKind : 'all'
  };
}
