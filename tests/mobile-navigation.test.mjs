import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = file=>readFileSync(new URL(file,import.meta.url),'utf8');
test('desktop dropdown and mobile menu route to every primary experience',()=>{
  const html=read('../dist/index.html');
  const header=html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(header);
  const desktop=header.match(/<nav class="desktop-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  const mobile=header.match(/<nav aria-label="Mobile navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(desktop && mobile);
  assert.match(header,/<details class="desktop-quotes-menu">/);
  assert.match(header,/<details class="mobile-nav">/);
  assert.match(header,/<summary aria-label="Toggle navigation menu">/);
  const destinations=['/quotes/','/collections/','/daily/','/tricksters/','/videos/','/resources/','/search/','/saved/','/studio/'];
  for(const href of destinations){
    const needle='href="'+href+'"';
    assert.equal(desktop.split(needle).length-1,1,'desktop '+href);
    assert.equal(mobile.split(needle).length-1,1,'mobile '+href);
  }
  assert.match(header,/MAKE TROUBLE/);
  assert.match(header,/class="nav-studio-cta"/);
  assert.ok(!desktop.includes('href="/about/"'),'About belongs in footer');
  assert.ok(html.includes('href="/riot-press/"'));
  const css=read('../src/styles/navigation-discovery.css');
  assert.match(css,/\.nav-v3 \.desktop-quotes-menu/);
  assert.match(css,/@media\(max-width:1180px\)/);
});
test('four-column footer supplies discover, watch, create and attribution navigation',()=>{
  const html=read('../dist/index.html');
  const footer=html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer);
  for(const label of ['DISCOVER','WATCH &amp; READ','CREATE &amp; KEEP','ABOUT'])
    assert.ok(footer.includes(label),label);
  for(const href of ['/quotes/','/collections/','/daily/','/tricksters/','/videos/','/resources/','/about/','/studio/','/saved/','/riot-press/','/sources/'])
    assert.ok(footer.includes('href="'+href+'"'),href);
});
