import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { fitTextLayout, excerptLayout, normalizedText } from '../src/lib/artwork/text-layout.mjs';

const registry = JSON.parse(await fs.readFile(new URL('../src/data/jester-quotes.json', import.meta.url), 'utf8'));
const root = fileURLToPath(new URL('../', import.meta.url));
const target = path.join(root, 'public', 'social', 'quotes');
await fs.mkdir(target, { recursive: true });

const W = 1200, H = 630;
const QUOTE_X = 92, QUOTE_W = 1016, QUOTE_Y = 169, QUOTE_H = 292;
const AUTHOR_X = 92, AUTHOR_MAX_W = 990;
const BASE_FONT = 50;
const escapeXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// Pango uses the same font family as the finished SVG. Measure real rendered
// glyph widths instead of the old 53-characters-per-line approximation.
const cachedWords = new Map();
const exactWidths = new Map();
async function glyphWidth(text, fontSize, family = 'DejaVu Serif') {
  if (!text) return 0;
  const key = `${family}|${fontSize}|${text}`;
  if (exactWidths.has(key)) return exactWidths.get(key);
  const { info } = await sharp({
    text: { text: escapeXml(text), font: `${family} ${fontSize}`, dpi: 72, rgba: true }
  }).png().toBuffer({ resolveWithObject: true });
  exactWidths.set(key, info.width);
  return info.width;
}
const words = [...new Set(registry.items.flatMap(q => normalizedText(q.quote).split(' ')))];
const spaceWidth = await glyphWidth('a a', BASE_FONT) - 2 * await glyphWidth('a', BASE_FONT);
const queue = [...words];
async function measureWorker() {
  while (queue.length) {
    const word = queue.pop();
    // Avoid deliberately shaping empty strings.
    cachedWords.set(word, await glyphWidth(word, BASE_FONT));
  }
}
await Promise.all(Array.from({ length: 12 }, () => measureWorker()));
// A slight kerning/synthetic-text safety margin is validated against exact
// Pango line widths before any quote image is written.
function measure(text, size) {
  if (!text) return 0;
  return text.split(/\s+/u).reduce((total, word, index) => {
    const known = cachedWords.get(word);
    // Very long unbroken strings can be split into chunks. Missing shapes
    // fall back conservatively, then exact measurements reject overflow.
    return total + (index ? spaceWidth : 0) + (known ?? [...word].length * 38);
  }, 0) * size / BASE_FONT * 1.08;
}

async function exactBounds(lines, fontSize) {
  const widths = await Promise.all(lines.map(line => glyphWidth(line, fontSize)));
  return Math.max(0, ...widths);
}

const report = { version: 1, size: { width: W, height: H }, images: [] };
for (const q of registry.items) {
  let layout = null;
  let actualWidth = 0;
  for (let fontSize = 48; fontSize >= 32; fontSize -= 2) {
    const candidate = fitTextLayout(q.quote, {
      maxWidth: QUOTE_W, maxHeight: QUOTE_H, minFont: fontSize,
      maxFont: fontSize, measure, lineRatio: 1.25
    });
    if (!candidate) continue;
    const width = await exactBounds(candidate.lines, fontSize);
    if (width <= QUOTE_W) {
      layout = { ...candidate, excerpt: false };
      actualWidth = width;
      break;
    }
  }
  if (!layout) {
    // An Open Graph card may be an excerpt. It MUST say so in the image.
    // The full quotation is available in user-triggered PNG/slide downloads.
    for (let fontSize = 44; fontSize >= 32; fontSize -= 2) {
      const candidate = excerptLayout(q.quote, {
        maxWidth: QUOTE_W, maxHeight: QUOTE_H, fontSize, measure,
        lineRatio: 1.25
      });
      const width = await exactBounds(candidate.lines, fontSize);
      if (width <= QUOTE_W && candidate.height <= QUOTE_H) {
        layout = candidate;
        actualWidth = width;
        break;
      }
    }
  }
  if (!layout) throw new Error(`Cannot safely typeset social image: ${q.id}`);

  let authorSize = 30;
  while (authorSize >= 18 && await glyphWidth(`— ${q.person}`, authorSize, 'DejaVu Sans') > AUTHOR_MAX_W) authorSize -= 2;
  if (authorSize < 18) throw new Error(`Author does not fit: ${q.id}`);
  const authorWidth = await glyphWidth(`— ${q.person}`, authorSize, 'DejaVu Sans');
  const startBaseline = QUOTE_Y + layout.fontSize;
  const quoteBottom = startBaseline + (layout.lines.length - 1) * layout.lineHeight;
  if (quoteBottom > QUOTE_Y + QUOTE_H || actualWidth > QUOTE_W) {
    throw new Error(`Quote escapes safe region: ${q.id}`);
  }
  const quoteLines = layout.lines.map((line, i) =>
    `<text x="${QUOTE_X}" y="${(startBaseline + i * layout.lineHeight).toFixed(2)}" font-family="DejaVu Serif" font-size="${layout.fontSize}" fill="#171310">${escapeXml(line)}</text>`
  ).join('\n');
  const excerptTag = layout.excerpt
    ? '<text x="92" y="489" font-family="DejaVu Sans" font-size="21" font-weight="bold" fill="#e8393b" letter-spacing="1.5">EXCERPT · FULL QUOTE ONLINE</text>'
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#f5e9cf"/>
    <path d="M0 0h1200v24L1170 42H0z" fill="#e8393b"/>
    <path d="M18 18h1164v594H18z" fill="#f5e9cf" stroke="#171310" stroke-width="4"/>
    <path d="M92 127h1016" stroke="#171310" stroke-opacity=".35" stroke-width="2"/>
    <text x="92" y="99" font-family="DejaVu Sans" font-size="29" font-weight="bold" letter-spacing="4" fill="#1738a8">JESTER QUOTES / THE RIOT PRESS</text>
    ${quoteLines}
    ${excerptTag}
    <path d="M92 510h1016" stroke="#171310" stroke-opacity=".32" stroke-width="2"/>
    <text x="${AUTHOR_X}" y="560" font-family="DejaVu Sans" font-size="${authorSize}" fill="#e8393b">— ${escapeXml(q.person)}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(target, `${q.id}.png`));
  report.images.push({
    id: q.id,
    image: `/social/quotes/${q.id}.png`,
    excerpt: Boolean(layout.excerpt),
    fontSize: layout.fontSize,
    lineHeight: layout.lineHeight,
    lines: layout.lines,
    text: layout.lines.join(' '),
    sourceLength: normalizedText(q.quote).length,
    textRegion: { x: QUOTE_X, top: QUOTE_Y, width: QUOTE_W, height: QUOTE_H },
    actualMaxLineWidth: actualWidth,
    finalLineBaseline: quoteBottom,
    author: q.person,
    authorFontSize: authorSize,
    authorWidth,
    authorWidthLimit: AUTHOR_MAX_W
  });
}
await fs.writeFile(path.join(root, 'public/social/quote-layouts.json'), JSON.stringify(report, null, 2) + '\n');

console.log(`Generated ${registry.items.length} bounded social previews: ${report.images.filter(x => x.excerpt).length} explicitly labeled excerpts.`);
