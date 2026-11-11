import type { SiteSearchItem, SiteSearchKind } from '../lib/site-search';

const input = document.querySelector<HTMLInputElement>('#site-search-input');
const form = document.querySelector<HTMLFormElement>('#site-search-form');
const status = document.querySelector<HTMLElement>('#site-search-status');
const resultList = document.querySelector<HTMLUListElement>('#site-search-results');
const empty = document.querySelector<HTMLElement>('#site-search-empty');
const filterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-site-filter]')];
type Filter = SiteSearchKind | 'all';
let active: Filter = 'all';
let items: SiteSearchItem[] = [];
const kindNames: Record<SiteSearchKind,string> = {
  quotes:'QUOTE',collections:'COLLECTION',tricksters:'TRICKSTER',
  videos:'VIDEO',resources:'RESOURCE'
};
function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
}
function ranking(item: SiteSearchItem, terms: string[]): number {
  const title = normalize(item.title), source = normalize(item.source), tags = normalize(item.tags.join(' '));
  const all = normalize(item.searchText);
  if (!terms.every(term=>all.includes(term))) return 0;
  return terms.reduce((score,term)=>score+(title.startsWith(term)?10:0)+(title.includes(term)?5:0)+(tags.includes(term)?4:0)+(source.includes(term)?2:0)+1,0);
}
function resultItem(item: SiteSearchItem): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'site-search-result';
  const link = document.createElement('a');
  link.href = item.href;
  const type = document.createElement('span');
  type.className = 'site-search-kind';
  type.textContent = kindNames[item.kind];
  const title = document.createElement('strong');
  title.textContent = item.title;
  const source = document.createElement('span');
  source.className = 'site-search-source';
  source.textContent = item.source;
  const desc = document.createElement('p');
  desc.textContent = item.summary;
  const arrow = document.createElement('span');
  arrow.className = 'site-search-arrow';
  arrow.textContent = 'OPEN ↗';
  link.append(type,title,source,desc,arrow);
  li.appendChild(link);
  return li;
}
function render(): void {
  if (!input || !resultList || !status || !empty) return;
  const query = input.value.trim();
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const candidates = items.filter(item=>active==='all' || item.kind===active);
  const matches = terms.length
    ? candidates.map(item=>({item,score:ranking(item,terms)})).filter(hit=>hit.score>0)
      .sort((a,b)=>b.score-a.score || a.item.title.localeCompare(b.item.title)).map(hit=>hit.item)
    : candidates.slice(0,20);
  const view = matches.slice(0,30);
  resultList.replaceChildren(...view.map(resultItem));
  empty.hidden = matches.length !== 0;
  if (terms.length) {
    status.textContent = matches.length ? matches.length+' matching results'+(matches.length>30?' · showing first 30':'') : 'No matching results';
  } else {
    status.textContent = 'Explore the collection or search for something specific · '+items.length+' indexed entries';
  }
}
function updateQuery(): void {
  if (!input) return;
  const url = new URL(window.location.href);
  if (input.value.trim()) url.searchParams.set('q',input.value.trim());
  else url.searchParams.delete('q');
  window.history.replaceState(null,'',url.pathname+url.search);
  render();
}
const query = new URL(window.location.href).searchParams.get('q');
if (input && query) input.value = query.slice(0,180);
input?.addEventListener('input',updateQuery);
form?.addEventListener('submit',event=>{event.preventDefault();updateQuery();});
for (const button of filterButtons) {
  button.addEventListener('click',()=>{
    active = (button.dataset.siteFilter ?? 'all') as Filter;
    filterButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    render();
  });
}
fetch('/search-index.json')
  .then(async response=>{
    if(!response.ok) throw new Error('Search index unavailable');
    const data: unknown = await response.json();
    if(!Array.isArray(data)) throw new Error('Search index invalid');
    items = data as SiteSearchItem[];
    render();
  })
  .catch(()=>{
    if(status)status.textContent='Search is temporarily unavailable. Browse the directories below instead.';
    if(empty){empty.hidden=false;empty.textContent='Browse Quotes, Tricksters, Videos or Resources from the site menu.';}
  });
