# Aroma Langit website

Astro 7 static site (Bahasa Indonesia) with a Three.js nasi box, GSAP/Lenis motion and Sanity as an optional content source. See README.md for setup and deployment.

- Node 24 is required (`.nvmrc`). Run `npm run check`, `npm test` and `npm run test:e2e` before pushing.
- Content shapes live in `src/data/types.ts`; bundled content in `src/data/`; the Sanity loader in `src/lib/content.ts` maps documents to the same shapes and falls back to bundled values.
- Order maths (prices, surcharge, lead time, WhatsApp text) is in `src/lib/order.ts` and is unit-tested. Keep UI code calling it rather than duplicating it.
- Art direction: "the page is the box" (taste skill sheet in `.taste-skill/direction.json`). House rules: one typeface (Plus Jakarta Sans), no gradients, no shadows at rest, no eyebrow labels, no monospace, no hairline rules, headlines at most two lines at every width. Check with `node .claude/skills/design-taste-frontend/scripts/lint.mjs src` and `inspect.mjs`.
- Text on the orange ground is always deep brown (#3c2418); never white or paper on orange.
- Motion must keep content visible without JavaScript and under `prefers-reduced-motion`; animate opacity/transform only, never `visibility`.
