import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => readFileSync(path.join(root, p), 'utf8');
const registry = JSON.parse(read('src/data/jester-quotes.json'));
const collections = JSON.parse(read('src/data/collections.json'));
const tricksters = JSON.parse(read('src/data/tricksters.json'));
const origin = 'https://jester-quotes.vercel.app';
const dist = (p) => read(path.join('dist', p));
const schemaFrom = (html) => {
  const match = html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(match, 'Page must include JSON-LD structured data');
  return JSON.parse(match[1]);
};

test('sitemap covers all discovery tools, curated collections, and 100 quote URLs', () => {
  const xml = dist('sitemap.xml');
  assert.ok(xml.startsWith('<?xml'));
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = [
    `${origin}/`,
    `${origin}/about/`,
    `${origin}/collections/`,
    ...collections.map((collection) => `${origin}/collections/${collection.slug}/`),
    `${origin}/studio/`,
    `${origin}/sources/`,
    `${origin}/tricksters/`,
    ...tricksters.map((item) => `${origin}/tricksters/${item.slug}/`),
    ...registry.items.map((item) => `${origin}/quotes/${item.id}/`)
  ];
  assert.equal(urls.length, 102 + 3 + collections.length + 1 + tricksters.length);
  assert.equal(new Set(urls).size, urls.length);
  assert.deepEqual(urls, expected);
  assert.ok(!xml.includes('/404'), '404 route must not be indexed');
});

test('robots.txt advertises the same production sitemap', () => {
  const robots = dist('robots.txt');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
});

test('all 100 built quote pages contain unique canonical URLs and faithful quotation metadata', () => {
  for (const quote of registry.items) {
    const href = `${origin}/quotes/${quote.id}/`;
    const filename = path.join('dist', 'quotes', quote.id, 'index.html');
    assert.ok(existsSync(path.join(root, filename)), `${quote.id} missing HTML`);
    const html = read(filename);
    assert.ok(html.includes(`rel="canonical" href="${href}"`), `Canonical: ${quote.id}`);
    assert.ok(html.includes('property="og:type" content="article"'), `OpenGraph: ${quote.id}`);
    assert.ok(html.includes(`property="og:image" content="${origin}/social/quotes/${quote.id}.png"`), `Image: ${quote.id}`);
    assert.ok(html.includes('name="twitter:description"'), `Twitter metadata: ${quote.id}`);
    assert.ok(html.includes('id="quote-title"'), `Heading: ${quote.id}`);
    assert.ok(html.includes('href="#main-content"'), `Skip link: ${quote.id}`);
    const schema = schemaFrom(html);
    assert.equal(schema['@type'], 'Quotation', `Schema: ${quote.id}`);
    assert.equal(schema.text, quote.quote, `Complete quote text: ${quote.id}`);
    assert.equal(schema.author.name, quote.person, `Author attribution: ${quote.id}`);
    assert.equal(schema.url, href, `Schema URL: ${quote.id}`);
    assert.equal(schema.citation ?? null, quote.reference, `Reference: ${quote.id}`);
  }
});

test('home JSON-LD lists 100 unique quote URLs and 404 is excluded from search indexing', () => {
  const html = dist('index.html');
  const schema = schemaFrom(html);
  assert.equal(schema['@type'], 'CollectionPage');
  assert.equal(schema.mainEntity['@type'], 'ItemList');
  assert.equal(schema.mainEntity.numberOfItems, 100);
  assert.equal(schema.mainEntity.itemListElement.length, 100);
  assert.equal(new Set(schema.mainEntity.itemListElement.map((x) => x.url)).size, 100);
  assert.ok(html.includes(`rel="canonical" href="${origin}/"`));
  assert.ok(html.includes('property="og:site_name" content="Jester Quotes"'));
  assert.ok(dist('404.html').includes('name="robots" content="noindex, follow"'));
  assert.ok(dist('about/index.html').includes(`rel="canonical" href="${origin}/about/"`));
});

test('every generated quotation social image is present and full-site source attribution remains visible', () => {
  for (const quote of registry.items) {
    assert.ok(existsSync(path.join(root, 'dist', 'social', 'quotes', `${quote.id}.png`)), quote.id);
  }
  assert.ok(dist('index.html').includes('knowyourarchetypes.com/jester-quotes/'));
});
