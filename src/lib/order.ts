// Pure order maths shared by the order label, the 3D box label and the tests.

export type Area = 'kota-bogor' | 'luar-bogor';

export interface OrderPackage {
  name: string;
  price: number;
  unit: string;
  minOrder: number;
}

export interface OrderDraft {
  serviceName: string;
  leadDays: number;
  pkg: OrderPackage;
  variant?: string;
  qty: number;
  /** ISO date, YYYY-MM-DD, or '' when not chosen yet. */
  date: string;
  area: Area;
}

export interface Estimate {
  qty: number;
  subtotal: number;
  /** 20% of the value of the shortfall below the minimum order. */
  surcharge: number;
  total: number;
  belowMinimum: boolean;
  shortfall: number;
}

export const SURCHARGE_RATE = 0.2;
export const MAX_QTY = 5000;

export function clampQty(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? '').replace(/\D/g, ''), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), MAX_QTY);
}

export function estimate(pkg: OrderPackage, rawQty: number): Estimate {
  const qty = clampQty(rawQty);
  const subtotal = pkg.price * qty;
  const shortfall = Math.max(0, pkg.minOrder - qty);
  const surcharge = Math.round(pkg.price * shortfall * SURCHARGE_RATE);
  return { qty, subtotal, surcharge, total: subtotal + surcharge, belowMinimum: shortfall > 0, shortfall };
}

export function formatRupiah(n: number): string {
  const sign = n < 0 ? '-' : '';
  const digits = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp${digits}`;
}

/** Short form for tight spots: Rp1,25 jt, Rp55 rb. */
export function formatRupiahShort(n: number): string {
  if (n >= 1_000_000) {
    const jt = n / 1_000_000;
    const s = (Math.round(jt * 100) / 100).toString().replace('.', ',');
    return `Rp${s} jt`;
  }
  if (n >= 1000 && n % 1000 === 0) return `Rp${n / 1000} rb`;
  if (n >= 1000) return `Rp${(n / 1000).toString().replace('.', ',')} rb`;
  return formatRupiah(n);
}

/** Today's date in Bogor (Asia/Jakarta), as YYYY-MM-DD. */
export function todayInJakarta(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d + days);
  return new Date(t).toISOString().slice(0, 10);
}

export function earliestDate(leadDays: number, now: Date = new Date()): string {
  return addDays(todayInJakarta(now), leadDays);
}

export type DateCheck = 'empty' | 'invalid' | 'too-soon' | 'ok';

export function checkDate(iso: string, leadDays: number, now: Date = new Date()): DateCheck {
  if (!iso) return 'empty';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 'invalid';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return 'invalid';
  return iso < earliestDate(leadDays, now) ? 'too-soon' : 'ok';
}

export function formatDateLong(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatDateShort(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export const areaLabel: Record<Area, string> = {
  'kota-bogor': 'Kota Bogor',
  'luar-bogor': 'Luar Kota Bogor',
};

export function buildMessage(o: OrderDraft): string {
  const e = estimate(o.pkg, o.qty);
  const lines = [
    'Halo Aroma Langit, saya ingin memesan:',
    '',
    `• ${o.serviceName} ${o.pkg.name}${o.variant ? ` (${o.variant})` : ''}`,
    `• Jumlah: ${e.qty} ${o.pkg.unit}`,
    `• Tanggal acara: ${o.date ? formatDateLong(o.date) : 'belum ditentukan'}`,
    `• Diantar ke: ${areaLabel[o.area]}`,
    `• Perkiraan dari situs: ${formatRupiah(e.total)}${e.belowMinimum ? ` (termasuk biaya tambahan di bawah minimum ${formatRupiah(e.surcharge)})` : ''}`,
  ];
  if (o.area === 'luar-bogor') lines.push('', 'Mohon info ongkos kirim ke lokasi saya.');
  lines.push('', 'Mohon konfirmasi ketersediaan dan total akhirnya. Terima kasih.');
  return lines.join('\n');
}
