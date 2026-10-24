// Full-page screenshots of every page at 390px and 1440px, into screenshots/ (JPEG, quality 85,
// so the folder stays small enough to keep in the repository).
//   npm run build && npm run screenshots
// Serves dist/ with `astro preview`, emulates reduced motion so every page is in its resting
// state (entrances skipped, hero not pinned), and waits for the web fonts.
// Pages are captured in strips and stitched: with software GL, one capture taller than the
// 8192px texture limit wraps back to the top of the page.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const STRIP = 4000;

const PORT = 4455;
const BASE = `http://localhost:${PORT}`;
const OUT = 'screenshots';
const PAGES = [
  ['home', '/'],
  ['katering-nasi-box', '/katering/nasi-box/'],
  ['katering-bento', '/katering/bento/'],
  ['katering-snack-box', '/katering/snack-box/'],
  ['katering-prasmanan', '/katering/prasmanan/'],
  ['katering-tumpeng', '/katering/tumpeng/'],
  ['katering-tumpeng-mini', '/katering/tumpeng-mini/'],
  ['kalkulator', '/kalkulator/'],
  ['korporat', '/korporat/'],
  ['pernikahan', '/pernikahan/'],
  ['tentang-kami', '/tentang-kami/'],
  ['404', '/halaman-tidak-ada/'],
];
const WIDTHS = [
  [390, 844],
  [1440, 900],
];

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], { stdio: 'ignore' });
const ready = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('preview server did not start');
};

try {
  await ready();
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  for (const [width, height] of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const [name, path] of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      // Scroll through so lazy images load, then return to the top.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500); // the 3D box, if it boots, fades in over its photo
      const file = `${OUT}/${name}-${width}.jpg`;
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      const strips = [];
      for (let top = 0; top < total; top += STRIP) {
        const h = Math.min(STRIP, total - top);
        strips.push({ input: await page.screenshot({ fullPage: true, clip: { x: 0, y: top, width, height: h } }), top, left: 0 });
      }
      await sharp({ create: { width, height: total, channels: 3, background: '#faf6ef' } })
        .composite(strips)
        .jpeg({ quality: 85 })
        .toFile(file);
      console.log(file);
    }
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
