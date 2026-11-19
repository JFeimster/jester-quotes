import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(path.join(root,p),'utf8');
test('canonical editorial JSON mirrors Dada Riot without drift',()=>{
 for(const filename of ['jester-branding-guide.json','jester-editorial-voice.json','jester-brands.json','archetypes.json','jesters-in-media.json','jesters-in-media-images.json','jesters-in-media-notes.json']){
   assert.equal(read('src/data/'+filename),read('sites/dada-riot/src/data/'+filename),filename);
 }
});
test('industry brand profiles distinguish published evidence from draft leads',()=>{
 const brands=JSON.parse(read('src/data/jester-brands.json'));
 assert.equal(brands.length,37);
 assert.equal(brands.filter(b=>b.publication_status==='published').length,13);
 assert.equal(new Set(brands.map(b=>b.id)).size,brands.length);
 for(const brand of brands){
   assert.ok(brand.industry_vertical && brand.brand_category && brand.summary && brand.description);
   assert.notEqual(brand.summary,brand.description);
   assert.ok(brand.jester_characteristics.length>0);
   assert.ok(!('verification_status' in brand));
   if(brand.publication_status==='published')assert.ok(brand.sources.length>0&&brand.evidence_status==='source_attributed');
   else assert.equal(brand.evidence_status,'research_candidate');
   if(brand.video)assert.equal(brand.video.url,'https://www.youtube.com/watch?v='+brand.video.video_id);
 }
});
test('new public routes and cards are generated on primary site',()=>{
 for(const route of ['jester-branding','jester-brands','archetypes','archetypes/jester','jesters-in-media']){
   assert.ok(existsSync(path.join(root,'dist',route,'index.html')),route);
 }
 const brands=read('dist/jester-brands/index.html');
 assert.ok(brands.includes('id="jb-query"')&&brands.includes('id="jb-vertical"'));
 assert.ok(!brands.includes('Follow the thread'));
 assert.ok(!brands.includes('historical_examples'));
 assert.ok(read('dist/about/index.html').includes('The Jester Code'));
 assert.ok(read('dist/sitemap.xml').includes('https://jester-quotes.vercel.app/jester-branding/'));
});
