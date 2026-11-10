export type TextMeasure = (text: string, fontSize: number) => number;

export interface PosterTextLayout {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  height: number;
}

export function wrapPosterLines(
  text: string,
  fontSize: number,
  maxWidth: number,
  measure: TextMeasure
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      let remaining = word;
      // Long, unbroken strings must not overflow the canvas.
      while (remaining && measure(remaining, fontSize) > maxWidth) {
        let chunk = '';
        for (const character of remaining) {
          if (chunk && measure(chunk + character, fontSize) > maxWidth) break;
          chunk += character;
        }
        if (current) {
          lines.push(current);
          current = '';
        }
        lines.push(chunk);
        remaining = remaining.slice(chunk.length);
      }
      if (!remaining) continue;
      const candidate = current ? `${current} ${remaining}` : remaining;
      if (current && measure(candidate, fontSize) > maxWidth) {
        lines.push(current);
        current = remaining;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export function fitPosterText(
  text: string,
  maxWidth: number,
  maxHeight: number,
  measure: TextMeasure
): PosterTextLayout | null {
  if (!text.trim()) return null;
  for (let fontSize = 62; fontSize >= 14; fontSize -= 2) {
    const lines = wrapPosterLines(text, fontSize, maxWidth, measure);
    const lineHeight = fontSize * 1.28;
    const height = lines.length * lineHeight;
    if (height <= maxHeight) return { lines, fontSize, lineHeight, height };
  }
  return null;
}
