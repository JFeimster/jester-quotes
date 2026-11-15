import type { SiteSearchItem, SiteSearchKind } from '../lib/site-search';
import { SEARCH_PAGE_SIZE, categoryCounts, readSearchState, searchPage, searchResults, type SearchFilter } from '../lib/search-results';

const input = document.querySelector<HTMLInputElement>('#site-search-input');
const form = document.querySelector<HTMLFormElement>('#site-search-form');
const status = document.querySelector<HTMLElement>('#site-search-status');
const resultList = document.querySelector<HTMLUListElement>('#site-search-results');
const empty = document.querySelector<HTMLElement>('#site-search-empty');
const more = document.querySelector<HTMLButtonElement>('#site-search-more');
const filterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-site-filter]')];
let active: SearchFilter = 'all';
let items: SiteSearchItem[] = [];
let loaded = false;
let shown = 20;
let queryHistoryStarted = false;
const kindNames: Record<SiteSearchKind,string> = {
  quotes:'QUOTE',collections:'COLLECTION',tricksters:'TRICKSTER',
  videos:'VIDEO',resources:'RESOURCE',archetypes:'ARCHETYPE',media:'MEDIA CHARACTER',brands:'BRAND'
};

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
  if (!loaded || !input || !resultList || !status || !empty || !more) return;
  const query = input.value.trim();
  const allMatches = searchResults(items, query);
  const counts = categoryCounts(allMatches);
  const matches = active === 'all' ? allMatches : allMatches.filter(item => item.kind === active);
  const visible = searchPage(matches, shown);
  resultList.replaceChildren(...visible.map(resultItem));
  empty.hidden = matches.length !== 0;
  more.hidden = visible.length >= matches.length;
  if (!more.hidden) more.textContent = `SHOW ${Math.min(SEARCH_PAGE_SIZE, matches.length - visible.length)} MORE ↗`;
  for (const button of filterButtons) {
    const filter = button.dataset.siteFilter as SearchFilter;
    button.setAttribute('aria-pressed', String(filter === active));
    const count = button.querySelector<HTMLElement>('[data-filter-count]');
    if (count) count.textContent = counts[filter].toLocaleString();
  }
  status.textContent = matches.length
    ? `${matches.length.toLocaleString()} ${query ? 'matching' : 'indexed'} ${matches.length === 1 ? 'result' : 'results'} · showing ${visible.length.toLocaleString()}`
    : query ? 'No matching results' : 'No indexed results in this category';
}

function writeUrl(mode: 'push' | 'replace'): void {
  if (!input) return;
  const url = new URL(window.location.href);
  const query = input.value.trim();
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  if (active !== 'all') url.searchParams.set('category', active);
  else url.searchParams.delete('category');
  const next = url.pathname + url.search + url.hash;
  if (next !== window.location.pathname + window.location.search + window.location.hash)
    window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', next);
}

function restoreUrl(): void {
  const state = readSearchState(new URL(window.location.href));
  if (input) input.value = state.query;
  active = state.filter;
  shown = state.query ? SEARCH_PAGE_SIZE : 20;
  queryHistoryStarted = false;
  render();
}

restoreUrl();
input?.addEventListener('input', () => {
  shown = input.value.trim() ? SEARCH_PAGE_SIZE : 20;
  writeUrl(queryHistoryStarted ? 'replace' : 'push');
  queryHistoryStarted = true;
  render();
});
form?.addEventListener('submit', event => {
  event.preventDefault();
  writeUrl('replace');
  render();
  resultList?.querySelector<HTMLAnchorElement>('a')?.focus();
});
for (const button of filterButtons) {
  button.addEventListener('click', () => {
    active = button.dataset.siteFilter as SearchFilter;
    shown = input?.value.trim() ? SEARCH_PAGE_SIZE : 20;
    queryHistoryStarted = false;
    writeUrl('push');
    render();
  });
}
more?.addEventListener('click', () => {
  const previous = resultList?.childElementCount ?? 0;
  shown += SEARCH_PAGE_SIZE;
  render();
  resultList?.children[previous]?.querySelector<HTMLAnchorElement>('a')?.focus();
});
window.addEventListener('popstate', restoreUrl);

fetch('/search-index.json')
  .then(async response => {
    if (!response.ok) throw new Error('Search index unavailable');
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error('Search index invalid');
    items = data as SiteSearchItem[];
    loaded = true;
    resultList?.setAttribute('aria-busy', 'false');
    render();
  })
  .catch(() => {
    resultList?.setAttribute('aria-busy', 'false');
    if (status) status.textContent = 'Search is temporarily unavailable. Browse the directories below instead.';
    if (empty) { empty.hidden = false; empty.textContent = 'Browse Quotes, Tricksters, Videos or Resources from the site menu.'; }
  });
