import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const registry=JSON.parse(fs.readFileSync(new URL('../src/data/jester-quotes.json',import.meta.url),'utf8'));
test('100 records and unique IDs',()=> {
  assert.equal(registry.items.length,100);
  assert.equal(new Set(registry.items.map(q=>q.id)).size,100);
});
test('required fields and nullable references',()=> {
  for(const q of registry.items) {
    assert.match(q.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for(const key of ['name','person','quote']) assert.ok(typeof q[key]==='string' && q[key].trim(),`${q.id} ${key}`);
    assert.ok(q.reference===null || typeof q.reference==='string');
  }
});
