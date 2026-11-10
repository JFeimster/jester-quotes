import type { Quote } from '../../types/quote';
import type { StudioFormat, StudioTheme } from '../studio-config';
import { planArtwork, drawArtwork } from './canvas-renderer';
import { makeUncompressedZip } from './export-image';
import type { NamedImage } from './export-image';

function getPng(canvas:HTMLCanvasElement):Promise<Blob>{
  return new Promise((resolve,reject)=>{
    try{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Canvas PNG export blocked')),'image/png');}
    catch(error){reject(error);}
  });
}
function downloadZip(blob:Blob,filename:string):void {
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.append(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),7000);
}
export async function downloadSharePack(
  selections: readonly Quote[], format: StudioFormat, theme: StudioTheme,
  notify:(message:string)=>void
):Promise<{slides:number;quotes:number}>{
  if(selections.length<1||selections.length>5) throw new Error('Select between 1 and 5 saved quotations.');
  if(new Set(selections.map(q=>q.id)).size!==selections.length) throw new Error('Duplicate quote selection.');
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas export is unavailable in this browser.');
  const entries:NamedImage[]=[];
  const rights=[
    'JESTER QUOTES — SOURCES AND RIGHTS',
    'This pack preserves the quotations and author attributions supplied in the original Jester Quotes registry.',
    'Attribution is NOT a copyright license. Confirm permission or an applicable legal basis before publication, merchandising, or reuse.',
    'Original collection source: https://knowyourarchetypes.com/jester-quotes/',
    'Corrections and reuse information: https://jester-quotes.vercel.app/sources/',
    '', 'CONTENTS'
  ];
  let slideCount=0;
  for(const quote of selections){
    const plan=planArtwork(ctx,{text:quote.quote,person:quote.person,id:quote.id,format,theme,border:true});
    if(slideCount+plan.pages.length>40)throw new Error('This pack would exceed 40 slides; select fewer quotes.');
    rights.push('',quote.id+' — '+quote.person,quote.quote,quote.reference?'Reference: '+quote.reference:'No additional source reference was supplied.');
    for(let slide=0;slide<plan.pages.length;slide++){
      drawArtwork(ctx,plan,slide);
      notify(`Rendering quote ${selections.indexOf(quote)+1} / ${selections.length}, slide ${slide+1} / ${plan.pages.length}…`);
      entries.push({name:`${quote.id}-${format}-slide-${String(slide+1).padStart(2,'0')}.png`,blob:await getPng(canvas)});
      slideCount++;
    }
  }
  entries.push({name:'RIGHTS-AND-ATTRIBUTIONS.txt',blob:new Blob([rights.join('\n')+'\n'],{type:'text/plain;charset=utf-8'})});
  notify('Packaging complete PNG slides and attribution notes…');
  const file=await makeUncompressedZip(entries);
  downloadZip(file,`jester-quotes-complete-pack-${format}-${selections.length}-quotes.zip`);
  return {slides:slideCount,quotes:selections.length};
}
