import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const quoteRegistry = JSON.parse(readFileSync(resolve(root, 'src/data/jester-quotes.json'), 'utf8'));
const quotes = quoteRegistry.items;
const collections = JSON.parse(readFileSync(resolve(root, 'src/data/collections.json'), 'utf8'));
const studio = readFileSync(resolve(root, 'src/components/QuoteStudio.astro'), 'utf8');
const layout = readFileSync(resolve(root, 'src/layouts/BaseLayout.astro'), 'utf8');

test('Dada site carries all canonical quotes with unique IDs and attributions', () => {
  assert.equal(quotes.length, 100);
  assert.equal(new Set(quotes.map((quote) => quote.id)).size, 100);
  for (const quote of quotes) {
    assert.ok(quote.quote.trim(), `${quote.id} has quote text`);
    assert.ok(quote.person.trim(), `${quote.id} has an attribution`);
  }
});

test('six collections resolve only to canonical quote IDs', () => {
  assert.equal(collections.length, 6);
  const ids = new Set(quotes.map((quote) => quote.id));
  for (const collection of collections) {
    assert.ok(collection.slug && collection.quoteIds.length);
    for (const id of collection.quoteIds) assert.ok(ids.has(id), `${collection.slug} -> ${id}`);
  }
  assert.ok(existsSync(resolve(root, 'src/pages/collections/[slug].astro')));
});

test('independent pages stay noindex and default Quote Studio to Dada Riot', () => {
  assert.match(layout, /noindex, nofollow, noarchive/);
  assert.match(layout, /dada-riot\.css/);
  assert.match(studio, /key === 'dada'/);
});

test('required original and responsive Dada artwork files exist', () => {
  for (const path of [
    'public/assets/dada-riot-hero-clean-16x9.png',
    'public/assets/dada-riot-hero-clean-16x9.webp',
    'public/assets/dada-riot-hero-mobile-4x5.webp',
    'public/assets/dada-riot-wordmark-horizontal.svg',
    'public/assets/dada-riot-emblem-square.svg',
    'public/assets/dada-riot-og-1200x630.png',
    'public/assets/dada-riot-poster-square.webp',
    'public/assets/dada-riot-poster-portrait.webp'
  ]) assert.ok(existsSync(resolve(root, path)), `${path} exists`);
  for (let index = 1; index <= 6; index++) {
    const path = `public/assets/dada-riot-collection-${String(index).padStart(2, '0')}-cover-4x3.webp`;
    assert.ok(existsSync(resolve(root, path)), `${path} exists`);
  }
});

test('built site includes quote, collection, directory, policy, and studio routes', () => {
  const requiredPages = [
    'index.html', 'daily/index.html', 'saved/index.html', 'search/index.html',
    'quotes/index.html', 'collections/index.html', 'tricksters/index.html',
    'resources/index.html', 'videos/index.html', 'sources/index.html',
    'about/index.html', 'studio/index.html', '404.html', 'sitemap.xml', 'robots.txt'
  ];
  for (const page of requiredPages) assert.ok(existsSync(resolve(root, 'dist', page)), `dist/${page} exists`);
  for (const quote of quotes) assert.ok(existsSync(resolve(root, 'dist/quotes', quote.id, 'index.html')), `route for ${quote.id}`);
  for (const collection of collections) assert.ok(existsSync(resolve(root, 'dist/collections', collection.slug, 'index.html')), `route for ${collection.slug}`);
});

test('every built HTML page is noindex and has no missing local asset or route links', () => {
  const htmlFiles = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.html')) htmlFiles.push(path);
    }
  };
  walk(resolve(root, 'dist'));
  assert.ok(htmlFiles.length > 100);
  const outputRoot = resolve(root, 'dist');
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /name="robots" content="noindex[^\"]*"/, file);
    const refs = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((match) => match[1]);
    for (const raw of refs) {
      const path = decodeURIComponent(raw.split(/[?#]/, 1)[0]);
      if (!path || path === '/') continue;
      const target = resolve(outputRoot, `.${path}`);
      const candidates = [target, resolve(target, 'index.html'), `${target}.html`];
      assert.ok(candidates.some(existsSync), `${file} references missing local path ${path}`);
    }
  }
});
