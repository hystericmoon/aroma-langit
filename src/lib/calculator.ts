// Catering calculator: plans a whole event as several order lines.
// Pure functions only, shared by the page script and the tests.
import { estimate, formatDateLong, formatRupiah, areaLabel, earliestDate, checkDate, paymentLine, type Area, type DateCheck, type PaymentTerms } from './order';

export interface CatalogPackage {
  id: string;
  name: string;
  price: number;
  unit: string;
  minOrder: number;
  variants: string[];
}

export interface CatalogService {
  slug: string;
  title: string;
  leadDays: number;
  /** Guests one unit feeds (a tumpeng tampah feeds 20–25, a box feeds one). */
  servesPerUnit: number;
  packages: CatalogPackage[];
}

export type QtyMode = 'per-guest' | 'fixed';

export interface PlanItem {
  id: string;
  label: string;
  service: string;
  pkg: string;
  variant: string;
  mode: QtyMode;
  /** Portions per guest in per-guest mode (e.g. 2 for two snack sessions, 0.6 for a wedding buffet). */
  perGuest: number;
  /** Units in fixed mode. */
  fixed: number;
}

export interface Plan {
  preset: string;
  guests: number;
  date: string;
  area: Area;
  items: PlanItem[];
}

export interface PresetItem {
  label: string;
  service: string;
  pkg: string;
  mode: QtyMode;
  perGuest?: number;
  fixed?: number;
}

export interface Preset {
  id: string;
  title: string;
  description: string;
  guests: number;
  /** Word used for the guest count: "tamu" or "undangan". */
  guestWord: string;
  items: PresetItem[];
}

export interface Line {
  item: PlanItem;
  service: CatalogService;
  pkg: CatalogPackage;
  qty: number;
  subtotal: number;
  surcharge: number;
  total: number;
  shortfall: number;
}

export interface PlanResult {
  lines: Line[];
  subtotal: number;
  surcharge: number;
  total: number;
  perGuest: number;
  leadDays: number;
  earliest: string;
  dateCheck: DateCheck;
}

export const LIMITS = { guests: [1, 5000], items: 20, perGuest: [0.1, 10], fixed: [1, 5000], label: 40 } as const;
export const MULTIPLIERS = [0.5, 0.6, 1, 1.5, 2, 3];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const num = (v: unknown, fallback: number) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function findPackage(catalog: CatalogService[], service: string, pkg: string) {
  const s = catalog.find((c) => c.slug === service);
  const p = s?.packages.find((x) => x.id === pkg);
  return s && p ? { s, p } : null;
}

export function quantityFor(item: PlanItem, service: CatalogService, guests: number): number {
  if (item.mode === 'fixed') return clamp(Math.round(item.fixed), LIMITS.fixed[0], LIMITS.fixed[1]);
  const portions = guests * clamp(item.perGuest, LIMITS.perGuest[0], LIMITS.perGuest[1]);
  return clamp(Math.ceil(portions / Math.max(1, service.servesPerUnit) - 1e-9), 1, LIMITS.fixed[1]);
}

export function computePlan(plan: Plan, catalog: CatalogService[], now: Date = new Date()): PlanResult {
  const lines: Line[] = [];
  for (const item of plan.items) {
    const found = findPackage(catalog, item.service, item.pkg);
    if (!found) continue;
    const qty = quantityFor(item, found.s, plan.guests);
    const e = estimate(found.p, qty);
    lines.push({ item, service: found.s, pkg: found.p, qty: e.qty, subtotal: e.subtotal, surcharge: e.surcharge, total: e.total, shortfall: e.shortfall });
  }
  const subtotal = lines.reduce((a, l) => a + l.subtotal, 0);
  const surcharge = lines.reduce((a, l) => a + l.surcharge, 0);
  const total = subtotal + surcharge;
  const leadDays = lines.reduce((a, l) => Math.max(a, l.service.leadDays), 0);
  return {
    lines,
    subtotal,
    surcharge,
    total,
    perGuest: plan.guests > 0 ? Math.round(total / plan.guests) : 0,
    leadDays,
    earliest: earliestDate(leadDays, now),
    dateCheck: checkDate(plan.date, leadDays, now),
  };
}

let seq = 0;
export const newId = () => `i${Date.now().toString(36)}${(seq++).toString(36)}`;

export function planFromPreset(preset: Preset, catalog: CatalogService[], guests = preset.guests): Plan {
  return {
    preset: preset.id,
    guests: clamp(Math.round(guests), LIMITS.guests[0], LIMITS.guests[1]),
    date: '',
    area: 'kota-bogor',
    items: preset.items
      .filter((it) => findPackage(catalog, it.service, it.pkg))
      .map((it) => ({
        id: newId(),
        label: it.label,
        service: it.service,
        pkg: it.pkg,
        variant: findPackage(catalog, it.service, it.pkg)!.p.variants[0] ?? '',
        mode: it.mode,
        perGuest: it.perGuest ?? 1,
        fixed: it.fixed ?? 1,
      })),
  };
}

/** A sensible new line: the next service not yet in the plan, its middle package, one per guest. */
export function newItem(catalog: CatalogService[], plan: Plan): PlanItem {
  const used = new Set(plan.items.map((i) => i.service));
  const s = catalog.find((c) => !used.has(c.slug) && c.slug !== 'pernikahan') ?? catalog[0];
  const p = s.packages[Math.floor((s.packages.length - 1) / 2)];
  return {
    id: newId(),
    label: s.title,
    service: s.slug,
    pkg: p.id,
    variant: p.variants[0] ?? '',
    mode: s.servesPerUnit > 1 ? 'fixed' : 'per-guest',
    perGuest: 1,
    fixed: 1,
  };
}

/* ------------------------------------------------------------------ sharing */

interface Packed {
  v: 1;
  a: string; // preset
  g: number; // guests
  d?: string; // date
  r?: 0 | 1; // area: 1 = outside Bogor
  i: [string, string, string, string, 0 | 1, number][]; // label, service, pkg, variant, mode (1 = fixed), amount
}

const b64url = {
  encode(s: string) {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode(s: string) {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  },
};

export function encodePlan(plan: Plan): string {
  const packed: Packed = {
    v: 1,
    a: plan.preset,
    g: plan.guests,
    ...(plan.date ? { d: plan.date } : {}),
    ...(plan.area === 'luar-bogor' ? { r: 1 as const } : {}),
    i: plan.items.map((it) => [it.label, it.service, it.pkg, it.variant, it.mode === 'fixed' ? 1 : 0, it.mode === 'fixed' ? it.fixed : it.perGuest]),
  };
  return b64url.encode(JSON.stringify(packed));
}

/** Reads a shared plan. Anything unknown or out of range is dropped or clamped. */
export function decodePlan(code: string, catalog: CatalogService[]): Plan | null {
  let raw: Packed;
  try {
    raw = JSON.parse(b64url.decode(code));
  } catch {
    return null;
  }
  if (!raw || raw.v !== 1 || !Array.isArray(raw.i)) return null;
  const items: PlanItem[] = [];
  for (const row of raw.i.slice(0, LIMITS.items)) {
    if (!Array.isArray(row)) continue;
    const [label, service, pkg, variant, mode, amount] = row;
    const found = findPackage(catalog, String(service), String(pkg));
    if (!found) continue;
    const fixed = mode === 1;
    items.push({
      id: newId(),
      label: (typeof label === 'string' ? cleanLabel(label) : '') || found.s.title,
      service: found.s.slug,
      pkg: found.p.id,
      variant: found.p.variants.includes(String(variant)) ? String(variant) : (found.p.variants[0] ?? ''),
      mode: fixed ? 'fixed' : 'per-guest',
      perGuest: fixed ? 1 : clamp(num(amount, 1), LIMITS.perGuest[0], LIMITS.perGuest[1]),
      fixed: fixed ? clamp(Math.round(num(amount, 1)), LIMITS.fixed[0], LIMITS.fixed[1]) : 1,
    });
  }
  return {
    preset: typeof raw.a === 'string' ? raw.a.slice(0, 40) : 'kustom',
    guests: clamp(Math.round(num(raw.g, 50)), LIMITS.guests[0], LIMITS.guests[1]),
    date: typeof raw.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.d) ? raw.d : '',
    area: raw.r === 1 ? 'luar-bogor' : 'kota-bogor',
    items,
  };
}

export function cleanLabel(v: unknown): string {
  return String(v ?? '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LIMITS.label);
}

/* ------------------------------------------------------------------ message */

const formatQty = (n: number) => n.toLocaleString('id-ID');

/** The general DP and settlement rule applies unless the plan has a wedding line, which
 *  follows the wedding terms (booking fee and instalments) instead. */
export function generalTermsApply(result: PlanResult): boolean {
  return result.lines.length > 0 && !result.lines.some((l) => l.service.slug === 'pernikahan');
}

export function buildPlanMessage(plan: Plan, result: PlanResult, eventName: string, guestWord: string, shareUrl?: string, terms?: PaymentTerms): string {
  const lines = [
    'Halo Aroma Langit, saya ingin memesan katering untuk acara berikut:',
    '',
    `Acara: ${eventName}`,
    `Jumlah ${guestWord}: ${formatQty(plan.guests)}`,
    `Tanggal: ${plan.date ? formatDateLong(plan.date) : 'belum ditentukan'}`,
    `Diantar ke: ${areaLabel[plan.area]}`,
    '',
  ];
  result.lines.forEach((l, i) => {
    const variant = l.item.variant && l.pkg.variants.length > 1 ? ` (${l.item.variant})` : '';
    lines.push(`${i + 1}. ${l.item.label}: ${l.service.title} ${l.pkg.name}${variant}, ${formatQty(l.qty)} ${l.pkg.unit} = ${formatRupiah(l.subtotal)}`);
    if (l.surcharge > 0) lines.push(`   + biaya di bawah minimum ${l.pkg.minOrder} ${l.pkg.unit}: ${formatRupiah(l.surcharge)}`);
  });
  lines.push('', `Perkiraan total: ${formatRupiah(result.total)} (${formatRupiah(result.perGuest)} per ${guestWord})`);
  if (terms && generalTermsApply(result)) lines.push(paymentLine(result.total, terms, plan.date));
  if (plan.area === 'luar-bogor') lines.push('Mohon info ongkos kirim ke lokasi saya.');
  if (shareUrl) lines.push('', `Rincian: ${shareUrl}`);
  lines.push('', 'Mohon konfirmasi ketersediaan dan total akhirnya. Terima kasih.');
  return lines.join('\n');
}

/* ------------------------------------------------------------------ catalog */

interface ServiceLike {
  slug: string;
  title: string;
  leadDays: number;
  packages: { id: string; name: string; price: number; unit: string; minOrder: number; variants: { name: string }[] }[];
}

/** Wedding receptions are ordered at least 30 days ahead (H-30). */
export const WEDDING_LEAD_DAYS = 30;

export function buildCatalog(services: ServiceLike[], wedding: { name: string; price: number; minOrder: number }[] = []): CatalogService[] {
  const catalog: CatalogService[] = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    leadDays: s.leadDays,
    servesPerUnit: s.packages.every((p) => p.unit === 'set') ? 25 : 1,
    packages: s.packages.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      minOrder: p.minOrder,
      variants: p.variants.map((v) => v.name),
    })),
  }));
  if (wedding.length) {
    catalog.push({
      slug: 'pernikahan',
      title: 'Katering Pernikahan',
      leadDays: WEDDING_LEAD_DAYS,
      servesPerUnit: 1,
      packages: wedding.map((w) => ({
        id: w.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: w.name,
        price: w.price,
        unit: 'pax',
        minOrder: w.minOrder,
        variants: ['Nusantara', 'Oriental', 'Western'],
      })),
    });
  }
  return catalog;
}

export function multiplierLabel(m: number): string {
  const s = String(Math.round(m * 100) / 100).replace('.', ',');
  const pretty = s === '0,5' ? '½' : s === '1,5' ? '1½' : s;
  return `${pretty} per tamu`;
}
