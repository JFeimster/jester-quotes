import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const required = [
  'public/assets/dada-riot-hero-clean-16x9.png',
  'public/assets/dada-riot-hero-clean-16x9.webp',
  'public/assets/dada-riot-hero-mobile-4x5.webp',
  'public/assets/dada-riot-wordmark-horizontal.svg',
  'public/assets/dada-riot-emblem-square.svg',
  'public/assets/dada-riot-og-1200x630.png',
  'public/assets/dada-riot-poster-square.webp',
  'public/assets/dada-riot-poster-portrait.webp',
  'public/og-jester-quotes.png',
  'public/favicon.svg',
  'public/apple-touch-icon.png'
];
for (let index = 1; index <= 6; index++) {
  required.push(`public/assets/dada-riot-collection-${String(index).padStart(2, '0')}-cover-4x3.webp`);
}
const missing = required.filter((path) => !existsSync(resolve(path)));
if (missing.length) {
  console.error('Dada Riot artwork is missing:');
  for (const path of missing) console.error(`- ${path}`);
  process.exitCode = 1;
} else {
  console.log(`Dada Riot artwork inventory verified (${required.length} files).`);
}
