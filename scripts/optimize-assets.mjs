#!/usr/bin/env node
/**
 * Safe, explicit image derivative generator. Dry-run by default, never overwrites.
 * Usage: npm run assets:optimize -- --input public/assets/images/heroes/example.png [--write]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../',import.meta.url));
const rootAssets = path.resolve(root,'public/assets');
const argv = process.argv.slice(2);
const arg = (name) => { const i=argv.indexOf(name); return i>=0?argv[i+1]:undefined; };
const write = argv.includes('--write');
const input = arg('--input');
const width = Number(arg('--width')??1600);
const quality = Number(arg('--quality')??82);
const format = arg('--format')??'webp';
const help = argv.includes('--help') || argv.includes('-h');
if(help || !input) {
  console.log('Usage: npm run assets:optimize -- --input public/assets/<relative-file-or-folder> [--format webp|avif] [--width 1600] [--quality 82] [--write]');
  console.log('Default: dry-run. --write creates non-overwriting derivatives and preserves originals. Register outputs before committing.');
  process.exit(help?0:1);
}
if(!Number.isInteger(width)||width<64||width>8192||!Number.isInteger(quality)||quality<1||quality>100||!['webp','avif'].includes(format))throw Error('Invalid width, quality or format');
const target=path.resolve(root,input);
if(target!==rootAssets && !target.startsWith(rootAssets+path.sep))throw Error('Only files under public/assets/ may be optimized');
const imageTypes=new Set(['.png','.jpg','.jpeg','.webp','.avif','.gif']);
async function walk(p) {
  const st=await fs.lstat(p);
  if(st.isSymbolicLink())throw Error('Refusing symlink: '+p);
  if(st.isFile())return imageTypes.has(path.extname(p).toLowerCase())?[p]:[];
  if(!st.isDirectory())throw Error('Not a regular input file/folder: '+p);
  const values=[];
  for(const name of (await fs.readdir(p)).sort())values.push(...await walk(path.join(p,name)));
  return values;
}
const files=await walk(target);
if(!files.length)throw Error('No raster images found');
for(const inputFile of files) {
  const ext=path.extname(inputFile);
  const base=inputFile.slice(0,-ext.length);
  if(/-optimized-[0-9]+w(?:-(?:1x1|4x5|9x16|16x9))?$/.test(base))continue;
  const folderRatio = path.relative(rootAssets,path.dirname(inputFile)).split(path.sep).find(part => /^(?:1x1|4x5|9x16|16x9)$/.test(part));
  const ratioSuffix = folderRatio && base.endsWith('-' + folderRatio) ? '-' + folderRatio : '';
  const stem = ratioSuffix ? base.slice(0, -ratioSuffix.length) : base;
  const destination = stem + '-optimized-' + width + 'w' + ratioSuffix + '.' + format;
  if(await fs.stat(destination).catch(()=>null)) {
    console.log('SKIP (already exists): '+path.relative(root,destination));
    continue;
  }
  const meta=await sharp(inputFile).metadata();
  if(!meta.width||!meta.height)throw Error('Cannot read dimensions: '+inputFile);
  console.log((write?'GENERATE ':'DRY-RUN  ')+path.relative(root,inputFile)+' ('+meta.width+'x'+meta.height+') -> '+path.relative(root,destination));
  if(!write)continue;
  const pipeline=sharp(inputFile).rotate().resize({width,withoutEnlargement:true,fit:'inside'});
  const encoder=format==='avif'?pipeline.avif({quality,effort:4}):pipeline.webp({quality,effort:4});
  // Exclusive create; a simultaneous process cannot overwrite an existing derivative.
  const buffer=await encoder.toBuffer();
  const handle=await fs.open(destination,'wx');
  try {await handle.writeFile(buffer);}finally{await handle.close();}
}
console.log('Completed. Original files unchanged. Add created derivatives to the registry with verified dimensions before CI.');
