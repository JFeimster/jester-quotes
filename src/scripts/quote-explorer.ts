import { readFavorites, saveFavorites, FAVORITES_STORAGE_KEY } from './favorites';
import { chooseRandomQuoteId, matchesQuoteFilters } from '../lib/quote-interactions';

let favorites = readFavorites();
const cards = [...document.querySelectorAll<HTMLElement>('.quote-card')];
const search = document.querySelector<HTMLInputElement>('#quote-search');
const reference = document.querySelector<HTMLSelectElement>('#reference-filter');
const favoritesFilter = document.querySelector<HTMLInputElement>('#favorites-filter');
const resultCount = document.querySelector<HTMLElement>('#result-count');
const summary = document.querySelector<HTMLElement>('#favorites-summary');
const empty = document.querySelector<HTMLElement>('#empty-state');
const status = document.querySelector<HTMLElement>('#interaction-status');
const feedbackTimers = new WeakMap<HTMLButtonElement, number>();

function announce(message: string): void {
  if (status) status.textContent = message;
}

function refresh(): void {
  const filters = {
    query: search?.value ?? '',
    reference: (reference?.value ?? 'all') as 'all' | 'yes' | 'no',
    favoritesOnly: favoritesFilter?.checked ?? false
  };
  let visible = 0;
  for (const card of cards) {
    const matches = matchesQuoteFilters({
      id: card.dataset.id ?? '',
      searchText: card.dataset.search ?? '',
      hasReference: card.dataset.reference === 'yes'
    }, filters, favorites);
    card.hidden = !matches;
    if (matches) visible++;
  }
  if (resultCount) resultCount.textContent = `${visible} of ${cards.length} quotes`;
  if (empty) {
    empty.hidden = visible !== 0;
    empty.textContent = filters.favoritesOnly && favorites.size === 0
      ? 'No favorites saved yet. Save a quote to see it here.'
      : 'No quotes match those filters. Try clearing your search.';
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('.favorite-toggle')) {
    const selected = favorites.has(button.dataset.quoteId ?? '');
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected
      ? (button.dataset.savedLabel ?? '♥ Saved')
      : (button.dataset.unsavedLabel ?? '♡ Save');
    const person = button.dataset.person ?? 'this author';
    button.setAttribute(
      'aria-label',
      selected ? `Remove quote by ${person} from favorites` : `Save quote by ${person} to favorites`
    );
  }
  if (summary) summary.textContent = `${favorites.size} quote${favorites.size === 1 ? '' : 's'} saved in this browser.`;
}

function clearFilters(): void {
  if (search) search.value = '';
  if (reference) reference.value = 'all';
  if (favoritesFilter) favoritesFilter.checked = false;
  refresh();
}

function showFavorites(): void {
  if (!favoritesFilter) {
    window.location.href = '/quotes/#explore';
    return;
  }
  if (search) search.value = '';
  if (reference) reference.value = 'all';
  favoritesFilter.checked = true;
  refresh();
  document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' });
}

function flash(button: HTMLButtonElement, message: string): void {
  const original = button.dataset.originalLabel ?? button.textContent ?? '';
  button.dataset.originalLabel = original;
  const previous = feedbackTimers.get(button);
  if (previous !== undefined) window.clearTimeout(previous);
  button.textContent = message;
  const timeout = window.setTimeout(() => { button.textContent = original; feedbackTimers.delete(button); }, 1800);
  feedbackTimers.set(button, timeout);
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch { /* Try the legacy selection path on insecure/restricted contexts. */ }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(field);
  field.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Copy blocked');
  } finally {
    field.remove();
  }
}

search?.addEventListener('input', refresh);
reference?.addEventListener('change', refresh);
favoritesFilter?.addEventListener('change', refresh);
document.querySelector('#clear-filters')?.addEventListener('click', clearFilters);
document.querySelector('#show-favorites')?.addEventListener('click', showFavorites);

document.querySelector('#surprise-me')?.addEventListener('click', () => {
  const cardIds = cards.map((card) => card.dataset.id ?? '').filter(Boolean);
  const fallbackIds = (document.querySelector<HTMLButtonElement>('#surprise-me')?.dataset.quoteIds ?? '').split(',').filter(Boolean);
  const id = chooseRandomQuoteId(cardIds.length ? cardIds : fallbackIds);
  if (id) window.location.href = `/quotes/${encodeURIComponent(id)}/`;
});

window.addEventListener('storage', (event) => {
  if (event.key !== null && event.key !== FAVORITES_STORAGE_KEY) return;
  favorites = readFavorites();
  refresh();
  announce('Favorites were updated in another tab.');
});

document.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const favoriteButton = target.closest<HTMLButtonElement>('.favorite-toggle');
  if (favoriteButton) {
    const id = favoriteButton.dataset.quoteId ?? '';
    if (!id) return;
    const wasSaved = favorites.has(id);
    if (wasSaved) favorites.delete(id);
    else favorites.add(id);
    const persisted = saveFavorites(favorites);
    refresh();
    announce(persisted
      ? (wasSaved ? 'Quote removed from favorites.' : 'Quote saved to favorites.')
      : 'Favorites changed for this page, but browser storage is unavailable.');
    return;
  }

  const copyButton = target.closest<HTMLButtonElement>('.copy-quote');
  if (copyButton) {
    try {
      await copyText(copyButton.dataset.quoteText ?? '');
      flash(copyButton, 'Copied ✓');
      announce('Quote copied to clipboard.');
    } catch {
      flash(copyButton, 'Copy unavailable');
      announce('Could not copy. Please select and copy the quote manually.');
    }
    return;
  }

  const shareButton = target.closest<HTMLButtonElement>('.share-quote');
  if (shareButton) {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
        announce('Link shared.');
        return;
      } catch (error) {
        // Cancellation is intentional; all other failures fall back to copying.
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    try {
      await copyText(window.location.href);
      flash(shareButton, 'Link copied ✓');
      announce('Quote link copied to clipboard.');
    } catch {
      flash(shareButton, 'Share unavailable');
      announce('Sharing is unavailable. Copy the page URL from your browser.');
    }
  }
});

refresh();
