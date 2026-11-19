import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const shared=['jester-branding-guide.json','jester-editorial-voice.json','jester-brands.json','archetypes.json','jesters-in-media.json','jesters-in-media-images.json','jesters-in-media-notes.json'];
for(const file of shared){
 const from=path.join(root,'src/data',file),to=path.join(root,'sites/dada-riot/src/data',file);
 const contents=readFileSync(from,'utf8');JSON.parse(contents);writeFileSync(to,contents);
 process.stdout.write('Synced '+file+'\n');
}
