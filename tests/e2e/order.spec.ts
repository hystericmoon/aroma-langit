import { expect, test } from '@playwright/test';
import { captureOpen, watch } from './helpers';

test.describe('order label', () => {
  test('calculates totals, surcharge and delivery, and sends to WhatsApp', async ({ page }) => {
    const problems = watch(page);
    const opened = await captureOpen(page);
    await page.goto('/#pesan');
    const form = page.locator('[data-order-form]');
    await form.getByLabel('Layanan').selectOption('nasi-box');
    await form.getByLabel('Paket').selectOption('standar');
    const qty = form.locator('#order-qty');
    await expect(qty).toHaveValue('75');
    await expect(form.locator('[data-sum-total]')).toHaveText('Rp2.175.000', { timeout: 3000 });

    await qty.fill('50');
    await expect(form.locator('[data-sum-extra-row]')).toBeVisible();
    await expect(form.locator('[data-sum-extra]')).toHaveText('Rp145.000');
    await expect(form.locator('[data-sum-total]')).toHaveText('Rp1.595.000', { timeout: 3000 });
    await expect(form.locator('[data-order-qty-help]')).toContainText('biaya tambahan');

    await form.getByRole('radio', { name: 'Luar Kota Bogor' }).check();
    await expect(form.locator('[data-sum-ship]')).toHaveText('Dihitung tim kami');

    await form.getByRole('button', { name: 'Kirim ke WhatsApp' }).click();
    const urls = await opened();
    expect(urls).toHaveLength(1);
    expect(urls[0]).toMatch(/^https:\/\/wa\.me\/6285295535588\?text=/);
    const text = decodeURIComponent(urls[0].split('text=')[1]);
    expect(text).toContain('Nasi Box Standar');
    expect(text).toContain('Jumlah: 50 kotak');
    expect(text).toContain('Luar Kota Bogor');
    expect(text).toContain('Rp1.595.000');
    expect(problems).toEqual([]);
  });

  test('stepper buttons move by sensible amounts and never below one', async ({ page }) => {
    await page.goto('/#pesan');
    const form = page.locator('[data-order-form]');
    await form.getByLabel('Layanan').selectOption('tumpeng');
    const qty = form.locator('#order-qty');
    await expect(qty).toHaveValue('1');
    await form.getByRole('button', { name: 'Kurangi jumlah' }).click();
    await expect(qty).toHaveValue('1');
    await form.getByRole('button', { name: 'Tambah jumlah' }).click();
    await expect(qty).toHaveValue('2');
    await form.getByLabel('Layanan').selectOption('nasi-box');
    await form.getByLabel('Paket').selectOption('hemat');
    await expect(qty).toHaveValue('100');
    await form.getByRole('button', { name: 'Tambah jumlah' }).click();
    await expect(qty).toHaveValue('105');
  });

  test('warns when the date is sooner than the lead time', async ({ page }) => {
    await page.goto('/#pesan');
    const form = page.locator('[data-order-form]');
    await form.getByLabel('Layanan').selectOption('prasmanan');
    const today = await page.evaluate(() =>
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
    );
    await form.locator('#order-date').fill(today);
    await expect(form.locator('[data-order-date-help]')).toContainText('H-3');
    await expect(form.locator('#order-date')).toHaveAttribute('aria-invalid', 'true');
  });

  test('menu rows fill the label', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-pick-service="bento"][data-pick-package="premium"]').click();
    const form = page.locator('[data-order-form]');
    await expect(form.getByLabel('Layanan')).toHaveValue('bento');
    await expect(form.getByLabel('Paket')).toHaveValue('premium');
    await expect(form.getByLabel('Menu')).toHaveValue('Kebuli Iga Sapi');
    await expect(form.locator('[data-sum-total]')).toHaveText('Rp1.062.500', { timeout: 3000 });
  });

  test('package links from service pages prefill the label', async ({ page }) => {
    await page.goto('/katering/snack-box/');
    await page.getByRole('link', { name: 'Pakai paket ini' }).first().click();
    await expect(page).toHaveURL(/layanan=snack-box&paket=premium#pesan/);
    const form = page.locator('[data-order-form]');
    await expect(form.getByLabel('Layanan')).toHaveValue('snack-box');
    await expect(form.getByLabel('Paket')).toHaveValue('premium');
    await expect(form.locator('#order-qty')).toHaveValue('25');
  });

  test('copies the message', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#pesan');
    await page.getByRole('button', { name: 'Salin pesan' }).click();
    await expect(page.getByRole('button', { name: 'Tersalin' })).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('Halo Aroma Langit');
  });
});

test.describe('corporate coupon', () => {
  test('validates, then falls back to WhatsApp when email is not configured', async ({ page }) => {
    const opened = await captureOpen(page);
    await page.goto('/korporat/');
    const form = page.locator('[data-coupon]');
    await form.getByRole('button', { name: /Minta penawaran/ }).click();
    await expect(form.locator('[data-coupon-status]')).toContainText('Lengkapi');
    await expect(form.getByPlaceholder('Nama Anda')).toBeFocused();
    await form.getByPlaceholder('Nama Anda').fill('Sari');
    await form.getByPlaceholder('Perusahaan atau instansi').fill('PT Contoh');
    await form.getByPlaceholder('Nomor WhatsApp').fill('abc');
    await form.getByPlaceholder('Perkiraan porsi per hari').fill('120');
    await form.getByRole('button', { name: /Minta penawaran/ }).click();
    await expect(form.locator('[data-coupon-status]')).toContainText('Nomor WhatsApp');
    await form.getByPlaceholder('Nomor WhatsApp').fill('0812 3456 7890');
    await form.getByRole('button', { name: /Minta penawaran/ }).click();
    await expect(form.locator('[data-coupon-status]')).toContainText('WhatsApp marketing', { timeout: 8000 });
    const urls = await opened();
    expect(urls[0]).toMatch(/^https:\/\/wa\.me\/6287823326800\?text=/);
    expect(decodeURIComponent(urls[0])).toContain('PT Contoh');
  });
});

test('wedding portion calculator follows the catalogue rule', async ({ page }) => {
  await page.goto('/pernikahan/');
  await page.locator('[data-inv]').fill('1000');
  await expect(page.locator('[data-buffet]')).toHaveText('600');
  await expect(page.locator('[data-stall]')).toHaveText('2.000');
  await page.locator('[data-wpkg]').selectOption({ index: 0 });
  await expect(page.locator('[data-est]')).toHaveText('Rp63.000.000');
});
