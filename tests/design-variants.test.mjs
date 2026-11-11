import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../', import.meta.url));
const read=p=>readFileSync(path.join(root,p),'utf8');
const quoteRegistry=JSON.parse(read('src/data/jester-quotes.json'));
const quotes=new Map(quoteRegistry.items.map(q=>[q.id,q]));
const IDs=['midnight-carnival','neo-brutalist','velvet-gallery','dada-riot','neon-trickster','impossible-court','forbidden-library','riot-press'];
const files=Object.fromEntries(IDs.map(id=>[id,'src/design/themes/'+id+'.ts']));
const layouts=[
  ['EditorialLayout.astro','lab-editorial-hero','lab-editorial-portrait','lab-quote-grid--editorial'],
  ['BrutalistLayout.astro','lab-brutalist-hero','lab-brutalist-symbol','lab-quote-grid--brutalist'],
  ['BentoLayout.astro','lab-gallery-hero','lab-gallery-statement','lab-quote-grid--bento'],
  ['DadaRiotLayout.astro','lab-dada-hero','lab-dada-collage','lab-quote-grid--dada'],
  ['NeonTricksterLayout.astro','lab-neon-hero','lab-neon-hologram','lab-quote-grid--neon'],
  ['ImpossibleCourtLayout.astro','lab-court-hero','lab-court-stage','lab-quote-grid--court'],
  ['ForbiddenLibraryLayout.astro','lab-library-hero','lab-library-scene','lab-quote-grid--library'],
  ['RiotPressLayout.astro','riot-hero','riot-hero-art','lab-quote-grid--riot']
];

test('eight unique theme contracts reference only canonical 100-quote records',()=>{
  assert.equal(quotes.size,100);
  for(const id of IDs){
    const spec=read(files[id]);
    assert.match(spec,new RegExp(`id:\\s*['\"]${id}['\"]`),id);
    assert.match(spec,/sampleQuoteIds:/);
    const match=spec.match(/sampleQuoteIds:\s*\[([^\]]+)\]/);
    assert.ok(match,id);
    const quotedIds=[...match[1].matchAll(/jester-quote-\d{3}/g)].map(m=>m[0]);
    assert.equal(quotedIds.length,3,id);
    assert.equal(new Set(quotedIds).size,3,id);
    quotedIds.forEach(q=>assert.ok(quotes.has(q),`${id}: unknown quote ${q}`));
  }
  const registry=read('src/design/theme-registry.ts');
  for(const name of ['midnightCarnival','neoBrutalist','velvetGallery','dadaRiot','neonTrickster','impossibleCourt','forbiddenLibrary','riotPress'])
    assert.ok(registry.includes(name),name);
  assert.match(registry,/labThemeStyle/);
  assert.match(registry,/Duplicate design Lab theme id/);
  assert.ok(!existsSync(path.join(root,'src/data/lab-quotes.json')));
});

test('/lab/ renders exactly eight unique accessible panels and stays unindexed',()=>{
  const html=read('dist/lab/index.html');
  assert.match(html,/name="robots" content="noindex, nofollow"/);
  assert.match(html,/rel="canonical" href="https:\/\/jester-quotes\.vercel\.app\/lab\/"/);
  for(const id of IDs){
    assert.ok(html.includes(`id="lab-tab-${id}"`),id);
    assert.ok(html.includes(`id="lab-panel-${id}"`),id);
    assert.ok(html.includes(`data-lab-tab="${id}"`),id);
    assert.ok(html.includes(`data-theme="${id}"`),id);
    assert.ok(html.includes(`aria-controls="lab-panel-${id}"`),id);
    assert.ok(html.includes(`aria-labelledby="lab-tab-${id}"`),id);
  }
  assert.ok(html.includes('role="tablist"'));
  assert.equal([...html.matchAll(/role="tabpanel"/g)].length,IDs.length);
  for(const id of IDs.slice(1))assert.match(html,new RegExp(`id="lab-panel-${id}"[^>]*hidden`));
  assert.ok(!read('dist/sitemap.xml').includes('/lab/'),'lab must not appear in sitemap');
  assert.ok(!read('src/components/SiteHeader.astro').includes('href="/lab/"'),'experiment must not be in public nav');
});

test('all eight compositions have distinct hero artwork treatments and reuse real quote actions',()=>{
  const html=read('dist/lab/index.html');
  for(const [file,hero,art,grid] of layouts){
    const source=read('src/design/layouts/'+file);
    for(const hook of [hero,art,grid])assert.ok(source.includes(hook),file+':'+hook);
    assert.match(source,/QuoteCard quote=\{samples\[0\]\} index=\{0\}/);
    assert.match(source,/QuoteCard quote=\{samples\[1\]\} index=\{3\}/);
    assert.match(source,/QuoteCard quote=\{samples\[2\]\} index=\{5\}/);
    assert.match(source,/labThemeStyle\(theme\)/);
  }
  for(const selector of ['quote-card--','favorite-toggle','copy-quote','card-create-link']){
    assert.equal([...html.matchAll(new RegExp('class="[^"]*'+selector,'g'))].length,IDs.length*3,selector);
  }
  assert.ok(html.includes('/assets/images/heroes/midnight-carnival-hero-4x5.png'));
  assert.ok(existsSync(path.join(root,'public/assets/images/heroes/midnight-carnival-hero-4x5.png')));
});

test('new worlds are visually distinct in their own scoped responsive styles',()=>{
  const css=read('src/styles/lab-new-themes.css');
  for(const cls of ['lab-dada-paper','lab-dada-collage','lab-neon-hologram','lab-neon-orbit','lab-court-arch','lab-court-floor','lab-library-shelf','lab-library-manuscript'])
    assert.ok(css.includes('.'+cls),cls);
  for(const kind of ['dada','neon','court','library'])
    assert.ok(css.includes('lab-composition--'+kind),kind);
  for(const width of ['max-width:860px','max-width:650px','max-width:410px'])
    assert.ok(css.includes(width),width);
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(!css.includes('url(http'),'No external images or font fetches for the design lab');
  const hybrid=read('src/styles/riot-press.css');
  assert.ok(hybrid.includes('.riot-hero-grid'));
  assert.ok(hybrid.includes('.riot-press .quote-card'));
  assert.ok(hybrid.includes('prefers-reduced-motion:reduce'));
  assert.ok(!hybrid.includes('url(http'));

});

test('Lab keyboard switcher remains storage-free and uses the eight-tab interface',()=>{
  const script=read('src/scripts/theme-lab.ts');
  const css=read('src/styles/design-variants.css');
  for(const name of ['ArrowRight','ArrowLeft','Home','End','aria-selected','data-lab-panel'])
    assert.ok(script.includes(name),name);
  assert.match(script,/panel\.hidden=panel\.dataset\.labPanel!==id/);
  assert.match(script,/event\.preventDefault\(\)/);
  assert.ok(!script.includes('localStorage')&&!script.includes('fetch('));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(css.includes('max-width:560px'));
  assert.ok(css.includes('max-width:370px'));
  assert.ok(read('src/pages/lab/index.astro').includes("import '../../styles/lab-new-themes.css'"));
  assert.ok(read('src/pages/lab/index.astro').includes("import '../../scripts/quote-explorer.ts'") ||
    read('src/pages/lab/index.astro').includes('<script src="../../scripts/quote-explorer.ts">'));
});
