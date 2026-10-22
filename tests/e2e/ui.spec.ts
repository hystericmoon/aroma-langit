import { expect, test } from '@playwright/test';

test('skip link is the first focus stop and moves to main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Langsung ke isi' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('mobile menu opens, traps nothing and closes with Escape', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/');
  const burger = page.getByRole('button', { name: 'Buka menu' });
  await burger.click();
  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tutup menu' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(page.getByRole('button', { name: 'Buka menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await menu.getByRole('link', { name: /Prasmanan/ }).click();
  await expect(page).toHaveURL(/\/katering\/prasmanan\/$/);
});

test('desktop dropdown lists every service', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  const btn = page.getByRole('button', { name: /Menu & harga/ });
  await btn.click();
  const panel = page.locator('#menu-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link')).toHaveCount(7);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(btn).toBeFocused();
});

test('showcase tabs work with arrow keys', async ({ page }) => {
  await page.goto('/');
  const first = page.getByRole('tab', { name: 'Nasi Box' }).first();
  await first.focus();
  await page.keyboard.press('ArrowRight');
  const bento = page.getByRole('tab', { name: 'Bento' }).first();
  await expect(bento).toBeFocused();
  await expect(bento).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-bento')).toBeVisible();
  await expect(page.locator('#panel-nasi-box')).toBeHidden();
});

test('package menu tabs switch panels', async ({ page }) => {
  await page.goto('/katering/nasi-box/');
  const tab = page.getByRole('tab', { name: 'Menu Mancanegara' }).first();
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#nasi-box-premium-a-p1')).toBeVisible();
  await expect(page.locator('#nasi-box-premium-a-p0')).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('content and prices are visible, box photo shows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#menu').getByText('Rp55.000').first()).toBeVisible();
    await expect(page.locator('.box-slot-hero .box-fallback img')).toBeVisible();
    await page.goto('/katering/prasmanan/');
    await expect(page.getByText('Rp125.000').first()).toBeVisible();
  });
});

test('3D box boots and draws into its slot', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/');
  await page.mouse.move(400, 400);
  await page.mouse.move(600, 500);
  await expect(page.locator('.box-canvas')).toHaveCount(1, { timeout: 8000 });
  await expect(page.locator('.box-slot-hero')).toHaveClass(/is-3d/);
  await expect.poll(async () => page.locator('.box-canvas').evaluate((c) => Number(getComputedStyle(c).opacity))).toBeGreaterThan(0.5);
  await expect(page.locator('.box-slot-hero .box-canvas')).toHaveCount(1);
});

test('reduced motion keeps everything readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hidden = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h2, p, li')).filter((el) => {
      const s = getComputedStyle(el);
      return s.visibility === 'hidden' || Number(s.opacity) === 0;
    }).length,
  );
  expect(hidden).toBe(0);
});
