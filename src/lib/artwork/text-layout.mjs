// Pure, environment-neutral typography layout. Pass actual glyph measurements from
// Sharp/Pango (build) or CanvasRenderingContext2D.measureText (browser).
export function wrapMeasured(text, maxWidth, fontSize, measure) {
  if (!(maxWidth > 0) || !(fontSize > 0)) throw new RangeError('Invalid text bounds');
  const lines = [];
  for (const paragraph of text.split(/\r?\n/u)) {
    const words = paragraph.trim().split(/\s+/u).filter(Boolean);
    if (!words.length) { lines.push(''); continue; }
    let current = '';
    for (const word of words) {
      let rest = word;
      // Long URLs and unbroken words must not render beyond the safe zone.
      while (rest && measure(rest, fontSize) > maxWidth) {
        let chunk = '';
        for (const ch of rest) {
          if (chunk && measure(chunk + ch, fontSize) > maxWidth) break;
          chunk += ch;
        }
        if (current) { lines.push(current); current = ''; }
        lines.push(chunk);
        rest = rest.slice(chunk.length);
      }
      if (!rest) continue;
      const candidate = current ? `${current} ${rest}` : rest;
      if (current && measure(candidate, fontSize) > maxWidth) {
        lines.push(current);
        current = rest;
      } else current = candidate;
    }
    if (current) lines.push(current);
  }
  return lines;
}

export function fitTextLayout(text, {
  maxWidth, maxHeight, measure, maxFont = 62, minFont = 14,
  fontStep = 2, lineRatio = 1.28
}) {
  if (!text.trim()) return null;
  for (let fontSize = maxFont; fontSize >= minFont; fontSize -= fontStep) {
    const lines = wrapMeasured(text, maxWidth, fontSize, measure);
    const lineHeight = fontSize * lineRatio;
    const height = lines.length * lineHeight;
    if (height <= maxHeight && lines.every(line => measure(line, fontSize) <= maxWidth)) {
      return { lines, fontSize, lineHeight, height, complete: true };
    }
  }
  return null;
}

export function paginateText(text, {
  maxWidth, maxHeight, fontSize, measure, lineRatio = 1.28
}) {
  if (!text.trim()) return [];
  const lineHeight = fontSize * lineRatio;
  const maxLines = Math.floor(maxHeight / lineHeight);
  if (maxLines < 1) throw new RangeError('Canvas too small for readable text');
  const lines = wrapMeasured(text, maxWidth, fontSize, measure);
  const pages = [];
  for (let start = 0; start < lines.length; start += maxLines) {
    const chunk = lines.slice(start, start + maxLines);
    pages.push({
      lines: chunk,
      fontSize,
      lineHeight,
      height: chunk.length * lineHeight,
      complete: true
    });
  }
  return pages;
}

export function excerptLayout(text, {
  maxWidth, maxHeight, fontSize, measure, lineRatio = 1.27
}) {
  const lines = wrapMeasured(text, maxWidth, fontSize, measure);
  const lineHeight = fontSize * lineRatio;
  const limit = Math.max(1, Math.floor(maxHeight / lineHeight));
  if (lines.length <= limit) {
    return { lines, fontSize, lineHeight, height: lines.length * lineHeight, excerpt: false };
  }
  const selected = lines.slice(0, limit);
  let last = selected[selected.length - 1].trimEnd();
  // The ellipsis is explicit and its measured width is accounted for.
  while (last && measure(last + '…', fontSize) > maxWidth) {
    const space = last.lastIndexOf(' ');
    last = space > 0 ? last.slice(0, space).trimEnd() : last.slice(0, -1);
  }
  selected[selected.length - 1] = (last || '') + '…';
  return { lines: selected, fontSize, lineHeight, height: selected.length * lineHeight, excerpt: true };
}

export function normalizedText(text) {
  return text.replace(/\s+/gu, ' ').trim();
}
