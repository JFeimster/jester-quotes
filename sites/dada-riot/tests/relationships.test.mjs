import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = name => JSON.parse(readFileSync(path.join(root, 'src/data', name), 'utf8'));
const compiled = await build({
  entryPoints: [path.join(root, 'src/lib/related-content.ts')],
  bundle: true, platform: 'node', format: 'esm', write: false,
  tsconfigRaw: { compilerOptions: {} }
});
const graph = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const { validatedRelationships: edges, relatedLinks } = graph;

test('canonical relationships resolve, have evidence, and contain no duplicate edge', () => {
  assert.equal(edges.length, graph.validatedRelationshipCount);
  const unique = new Set();
  for (const edge of edges) {
    assert.equal(edge.status, 'published');
    assert.ok(edge.rationale.trim() && edge.evidence.startsWith('https://'));
    const key = `${edge.source.kind}:${edge.source.id}|${edge.type}|${edge.target.kind}:${edge.target.id}`;
    assert.ok(!unique.has(key), key);
    unique.add(key);
    const outbound = relatedLinks(edge.source.kind, edge.source.id).find(link => link.ref.kind === edge.target.kind && link.ref.id === edge.target.id && link.type === edge.type);
    const inbound = relatedLinks(edge.target.kind, edge.target.id).find(link => link.ref.kind === edge.source.kind && link.ref.id === edge.source.id && link.type === edge.type);
    assert.ok(outbound && inbound, key);
    for (const link of [outbound, inbound]) {
      assert.ok(link.href.startsWith('/'));
      const [route, fragment] = link.href.split('#');
      assert.ok(existsSync(path.join(root, 'dist', route, 'index.html')), link.href);
      if (fragment) assert.ok(readFileSync(path.join(root, 'dist', route, 'index.html'), 'utf8').includes(`id="${fragment}"`), link.href);
    }
  }
});

test('published classifications are attributed and drafts have no edges', () => {
  const media = json('jesters-in-media.json');
  const published = media.filter(item => item.publication_status === 'published');
  const drafts = media.filter(item => item.publication_status === 'draft');
  assert.equal(published.length, 15);
  assert.equal(drafts.length, 9);
  for (const item of published) {
    const edge = edges.find(edge => edge.source.kind === 'media' && edge.source.id === item.id && edge.type === 'example-of-archetype');
    assert.equal(edge?.target.id, item.character_type === 'fool' ? 'fool' : 'jester');
    assert.equal(edge?.evidence, item.sources[0]);
  }
  for (const item of drafts) assert.deepEqual(relatedLinks('media', item.id), []);
  const brandEdges = edges.filter(edge => edge.source.kind === 'brand' && edge.type === 'example-of-archetype');
  assert.equal(brandEdges.length, 4);
  assert.ok(brandEdges.every(edge => edge.target.id === 'jester' && /historical/.test(edge.rationale)));
});

test('quote contract and rendered editorial paths remain intact', () => {
  const quote = json('collections.json')[0].quoteIds[0];
  const matches = graph.relatedToQuote(quote);
  assert.deepEqual(Object.keys(matches), ['collections', 'tricksters', 'resources', 'videos']);
  assert.ok(matches.collections.length);
  assert.deepEqual(graph.relatedToQuote('missing'), { collections: [], tricksters: [], resources: [], videos: [] });
  assert.ok(!edges.some(edge =>
    (edge.source.kind === 'quote' && ['media', 'brand'].includes(edge.target.kind)) ||
    (edge.target.kind === 'quote' && ['media', 'brand'].includes(edge.source.kind))));
  const archetype = readFileSync(path.join(root, 'dist/archetypes/jester/index.html'), 'utf8');
  const media = readFileSync(path.join(root, 'dist/jesters-in-media/index.html'), 'utf8');
  const brands = readFileSync(path.join(root, 'dist/jester-brands/index.html'), 'utf8');
  assert.match(archetype, /Follow the thread/);
  assert.match(media, /href="\/archetypes\/fool\/"/);
  assert.match(brands, /href="\/archetypes\/jester\/"/);
  assert.ok(!edges.some(edge => edge.source.id === 'puck' || edge.target.id === 'puck'));
});
