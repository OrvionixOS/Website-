# Orvionix OS — Marketing Site

A single-page landing site for Orvionix OS. It is a **separate project** from the onboarding portal
(`portal.orvionixos.xyz`). It has no authentication, forms, backend, analytics, or secrets. Every sign-up and
log-in action links to the existing portal.

## Stack

| Item            | Choice                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Build tool      | Vite 6 (static output)                                                                             |
| Language        | TypeScript 5 (vanilla DOM, no framework)                                                           |
| Styling         | One CSS file with design tokens (`src/styles/main.css`)                                            |
| Fonts           | Manrope (variable) and JetBrains Mono, self-hosted through `@fontsource` (no third-party requests) |
| Tests           | Vitest + jsdom (unit and DOM tests), Playwright (browser QA script)                                |
| Lint / format   | ESLint 9 (typescript-eslint), Prettier                                                             |
| Package manager | npm                                                                                                |
| Runtime         | Node.js 20 or later (developed on 22, see `.nvmrc`)                                                |

## Structure

```
index.html              All page markup (semantic sections, metadata, links)
src/main.ts             Entry: imports fonts and styles, starts the UI modules
src/config.ts           Approved portal URLs and company details
src/lib/calculator.ts   Calculator formula, input parsing, and formatting (single source of truth)
src/ui/                 nav.ts (mobile menu), accordion.ts (FAQ), calculator.ts (calculator UI wiring)
src/styles/main.css     Design tokens and all component and section styles
public/                 favicon.svg, og-image.png, robots.txt
tests/                  calculator.test.ts (math and validation), page.test.ts (links, content, UI behaviour)
scripts/                check-links.mjs, responsive-qa.mjs, og-image.mjs
```

## Commands

```bash
npm install            # install dependencies
npm run dev            # dev server at http://localhost:5173 (Ctrl+C to stop)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run format:check   # prettier --check
npm test               # vitest (unit + DOM tests)
npm run build          # type-check, then production build into dist/
npm run preview        # serve dist/ at http://localhost:4173
npm run check:links    # verify every link in dist/index.html (run after build)
npm run verify         # typecheck + lint + test + build + check:links
```

To test from another device on the same network, run `npm run preview -- --host` and open the printed
network URL.

### Browser QA (optional)

```bash
npm run build && npm run preview &
npm run qa:responsive    # set PLAYWRIGHT_CHROMIUM_PATH if Chromium is not in Playwright's default location
```

This checks 320, 375, 768, 820 (iPad Air), 1024, 1366, and 1440 px widths, plus a 640 px "200% zoom" case. For
each width it checks horizontal overflow, console errors, failed requests, calculator values, the menu, anchor
scrolling, the accordion, and 44 px touch targets. It also runs a keyboard-only pass and saves full-page
screenshots to `.qa/`.

## Calculator

`src/lib/calculator.ts` is the only place the formula lives. It is **illustrative, not a billing engine**:

```
Protected Ad Spend = (Daily Budget ÷ 24) × Hours Remaining
Orvionix OS Fee    = Protected Ad Spend × 25%
Remaining Amount   = Protected Ad Spend − Orvionix OS Fee
```

- Values are calculated at full precision and rounded to two decimals only for display.
- Daily budget: 0 to $1,000,000,000. Accepts `$` and thousands separators, up to two decimal places.
- Hours remaining: 0 to 24, up to two decimal places. A slider and a text field stay in sync.
- An empty, non-numeric, negative, or out-of-range value shows an inline error linked to its field
  (`aria-invalid`, `aria-describedby`). The results then show "—", never a valid-looking number.
- Default values ($100, 6 hours) give $25.00 / $6.25 / $18.75.

## Environment variables

None are required. `SITE_URL` is optional (see `.env.example`). Once a production domain is approved, setting
it adds `<link rel="canonical">` and `og:url` and makes social image URLs absolute. Without it, no domain is
written into the page.

## Regenerating the social image

`npm run og:image` renders `public/og-image.png` (1200×630) with Playwright.

## Deployment (not done; requires owner approval)

The output is a static `dist/` folder. Any static host works: Netlify, Vercel, Cloudflare Pages, S3 + CloudFront.

| Setting          | Value                                            |
| ---------------- | ------------------------------------------------ |
| Build command    | `npm run build`                                  |
| Output directory | `dist`                                           |
| Node version     | 20+                                              |
| Env vars         | `SITE_URL` (optional, once a domain is approved) |

Deploy it as its **own** project or site. Do not deploy it into the portal's hosting project and do not change
its settings. For rollback, use the host's "redeploy previous deployment" feature, or rebuild a previous git tag.

### Current deployment: GitHub Pages

`.github/workflows/site.yml` runs `format:check` and `verify` on every pull request and every push to `main`. On
`main` it builds with `BASE_PATH=./` and `SITE_URL=https://orvionixos.github.io/Website-`, then publishes `dist/`
to the `gh-pages` branch. GitHub Pages serves that branch at https://orvionixos.github.io/Website-/. This is
independent of the portal: it uses no DNS records and does not touch the portal's hosting. To roll back, revert the
commit on `main`, or re-run the workflow for an earlier commit.

### Custom domain

1. Choose the marketing hostname, for example the root `orvionixos.xyz` or `www.orvionixos.xyz`. It must
   **not** be `portal.orvionixos.xyz`.
2. Add the domain in the hosting provider. The provider will give you the exact records: usually an `A`/`ALIAS`
   record for the root domain, or a `CNAME` for `www`.
3. Add **only** those records at your DNS provider. Do not edit or remove the existing `portal` record or any
   other record the portal depends on.
4. Wait for DNS to propagate (minutes to 48 hours) and for the host to issue the TLS certificate automatically.
5. Verify the domain: `dig +short <domain>` should show the host's target, and `https://<domain>` should load
   with a valid certificate. Confirm that `https://portal.orvionixos.xyz/signup` still loads the portal.
6. Pick one canonical hostname (root or `www`), redirect the other to it, set `SITE_URL` to it, and rebuild.
