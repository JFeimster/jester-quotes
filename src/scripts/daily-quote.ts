import { quotes } from '../lib/quote-data';
import { tricksters } from '../lib/tricksters';
import { dailyQuoteId, utcDayKey } from '../lib/daily-quote';
import { relatedToQuote } from '../lib/related-content';
import { readFavorites, saveFavorites } from './favorites';

const byId = new Map(quotes.map(q=>[q.id,q]));
const dateLabel = document.querySelector<HTMLElement>('#daily-utc-date');
const quoteText = document.querySelector<HTMLElement>('#daily-quote-text');
const person = document.querySelector<HTMLElement>('#daily-person');
const detail = document.querySelector<HTMLAnchorElement>('#daily-detail');
const studio = document.querySelector<HTMLAnchorElement>('#daily-studio');
const save = document.querySelector<HTMLButtonElement>('#daily-save');
const copy = document.querySelector<HTMLButtonElement>('#daily-copy');
const random = document.querySelector<HTMLButtonElement>('#daily-random-trickster');
const status = document.querySelector<HTMLElement>('#daily-status');
const related = document.querySelector<HTMLElement>('#daily-related');
const today = utcDayKey();
const selected = today ? byId.get(dailyQuoteId(quotes.map(q=>q.id), today) ?? '') : null;

function report(message:string):void {if(status)status.textContent=message;}
function refreshSaved():void {
  if(!save||!selected) return;
  const isSaved=readFavorites().has(selected.id);
  save.setAttribute('aria-pressed',String(isSaved));
  save.textContent=isSaved ? '♥ Saved in this browser' : '♡ Save today’s quote';
}
if(selected && today && quoteText && person){
  if(dateLabel)dateLabel.textContent=today+' · UTC';
  quoteText.textContent='“'+selected.quote+'”';
  person.textContent='— '+selected.person+(selected.reference?' · '+selected.reference:'');
  if(detail)detail.href='/quotes/'+encodeURIComponent(selected.id)+'/';
  if(studio)studio.href='/studio/?quote='+encodeURIComponent(selected.id);
  if(save)save.disabled=false;
  if(copy)copy.disabled=false;
  refreshSaved();
  const connections=relatedToQuote(selected.id);
  if(related){
    const wrap=document.createElement('section');
    wrap.className='daily-connection';
    const head=document.createElement('h2');
    head.textContent='Follow the thought.';
    wrap.append(head);
    const links=document.createElement('div');
    links.className='utility-related-grid';
    for(const item of connections.collections.slice(0,2)){
      const a=document.createElement('a');a.href='/collections/'+item.slug+'/';
      a.textContent='Quote collection · '+item.title+' ↗';links.append(a);
    }
    for(const item of connections.tricksters.slice(0,2)){
      const a=document.createElement('a');a.href='/tricksters/'+item.slug+'/';
      a.textContent='Related editorial theme · '+item.name+' ↗';links.append(a);
    }
    if(links.childElementCount){wrap.append(links);const note=document.createElement('p');note.className='utility-related-note';note.textContent='These are broad editorial theme connections, not claims about the quote author.';wrap.append(note);related.append(wrap);}
  }
}else report('The daily quotation is unavailable. Browse the complete archive instead.');

save?.addEventListener('click',()=>{
  if(!selected)return;
  const saved=readFavorites(),wasSaved=saved.has(selected.id);
  if(wasSaved){saved.delete(selected.id);}else{saved.add(selected.id);}
  if(!saveFavorites(saved)){report('Browser storage is unavailable. Nothing was saved.');return;}
  refreshSaved();report(wasSaved?'Removed from your private shelf.':'Saved to this browser. Open the Saved Library to find it.');
});
copy?.addEventListener('click',async()=>{
  if(!selected)return;
  try{await navigator.clipboard.writeText(selected.quote+'\n— '+selected.person);report('Full quotation copied.');}
  catch{report('Clipboard access is unavailable. Select the quote to copy it manually.');}
});
random?.addEventListener('click',()=>{
  const published=tricksters.filter(t=>t.verification_status==='verified');
  if(!published.length){report('No verified Trickster profiles are currently available.');return;}
  const index=Math.min(published.length-1,Math.floor(Math.random()*published.length));
  window.location.assign('/tricksters/'+encodeURIComponent(published[index].slug)+'/');
});
window.addEventListener('storage',event=>{if(event.key===null||event.key==='jester-quotes:favorites:v1')refreshSaved();});
