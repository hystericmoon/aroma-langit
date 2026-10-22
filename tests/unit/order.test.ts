import { describe, expect, it } from 'vitest';
import {
  addDays, buildMessage, checkDate, clampQty, earliestDate, estimate, formatDateLong,
  formatRupiah, formatRupiahShort, todayInJakarta,
} from '../../src/lib/order';
import { services } from '../../src/data/services';
import { weddingPortions } from '../../src/data/wedding';

const nasiBoxStandar = { name: 'Standar', price: 29000, unit: 'kotak', minOrder: 75 };

describe('estimate', () => {
  it('multiplies price by quantity at or above the minimum', () => {
    expect(estimate(nasiBoxStandar, 75)).toMatchObject({ subtotal: 2_175_000, surcharge: 0, total: 2_175_000, belowMinimum: false });
    expect(estimate(nasiBoxStandar, 200).total).toBe(5_800_000);
  });
  it('adds 20% of the shortfall value below the minimum', () => {
    // 50 boxes, minimum 75: shortfall 25 × 29.000 × 20% = 145.000
    const e = estimate(nasiBoxStandar, 50);
    expect(e).toMatchObject({ subtotal: 1_450_000, surcharge: 145_000, total: 1_595_000, belowMinimum: true, shortfall: 25 });
  });
  it('never goes below one unit or above the cap', () => {
    expect(estimate(nasiBoxStandar, 0).qty).toBe(1);
    expect(estimate(nasiBoxStandar, -4).qty).toBe(1);
    expect(estimate(nasiBoxStandar, Number.NaN).qty).toBe(1);
    expect(estimate(nasiBoxStandar, 99999).qty).toBe(5000);
  });
  it('treats per-set tumpeng as minimum one', () => {
    const tumpeng = services.find((s) => s.slug === 'tumpeng')!.packages[0];
    expect(estimate(tumpeng, 2)).toMatchObject({ total: 2_500_000, surcharge: 0 });
  });
});

describe('clampQty', () => {
  it('parses messy input', () => {
    expect(clampQty('150 kotak')).toBe(150);
    expect(clampQty('1.000')).toBe(1000);
    expect(clampQty('')).toBe(1);
    expect(clampQty(undefined)).toBe(1);
    expect(clampQty(12.7)).toBe(12);
  });
});

describe('formatting', () => {
  it('formats rupiah with dots', () => {
    expect(formatRupiah(22500)).toBe('Rp22.500');
    expect(formatRupiah(1250000)).toBe('Rp1.250.000');
    expect(formatRupiah(0)).toBe('Rp0');
  });
  it('formats short rupiah', () => {
    expect(formatRupiahShort(55000)).toBe('Rp55 rb');
    expect(formatRupiahShort(22500)).toBe('Rp22,5 rb');
    expect(formatRupiahShort(1250000)).toBe('Rp1,25 jt');
  });
  it('formats Indonesian long dates without timezone drift', () => {
    expect(formatDateLong('2026-11-07')).toBe('Sabtu, 7 November 2026');
    expect(formatDateLong('nope')).toBe('');
  });
});

describe('dates', () => {
  // 22 Oct 2026 23:30 UTC is already 23 Oct in Jakarta (UTC+7).
  const lateUtc = new Date('2026-10-22T23:30:00Z');
  it('uses Jakarta time for today', () => {
    expect(todayInJakarta(lateUtc)).toBe('2026-10-23');
  });
  it('adds days across month ends', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('checks lead time (H-n)', () => {
    expect(earliestDate(2, lateUtc)).toBe('2026-10-25');
    expect(checkDate('2026-10-24', 2, lateUtc)).toBe('too-soon');
    expect(checkDate('2026-10-25', 2, lateUtc)).toBe('ok');
    expect(checkDate('', 2, lateUtc)).toBe('empty');
    expect(checkDate('2026-02-30', 2, lateUtc)).toBe('invalid');
  });
});

describe('buildMessage', () => {
  it('writes every fact the customer service needs', () => {
    const msg = buildMessage({
      serviceName: 'Nasi Box', leadDays: 2, pkg: nasiBoxStandar, variant: 'Nusantara 1',
      qty: 150, date: '2026-11-07', area: 'kota-bogor',
    });
    expect(msg).toContain('Nasi Box Standar (Nusantara 1)');
    expect(msg).toContain('Jumlah: 150 kotak');
    expect(msg).toContain('Sabtu, 7 November 2026');
    expect(msg).toContain('Kota Bogor');
    expect(msg).toContain('Rp4.350.000');
    expect(msg).not.toContain('biaya tambahan');
  });
  it('mentions surcharge and delivery when relevant', () => {
    const msg = buildMessage({
      serviceName: 'Nasi Box', leadDays: 2, pkg: nasiBoxStandar, qty: 50, date: '', area: 'luar-bogor',
    });
    expect(msg).toContain('belum ditentukan');
    expect(msg).toContain('Rp145.000');
    expect(msg).toContain('ongkos kirim');
  });
});

describe('data integrity', () => {
  it('every service has packages with sane prices and minimums', () => {
    expect(services.map((s) => s.slug)).toEqual(['nasi-box', 'bento', 'snack-box', 'prasmanan', 'tumpeng', 'tumpeng-mini']);
    for (const s of services) {
      expect(s.packages.length).toBeGreaterThan(0);
      const ids = new Set<string>();
      for (const p of s.packages) {
        expect(ids.has(p.id)).toBe(false);
        ids.add(p.id);
        expect(p.price).toBeGreaterThan(10000);
        expect(p.minOrder).toBeGreaterThanOrEqual(1);
        expect(p.variants.length).toBeGreaterThan(0);
        for (const v of p.variants) expect(v.groups.every((g) => g.items.length > 0)).toBe(true);
      }
    }
  });
  it('prices are ordered from most to least expensive within a service', () => {
    for (const s of services) {
      const prices = s.packages.map((p) => p.price);
      expect([...prices].sort((a, b) => b - a)).toEqual(prices);
    }
  });
  it('wedding portions follow the catalogue rule', () => {
    expect(weddingPortions(1000)).toEqual({ buffet: 600, stall: 2000 });
    expect(weddingPortions(-5)).toEqual({ buffet: 0, stall: 0 });
  });
});
