// Canvas-drawn textures for the box: the order label sticker and the printed walls.
import { full, mark } from '../../assets/brand/logo-paths';

const FONT = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif';
const INK = '#3c2418';
const ORANGE = '#ec7f18';
const PAPER = '#ffffff';

function drawPaths(ctx: CanvasRenderingContext2D, art: { orange: string; brown: string }, colors: [string, string]) {
  ctx.fillStyle = colors[0];
  ctx.fill(new Path2D(art.orange));
  ctx.fillStyle = colors[1];
  ctx.fill(new Path2D(art.brown));
}

/** Draws the logo mark, fitted into a square of `size` at x, y. */
export function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: [string, string]) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 3000, size / 3000);
  ctx.fillStyle = PAPER;
  ctx.beginPath();
  ctx.arc(1500, 1499, 1440, 0, Math.PI * 2);
  ctx.fill();
  drawPaths(ctx, mark, colors);
  ctx.restore();
}

export function drawWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, colors: [string, string]) {
  const s = width / 3000;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(0, -2540);
  ctx.beginPath();
  ctx.rect(0, 2540, 3000, 531);
  ctx.clip();
  drawPaths(ctx, full, colors);
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, weight: number, size: number, min = 24) {
  let s = size;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (ctx.measureText(text).width > maxWidth && s > min) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
  if (ctx.measureText(text).width > maxWidth) {
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
  }
  return text;
}

export interface LabelContent {
  title: string;
  line1: string;
  line2: string;
  total: string;
}

export const LABEL_W = 1024;
export const LABEL_H = 640;

export function drawLabel(canvas: HTMLCanvasElement, c: LabelContent) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;
  ctx.clearRect(0, 0, LABEL_W, LABEL_H);

  // Sticker body
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, LABEL_W, LABEL_H);
  // Stripe tape along the top
  for (let x = 0; x < LABEL_W; x += 56) {
    ctx.fillStyle = INK;
    ctx.fillRect(x, 0, 28, 40);
    ctx.fillStyle = PAPER;
    ctx.fillRect(x + 28, 0, 28, 40);
  }

  drawMark(ctx, 56, 92, 150, [ORANGE, '#7d4a04']);

  const left = 236;
  const maxW = LABEL_W - left - 56;
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText('Label pesanan', left, 128);
  const title = fitText(ctx, c.title, maxW, 800, 76, 40);
  ctx.fillText(title, left, 212);

  ctx.font = `600 44px ${FONT}`;
  ctx.fillText(fitText(ctx, c.line1, LABEL_W - 112, 600, 44, 28), 56, 352);
  ctx.fillText(fitText(ctx, c.line2, LABEL_W - 112, 600, 44, 28), 56, 416);

  // Total band
  ctx.fillStyle = INK;
  ctx.fillRect(0, LABEL_H - 150, LABEL_W, 150);
  ctx.fillStyle = PAPER;
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText('Perkiraan total', 56, LABEL_H - 86);
  const total = fitText(ctx, c.total, 520, 800, 68, 36);
  ctx.textAlign = 'right';
  ctx.fillText(total, LABEL_W - 56, LABEL_H - 52);
  ctx.textAlign = 'left';
}

/** Box wall: paper with a small printed wordmark and the halal number. */
export function drawWall(canvas: HTMLCanvasElement) {
  const W = 1024;
  const H = 320;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f9f5ee';
  ctx.fillRect(0, 0, W, H);
  // Fine doodle pattern of leaves, like the printed box
  ctx.strokeStyle = 'rgba(125, 74, 4, 0.16)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % W;
    const y = 40 + ((i * 53) % (H - 80));
    const r = 18 + (i % 4) * 6;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.45, (i * 0.7) % Math.PI, 0, Math.PI * 2);
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.stroke();
  }
  drawWordmark(ctx, W / 2 - 230, H / 2 - 40, 460, [ORANGE, '#7d4a04']);
}

/** Sleeve: the orange band with the logo, as on the real packaging. */
export function drawSleeve(canvas: HTMLCanvasElement) {
  const W = 1024;
  const H = 256;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, W, H);
  drawMark(ctx, 60, 48, 160, [ORANGE, '#7d4a04']);
  drawWordmark(ctx, 250, 96, 360, [PAPER, INK]);
  ctx.fillStyle = INK;
  ctx.font = `700 30px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText('Dapur Katering', W - 60, 112);
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText('Halal ID32110001863560323', W - 60, 158);
}

export function drawSteam(canvas: HTMLCanvasElement) {
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);
  // Soft blob built from stacked translucent circles (no gradients needed)
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
    ctx.beginPath();
    ctx.arc(64, 64, 62 - i * 3.3, 0, Math.PI * 2);
    ctx.fill();
  }
}
