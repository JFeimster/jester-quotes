import { fitTextLayout } from './artwork/text-layout.mjs';

export type TextMeasure = (text: string, fontSize: number) => number;

export interface PosterTextLayout {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  height: number;
}

export function wrapPosterLines(text: string, fontSize: number, maxWidth: number, measure: TextMeasure): string[] {
  // Preserve the historical tested helper API.
  return wrap(text, maxWidth, fontSize, measure);
}
import { wrapMeasured as wrap } from './artwork/text-layout.mjs';

export function fitPosterText(
  text: string, maxWidth: number, maxHeight: number, measure: TextMeasure,
  options: { minFont?: number; maxFont?: number; lineRatio?: number } = {}
): PosterTextLayout | null {
  return fitTextLayout(text, {
    maxWidth, maxHeight, measure, minFont: options.minFont ?? 14,
    maxFont: options.maxFont ?? 62, lineRatio: options.lineRatio ?? 1.28
  });
}
