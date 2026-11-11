export type ArtworkMeasure = (text: string, fontSize: number) => number;
export interface ArtworkTextLayout {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  height: number;
  complete?: boolean;
  excerpt?: boolean;
}
export interface FitOptions {
  maxWidth: number;
  maxHeight: number;
  measure: ArtworkMeasure;
  minFont?: number;
  maxFont?: number;
  fontStep?: number;
  lineRatio?: number;
}
export function wrapMeasured(text: string, maxWidth: number, fontSize: number, measure: ArtworkMeasure): string[];
export function fitTextLayout(text: string, options: FitOptions): ArtworkTextLayout | null;
export function paginateText(text: string, options: { maxWidth: number; maxHeight: number; fontSize: number; measure: ArtworkMeasure; lineRatio?: number }): ArtworkTextLayout[];
export function excerptLayout(text: string, options: { maxWidth: number; maxHeight: number; fontSize: number; measure: ArtworkMeasure; lineRatio?: number }): ArtworkTextLayout & { excerpt: boolean };
export function normalizedText(text: string): string;
