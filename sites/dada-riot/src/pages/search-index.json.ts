import type { APIRoute } from 'astro';
import { siteSearchIndex } from '../lib/site-search';
// Static and public: this endpoint contains only already-published editorial metadata.
export const GET: APIRoute = () => new Response(JSON.stringify(siteSearchIndex),{
  headers:{
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'public, max-age=300, s-maxage=3600'
  }
});
