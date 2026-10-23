/** Disclosure-pattern accordion: each trigger toggles its own panel. */
export function initAccordion(root: Document): void {
  root.querySelectorAll<HTMLElement>('[data-accordion]').forEach((accordion) => {
    const triggers = Array.from(accordion.querySelectorAll<HTMLButtonElement>('.accordion__trigger'));

    triggers.forEach((trigger, index) => {
      const panel = root.getElementById(trigger.getAttribute('aria-controls') ?? '');
      if (!panel) return;

      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') !== 'true';
        trigger.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
      });

      // Optional arrow-key movement between questions.
      trigger.addEventListener('keydown', (event) => {
        const keys: Record<string, number> = {
          ArrowDown: (index + 1) % triggers.length,
          ArrowUp: (index - 1 + triggers.length) % triggers.length,
          Home: 0,
          End: triggers.length - 1,
        };
        if (event.key in keys) {
          event.preventDefault();
          triggers[keys[event.key]].focus();
        }
      });
    });
  });
}
