import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const json = file => JSON.parse(readFileSync(path.join(root,'src/data',file),'utf8'));
const read = file => readFileSync(path.join(root,file),'utf8');

test('edition registry has one Dada default and seven distinct rendered previews', () => {
  const editions = json('editions.json');
  assert.equal(editions.length,8);
  assert.deepEqual(editions.filter(item=>item.default).map(item=>item.id),['dada-riot']);
  assert.equal(new Set(editions.map(item=>item.slug)).size,8);
  for(const edition of editions.filter(item=>!item.default)) {
    assert.equal(edition.status,'preview');
    assert.equal(edition.indexing,'noindex');
    const html = read(`dist${edition.destination}index.html`);
    assert.match(html,/name="robots" content="noindex, nofollow"/);
    assert.match(html,new RegExp(`data-theme="${edition.id}"`));
    assert.ok(!read('dist/sitemap.xml').includes(`https://jester-quotes.vercel.app${edition.destination}`));
  }
});

test('research records retain provenance and hold brief characters as drafts', () => {
  const archetypes=json('archetypes.json'), media=json('jesters-in-media.json'), brands=json('jester-brands.json'), notes=json('jesters-in-media-notes.json');
  assert.deepEqual(archetypes.map(item=>item.slug),['clown','jester','fool','trickster']);
  assert.equal(media.length,24);
  assert.equal(media.filter(item=>item.publication_status==='published').length,15);
  assert.equal(media.filter(item=>item.publication_status==='draft').length,9);
  assert.equal(brands.length,4);
  assert.equal(notes.length,1);
  assert.equal(notes[0].kind,'editorial_note');
  const directory=read('dist/jesters-in-media/index.html');
  assert.ok(directory.includes('Fat Amy'));
  assert.ok(!directory.includes('id="puck"'));
  const quoteIds=new Set(json('jester-quotes.json').items.map(item=>item.id));
  const tricksterIds=new Set(json('tricksters.json').map(item=>item.id));
  const collectionSlugs=new Set(json('collections.json').map(item=>item.slug));
  for(const group of [archetypes,media,brands]) for(const item of group) {
    assert.ok(item.sources.every(url=>url.startsWith('https://')));
    assert.ok(item.related_quote_ids.every(id=>quoteIds.has(id)));
    assert.ok(item.related_trickster_ids.every(id=>tricksterIds.has(id)));
    assert.ok(item.related_collection_slugs.every(slug=>collectionSlugs.has(slug)));
  }
  for(const route of ['archetypes/','jesters-in-media/','jester-brands/','editions/']) assert.ok(existsSync(path.join(root,'dist',route,'index.html')));
});
