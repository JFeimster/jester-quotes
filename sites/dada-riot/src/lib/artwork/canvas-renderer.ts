import { studioFormats, studioThemes, studioTextArea } from '../studio-config';
import type { StudioFormat, StudioTheme } from '../studio-config';
import { fitPosterText } from '../poster-layout';
import { paginateText } from './text-layout.mjs';
import {drawPressTreatment} from './press-treatment';

export interface ArtworkSpec {
  text: string;
  person: string;
  id: string;
  format: StudioFormat;
  theme: StudioTheme;
  border: boolean;
}
export interface ArtworkPage {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  height: number;
}
export interface ArtworkPlan {
  spec: ArtworkSpec;
  width: number;
  height: number;
  textArea: { left: number; top: number; width: number; height: number };
  authorFont: number;
  pages: ArtworkPage[];
}
export function planArtwork(ctx: CanvasRenderingContext2D, spec: ArtworkSpec): ArtworkPlan {
  if (!spec.text.trim() || !spec.person.trim()) throw new Error('Quote and full attribution are required.');
  const size = studioFormats[spec.format];
  const area = studioTextArea(spec.format);
  const measure = (line: string, fontSize: number) => {
    ctx.font = `${fontSize}px Georgia, serif`;
    return ctx.measureText(line).width;
  };
  // A readable 30px floor: never compress a long quote to unreadable tiny type.
  const fit = fitPosterText(spec.text, area.width, area.height, measure, {
    minFont: 30, maxFont: spec.format === 'landscape' ? 51 : 58, lineRatio: 1.26
  });
  const pages = fit ? [fit] : paginateText(spec.text, {
    maxWidth: area.width, maxHeight: area.height,
    fontSize: spec.format === 'landscape' ? 38 : (spec.format === 'square' ? 42 : 48),
    measure, lineRatio: 1.26
  });
  if (!pages.length) throw new Error('No printable quotation content.');
  for (const page of pages) {
    if (page.height > area.height + .01 || page.lines.some(line => measure(line, page.fontSize) > area.width + .01)) {
      throw new Error('Artwork exceeds its safe text region.');
    }
  }
  let authorFont = Math.min(32, Math.round(size.width * .032));
  for (; authorFont >= 14; authorFont -= 2) {
    ctx.font = `bold ${authorFont}px Arial, sans-serif`;
    if (ctx.measureText(`— ${spec.person}`).width <= area.width) break;
  }
  if (authorFont < 14) throw new Error('Author attribution exceeds the printable area.');
  return { spec, width: size.width, height: size.height, textArea: area, authorFont, pages };
}

export function drawArtwork(ctx: CanvasRenderingContext2D, plan: ArtworkPlan, pageNumber = 0): void {
  const page = plan.pages[pageNumber];
  if (!page) throw new RangeError('Requested artwork slide does not exist.');
  const { width, height, textArea: area, spec } = plan;
  if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  }
  const theme = studioThemes[spec.theme];
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.background);
  gradient.addColorStop(1, theme.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  drawPressTreatment(ctx,width,height,spec.theme);

  const frame = Math.round(Math.min(width, height) * .055);
  if (spec.border) {
    ctx.globalAlpha = .65;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(frame, frame, width - 2 * frame, height - 2 * frame);
    ctx.lineWidth = 1;
    ctx.strokeRect(frame + 10, frame + 10, width - 2 * (frame + 10), height - 2 * (frame + 10));
    ctx.globalAlpha = 1;
  }
  const center = width / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.accent;
  ctx.font = `bold ${Math.max(17, Math.round(Math.min(width, height) * .026))}px Arial, sans-serif`;
  ctx.fillText('JESTER QUOTES', center, Math.round(height * .115));
  ctx.font = `${page.fontSize}px Georgia, serif`;
  ctx.fillStyle = theme.foreground;
  let y = area.top + (area.height - page.height) / 2 + page.fontSize;
  for (const line of page.lines) {
    ctx.fillText(line, center, y);
    y += page.lineHeight;
  }
  ctx.fillStyle = theme.accent;
  ctx.font = `bold ${plan.authorFont}px Arial, sans-serif`;
  ctx.fillText(`— ${spec.person}`, center, Math.round(height * .866));
  const footer = plan.pages.length > 1
    ? `COMPLETE QUOTE · SLIDE ${pageNumber + 1} / ${plan.pages.length}`
    : 'THE ARCHIVE IS NOT NEUTRAL · COMPLETE QUOTE';
  ctx.font = `bold ${Math.max(13, Math.round(Math.min(width, height) * .016))}px Arial, sans-serif`;
  ctx.globalAlpha = .85;
  ctx.fillText(footer, center, Math.round(height * .935));
  ctx.globalAlpha = 1;
}
