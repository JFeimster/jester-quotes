import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(path.join(root,p),'utf8');
test('homepage is a gateway and complete quote archive is a dedicated working route',()=>{
  const home=read('dist/index.html');
  const archive=read('dist/quotes/index.html');
  assert.match(home,/id="explore"/);
  const gateway=home.match(/<section class="carnival-gateway"[\s\S]*?<\/section>/)?.[0];
  assert.ok(gateway);
  assert.equal([...gateway.matchAll(/class="gateway-kicker"/g)].length,4);
  for(const href of ['/quotes/','/tricksters/','/videos/','/resources/'])
    assert.ok(gateway.includes('href="'+href+'"'),href);
  assert.ok(!/\b(?:100|11|26|21|87)\b/.test(gateway),'Gateway cards do not display totals');
  assert.ok(home.includes('href="/search/"')&&home.includes('href="/studio/"'));
  assert.equal([...archive.matchAll(/data-variant="(?:compact|editorial|poster)"/g)].length,100);
  for(const id of ['quote-search','quote-gallery','favorites-filter','clear-filters','favorites-summary'])
    assert.ok(archive.includes('id="'+id+'"'),id);
  assert.ok(!home.includes('id="quote-gallery"'),'Keep full gallery on archive page');
  assert.ok(home.includes('data-quote-ids='),'Surprise Me still has the quote pool');
});
test('cross-content links target existing media and resource card anchors',()=>{
  const videos=JSON.parse(read('src/data/videos.json'));
  const resources=JSON.parse(read('src/data/resources.json'));
  const videoPage=read('dist/videos/index.html');
  const resourcePage=read('dist/resources/index.html');
  for(const item of videos)assert.ok(videoPage.includes('id="'+item.id+'"'),item.id);
  for(const item of resources)assert.ok(resourcePage.includes('id="'+item.id+'"'),item.id);
  assert.ok(videoPage.includes('href="/resources/#resource-'));
  assert.ok(resourcePage.includes('href="/videos/#video-'));
  const trickster=read('dist/tricksters/anansi/index.html');
  assert.ok(trickster.includes('/videos/#') || trickster.includes('/resources/#'));
});
test('unified index includes all five site categories with safe internal destinations',()=>{
  const index=JSON.parse(read('dist/search-index.json'));
  const quotes=JSON.parse(read('src/data/jester-quotes.json')).items;
  const videos=JSON.parse(read('src/data/videos.json'));
  const resources=JSON.parse(read('src/data/resources.json'));
  const tricksters=JSON.parse(read('src/data/tricksters.json'));
  const collections=JSON.parse(read('src/data/collections.json'));
  assert.equal(index.length,quotes.length+videos.length+resources.length+tricksters.length+collections.length);
  assert.equal(new Set(index.map(item=>item.id)).size,index.length);
  for(const kind of ['quotes','tricksters','videos','resources','collections'])
    assert.ok(index.some(item=>item.kind===kind),kind);
  for(const item of index){
    assert.ok(item.href.startsWith('/')&&!item.href.startsWith('//'),item.id);
    assert.ok(item.title&&item.searchText&&item.summary,item.id);
  }
  const html=read('dist/search/index.html');
  for(const id of ['site-search-form','site-search-input','site-search-results','site-search-status'])
    assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.includes('name="robots" content="noindex, follow"'));
  assert.ok(existsSync(path.join(root,'dist/quotes/index.html')));
});
