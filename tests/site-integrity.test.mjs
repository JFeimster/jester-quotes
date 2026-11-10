import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=path.join(root,'dist');
const read=p=>readFileSync(path.join(root,p),'utf8');
function htmlFiles(dir){
  return readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
    const p=path.join(dir,item.name);
    return item.isDirectory()?htmlFiles(p):item.name.endsWith('.html')?[p]:[];
  });
}
function localAsset(href){
  const value=href.trim();
  if(!value||value[0]==='#'||value.startsWith('mailto:')||value.startsWith('tel:')||value.startsWith('data:'))return null;
  let url;
  try {url=new URL(value,'https://jester-quotes.vercel.app');}
  catch {throw new Error('Invalid URL in built page: '+value);}
  if(url.origin!=='https://jester-quotes.vercel.app')return null;
  const pathname=decodeURIComponent(url.pathname);
  if(pathname.includes('..'))throw new Error('Unsafe route: '+pathname);
  if(pathname.endsWith('/'))return path.join(dist,pathname,'index.html');
  const file=path.join(dist,pathname);
  if(existsSync(file))return file;
  return path.join(dist,pathname,'index.html');
}

test('all rendered static internal links and image sources point to real build output',()=>{
  const html=htmlFiles(dist);
  assert.ok(html.length>=125,'Expected full static site build');
  let links=0;
  for(const file of html){
    const content=readFileSync(file,'utf8');
    const references=[...content.matchAll(/<(?:a|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)];
    for(const [,href] of references){
      if(href.includes('&amp;')){/* URLs with encoded queries are parsed by URL below. */}
      const target=localAsset(href.replaceAll('&amp;','&'));
      if(target){
        assert.ok(existsSync(target),`${path.relative(dist,file)}: missing ${href}`);
        links++;
      }
    }
    for(const image of content.matchAll(/<img\b[^>]*>/g)){
      assert.match(image[0],/\balt="/,`Missing alt on ${path.relative(dist,file)}`);
    }
  }
  assert.ok(links>900,'Internal link inspection should cover actual quote and directory cards');
});

test('sitemap, canonical, noindex and robots describe the intended public surface',()=>{
  const sitemap=read('dist/sitemap.xml');
  const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  assert.equal(new Set(urls).size,urls.length);
  assert.ok(urls.includes('https://jester-quotes.vercel.app/daily/'));
  assert.ok(!urls.includes('https://jester-quotes.vercel.app/saved/'));
  assert.ok(!urls.includes('https://jester-quotes.vercel.app/lab/'));
  assert.ok(read('dist/saved/index.html').includes('name="robots" content="noindex, follow"'));
  assert.ok(read('dist/lab/index.html').includes('name="robots" content="noindex, nofollow"'));
  assert.equal(existsSync(path.join(root,'public/robots.txt')),false);
  assert.ok(existsSync(path.join(root,'src/pages/robots.txt.ts')));
  assert.ok(read('dist/robots.txt').includes('https://jester-quotes.vercel.app/sitemap.xml'));
  for(const url of urls){
    const target=localAsset(url);
    assert.ok(target && existsSync(target),'Sitemap route missing from build: '+url);
    const doc=readFileSync(target,'utf8');
    assert.ok(doc.includes('rel="canonical" href="'+url+'"'),'Canonical mismatch '+url);
  }
});

test('quote artwork paths, imported art and optional video hosting retain canonical locations',()=>{
  const registry=JSON.parse(read('src/data/jester-quotes.json'));
  const asset=JSON.parse(read('src/data/image-assets.json'));
  assert.equal(registry.items.length,100);
  for(const quote of registry.items){
    assert.ok(existsSync(path.join(dist,'social/quotes',quote.id+'.png')),quote.id);
  }
  assert.ok(existsSync(path.join(dist,'assets/images/heroes/midnight-carnival-hero-16x9.png')));
  assert.ok(existsSync(path.join(root,'src/assets/jester-hero.svg')));
  assert.ok(!existsSync(path.join(root,'public/images')),'Legacy public/images directory should stay retired');
  assert.equal(existsSync(path.join(root,'public/videos')),false,'YouTube directory must not rehost downloaded videos');
  assert.ok(asset.every(x=>x.path.startsWith('/assets/')),'Asset registry paths must be absolute public paths');
});

test('published editorial records have non-placeholder provenance and unique IDs',()=>{
  const tricksters=JSON.parse(read('src/data/tricksters.json'));
  const resources=JSON.parse(read('src/data/resources.json'));
  const videos=JSON.parse(read('src/data/videos.json'));
  for(const [type,records] of [['tricksters',tricksters],['resources',resources],['videos',videos]]){
    assert.equal(new Set(records.map(r=>r.id)).size,records.length,type+' duplicate IDs');
    assert.equal(new Set(records.map(r=>r.slug)).size,records.length,type+' duplicate slugs');
    for(const record of records){
      const sources=type==='tricksters'?record.sources.map(x=>x.url):[type==='videos'?record.youtube_url:record.url];
      assert.ok(sources.length,record.id);
      for(const source of sources){
        const url=new URL(source);
        assert.equal(url.protocol,'https:',record.id);
        assert.ok(!/^(example|localhost|test)\./.test(url.hostname),record.id);
      }
      assert.match(record.verified_at,/^20\d{2}-\d{2}-\d{2}$/,record.id);
      if(type==='tricksters')assert.equal(record.verification_status,'verified',record.id);
    }
  }
  for(const video of videos)assert.match(video.video_id,/^[a-zA-Z0-9_-]{11}$/);
});
