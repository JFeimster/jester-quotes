import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const compiled = await build({
  entryPoints: [path.join(root, 'src/lib/search-results.ts')],
  bundle: true, platform: 'node', format: 'esm', write: false,
  tsconfigRaw: { compilerOptions: {} }
});
const search = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const index = JSON.parse(readFileSync(path.join(root, 'dist/search-index.json'), 'utf8'));
const media = JSON.parse(readFileSync(path.join(root, 'src/data/jesters-in-media.json'), 'utf8'));
const sample = (id, title, extra = {}) => ({
  id, title, kind: 'media', summary: '', source: '', tags: [], searchText: title,
  href: '/jesters-in-media/', ...extra
});

test('ranking favors exact names, phrases, prefixes, metadata, tags, relationships, then descriptions', () => {
  const records = [
    sample('description', 'Other', { summary: 'The Joker', searchText: 'The Joker' }),
    sample('relationship', 'Other', { relationshipTerms: 'The Joker', searchText: 'The Joker' }),
    sample('tag', 'Other', { tags: ['The Joker'], searchText: 'The Joker' }),
    sample('metadata', 'Other', { metadata: 'The Joker', searchText: 'The Joker' }),
    sample('prefix', 'The Joker Returns'),
    sample('phrase', 'Meet The Joker Today'),
    sample('exact', 'The Joker')
  ];
  assert.deepEqual(search.searchResults(records, 'THE JOKER').map(x => x.id),
    ['exact', 'phrase', 'prefix', 'metadata', 'tag', 'relationship', 'description']);
  assert.equal(search.normalizeSearch('  Élan—The JOKER! '), 'elan the joker');
  assert.equal(search.searchResults([sample('accent', 'Élan—The Joker')], 'elan the joker').length, 1);
  assert.equal(search.searchResults([sample('prefix', 'The Joker Returns')], 'The Jok').length, 1);
  assert.equal(search.searchResults([sample('punctuation', 'Spider-Man')], 'Spiderman').length, 1);
  assert.equal(search.searchScore(sample('no', 'Unrelated'), 'joker'), 0);
  assert.deepEqual(search.searchResults([sample('b','Same'), sample('a','Same')], 'same').map(x=>x.id), ['a','b']);
});

test('all eight categories, canonical quotes, published media, and destinations are intact', () => {
  const counts = search.categoryCounts(index);
  assert.equal(counts.all, index.length);
  assert.equal(counts.quotes, 100);
  assert.equal(counts.media, 15);
  for (const kind of search.SEARCH_KINDS) assert.ok(counts[kind] > 0, kind);
  for (const quote of index.filter(x => x.kind === 'quotes')) {
    assert.ok(search.searchResults(index, quote.id).some(x => x.id === quote.id), quote.id);
    assert.ok(search.searchResults(index, quote.source).some(x => x.id === quote.id), quote.id);
  }
  const linkedQuote = index.find(x => x.kind === 'quotes' && x.relationshipTerms);
  assert.ok(linkedQuote && search.searchResults(index, linkedQuote.relationshipTerms).some(x => x.id === linkedQuote.id));
  assert.equal(media.filter(x => x.publication_status === 'draft').length, 9);
  for (const draft of media.filter(x => x.publication_status === 'draft'))
    assert.ok(!index.some(x => x.id === 'media-' + draft.id), draft.id);
  assert.equal(new Set(index.map(x => x.id)).size, index.length);
  for (const item of index) {
    const url = new URL(item.href, 'https://jester-quotes.vercel.app');
    assert.equal(url.origin, 'https://jester-quotes.vercel.app', item.id);
    assert.ok(existsSync(path.join(root, 'dist', url.pathname, 'index.html')), item.href);
    if (url.hash) {
      const html = readFileSync(path.join(root, 'dist', url.pathname, 'index.html'), 'utf8');
      assert.ok(html.includes('id="' + decodeURIComponent(url.hash.slice(1)) + '"'), item.href);
    }
  }
});

test('result pages cover every match once and category counts follow the query', () => {
  const all = search.searchResults(index, 'quotation');
  assert.equal(all.filter(item => item.kind === 'quotes').length, 100);
  assert.ok(all.length > 100);
  const seen = new Set();
  for (let shown = 30; shown <= all.length + 30; shown += 30) {
    const page = search.searchPage(all, shown);
    for (const item of page.slice(Math.max(0, shown - 30))) {
      assert.ok(!seen.has(item.id), item.id);
      seen.add(item.id);
    }
  }
  assert.equal(seen.size, all.length);
  const mediaTitle = index.find(item => item.kind === 'media').title;
  const counts = search.categoryCounts(search.searchResults(index, mediaTitle));
  assert.equal(counts.all, search.SEARCH_KINDS.reduce((sum, kind) => sum + counts[kind], 0));
  assert.ok(counts.media > 0);
});

test('URL state accepts only known categories and preserves query text', () => {
  assert.deepEqual(search.readSearchState(new URL('https://example.com/search/?q=Joker&category=media')),
    { query: 'Joker', filter: 'media' });
  assert.deepEqual(search.readSearchState(new URL('https://example.com/search/?category=unknown')),
    { query: '', filter: 'all' });
});
