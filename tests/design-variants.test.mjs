import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(path.join(root,p),'utf8');
const quoteRegistry=JSON.parse(read('src/data/jester-quotes.json'));
const quotes=new Map(quoteRegistry.items.map(q=>[q.id,q]));
const IDs=['midnight-carnival','neo-brutalist','velvet-gallery'];
const files={
 'midnight-carnival':'src/design/themes/midnight-carnival.ts',
 'neo-brutalist':'src/design/themes/neo-brutalist.ts',
 'velvet-gallery':'src/design/themes/velvet-gallery.ts'
};

test('three theme contracts reference the one canonical 100-quote registry',()=>{
  assert.equal(quotes.size,100);
  for(const id of IDs){
    const spec=read(files[id]);
    assert.ok(spec.includes(`id:'${id}'`),id);
    assert.match(spec,/sampleQuoteIds:/);
    const match=spec.match(/sampleQuoteIds:\[([^\]]+)\]/);
    assert.ok(match,id);
    const quotedIds=[...match[1].matchAll(/jester-quote-\d{3}/g)].map(m=>m[0]);
    assert.equal(quotedIds.length,3,id);
    assert.equal(new Set(quotedIds).size,3,id);
    quotedIds.forEach(q=>assert.ok(quotes.has(q),`${id}: unknown quote ${q}`));
  }
  const catalog=read('src/design/theme-registry.ts');
  for(const id of ['midnightCarnival','neoBrutalist','velvetGallery']){
    assert.ok(catalog.includes(id));
  }
  assert.match(catalog,/labThemeStyle/);
  assert.match(catalog,/Duplicate design Lab theme id/);
  assert.ok(!existsSync(path.join(root,'src/data/lab-quotes.json')));
});

test('/lab/ has exactly three distinct compositions, accessible tab controls and noindex',()=>{
  const html=read('dist/lab/index.html');
  assert.match(html,/name="robots" content="noindex, nofollow"/);
  assert.match(html,/rel="canonical" href="https:\/\/jester-quotes\.vercel\.app\/lab\/"/);
  for(const id of IDs){
    assert.ok(html.includes(`id="lab-tab-${id}"`),id);
    assert.ok(html.includes(`id="lab-panel-${id}"`),id);
    assert.ok(html.includes(`data-lab-tab="${id}"`),id);
    assert.ok(html.includes(`data-theme="${id}"`),id);
    assert.ok(html.includes(`aria-controls="lab-panel-${id}"`),id);
  }
  assert.ok(html.includes('role="tablist"'));
  assert.equal([...html.matchAll(/role="tabpanel"/g)].length,3);
  assert.ok(html.includes('data-theme="neo-brutalist"'));
  assert.ok(html.includes('data-theme="velvet-gallery"'));
  assert.ok(html.includes('data-theme="midnight-carnival"'));
  assert.match(html,/id="lab-panel-neo-brutalist"[^>]*hidden/);
  assert.match(html,/id="lab-panel-velvet-gallery"[^>]*hidden/);
  assert.ok(!read('dist/sitemap.xml').includes('/lab/'),'experiment must not appear in sitemap');
  assert.ok(!read('src/components/SiteHeader.astro').includes('href="/lab/"'),'experiment must not be public nav');
});

test('each visual composition is structurally different and uses real quote actions',()=>{
  const html=read('dist/lab/index.html');
  const layouts=[
    ['EditorialLayout.astro','lab-editorial-hero','lab-editorial-portrait','lab-quote-grid--editorial'],
    ['BrutalistLayout.astro','lab-brutalist-hero','lab-brutalist-symbol','lab-quote-grid--brutalist'],
    ['BentoLayout.astro','lab-gallery-hero','lab-gallery-statement','lab-quote-grid--bento']
  ];
  for(const [file,hero,art,grid] of layouts){
    const source=read('src/design/layouts/'+file);
    for(const hook of [hero,art,grid])assert.ok(source.includes(hook),file+':'+hook);
    assert.match(source,/QuoteCard quote=\{samples\[0\]\} index=\{0\}/);
    assert.match(source,/QuoteCard quote=\{samples\[1\]\} index=\{3\}/);
    assert.match(source,/QuoteCard quote=\{samples\[2\]\} index=\{5\}/);
    assert.match(source,/labThemeStyle\(theme\)/);
  }
  assert.equal([...html.matchAll(/class="[^"]*quote-card--/g)].length,9);
  assert.equal([...html.matchAll(/class="[^"]*favorite-toggle/g)].length,9);
  assert.equal([...html.matchAll(/class="[^"]*copy-quote/g)].length,9);
  assert.equal([...html.matchAll(/class="[^"]*card-create-link/g)].length,9);
  for(const id of IDs)assert.ok(html.includes(`data-lab-panel="${id}"`));
  assert.ok(html.includes('/images/midnight-carnival-hero-4x5.png'));
  assert.ok(existsSync(path.join(root,'public/images/midnight-carnival-hero-4x5.png')));
});

test('Lab switcher supports keyboard focus, no persistence and reduced-motion behavior',()=>{
  const script=read('src/scripts/theme-lab.ts');
  const css=read('src/styles/design-variants.css');
  for(const name of ['ArrowRight','ArrowLeft','Home','End','aria-selected','data-lab-panel']){
    assert.ok(script.includes(name),name);
  }
  assert.match(script,/panel\.hidden=panel\.dataset\.labPanel!==id/);
  assert.match(script,/event\.preventDefault\(\)/);
  assert.ok(!script.includes('localStorage')&&!script.includes('fetch('));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(css.includes('max-width:560px'));
  assert.ok(css.includes('max-width:370px'));
  for(const name of ['.lab-editorial-hero','.lab-brutalist-hero','.lab-gallery-hero']){
    assert.ok(css.includes(name),name);
  }
  assert.ok(css.includes('grid-template-columns'));
  assert.ok(css.includes('font-size:'));
  assert.ok(read('src/pages/lab/index.astro').includes("import '../../scripts/quote-explorer.ts'") ||
    read('src/pages/lab/index.astro').includes('<script src="../../scripts/quote-explorer.ts">'));
});
