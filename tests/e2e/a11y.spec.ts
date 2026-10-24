import { expect, test } from '@playwright/test';
import { PAGES } from './helpers';

// Brand book §8: every tappable control is at least 44×44px, and every keyboard stop shows a
// 2px focus ring (on the control itself, or on the pill or tile a hidden radio draws).
for (const path of [...PAGES, '/halaman-tidak-ada/']) {
  test.describe(`a11y ${path}`, () => {
    test('tap targets are at least 44×44 @layout', async ({ page }) => {
      await page.goto(path);
      const small = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>('a[href], button, input:not([type=hidden]), select, textarea, [role=tab]')) {
          if (el.closest('[hidden], template, .sr-only') || el.matches('.skip, .hp')) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          let r = el.getBoundingClientRect();
          if (cs.opacity === '0') r = (el.closest('label') ?? el).getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          // Links inside running text are exempt (WCAG 2.5.8 inline exception).
          if (el.tagName === 'A' && cs.display === 'inline') {
            const around = (el.parentElement?.textContent || '').trim().length;
            if (around > (el.textContent || '').trim().length + 3) continue;
          }
          if (r.width < 43.5 || r.height < 43.5) out.push(`${el.tagName} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
        }
        return out;
      });
      expect(small).toEqual([]);
    });

    test('every keyboard stop shows a focus ring', async ({ page }) => {
      test.setTimeout(90_000);
      await page.goto(path);
      const missing = new Set<string>();
      for (let i = 0; i < 160; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const ring = (e: Element | null) => {
            if (!e) return 0;
            const c = getComputedStyle(e);
            return c.outlineStyle === 'none' ? 0 : parseFloat(c.outlineWidth);
          };
          let width = ring(el);
          if (!width && getComputedStyle(el).opacity === '0') width = Math.max(ring(el.nextElementSibling), ring(el.closest('.ui-tile')));
          return { width, end: Boolean(el.closest('footer')) && el.textContent?.trim() === 'YouTube', name: `${el.tagName} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"` };
        });
        if (!info) break;
        if (info.width < 2) missing.add(info.name);
        if (info.end) break;
      }
      expect([...missing]).toEqual([]);
    });
  });
}
