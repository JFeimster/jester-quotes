const search = document.querySelector<HTMLInputElement>('#trickster-search');
const kind = document.querySelector<HTMLSelectElement>('#trickster-kind');
const medium = document.querySelector<HTMLSelectElement>('#trickster-medium');
const tag = document.querySelector<HTMLSelectElement>('#trickster-tag');
const reset = document.querySelector<HTMLButtonElement>('#trickster-reset');
const random = document.querySelector<HTMLButtonElement>('#trickster-random');
const heroRandom = document.querySelector<HTMLButtonElement>('#trickster-hero-random');
const density = document.querySelector<HTMLButtonElement>('#trickster-density');
const grid = document.querySelector<HTMLElement>('#trickster-grid');
const active = document.querySelector<HTMLElement>('#trickster-active-filters');
const count = document.querySelector<HTMLElement>('#trickster-count');
const empty = document.querySelector<HTMLElement>('#trickster-empty');
const status = document.querySelector<HTMLElement>('#trickster-status');
const cards = [...document.querySelectorAll<HTMLElement>('[data-trickster-card]')];
const dialog = document.querySelector<HTMLDialogElement>('#trickster-quick-view');
const close = document.querySelector<HTMLButtonElement>('#trickster-quick-close');
const quickImage = document.querySelector<HTMLImageElement>('#trickster-quick-image');
const quickArt = document.querySelector<HTMLElement>('#trickster-quick-art');
const controls = { kind, medium, tag };
type FilterName = keyof typeof controls;

function writeUrl() {
  const url = new URL(location.href);
  const values = { q: search?.value.trim() ?? '', kind: kind?.value ?? 'all', medium: medium?.value ?? 'all', tag: tag?.value ?? 'all', density: grid?.classList.contains('is-compact') ? 'compact' : '' };
  for (const [key, value] of Object.entries(values)) {
    if (value && value !== 'all') url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, '', url);
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  if (search) search.value = params.get('q') ?? '';
  for (const [name, control] of Object.entries(controls)) {
    if (control) control.value = [...control.options].some(option => option.value === params.get(name)) ? params.get(name)! : 'all';
  }
  const compact = params.get('density') === 'compact';
  grid?.classList.toggle('is-compact', compact);
  if (density) {
    density.setAttribute('aria-pressed', String(compact));
    density.textContent = compact ? 'Standard view' : 'Compact view';
  }
}

function renderActive() {
  if (!active) return;
  active.replaceChildren();
  const filters = [
    { name: 'q', label: `Search: ${search?.value.trim() ?? ''}`, on: Boolean(search?.value.trim()) },
    ...Object.entries(controls).map(([name, control]) => ({ name, label: `${name === 'kind' ? 'Figure type' : name === 'medium' ? 'Medium' : 'Trait'}: ${control?.selectedOptions[0]?.textContent ?? ''}`, on: Boolean(control && control.value !== 'all') }))
  ];
  for (const filter of filters.filter(item => item.on)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trickster-active-chip';
    button.dataset.removeFilter = filter.name;
    button.textContent = `${filter.label} ×`;
    button.setAttribute('aria-label', `Remove ${filter.label} filter`);
    active.append(button);
  }
  active.hidden = !active.childElementCount;
  if (reset) reset.disabled = !active.childElementCount;
}

function refresh(updateUrl = true): HTMLElement[] {
  const query = search?.value.toLocaleLowerCase().trim() ?? '';
  const byKind = kind?.value ?? 'all';
  const byMedium = medium?.value ?? 'all';
  const byTag = tag?.value ?? 'all';
  const shown: HTMLElement[] = [];
  for (const card of cards) {
    const matches = (!query || (card.dataset.search ?? '').includes(query))
      && (byKind === 'all' || card.dataset.kind === byKind)
      && (byMedium === 'all' || (card.dataset.medium ?? '').split(' ').includes(byMedium))
      && (byTag === 'all' || (card.dataset.tags ?? '').split(' ').includes(byTag));
    card.hidden = !matches;
    if (matches) shown.push(card);
  }
  if (count) count.textContent = `${shown.length} of ${cards.length} entries`;
  if (empty) empty.hidden = shown.length > 0;
  for (const button of [random, heroRandom]) if (button) button.disabled = !shown.length;
  renderActive();
  if (updateUrl) writeUrl();
  return shown;
}

function openQuickView(card: HTMLElement) {
  if (!dialog) return;
  const image = card.querySelector<HTMLImageElement>('.trickster-registry-art img');
  const hasImage = Boolean(image?.src && !card.querySelector('.trickster-registry-art')?.classList.contains('no-image'));
  if (quickArt) quickArt.classList.toggle('no-image', !hasImage);
  if (quickImage) {
    quickImage.src = hasImage ? image!.src : '';
    quickImage.alt = hasImage ? image!.alt : '';
  }
  for (const [selector, value] of [
    ['#trickster-quick-kind', card.dataset.kindLabel ?? ''],
    ['#trickster-quick-title', card.dataset.name ?? ''],
    ['#trickster-quick-origin', card.dataset.origin ?? ''],
    ['#trickster-quick-summary', card.dataset.summary ?? '']
  ]) {
    const target = dialog.querySelector<HTMLElement>(selector);
    if (target) target.textContent = value;
  }
  // Full media and trait labels live on the card's data attributes, not in its compact UI.
  // Keep all entries available in Quick View even when the card has no visible chips.
  for (const [selector, datasetValue] of [
    ['#trickster-quick-media', card.dataset.mediaLabels],
    ['#trickster-quick-traits', card.dataset.traitLabels]
  ] as const) {
    const target = dialog.querySelector<HTMLElement>(selector);
    if (!target) continue;
    let values: string[] = [];
    try {
      const parsed: unknown = JSON.parse(datasetValue ?? '[]');
      if (Array.isArray(parsed)) values = parsed.filter((item): item is string => typeof item === 'string');
    } catch { values = []; }
    target.replaceChildren(...values.map(value => {
      const span = document.createElement('span');
      span.textContent = value;
      return span;
    }));
  }
  dialog.showModal();
  close?.focus();
}

search?.addEventListener('input', () => refresh());
for (const control of Object.values(controls)) control?.addEventListener('change', () => refresh());
reset?.addEventListener('click', () => {
  if (search) search.value = '';
  for (const control of Object.values(controls)) if (control) control.value = 'all';
  refresh();
  search?.focus();
});
active?.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-remove-filter]');
  if (!button) return;
  const name = button.dataset.removeFilter;
  if (name === 'q' && search) search.value = '';
  else if (name && name in controls) {
    const control = controls[name as FilterName];
    if (control) control.value = 'all';
  }
  refresh();
});
grid?.addEventListener('click', event => {
  const target = event.target as Element;
  const chip = target.closest<HTMLButtonElement>('[data-filter]');
  if (chip) {
    const control = controls[chip.dataset.filter as FilterName];
    if (control && chip.dataset.value) {
      control.value = control.value === chip.dataset.value ? 'all' : chip.dataset.value;
      refresh();
    }
    return;
  }
  const opener = target.closest<HTMLButtonElement>('[data-quick-open]');
  const card = opener?.closest<HTMLElement>('[data-trickster-card]');
  if (card) openQuickView(card);
});
density?.addEventListener('click', () => {
  const compact = grid?.classList.toggle('is-compact') ?? false;
  density.setAttribute('aria-pressed', String(compact));
  density.textContent = compact ? 'Standard view' : 'Compact view';
  writeUrl();
});
const selectRandom = () => {
  const shown = refresh();
  if (!shown.length) return;
  const target = shown[Math.floor(Math.random() * shown.length)];
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.focus({ preventScroll: true });
  if (status) status.textContent = `Selected ${target.dataset.name ?? 'a trickster'}`;
};
random?.addEventListener('click', selectRandom);
heroRandom?.addEventListener('click', selectRandom);
close?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
quickImage?.addEventListener('error', () => quickArt?.classList.add('no-image'));
window.addEventListener('popstate', () => { readUrl(); refresh(false); });
readUrl();
refresh(false);
export {};
