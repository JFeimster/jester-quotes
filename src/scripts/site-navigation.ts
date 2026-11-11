const menus = [...document.querySelectorAll<HTMLDetailsElement>('.nav-v3 .desktop-quotes-menu, .nav-v3 .mobile-nav')];
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  for (const menu of menus) {
    if (!menu.open) continue;
    menu.open = false;
    menu.querySelector<HTMLElement>('summary')?.focus();
  }
});
document.addEventListener('click', event => {
  if (!(event.target instanceof Node)) return;
  for (const menu of menus) {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  }
});
