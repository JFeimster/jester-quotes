import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(path.join(root,p),'utf8');
const registry = JSON.parse(read('src/data/image-assets.json'));
const schema = JSON.parse(read('schemas/image-asset.schema.json'));
test('asset registry has unique IDs and only confirmed published files', () => {
  assert.ok(registry.length >= 2);
  assert.equal(new Set(registry.map(x=>x.id)).size,registry.length);
  assert.equal(new Set(registry.map(x=>x.path)).size,registry.length);
  const re=new RegExp(schema.properties.path.pattern);
  for (const asset of registry) {
    assert.ok(re.test(asset.path),asset.id);
    if (['uploaded','integrated'].includes(asset.status)) assert.ok(existsSync(path.join(root,'public',asset.path.slice(1))),asset.id);
  }
  assert.ok(registry.some(x=>x.id==='site-hero-portrait' && x.status==='integrated'));
  assert.ok(registry.some(x=>x.id==='site-hero-wide' && x.status==='uploaded'));
});
test('migrated hero paths are canonical and legacy URLs redirect permanently', () => {
  const heroRecords = registry.filter(x => x.assetType === 'hero' && x.variant !== 'optimized');
  assert.equal(heroRecords.length, 2);
  for (const item of heroRecords) {
    assert.ok(item.path.startsWith('/assets/images/heroes/'), item.path);
    assert.ok(existsSync(path.join(root, 'public', item.path.slice(1))));
  }
  const redirects = JSON.parse(read('vercel.json')).redirects;
  for (const suffix of ['16x9','4x5']) {
    const source = '/images/midnight-carnival-hero-' + suffix + '.png';
    const destination = '/assets/images/heroes/midnight-carnival-hero-' + suffix + '.png';
    assert.ok(redirects.some(x => x.source === source && x.destination === destination && x.permanent === true), source);
  }
  const portraitDerivative = registry.find(x => x.id === 'site-hero-portrait-webp');
  assert.ok(portraitDerivative && portraitDerivative.status === 'integrated');
  assert.equal(portraitDerivative.mimeType, 'image/webp');
  assert.deepEqual(portraitDerivative.dimensions, { width: 1122, height: 1402 });
  assert.ok(existsSync(path.join(root, 'public', portraitDerivative.path.slice(1))));
  assert.ok(!existsSync(path.join(root,'public/images')));
});

test('inventory CSV reproduces deterministic canonical registry output', () => {
  const output = execFileSync(process.execPath, ['scripts/inventory-assets.mjs'], {cwd:root,encoding:'utf8'});
  assert.equal(output,read('data/asset-inventory.csv'));
});
test('optimizer requires explicit input and documents non-overwriting dry-run', () => {
  const output = execFileSync(process.execPath, ['scripts/optimize-assets.mjs','--help'], {cwd:root,encoding:'utf8'});
  assert.match(output,/dry-run/i);
  assert.match(output,/--write/);
});
test('asset validator runs successfully without changing published assets', () => {
  const output = execFileSync(process.execPath,['scripts/validate-assets.mjs'],{cwd:root,encoding:'utf8'});
  assert.match(output,/Asset validation passed/);
});
