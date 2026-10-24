# Aroma Langit — Brand Book (Editorial + Nota)

Version 0.2 · October 2026 · Source of truth for aromalangit.id. Tokens: `tokens.json` (same folder). Reference CSS for all components: `reference-components.css`.

## 1. The brand and the core rule

Aroma Langit is a halal catering kitchen in Pasir Kuda, Bogor, run by PT Aroma Langit Nusantara since 2017. **What people read looks like a newspaper about our kitchen; what people tap or order looks like our order slip.** One palette, one set of fonts, one rule: shape tells you what you can touch.

Site copy is Bahasa Indonesia; this book is in English for designers and developers.

### Two modes

Every element belongs to exactly one mode. Never mix the two inside one element.

| | Read mode (editorial) | Order mode (nota) |
| --- | --- | --- |
| What | Hero, photos and captions, section openers, price lists, story panels, the navy band, footer | Buttons, chips, tabs, inputs, steppers, event tiles, estimator panel, nota, sticky order bar |
| Corners | Square (radius-none) | radius-input 12px, radius-card 20px, radius-pill |
| Surface | paper, navy | card on paper, or kraft for the order zone |
| Type | Newsreader for headings, item names, captions | Plus Jakarta Sans; JetBrains Mono for nota amounts only |
| Lines | rule-double above sections, rule-leader between name and price, rule-soft between rows | hairline borders, rule-tear above the nota total |

**Why it works:** people learn without being told that rounded, white, bordered things can be pressed. It also keeps buttons distinct from photos.

**The one edge case:** a price row is both. Its name and price are read mode (Newsreader name, dotted leader, orange-ink price); its "Pilih" button is order mode (pill).

## 2. Colour

Twelve colours, one light theme. Orange is a fill, never text; the page is always paper.

| Token | Hex | Role | Contrast (measured) |
| --- | --- | --- | --- |
| paper | #FAF6EF | Page canvas everywhere; never pure white for the page | — |
| card | #FFFFFF | Order mode only: nota, inputs, choice cards, secondary buttons | ink 16.9:1 |
| kraft | #EFE3CF | Estimator zone, the DP line, photo placeholders | ink 13.3:1 |
| ink | #221C17 | Text, hairlines, control borders, focus rings; text on orange | 15.6:1 on paper |
| ink-muted | #6B5F55 | Minimums, packaging, captions, meta | 5.7:1 on paper, 6.2:1 on card |
| rule-soft | #D9CCB8 | Decorative row dividers inside lists | 1.3:1: never a control border |
| orange | #EC7F18 | Brand fill: one primary action per screen, selected state, sleeve bands | ink on it 6.1:1; white on it 2.8:1 (fails) |
| orange-ink | #B25607 | Orange as text: list prices, links | 4.6:1 on paper; white on it 5.0:1 |
| orange-ink-hover | #8A4205 | Hover and pressed state of orange-ink links | — |
| navy | #1F2A44 | One full-width band per page at most, and the footer | paper on it 13.2:1; orange on it 5.2:1 |
| pandan | #2F6B3A | Halal badge, confirmations | 5.9:1 on paper; white on it 6.4:1 |
| chili | #B3261E | Errors, the under-minimum surcharge line | 6.1:1 on paper |

**Rules**

- One primary (orange-filled) action per screen, usually "Susun pesanan" or "Kirim ke WhatsApp". The selected state is the only other orange fill.
- Text on orange is always ink. Never white on orange; never orange text on paper (2.6:1).
- White (card) appears only under order-mode elements, never as the page.
- Navy at most once per page as a band, plus the footer.
- Pandan means halal or success; chili means error or surcharge. Both always carry a text label.
- Do not add colours. Emphasis comes from weight, size or the double rule.

## 3. Typography

Three families from Google Fonts, each with one job: Newsreader speaks, Plus Jakarta Sans works, JetBrains Mono counts.

- **Newsreader** (variable, light 300 and italic): headings, package names, leads, captions. Not used below 24px except captions and package names. One italic word per heading at most: "Katering halal dari *Bogor.*"
- **Plus Jakarta Sans**: body, labels, buttons, chips, prices. Made by Indonesian foundry Tokotype for the +Jakarta city identity in 2020, open licence.
- **JetBrains Mono**: only inside the nota and the sticky order bar, so amounts align like a printed receipt.

| Style | Family | Size / line height | Weight | Use |
| --- | --- | --- | --- | --- |
| display-xl | Newsreader | 96 / 0.93, −0.025em | 300 | Desktop hero; clamp(52px, 6.4vw, 96px) |
| display-l | Newsreader | 52 / 0.95, −0.02em | 300 | Mobile hero, wedding openers |
| heading-1 | Newsreader | 44 / 1.05 | 400 | Desktop section headings |
| heading-2 | Newsreader | 32 / 1.1 | 400 | Mobile section headings, panel titles |
| item-name | Newsreader | 22 / 1.2 | 400 | Package names in price lists |
| lead | Newsreader italic | 20 / 1.4 | 400 | Intro under a hero heading (min 18px) |
| caption | Newsreader italic | 15 / 1.4 | 400 | Photo captions, ink-muted |
| body | Jakarta | 16 / 1.55 | 400 | All body copy |
| body-strong | Jakarta | 16 / 1.5 | 700 | Button labels, tile titles |
| label | Jakarta | 14 / 1.4 | 600 | Form labels, tabs, chips |
| meta | Jakarta | 13 / 1.4 | 400 | Minimums, packaging, helper text, ink-muted |
| eyebrow | Jakarta | 12 / 1.3, +0.12em, uppercase | 600 | Section and panel labels |
| price | Jakarta | 17 / 1.3, tabular | 600 | List prices in orange-ink |
| nota-line | JetBrains Mono | 14 / 1.5 | 400 | Line amounts in the nota |
| nota-total | JetBrains Mono | 22 / 1.2 | 600 | Totals in the nota and sticky bar |

**Numbers**

- Every price uses tabular figures: `font-variant-numeric: tabular-nums`.
- Rupiah format: "Rp45.000" (dot as thousands separator, no space, no decimals). Unit after it in meta style: "/kotak", "/pax", "/set".
- Approximate figures carry "±": "± Rp77.500/peserta".
- Lead times are written H-1, H-2, H-3, H-30.

## 4. Layout, spacing, shape and depth

An 8px rhythm, a 12-column grid, four corner values and no drop shadows except one.

| Token | Value | Use |
| --- | --- | --- |
| space-1 | 8px | Inside chips; label to input |
| space-2 | 16px | Related items; mobile card padding |
| space-3 | 24px | Panel padding; grid gutter; mobile section padding |
| space-4 | 40px | Between hero columns and list columns on desktop |
| space-5 | 64px | Desktop page margin and section spacing |
| space-6 | 96px | Large desktop section breaks |
| page-max | 1312px | Content width incl. 32px side padding |
| tap-min | 44px | Minimum height and width of every tappable control |
| radius-none | 0 | Read mode: photos, panels, navy band |
| radius-input | 12px | Inputs, the DP line |
| radius-card | 20px | Event tiles, estimator panel, nota bottom corners |
| radius-pill | 999px | Buttons, chips, tabs, stepper buttons |

**Grid.** Desktop: 12 columns, 24px gutter, content max 1312px. Mobile: 4 columns, 20px margins. On the home page the price list (wide column) and the order panel (narrow, max 440px) sit side by side on desktop and stack below about 1000px.

**Lines.** hairline (1px solid ink) for control borders, panels and list tops. rule-double (4px double ink) above every read-mode section heading. rule-leader (1px dotted ink-muted) between package name and price. rule-tear (1px dashed ink-muted) above the nota total. rule-soft (1px #D9CCB8) between rows only.

**Depth.** No drop shadows. Depth comes from hairline borders and the paper → card → kraft surface change. The single exception is shadow-press (0 2px 0 ink) on the primary button.

**Motion.** Transitions 150–250ms. The box-opening animation lives only in the home hero and becomes a static image under `prefers-reduced-motion`. No scroll-jacking on mobile.

## 5. Photography, iconography and logo

**Photography**

- Photos are read mode: square corners, full width on mobile, always with an italic caption that says what and where ("Tumpeng Premium untuk 20–25 orang.").
- Boxes: top-down, 1:1, on one warm surface, daylight. Prasmanan and weddings: eye level or 45°, 3:2. Home hero: 4:3.
- Tumpeng is the hero subject.
- No stock photos, heavy filters, batik or wayang ornaments, or text over photos. Chips on a photo sit on a solid fill (ink or kraft).
- Alt text describes the food; the caption adds context, it does not repeat the alt.
- Shot list priority: tumpeng (all four tiers), nasi box Spesial A and Hemat, snack box, prasmanan set-up, kitchen at Pasir Kuda, team at work.

**Iconography**

- Line icons only: 2px stroke, round caps and joins, `currentColor`, 18–20px.
- Always next to a text label and `aria-hidden`; icon-only buttons need an `aria-label`.
- WhatsApp: a generic chat-bubble line icon plus the word "WhatsApp". No third-party logos in the UI.
- No emoji anywhere in the interface.

**Logo**

- No logo file yet. Until it is added, the wordmark is set in Newsreader: "Aroma *Langit*" (italic on Langit), ink on paper, paper on navy.
- When the real logo arrives: SVG and PNG versions (full colour, one-colour ink, one-colour paper), clear space of one cap height on every side, minimum 96px wide on screen.

## 6. Voice and content

We sound like a careful host: polite, direct, specific about price and timing.

- **Bahasa Indonesia, "Anda", short sentences.** Sentence case everywhere; uppercase only in eyebrow labels.
- **Price, minimum and lead time travel together:** "Rp45.000/kotak · Min. 35 kotak · Pesan H-2". Never hide a price behind "hubungi kami".
- **Name the next step plainly:** "Susun pesanan", "Pilih", "Kirim ke WhatsApp", "Cetak sebagai penawaran", "Unduh daftar harga (PDF)".
- **Say rules once, in the same words everywhere.** Lead times, DP 50%, pelunasan H-1, the under-minimum surcharge and delivery come from one data source.
- **Errors say how to fix it:** "Terlalu cepat. Tanggal paling cepat: Senin, 26 Oktober."
- **Facts only.** Never invent client names, ratings, counts, testimonials or "terlaris" badges. Client names appear only with permission.
- **Certificates in full with numbers:** "Sertifikat Halal BPJPH ID32110001863560323", "Laik Higiene Jasaboga Golongan B".

| Write | Avoid |
| --- | --- |
| Susun pesanan | Order now!!! |
| Mulai Rp22.500/kotak | Harga terjangkau |
| Pesan paling lambat H-2 | Pesan secepatnya |
| Ongkos kirim dikonfirmasi admin | Gratis ongkir* (with fine print) |
| Dapur yang boleh Anda periksa. | Kualitas terbaik nomor 1 |

## 7. Components

| Component | Mode | Spec | Rules |
| --- | --- | --- | --- |
| Button | Order | Pill, 52px (small 44px), 1px ink border. Primary: orange fill, ink text, shadow-press. Secondary: card fill. Icon: 44×44 with aria-label. Disabled: kraft, ink-muted, no shadow. Link: orange-ink, underlined | One primary per screen. Verbs in sentence case. Disabled always explained nearby |
| Chip | Order | Pill, 6×12px padding, 12px/600. Halal (pandan, white), outline (lead time), kraft ("Mulai Rp…"), ink (on photos) | States a fact; not interactive |
| Tabs | Order | Pill tabs, 44px. Selected: ink fill, paper text | role tablist/tab, aria-selected, arrow keys. Wrap on small screens |
| Field | Order | Label above, 48px input, radius-input, card fill; helper in meta below | label for + aria-describedby. Error: chili text, 2px chili border, aria-invalid. Quantities in mono. 16px min |
| QuantityStepper | Order | 44px − and + buttons around a numeric input | Typing still works. Below minimum: don't block, show the surcharge line |
| EventTile | Order | Card, radius-card, 18px padding, min 120px; title, one-line description, "± Rp…/peserta" in mono | Whole tile is one link to a calculator preset. 4 across desktop, 2 mobile |
| PriceRow | Both | Newsreader name + meta (minimum, packaging), dotted leader, orange-ink price, small "Pilih" | Selected: orange icon button with check, aria-pressed, label naming the package. 2 columns desktop |
| Nota | Order | Card, hairline, corners 4px top / 20px bottom. Items → surcharge (chili) → delivery → dashed tear → total → DP 50% in kraft box → settlement note | Amounts in mono. Totals aria-live. Outside Kota Bogor: "Dikonfirmasi admin". Same component prints as "Penawaran harga". WhatsApp message = what the nota shows |
| SectionHeading | Read | 4px double rule, Newsreader heading-1/heading-2, optional link right, one line of context | One italic word at most |
| Figure | Read | Square photo (1:1, 3:2, 4:3) with italic caption | No text over photos. Alt describes the food |
| NavyBand | Read | Full bleed, navy, paper text in Newsreader Light 28–32px, eyebrow label | Once per page. Client names only with permission |
| StickyOrderBar | Order | Mobile only. Paper, top hairline, running total in mono + primary WhatsApp button | Hide while the estimator is visible and when the keyboard is open. Safe-area padding |

**Surcharge example** (as the site's terms currently read, "20% dari selisih minimum"): 30 boxes of Spesial A against a 35 minimum at Rp45.000 → 20% × 5 × 45.000 = Rp45.000. Confirm with the business before launch.

**Page recipes**

- **Home:** header → hero (Figure 4:3 + display heading + stats strip + primary button) → EventTiles → price list (Tabs + PriceRows) beside the order panel (Fields + Nota + primary button) → photo gallery → kitchen and certificates → NavyBand (clients) → footer.
- **Service pages:** SectionHeading → PriceRows with menu Tabs (Nusantara / Mancanegara) → Figures → terms list → order panel.
- **Kalkulator:** almost entirely order mode.
- **Pernikahan:** almost entirely read mode (navy hero band, large Newsreader headings, full-width photos), with an order-mode portion calculator and a "Jadwalkan food tasting" button.
- **Korporat:** read-mode procurement panel (certificates, legal entity, invoicing) and order-mode quote request with printable nota.

## 8. Accessibility checklist (WCAG 2.2 AA)

- [ ] Text 4.5:1 against its surface; large text (24px+), control borders, focus rings and icons 3:1
- [ ] No white on orange, no orange text on paper, no rule-soft control borders
- [ ] Focus visible on every control: 2px ink outline, 2px offset
- [ ] Every tappable control at least 44×44px
- [ ] Selected states use a check icon as well as orange; surcharge and errors use words as well as chili
- [ ] Real `<button>`, `<a href>`, `<label for>` + `<input>`; no clickable divs
- [ ] Tabs: role tablist/tab/tabpanel, aria-selected, arrow-key navigation
- [ ] Date picker usable by keyboard; blocked dates explained in text
- [ ] Nota totals in `aria-live="polite"`
- [ ] Icon-only buttons have `aria-label`; decorative icons `aria-hidden`
- [ ] One H1 per page; line breaks inside headings don't merge words for screen readers
- [ ] `lang="id"` on every page
- [ ] `prefers-reduced-motion` honoured; the box animation has a static fallback and a button alternative to dragging (2.5.7)
- [ ] Forced colours: card and input edges stay visible
- [ ] axe clean and Lighthouse mobile ≥ 90 on /, /katering/nasi-box/ and /kalkulator/

## 9. Implementation

Tailwind v4 `@theme` (Astro). Keep names identical to `tokens.json`.

```css
@theme {
  --color-paper: #faf6ef;
  --color-card: #ffffff;
  --color-kraft: #efe3cf;
  --color-ink: #221c17;
  --color-ink-muted: #6b5f55;
  --color-rule-soft: #d9ccb8;
  --color-orange: #ec7f18;
  --color-orange-ink: #b25607;
  --color-orange-ink-hover: #8a4205;
  --color-navy: #1f2a44;
  --color-pandan: #2f6b3a;
  --color-chili: #b3261e;

  --font-display: Newsreader, Georgia, "Times New Roman", serif;
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

Fonts (one link in the base layout):

```
https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap
```

**Build notes**

- `reference-components.css` holds reference CSS for all 12 components (`.al-btn`, `.al-nota`, `.al-price-row`…). It uses variable names without the Tailwind prefix (`--paper`, `--radius-card`); map them to the `@theme` names when porting. Port the rules into Astro components; don't copy class names blindly.
- Prices, minimums, lead times, surcharge and delivery rules come from site data (Sanity / `menu.ts`), never hard-coded in components.
- New needs that don't fit a token get flagged and added to this book first, not improvised in code.

**Open items:** logo files, product photography, an icon set, desktop specs for Pernikahan and Korporat, print styles for the quote, confirmation of the surcharge rule and snack-box lead time.
