import type { Page } from '@playwright/test';

export const PAGES = [
  '/',
  '/katering/nasi-box/',
  '/katering/bento/',
  '/katering/snack-box/',
  '/katering/prasmanan/',
  '/katering/tumpeng/',
  '/katering/tumpeng-mini/',
  '/pernikahan/',
  '/korporat/',
  '/tentang-kami/',
];

/** Collects console errors, page errors and failed same-origin requests. */
export function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (u.hostname === 'localhost' && r.status() >= 400 && !u.pathname.startsWith('/api/')) problems.push(`HTTP ${r.status()} ${u.pathname}`);
  });
  page.on('requestfailed', (r) => {
    const u = new URL(r.url());
    if (u.hostname === 'localhost') problems.push(`failed: ${u.pathname} ${r.failure()?.errorText}`);
  });
  return problems;
}

/** Replaces window.open so tests can read the URL a button tried to open. */
export async function captureOpen(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url?: string | URL) => {
      (window as unknown as { __opened: string[] }).__opened.push(String(url));
      return {} as Window;
    }) as typeof window.open;
  });
  return async () => page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
}

/** Scrolls through the page so scroll-triggered content runs. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
}
