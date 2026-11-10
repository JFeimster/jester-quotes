import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const registry = JSON.parse(readFileSync(path.join(root, 'src/data/jester-quotes.json'), 'utf8'));
const previews = path.join(root, 'public/social/quotes');

function assertPng(file, width, height) {
  const bytes = readFileSync(file);
  assert.ok(bytes.length > 24, `${file}: PNG appears empty`);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${file}: PNG signature`);
  assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', `${file}: PNG header`);
  assert.equal(bytes.readUInt32BE(16), width, `${file}: width`);
  assert.equal(bytes.readUInt32BE(20), height, `${file}: height`);
}

test('all 100 generated quote previews exist with the correct dimensions', () => {
  const expected = registry.items.map((q) => `${q.id}.png`).sort();
  const actual = readdirSync(previews).filter((name) => name.endsWith('.png')).sort();
  assert.deepEqual(actual, expected);
  for (const name of expected) assertPng(path.join(previews, name), 1200, 630);
});

test('shared Open Graph and touch-icon images have valid PNG dimensions', () => {
  assertPng(path.join(root, 'public/og-jester-quotes.png'), 1200, 630);
  assertPng(path.join(root, 'public/apple-touch-icon.png'), 180, 180);
});
