import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { openLocalBrowser } from './support/browser-harness.mjs';

const paths=['/','/collections/','/collections/wise-fools/','/tricksters/','/tricksters/anansi/','/resources/','/videos/','/studio/','/daily/','/saved/','/lab/'];
function zipEntries(buffer){
  const names=[];let position=0;
  while(position+30<=buffer.length&&buffer.readUInt32LE(position)===0x04034b50){
    const size=buffer.readUInt32LE(position+18);
    const nameLength=buffer.readUInt16LE(position+26);
    const extra=buffer.readUInt16LE(position+28);
    const name=buffer.subarray(position+30,position+30+nameLength).toString('utf8');
    names.push(name);
    position+=30+nameLength+extra+size;
  }
  return names;
}

test('real headless Chrome exercises site routes, PNG/ZIP downloads and responsive UI', {timeout:160000}, async t=>{
  const app=await openLocalBrowser();
  if(!app){t.skip('Local Chrome unavailable: set CHROME_BIN to enable browser QA outside CI');return;}
  try{
    await app.viewport(1440,900);
    for(const route of paths){
      await app.navigate(route);
      const check=await app.eval(`({title:document.title,hasMain:!!document.querySelector('#main-content'),width:document.documentElement.scrollWidth,viewport:innerWidth,imagesWithoutAlt:document.querySelectorAll('img:not([alt])').length})`);
      assert.ok(check.title && check.hasMain,route+' missing basic semantics');
      assert.ok(check.width<=check.viewport+2,route+' desktop horizontal overflow: '+JSON.stringify(check));
      assert.equal(check.imagesWithoutAlt,0,route+' image missing alt attribute');
      assert.equal(app.page.exceptions.length,0,route+' uncaught browser errors: '+app.page.exceptions.join('; '));
    }

    await app.navigate('/studio/');
    await app.waitFor(`!!document.querySelector('[data-studio-format="portrait"]') && !document.querySelector('#studio-download').disabled`,'Studio loaded');
    await app.eval(`document.querySelector('[data-studio-format="portrait"]').click()`);
    await app.waitFor(`document.querySelector('#studio-format').value==='portrait' && document.querySelector('#studio-canvas').height===1350`,'Studio portrait selection');
    await app.eval(`document.querySelector('[data-studio-theme="ivory"]').click()`);
    assert.equal(await app.eval(`document.querySelector('#studio-theme').value`),'ivory');
    await app.screenshot('studio-desktop');

    // Actual PNG artwork download — the screenshot is NOT treated as proof of PNG download.
    await app.navigate('/quotes/jester-quote-016/');
    await app.eval(`document.querySelector('#download-poster').click()`);
    const png=await app.waitDownload(/^jester-quote-016-complete\.png$/);
    const meta=await sharp(png).metadata();
    assert.equal(meta.format,'png');
    assert.equal(meta.width,1080);
    assert.equal(meta.height,1080);

    // Long quotations must deliver ALL numbered PNG slides as one downloadable ZIP.
    await app.navigate('/quotes/jester-quote-069/');
    await app.eval(`document.querySelector('#download-poster').click()`);
    const quoteZip=await app.waitDownload(/^jester-quote-069-complete-complete-\d+-slides\.zip$/);
    const names=zipEntries(await fs.readFile(quoteZip));
    assert.ok(names.length>=2,'Long-quote ZIP must contain multiple image slides');
    assert.ok(names.every(name=>/\.png$/.test(name)), 'Quote ZIP should contain PNG slides only');

    // Saved library remains browser-only, shares the same storage key and saves across page loads.
    await app.navigate('/quotes/jester-quote-016/');
    await app.eval(`document.querySelector('.favorite-toggle').click()`);
    await app.waitFor(`document.querySelector('.favorite-toggle').getAttribute('aria-pressed')==='true'`,'saved quote 016');
    await app.navigate('/quotes/jester-quote-069/');
    await app.eval(`document.querySelector('.favorite-toggle').click()`);
    await app.waitFor(`document.querySelector('.favorite-toggle').getAttribute('aria-pressed')==='true'`,'saved quote 069');
    await app.navigate('/saved/');
    await app.waitFor(`document.querySelectorAll('.saved-card-holder:not([hidden])').length===2`,'two persistent favorites');
    const personal=await app.eval(`({noindex:document.querySelector('meta[name="robots"]')?.content,stored:JSON.parse(localStorage.getItem('jester-quotes:favorites:v1')||'[]').length})`);
    assert.equal(personal.noindex,'noindex, follow');
    assert.equal(personal.stored,2);

    // Invalid JSON import must never change existing saved data.
    await app.eval(`(function(){
      const input=document.querySelector('#saved-import-file');
      const file=new File(['{"version":1,"quote_ids":["fake-quote"]}'],'invalid.json',{type:'application/json'});
      const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await app.waitFor(`document.querySelector('#saved-status').textContent.includes('unknown')`,'import rejection feedback');
    assert.equal(await app.eval(`JSON.parse(localStorage.getItem('jester-quotes:favorites:v1')).length`),2);

    for(const id of ['016','069']){
      await app.eval(`document.querySelector('[data-pick-id="jester-quote-${id}"]').click()`);
    }
    await app.waitFor(`!document.querySelector('#saved-pack-download').disabled`,'share pack selection');
    await app.eval(`document.querySelector('#saved-pack-download').click()`);
    const pack=await app.waitDownload(/^jester-quotes-complete-pack-square-2-quotes\.zip$/,24000);
    const packNames=zipEntries(await fs.readFile(pack));
    assert.ok(packNames.some(x=>x.startsWith('jester-quote-016-')&&x.endsWith('.png')));
    assert.ok(packNames.some(x=>x.startsWith('jester-quote-069-')&&x.endsWith('.png')));
    assert.ok(packNames.includes('RIGHTS-AND-ATTRIBUTIONS.txt'));
    assert.equal(app.page.exceptions.length,0,'Saved Library runtime errors');
    await app.screenshot('saved-desktop');

    // Daily content is client-selected by a real UTC day, not stale static copy.
    await app.navigate('/daily/');
    await app.waitFor(`!document.querySelector('#daily-utc-date').textContent.includes('loading')`,'daily JS selection');
    assert.match(await app.eval(`document.querySelector('#daily-utc-date').textContent`),/^\d{4}-\d{2}-\d{2} · UTC$/);
    assert.ok((await app.eval(`document.querySelector('#daily-quote-text').textContent`)).length>30);

    // Capture layout evidence at mobile/tablet and each of the three actual Lab compositions.
    for(const [width,height] of [[390,844],[768,1024]]){
      await app.viewport(width,height);
      for(const route of ['/','/studio/','/saved/','/lab/']){
        await app.navigate(route);
        const dims=await app.eval(`({width:document.documentElement.scrollWidth,viewport:innerWidth})`);
        assert.ok(dims.width<=dims.viewport+2,route+' horizontal scroll at '+width+'px: '+JSON.stringify(dims));
        await app.screenshot(`${route==='/'?'home':route.slice(1,-1)}-${width}`);
      }
    }
    await app.viewport(1440,900);
    await app.navigate('/lab/');
    for(const theme of ['midnight-carnival','neo-brutalist','velvet-gallery']){
      await app.eval(`document.querySelector('[data-lab-tab="${theme}"]').click()`);
      await app.waitFor(`!document.querySelector('[data-lab-panel="${theme}"]').hidden`,'theme '+theme);
      assert.equal(await app.eval(`document.querySelector('[data-lab-tab="${theme}"]').getAttribute('aria-selected')`),'true');
      await app.screenshot('lab-'+theme+'-desktop');
    }
    await app.page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    assert.equal(await app.eval(`matchMedia('(prefers-reduced-motion: reduce)').matches`),true);
    await app.navigate('/');
    assert.equal(await app.eval(`getComputedStyle(document.querySelector('.hero-copy')).animationName`),'none');
    await app.page.send('Emulation.setEmulatedMedia',{features:[]});

    const focus=await app.eval(`(function(){
      const btn=document.querySelector('.nav-studio-cta');btn.focus();return {tag:document.activeElement?.tagName,visible:getComputedStyle(btn).outlineStyle!=='none'};
    })()`);
    assert.equal(focus.tag,'A');
    assert.ok(focus.visible,'Focused navigation must show an outline');
    assert.equal(app.page.exceptions.length,0,'Final homepage runtime error');
    console.log('Browser QA completed. Real Chrome screenshot directory:',app.screenshots);
  }finally{await app.cleanup();}
});
