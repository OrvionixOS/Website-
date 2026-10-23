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
- [x] No duplicate Terms of Service or Privacy Policy pages. No legal URLs were invented. The footer and FAQ link to the owner-supplied https://portal.orvionixos.xyz/terms and https://portal.orvionixos.xyz/privacy.
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

## 5. Check against the Terms of Service and Privacy Policy (both effective October 22, 2026)

I compared every fee, billing, and risk claim on the site with the full text of both documents.

| Site claim                                                                                 | Terms section             | Result                                                                                                                   |
| ------------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Fee is 25% of Protected Ad Spend; you retain 75%                                           | §9.1                      | Matches                                                                                                                  |
| Protected Ad Spend = (Daily Budget ÷ 24) × Hours Remaining; Fee = 25% × Protected Ad Spend | §9.2                      | Matches. The §9.2 worked example ($240, 10 h → $100 / $25 / $75) is now a unit test                                      |
| No upfront fee, no monthly subscription                                                    | §9.1                      | Matches                                                                                                                  |
| No fee when no Protected Ad Spend is recorded, "subject to the Terms"                      | §9.1, §10.1               | Matches (the Terms add "unless an Order Form expressly states otherwise")                                                |
| Billed monthly in arrears; due within 7 calendar days                                      | §10.1, §10.2              | Matches                                                                                                                  |
| Protected Ad Spend is a calculation, not a guarantee of savings                            | §9.7, §4.5, §17           | Matches                                                                                                                  |
| Automated actions can reduce delivery, conversions, and sales                              | §5.3, §18.1               | Matches                                                                                                                  |
| One event never exceeds one day's budget (calculator caps hours at 24)                     | §9.5                      | Matches                                                                                                                  |
| Calculator disclosure: eligibility rules, exclusions, budget changes, duplicate events     | §9.4–§9.6                 | Consistent: the calculator is a labelled simplification of these rules                                                   |
| Illustrative record fields                                                                 | §10.1 itemized invoice    | Consistent; the copy now describes the invoice accurately                                                                |
| Marketing site sets no cookies and loads no third-party scripts                            | Privacy §9                | Consistent                                                                                                               |
| Underlying technology provider not named                                                   | Terms §13, Privacy §6, §8 | Not contradicted. The site neither names nor denies the providers, and makes no claim that Orvionix built the technology |

### Copy added to match disclosures in the Terms

- FAQ "Can automated optimization affect my campaigns?": actions can happen automatically, without advance notice, unless an approval mode is enabled (§5.2).
- FAQ "Is there an upfront fee?": also no setup fee or cancellation fee unless an Order Form says otherwise (§9.1).
- FAQ "When do I pay?": billing disputes must be raised in writing within 10 calendar days (§10.4).
- New FAQ "Can I cancel?": cancel any time by written notice to support. Earned fees remain due, and past changes are not automatically reversed (§22.2, §11, §5.4).
- Calculator hint: hours run to the end of the day in the ad account's time zone (§9.5(a)).
- Transparency section: describes the itemized invoice and supporting records on request (§9.8, §10.1). This replaces the line that said no specific product screen was implied.

### Conflicts to resolve before accepting customers (not changed)

1. **Business address.** The site and the brief say **6450 W Sunset Blvd**, Hollywood, CA 90028. The Terms (§26) and the Privacy Policy (§18) say **1645 Sunset Blvd**, Hollywood, CA 90028. One of them is wrong, and the legal documents must not be edited from this project. Tell me which address is correct.
2. **Contracting entity.** The Terms name "Orvionix, doing business as ORVIONIX OS" and end "© 2026 Orvionix." The site's footer says "© 2026 Orvionix OS" (as the brief specified) and never names Orvionix. Recommendation: add "Orvionix OS is a trade name of Orvionix." to the footer so customers know who they contract with.

### Lower-priority notes

- The Terms call the triggering action a "Protection Event"; the site says "qualifying event" (as the brief specified). This is not a conflict.
- The Terms limit the service to business use (§1.3). The site targets businesses but doesn't say so explicitly. Optional: add "For business use only" to the footer.

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
