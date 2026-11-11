import type { ThemeSpec } from '../theme-types';

export const dadaRiot: ThemeSpec = {
  id: 'dada-riot', label: 'Dada Riot', eyebrow: '04 / The unauthorized press',
  tagline: 'Cut. Paste. Contradict.',
  description: 'An anarchic photomontage zine with ripped-paper geometry, redaction bars, jagged type and editorial mischief.',
  treatment: 'dada', heroAlignment: 'stacked',
  tokens: {
  'ink': '#17130f',
  'paper': '#f6edda',
  'accent': '#ef3c39',
  'contrast': '#1738a8',
  'surface': '#f0dec0',
  'border': '#1f1512',
  'shadow': 'rgba(0,0,0,.75)',
  'radius': '0px',
  'displayFont': 'Impact,Arial Black,sans-serif'
},
  sampleQuoteIds: ['jester-quote-007','jester-quote-024','jester-quote-041']
};
