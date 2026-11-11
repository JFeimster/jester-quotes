// Shared progressive enhancement for resource and video catalogs.
// With JavaScript disabled, every card and external link remains visible.
const catalog = document.querySelector<HTMLElement>('[data-catalog]');
if (catalog) {
  const search = catalog.querySelector<HTMLInputElement>('#catalog-search');
  const type = catalog.querySelector<HTMLSelectElement>('#catalog-type');
  const channel = catalog.querySelector<HTMLSelectElement>('#catalog-channel');
  const tag = catalog.querySelector<HTMLSelectElement>('#catalog-tag');
  const reset = catalog.querySelector<HTMLButtonElement>('#catalog-reset');
  const count = catalog.querySelector<HTMLElement>('#catalog-count');
  const empty = catalog.querySelector<HTMLElement>('#catalog-empty');
  const cards = [...catalog.querySelectorAll<HTMLElement>('[data-catalog-card]')];
  function filter() {
    const query = search?.value.toLocaleLowerCase().trim() ?? '';
    const category = type?.value ?? 'all';
    const publisher = channel?.value ?? 'all';
    const theme = tag?.value ?? 'all';
    let visible = 0;
    for (const card of cards) {
      const tags = (card.dataset.tags ?? '').split(' ');
      const match = (!query || (card.dataset.search ?? '').includes(query))
        && (category === 'all' || card.dataset.type === category)
        && (publisher === 'all' || card.dataset.channel === publisher)
        && (theme === 'all' || tags.includes(theme));
      card.hidden = !match;
      if (match) visible++;
    }
    if (count) count.textContent = `${visible} of ${cards.length} ${catalog?.dataset.catalog === 'videos' ? 'verified videos' : 'curated sources'}`;
    if (empty) empty.hidden = visible !== 0;
  }
  search?.addEventListener('input', filter);
  for (const select of [type, channel, tag]) select?.addEventListener('change', filter);
  reset?.addEventListener('click', () => {
    if (search) search.value = '';
    for (const select of [type, channel, tag]) if (select) select.value = 'all';
    filter();
    search?.focus();
  });

  filter();
}
