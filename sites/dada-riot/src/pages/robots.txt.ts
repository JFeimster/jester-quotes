import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap.xml', site ?? new URL('https://jester-quotes.vercel.app'));
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.toString()}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
