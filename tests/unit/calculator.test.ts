import { describe, expect, it, vi } from 'vitest';
import {
  buildCatalog, buildPlanMessage, generalTermsApply, cleanLabel, computePlan, decodePlan, encodePlan, newItem, planFromPreset, quantityFor,
  type Plan,
} from '../../src/lib/calculator';
import { services } from '../../src/data/services';
import { weddingCatering } from '../../src/data/wedding';
import { presets } from '../../src/data/presets';

const catalog = buildCatalog(services, weddingCatering);
const now = new Date('2026-10-22T03:00:00Z'); // 10:00 in Bogor
const preset = (id: string) => presets.find((p) => p.id === id)!;

describe('catalog', () => {
  it('includes every service and the wedding packages', () => {
    expect(catalog.map((c) => c.slug)).toEqual(['nasi-box', 'bento', 'snack-box', 'prasmanan', 'tumpeng', 'tumpeng-mini', 'pernikahan']);
    expect(catalog.find((c) => c.slug === 'tumpeng')!.servesPerUnit).toBe(25);
    expect(catalog.find((c) => c.slug === 'pernikahan')!.packages.map((p) => p.id)).toEqual(['platinum', 'gold', 'silver', 'bronze']);
  });
});

describe('presets', () => {
  it('only reference packages that exist', () => {
    for (const p of presets) {
      const plan = planFromPreset(p, catalog);
      expect(plan.items.length, p.id).toBe(p.items.length);
    }
  });
  it('meet every minimum order at their default guest count', () => {
    for (const p of presets) {
      const r = computePlan(planFromPreset(p, catalog), catalog, now);
      expect(r.surcharge, p.id).toBe(0);
    }
  });
});

describe('quantities', () => {
  const tumpeng = catalog.find((c) => c.slug === 'tumpeng')!;
  const box = catalog.find((c) => c.slug === 'nasi-box')!;
  const base = { id: 'x', label: 'x', service: 'nasi-box', pkg: 'standar', variant: '', fixed: 1, perGuest: 1 };
  it('per guest rounds portions up', () => {
    expect(quantityFor({ ...base, mode: 'per-guest', perGuest: 1 }, box, 37)).toBe(37);
    expect(quantityFor({ ...base, mode: 'per-guest', perGuest: 0.6 }, box, 500)).toBe(300);
    expect(quantityFor({ ...base, mode: 'per-guest', perGuest: 0.6 }, box, 333)).toBe(200);
    expect(quantityFor({ ...base, mode: 'per-guest', perGuest: 1.5 }, box, 3)).toBe(5);
  });
  it('turns guests into tampah for tumpeng', () => {
    expect(quantityFor({ ...base, service: 'tumpeng', mode: 'per-guest', perGuest: 1 }, tumpeng, 60)).toBe(3);
    expect(quantityFor({ ...base, service: 'tumpeng', mode: 'per-guest', perGuest: 1 }, tumpeng, 25)).toBe(1);
  });
  it('fixed quantities are clamped', () => {
    expect(quantityFor({ ...base, mode: 'fixed', fixed: 0 }, box, 10)).toBe(1);
    expect(quantityFor({ ...base, mode: 'fixed', fixed: 99999 }, box, 10)).toBe(5000);
  });
});

describe('computePlan', () => {
  it('totals lines, surcharges, per-guest cost and the longest lead time', () => {
    const plan = planFromPreset(preset('syukuran'), catalog, 100);
    const r = computePlan(plan, catalog, now);
    // Tumpeng Premium 1 × 1.250.000 + Nasi Box Lengkap A 100 × 38.000
    expect(r.total).toBe(1_250_000 + 3_800_000);
    expect(r.perGuest).toBe(50_500);
    expect(r.leadDays).toBe(2);
    expect(r.earliest).toBe('2026-10-24');
  });
  it('adds the below-minimum surcharge per line', () => {
    const plan = planFromPreset(preset('rapat'), catalog, 30);
    const r = computePlan(plan, catalog, now);
    // Snack Spesial min 35 at 32.500: 5 × 32.500 × 20% = 32.500; Nasi Box Spesial A min 35 at 45.000: 5 × 45.000 × 20% = 45.000
    expect(r.surcharge).toBe(32_500 + 45_000);
    expect(r.total).toBe(30 * 32_500 + 30 * 45_000 + 77_500);
  });
  it('uses the wedding lead time of H-30', () => {
    const r = computePlan(planFromPreset(preset('pernikahan'), catalog), catalog, now);
    expect(r.leadDays).toBe(30);
    expect(r.lines[0].qty).toBe(300);
    expect(r.total).toBe(300 * 85_000);
  });
  it('handles an empty plan', () => {
    const r = computePlan(planFromPreset(preset('kustom'), catalog), catalog, now);
    expect(r).toMatchObject({ total: 0, perGuest: 0, leadDays: 0, lines: [] });
  });
});

describe('sharing', () => {
  it('round-trips a customised plan', () => {
    const plan: Plan = planFromPreset(preset('pelatihan'), catalog, 42);
    plan.date = '2026-11-07';
    plan.area = 'luar-bogor';
    plan.items[1] = { ...plan.items[1], pkg: 'premium', variant: 'Beef Teriyaki', label: 'Makan siang VIP' };
    plan.items.push({ ...newItem(catalog, plan), mode: 'fixed', fixed: 7 });
    const back = decodePlan(encodePlan(plan), catalog)!;
    expect(back.guests).toBe(42);
    expect(back.date).toBe('2026-11-07');
    expect(back.area).toBe('luar-bogor');
    expect(back.items.map((i) => [i.label, i.service, i.pkg, i.variant, i.mode])).toEqual(
      plan.items.map((i) => [i.label, i.service, i.pkg, i.variant, i.mode]),
    );
    expect(back.items[3].fixed).toBe(7);
  });
  it('rejects junk and drops unknown packages', () => {
    expect(decodePlan('not-base64!!', catalog)).toBeNull();
    const evil = btoa(JSON.stringify({ v: 1, a: 'x', g: 1e9, d: '<script>', i: [['<b>Hi</b>', 'nasi-box', 'nope', '', 0, 1], ['ok', 'bento', 'premium', 'zzz', 0, 99]] }));
    const plan = decodePlan(evil, catalog)!;
    expect(plan.guests).toBe(5000);
    expect(plan.date).toBe('');
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0]).toMatchObject({ service: 'bento', pkg: 'premium', variant: 'Kebuli Iga Sapi', perGuest: 10 });
  });
  it('cleans labels', () => {
    expect(cleanLabel('  <img src=x>  Makan\n siang ')).toBe('img src=x Makan siang');
    expect(cleanLabel('x'.repeat(80))).toHaveLength(40);
  });
});

describe('newItem', () => {
  it('suggests a service not yet in the plan', () => {
    const plan = planFromPreset(preset('rapat'), catalog);
    const item = newItem(catalog, plan);
    expect(['snack-box', 'nasi-box']).not.toContain(item.service);
    expect(item.service).not.toBe('pernikahan');
  });
});

describe('buildPlanMessage', () => {
  it('lists every line with quantities and totals', () => {
    const plan = planFromPreset(preset('pelatihan'), catalog, 40);
    plan.date = '2026-11-07';
    const r = computePlan(plan, catalog, now);
    const msg = buildPlanMessage(plan, r, 'Pelatihan sehari', 'peserta', 'https://aromalangit.id/kalkulator/#n=abc');
    expect(msg).toContain('Acara: Pelatihan sehari');
    expect(msg).toContain('Jumlah peserta: 40');
    expect(msg).toContain('Sabtu, 7 November 2026');
    expect(msg).toContain('1. Snack pagi: Snack Box Spesial');
    expect(msg).toContain('2. Makan siang: Bento Spesial (Ayam Bakar Padang), 40 bento = Rp1.500.000');
    expect(msg).toContain(`Perkiraan total: Rp4.100.000`);
    expect(msg).toContain('Rincian: https://aromalangit.id/kalkulator/#n=abc');
    expect(msg).not.toContain('Uang muka');
    vi.useFakeTimers({ now: new Date('2026-10-24T03:00:00Z'), toFake: ['Date'] });
    const withTerms = buildPlanMessage(plan, r, 'Pelatihan sehari', 'peserta', undefined, { depositRate: 50, settlementDays: 1 });
    expect(withTerms).toContain('Uang muka 50%: Rp2.050.000. Pelunasan paling lambat Jumat, 6 November 2026 (H-1).');
    vi.useRealTimers();
  });
  it('leaves the general DP rule out of wedding plans, which follow the wedding terms', () => {
    const terms = { depositRate: 50, settlementDays: 1 };
    const wedding = computePlan(planFromPreset(preset('pernikahan'), catalog), catalog, now);
    expect(generalTermsApply(wedding)).toBe(false);
    expect(buildPlanMessage(planFromPreset(preset('pernikahan'), catalog), wedding, 'Pernikahan', 'undangan', undefined, terms)).not.toContain('Uang muka');
    expect(generalTermsApply(computePlan(planFromPreset(preset('rapat'), catalog), catalog, now))).toBe(true);
  });
});
