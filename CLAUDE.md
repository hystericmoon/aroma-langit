# Aroma Langit website

Astro 7 static site (Bahasa Indonesia) with a Three.js nasi box, GSAP/Lenis motion and Sanity as an optional content source. See README.md for setup and deployment.

- Node 24 is required (`.nvmrc`). Run `npm run check`, `npm test` and `npm run test:e2e` before pushing.
- Content shapes live in `src/data/types.ts`; bundled content in `src/data/`; the Sanity loader in `src/lib/content.ts` maps documents to the same shapes and falls back to bundled values.
- Order maths (prices, surcharge, lead time, WhatsApp text) is in `src/lib/order.ts` and is unit-tested. Keep UI code calling it rather than duplicating it.
- The catering calculator (`/kalkulator/`) builds on it: `src/lib/calculator.ts` (pure, unit-tested), presets in `src/data/presets.ts` or Sanity `calculatorPreset`, client state in `src/scripts/calculator.ts`. `src/components/calculator/ItemRow.astro` is rendered on the server and also as the `<template>` the script clones, so change both paths together.
- Motion must keep content visible without JavaScript and under `prefers-reduced-motion`; animate opacity/transform only, never `visibility`.

## Design system
All UI work follows docs/design-system/brand-book.md (Editorial + Nota).
Tokens: docs/design-system/tokens.json. Reference CSS for components:
docs/design-system/reference-components.css (port into Astro components;
its variables have no Tailwind prefix, e.g. --paper → --color-paper).
Never add colours, radii, shadows or fonts that aren't in the brand book.
If something doesn't fit, flag it instead of improvising.
Prices, minimums, lead times and terms always come from site data.
