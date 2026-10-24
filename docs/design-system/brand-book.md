# Aroma Langit — Brand Book (Kotak & Nota)

Version 1.0 · October 2026 · Source of truth for aromalangit.id. Replaces v0.2 "Editorial + Nota". Tokens: `tokens.json`. Reference CSS: `reference-components.css`. Logo files: `public/brand/`.

## 1. The idea

Aroma Langit is a halal catering kitchen in Pasir Kuda, Bogor, run by PT Aroma Langit Nusantara since 2017. **Our packaging is the interface:** a warm paper page, cards that feel like our boxes, one orange like our sleeve and logo, and a tidy order slip (nota) for every order.

Five rules carry the whole system:

1. **Paper, not white.** The page is warm paper; white is for cards that sit on it.
2. **Orange is a fill.** Buttons and selected states, with dark text. Never orange text.
3. **Borders, not shadows.** A 1px ink line defines every card, photo and control.
4. **Rounded and friendly.** 12px inputs, 20px cards and photos, pill buttons.
5. **Numbers in mono.** Every price and total in JetBrains Mono, so they line up like a receipt.

The nota motif (dashed tear, slip corners) appears only where money is calculated: the estimator, the kalkulator and the printed quote.

## 2. Logo

The logo is the spoon-and-flame mark in an orange circle with the wordmark "aroma" (orange) + "langit" (brown). Files in `public/brand/`:

| File | Use |
| --- | --- |
| `logo-aroma-langit.svg` | Default, full colour, on paper, white or kraft |
| `logo-aroma-langit-paper.svg` | One colour (paper) on the brown footer or any dark or photo background |
| `logo-aroma-langit-ink.svg` | One colour (ink) for print, fax, stamps, single-colour documents |
| `logo-icon.svg` | Mark only: favicon, app icon, social avatar, WhatsApp profile |

**Rules**

- Header height: 28px on mobile, 36px on desktop. Minimum 24px tall; below that use the icon only.
- Clear space: the height of the "a" on every side; no text, borders or photos inside it.
- Never on orange (the circle disappears) or on brown in full colour (orange on brown is 2.6:1): use the paper version.
- Don't recolour, stretch, outline, add shadows, rotate, or rebuild the wordmark in another font.
- The logo's colours are the brand colours: `orange` #EA7A13 and `brown` #7A4806.
- The logo is the link to home with `aria-label="Aroma Langit, beranda"`; the SVG carries a `<title>`.
- Check the supplied SVG against the original vector before print production; it was supplied as a redrawn file.

## 3. Colour

Eleven colours, one light theme. Two come straight from the logo.

| Token | Hex | Role | Contrast (measured) |
| --- | --- | --- | --- |
| paper | #FAF6EF | Page canvas | — |
| card | #FFFFFF | Cards, price-list panel, nota, inputs, secondary buttons | ink 16.9:1 |
| kraft | #EFE3CF | Estimator section, DP line, "Mulai Rp" chip, photo placeholders, Hemat package | ink 13.3:1 |
| ink | #221C17 | Text, borders, focus rings, text on orange | 15.6:1 on paper |
| ink-muted | #6B5F55 | Minimums, packaging, helper text | 5.7:1 on paper, 6.2:1 on card |
| rule-soft | #D9CCB8 | Row dividers inside a card | 1.3:1: never a control border |
| orange (logo) | #EA7A13 | Primary button, selected state, header "Pesan" | ink on it 5.9:1; white on it 2.9:1 (fails); as text 2.7:1 (fails) |
| brown (logo) | #7A4806 | Links, the selected-row bar, footer background | 7.1:1 on paper; paper on it 7.1:1 |
| brown-hover | #5C3605 | Hover and pressed state of brown links | 9.8:1 with paper |
| pandan | #2F6B3A | Halal stamp and chip, confirmations | 5.9:1 on paper; white on it 6.4:1 |
| chili | #B3261E | Errors, under-minimum surcharge | 6.1:1 on paper |

**Rules**

- One primary (orange) button per screen, usually "Susun pesanan" or "Kirim ke WhatsApp".
- Text on orange is always ink. Orange is never used for text, icons on paper, or thin lines.
- Brown is the text accent (links) and the footer. No navy or other dark colours.
- Pandan = halal or success; chili = error or surcharge. Both always with a word, never colour alone.
- Do not add colours.

## 4. Typography

| Family | Role |
| --- | --- |
| **Fraunces** (Google Fonts, 600) | Display and section headings only. Warm, soft serif that pairs with the round logo |
| **Plus Jakarta Sans** (Google Fonts, 400–700) | Everything else: body, labels, buttons, card titles. By Indonesian foundry Tokotype |
| **JetBrains Mono** (Google Fonts, 400/600) | Every price, total, quantity input and certificate number |

| Style | Family | Size / line height | Weight | Use |
| --- | --- | --- | --- | --- |
| display | Fraunces | clamp(44px, 5.5vw, 72px) / 1.02, −0.02em | 600 | Hero headline |
| heading-1 | Fraunces | 40 / 1.05 | 600 | Desktop section headings |
| heading-2 | Fraunces | 28 / 1.1 | 600 | Mobile section headings, panel titles |
| heading-3 | Jakarta | 20 / 1.3 | 700 | Card and package titles |
| body | Jakarta | 16 / 1.5 | 400 | Body copy |
| label | Jakarta | 14 / 1.4 | 600 | Labels, tabs, chips, small buttons |
| meta | Jakarta | 13 / 1.4 | 400 | Minimums, packaging, helper text |
| eyebrow | Jakarta | 12 / 1.3, +0.12em, uppercase | 600 | Section and panel labels |
| price | Mono | 16 / 1.3 | 600 | Package prices |
| price-large | Mono | 24 / 1.2 | 600 | Nota total, hero price tag, sticky bar |
| nota-line | Mono | 14 / 1.5 | 400 | Nota lines, certificate numbers |

- Fraunces is never used below 24px or for buttons, prices or labels.
- Prices: "Rp45.000" (dot thousands separator, no space), unit after it in meta weight: "Rp45.000/kotak". Approximations carry "±". Lead times: H-1, H-2, H-3, H-30.
- Fonts link: `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap`

## 5. Layout, shape and depth

| Token | Value | Use |
| --- | --- | --- |
| space-1 … space-6 | 8 · 16 · 24 · 40 · 64 · 96px | Spacing scale |
| page-max | 1312px | Content width incl. 32px side padding |
| tap-min | 44px | Minimum size of every tappable control |
| radius-input | 12px | Inputs, small photos, the DP line, hero price tag |
| radius-card | 20px | Cards, price-list panel, hero and service photos, event tiles, nota bottom corners |
| radius-pill | 999px | Buttons, chips, tabs, stepper buttons, stamps |

- **Sections** are separated by a full-width 1px ink line (hairline) and padded 24px (mobile) / 64px (desktop). The estimator section sits on kraft.
- **Grid:** 12 columns, 24px gutter on desktop; 20px margins on mobile. Desktop home puts the price list and the estimator side by side; they stack below about 1000px.
- **Depth:** borders and the paper → card → kraft change. The only shadow is the primary button's pressed edge (0 2px 0 ink).
- **Motion:** 150–250ms transitions. The box-opening animation stays in the home hero only, static under `prefers-reduced-motion`, with a button alternative to dragging.

## 6. Photography and icons

- Photos are rounded (20px), bordered (1px ink), and shot consistently: boxes top-down 1:1 on one warm surface in daylight; prasmanan and weddings 3:2 at eye level or 45°.
- Tumpeng is the hero subject. Chips on photos sit on a solid fill (ink or paper), never directly on the image.
- No stock photos, filters, batik or wayang ornaments.
- Alt text describes the food; captions (meta style) add context.
- Icons: line icons, 2px stroke, round caps, `currentColor`, 18–20px, next to a text label and `aria-hidden`. WhatsApp = chat-bubble line icon + the word "WhatsApp". No emoji.

## 7. Voice and content

- Bahasa Indonesia, "Anda", short sentences, sentence case. Uppercase only in eyebrow labels.
- Price, minimum and lead time travel together: "Rp45.000/kotak · Min. 35 kotak · Pesan H-2". Never hide a price behind "hubungi kami".
- Plain next steps: "Susun pesanan", "Pilih", "Kirim ke WhatsApp", "Cetak sebagai penawaran".
- Rules (lead times, DP 50%, pelunasan H-1, surcharge, delivery) come from one data source and read the same everywhere.
- Errors explain the fix: "Terlalu cepat. Tanggal paling cepat: Senin, 26 Oktober."
- Facts only: no invented clients, ratings, counts, testimonials or "terlaris" badges.
- Certificates in full with numbers: "Sertifikat Halal BPJPH ID32110001863560323", "Laik Higiene Jasaboga Golongan B".

## 8. Components

| Component | Spec | Rules |
| --- | --- | --- |
| Header | Paper, bottom hairline; logo left (28/36px); "Pesan" orange small button + menu icon button right | Logo links home. One orange element only |
| Button | Pill, 52px (small 44px), 1px ink border. Primary: orange, ink text, pressed-edge shadow. Secondary: card. Icon: 44×44 + aria-label. Disabled: kraft, ink-muted. Link: brown underlined | One primary per screen; disabled explained nearby |
| Chip | Pill, 13px/600. Halal (pandan, white), outline (lead time), kraft ("Mulai Rp…"), ink (on photos) | States a fact; not interactive |
| Tabs | Pill tabs 44px; selected = ink fill, paper text | role tablist/tab, aria-selected, arrow keys |
| Field | Label above, 48px input, 12px radius, card fill; helper below | label for, aria-describedby; error = chili text + 2px chili border + aria-invalid; quantities in mono |
| QuantityStepper | 44px − / + around a numeric input | Typing still works; below minimum shows the surcharge, doesn't block |
| Hero | Eyebrow, Fraunces display, body intro, rounded bordered photo with a white "Mulai Rp…" price tag, primary + secondary buttons, trust chips | Price tag reads from data |
| EventTile | Card, 20px, min 112px; title + "± Rp…/peserta". "Susun sendiri" tile on kraft | Whole tile is one link to a calculator preset; 2 across mobile, 4 desktop |
| ServiceCard | Card with 1:1 photo, chips on the photo (price, lead time), title + "N paket · use case" | Whole card is one link |
| PriceList + PriceRow | Rows inside one white card: name (Jakarta 700) + meta, mono price, small "Pilih" | Selected row: 4px brown left bar + orange check button with aria-pressed and a label naming the package |
| Nota | White, hairline, corners 4px top / 20px bottom. Items → surcharge (chili) → delivery → dashed tear → total → DP 50% in kraft box → "Pelunasan paling lambat H-1" | Mono amounts, totals aria-live. Outside Kota Bogor: "Dikonfirmasi admin". Prints as "Penawaran harga". WhatsApp message matches the nota |
| Trust stamps | Round 84px stamps: Halal (pandan ring), Laik Higiene (ink ring), certificate numbers in mono beside them | Real numbers from data |
| StickyOrderBar | Mobile only: paper, top hairline, "Perkiraan · N kotak" + mono total, orange WhatsApp button | Hidden while the estimator is visible or the keyboard is open; safe-area padding |
| Footer | Brown background, paper logo, paper text: address, hours, contacts | Paper logo only |

**Page recipes**

- **Home:** Header → Hero → EventTiles ("Untuk acara apa?") → Menu & harga (Tabs + PriceList) → Estimator on kraft (Fields + Nota + primary) → trust stamps + clients → Footer → StickyOrderBar (mobile).
- **Service pages:** heading + intro → PriceList with menu Tabs (Nusantara / Mancanegara) → photos → terms → estimator.
- **Kalkulator:** presets as EventTiles → line items → Nota → WhatsApp + print.
- **Pernikahan:** large hero photo, packages as ServiceCards, portion calculator with Nota, "Jadwalkan food tasting" (Marketing WhatsApp).
- **Korporat:** procurement panel (legal entity, certificates, invoicing) as cards, quote request with printable Nota.

**Surcharge example** (as the site's terms read, "20% dari selisih minimum"): 30 × Spesial A against a 35 minimum at Rp45.000 → 20% × 5 × 45.000 = Rp45.000. Confirm with the business before launch.

## 9. Accessibility checklist (WCAG 2.2 AA)

- [ ] Text 4.5:1; large text, control borders, focus rings and icons 3:1
- [ ] No orange text, no white on orange, no full-colour logo on brown or orange
- [ ] Focus: 2px ink outline, 2px offset on every control
- [ ] Every tappable control ≥ 44×44px
- [ ] Selected states use a check icon and the brown bar, not colour alone; surcharge and errors use words
- [ ] Real `<button>`, `<a href>`, `<label for>` + `<input>`; tabs with role/aria-selected/arrow keys
- [ ] Date picker usable by keyboard; blocked dates explained
- [ ] Nota totals `aria-live="polite"`; icon-only buttons `aria-label`; decorative icons `aria-hidden`
- [ ] One H1 per page; `lang="id"`; headings with line breaks don't merge words
- [ ] Reduced motion honoured; forced-colours mode keeps card and input edges visible
- [ ] axe clean and Lighthouse mobile ≥ 90 on /, /katering/nasi-box/, /kalkulator/

## 10. Implementation (Astro + Tailwind v4)

```css
@theme {
  --color-paper: #faf6ef;
  --color-card: #ffffff;
  --color-kraft: #efe3cf;
  --color-ink: #221c17;
  --color-ink-muted: #6b5f55;
  --color-rule-soft: #d9ccb8;
  --color-orange: #ea7a13;
  --color-brown: #7a4806;
  --color-brown-hover: #5c3605;
  --color-pandan: #2f6b3a;
  --color-chili: #b3261e;

  --font-display: Fraunces, Georgia, "Times New Roman", serif;
  --font-sans: "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --spacing-1: 8px;  --spacing-2: 16px; --spacing-3: 24px;
  --spacing-4: 40px; --spacing-5: 64px; --spacing-6: 96px;

  --radius-input: 12px;
  --radius-card: 20px;
  --radius-pill: 999px;

  --shadow-press: 0 2px 0 #221c17;
}
```

- `reference-components.css` has the exact CSS for every component (`.al-btn`, `.al-price-list`, `.al-nota`, `.al-stamp`…). Its variables drop the Tailwind prefix (`--paper` → `--color-paper`). Port into Astro components; don't copy class names blindly.
- Prices, minimums, lead times, surcharge and delivery rules come from site data (Sanity / `menu.ts`), never hard-coded.
- Favicon and app icons are generated from `logo-icon.svg`; set `theme-color` to #EA7A13.
- Anything that doesn't fit a token is flagged and added here first.

**Open items:** confirm the logo SVG against the original vector, product photography, desktop specs for Pernikahan and Korporat, print styles for the quote, confirmation of the surcharge rule and snack-box lead time.
