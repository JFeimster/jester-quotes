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

  for (const button of catalog.querySelectorAll<HTMLButtonElement>('[data-video-id]')) {
    button.addEventListener('click', () => {
      const id = button.dataset.videoId ?? '';
      const title = button.dataset.videoTitle ?? 'YouTube video';
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      const stage = button.closest<HTMLElement>('[data-video-stage]');
      if (!stage) return;
      const iframe = document.createElement('iframe');
      iframe.title = title;
      iframe.loading = 'lazy';
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      stage.replaceChildren(iframe);
    });
  }
  filter();
}
