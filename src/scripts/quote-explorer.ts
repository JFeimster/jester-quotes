import { readFavorites, saveFavorites } from './favorites';
const favorites = readFavorites();
const cards = [...document.querySelectorAll<HTMLElement>('.quote-card')];
const search = document.querySelector<HTMLInputElement>('#quote-search');
const reference = document.querySelector<HTMLSelectElement>('#reference-filter');
const favoritesFilter = document.querySelector<HTMLInputElement>('#favorites-filter');
const resultCount = document.querySelector<HTMLElement>('#result-count');
const summary = document.querySelector<HTMLElement>('#favorites-summary');
const empty = document.querySelector<HTMLElement>('#empty-state');
function refresh() {
  const query = search?.value.toLocaleLowerCase().trim() ?? '';
  let visible = 0;
  for (const card of cards) {
    const matches = (!query || (card.dataset.search ?? '').includes(query))
      && (!reference || reference.value === 'all' || card.dataset.reference === reference.value)
      && (!favoritesFilter?.checked || favorites.has(card.dataset.id ?? ''));
    card.hidden = !matches;
    if (matches) visible++;
  }
  if (resultCount) resultCount.textContent = `${visible} of ${cards.length} quotes`;
  if (empty) empty.hidden = visible !== 0;
  for (const button of document.querySelectorAll<HTMLButtonElement>('.favorite-toggle')) {
    const selected = favorites.has(button.dataset.quoteId ?? '');
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected ? '♥ Saved' : '♡ Save';
  }
  if (summary) summary.textContent = `${favorites.size} quote${favorites.size === 1 ? '' : 's'} saved in this browser.`;
}
search?.addEventListener('input', refresh);
reference?.addEventListener('change', refresh);
favoritesFilter?.addEventListener('change', refresh);
document.querySelector('#show-favorites')?.addEventListener('click', () => {
  if (favoritesFilter) { favoritesFilter.checked = true; refresh(); document.querySelector('#explore')?.scrollIntoView({behavior:'smooth'}); }
  else { window.location.href = '/#explore'; }
});
document.querySelector('#surprise-me')?.addEventListener('click', () => {
  if (!cards.length) return;
  const quote = cards[Math.floor(Math.random() * cards.length)];
  window.location.href = `/quotes/${encodeURIComponent(quote.dataset.id ?? '')}/`;
});
document.addEventListener('click', async (ev) => {
  const target = ev.target;
  if (!(target instanceof Element)) return;
  const favoriteButton = target.closest<HTMLButtonElement>('.favorite-toggle');
  if (favoriteButton) {
    const id = favoriteButton.dataset.quoteId ?? '';
    if (!id) return;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    saveFavorites(favorites); refresh();
  }
  const copyButton = target.closest<HTMLButtonElement>('.copy-quote');
  if (copyButton) {
    try { await navigator.clipboard.writeText(copyButton.dataset.quoteText ?? ''); copyButton.textContent = 'Copied ✓'; setTimeout(()=>copyButton.textContent = 'Copy', 1600); }
    catch { copyButton.textContent = 'Copy unavailable'; }
  }
  const shareButton = target.closest<HTMLButtonElement>('.share-quote');
  if (shareButton) {
    try {
      if (navigator.share) await navigator.share({url: window.location.href});
      else { await navigator.clipboard.writeText(window.location.href); shareButton.textContent = 'Link copied ✓'; }
    } catch { /* user cancelled */ }
  }
});
refresh();
