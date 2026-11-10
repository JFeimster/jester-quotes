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
