import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Button from '../../src/components/ui/Button.astro';
import Chip from '../../src/components/ui/Chip.astro';
import Choice from '../../src/components/ui/Choice.astro';
import Field from '../../src/components/ui/Field.astro';
import QuantityStepper from '../../src/components/ui/QuantityStepper.astro';
import Tabs from '../../src/components/ui/Tabs.astro';

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
