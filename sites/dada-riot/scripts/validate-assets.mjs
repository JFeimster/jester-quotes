#!/usr/bin/env node
/** Read-only asset inventory + registry validation, including actual image dimensions when declared. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/asset-architecture.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/image-asset.schema.json'), 'utf8'));
const entries = JSON.parse(fs.readFileSync(path.join(root, 'src/data/image-assets.json'), 'utf8'));
const assetRoot = path.join(root, cfg.root);
const errors = [];
const fail = message => errors.push(message);
const required = new Set(cfg.directories);
const knownDirs = new Set();
for (const dir of required) for (let i=1, parts=dir.split('/'); i<=parts.length; i++) knownDirs.add(parts.slice(0,i).join('/'));
const extensions = new Set([...cfg.imageExtensions,...cfg.videoExtensions,...cfg.otherExtensions]);
const imageExtensions = new Set(cfg.imageExtensions);
const realFiles = new Set();
const normalize = p => p.split(path.sep).join('/');
if (!fs.statSync(assetRoot,{throwIfNoEntry:false})?.isDirectory()) fail('Missing public/assets root');
for (const dir of required) {
  if (dir.startsWith('/') || dir.includes('\\') || dir.split('/').some(s => !s || s === '..')) fail('Unsafe configured directory: ' + dir);
  else if (!fs.statSync(path.join(assetRoot,dir),{throwIfNoEntry:false})?.isDirectory()) fail('Missing directory: ' + dir);
}
for (const p of cfg.legacyPreserved) if (!fs.existsSync(path.join(root,p))) fail('Missing preserved legacy location: ' + p);
function scan(dir) {
  for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
    const file = path.join(dir,item.name), rel = normalize(path.relative(assetRoot,file));
    if (item.isSymbolicLink()) { fail('Symlink not allowed: '+rel); continue; }
    if (item.isDirectory()) {
      if (!knownDirs.has(rel)) fail('Undeclared directory: '+rel);
      scan(file);
      continue;
    }
    if (!item.isFile()) { fail('Unsupported filesystem entry: '+rel); continue; }
    if (item.name === '.gitkeep') continue;
    const ext=path.extname(item.name).toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/.test(item.name) || !extensions.has(ext)) fail('Invalid filename or extension: '+rel);
    const ratio=rel.split('/').find(x=>cfg.ratioDirectories.includes(x));
    if (ratio && !item.name.slice(0,-ext.length).endsWith('-'+ratio)) fail('Filename does not match ratio folder: '+rel);
    realFiles.add('/assets/'+rel);
  }
}
if (fs.statSync(assetRoot,{throwIfNoEntry:false})?.isDirectory()) scan(assetRoot);
if (!Array.isArray(entries)) fail('src/data/image-assets.json must be an array');
const keys = new Set(Object.keys(schema.properties));
const ids=new Set(), paths=new Set(), published=new Set();
const valueSet=(key)=>new Set(schema.properties[key].enum);
const types=valueSet('assetType'),statuses=valueSet('status'),variants=valueSet('variant'),ratios=valueSet('aspectRatio');
const pathRule=new RegExp(schema.properties.path.pattern);
const kebab=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function ratioMatches(width,height,ratio) {
  if(!ratio)return true;
  const [x,y]=ratio==='191x100'?[1200,630]:ratio.split('x').map(Number);
  return Math.abs(width/height-x/y)<=0.012;
}
for (const r of Array.isArray(entries)?entries:[]) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) {fail('Invalid registry item');continue;}
  const id=r.id;
  if(typeof id!=='string'||!kebab.test(id))fail('Invalid asset ID: '+String(id));
  if(ids.has(id))fail('Duplicate ID: '+id);ids.add(id);
  if(Object.keys(r).some(k=>!keys.has(k)))fail(id+': unknown metadata property');
  if(!types.has(r.assetType))fail(id+': invalid asset type');
  if(typeof r.style!=='string'||!kebab.test(r.style))fail(id+': invalid style');
  if(!statuses.has(r.status))fail(id+': invalid status');
  if(r.variant!=null&&!variants.has(r.variant))fail(id+': invalid variant');
  if(r.aspectRatio!=null&&!ratios.has(r.aspectRatio))fail(id+': invalid aspect ratio');
  if(r.collection!=null&&!kebab.test(r.collection))fail(id+': invalid collection');
  if(r.usage!=null&&(!Array.isArray(r.usage)||r.usage.some(x=>typeof x!=='string'||!x)||new Set(r.usage).size!==r.usage.length))fail(id+': invalid usage list');
  if(typeof r.path!=='string'||!pathRule.test(r.path)) {fail(id+': invalid public path');continue;}
  if(paths.has(r.path))fail('Duplicate public path: '+r.path);paths.add(r.path);
  const dims=r.dimensions;
  if(dims!=null) {
    if(!Number.isInteger(dims.width)||dims.width<1||!Number.isInteger(dims.height)||dims.height<1)fail(id+': invalid dimensions');
    else if(!ratioMatches(dims.width,dims.height,r.aspectRatio))fail(id+': dimensions disagree with aspect ratio');
  }
  if(r.status==='uploaded'||r.status==='integrated') {
    published.add(r.path);
    const disk=path.join(root,'public',r.path.slice(1));
    if(!fs.statSync(disk,{throwIfNoEntry:false})?.isFile())fail(id+': missing published asset: '+r.path);
  }
}
for(const file of realFiles) if(imageExtensions.has(path.extname(file).toLowerCase())&&!published.has(file)) fail('Orphan/unregistered asset: '+file);
await Promise.all((Array.isArray(entries)?entries:[]).filter(r=>
  (r.status==='uploaded'||r.status==='integrated') && r.dimensions && /\.(png|jpe?g|webp|avif|gif)$/i.test(r.path)
).map(async r=>{
  try {
    const meta=await sharp(path.join(root,'public',r.path.slice(1))).metadata();
    if(meta.width!==r.dimensions.width||meta.height!==r.dimensions.height)fail(r.id+': actual dimensions '+meta.width+'x'+meta.height+' differ from registry');
  } catch(e) {fail(r.id+': cannot inspect dimensions: '+e.message);}
}));
if(errors.length){console.error('Asset validation failed:\n- '+errors.join('\n- '));process.exitCode=1;}
else console.log('Asset validation passed: '+required.size+' directories, '+ids.size+' registered images, '+published.size+' published paths; existing URLs preserved.');
