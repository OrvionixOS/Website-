# Owner Review: Orvionix OS Marketing Site

Status: **Ready for owner review. Not deployed.** Production deployment and any domain changes are blocked until
the owner explicitly approves.

## 1. Environment findings (Phase 1.1)

- The working directory (`/home/user`) was empty. It contained no portal code, backend, or deployment config.
- The site lives in its own directory and git repository: `orvionix-marketing/`.
- Node 22.22.0 and npm 10.9.4. Vite 6 + TypeScript, static output. Dev: `npm run dev`. Build: `npm run build`.
- No portal, authentication, backend, database, or production configuration was touched.

## 2. Verification results

| Check                                                                                       | Result                                                                                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Type check (`tsc --noEmit`)                                                                 | Pass                                                                                                                                   |
| Lint (ESLint)                                                                               | Pass, no warnings                                                                                                                      |
| Formatting (Prettier)                                                                       | Pass                                                                                                                                   |
| Unit + DOM tests (Vitest)                                                                   | 63/63 pass                                                                                                                             |
| Production build                                                                            | Pass (exit 0). JS 6.3 kB (2.5 kB gzip), CSS 34 kB (7.2 kB gzip)                                                                        |
| Link check on `dist/`                                                                       | 23 links. Signup ×7, Login ×3, mailto ×3, in-page anchors ×10. No placeholders, no localhost                                           |
| Browser QA (Chromium) at 320 / 375 / 768 / 820 / 1024 / 1366 / 1440 px + 640 px (200% zoom) | Pass. No horizontal overflow, console errors, or failed requests. Calculator, menu, anchors, and accordion work. Touch targets ≥ 44 px |
| Keyboard-only pass                                                                          | Skip link, then nav, then CTAs, then calculator inputs and slider, then FAQ triggers, in visual order                                  |

**Not verified (network restriction):** this build environment could not reach `portal.orvionixos.xyz` (the
proxy blocked it). The portal URLs come exactly from the brief and are covered by tests, but no one has opened
them in a browser from this environment. **Owner action:** click Get Started and Log In on the preview and
confirm that both portal pages load.

## 3. Master-prompt QA checklist

- [x] The company is named "Orvionix OS" everywhere.
- [x] The address reads exactly: 6450 W Sunset Blvd, Hollywood, CA 90028 (footer). Tested.
- [x] support@orvionixos.com appears in the footer and FAQ. Tested.
- [x] Every "Get Started" link goes to https://portal.orvionixos.xyz/signup (nav, hero, pricing, final CTA, footer). Tested.
- [x] Every "Log In" link goes to https://portal.orvionixos.xyz/login (nav, final CTA, footer). Tested.
- [x] The fee is always stated as 25% of eligible Protected Ad Spend.
- [x] No upfront service fee and no monthly subscription. No setup or minimum fees, no tiers.
- [x] Monthly invoicing in arrears, due within seven calendar days "subject to the Terms of Service".
- [x] The calculator's default example is $25.00 / $6.25 / $18.75. Covered by unit, DOM, and browser tests.
- [x] The calculator is labelled "Illustrative calculator — not an invoice". The required disclosure sits directly below it.
- [x] Protected Ad Spend is never presented as guaranteed savings. The hero qualifier, pricing note, FAQ, and footer all say so.
- [x] No testimonials, statistics, customer logos, integrations, certifications, or SLAs.
- [x] No duplicate Terms of Service or Privacy Policy pages. No legal URLs were invented. Legal references point to the onboarding portal.
- [x] The design is restrained and premium, with no space themes. Imagery is typographic and illustrative only.
- [x] All navigation, the calculator, the accordion, and links work (automated and browser checks).
- [x] Tested at mobile, tablet (including iPad sizes), and desktop widths.

## 4. Copy decisions to confirm

1. **Wording I added (not in the brief):** short supporting lines kept within the brief's intent:
   - Hero figure caption: "Simplified, hypothetical example. Not customer data, not an invoice."
   - Safeguards intro: "Advertising optimization involves trade-offs. Reducing spend under certain conditions can
     also reduce delivery, reach, or conversions. Consider how any automated action fits your campaign objectives
     before enabling it." (The brief said to "explain that advertising optimization involves trade-offs".)
   - Transparency note: "The record below is a conceptual illustration… It is not a depiction of a specific product screen."
   - FAQ heading "Frequently Asked Questions", FAQ intro line inviting email to support, footer tagline
     "Performance-based advertising spend optimization.", footer fine print restating that figures are illustrative.
   - Small section labels ("The Approach", "Fee Illustration", "Transparency").
2. **Transparency table:** I used obviously fictional data ("Example Day 1", "EXAMPLE-001") and labelled it
   "Illustrative Interface — Not Actual Customer Data". One row shows "Not eligible (example)" with $0.00, to
   illustrate that exclusions exist. Remove that row if any reference to exclusions should stay out of this section.
3. **Calculator input rules** (the brief didn't specify these): budget cap of $1,000,000,000, at most two decimal
   places, and hours accepting decimals such as 6.5. Change these if you prefer.
4. **Link behaviour:** portal links open in the same tab, which is the usual pattern for conversion. Tell me if
   you want them to open in a new tab.

## 5. Items flagged for legal review (not changed)

I could not read the Terms of Service and Privacy Policy from this environment. Before launch, someone should
check that the site's copy matches the legal documents on:

- The 25% rate and the definition of "eligible Protected Ad Spend".
- Whether the public formula, (Daily Budget ÷ 24) × Hours Remaining, matches the Terms' calculation method. The
  page calls it simplified, but it should not contradict the Terms.
- "Billed monthly in arrears" and "due within seven calendar days".
- "No performance fee when no eligible Protected Ad Spend is recorded".
- "No upfront service fee" and "no recurring monthly subscription fee". Confirm there are no setup fees, minimums,
  or pass-through costs in the Terms.
- Descriptions of automated actions (pausing ads, reducing budgets "where enabled").
- **Cancellation:** the brief lists it as a consistency area but provides no copy, so the site says nothing about
  cancellation.
- **Third-party technology providers:** the marketing copy does not name the underlying provider, as instructed.
  It neither claims nor implies that Orvionix OS built the underlying technology. The legal disclosures in the
  portal are unchanged.

**Direct legal URLs:** if the portal has stable URLs for the Terms and the Privacy Policy, send them to me. I will
replace the "available through the onboarding portal" references in the footer and FAQ with direct links.

## 6. Owner review checklist

Run `npm run build && npm run preview` and open http://localhost:4173, or review the screenshots in `.qa/`.

- [ ] Visual design and brand presentation
- [ ] Copy (especially section 4 above)
- [ ] Calculator behaviour: try normal, empty, negative, and very large values
- [ ] Responsive layout on your phone and iPad (`npm run preview -- --host`)
- [ ] Get Started / Log In open the correct portal pages
- [ ] Legal review items (section 5)
- [ ] Hosting provider and marketing domain chosen (see README → Deployment)
- [ ] **Explicit approval to deploy** (record approver, date, and commit hash here)

| Approval                | Approver | Date | Commit |
| ----------------------- | -------- | ---- | ------ |
| Pre-deployment sign-off |          |      |        |
