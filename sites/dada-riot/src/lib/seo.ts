import type { Quote } from '../types/quote';

export const siteTitle = 'Jester Quotes — A Little Wit. A Little Chaos.';
export const defaultDescription = '100 jester quotes on humor, wisdom, mischief, and the art of speaking truth through laughter.';

export function quotePageTitle(quote: Quote): string {
  const compact = quote.quote.replace(/\s+/g, ' ').trim();
  const excerpt = compact.length > 57 ? `${compact.slice(0, 57).trimEnd()}…` : compact;
  return `${excerpt} — ${quote.person} | Jester Quotes`;
}

export function collectionSchema(site: URL, quotes: Quote[]) {
  const base = new URL('/', site).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: siteTitle,
    description: defaultDescription,
    url: base,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: quotes.length,
      itemListElement: quotes.map((quote, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: quote.name,
        url: new URL(`/quotes/${encodeURIComponent(quote.id)}/`, site).toString()
      }))
    }
  };
}

export function quotationSchema(site: URL, quote: Quote, sourceUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    name: quote.name,
    text: quote.quote,
    url: new URL(`/quotes/${encodeURIComponent(quote.id)}/`, site).toString(),
    inLanguage: 'en',
    author: { '@type': 'Person', name: quote.person },
    ...(quote.reference ? { citation: quote.reference } : {}),
    isBasedOn: sourceUrl,
    isPartOf: new URL('/', site).toString()
  };
}

// Prevent a quotation containing literal HTML from closing the JSON-LD script.
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
