import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(path.join(root, file),'utf8');
const resources=JSON.parse(read('src/data/resources.json'));
const videos=JSON.parse(read('src/data/videos.json'));
const tricksters=JSON.parse(read('src/data/tricksters.json'));
const validTricksters=new Set(tricksters.map(e=>e.id));
const validResourceTypes=new Set(['reference','article','book','essay','podcast','organization','other']);
const idRegex=/^[A-Za-z0-9_-]{11}$/;

test('Resource Vault has original, verified publisher references and valid relationships',()=>{
  assert.equal(resources.length,9);
  assert.equal(new Set(resources.map(x=>x.id)).size,resources.length);
  assert.equal(new Set(resources.map(x=>x.slug)).size,resources.length);
  assert.equal(new Set(resources.map(x=>x.url)).size,resources.length);
  for(const resource of resources){
    assert.equal(resource.id,`resource-${resource.slug}`);
    assert.match(resource.slug,/^[a-z0-9-]+$/);
    assert.ok(resource.source_name && resource.title && resource.summary.length>80);
    assert.ok(validResourceTypes.has(resource.type));
    assert.equal(new URL(resource.url).protocol,'https:');
    assert.ok(!resource.url.includes('example.com')&&!resource.url.includes('placeholder'));
    assert.equal(resource.verified_at,'2026-11-10');
    assert.ok(Array.isArray(resource.tags) && resource.tags.length>0);
    assert.ok(resource.related_trickster_ids.every(id=>validTricksters.has(id)));
    assert.deepEqual(resource.related_quote_ids,[]);
  }
  assert.ok(resources.some(x=>x.source_name==='Library of Congress'));
  assert.ok(resources.some(x=>x.source_name==='UNESCO Intangible Cultural Heritage'));
  assert.equal(resources.filter(x=>x.featured).length,3);
});

test('Video Library has real YouTube URLs, correct credited channels and source evidence',()=>{
  assert.equal(videos.length,26);
  assert.equal(new Set(videos.map(x=>x.id)).size,videos.length);
  assert.equal(new Set(videos.map(x=>x.slug)).size,videos.length);
  assert.equal(new Set(videos.map(x=>x.video_id)).size,videos.length);
  const expected=new Set(['RW1ChiWyiZQ','6nWba9Ii5Lo','MTz2f9yjmK8','8Poklx9Ifz4','Xs-9vfWDJfU']);
  for(const video of videos){
    assert.equal(video.id,`video-${video.slug}`);
    assert.ok(idRegex.test(video.video_id));
    if (!video.playlist_id) assert.ok(expected.has(video.video_id),'Original video ID changed');
    else {
      assert.equal(video.playlist_id,'PLNVTCBFgR1Te-oB0QHlw_kUbfWQ46t_Pq');
      assert.ok(Number.isInteger(video.playlist_position) && video.playlist_position>=1 && video.playlist_position<=30);
    }
    assert.equal(video.youtube_url,`https://www.youtube.com/watch?v=${video.video_id}`);
    assert.ok(video.channel_title.trim().length>0);
    assert.ok(video.summary.length>80 && video.tags.length>0);
    assert.equal(video.verified_at,'2026-11-10');
    assert.ok(video.related_trickster_ids.every(id=>validTricksters.has(id)));
  }
  assert.ok(videos.some(x=>x.channel_title==='CrashCourse'));
  assert.ok(videos.some(x=>x.channel_title==='TED-Ed'));
  const snapshot=JSON.parse(read('data/playlist-joker-first30.json'));
  assert.equal(snapshot.entries.length,30);
  const included=new Set(videos.filter(x=>x.playlist_id===snapshot.playlist_id).map(x=>x.video_id));
  assert.equal(included.size,21);
  for(const item of snapshot.entries) {
    if(item.imported) assert.ok(included.has(item.video_id),'Missing playlist entry at '+item.position);
    else assert.ok(!included.has(item.video_id),'Unavailable source was added to playable registry');
  }
});

test('resource and video CSV archives match their canonical JSON record IDs',()=>{
  for(const [records,csv] of [[resources,'data/resources.csv'],[videos,'data/videos.csv']]){
    const lines=read(csv).trim().split('\n');
    assert.equal(lines.length,records.length+1);
    for(const entry of records) assert.ok(lines.some(line=>line.startsWith(JSON.stringify(entry.id)+',')),entry.id);
  }
});

test('Both public directories have working search/category/theme controls and real outbound links',()=>{
  const html=read('dist/resources/index.html');
  const page=read('dist/videos/index.html');
  for(const [document,rows,kind] of [[html,resources,'resources'],[page,videos,'videos']]){
    assert.ok(document.includes(`data-catalog="${kind}"`));
    for(const id of ['catalog-search','catalog-tag','catalog-reset','catalog-count','catalog-empty','catalog-grid']){
      assert.ok(document.includes(`id="${id}"`),id);
    }
    assert.ok(document.includes('href="/tricksters/'));
    assert.equal([...document.matchAll(/<article\b[^>]*\bdata-catalog-card\b/g)].length,rows.length);
    assert.ok(document.includes('href="/sources/"'));
  }
  assert.ok(html.includes('id="catalog-type"'));
  assert.ok(page.includes('id="catalog-channel"'));
  for(const entry of resources) assert.ok(html.includes(entry.url.replaceAll('&','&amp;')),entry.id);
  for(const entry of videos){
    assert.ok(page.includes(entry.youtube_url),entry.id);
    assert.ok(page.includes(`data-video-id="${entry.video_id}"`),entry.id);
  }
  assert.ok(html.includes('rel="canonical" href="https://jester-quotes.vercel.app/resources/"'));
  assert.ok(page.includes('rel="canonical" href="https://jester-quotes.vercel.app/videos/"'));
});

test('YouTube embed loads only on click and never downloads, autoplays, or proxies videos',()=>{
  const script=read('src/scripts/resource-filters.ts');
  const html=read('dist/videos/index.html');
  assert.match(script,/addEventListener\('click'/);
  assert.match(script,/youtube-nocookie\.com\/embed\//);
  assert.match(script,/stage\.replaceChildren\(iframe\)/);
  assert.ok(!script.includes('autoplay=1') && !html.includes('autoplay=1'));
  assert.ok(!html.includes('<iframe'), 'No YouTube iframe until user clicks');
  assert.ok(html.includes('Load player') && html.includes('Watch on YouTube'));
  assert.ok(!existsSync(path.join(root,'public/videos')),'No unauthorized local video files');
  assert.match(script,/card\.hidden = !match/);
  assert.match(script,/if \(empty\) empty\.hidden = visible !== 0/);
});

test('Navigation and editorial source descriptions document both new site sections',()=>{
  const menu=read('dist/index.html');
  const sitemap=read('dist/sitemap.xml');
  const sources=read('dist/sources/index.html');
  const css=read('src/styles/resource-vault.css');
  for(const url of ['/resources/','/videos/']){
    assert.ok(menu.includes(`href="${url}"`));
    assert.ok(sitemap.includes(`https://jester-quotes.vercel.app${url}`));
  }
  assert.ok(sources.includes('Resource Vault'));
  assert.ok(sources.includes('Video Library'));
  assert.ok(css.includes('@media(max-width:680px)'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
});
