import type { ThemeSpec } from '../theme-types';

export const forbiddenLibrary: ThemeSpec = {
  id: 'forbidden-library', label: 'The Forbidden Library', eyebrow: '07 / The secret index',
  tagline: 'Some truths deserve a locked door.',
  description: 'A dark-academia reading chamber with illustrated shelves, archival catalog cards, manuscript margins, illuminated initials and warm candlelight.',
  treatment: 'library', heroAlignment: 'split',
  tokens: {
  'ink': '#17211b',
  'paper': '#efe1bf',
  'accent': '#d6ad70',
  'contrast': '#b9d3a8',
  'surface': '#293629',
  'border': 'rgba(214,173,112,.52)',
  'shadow': 'rgba(0,0,0,.5)',
  'radius': '3px',
  'displayFont': 'Georgia,serif'
},
  sampleQuoteIds: ['jester-quote-009','jester-quote-046','jester-quote-077']
};
