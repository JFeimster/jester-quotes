const search = document.querySelector<HTMLInputElement>('#trickster-search');
const kind = document.querySelector<HTMLSelectElement>('#trickster-kind');
const medium = document.querySelector<HTMLSelectElement>('#trickster-medium');
const tag = document.querySelector<HTMLSelectElement>('#trickster-tag');
const reset = document.querySelector<HTMLButtonElement>('#trickster-reset');
const random = document.querySelector<HTMLButtonElement>('#trickster-random');
const count = document.querySelector<HTMLElement>('#trickster-count');
const empty = document.querySelector<HTMLElement>('#trickster-empty');
const status = document.querySelector<HTMLElement>('#trickster-status');
const cards = [...document.querySelectorAll<HTMLElement>('[data-trickster-card]')];
const searchable = (card: HTMLElement) => card.dataset.search ?? '';
function refresh(): HTMLElement[] {
  const query = search?.value.toLocaleLowerCase().trim() ?? '';
  const byKind = kind?.value ?? 'all';
  const byMedium = medium?.value ?? 'all';
  const byTag = tag?.value ?? 'all';
  const shown: HTMLElement[] = [];
  for(const card of cards) {
    const matches = (!query || searchable(card).includes(query))
      && (byKind === 'all' || card.dataset.kind === byKind)
      && (byMedium === 'all' || (card.dataset.media ?? '').split(' ').includes(byMedium))
      && (byTag === 'all' || (card.dataset.tags ?? '').split(' ').includes(byTag));
    card.hidden = !matches;
    if(matches) shown.push(card);
  }
  if(count) count.textContent = `${shown.length} of ${cards.length} documented profiles`;
  if(empty) empty.hidden = shown.length > 0;
  if(random) random.disabled = !shown.length;
  return shown;
}
search?.addEventListener('input', refresh);
for(const control of [kind,medium,tag]) control?.addEventListener('change',refresh);
reset?.addEventListener('click',()=>{
  if(search) search.value='';
  if(kind) kind.value='all';
  if(medium) medium.value='all';
  if(tag) tag.value='all';
  refresh();
  search?.focus();
});
random?.addEventListener('click',()=>{
  const visible=refresh();
  if(!visible.length) return;
  const index=Math.min(visible.length-1,Math.floor(Math.random()*visible.length));
  const link=visible[index].querySelector<HTMLAnchorElement>('h3 a');
  if(link) window.location.assign(link.href);
  else if(status) status.textContent='No verified profile is available.';
});
refresh();
