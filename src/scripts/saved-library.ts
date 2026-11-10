import { quotes } from '../lib/quote-data';
import { filterSavedQuotes, validateFavoritesImport, exportFavorites, MAX_SHARE_PACK_QUOTES } from '../lib/saved-library';
import type { SavedSort } from '../lib/saved-library';
import { readFavorites, saveFavorites, FAVORITES_STORAGE_KEY } from './favorites';
import { studioFormats, studioThemes } from '../lib/studio-config';
import type { StudioFormat, StudioTheme } from '../lib/studio-config';
import { downloadSharePack } from '../lib/artwork/share-pack';

const known=new Set(quotes.map(q=>q.id));
const byId=new Map(quotes.map(q=>[q.id,q]));
const gallery=document.querySelector<HTMLElement>('#saved-gallery');
const holders=[...document.querySelectorAll<HTMLElement>('.saved-card-holder')];
const holderById=new Map(holders.map(h=>[h.dataset.savedId??'',h]));
const search=document.querySelector<HTMLInputElement>('#saved-search');
const sort=document.querySelector<HTMLSelectElement>('#saved-sort');
const count=document.querySelector<HTMLElement>('#saved-count');
const empty=document.querySelector<HTMLElement>('#saved-empty');
const status=document.querySelector<HTMLElement>('#saved-status');
const exportButton=document.querySelector<HTMLButtonElement>('#saved-export');
const importInput=document.querySelector<HTMLInputElement>('#saved-import-file');
const clearButton=document.querySelector<HTMLButtonElement>('#saved-clear');
const packButton=document.querySelector<HTMLButtonElement>('#saved-pack-download');
const packFormat=document.querySelector<HTMLSelectElement>('#saved-pack-format');
const packTheme=document.querySelector<HTMLSelectElement>('#saved-pack-theme');
let favorites=new Set([...readFavorites()].filter(id=>known.has(id)));
const selected=new Set<string>();
let downloading=false;

function announce(message:string):void { if(status)status.textContent=message; }
function updatePackButton():void {
  if(packButton){
    packButton.disabled=!selected.size||downloading;
    packButton.textContent=downloading?'Preparing artwork…':`Download selected ZIP · ${selected.size} / ${MAX_SHARE_PACK_QUOTES}`;
  }
}
function refresh():void {
  const chosen=filterSavedQuotes(quotes,favorites,search?.value??'',(sort?.value??'recent') as SavedSort);
  const visible=new Set(chosen.map(q=>q.id));
  for(const id of [...selected])if(!favorites.has(id))selected.delete(id);
  for(const holder of holders){
    const id=holder.dataset.savedId??'';
    holder.hidden=!visible.has(id);
    const button=holder.querySelector<HTMLButtonElement>('.favorite-toggle');
    if(button){
      button.setAttribute('aria-pressed',String(favorites.has(id)));
      button.textContent=favorites.has(id)?'♥ Saved':'♡ Save';
    }
    const checkbox=holder.querySelector<HTMLInputElement>('.saved-pick-input');
    if(checkbox)checkbox.checked=selected.has(id);
  }
  // Keep actual original QuoteCard nodes, just reorder the existing elements.
  for(const quote of chosen){
    const holder=holderById.get(quote.id);
    if(holder)gallery?.append(holder);
  }
  if(count)count.textContent=`${chosen.length} of ${favorites.size} saved quotations`;
  if(empty){
    empty.hidden=chosen.length>0;
    const title=empty.querySelector('h2');
    if(title)title.textContent=favorites.size===0?'No saved quotes yet.':'Nothing matches your search.';
  }
  if(exportButton)exportButton.disabled=favorites.size===0;
  if(clearButton)clearButton.disabled=favorites.size===0;
  updatePackButton();
}
function saveCurrent(next:Set<string>,message:string):void {
  if(!saveFavorites(next)){announce('Browser storage is unavailable; your saved quotes were not changed.');return;}
  favorites=next;refresh();announce(message);
}
search?.addEventListener('input',refresh);
sort?.addEventListener('change',refresh);
gallery?.addEventListener('change',event=>{
  const target=event.target;
  if(!(target instanceof HTMLInputElement)||!target.matches('.saved-pick-input'))return;
  const id=target.dataset.pickId??'';
  if(!favorites.has(id)){target.checked=false;return;}
  if(target.checked){
    if(selected.size>=MAX_SHARE_PACK_QUOTES){target.checked=false;announce('Choose up to 5 quotes per artwork pack.');return;}
    selected.add(id);
  }else selected.delete(id);
  updatePackButton();
});
gallery?.addEventListener('click',async event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  const remove=target.closest<HTMLButtonElement>('.favorite-toggle');
  if(remove){
    const id=remove.dataset.quoteId??'';
    const q=byId.get(id);
    if(!q||!favorites.has(id))return;
    if(!window.confirm(`Remove the quote by ${q.person} from this browser's Saved Library?`))return;
    const next=new Set(favorites);next.delete(id);selected.delete(id);
    saveCurrent(next,'Quote removed from your saved library.');
    return;
  }
  const copy=target.closest<HTMLButtonElement>('.copy-quote');
  if(copy){
    try { await navigator.clipboard.writeText(copy.dataset.quoteText??'');announce('Complete quotation copied.'); }
    catch {announce('Clipboard access is unavailable; select the quotation text to copy manually.');}
  }
});
exportButton?.addEventListener('click',()=>{
  try {
    const content=exportFavorites([...favorites],known);
    const blob=new Blob([content],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='jester-quotes-saved.json';document.body.append(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),7000);
    announce(`Exported ${favorites.size} saved quote IDs as JSON.`);
  }catch(error){announce(error instanceof Error?error.message:'Export failed.');}
});
importInput?.addEventListener('change',async()=>{
  const file=importInput.files?.[0];if(!file)return;
  try {
    if(file.size>65536)throw new Error('Import must be 64 KB or smaller.');
    const ids=validateFavoritesImport(await file.text(),known);
    if(!window.confirm(`Replace ${favorites.size} locally saved quotes with ${ids.length} imported IDs? This cannot be undone except using a backup.`)) {
      announce('Import cancelled. No favorites changed.');return;
    }
    saveCurrent(new Set(ids),`Imported ${ids.length} valid quote IDs. Other tabs will update automatically.`);
    selected.clear();refresh();
  }catch(error){announce(error instanceof Error?error.message:'Invalid file; no saved quotes were changed.');}
  finally {importInput.value='';}
});
clearButton?.addEventListener('click',()=>{
  if(!favorites.size)return;
  if(!window.confirm(`Permanently clear all ${favorites.size} quotes saved in this browser? Export a backup first if needed.`))return;
  selected.clear();saveCurrent(new Set(),'Saved quotes cleared from this browser.');
});
packButton?.addEventListener('click',async()=>{
  if(!selected.size||downloading)return;
  const batch=[...selected].map(id=>byId.get(id)).filter((q):q is (typeof quotes)[number]=>Boolean(q));
  const format=(packFormat?.value??'square') as StudioFormat;
  const theme=(packTheme?.value??'midnight') as StudioTheme;
  if(!(format in studioFormats)||!(theme in studioThemes)){announce('Choose a valid canvas and palette.');return;}
  downloading=true;updatePackButton();
  try{
    const result=await downloadSharePack(batch,format,theme,announce);
    announce(`Downloaded ${result.quotes} complete quotes in ${result.slides} PNG slides, with attribution notes.`);
  }catch(error){announce(error instanceof Error?error.message:'Artwork pack download failed.');}
  finally{downloading=false;updatePackButton();}
});
window.addEventListener('storage',event=>{
  if(event.key===null||event.key===FAVORITES_STORAGE_KEY){
    favorites=new Set([...readFavorites()].filter(id=>known.has(id)));
    refresh();announce('Saved quotes updated from another browser tab.');
  }
});
try {localStorage.getItem(FAVORITES_STORAGE_KEY);}
catch {announce('Browser storage is blocked. Saved quotes cannot persist here.');}
refresh();
