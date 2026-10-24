import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Button from '../../src/components/ui/Button.astro';
import Chip from '../../src/components/ui/Chip.astro';
import Choice from '../../src/components/ui/Choice.astro';
import Field from '../../src/components/ui/Field.astro';
import QuantityStepper from '../../src/components/ui/QuantityStepper.astro';
import Tabs from '../../src/components/ui/Tabs.astro';
import EventTile from '../../src/components/ui/EventTile.astro';
import Figure from '../../src/components/ui/Figure.astro';
import Band from '../../src/components/ui/Band.astro';
import TrustStamps from '../../src/components/ui/TrustStamps.astro';
import Nota from '../../src/components/ui/Nota.astro';
import NotaLine from '../../src/components/ui/NotaLine.astro';
import NotaTotal from '../../src/components/ui/NotaTotal.astro';
import NotaDeposit from '../../src/components/ui/NotaDeposit.astro';
import PriceRow from '../../src/components/ui/PriceRow.astro';
import SectionHeading from '../../src/components/ui/SectionHeading.astro';
import StickyOrderBar from '../../src/components/ui/StickyOrderBar.astro';

let c: AstroContainer;
beforeAll(async () => {
  c = await AstroContainer.create();
});

describe('ui primitives', () => {
  it('Button renders a button by default and a link with href', async () => {
    const btn = await c.renderToString(Button, { props: { variant: 'primary' }, slots: { default: 'Susun pesanan' } });
    expect(btn).toMatch(/<button type="button" class="ui-btn ui-btn--primary"[^>]*>\s*Susun pesanan/);
    const link = await c.renderToString(Button, { props: { href: '/kalkulator/', variant: 'link' }, slots: { default: 'Buka' } });
    expect(link).toMatch(/<a href="\/kalkulator\/" class="ui-link"/);
    const icon = await c.renderToString(Button, { props: { icon: true, 'aria-label': 'Tutup' }, slots: { default: 'x' } });
    expect(icon).toContain('ui-btn--icon');
    expect(icon).toContain('aria-label="Tutup"');
  });

  it('Chip is a plain span', async () => {
    const html = await c.renderToString(Chip, { props: { variant: 'halal' }, slots: { default: 'Halal BPJPH' } });
    expect(html).toMatch(/<span class="ui-chip ui-chip--halal"[^>]*>Halal BPJPH<\/span>/);
  });

  it('Tabs mark one tab selected and roving tabindex', async () => {
    const html = await c.renderToString(Tabs, {
      props: {
        label: 'Pilihan menu',
        selected: 1,
        tabs: [
          { id: 't0', label: 'Nusantara', controls: 'p0' },
          { id: 't1', label: 'Mancanegara', controls: 'p1' },
        ],
      },
    });
    expect(html).toContain('role="tablist" aria-label="Pilihan menu"');
    expect(html).toMatch(/id="t0" aria-controls="p0" aria-selected="false" tabindex="-1"/);
    expect(html).toMatch(/id="t1" aria-controls="p1" aria-selected="true" tabindex="0"/);
  });

  it('Choice renders real radio buttons in a fieldset with a legend', async () => {
    const html = await c.renderToString(Choice, {
      props: {
        name: 'area',
        legend: 'Diantar ke',
        options: [
          { value: 'kota-bogor', label: 'Kota Bogor', checked: true, attrs: { 'data-order-area': true } },
          { value: 'luar-bogor', label: 'Luar Kota Bogor', attrs: { 'data-order-area': true } },
        ],
      },
    });
    expect(html).toContain('<legend');
    expect(html.match(/type="radio" name="area"/g)).toHaveLength(2);
    expect(html).toMatch(/value="kota-bogor" checked/);
    expect(html).toContain('data-order-area');
  });

  it('Field ties the label to the control and renders help', async () => {
    const html = await c.renderToString(Field, {
      props: { id: 'order-date', label: 'Tanggal acara', help: 'Pesan paling lambat H-2.' },
      slots: { default: '<input id="order-date" class="ui-input" aria-describedby="order-date-help">' },
    });
    expect(html).toContain('<label for="order-date">Tanggal acara');
    expect(html).toContain('<p id="order-date-help" class="ui-help">Pesan paling lambat H-2.</p>');
  });

  it('QuantityStepper has labelled minus and plus buttons around a number input', async () => {
    const html = await c.renderToString(QuantityStepper, {
      props: { id: 'qty', value: 35, decLabel: 'Kurangi jumlah', incLabel: 'Tambah jumlah', inputAttrs: { 'data-order-qty': true } },
    });
    expect(html).toMatch(/data-step="-1" aria-label="Kurangi jumlah"/);
    expect(html).toMatch(/data-step="1" aria-label="Tambah jumlah"/);
    expect(html).toMatch(/id="qty" class="ui-input ui-input--number" type="number"[^>]*value="35"[^>]*data-order-qty/);
    expect(html).toContain('aria-hidden="true"');
  });
});

describe('ui composites', () => {
  it('EventTile is one link, or one radio inside a label', async () => {
    const link = await c.renderToString(EventTile, { props: { href: '/kalkulator/?acara=rapat', title: 'Rapat', price: 'sekitar Rp77.500' } });
    expect(link.match(/<a /g)).toHaveLength(1);
    expect(link).toContain('href="/kalkulator/?acara=rapat"');
    const radio = await c.renderToString(EventTile, { props: { name: 'preset', value: 'rapat', title: 'Rapat', checked: true } });
    expect(radio).toMatch(/<label class="ui-tile ui-tile--choice"/);
    expect(radio).toMatch(/type="radio" name="preset" value="rapat" checked/);
  });

  it('PriceRow names the package on its pick button and reports the pressed state', async () => {
    const html = await c.renderToString(PriceRow, {
      props: { name: 'Spesial A', srPrefix: 'Nasi Box', meta: 'Minimum 35 kotak', price: 'Rp45.000', unit: 'kotak', pickLabel: 'Pilih Nasi Box Spesial A', pickAttrs: { 'data-pick-package': 'spesial-a' } },
    });
    expect(html).toContain('aria-pressed="false" aria-label="Pilih Nasi Box Spesial A"');
    expect(html).toContain('data-pick-package="spesial-a"');
    expect(html).toContain('<span class="sr-only">Nasi Box </span>Spesial A');
    expect(html).toContain('ui-price-row__price tab');
    expect(html).not.toContain('leader');
  });

  it('Nota puts lines in a description list, a tear, and a live total', async () => {
    const line = await c.renderToString(NotaLine, { props: { label: 'Biaya di bawah minimum', amount: 'Rp45.000', variant: 'surcharge', hidden: true } });
    expect(line).toMatch(/class="ui-nota__line ui-nota__line--surcharge" hidden/);
    expect(line).toContain('<dt>Biaya di bawah minimum</dt>');
    const total = await c.renderToString(NotaTotal, { props: { label: 'Perkiraan total', amount: 'Rp1.575.000' } });
    expect(total).toContain('aria-live="polite"');
    const nota = await c.renderToString(Nota, { props: { id: 'nota', title: 'Nota perkiraan' }, slots: { default: line, total } });
    expect(nota).toMatch(/<section class="ui-nota" aria-labelledby="nota"/);
    expect(nota).toContain('<h2 id="nota" class="ui-nota__eyebrow">Nota perkiraan</h2>');
    expect(nota).toContain('<dl class="ui-nota__lines tab">');
    expect(nota).toContain('ui-nota__tear');
  });

  it('NotaDeposit shows the DP line and the settlement note after the total', async () => {
    const dp = await c.renderToString(NotaDeposit, { props: { rate: 50, amount: 'Rp787.500', settlement: 'Pelunasan paling lambat H-1.' } });
    expect(dp).toMatch(/<p class="ui-nota__dp"><span>Uang muka 50%<\/span><span>Rp787.500<\/span><\/p>/);
    expect(dp).toContain('<p class="ui-nota__settle">Pelunasan paling lambat H-1.</p>');
    const nota = await c.renderToString(Nota, { props: { id: 'n', title: 'Nota' }, slots: { total: '<p>TOTAL</p>', deposit: dp } });
    expect(nota.indexOf('TOTAL')).toBeLessThan(nota.indexOf('Uang muka'));
  });

  it('SectionHeading renders the level, context and link', async () => {
    const html = await c.renderToString(SectionHeading, { props: { id: 'menu-title', title: 'Menu & harga', context: '24 paket.', link: { href: '/x.pdf', label: 'Unduh daftar harga (PDF)', download: true } } });
    expect(html).toMatch(/<h2 id="menu-title" class="ui-section-head__title">Menu &amp; harga<\/h2>/);
    expect(html).toContain('ui-section-head__context">24 paket.');
    expect(html).toMatch(/<a class="ui-link" href="\/x.pdf" download/);
  });

  it('Figure keeps the ratio and the caption', async () => {
    const photo = { kind: 'remote', url: 'https://cdn.sanity.io/images/p/d/a-800x600.jpg', width: 800, height: 600, alt: 'Nasi box ayam bakar' } as const;
    const html = await c.renderToString(Figure, { props: { photo, ratio: '4/3', caption: 'Nasi box di Bogor.', sizes: '100vw' } });
    expect(html).toContain('--ratio: 4/3');
    expect(html).toContain('alt="Nasi box ayam bakar"');
    expect(html).toContain('<figcaption>Nasi box di Bogor.</figcaption>');
  });

  it('Band labels its section with its heading', async () => {
    const html = await c.renderToString(Band, { props: { id: 'klien', label: 'Klien kami' }, slots: { default: '<p class="ui-band__text">A · B</p>' } });
    expect(html).toMatch(/<section class="ui-band" aria-labelledby="klien"/);
    expect(html).toContain('<h2 id="klien" class="ui-band__label">Klien kami</h2>');
  });

  it('TrustStamps shows both certificates with their numbers from site data', async () => {
    const html = await c.renderToString(TrustStamps, { props: { details: true } });
    expect(html.match(/class="ui-stamp-item"/g)).toHaveLength(2);
    expect(html).toContain('ui-stamp ui-stamp--halal" aria-hidden="true">Halal</span>');
    expect(html).toContain('<p class="ui-stamp__num">ID32110001863560323</p>');
    expect(html).toContain('ui-stamp__detail');
  });

  it('StickyOrderBar shows the total and one primary action', async () => {
    const html = await c.renderToString(StickyOrderBar, { props: { total: 'Rp2.712.500', action: { href: '#nota', label: 'Lihat nota' }, attrs: { 'data-dock': true, hidden: true } } });
    expect(html).toContain('<strong>Rp2.712.500</strong>');
    expect(html.match(/ui-btn--primary/g)).toHaveLength(1);
    expect(html).toMatch(/data-dock[^>]*hidden/);
  });
});
