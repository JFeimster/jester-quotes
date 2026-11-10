import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const registry = JSON.parse(await fs.readFile(new URL('../src/data/jester-quotes.json',import.meta.url),'utf8'));
const target = new URL('../public/social/quotes/',import.meta.url);
await fs.mkdir(target,{recursive:true});
const escapeXml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
function wrap(text,max=53,limit=6) {
  const words=text.replace(/\s+/g,' ').trim().split(' ');const lines=[];let line='';
  for (const word of words) {
    if (`${line} ${word}`.trim().length>max && line) {lines.push(line);line=word;} else line=`${line} ${word}`.trim();
    if(lines.length>=limit)break;
  }
  if(line && lines.length<limit)lines.push(line);
  if(words.join(' ').length > lines.join(' ').length) lines[lines.length-1]=lines.at(-1).replace(/[ .,!?:;]+$/,'')+'…';
  return lines;
}
for(const q of registry.items) {
  const lines=wrap(q.quote);
  const fontSize=lines.length>5?41:49;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#14101e"/>
  <rect x="28" y="28" width="1144" height="574" rx="20" fill="#25192d" stroke="#d9ae63" stroke-width="3"/>
  <text x="88" y="105" font-family="sans-serif" font-size="28" font-weight="bold" fill="#d9ae63" letter-spacing="5">JESTER QUOTES</text>
  <text x="88" y="195" font-family="Georgia,serif" font-size="${fontSize}" fill="#f7eddf">
  ${lines.map((line,i)=>`<tspan x="88" dy="${i===0?0:62}">${escapeXml(line)}</tspan>`).join('')}
  </text>
  <text x="88" y="555" font-family="sans-serif" font-size="31" fill="#f06c7a">— ${escapeXml(q.person.slice(0,58))}</text>
  </svg>`;
  const out=path.join(fileURLToPath(target),`${q.id}.png`);
  await sharp(Buffer.from(svg)).png().toFile(out);
}

const featured=registry.items[4] ?? registry.items[0];
await fs.copyFile(path.join(fileURLToPath(target),`${featured.id}.png`),fileURLToPath(new URL('../public/og-jester-quotes.png',import.meta.url)));
const mark=`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="180" height="180" rx="32" fill="#14101e"/><path d="M25 83 48 38 90 78 132 38 155 83 145 133H35Z" fill="#d9ae63"/><circle cx="48" cy="35" r="12" fill="#f06c7a"/><circle cx="132" cy="35" r="12" fill="#f06c7a"/></svg>`;
await sharp(Buffer.from(mark)).png().toFile(fileURLToPath(new URL('../public/apple-touch-icon.png',import.meta.url)));
console.log(`Generated ${registry.items.length} social previews and common social/icon assets.`);

