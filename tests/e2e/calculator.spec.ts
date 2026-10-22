import { expect, test, type Page } from '@playwright/test';
import { captureOpen, watch } from './helpers';

const total = (page: Page) => page.locator('[data-r-total]');
const rows = (page: Page) => page.locator('[data-items] > li');
const lines = (page: Page) => page.locator('[data-lines] > li');

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // totals render without the count-up
});

test('starts from the first preset with a correct receipt', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/kalkulator/');
  await expect(page.getByRole('radio', { name: /Rapat kantor/ })).toBeChecked();
  await expect(rows(page)).toHaveCount(2);
  await expect(lines(page)).toHaveCount(2);
  // 35 × 32.500 + 35 × 45.000
  await expect(total(page)).toHaveText('Rp2.712.500');
  await expect(page.locator('[data-r-per]')).toHaveText('Rp77.500 per peserta');
  expect(problems).toEqual([]);
});

test('switching presets replaces the menu and can be undone', async ({ page }) => {
  await page.goto('/kalkulator/');
  await page.getByRole('radio', { name: /Syukuran & pengajian/ }).check();
  await expect(rows(page)).toHaveCount(2);
  await expect(page.locator('[data-guests]')).toHaveValue('100');
  await expect(rows(page).first().locator('[data-f="label"]')).toHaveValue('Tumpeng utama');
  // 1 × 1.250.000 + 100 × 38.000
  await expect(total(page)).toHaveText('Rp5.050.000');
  await expect(page.locator('[data-r-event]')).toHaveText('Syukuran & pengajian');
  await page.locator('[data-status]').getByRole('button', { name: 'Batalkan' }).click();
  await expect(page.getByRole('radio', { name: /Rapat kantor/ })).toBeChecked();
  await expect(total(page)).toHaveText('Rp2.712.500');
});

test('guest count drives per-guest lines and keeps through preset changes once touched', async ({ page }) => {
  await page.goto('/kalkulator/');
  await page.locator('[data-guests]').fill('50');
  await expect(rows(page).first().locator('[data-qty]')).toHaveText('= 50 kotak');
  await expect(total(page)).toHaveText(`Rp${(50 * 32500 + 50 * 45000).toLocaleString('id-ID')}`);
  await page.getByRole('button', { name: 'Tambah jumlah tamu' }).click();
  await expect(page.locator('[data-guests]')).toHaveValue('55');
  await page.getByRole('radio', { name: /Ulang tahun & arisan/ }).check();
  await expect(page.locator('[data-guests]')).toHaveValue('55');
});

test('lines can be customised, switched to fixed amounts, removed and added', async ({ page }) => {
  await page.goto('/kalkulator/');
  const first = rows(page).first();
  await first.locator('[data-f="pkg"]').selectOption('premium');
  await expect(first.locator('[data-f="variant"]')).toHaveValue('Premium A');
  await first.getByRole('radio', { name: 'Jumlah tetap' }).check();
  const fixed = first.locator('[data-f="fixed"]');
  await expect(fixed).toBeFocused();
  await expect(fixed).toHaveValue('35');
  await fixed.fill('10');
  await expect(first.locator('[data-qty]')).toHaveText('= 10 kotak');
  // Snack Premium minimum 25 at 45.000: 15 × 45.000 × 20% = 135.000
  await expect(first.locator('[data-note]')).toContainText('Rp135.000');
  await expect(page.locator('[data-r-extra]')).toHaveText('Rp135.000');
  await expect(page.locator('[data-r-extra-row]')).toBeVisible();

  // Rename and remove
  await first.locator('[data-f="label"]').fill('Kue untuk tamu VIP');
  await expect(lines(page).first().locator('.l-name')).toHaveText('Kue untuk tamu VIP');
  await first.getByRole('button', { name: 'Hapus Kue untuk tamu VIP' }).click();
  await expect(rows(page)).toHaveCount(1);
  await expect(lines(page)).toHaveCount(1);
  await expect(rows(page).first().locator('[data-f="label"]')).toBeFocused();

  // Add a line: it picks a service not in the plan and focuses its service field
  await page.getByRole('button', { name: 'Tambah menu' }).click();
  await expect(rows(page)).toHaveCount(2);
  const added = rows(page).nth(1);
  await expect(added.locator('[data-f="service"]')).toBeFocused();
  await expect(added.locator('[data-f="service"]')).not.toHaveValue('nasi-box');
  await added.locator('[data-f="service"]').selectOption('tumpeng');
  await expect(added.locator('[data-f="label"]')).toHaveValue('Tumpeng');
  await expect(added.getByRole('radio', { name: 'Jumlah tetap' })).toBeChecked();
  await expect(added.locator('[data-qty]')).toHaveText('= 1 set');
  await expect(lines(page)).toHaveCount(2);
});

test('fully custom plans start empty and cannot be sent until they have a line', async ({ page }) => {
  await page.goto('/kalkulator/');
  await page.getByRole('radio', { name: /Susun sendiri/ }).check();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.locator('[data-empty]')).toBeVisible();
  await expect(page.locator('[data-r-empty]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kirim ke WhatsApp' })).toBeDisabled();
  await expect(total(page)).toHaveText('Rp0');
  await page.getByRole('button', { name: 'Tambah menu' }).click();
  await expect(rows(page)).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Kirim ke WhatsApp' })).toBeEnabled();
  await expect(page.locator('[data-r-event]')).toHaveText('Acara Anda');
});

test('a shared link restores the exact plan', async ({ page, browser }) => {
  await page.goto('/kalkulator/?acara=pelatihan');
  await page.locator('[data-guests]').fill('44');
  await rows(page).nth(1).locator('[data-f="variant"]').selectOption('Ayam Mentega');
  await rows(page).nth(2).locator('[data-f="label"]').fill('Snack penutupan');
  await page.locator('[data-date]').fill('2027-01-15');
  await page.getByRole('radio', { name: 'Luar Kota Bogor' }).check();
  await page.waitForTimeout(500);
  const url = page.url();
  expect(url).toContain('#n=');
  const want = await total(page).textContent();

  const other = await browser.newPage();
  await other.emulateMedia({ reducedMotion: 'reduce' });
  await other.goto(url);
  await expect(other.locator('[data-guests]')).toHaveValue('44');
  await expect(other.locator('[data-items] > li').nth(1).locator('[data-f="variant"]')).toHaveValue('Ayam Mentega');
  await expect(other.locator('[data-items] > li').nth(2).locator('[data-f="label"]')).toHaveValue('Snack penutupan');
  await expect(other.locator('[data-date]')).toHaveValue('2027-01-15');
  await expect(other.locator('[data-r-ship]')).toHaveText('Dihitung tim kami');
  await expect(other.locator('[data-r-total]')).toHaveText(want!);
  await other.close();
});

test('a reload keeps the plan', async ({ page }) => {
  await page.goto('/kalkulator/');
  await page.locator('[data-guests]').fill('77');
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.locator('[data-guests]')).toHaveValue('77');
});

test('the wedding preset uses invitations, H-30 and goes to marketing', async ({ page }) => {
  const opened = await captureOpen(page);
  await page.goto('/kalkulator/?acara=pernikahan');
  await expect(page.locator('[data-guest-word]')).toHaveText('undangan');
  await expect(rows(page).first().locator('[data-qty]')).toHaveText('= 300 pax');
  await expect(page.locator('[data-r-lead]')).toContainText('H-30');
  const today = await page.evaluate(() =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
  );
  await page.locator('[data-date]').fill(today);
  await expect(page.locator('[data-date-help]')).toContainText('H-30');
  await page.getByRole('button', { name: 'Kirim ke WhatsApp' }).click();
  const urls = await opened();
  expect(urls[0]).toMatch(/^https:\/\/wa\.me\/6287823326800\?text=/);
  const msg = decodeURIComponent(urls[0].split('text=')[1]);
  expect(msg).toContain('Acara: Resepsi pernikahan');
  expect(msg).toContain('Jumlah undangan: 500');
  expect(msg).toContain('1. Prasmanan resepsi: Katering Pernikahan Gold (Nusantara), 300 pax = Rp25.500.000');
  expect(msg).toContain('/kalkulator/#n=');
});

test('reset returns the preset to its defaults and can be undone', async ({ page }) => {
  await page.goto('/kalkulator/');
  await page.locator('[data-guests]').fill('90');
  await page.getByRole('button', { name: 'Mulai ulang' }).click();
  await expect(page.locator('[data-guests]')).toHaveValue('35');
  await page.locator('[data-status]').getByRole('button', { name: 'Batalkan' }).click();
  await expect(page.locator('[data-guests]')).toHaveValue('90');
});

test('the phone total bar hides while the receipt is on screen', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/kalkulator/');
  const dock = page.locator('[data-dock]');
  await page.locator('[data-items]').scrollIntoViewIfNeeded();
  // Hidden until the visitor changes something
  await expect(dock).toHaveAttribute('data-off', 'true');
  await page.getByRole('button', { name: 'Tambah jumlah tamu' }).click();
  await page.getByRole('button', { name: 'Kurangi jumlah tamu' }).click();
  await page.locator('[data-items]').scrollIntoViewIfNeeded();
  await expect(dock).toHaveAttribute('data-off', 'false');
  await expect(dock).toContainText('Rp2.712.500');
  await page.locator('[data-receipt]').scrollIntoViewIfNeeded();
  await expect(dock).toHaveAttribute('data-off', 'true');
});

test('homepage presets open the calculator ready to use', async ({ page }) => {
  await page.goto('/');
  await page.locator('.teaser').getByRole('link', { name: /Gathering & acara besar/ }).click();
  await expect(page).toHaveURL(/\/kalkulator\/\?acara=gathering/);
  await expect(page.getByRole('radio', { name: /Gathering & acara besar/ })).toBeChecked();
  await expect(page.locator('[data-guests]')).toHaveValue('150');
});
