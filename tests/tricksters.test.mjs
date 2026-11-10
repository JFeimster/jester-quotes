import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(path.join(root,p),'utf8');
const source=JSON.parse(read('src/data/tricksters.json'));
const quotes=JSON.parse(read('src/data/jester-quotes.json'));
const collections=JSON.parse(read('src/data/collections.json'));
const slugs=new Set(collections.map(c=>c.slug));
const availableKinds=new Set(['folklore','deity','culture-hero','literary']);
const availableMedia=new Set(['oral-tradition','mythology','literature']);
const sourceUrl='https://www.aadip.com/trickster/';
const candidates=read('data/trickster-candidates.csv');

test('the published registry contains only independently sourced and verified original profiles',()=>{
  assert.equal(source.length,11);
  assert.equal(new Set(source.map(x=>x.id)).size,source.length,'IDs unique');
  assert.equal(new Set(source.map(x=>x.slug)).size,source.length,'Slugs unique');
  assert.equal(new Set(source.map(x=>x.source_list_number).filter(Number.isInteger)).size,
    source.map(x=>x.source_list_number).filter(Number.isInteger).length,'Research ordinal unique');
  for(const record of source){
    assert.match(record.id,/^trickster-[a-z0-9-]+$/);
    assert.equal(record.id,`trickster-${record.slug}`);
    assert.match(record.slug,/^[a-z0-9-]+$/);
    assert.equal(record.verification_status,'verified');
    assert.equal(record.verified_at,'2026-11-10');
    assert.ok(availableKinds.has(record.kind),record.slug);
    assert.ok(record.media.length && record.media.every(m=>availableMedia.has(m)),record.slug);
    assert.ok(record.tags.length && new Set(record.tags).size===record.tags.length,record.slug);
    assert.ok(record.name && record.description.length>=95 && record.culture_or_origin.length>=10,record.slug);
    assert.equal(record.image,null,'Third-party source images must not be used without verified licenses');
    assert.ok(record.sources.length>=1,record.slug);
    assert.ok(record.related_collection_slugs.every(slug=>slugs.has(slug)),record.slug);
    for(const source of record.sources){
      assert.ok(source.title && source.publisher && source.url,record.slug);
      const uri=new URL(source.url);
      assert.equal(uri.protocol,'https:',source.url);
      assert.ok(uri.hostname && !uri.hostname.includes('example.com'),source.url);
      assert.notEqual(uri.href,sourceUrl,'Research leads are not independent verification');
    }
  }
  assert.deepEqual(quotes.items.map(x=>x.id).slice(0,3),['jester-quote-001','jester-quote-002','jester-quote-003']);
});

test('verified CSV export and candidate queue are separate from published JSON',()=>{
  const csv=read('data/tricksters.csv').trim().split('\n');
  assert.equal(csv.length,source.length+1,'one export row per verified entry');
  assert.ok(csv[0].includes('verification_status') && csv[0].includes('source_urls'));
  for(const record of source){
    assert.ok(csv.some(row=>row.includes(`"${record.id}"`)),record.id);
  }
  const researchRows=candidates.trim().split('\n');
  assert.equal(researchRows.length,7,'6 unpublished research leads plus header');
  for(const row of researchRows.slice(1)) {
    assert.ok(row.includes('"research_required"'));
    assert.ok(row.includes(sourceUrl));
  }
  const candidateNames=['Iktomi','Kitsune','Puck','Tengu','Ame-no-Uzume-no-Mikoto','Set'];
  for(const name of candidateNames){
    assert.ok(candidates.includes(name));
    assert.ok(!source.some(record=>record.name===name),`Unverified candidate published: ${name}`);
  }
});

test('directory page has functioning filter/empty-state/random hooks and all verified links',()=>{
  const html=read('dist/tricksters/index.html');
  for(const hook of ['trickster-search','trickster-kind','trickster-medium','trickster-tag','trickster-reset',
    'trickster-grid','trickster-count','trickster-empty','trickster-random','trickster-status']) {
    assert.ok(html.includes(`id="${hook}"`),hook);
  }
  for(const record of source){
    assert.ok(html.includes(`href="/tricksters/${record.slug}/"`),record.slug);
    assert.ok(html.includes(`data-kind="${record.kind}"`),record.slug);
  }
  assert.equal([...html.matchAll(/<article[^>]*data-kind="[^"]+"/g)].length,source.length);
  const client=read('src/scripts/trickster-explorer.ts');
  assert.match(client,/\.includes\(query\)/);
  assert.match(client,/card\.hidden = !matches/);
  assert.match(client,/window\.location\.assign/);
  for(const candidate of ['Iktomi','Kitsune','Puck','Tengu']){
    assert.ok(!html.includes(candidate),`No unverified research candidate: ${candidate}`);
  }
});

test('all verified profile pages have full source references, canonical and original text',()=>{
  for(const record of source){
    const target=`dist/tricksters/${record.slug}/index.html`;
    assert.ok(existsSync(path.join(root,target)),target);
    const html=read(target);
    assert.ok(html.includes(`rel="canonical" href="https://jester-quotes.vercel.app/tricksters/${record.slug}/"`),record.slug);
    assert.ok(html.includes(record.description.replaceAll('&','&amp;').replaceAll('"','&quot;').slice(0,38)),record.slug);
    for(const source of record.sources){
      assert.ok(html.includes(source.url.replaceAll('&','&amp;')), `${record.slug}: ${source.url}`);
    }
    assert.ok(html.includes('href="/tricksters/"'),record.slug);
    assert.ok(html.includes('NO UNLICENSED ARTWORK'),record.slug);
  }
});

test('site navigation, policy and CSS cover the directory without modifying quote registry',()=>{
  const nav=read('src/components/SiteHeader.astro');
  const sourcePage=read('dist/sources/index.html');
  const css=read('src/styles/tricksters.css');
  assert.match(nav,/href="\/tricksters\/"/);
  assert.ok(sourcePage.includes('Aadip Desai'));
  assert.ok(sourcePage.includes('139 numbered research leads'));
  assert.ok(css.includes('@media(max-width:680px)'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(read('README.md').includes('data/trickster-candidates.csv'));
  assert.ok(read('CREDITS.md').includes('Trickster Directory'));
});
