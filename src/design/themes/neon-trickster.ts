import type { ThemeSpec } from '../theme-types';

export const neonTrickster: ThemeSpec = {
  id: 'neon-trickster', label: 'Neon Trickster', eyebrow: '05 / The signal pirate',
  tagline: 'Hack the narrative.',
  description: 'Futurist night-city control deck: ultraviolet, electric cyan, magenta glow, glowing HUD frames and synthetic signal noise.',
  treatment: 'neon', heroAlignment: 'asymmetric',
  tokens: {
  'ink': '#070819',
  'paper': '#e2f5fa',
  'accent': '#e83aff',
  'contrast': '#25e8ea',
  'surface': '#12132b',
  'border': 'rgba(37,232,234,.6)',
  'shadow': 'rgba(232,58,255,.32)',
  'radius': '13px',
  'displayFont': 'Arial Black,Impact,sans-serif'
},
  sampleQuoteIds: ['jester-quote-013','jester-quote-035','jester-quote-060']
};
