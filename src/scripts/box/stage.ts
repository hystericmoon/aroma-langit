// Boots the 3D box only when the page has a slot for it and the device can draw it.
// Each slot keeps a still photograph underneath, which stays if WebGL is unavailable.
import { subscribe } from '../../lib/orderStore';
import { estimate, formatDateShort, formatRupiah, areaLabel } from '../../lib/order';

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function boot() {
  const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-box-slot]'));
  if (!slots.length) return;
  const fallback = () => slots.forEach((el) => { el.classList.remove('is-3d'); el.classList.add('no-3d'); });
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData || !webglOK()) return fallback();

  const canvas = document.createElement('canvas');
  canvas.className = 'box-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  slots[0].appendChild(canvas);

  try {
    await document.fonts.ready;
    const { BoxStage } = await import('./scene');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = new BoxStage(canvas, { reduced });
    for (const el of slots) {
      stage.addSlot(el, (el.dataset.boxSlot as 'hero' | 'label') || 'hero');
      el.classList.add('is-3d');
    }
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      stage.destroy();
      canvas.remove();
      fallback();
    });
    subscribe((o) => {
      const e = estimate({ name: o.pkgName, price: o.price, unit: o.unit, minOrder: o.minOrder }, o.qty);
      stage.setLabel({
        title: `${o.serviceName} ${o.pkgName}`,
        line1: `${e.qty} ${o.unit}${o.date ? ` · ${formatDateShort(o.date)}` : ''}`,
        line2: `Diantar ke ${areaLabel[o.area]}`,
        total: formatRupiah(e.total),
      });
    });
    stage.wake();
  } catch (err) {
    console.warn('[box] 3D disabled:', err);
    canvas.remove();
    fallback();
  }
}

// The photo carries the first paint. WebGL starts on the first sign of a visitor
// (scroll, pointer, touch or key) or after a few seconds, so loading stays light.
let booted = false;
const events = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const;
const kick = () => {
  if (booted) return;
  booted = true;
  events.forEach((e) => window.removeEventListener(e, kick));
  if ('requestIdleCallback' in window) window.requestIdleCallback(() => void boot(), { timeout: 600 });
  else setTimeout(() => void boot(), 50);
};
const arm = () => {
  events.forEach((e) => window.addEventListener(e, kick, { passive: true, once: true }));
  window.setTimeout(kick, 6000);
};
if (document.readyState === 'complete') arm();
else window.addEventListener('load', arm, { once: true });
