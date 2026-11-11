import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>readFileSync(path.join(root,name),'utf8');
const registry=JSON.parse(read('src/data/jester-quotes.json'));
const quotes=registry.items;
const known=new Set(quotes.map(q=>q.id));
async function loadTypeScript(relativePath) {
  const text=read(relativePath);
  const js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}

test('daily rotation is deterministic on the UTC calendar and handles invalid dates',async()=>{
  const d=await loadTypeScript('src/lib/daily-quote.ts');
  const ids=quotes.map(q=>q.id);
  const key='2026-11-10';
  assert.equal(d.utcDayKey(key),key);
  assert.equal(d.dailyQuoteId(ids,key),d.dailyQuoteId(ids,'2026-11-10T23:30:00Z'));
  assert.equal(d.dailyQuoteId(ids,key),d.dailyQuoteId(ids,'2026-11-11T01:30:00+02:00'));
  assert.equal(d.dailyQuoteId(ids,key),d.dailyQuoteId(ids,'2026-11-09T19:30:00-05:00'));
  assert.ok(known.has(d.dailyQuoteId(ids,key)));
  assert.equal(d.utcDayKey('2026-02-30'),null);
  assert.equal(d.utcDayKey('2025-02-29'),null);
  assert.equal(d.utcDayKey('not a date'),null);
  assert.equal(d.utcDayKey(new Date(NaN)),null);
  assert.equal(d.dailyQuoteId(ids,'invalid'),null);
  assert.equal(d.dailyQuoteId([],key),null);
  assert.notEqual(d.dailyQuoteId(ids,key),d.dailyQuoteId(ids,'2026-11-11'));
});

test('favorites JSON backup/import supports version 1 and rejects invalid or duplicate IDs',async()=>{
  const v=await loadTypeScript('src/lib/saved-library.ts');
  assert.deepEqual(v.validateFavoritesImport('["jester-quote-002","jester-quote-001"]',known),['jester-quote-002','jester-quote-001']);
  const exported=v.exportFavorites(['jester-quote-003','jester-quote-007'],known,new Date('2026-11-10T09:00:00Z'));
  assert.deepEqual(v.validateFavoritesImport(exported,known),['jester-quote-003','jester-quote-007']);
  assert.equal(JSON.parse(exported).version,1);
  for(const bad of [
    '{broken',
    '{"version":2,"quote_ids":["jester-quote-001"]}',
    '{"version":1,"quote_ids":["does-not-exist"]}',
    '{"version":1,"quote_ids":["jester-quote-001","jester-quote-001"]}',
    '{"version":1,"quote_ids":[42]}',
    '{"version":1,"quote_ids":"jester-quote-001"}',
    '"jester-quote-001"',
    '["jester-quote-001",null]'
  ]) assert.throws(()=>v.validateFavoritesImport(bad,known));
  assert.throws(()=>v.exportFavorites(['does-not-exist'],known));
  assert.throws(()=>v.exportFavorites(['jester-quote-001','jester-quote-001'],known));
  assert.throws(()=>v.validateFavoritesImport(' '.repeat(70000),known));
});

test('saved quote filtering respects existing storage insertion order and author sort',async()=>{
  const v=await loadTypeScript('src/lib/saved-library.ts');
  const chosen=[quotes[7],quotes[0],quotes[15]];
  const saved=new Set(chosen.map(q=>q.id));
  const recent=v.filterSavedQuotes(quotes,saved,'','recent');
  assert.deepEqual(recent.map(q=>q.id),[chosen[2].id,chosen[1].id,chosen[0].id]);
  const original=v.filterSavedQuotes(quotes,saved,'','original');
  assert.deepEqual(original.map(q=>q.id),[chosen[1].id,chosen[0].id,chosen[2].id]);
  const author=v.filterSavedQuotes(quotes,saved,'','author');
  assert.deepEqual(author.map(q=>q.person),[...chosen].map(q=>q.person).sort((a,b)=>a.localeCompare(b)));
  assert.equal(v.filterSavedQuotes(quotes,saved,'unmatched nonsense','recent').length,0);
  assert.equal(v.MAX_SHARE_PACK_QUOTES,5);
});

test('daily and saved routes use the canonical quote registry with private shelf noindex',()=>{
  const daily=read('dist/daily/index.html');
  const saved=read('dist/saved/index.html');
  const xml=read('dist/sitemap.xml');
  assert.ok(daily.includes('rel="canonical" href="https://jester-quotes.vercel.app/daily/"'));
  assert.ok(xml.includes('https://jester-quotes.vercel.app/daily/'));
  assert.ok(!xml.includes('/saved/'),'personalized localStorage shelf must not be indexed in sitemap');
  assert.ok(saved.includes('name="robots" content="noindex, follow"'));
  for(const hook of ['daily-quote-text','daily-utc-date','daily-save','daily-copy','daily-detail','daily-studio','daily-random-trickster','daily-status']) {
    assert.ok(daily.includes(`id="${hook}"`),hook);
  }
  for(const hook of ['saved-search','saved-sort','saved-export','saved-import-file','saved-clear','saved-pack-download','saved-pack-theme','saved-pack-format','saved-gallery','saved-status']) {
    assert.ok(saved.includes(`id="${hook}"`),hook);
  }
  assert.equal([...saved.matchAll(/data-saved-id="jester-quote-\d{3}"/g)].length,100);
  assert.equal([...saved.matchAll(/class="saved-pick-input"/g)].length,100);
  assert.ok(saved.includes('href="/sources/"'));
  assert.equal(registry.items.length,100);
});

test('complete artwork share packs reuse image engine and contain per-quote rights notes',()=>{
  const pack=read('src/lib/artwork/share-pack.ts');
  const shelf=read('src/scripts/saved-library.ts');
  assert.match(pack,/planArtwork\(ctx/);
  assert.match(pack,/drawArtwork\(ctx,plan,slide\)/);
  assert.match(pack,/makeUncompressedZip\(entries\)/);
  assert.match(pack,/RIGHTS-AND-ATTRIBUTIONS\.txt/);
  assert.match(pack,/Attribution is NOT a copyright license/);
  assert.match(pack,/selections\.length>5/);
  assert.match(shelf,/validateFavoritesImport\(await file\.text\(\),known\)/);
  assert.match(shelf,/window\.confirm/);
  assert.match(shelf,/FAVORITES_STORAGE_KEY/);
  assert.match(shelf,/downloadSharePack/);
  assert.ok(!pack.includes('fetch(') && !shelf.includes('fetch('));
});

test('deterministic related links never invent direct quote-to-Trickster attributions',()=>{
  const related=read('src/lib/related-content.ts');
  const component=read('src/components/RelatedItems.astro');
  const html=read('dist/quotes/jester-quote-016/index.html');
  assert.match(related,/quoteIds\.includes\(id\)/);
  assert.match(related,/related_collection_slugs\.some/);
  assert.match(related,/related_quote_ids\.includes\(id\)/);
  assert.match(related,/verification_status === 'verified'/);
  assert.ok(component.includes('They do not imply the quoted author'));
  assert.ok(html.includes('Curated connections') || html.includes('Download complete quote artwork'));
  assert.ok(html.includes('href="/studio/?quote=jester-quote-016"'));
  assert.ok(existsSync(path.join(root,'src/pages/saved.astro')));
  assert.ok(existsSync(path.join(root,'src/pages/daily.astro')));
});
