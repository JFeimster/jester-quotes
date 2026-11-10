import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(path.join(root, name), 'utf8');
const dist = (name) => read(path.join('dist', name));
const registry = JSON.parse(read('src/data/jester-quotes.json'));

test('homepage contains a real image-backed hero and three meaningful card variants', () => {
  const html = dist('index.html');
  assert.match(html, /id="hero-title"/);
  assert.match(html, /id="surprise-me"/);
  assert.match(html, /src="\/images\/midnight-carnival-hero-4x5\.png"/);
  assert.ok(existsSync(path.join(root,'public/images/midnight-carnival-hero-4x5.png')));
  const variants = [...html.matchAll(/data-variant="(compact|editorial|poster)"/g)].map(x=>x[1]);
  assert.equal(variants.length, registry.items.length, 'all 100 quotation cards must render');
  for (const kind of ['compact','editorial','poster']) {
    assert.ok(variants.filter(v=>v===kind).length>=5, `${kind} should be a real layout variant`);
  }
  assert.ok(html.includes('id="collections-teaser-title"'));
  assert.ok(html.includes('id="quote-search"'));
  assert.ok(html.includes('href="/studio/"'));
  assert.ok(html.includes('href="/sources/"'));
  assert.ok(html.includes('id="favorites-summary"'));
});

test('card interactions, quotation detail paths, and full text remain present', () => {
  const html = dist('index.html');
  const cards = read('src/components/QuoteCard.astro');
  const count = (piece) => [...html.matchAll(new RegExp(piece, 'g'))].length;
  assert.equal(count('class="[^"]*favorite-toggle'), registry.items.length);
  assert.equal(count('class="[^"]*copy-quote'), registry.items.length);
  assert.equal(count('class="[^"]*card-create-link'), registry.items.length);
  for(const q of registry.items) {
    assert.ok(html.includes(`data-id="${q.id}"`), q.id);
    assert.ok(html.includes(`href="/quotes/${q.id}/"`), q.id);
    assert.ok(html.includes(`/studio/?quote=${q.id}`), q.id);
  }
  assert.match(cards,/quote\.quote\.length > 500/);
  assert.ok(!/line-clamp|slice\(0,\s*\d+\)/.test(cards), 'do not truncate quote content in cards');
  assert.ok(html.includes('data-quote-text='));
});

test('Studio provides visible, keyboard-operable format and palette buttons', () => {
  const html = dist('studio/index.html');
  const script = read('src/scripts/studio.ts');
  for (const name of ['square','portrait','story','landscape'])
    assert.ok(html.includes(`data-studio-format="${name}"`), name);
  for (const name of ['midnight','velvet','ivory','coral'])
    assert.ok(html.includes(`data-studio-theme="${name}"`), name);
  assert.ok(html.includes('id="studio-format"'));
  assert.ok(html.includes('id="studio-theme"'));
  assert.ok(html.includes('id="studio-quote"'));
  assert.ok(html.includes('id="studio-download"'));
  assert.ok(html.includes('id="studio-canvas"'));
  assert.ok(html.includes('id="studio-prev"'));
  assert.ok(html.includes('id="studio-next"'));
  assert.ok(html.includes('id="studio-status"'));
  assert.match(script,/syncChoiceButtons/);
  assert.match(script,/aria-pressed/);
  assert.match(script,/dispatchEvent\(new Event\('change'/);
  assert.match(script,/downloadArtwork/);
});

test('collection pages retain their links, original card data and filtering controls', () => {
  const html = dist('collections/wise-fools/index.html');
  assert.ok(html.includes('id="quote-search"'));
  assert.ok(html.includes('id="reference-filter"'));
  assert.ok(html.includes('id="favorites-filter"'));
  assert.ok(html.includes('id="clear-filters"'));
  assert.ok(html.includes('data-variant='));
  assert.ok(html.includes('card-create-link'));
  const listing = dist('collections/index.html');
  for (const name of ['wise-fools','truth-to-power','laughter-and-life','masks-and-identity','carnival-absurdity','art-of-the-jester'])
    assert.ok(listing.includes(`/collections/${name}/`), name);
});

test('style system includes real light/dark composition, responsive and reduced motion safeguards', () => {
  const css = read('src/styles/midnight-2.css');
  const motion = read('src/styles/motion.css');
  const layout = read('src/layouts/BaseLayout.astro');
  for (const token of ['.featured-2','.quote-card {','.quote-card--editorial','.quote-card--poster','.studio-choice','.collection-card--ivory','.hero-utility'])
    assert.ok(css.includes(token), token);
  assert.ok(css.includes('var(--mc-paper)'), 'light paper treatment');
  assert.ok(css.includes('#101115'), 'charcoal/near-black treatment');
  assert.ok(css.includes('@media (max-width:680px)'));
  assert.ok(css.includes('@media (max-width:380px)'));
  assert.ok(motion.includes('prefers-reduced-motion:reduce'));
  assert.ok(motion.includes('animation:none'));
  assert.ok(layout.includes("import '../styles/midnight-2.css'"));
  assert.ok(layout.includes("import '../styles/motion.css'"));
});
