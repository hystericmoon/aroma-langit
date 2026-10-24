# Aroma Langit — aromalangit.id

The website of Aroma Langit, a halal-certified catering kitchen in Bogor. Built with **Astro 7**, **Three.js**, **GSAP + Lenis** and **Sanity** as the CMS, deployed as a static site on **Cloudflare Pages**.

The art direction is "the page is the box": every section is a piece of the stationery that comes with an Aroma Langit nasi box. The lid is the hero, the price list is a printed menu sheet, the order form is the label sticker, and the footer is the back of the box.

## What is on the site

| Page | Path | Notes |
| --- | --- | --- |
| Home | `/` | 3D nasi box hero, menu & price sheet, **Label pesanan** (live order builder → WhatsApp), showcase, how to order, kitchen & certificates, clients, corporate enquiry coupon |
| Services | `/katering/{nasi-box,bento,snack-box,prasmanan,tumpeng,tumpeng-mini}/` | Every package with price, minimum and full menu, order terms |
| Calculator | `/kalkulator/` | Catering calculator: seven event presets (meeting, training, syukuran, birthday, gathering, wedding, custom), every line editable, a live printed receipt (*nota*), share link, print, WhatsApp |
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
npm run build          # production build in dist/ (aromalangit.id)
npm run build:staging  # staging build in dist/ (new.aromalangit.id): SITE_ENV=staging
npm run preview    # serve dist/
npm run check      # Astro + TypeScript diagnostics
npm test           # unit tests (Vitest): pricing, dates, WhatsApp message, calculator, content loader
npm run test:e2e   # end-to-end (Playwright): every page, links, a11y (axe), order flow, calculator, fallbacks
```

## Content: bundled data and Sanity

All content lives in `src/data/` (services, packages, prices, menus, terms, contacts, certificates, clients, milestones, team). It was transcribed from the 2024 price list and catalogues on the old site.

When `SANITY_PROJECT_ID` is set at build time, the site reads from Sanity instead (`src/lib/content.ts`). Anything missing in Sanity falls back to the bundled data, so a half-filled dataset never breaks the build.

### Sanity project

The project is **eo2zthve**, dataset **production** (public read). The Studio is hosted at https://aromalangit.sanity.studio, and staff instructions are in [docs/panduan-sanity.md](docs/panduan-sanity.md).

- Local Studio: `cd studio && npm install && npm run dev` (http://localhost:3333). The project ID is the default in `studio/sanity.cli.ts`; `SANITY_STUDIO_PROJECT_ID` overrides it.
- The Studio redeploys itself when anything in `studio/` is pushed (`.github/workflows/sanity-studio.yml`, repository secret `SANITY_DEPLOY_TOKEN`, else `SANITY_AUTH_TOKEN`: a Sanity token with the *Deploy Studio* or Administrator role; an Editor token cannot deploy). By hand: `cd studio && npm run deploy`.
- Reseed from the bundled data (overwrites documents with the same IDs): `npm run seed`, then `cd studio && npm run import-seed`. The first load was done by a one-off GitHub Actions workflow with the `SANITY_AUTH_TOKEN` repository secret.
- Staging builds (`.github/workflows/deploy-staging.yml`) set `SANITY_PROJECT_ID=eo2zthve` and `SANITY_DATASET=production`, and warn when the build fell back to the bundled data.
- Rebuild on publish: a Sanity webhook (*API → Webhooks*, filter `_type in ["service", "siteSettings", "calculatorPreset"]`) calls the GitHub API with a fine-grained token stored only in Sanity, which starts the deploy workflow. The workflow accepts `workflow_dispatch` and `repository_dispatch` (`sanity-publish`); GitHub only delivers `repository_dispatch` to workflows on the default branch.

In the Studio, staff edit **Layanan & harga** (services, packages, prices, menus, photos), **Pengaturan situs** (phone numbers, hours, addresses, certificates, clients, milestones, team, order terms) and **Preset kalkulator** (the calculator's event presets). The schemas are in `studio/schemaTypes/`.

A calculator preset has a title, a default guest count and the word for a guest (*tamu*, *peserta*, *undangan*), then its lines. Each line names a service and a package (by the package's name, as written in **Layanan & harga**), and is counted either **per guest** (e.g. 1 box per guest, or ½ for a top-up snack) or as a **fixed amount** (e.g. one tumpeng). Lines that name a package that no longer exists are skipped at build time, and a preset with no valid lines is left out, so renaming a package never breaks the build. The empty **Kustom** preset is always added.

## Deploying to Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run build` (production; never `build:staging`) |
| Output directory | `dist` |
| Environment | `NODE_VERSION=24`, plus the Sanity variables above |

`public/_redirects` maps the old Joomla URLs and PDFs. `public/_headers` sets caching and security headers.

## Deploying to the current shared hosting (cPanel)

The site also runs on ordinary Apache or LiteSpeed hosting. `public/.htaccess` carries the same redirects, headers and caching as the Cloudflare files.

### Production and staging builds

`SITE_ENV` (`production` by default, or `staging`) is read at build time. It decides what crawlers may do; `robots.txt` is generated by `src/pages/robots.txt.ts` from `src/lib/siteEnv.ts`.

| | Production | Staging |
| --- | --- | --- |
| Site | https://aromalangit.id | https://new.aromalangit.id |
| Build | `npm run build` | `npm run build:staging` |
| Package | `npm run package:hosting` → `hosting/aroma-langit.zip` | `npm run package:hosting:staging` → `hosting/aroma-langit-staging.zip` |
| cPanel folder | `public_html` | the subdomain's document root (cPanel → **Domains** → new.aromalangit.id; it is the folder the staging FTP account opens in) |
| `robots.txt` | every crawler allowed, with the sitemap | only `Claude-User` allowed, everyone else disallowed |
| `<meta name="robots" content="noindex">` | only on the 404 page | on every page |
| `X-Robots-Tag: noindex, nofollow` header | no | yes (added to `.htaccess` by the staging package) |

> **Warning: never upload a staging build to production's `public_html`.** It would tell Google and every other search engine to drop aromalangit.id. Before uploading to `public_html`, open `robots.txt` in the zip: it must say `Allow: /` for `User-agent: *` and have no `Disallow: /`. The packaging script refuses to package a build for the wrong site, but a zip copied by hand has no such check.

Upload the zip into that folder in cPanel's File Manager and extract it there, so `index.html` sits at the top. Each update means building and uploading again. On this hosting the corporate enquiry form opens WhatsApp, because the Pages Function does not run there.

Pushes to `main` or `feat/astro-sanity-rebuild` deploy the staging package (`npm run package:hosting:staging`) to https://new.aromalangit.id automatically (`.github/workflows/deploy-staging.yml`, by FTP with the repo secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`). It runs the type check and unit tests first and fails if the live home page is not the new build or staging's `robots.txt` does not admit Claude-User.

To run the end-to-end suite against any server, set its port: `E2E_PORT=8088 npm run test:e2e`.

### Corporate enquiry email (optional)

`functions/api/penawaran.ts` is a Pages Function that emails the corporate coupon to the team through [Resend](https://resend.com). Set these variables:

- `RESEND_API_KEY`
- `ENQUIRY_TO` (comma-separated addresses)
- `ENQUIRY_FROM` (a verified sender, e.g. `Situs Aroma Langit <situs@aromalangit.id>`)

Without them the function answers 503, and the form opens WhatsApp to marketing with the enquiry already written. Enquiries are never lost.

## How the pieces fit

- `src/components/home/OrderLabel.astro` is the order builder. The maths lives in `src/lib/order.ts` (unit-tested): price × quantity, a 20% surcharge on the shortfall below the minimum order, the lead-time check in Jakarta time, and the WhatsApp message.
- `src/scripts/box/` holds the 3D box: geometry, food, lid hinge and a canvas-drawn label that mirrors the order. One WebGL canvas moves between the hero slot and the order slot. It boots on the first interaction (or after 6 s), and each slot shows a real photo until then, or for good if WebGL is unavailable.
- `src/lib/calculator.ts` is the calculator engine (unit-tested): quantities per guest or fixed, per-line minimum-order surcharge and lead time (both from `order.ts`), share-link encoding, and the WhatsApp message. `src/pages/kalkulator.astro` renders the first plan on the server; `src/scripts/calculator.ts` keeps it live, saves it to the browser and to the URL (`#n=…`), and routes wedding plans to marketing's WhatsApp.
- `src/scripts/motion.ts` runs Lenis smooth scroll, GSAP entrances and line reveals. Everything respects `prefers-reduced-motion`, and content is fully visible without JavaScript.

## Quality gates (all passing at handover)

- `astro check`: 0 errors, 0 warnings
- Vitest: 34/34
- Playwright: 111 passed (desktop 1440, tablet 768, phone 390), including axe WCAG 2.1 AA scans of every page, a crawl of every internal link and anchor, the order flow, the calculator (presets, undo, editing, surcharge, share link, reload, wedding routing, phone dock), keyboard navigation, no-JS and reduced-motion runs
- Lighthouse (mobile): homepage 94 / 100 / 100 / 100, calculator 97 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO)

## Before launch, please confirm

- **Prices and packages** come from the 2024 price list on the old site. Check they are current.
- **Below-minimum surcharge**: the site reads "20% dari selisih minimum" as 20% of the price of the missing quantity (e.g. 50 of a 75-box minimum at Rp29.000 → Rp145.000).
- **Snack box lead time**: the old snack box page said H-1, while the bento page's shared terms said H-2. The site uses H-1.
- **Photography**: all photos are Aroma Langit's own, taken from the old site. A fresh shoot (packages from overhead, tumpeng, kitchen, delivery, a short lid-opening video loop) would lift the site further.
- **Calculator minimums** apply per line, as on the price list: two snack lines of 20 boxes each are two orders below a 25-box minimum, not one order of 40. Tumpeng sets are counted at 25 guests per set when a tumpeng line is set per guest.
- **Calculator presets** (what a meeting, training or syukuran usually orders) are a starting point written for the site. Adjust them in **Preset kalkulator** to match what customers really order.
- **Wedding packages** are summarised from the 2024 catalogues, which stay downloadable in full.
