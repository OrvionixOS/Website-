import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { initAccordion } from '../src/ui/accordion';
import { initCalculator } from '../src/ui/calculator';
import { initNav } from '../src/ui/nav';
import { PORTAL_LOGIN_URL, PORTAL_SIGNUP_URL, PRIVACY_URL, TERMS_URL } from '../src/config';

const html = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8');

function loadPage() {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  document.documentElement.replaceWith(document.importNode(doc.documentElement, true));
}

const out = (key: string) => document.querySelector(`[data-out="${key}"]`)!.textContent;
const type = (input: HTMLInputElement, value: string) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('page content and links', () => {
  beforeEach(loadPage);

  it('has one h1 and the approved SEO title and description', () => {
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.title).toBe('Orvionix OS | Performance-Based Ad Spend Optimization');
    expect(document.querySelector('meta[name="description"]')!.getAttribute('content')).toBe(
      'Explore Orvionix OS, a performance-based advertising spend optimization service with a transparent 25% fee on eligible Protected Ad Spend and no monthly subscription.',
    );
  });

  it('points every Get Started link to signup and every Log In link to login', () => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a'));
    const getStarted = links.filter((a) => a.textContent!.trim() === 'Get Started');
    const logIn = links.filter((a) => a.textContent!.trim() === 'Log In');
    expect(getStarted.length).toBeGreaterThanOrEqual(5);
    expect(logIn.length).toBeGreaterThanOrEqual(3);
    getStarted.forEach((a) => expect(a.getAttribute('href')).toBe(PORTAL_SIGNUP_URL));
    logIn.forEach((a) => expect(a.getAttribute('href')).toBe(PORTAL_LOGIN_URL));
  });

  it('only links to approved destinations or existing in-page anchors', () => {
    const allowed = new Set([
      PORTAL_SIGNUP_URL,
      PORTAL_LOGIN_URL,
      TERMS_URL,
      PRIVACY_URL,
      'mailto:support@orvionixos.com',
    ]);
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      const href = a.getAttribute('href')!;
      expect(href, a.outerHTML).not.toBe('');
      if (href.startsWith('#')) {
        expect(document.getElementById(href.slice(1)), `missing anchor ${href}`).not.toBeNull();
      } else {
        expect(allowed.has(href), `unapproved link ${href}`).toBe(true);
      }
    });
  });

  it('nav anchors target the right sections', () => {
    const nav = document.querySelector('#primary-nav')!;
    const hrefs = Array.from(nav.querySelectorAll('a')).map((a) => [a.textContent!.trim(), a.getAttribute('href')]);
    expect(hrefs).toEqual([
      ['How It Works', '#how-it-works'],
      ['Pricing', '#pricing'],
      ['FAQ', '#faq'],
      ['Log In', PORTAL_LOGIN_URL],
      ['Get Started', PORTAL_SIGNUP_URL],
    ]);
  });

  it('links Terms of Service and Privacy Policy to the owner-supplied URLs', () => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a'));
    const terms = links.filter((a) => a.textContent!.trim() === 'Terms of Service');
    const privacy = links.filter((a) => a.textContent!.trim() === 'Privacy Policy');
    expect(terms).toHaveLength(2);
    expect(privacy).toHaveLength(2);
    terms.forEach((a) => expect(a.getAttribute('href')).toBe(TERMS_URL));
    privacy.forEach((a) => expect(a.getAttribute('href')).toBe(PRIVACY_URL));
  });

  it('shows the exact business contact details', () => {
    const text = document.body.textContent!.replace(/\s+/g, ' ');
    expect(text).toContain('6450 W Sunset Blvd, Hollywood, CA 90028');
    expect(text).toContain('support@orvionixos.com');
    expect(text).toContain('© 2026 Orvionix OS. All rights reserved.');
  });

  it('labels illustrative content and includes required disclosures', () => {
    const text = document.body.textContent!.replace(/\s+/g, ' ');
    expect(text).toContain('Illustrative Interface — Not Actual Customer Data');
    expect(text).toContain(
      'This calculator illustrates a simplified estimate based on an evenly distributed daily budget.',
    );
    expect(text).toContain('Protected Ad Spend is a contractually defined calculation, not a guarantee');
    expect(text).toContain('Illustrative calculator — not an invoice');
    expect(text).not.toMatch(/guaranteed (savings|results|roi)|risk-free|testimonial/i);
  });

  it('gives every interactive input an accessible label', () => {
    document.querySelectorAll('input').forEach((input) => {
      const labelled =
        input.getAttribute('aria-label') || document.querySelector(`label[for="${input.id}"]`)?.textContent;
      expect(labelled, input.outerHTML).toBeTruthy();
    });
  });
});

describe('calculator UI', () => {
  beforeEach(() => {
    loadPage();
    initCalculator(document);
  });

  const budget = () => document.querySelector<HTMLInputElement>('[data-calc-budget]')!;
  const hours = () => document.querySelector<HTMLInputElement>('[data-calc-hours]')!;
  const range = () => document.querySelector<HTMLInputElement>('[data-calc-hours-range]')!;

  it('renders the default example', () => {
    expect(out('budget')).toBe('$100.00');
    expect(out('hours')).toBe('6');
    expect(out('pas')).toBe('$25.00');
    expect(out('fee')).toBe('$6.25');
    expect(out('remaining')).toBe('$18.75');
  });

  it('updates instantly as the user types', () => {
    type(budget(), '240');
    type(hours(), '4');
    expect(out('pas')).toBe('$40.00');
    expect(out('fee')).toBe('$10.00');
    expect(out('remaining')).toBe('$30.00');
    expect(range().value).toBe('4');
  });

  it('syncs the slider into the hours field', () => {
    range().value = '12';
    range().dispatchEvent(new Event('input', { bubbles: true }));
    expect(hours().value).toBe('12');
    expect(out('pas')).toBe('$50.00');
  });

  it('shows an associated error and no result for invalid input, preserving the value', () => {
    type(budget(), '-20');
    expect(budget().value).toBe('-20');
    expect(budget().getAttribute('aria-invalid')).toBe('true');
    const error = document.getElementById('calc-budget-error')!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toContain('negative');
    expect(budget().getAttribute('aria-describedby')).toContain('calc-budget-error');
    expect(out('pas')).toBe('—');
    expect(out('fee')).toBe('—');

    type(budget(), '100');
    expect(budget().hasAttribute('aria-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
    expect(out('fee')).toBe('$6.25');
  });

  it('rejects hours outside 0–24 and empty fields', () => {
    type(hours(), '30');
    expect(hours().getAttribute('aria-invalid')).toBe('true');
    expect(out('pas')).toBe('—');
    type(hours(), '');
    expect(out('pas')).toBe('—');
  });

  it('resets to the default example', () => {
    type(budget(), '999');
    document.querySelector<HTMLButtonElement>('[data-calc-reset]')!.click();
    expect(budget().value).toBe('100');
    expect(hours().value).toBe('6');
    expect(out('fee')).toBe('$6.25');
  });
});

describe('accordion', () => {
  beforeEach(() => {
    loadPage();
    initAccordion(document);
  });

  it('toggles panels and aria-expanded', () => {
    const trigger = document.getElementById('faq-1-btn') as HTMLButtonElement;
    const panel = document.getElementById('faq-1')!;
    expect(panel.hidden).toBe(true);
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
  });

  it('has nine questions, each wired to a panel', () => {
    const triggers = document.querySelectorAll('.accordion__trigger');
    expect(triggers).toHaveLength(9);
    triggers.forEach((t) => expect(document.getElementById(t.getAttribute('aria-controls')!)).not.toBeNull());
  });
});

describe('navigation', () => {
  beforeEach(() => {
    loadPage();
    window.matchMedia ??= (q: string) =>
      ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
    initNav(document);
  });

  it('opens with the toggle and closes on Escape, returning focus', () => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('closes after a menu link is chosen', () => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
    toggle.click();
    document.querySelector<HTMLAnchorElement>('#primary-nav a[href="#pricing"]')!.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
