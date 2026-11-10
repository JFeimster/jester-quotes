export interface QuoteFilterOptions {
  query: string;
  reference: 'all' | 'yes' | 'no';
  favoritesOnly: boolean;
}

export interface SearchableQuote {
  id: string;
  searchText: string;
  hasReference: boolean;
}

export function matchesQuoteFilters(
  quote: SearchableQuote,
  filters: QuoteFilterOptions,
  favorites: ReadonlySet<string>
): boolean {
  const query = filters.query.trim().toLocaleLowerCase();
  return (!query || quote.searchText.toLocaleLowerCase().includes(query))
    && (filters.reference === 'all' || (filters.reference === 'yes') === quote.hasReference)
    && (!filters.favoritesOnly || favorites.has(quote.id));
}

export function chooseRandomQuoteId(ids: readonly string[], randomValue = Math.random()): string | null {
  if (!ids.length) return null;
  const index = Math.max(0, Math.min(ids.length - 1, Math.floor(randomValue * ids.length)));
  return ids[index] ?? null;
}
