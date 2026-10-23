// Catering calculator page: state, rendering and events. All maths is in lib/calculator.
import {
  buildPlanMessage, cleanLabel, computePlan, decodePlan, encodePlan, LIMITS, MULTIPLIERS, multiplierLabel, newItem,
  planFromPreset, quantityFor, type CatalogService, type Plan, type PlanItem, type PlanResult, type Preset,
} from '../lib/calculator';
import { areaLabel, checkDate, earliestDate, formatDateLong, formatRupiah, type Area } from '../lib/order';

interface Data {
  catalog: CatalogService[];
  presets: Preset[];
  csPhone: string;
  marketingPhone: string;
}

const data: Data = JSON.parse(document.getElementById('calc-data')!.textContent || '{}');
const { catalog, presets } = data;
const STORE = 'aroma:kalkulator';

const form = document.querySelector<HTMLFormElement>('[data-calc-form]')!;
const list = form.querySelector<HTMLOListElement>('[data-items]')!;
const tpl = document.getElementById('item-tpl') as HTMLTemplateElement;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;

const ui = {
  presetRadios: Array.from(form.querySelectorAll<HTMLInputElement>('[data-preset]')),
  status: $('[data-status]', form),
  guests: $<HTMLInputElement>('[data-guests]', form),
  guestsRange: $<HTMLInputElement>('[data-guests-range]', form),
  guestWord: $('[data-guest-word]', form),
  empty: $('[data-empty]', form),
  add: $<HTMLButtonElement>('[data-add]', form),
  date: $<HTMLInputElement>('[data-date]', form),
  dateHelp: $('[data-date-help]', form),
  areas: Array.from(form.querySelectorAll<HTMLInputElement>('[data-area]')),
  receipt: $('[data-receipt]'),
  rEvent: $('[data-r-event]'),
  rGuests: $('[data-r-guests]'),
  rDate: $('[data-r-date]'),
  rArea: $('[data-r-area]'),
  lines: $<HTMLOListElement>('[data-lines]'),
  rEmpty: $('[data-r-empty]'),
  rSub: $('[data-r-sub]'),
  rExtraRow: $('[data-r-extra-row]'),
  rExtra: $('[data-r-extra]'),
  rShip: $('[data-r-ship]'),
  rTotal: $('[data-r-total]'),
  rPer: $('[data-r-per]'),
  rLead: $('[data-r-lead]'),
  send: $<HTMLButtonElement>('[data-send]'),
  share: $<HTMLButtonElement>('[data-share]'),
  print: $<HTMLButtonElement>('[data-print]'),
  reset: $<HTMLButtonElement>('[data-reset]'),
  live: $('[data-live]'),
  dock: $('[data-dock]'),
  dockTotal: $('[data-dock-total]'),
  dockPer: $('[data-dock-per]'),
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const presetById = (id: string) => presets.find((p) => p.id === id);
const custom = presets.find((p) => p.items.length === 0) ?? presets[presets.length - 1];
const serviceOf = (slug: string) => catalog.find((c) => c.slug === slug) ?? catalog[0];
const pkgOf = (item: PlanItem) => {
  const s = serviceOf(item.service);
  return s.packages.find((p) => p.id === item.pkg) ?? s.packages[0];
};

/* ------------------------------------------------------------------ state */

let plan: Plan = initialPlan();
let guestsTouched = false;
let undoPlan: Plan | null = null;
let undoTimer = 0;
let shownTotal = 0; // the figure on screen, updated every frame
let tween = 0;
let settle = 0;
let liveTimer = 0;
let saveTimer = 0;
let renderedLines = new Set<string>();

function initialPlan(): Plan {
  const hash = new URLSearchParams(location.hash.slice(1)).get('n');
  if (hash) {
    const p = decodePlan(hash, catalog);
    if (p) return p;
  }
  const preset = presetById(new URLSearchParams(location.search).get('acara') || '');
  if (preset) return planFromPreset(preset, catalog);
  try {
    const saved = localStorage.getItem(STORE);
    const p = saved ? decodePlan(saved, catalog) : null;
    if (p) return p;
  } catch {
    /* storage unavailable */
  }
  return planFromPreset(presets[0], catalog);
}

const currentPreset = () => presetById(plan.preset) ?? custom;
const guestWord = () => currentPreset().guestWord || 'tamu';
const clone = (p: Plan): Plan => ({ ...p, items: p.items.map((i) => ({ ...i })) });

/* ------------------------------------------------------------------ rows */

function fillOptions(select: HTMLSelectElement, options: { value: string; label: string }[], value: string) {
  select.replaceChildren(
    ...options.map((o) => {
      const el = document.createElement('option');
      el.value = o.value;
      el.textContent = o.label;
      return el;
    }),
  );
  select.value = options.some((o) => o.value === value) ? value : (options[0]?.value ?? '');
}

function makeRow(item: PlanItem): HTMLLIElement {
  const li = (tpl.content.firstElementChild as HTMLLIElement).cloneNode(true) as HTMLLIElement;
  li.dataset.id = item.id;
  // Give every control its own id, keeping labels wired to their fields.
  li.querySelectorAll<HTMLElement>('[id]').forEach((el) => (el.id = el.id.replace('__ID__', item.id)));
  li.querySelectorAll<HTMLLabelElement>('label[for]').forEach((el) => (el.htmlFor = el.htmlFor.replace('__ID__', item.id)));
  li.querySelectorAll<HTMLOutputElement>('output[for]').forEach((el) => el.setAttribute('for', (el.getAttribute('for') || '').replaceAll('__ID__', item.id)));
  li.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((el) => (el.name = el.name.replace('__ID__', item.id)));
  syncRow(li, item);
  return li;
}

/** Writes an item's values into its row. */
function syncRow(li: HTMLElement, item: PlanItem) {
  const s = serviceOf(item.service);
  const p = pkgOf(item);
  const label = li.querySelector<HTMLInputElement>('[data-f="label"]')!;
  if (document.activeElement !== label) label.value = item.label;
  li.querySelector('[data-remove]')!.setAttribute('aria-label', `Hapus ${item.label || 'baris ini'}`);
  fillOptions(li.querySelector('[data-f="service"]')!, catalog.map((c) => ({ value: c.slug, label: c.title })), s.slug);
  fillOptions(li.querySelector('[data-f="pkg"]')!, s.packages.map((x) => ({ value: x.id, label: `${x.name} · ${formatRupiah(x.price)}/${x.unit}` })), p.id);
  const variantWrap = li.querySelector<HTMLElement>('[data-variant-wrap]')!;
  variantWrap.hidden = p.variants.length < 2;
  fillOptions(li.querySelector('[data-f="variant"]')!, p.variants.map((v) => ({ value: v, label: v })), item.variant);
  li.querySelectorAll<HTMLInputElement>('[data-f="mode"]').forEach((r) => (r.checked = r.value === item.mode));
  li.querySelector<HTMLElement>('[data-per]')!.hidden = item.mode !== 'per-guest';
  li.querySelector<HTMLElement>('[data-fixed]')!.hidden = item.mode !== 'fixed';
  const mults = MULTIPLIERS.includes(item.perGuest) ? MULTIPLIERS : [...MULTIPLIERS, item.perGuest].sort((a, b) => a - b);
  fillOptions(li.querySelector('[data-f="perGuest"]')!, mults.map((m) => ({ value: String(m), label: multiplierLabel(m) })), String(item.perGuest));
  const fixed = li.querySelector<HTMLInputElement>('[data-f="fixed"]')!;
  if (document.activeElement !== fixed) fixed.value = String(item.fixed);
}

function renderItems(focus?: { id: string; field: string } | 'add') {
  list.replaceChildren(...plan.items.map(makeRow));
  ui.empty.hidden = plan.items.length > 0;
  ui.add.disabled = plan.items.length >= LIMITS.items;
  if (focus === 'add') ui.add.focus();
  else if (focus) list.querySelector<HTMLElement>(`[data-id="${focus.id}"] [data-f="${focus.field}"]`)?.focus();
}

/* ------------------------------------------------------------------ update */

function update(opts: { announce?: boolean } = {}) {
  const result = computePlan(plan, catalog);
  const word = guestWord();

  // Rows: computed quantity and notes
  for (const line of result.lines) {
    const li = list.querySelector<HTMLElement>(`[data-id="${line.item.id}"]`);
    if (!li) continue;
    const out = li.querySelector<HTMLElement>('[data-qty]')!;
    const text = `= ${line.qty.toLocaleString('id-ID')} ${line.pkg.unit}`;
    if (out.textContent !== text) {
      out.textContent = text;
      if (!reduceMotion.matches) {
        out.classList.remove('bump');
        void out.offsetWidth;
        out.classList.add('bump');
      }
    }
    const note = li.querySelector<HTMLElement>('[data-note]')!;
    if (line.surcharge > 0) {
      note.textContent = `Minimum ${line.pkg.minOrder} ${line.pkg.unit}. Kurang ${line.shortfall}, jadi ada biaya tambahan ${formatRupiah(line.surcharge)}.`;
      note.classList.add('warn');
    } else {
      note.classList.remove('warn');
      note.textContent = line.service.servesPerUnit > 1
        ? `Satu ${line.pkg.unit} untuk 20–25 orang. Minimum ${line.pkg.minOrder} ${line.pkg.unit}.`
        : `Minimum ${line.pkg.minOrder} ${line.pkg.unit}. Pesan paling lambat H-${line.service.leadDays}.`;
    }
  }

  // Guests
  ui.guestWord.textContent = word;
  if (document.activeElement !== ui.guests) ui.guests.value = String(plan.guests);
  ui.guestsRange.value = String(Math.min(1000, Math.max(10, plan.guests)));

  // Date
  const dc = checkDate(plan.date, result.leadDays);
  ui.date.min = earliestDate(result.leadDays);
  if (dc === 'too-soon') {
    ui.dateHelp.textContent = `Untuk pesanan ini, pesan paling lambat H-${result.leadDays}. Tanggal paling cepat: ${formatDateLong(result.earliest)}. Tetap bisa ditanyakan lewat WhatsApp.`;
  } else if (dc === 'invalid') {
    ui.dateHelp.textContent = 'Tanggal tidak dikenali. Pilih dari kalender.';
  } else if (dc === 'ok') {
    ui.dateHelp.textContent = formatDateLong(plan.date);
  } else {
    ui.dateHelp.textContent = result.lines.length
      ? `Pesan paling lambat H-${result.leadDays}. Tanggal paling cepat: ${formatDateLong(result.earliest)}.`
      : 'Pilih tanggal untuk memeriksa waktu pemesanan.';
  }
  ui.dateHelp.classList.toggle('warn', dc === 'too-soon' || dc === 'invalid');
  ui.date.setAttribute('aria-invalid', String(dc === 'too-soon' || dc === 'invalid'));

  renderReceipt(result, word);
  ui.dockTotal.textContent = formatRupiah(result.total);
  ui.dockPer.textContent = result.lines.length ? `${formatRupiah(result.perGuest)}/${word}` : '';

  clearTimeout(liveTimer);
  if (opts.announce !== false) {
    liveTimer = window.setTimeout(() => {
      ui.live.textContent = result.lines.length
        ? `Perkiraan total ${formatRupiah(result.total)}, ${formatRupiah(result.perGuest)} per ${word}.`
        : 'Nota kosong.';
    }, 800);
  }

  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(persist, 300);
}

function renderReceipt(result: PlanResult, word: string) {
  const preset = currentPreset();
  ui.rEvent.textContent = preset === custom ? 'Acara Anda' : preset.title;
  ui.rGuests.textContent = `${plan.guests.toLocaleString('id-ID')} ${word}`;
  ui.rDate.textContent = plan.date && checkDate(plan.date, 0) !== 'invalid' ? formatDateLong(plan.date) : 'Belum dipilih';
  ui.rArea.textContent = areaLabel[plan.area];

  const next = new Set<string>();
  let fresh = 0;
  ui.lines.replaceChildren(
    ...result.lines.map((l) => {
      next.add(l.item.id);
      const li = document.createElement('li');
      li.className = 'line';
      if (!renderedLines.has(l.item.id) && !reduceMotion.matches) {
        li.classList.add('is-new');
        li.style.setProperty('--i', String(fresh++));
      }
      li.dataset.line = l.item.id;
      const variant = l.item.variant && l.pkg.variants.length > 1 ? `, ${l.item.variant}` : '';
      const name = span('l-name', l.item.label || l.service.title);
      const amt = span('l-amt tab', formatRupiah(l.subtotal));
      const detail = span('l-detail tab', `${l.service.title} ${l.pkg.name}${variant} · ${l.qty.toLocaleString('id-ID')} ${l.pkg.unit} × ${formatRupiah(l.pkg.price)}`);
      li.append(name, amt, detail);
      if (l.surcharge > 0) li.append(span('l-extra tab', `Di bawah minimum ${l.pkg.minOrder} ${l.pkg.unit}: +${formatRupiah(l.surcharge)}`));
      return li;
    }),
  );
  renderedLines = next;

  ui.rEmpty.hidden = result.lines.length > 0;
  ui.rSub.textContent = formatRupiah(result.subtotal);
  ui.rExtraRow.hidden = result.surcharge === 0;
  ui.rExtra.textContent = formatRupiah(result.surcharge);
  ui.rShip.textContent = plan.area === 'kota-bogor' ? 'Termasuk' : 'Dihitung tim kami';
  ui.rPer.textContent = result.lines.length ? `${formatRupiah(result.perGuest)} per ${word}` : '';
  ui.rLead.textContent = result.lines.length
    ? `Pesan paling lambat H-${result.leadDays}. Tanggal paling cepat: ${formatDateLong(result.earliest)}.`
    : '';
  ui.send.disabled = result.lines.length === 0;
  animateTotal(result.total);
}

function span(cls: string, text: string) {
  const s = document.createElement('span');
  s.className = cls;
  s.textContent = text;
  return s;
}

function animateTotal(to: number) {
  cancelAnimationFrame(tween);
  clearTimeout(settle);
  const from = shownTotal;
  const show = (v: number) => {
    shownTotal = v;
    ui.rTotal.textContent = formatRupiah(v);
  };
  if (from === to || reduceMotion.matches) {
    show(to);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 520);
    const e = 1 - Math.pow(1 - t, 3);
    show(Math.round(from + (to - from) * e));
    if (t < 1) tween = requestAnimationFrame(step);
  };
  tween = requestAnimationFrame(step);
  // Frames can stall (a busy GPU, a background tab); never leave a half-counted figure.
  settle = window.setTimeout(() => {
    cancelAnimationFrame(tween);
    show(to);
  }, 620);
  ui.rTotal.classList.remove('bump');
  void ui.rTotal.offsetWidth;
  ui.rTotal.classList.add('bump');
}

function shareUrl() {
  return `${location.origin}/kalkulator/#n=${encodePlan(plan)}`;
}

function persist() {
  const code = encodePlan(plan);
  try {
    localStorage.setItem(STORE, code);
  } catch {
    /* storage unavailable */
  }
  history.replaceState(null, '', `${location.pathname}#n=${code}`);
}

/* ------------------------------------------------------------------ presets */

function syncPresetRadios() {
  ui.presetRadios.forEach((r) => (r.checked = r.value === currentPreset().id));
}

function choosePreset(id: string) {
  const preset = presetById(id);
  if (!preset || preset.id === plan.preset) return;
  undoPlan = clone(plan);
  const keepGuests = guestsTouched || preset.items.length === 0;
  const next = planFromPreset(preset, catalog, keepGuests ? plan.guests : preset.guests);
  next.date = plan.date;
  next.area = plan.area;
  plan = next;
  renderItems();
  update();
  showUndo(`Diganti ke ${preset.title}.`);
}

function showUndo(message: string) {
  clearTimeout(undoTimer);
  ui.status.replaceChildren(document.createTextNode(message));
  if (undoPlan) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Batalkan';
    b.addEventListener('click', () => {
      if (!undoPlan) return;
      plan = undoPlan;
      undoPlan = null;
      syncPresetRadios();
      renderItems();
      update();
      ui.status.textContent = 'Perubahan dibatalkan.';
      ui.presetRadios.find((r) => r.checked)?.focus();
    });
    ui.status.append(b);
  }
  undoTimer = window.setTimeout(() => {
    ui.status.textContent = '';
    undoPlan = null;
  }, 8000);
}

ui.presetRadios.forEach((r) => r.addEventListener('change', () => r.checked && choosePreset(r.value)));

/* ------------------------------------------------------------------ guests, date, area */

function setGuests(n: number) {
  plan.guests = Math.min(LIMITS.guests[1], Math.max(LIMITS.guests[0], Math.round(n) || 1));
  guestsTouched = true;
  update();
}
ui.guests.addEventListener('input', () => {
  const n = parseInt(ui.guests.value, 10);
  if (Number.isFinite(n) && n >= 1) setGuests(n);
});
ui.guests.addEventListener('blur', () => {
  ui.guests.value = String(plan.guests);
});
ui.guestsRange.addEventListener('input', () => setGuests(Number(ui.guestsRange.value)));
form.querySelectorAll<HTMLButtonElement>('[data-guest-step]').forEach((b) =>
  b.addEventListener('click', () => {
    const dir = Number(b.dataset.guestStep);
    const step = plan.guests >= 100 ? 10 : 5;
    const next = dir > 0 ? Math.floor(plan.guests / step) * step + step : Math.ceil(plan.guests / step) * step - step;
    setGuests(next);
  }),
);
ui.date.addEventListener('change', () => {
  plan.date = ui.date.value;
  update();
});
ui.areas.forEach((r) =>
  r.addEventListener('change', () => {
    if (!r.checked) return;
    plan.area = r.value as Area;
    update();
  }),
);

/* ------------------------------------------------------------------ item events */

const rowOf = (el: Element) => {
  const li = el.closest<HTMLElement>('[data-id]');
  const item = li ? plan.items.find((i) => i.id === li.dataset.id) : undefined;
  return li && item ? { li, item } : null;
};

list.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement;
  const row = rowOf(t);
  if (!row) return;
  const f = t.dataset.f;
  if (f === 'label') {
    row.item.label = cleanLabel(t.value);
    row.li.querySelector('[data-remove]')!.setAttribute('aria-label', `Hapus ${row.item.label || 'baris ini'}`);
    update({ announce: false });
  } else if (f === 'fixed') {
    const n = parseInt(t.value, 10);
    if (Number.isFinite(n) && n >= 1) {
      row.item.fixed = Math.min(LIMITS.fixed[1], n);
      update();
    }
  }
});

list.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement | HTMLSelectElement;
  const row = rowOf(t);
  if (!row) return;
  const { li, item } = row;
  switch (t.dataset.f) {
    case 'service': {
      const s = serviceOf(t.value);
      const wasDefaultLabel = catalog.some((c) => c.title === item.label) || !item.label;
      item.service = s.slug;
      const p = s.packages[Math.floor((s.packages.length - 1) / 2)];
      item.pkg = p.id;
      item.variant = p.variants[0] ?? '';
      if (wasDefaultLabel) item.label = s.title;
      if (s.servesPerUnit > 1 && item.mode === 'per-guest') {
        item.mode = 'fixed';
        item.fixed = 1;
      }
      syncRow(li, item);
      break;
    }
    case 'pkg': {
      item.pkg = t.value;
      item.variant = pkgOf(item).variants[0] ?? '';
      syncRow(li, item);
      break;
    }
    case 'variant':
      item.variant = t.value;
      break;
    case 'mode':
      item.mode = t.value === 'fixed' ? 'fixed' : 'per-guest';
      if (item.mode === 'fixed') {
        // Start the fixed amount from what per-guest was giving, so the total doesn't jump.
        item.fixed = quantityFor({ ...item, mode: 'per-guest' }, serviceOf(item.service), plan.guests);
      }
      syncRow(li, item);
      li.querySelector<HTMLElement>(item.mode === 'fixed' ? '[data-f="fixed"]' : '[data-f="perGuest"]')?.focus();
      break;
    case 'perGuest':
      item.perGuest = Number(t.value) || 1;
      break;
    case 'fixed':
      item.fixed = Math.min(LIMITS.fixed[1], Math.max(1, parseInt(t.value, 10) || 1));
      (t as HTMLInputElement).value = String(item.fixed);
      break;
    default:
      return;
  }
  update();
});

list.addEventListener('focusout', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.dataset?.f !== 'label') return;
  const row = rowOf(t);
  if (row && !row.item.label) {
    row.item.label = serviceOf(row.item.service).title;
    t.value = row.item.label;
    update({ announce: false });
  }
});

list.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const row = rowOf(t);
  if (!row) return;
  const step = t.closest<HTMLButtonElement>('[data-step]');
  if (step) {
    row.item.fixed = Math.min(LIMITS.fixed[1], Math.max(1, row.item.fixed + Number(step.dataset.step)));
    row.li.querySelector<HTMLInputElement>('[data-f="fixed"]')!.value = String(row.item.fixed);
    update();
    return;
  }
  if (t.closest('[data-remove]')) {
    const index = plan.items.indexOf(row.item);
    const removed = row.item.label;
    plan.items.splice(index, 1);
    const next = plan.items[index] ?? plan.items[index - 1];
    renderItems(next ? { id: next.id, field: 'label' } : 'add');
    update();
    ui.live.textContent = `${removed} dihapus dari nota.`;
  }
});

ui.add.addEventListener('click', () => {
  if (plan.items.length >= LIMITS.items) return;
  const item = newItem(catalog, plan);
  plan.items.push(item);
  renderItems({ id: item.id, field: 'service' });
  update();
  list.querySelector(`[data-id="${item.id}"]`)?.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
});

/* ------------------------------------------------------------------ receipt actions */

ui.send.addEventListener('click', () => {
  const result = computePlan(plan, catalog);
  if (!result.lines.length) return;
  const preset = currentPreset();
  const msg = buildPlanMessage(plan, result, preset === custom ? 'Acara khusus' : preset.title, guestWord(), shareUrl());
  const phone = result.lines.some((l) => l.service.slug === 'pernikahan') ? data.marketingPhone : data.csPhone;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  const w = window.open(url, '_blank', 'noopener');
  if (!w) window.location.href = url;
});

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

ui.share.addEventListener('click', async () => {
  const ok = await copy(shareUrl());
  ui.share.textContent = ok ? 'Tautan tersalin' : 'Gagal menyalin';
  ui.live.textContent = ok ? 'Tautan nota tersalin.' : 'Tautan gagal disalin.';
  window.setTimeout(() => (ui.share.textContent = 'Salin tautan'), 2200);
});

ui.print.addEventListener('click', () => window.print());

ui.reset.addEventListener('click', () => {
  undoPlan = clone(plan);
  const preset = currentPreset();
  plan = planFromPreset(preset, catalog);
  guestsTouched = false;
  ui.date.value = '';
  ui.areas.forEach((r) => (r.checked = r.value === 'kota-bogor'));
  renderItems();
  update();
  showUndo(`${preset.title} dikembalikan ke awal.`);
});

/* ------------------------------------------------------------------ phone dock */

// The bar appears once the visitor starts editing, and only while the form is on
// screen and the receipt is not.
let receiptVisible = false;
let formVisible = true;
let engaged = false;
const syncDock = () => {
  const on = engaged && formVisible && !receiptVisible;
  ui.dock.dataset.off = String(!on);
  document.documentElement.classList.toggle('has-dock', on && window.innerWidth < 1024);
};
const dockIo = new IntersectionObserver(
  (entries) => {
    const map = new Map(entries.map((e) => [e.target, e.isIntersecting]));
    if (map.has(ui.receipt)) receiptVisible = map.get(ui.receipt)!;
    if (map.has(form)) formVisible = map.get(form)!;
    syncDock();
  },
  { threshold: 0 },
);
const engage = () => {
  if (engaged) return;
  engaged = true;
  syncDock();
};
form.addEventListener('input', engage);
form.addEventListener('change', engage);
form.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('button')) engage();
});
ui.dock.dataset.off = 'true';
ui.dock.hidden = false;
dockIo.observe(ui.receipt);
dockIo.observe(form);

/* ------------------------------------------------------------------ sticky receipt */

const side = ui.receipt.closest<HTMLElement>('.side')!;
const fit = () => side.classList.toggle('fits', side.offsetHeight + 110 < window.innerHeight);
new ResizeObserver(fit).observe(ui.receipt);
window.addEventListener('resize', fit);

/* ------------------------------------------------------------------ boot */

form.addEventListener('submit', (e) => e.preventDefault());

if (plan.date) ui.date.value = plan.date;
ui.areas.forEach((r) => (r.checked = r.value === plan.area));
syncPresetRadios();
renderedLines = new Set();
renderItems();
update({ announce: false });
