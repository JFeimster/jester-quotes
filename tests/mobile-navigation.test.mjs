import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const pages = ['/', '/daily/', '/collections/', '/tricksters/', '/resources/', '/videos/', '/saved/', '/about/', '/studio/'];
test('accessible responsive navigation has matching desktop and mobile destinations', () => {
  const html = read('../dist/index.html');
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(header, 'site header must render');
  const desktop = header.match(/<nav class="desktop-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  const mobile = header.match(/<nav aria-label="Mobile navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(desktop && mobile, 'both navigation modes should render');
  assert.match(header, /<details class="mobile-nav">/);
  assert.match(header, /<summary aria-label="Toggle navigation menu">/);
  for(const href of pages) {
    const expected = href === '/' ? '/#explore' : href;
    const needle = 'href="' + expected + '"';
    assert.equal(desktop.split(needle).length - 1, 1, 'desktop '+expected);
    assert.equal(mobile.split(needle).length - 1, 1, 'mobile '+expected);
  }
  assert.match(mobile, /nav-studio-cta/);
  const css = read('../src/styles/midnight-2.css');
  assert.match(css, /\.site-header-2 \.mobile-nav nav/);
  assert.match(css, /@media \(max-width:1180px\)/);
});
