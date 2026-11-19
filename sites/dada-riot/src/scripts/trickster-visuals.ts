/* Visual-only enhancements for the 139-card Trickster directory.
   Filtering, random selection, and the dialog remain owned by trickster-explorer.ts. */
const page = document.querySelector<HTMLElement>('.trickster-expanded');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (page && !reducedMotion.matches) {
  const heroFrame = page.querySelector<HTMLElement>('.trickster-hero-art-frame');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (heroFrame && canHover) {
    heroFrame.addEventListener('pointermove', (event: PointerEvent) => {
      const bounds = heroFrame.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 9;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 9;
      heroFrame.style.setProperty('--trickster-drift-x', `${x.toFixed(1)}px`);
      heroFrame.style.setProperty('--trickster-drift-y', `${y.toFixed(1)}px`);
    }, { passive: true });
    heroFrame.addEventListener('pointerleave', () => {
      heroFrame.style.removeProperty('--trickster-drift-x');
      heroFrame.style.removeProperty('--trickster-drift-y');
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const card = entry.target as HTMLElement;
        card.classList.add('is-inview');
        observer.unobserve(card);
      }
    }, { threshold: 0.04, rootMargin: '0px 0px -12px 0px' });

    page.querySelectorAll<HTMLElement>('[data-trickster-card]').forEach((card, index) => {
      card.style.setProperty('--trickster-stagger', `${(index % 4) * 45}ms`);
      card.classList.add('trickster-will-reveal');
      observer.observe(card);
    });
  }

  const counter = page.querySelector<HTMLElement>('#trickster-count');
  if (counter) {
    const observer = new MutationObserver(() => {
      counter.classList.remove('trickster-count-pop');
      // Re-trigger a tiny visual tick when the Phase 2 filter script updates the count.
      void counter.offsetWidth;
      counter.classList.add('trickster-count-pop');
    });
    observer.observe(counter, { childList: true, characterData: true, subtree: true });
  }
}
export {};
