import type { APIRoute } from 'astro';
import { quotes } from '../lib/quote-data';
import { collections } from '../lib/collections';

const escapeXml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://jester-quotes.vercel.app');
  const paths = [
    '/', '/about/', '/collections/',
    ...collections.map((collection) => `/collections/${encodeURIComponent(collection.slug)}/`),
    '/studio/', '/sources/',
    ...quotes.map((quote) => `/quotes/${encodeURIComponent(quote.id)}/`)
  ];
  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(new URL(path, origin).toString())}</loc></url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
