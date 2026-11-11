import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(path.join(root,p),'utf8');
const html=()=>read('dist/riot-press/index.html');
const quotes=JSON.parse(read('src/data/jester-quotes.json')).items;
const collections=JSON.parse(read('src/data/collections.json'));

test('Riot Press is a usable 100-quote public route, not a Lab-only theme',()=>{
  const page=html();
  assert.ok(existsSync(path.join(root,'dist/riot-press/index.html')));
  assert.ok(page.includes('rel="canonical" href="https://jester-quotes.vercel.app/riot-press/"'));
  assert.ok(page.includes('name="robots" content="noindex, follow"'));
  assert.equal([...page.matchAll(/class="[^"]*quote-card--/g)].length,100);
  assert.equal([...page.matchAll(/class="[^"]*favorite-toggle/g)].length,100);
  assert.equal([...page.matchAll(/class="[^"]*copy-quote/g)].length,100);
  assert.equal([...page.matchAll(/class="[^"]*card-create-link/g)].length,100);
  assert.equal(quotes.length,100);
  for(const q of quotes) assert.ok(page.includes(`data-id="${q.id}"`),q.id);
  for(const c of collections) assert.ok(page.includes(`href="/collections/${c.slug}/"`),c.slug);
  for(const hook of ['quote-search','reference-filter','favorites-filter','result-count','quote-gallery','empty-state'])
    assert.ok(page.includes(`id="${hook}"`),hook);
  assert.ok(page.includes('href="/studio/?theme=riot"'));
  assert.ok(read('dist/index.html').includes('href="/riot-press/"'));
});

test('Hybrid uses the existing quote engine with new composition and no duplicate dataset',()=>{
  const page=read('src/pages/riot-press/index.astro');
  assert.match(page,/QuoteGallery/);
  assert.match(page,/RiotPressHero/);
  assert.match(page,/quote-explorer\.ts/);
  const hero=read('src/components/RiotPressHero.astro');
  assert.match(hero,/NO KINGS/);
  assert.match(hero,/NO CLOWNS/);
  const css=read('src/styles/riot-press.css');
  for(const k of ['.riot-hero-grid','.riot-issue-grid','.riot-press .quote-card','max-width:650px','prefers-reduced-motion:reduce'])
    assert.ok(css.includes(k),k);
  assert.ok(!existsSync(path.join(root,'src/data/riot-quotes.json')));
});

test('Studio has functional Riot, Dada and Brutalist export styles',()=>{
  const studio=read('dist/studio/index.html');
  const config=read('src/lib/studio-config.ts');
  const script=read('src/scripts/studio.ts');
  const renderer=read('src/lib/artwork/canvas-renderer.ts');
  const treatment=read('src/lib/artwork/press-treatment.ts');
  for(const id of ['riot','dada','brutalist']) {
    assert.ok(studio.includes(`data-studio-theme="${id}"`),id);
    assert.ok(config.includes(`${id}: { label:`),id);
  }
  assert.ok(script.includes("searchParams.get('theme')"));
  assert.ok(script.includes('Object.prototype.hasOwnProperty.call(studioThemes,requestedTheme)'));
  assert.ok(renderer.includes('drawPressTreatment(ctx,width,height,spec.theme)'));
  assert.ok(treatment.includes("style !== 'riot' && style !== 'dada' && style !== 'brutalist'"));
  assert.ok(renderer.includes('paginateText'));
});
