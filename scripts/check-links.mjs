// Verifies every link in the production build (dist/index.html) points to an
// approved destination or an existing in-page anchor. Run after `npm run build`.
import { readFileSync } from 'node:fs';

const APPROVED = new Set([
  'https://portal.orvionixos.xyz/signup',
  'https://portal.orvionixos.xyz/login',
  'mailto:support@orvionixos.com',
]);

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
  href: m[1],
  text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
}));

const problems = [];
for (const { href, text } of links) {
  if (!href || href === '#') problems.push(`Empty/placeholder href on "${text}"`);
  else if (href.startsWith('#')) {
    if (!ids.has(href.slice(1))) problems.push(`Missing anchor target ${href} ("${text}")`);
  } else if (!APPROVED.has(href)) problems.push(`Unapproved destination ${href} ("${text}")`);
  if (text === 'Get Started' && href !== 'https://portal.orvionixos.xyz/signup') problems.push(`Get Started -> ${href}`);
  if (text === 'Log In' && href !== 'https://portal.orvionixos.xyz/login') problems.push(`Log In -> ${href}`);
}
if (/localhost|127\.0\.0\.1/.test(html)) problems.push('Build output references localhost');

const summary = {};
for (const { href } of links) summary[href] = (summary[href] ?? 0) + 1;
console.log(`Checked ${links.length} links in dist/index.html`);
console.table(summary);

if (problems.length) {
  console.error('Link problems:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('All links point to approved destinations or existing anchors.');
