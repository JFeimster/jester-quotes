import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (filename) => readFileSync(path.join(root, filename), 'utf8');
const collections = JSON.parse(read('src/data/collections.json'));
const registry = JSON.parse(read('src/data/jester-quotes.json'));
const ids = new Set(registry.items.map((quote) => quote.id));
const dist = (filename) => read(path.join('dist', filename));
const origin = 'https://jester-quotes.vercel.app';

test('six curated collections reference only valid, unique source quote IDs', () => {
  assert.equal(collections.length, 6);
  assert.equal(new Set(collections.map((item) => item.slug)).size, collections.length);
  const coverage = new Set();
  for (const collection of collections) {
    assert.match(collection.slug, /^[a-z0-9-]+$/);
    assert.ok(collection.title && collection.description && collection.eyebrow);
    assert.ok(collection.quoteIds.length >= 10);
    assert.equal(new Set(collection.quoteIds).size, collection.quoteIds.length, collection.slug);
    for (const id of collection.quoteIds) {
      assert.ok(ids.has(id), `${collection.slug} references missing ${id}`);
      coverage.add(id);
    }
  }
  assert.ok(coverage.size >= 90, 'curations should span most of the original collection');
  assert.equal(registry.items.length, 100, 'canonical registry remains intact');
});

test('collections homepage and every curated detail route are built with real quote links', () => {
  const index = dist('collections/index.html');
  assert.ok(index.includes(`rel="canonical" href="${origin}/collections/"`));
  for (const collection of collections) {
    assert.ok(index.includes(`href="/collections/${collection.slug}/"`), collection.slug);
    const filename = path.join('dist', 'collections', collection.slug, 'index.html');
    assert.ok(existsSync(path.join(root, filename)), filename);
    const html = read(filename);
    assert.ok(html.includes(`rel="canonical" href="${origin}/collections/${collection.slug}/"`), collection.slug);
    assert.ok(html.includes('id="quote-search"'), 'Existing search should work on each collection');
    assert.ok(html.includes('id="result-count"'), 'Existing search status should remain available');
    assert.ok(html.includes('id="interaction-status"'), 'Existing interaction feedback should remain available');
    for (const id of collection.quoteIds) {
      assert.ok(html.includes(`data-id="${id}"`), `Missing curated quote ${id}`);
      assert.ok(html.includes(`href="/quotes/${id}/"`), `Missing quote link ${id}`);
    }
  }
});

test('image-backed collection cards keep copy legible across all accent variants', () => {
  const css = read('src/styles/discovery.css');
  assert.match(css, /\.collection-card-shade\s*\{[^}]*rgba\(21,17,31,\.82\)\s+100%/s,
    'all cards need a dark image veil through the right edge');
  assert.match(css, /\.collection-card--ivory\s+\.collection-card-shade\s*\{[^}]*rgba\(21,17,31,\.88\)\s+100%/s,
    'ivory-accent cards need a stronger veil behind their ivory CTA');
  assert.match(css, /\.collection-card p\s*\{[^}]*color:\s*#cebfce/s,
    'collection descriptions retain a light text color');
  assert.match(css, /\.collection-card-foot\s*\{[^}]*color:\s*#d7cbd8/s,
    'collection metadata remains readable over artwork');
  assert.match(css, /\.collection-card-foot strong\s*\{[^}]*color:\s*var\(--collection-accent\)/s,
    'CTA accent remains tied to each card identity');
  const midnightCss = read('src/styles/midnight-2.css');
  assert.match(midnightCss, /\.collection-card--ivory h3,\.collection-card--ivory p,\.collection-card--ivory \.collection-card-foot,\.collection-card--ivory \.collection-number,\.collection-card--ivory \.collection-intro\s*\{[^}]*color:var\(--ivory\)/s,
    'ivory variant copy stays light over the image veil');
  assert.match(midnightCss, /\.collection-card--ivory \.collection-card-foot strong\s*\{color:var\(--ivory\);\}/,
    'ivory variant CTA stays light over the image veil');
  for (const collection of collections) {
    assert.ok(collection.tone, `Missing card accent for ${collection.slug}`);
  }
});

test('Studio supports real browser canvas export and all 100 quote selectors', () => {
  const html = dist('studio/index.html');
  const script = read('src/scripts/studio.ts');
  assert.ok(html.includes(`rel="canonical" href="${origin}/studio/"`));
  for (const hook of ['studio-search','studio-quote','studio-format','studio-theme','studio-border','studio-random','studio-download','studio-canvas','studio-status','studio-source']) {
    assert.ok(html.includes(`id="${hook}"`), `Missing Studio control: ${hook}`);
  }
  for (const quote of registry.items) assert.ok(html.includes(`value="${quote.id}"`), quote.id);
  assert.match(read('src/lib/artwork/canvas-renderer.ts'), /fitPosterText/);
  assert.match(read('src/lib/artwork/export-image.ts'), /toBlob/);
  assert.match(script, /download\.disabled = true/);
  assert.match(script, /new URL\(window\.location\.href\)\.searchParams\.get\('quote'\)/);
});

test('Studio format dimensions, color themes, and text regions remain valid', async () => {
  const source = read('src/lib/studio-config.ts');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  });
  const settings = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  assert.deepEqual(Object.keys(settings.studioFormats), ['square', 'portrait', 'story', 'landscape']);
  assert.deepEqual(Object.keys(settings.studioThemes), ['midnight', 'velvet', 'ivory', 'coral','brutalist','dada','riot']);
  assert.deepEqual([settings.studioFormats.square.width, settings.studioFormats.square.height], [1080,1080]);
  assert.deepEqual([settings.studioFormats.portrait.width, settings.studioFormats.portrait.height], [1080,1350]);
  assert.deepEqual([settings.studioFormats.story.width, settings.studioFormats.story.height], [1080,1920]);
  assert.deepEqual([settings.studioFormats.landscape.width, settings.studioFormats.landscape.height], [1200,630]);
  for (const key of Object.keys(settings.studioFormats)) {
    const region = settings.studioTextArea(key);
    const {width,height}=settings.studioFormats[key];
    assert.ok(region.width > 100 && region.height > 100);
    assert.ok(region.left > 0 && region.top > 0);
    assert.ok(region.width + region.left < width);
    assert.ok(region.height + region.top < height);
  }
  for (const theme of Object.values(settings.studioThemes)) {
    for (const key of ['background','secondary','foreground','accent']) {
      assert.match(theme[key], /^#[a-fA-F0-9]{6}$/);
    }
  }
});

test('source transparency page, homepage teaser and quote-to-studio links are present', () => {
  const sources = dist('sources/index.html');
  const home = dist('index.html');
  const detail = dist('quotes/jester-quote-003/index.html');
  assert.ok(sources.includes(`rel="canonical" href="${origin}/sources/"`));
  assert.ok(sources.includes('knowyourarchetypes.com/jester-quotes/'));
  assert.ok(sources.includes('GitHub'));
  assert.ok(sources.includes('86 entries have no additional reference'));
  assert.ok(home.includes('id="collections-teaser-title"'));
  assert.ok(home.includes('href="/collections/"'));
  assert.ok(home.includes('href="/studio/"'));
  assert.ok(detail.includes('href="/studio/?quote=jester-quote-003"'));
  assert.ok(home.includes('href="/sources/"'));
});
