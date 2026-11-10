import { defineConfig } from 'astro/config';

// Unconfigured previews should point canonical and Open Graph URLs to production.
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://jester-quotes.vercel.app'
});
