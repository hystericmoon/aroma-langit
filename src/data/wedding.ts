// From the 2024 wedding catering and wedding services catalogues.
export const weddingCatering = [
  { name: 'Platinum', price: 105000, minOrder: 100, note: 'Nasi spesial, ayam, daging dan seafood, dua side dish, sayur dan sup, buah, kue dan puding, jus dan soft drink.' },
  { name: 'Gold', price: 85000, minOrder: 150, note: 'Nasi spesial, ayam, daging dan seafood, side dish, sayur dan sup, buah dan puding, infused water dan soft drink.' },
  { name: 'Silver', price: 65000, minOrder: 200, note: 'Ayam, daging dan seafood, side dish, sayur dan sup, buah dan puding, infused water.' },
  { name: 'Bronze', price: 45000, minOrder: 250, note: 'Ayam dan daging, side dish, sayur dan sup, buah potong. Pilihan menu Nusantara atau Oriental.' },
];

export const weddingCuisines = [
  { name: 'Nusantara', sample: ['Nasi Liwet', 'Ayam Suwir Bali', 'Rendang', 'Gurame Pesmol', 'Sayur Asem'] },
  { name: 'Oriental', sample: ['Hainan Rice', 'Kungpao Chicken', 'Beef Teriyaki', 'Crispy Shrimp', 'Kimlo Soup'] },
  { name: 'Western', sample: ['Butter Rice', 'Chicken Schnitzel', 'Beef Stroganoff', 'Lemon Shrimp', 'Corn Cream Soup'] },
];

export const weddingBundles = [
  { name: 'Platinum Bundling', guests: 300, price: 33900000 },
  { name: 'Gold Bundling', guests: 300, price: 29500000 },
  { name: 'Silver Bundling', guests: 300, price: 23900000 },
];

export const engagementPackages = [
  { name: 'Lily', guests: 50, price: 6500000 },
  { name: 'Peony', guests: 50, price: 11500000 },
  { name: 'Jasmine', guests: 50, price: 19500000 },
];

export const foodStalls = [
  { name: 'Laksa Bogor', price: 15000 },
  { name: 'Asinan Bogor', price: 15000 },
  { name: 'Soto Mie Bogor', price: 15000 },
  { name: 'Nasi Liwet Sunda', price: 30000 },
  { name: 'Siomay Bandung', price: 18000 },
  { name: 'Mie Kocok Bandung', price: 20000 },
  { name: 'Nasi Gudeg Jogja', price: 30000 },
  { name: 'Empal Gentong', price: 25000 },
  { name: 'Dim Sum', price: 20000 },
  { name: 'Salmon Mentai', price: 40000 },
];

export const weddingTerms = [
  'Pemesanan paling lambat 30 hari sebelum acara (H-30), dengan booking fee Rp2.500.000 untuk mengunci tanggal.',
  'Termin kedua 20% dibayar 7 hari setelah booking fee, termin ketiga 50% pada H-30, pelunasan paling lambat H-7.',
  'Food tasting bisa dilakukan sebelum pembayaran uang muka, pada waktu dan lokasi yang kami tentukan.',
  'Perubahan paket, jumlah dan menu bisa dilakukan sebelum H-14, khusus untuk upgrade atau penambahan.',
  'Layanan 4 jam sejak hidangan tersaji. Kelebihan waktu dikenakan biaya Rp150.000 per jam.',
];

/** The catalogue's rule of thumb: 60% of invitations as buffet portions, 40% × 5 as stall portions. */
export function weddingPortions(invitations: number) {
  const n = Math.max(0, Math.floor(invitations));
  const buffet = Math.round(n * 0.6);
  const stall = Math.round(n * 0.4) * 5;
  return { buffet, stall };
}
