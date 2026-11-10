export const studioFormats = {
  square: { label: 'Square · 1:1', width: 1080, height: 1080 },
  portrait: { label: 'Portrait · 4:5', width: 1080, height: 1350 },
  story: { label: 'Story · 9:16', width: 1080, height: 1920 },
  landscape: { label: 'Landscape · 1.91:1', width: 1200, height: 630 }
} as const;

export type StudioFormat = keyof typeof studioFormats;

export const studioThemes = {
  midnight: { label: 'Midnight Gold', background: '#15111f', secondary: '#302034', foreground: '#f5ebdd', accent: '#d8ac64' },
  velvet: { label: 'Velvet Theater', background: '#441e37', secondary: '#1c1426', foreground: '#f5ebdd', accent: '#f2a2ad' },
  ivory: { label: 'Ivory & Ink', background: '#f5ebdd', secondary: '#deccb5', foreground: '#271a2b', accent: '#69263f' },
  coral: { label: 'Coral After Dark', background: '#331c2d', secondary: '#6a2947', foreground: '#fff5e8', accent: '#f26778' }
} as const;

export type StudioTheme = keyof typeof studioThemes;

export interface StudioTextArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function studioTextArea(format: StudioFormat): StudioTextArea {
  const { width, height } = studioFormats[format];
  const left = Math.round(Math.min(width, height) * .092);
  const top = Math.round(height * .19);
  const bottom = Math.round(height * .765);
  return { left, top, width: width - left * 2, height: bottom - top };
}
