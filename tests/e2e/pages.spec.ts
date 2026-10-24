import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES, scrollThrough, watch } from './helpers';

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test('loads cleanly with one h1, alt text and no overflow @layout', async ({ page }) => {
      const problems = watch(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(/Aroma Langit/);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      await scrollThrough(page);
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
      const missingAlt = await page.locator('img:not([alt])').count();
      expect(missingAlt).toBe(0);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(50);
      expect(problems).toEqual([]);
    });

    test('has no serious accessibility violations', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await scrollThrough(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .exclude('.box-canvas')
        .analyze();
      const serious = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`);
      expect(serious).toEqual([]);
    });
  });
}

test('every internal link and in-page anchor resolves', async ({ page, request }) => {
  test.setTimeout(180_000);
  const status = new Map<string, number>();
  const wanted = new Map<string, Set<string>>(); // page path -> ids that links point at
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href') || ''));
    for (const href of hrefs) {
      if (/^(https?:|mailto:|tel:)/.test(href) && !href.startsWith('http://localhost')) continue;
      const url = new URL(href, `http://localhost${path}`);
      if (url.hash.length > 1) {
        const ids = wanted.get(url.pathname) ?? new Set<string>();
        ids.add(decodeURIComponent(url.hash.slice(1)));
        wanted.set(url.pathname, ids);
      }
      if (!status.has(url.pathname)) status.set(url.pathname, (await request.get(url.pathname)).status());
    }
  }
  expect([...status].filter(([, s]) => s !== 200)).toEqual([]);
  for (const [path, ids] of wanted) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    for (const id of ids) expect(await page.locator(`[id="${id}"]`).count(), `#${id} on ${path}`).toBe(1);
  }
});

test('old Joomla PDFs and pages have redirect rules', async () => {
  const fs = await import('node:fs');
  const rules = fs.readFileSync('public/_redirects', 'utf8');
  for (const p of ['/aqiqah', '/supplier', '/wedding', '/index.php', '/images/CATERING_SERVICES_2024_By_Aroma_Langit.pdf']) {
    expect(rules).toContain(p);
  }
});

test('404 page renders', async ({ page }) => {
  const res = await page.goto('/halaman-yang-tidak-ada/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Kotaknya kosong.');
});
