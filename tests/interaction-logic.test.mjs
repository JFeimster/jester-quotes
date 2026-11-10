import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Test small, dependency-free TypeScript modules without adding a test framework.
async function loadTs(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const filters = await loadTs('../src/lib/quote-interactions.ts');
const layout = await loadTs('../src/lib/poster-layout.ts');
const saved = await loadTs('../src/scripts/favorites.ts');
const registry = JSON.parse(readFileSync(new URL('../src/data/jester-quotes.json', import.meta.url), 'utf8'));

test('search, reference and favorites filters compose correctly', () => {
  const quote = { id: 'jester-quote-001', searchText: 'The Fool Speaks — Shakespeare', hasReference: true };
  const favorites = new Set(['jester-quote-001']);
  const base = { query: '', reference: 'all', favoritesOnly: false };
  assert.equal(filters.matchesQuoteFilters(quote, base, favorites), true);
  assert.equal(filters.matchesQuoteFilters(quote, { ...base, query: ' SHAKESPEARE ' }, favorites), true);
  assert.equal(filters.matchesQuoteFilters(quote, { ...base, query: 'missing' }, favorites), false);
  assert.equal(filters.matchesQuoteFilters(quote, { ...base, reference: 'no' }, favorites), false);
  assert.equal(filters.matchesQuoteFilters(quote, { ...base, reference: 'yes' }, favorites), true);
  assert.equal(filters.matchesQuoteFilters(quote, { ...base, favoritesOnly: true }, new Set()), false);
  assert.equal(filters.matchesQuoteFilters(quote, { ...base, favoritesOnly: true }, favorites), true);
});

test('random quote discovery stays inside the supplied quote IDs', () => {
  const ids = ['a', 'b', 'c'];
  assert.equal(filters.chooseRandomQuoteId([], 0.5), null);
  assert.equal(filters.chooseRandomQuoteId(ids, 0), 'a');
  assert.equal(filters.chooseRandomQuoteId(ids, 0.5), 'b');
  assert.equal(filters.chooseRandomQuoteId(ids, 0.99999), 'c');
  assert.equal(filters.chooseRandomQuoteId(ids, 1), 'c');
  assert.equal(filters.chooseRandomQuoteId(ids, -0.1), 'a');
});

test('favorites survive reloads and gracefully handle malformed or unavailable storage', () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  };
  try {
    assert.deepEqual([...saved.readFavorites()], []);
    assert.equal(saved.saveFavorites(new Set(['jester-quote-001', 'jester-quote-082'])), true);
    assert.deepEqual([...saved.readFavorites()], ['jester-quote-001', 'jester-quote-082']);
    storage.set(saved.FAVORITES_STORAGE_KEY, '{invalid');
    assert.deepEqual([...saved.readFavorites()], []);
    storage.set(saved.FAVORITES_STORAGE_KEY, '["jester-quote-001",null,1,""]');
    assert.deepEqual([...saved.readFavorites()], ['jester-quote-001']);
    globalThis.localStorage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); }
    };
    assert.deepEqual([...saved.readFavorites()], []);
    assert.equal(saved.saveFavorites(new Set(['jester-quote-001'])), false);
  } finally {
    delete globalThis.localStorage;
  }
});

test('long quotes and unbroken words fit the square poster without losing their content', () => {
  const measure = (value, fontSize) => [...value].length * fontSize * 0.58;
  for (const quote of registry.items) {
    const result = layout.fitPosterText(quote.quote, 860, 676, measure);
    assert.ok(result, `${quote.id} should fit the poster`);
    assert.ok(result.height <= 676);
    assert.ok(result.lines.every((line) => measure(line, result.fontSize) <= 860), quote.id);
    assert.equal(result.lines.join('').replace(/\s+/g, ''), quote.quote.replace(/\s+/g, ''), quote.id);
  }
  const uninterrupted = 'JESTER'.repeat(300);
  const result = layout.fitPosterText(uninterrupted, 860, 676, measure);
  assert.ok(result);
  assert.equal(result.lines.join(''), uninterrupted);
  assert.ok(result.lines.every((line) => measure(line, result.fontSize) <= 860));
  assert.equal(layout.fitPosterText('   ', 860, 676, measure), null);
});
