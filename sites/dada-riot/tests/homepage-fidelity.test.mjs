import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const collections = JSON.parse(read('src/data/collections.json'));
const quotes = JSON.parse(read('src/data/jester-quotes.json')).items;

test('Reference homepage uses functional search and a compact canonical feature',()=>{
 const home=read('src/pages/index.astro');
 const strip=read('src/components/DadaSearchStrip.astro');
 const broadside=read('src/components/FeaturedQuote.astro');
 assert.match(home,/<DadaSearchStrip\s*\/>/);
 assert.match(home,/<FeaturedQuote quote={featured}\s*\/>/);
 assert.ok(quotes.some(q=>q.id==='jester-quote-006'&&q.quote.length<130));
 assert.match(strip,/action="\/search\/"/);
 assert.match(strip,/name="q"/);
 for(const action of ['favorite-toggle','copy-quote','/studio/?quote=','/quotes/']) {
   assert.ok(broadside.includes(action),action);
 }
});
test('Homepage shows exactly six canonical artwork-driven collection links',()=>{
 const component=read('src/components/CollectionsTeaser.astro');
 assert.match(component,/collections\.map\(/);
 assert.ok(!component.includes('collections.slice(0, 3)'));
 assert.equal(collections.length,6);
 for(const coll of collections)assert.match(coll.slug,/^[a-z0-9-]+$/);
 assert.match(component,/collectionArtworkPath\(collection.slug\)/);
});
test('Two real promo destinations and responsive collage layout',()=>{
 const promo=read('src/components/DadaStudioArchive.astro');
 const css=read('src/styles/dada-home-fidelity.css');
 for(const href of ['/studio/?theme=dada','/quotes/'])assert.ok(promo.includes('href="'+href+'"'));
 for(const selector of ['.dada-search-strip','.feature-broadside','.dada-cover-grid','.dada-promo-row','max-width:480px','prefers-reduced-motion:reduce'])assert.ok(css.includes(selector));
});
