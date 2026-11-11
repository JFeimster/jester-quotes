import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');

test('Midnight Carnival artwork remains a scalable, inline-safe SVG', () => {
  const svg = read('../src/assets/jester-hero.svg');
  assert.match(svg, /^<svg\b/);
  assert.match(svg, /viewBox="0 0 880 740"/);
  assert.match(svg, /<title\b/);
  assert.match(svg, /<desc\b/);
  assert.ok(!/<script\b/i.test(svg), 'illustration should not include scripts');
  assert.ok(!/https?:\/\//i.test(svg.replace('http://www.w3.org/2000/svg', '')), 'asset should not depend on external hosts');
});

test('visual refresh preserves feature hooks for search, favorites and random discovery', () => {
  const hero = read('../src/components/Hero.astro');
  const search = read('../src/components/QuoteSearch.astro');
  const cards = read('../src/components/QuoteCard.astro');
  const gallery = read('../src/components/QuoteGallery.astro');
  const favorites = read('../src/components/FavoritesPanel.astro');
  for (const hook of ['id="surprise-me"', 'id="quote-search"', 'id="reference-filter"', 'id="favorites-filter"', 'id="clear-filters"', 'id="result-count"', 'id="empty-state"', 'id="show-favorites"', 'id="favorites-summary"']) {
    assert.ok([hero,search,cards,gallery,favorites].some(text => text.includes(hook)), hook);
  }
  for (const hook of ['favorite-toggle', 'copy-quote', 'data-quote-id', 'data-quote-text', 'data-reference']) {
    assert.ok(cards.includes(hook), hook);
  }
  assert.match(cards, /quote\.quote\.length > 500/);
  assert.ok(!cards.includes('line-clamp'), 'complete quotation text must remain visible');
});
