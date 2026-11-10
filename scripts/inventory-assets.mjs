#!/usr/bin/env node
/** Deterministic CSV from the canonical registry. --write updates the checked-in inventory. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(root,'src/data/image-assets.json'),'utf8'));
const cols=['id','path','assetType','style','collection','variant','aspectRatio','width','height','status','usage','fileExists','notes'];
const esc=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
const values=r=>[r.id,r.path,r.assetType,r.style,r.collection,r.variant,r.aspectRatio,r.dimensions?.width,r.dimensions?.height,r.status,(r.usage??[]).join(';'),fs.existsSync(path.join(root,'public',r.path.slice(1)))?'yes':'no',r.notes];
const csv=cols.map(esc).join(',')+'\n'+data.map(r=>values(r).map(esc).join(',')).join('\n')+'\n';
if(process.argv.includes('--write')) {
  fs.writeFileSync(path.join(root,'data/asset-inventory.csv'),csv);
  console.log('Updated data/asset-inventory.csv ('+data.length+' records)');
} else process.stdout.write(csv);
