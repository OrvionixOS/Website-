const DESKTOP_QUERY = '(min-width: 960px)';

/** Sticky header state and the mobile/tablet menu toggle. */
export function initNav(root: Document): void {
  const header = root.querySelector<HTMLElement>('[data-header]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const menu = root.querySelector<HTMLElement>('[data-nav-menu]');
  const label = root.querySelector<HTMLElement>('[data-nav-toggle-label]');
  if (!header || !toggle || !menu) return;

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open: boolean, { restoreFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    header.classList.toggle('is-open', open);
    root.body.classList.toggle('nav-open', open);
    if (!open && restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

  // Close after choosing a destination.
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, { restoreFocus: true });
    }
  });

  // Dismiss when clicking outside the open menu.
  root.addEventListener('click', (event) => {
    if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(event.target as Node)) {
      setOpen(false);
    }
  });

  // Reset state when resizing up to the desktop layout.
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
