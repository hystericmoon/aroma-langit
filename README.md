# Aroma Langit — aromalangit.id

The website of Aroma Langit, a halal-certified catering kitchen in Bogor. Built with **Astro 7**, **Three.js**, **GSAP + Lenis** and **Sanity** as the CMS, deployed as a static site on **Cloudflare Pages**.

The art direction is "the page is the box": every section is a piece of the stationery that comes with an Aroma Langit nasi box. The lid is the hero, the price list is a printed menu sheet, the order form is the label sticker, and the footer is the back of the box.

## What is on the site

| Page | Path | Notes |
| --- | --- | --- |
| Home | `/` | 3D nasi box hero, menu & price sheet, **Label pesanan** (live order builder → WhatsApp), showcase, how to order, kitchen & certificates, clients, corporate enquiry coupon |
| Services | `/katering/{nasi-box,bento,snack-box,prasmanan,tumpeng,tumpeng-mini}/` | Every package with price, minimum and full menu, order terms |
| Weddings | `/pernikahan/` | Reception packages, portion calculator, bundles, engagement packages, food stalls, catalogues |
| Corporate | `/korporat/` | Daily catering for offices, factories and schools, enquiry coupon |
| About | `/tentang-kami/` | Story, milestones, team, kitchen and certificates |

Aqiqah and wholesale are no longer offered. Their old URLs redirect to the home page (`public/_redirects`).

## Requirements

- Node **24** (Astro 7 needs Node ≥ 22.23.4). `.nvmrc` pins it.
- npm 10+

## Commands

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/
npm run check      # Astro + TypeScript diagnostics
npm test           # unit tests (Vitest): pricing, dates, WhatsApp message, content loader
npm run test:e2e   # end-to-end (Playwright): every page, links, a11y (axe), order flow, fallbacks
```

## Content: bundled data and Sanity

All content lives in `src/data/` (services, packages, prices, menus, terms, contacts, certificates, clients, milestones, team). It was transcribed from the 2024 price list and catalogues on the old site.

When `SANITY_PROJECT_ID` is set at build time, the site reads from Sanity instead (`src/lib/content.ts`). Anything missing in Sanity falls back to the bundled data, so a half-filled dataset never breaks the build.

### Setting up Sanity (one time)

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) and note the **project ID**.
2. Install and start the Studio:
   ```bash
   cd studio
   npm install
   SANITY_STUDIO_PROJECT_ID=<id> npm run dev        # local Studio at http://localhost:3333
   SANITY_STUDIO_PROJECT_ID=<id> npm run deploy     # hosted Studio at https://aromalangit.sanity.studio
   ```
3. Load the current content and photos into the dataset:
   ```bash
   npm run seed                                       # from the repo root: writes studio/seed/aroma-langit.ndjson
   cd studio && SANITY_STUDIO_PROJECT_ID=<id> npm run import-seed
   ```
4. In Cloudflare Pages, add the build environment variables `SANITY_PROJECT_ID=<id>` and `SANITY_DATASET=production`.
5. Rebuild on publish: create a **Deploy hook** in Cloudflare Pages, then add it in Sanity (*API → Webhooks*) with the filter `_type in ["service", "siteSettings"]`.

In the Studio, staff edit **Layanan & harga** (services, packages, prices, menus, photos) and **Pengaturan situs** (phone numbers, hours, addresses, certificates, clients, milestones, team, order terms). The schemas are in `studio/schemaTypes/`.

## Deploying to Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment | `NODE_VERSION=24`, plus the Sanity variables above |

`public/_redirects` maps the old Joomla URLs and PDFs. `public/_headers` sets caching and security headers.

### Corporate enquiry email (optional)

`functions/api/penawaran.ts` is a Pages Function that emails the corporate coupon to the team through [Resend](https://resend.com). Set these variables:

- `RESEND_API_KEY`
- `ENQUIRY_TO` (comma-separated addresses)
- `ENQUIRY_FROM` (a verified sender, e.g. `Situs Aroma Langit <situs@aromalangit.id>`)

Without them the function answers 503, and the form opens WhatsApp to marketing with the enquiry already written. Enquiries are never lost.

## How the pieces fit

- `src/components/home/OrderLabel.astro` is the order builder. The maths lives in `src/lib/order.ts` (unit-tested): price × quantity, a 20% surcharge on the shortfall below the minimum order, the lead-time check in Jakarta time, and the WhatsApp message.
- `src/scripts/box/` holds the 3D box: geometry, food, lid hinge and a canvas-drawn label that mirrors the order. One WebGL canvas moves between the hero slot and the order slot. It boots on the first interaction (or after 6 s), and each slot shows a real photo until then, or for good if WebGL is unavailable.
- `src/scripts/motion.ts` runs Lenis smooth scroll, GSAP entrances and line reveals. Everything respects `prefers-reduced-motion`, and content is fully visible without JavaScript.

## Quality gates (all passing at handover)

- `astro check`: 0 errors, 0 warnings
- Vitest: 19/19
- Playwright: 85 passed (desktop 1440, tablet 768, phone 390), including axe WCAG 2.1 AA scans of every page, a crawl of every internal link and anchor, the order flow, keyboard navigation, no-JS and reduced-motion runs
- Lighthouse (mobile, homepage): Performance 94, Accessibility 100, Best Practices 100, SEO 100

## Before launch, please confirm

- **Prices and packages** come from the 2024 price list on the old site. Check they are current.
- **Below-minimum surcharge**: the site reads "20% dari selisih minimum" as 20% of the price of the missing quantity (e.g. 50 of a 75-box minimum at Rp29.000 → Rp145.000).
- **Snack box lead time**: the old snack box page said H-1, while the bento page's shared terms said H-2. The site uses H-1.
- **Photography**: all photos are Aroma Langit's own, taken from the old site. A fresh shoot (packages from overhead, tumpeng, kitchen, delivery, a short lid-opening video loop) would lift the site further.
- **Wedding packages** are summarised from the 2024 catalogues, which stay downloadable in full.
