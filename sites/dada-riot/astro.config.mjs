import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// Unconfigured previews should point canonical and Open Graph URLs to production.
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://jester-quotes.vercel.app',
  vite: {
    tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url))
  }
});
