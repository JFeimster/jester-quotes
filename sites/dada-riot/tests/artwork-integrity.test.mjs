import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { wrapMeasured, fitTextLayout, paginateText, excerptLayout, normalizedText } from '../src/lib/artwork/text-layout.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(path.join(root, 'src/data/jester-quotes.json'), 'utf8'));
const manifestPath = path.join(root, 'public/social/quote-layouts.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const measure = (text, font) => [...text].length * font * .57;
const tight = (text) => text.replace(/\s+/gu, '');
const regions = [
  { name: 'square', w: 880, h: 620, font: 42 },
  { name: 'portrait', w: 880, h: 800, font: 48 },
  { name: 'story', w: 880, h: 1100, font: 48 },
  { name: 'landscape', w: 1000, h: 360, font: 38 }
];

test('100 social previews report measured glyph widths and safe baselines', () => {
  assert.equal(manifest.images.length, 100);
  assert.deepEqual(manifest.size, { width: 1200, height: 630 });
  assert.deepEqual(manifest.images.map(x => x.id), data.items.map(x => x.id));
  let excerpts = 0;
  for (const [i, image] of manifest.images.entries()) {
    const quote = data.items[i];
    assert.ok(image.actualMaxLineWidth <= image.textRegion.width, `${quote.id}: line escapes`);
    assert.ok(image.finalLineBaseline <= image.textRegion.top + image.textRegion.height, `${quote.id}: baseline escapes`);
    assert.ok(image.authorWidth <= image.authorWidthLimit, `${quote.id}: author escapes`);
    assert.equal(image.author, quote.person);
    assert.ok(image.lines.length && image.fontSize >= 32);
    assert.equal(image.sourceLength, normalizedText(quote.quote).length);
    if (image.excerpt) {
      excerpts++;
      assert.ok(image.lines.at(-1).endsWith('…'), `${quote.id}: excerpt must end visibly`);
      assert.ok(tight(image.text).length < tight(quote.quote).length);
    } else assert.equal(tight(image.text), tight(quote.quote), `${quote.id}: full preview fidelity`);
    assert.ok(existsSync(path.join(root, 'public/social/quotes', `${quote.id}.png`)));
  }
  assert.ok(excerpts > 0, 'Long quotes must be explicitly marked as excerpts');
  for (const id of ['jester-quote-016','jester-quote-069','jester-quote-082','jester-quote-083']) {
    assert.ok(manifest.images.some(x => x.id === id && x.actualMaxLineWidth <= x.textRegion.width));
  }
});

test('all quotes paginate without changing original words in 4 export sizes', () => {
  for (const quote of data.items) {
    for (const region of regions) {
      const pages = paginateText(quote.quote, {
        maxWidth: region.w, maxHeight: region.h, fontSize: region.font,
        measure, lineRatio: 1.26
      });
      assert.ok(pages.length >= 1, `${quote.id} ${region.name}`);
      const rendered = pages.flatMap(p => p.lines).join('');
      assert.equal(tight(rendered), tight(quote.quote), `${quote.id} ${region.name}: lost words`);
      for (const page of pages) {
        assert.ok(page.height <= region.h, `${quote.id} ${region.name}: vertical overflow`);
        assert.ok(page.lines.every(line => measure(line, page.fontSize) <= region.w), `${quote.id} ${region.name}: horizontal overflow`);
      }
    }
  }
});

test('measured wrapping and excerpts handle long unbroken words and punctuation', () => {
  const text = 'JESTER'.repeat(240) + ' rather mysterious wisdom';
  const lines = wrapMeasured(text, 720, 46, measure);
  assert.equal(tight(lines.join('')), tight(text));
  assert.ok(lines.every(line => measure(line, 46) <= 720));
  const pages = paginateText(text, { maxWidth: 720, maxHeight: 460, fontSize: 42, measure });
  assert.ok(pages.length > 1);
  assert.equal(tight(pages.flatMap(p => p.lines).join('')), tight(text));
  const excerpt = excerptLayout(text, { maxWidth: 720, maxHeight: 220, fontSize: 42, measure });
  assert.equal(excerpt.excerpt, true);
  assert.ok(excerpt.lines.at(-1).endsWith('…'));
  assert.ok(excerpt.lines.every(line => measure(line, 42) <= 720));
  assert.equal(fitTextLayout('  ', {maxWidth: 720,maxHeight: 500,measure}), null);
});

test('one-click complete export ships a valid uncompressed ZIP with every requested PNG', async () => {
  const file = readFileSync(path.join(root, 'src/lib/artwork/export-image.ts'), 'utf8');
  const js = ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  const entries = [
    { name: 'quote-slide-01.png', blob: new Blob([Uint8Array.from([137,80,78,71,1])]) },
    { name: 'quote-slide-02.png', blob: new Blob([Uint8Array.from([137,80,78,71,2])]) }
  ];
  const zip = new Uint8Array(await (await mod.makeUncompressedZip(entries)).arrayBuffer());
  const view = new DataView(zip.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint16(8, true), 0); // Store, no lossy recompression
  assert.equal(view.getUint16(26, true), entries[0].name.length);
  assert.equal(view.getUint32(zip.length - 22, true), 0x06054b50);
  assert.equal(view.getUint16(zip.length - 12, true), entries.length);
  assert.ok(Buffer.from(zip).includes(Buffer.from('quote-slide-01.png')));
  assert.ok(Buffer.from(zip).includes(Buffer.from('quote-slide-02.png')));
});

test('download controls distinguish complete exports from 1200x630 share-preview assets', () => {
  const detail = readFileSync(path.join(root, 'src/components/QuotePoster.astro'), 'utf8');
  const studio = readFileSync(path.join(root, 'src/components/QuoteStudio.astro'), 'utf8');
  const posterScript = readFileSync(path.join(root, 'src/scripts/poster.ts'), 'utf8');
  const studioScript = readFileSync(path.join(root, 'src/scripts/studio.ts'), 'utf8');
  assert.match(detail, /Download complete quote/);
  assert.match(detail, /Download link preview \(may be excerpt\)/);
  assert.match(studio, /id="studio-prev"/);
  assert.match(studio, /id="studio-next"/);
  assert.match(studioScript, /downloadArtwork/);
  assert.match(posterScript, /downloadArtwork/);
  assert.match(studioScript, /drawArtwork/);
  assert.match(studioScript, /studio-page-info/);
});
