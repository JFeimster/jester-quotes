import data from '../data/jester-quotes.json';
import type { QuoteRegistry, Quote } from '../types/quote';

export const registry = data as QuoteRegistry;
export const quotes: Quote[] = registry.items;
export function quoteHref(q: Quote) {
  return `/quotes/${encodeURIComponent(q.id)}/`;
}
