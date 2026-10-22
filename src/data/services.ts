import type { Service, Package, MenuVariant } from './types';
import { photos } from './photos';
import {
  nasiSpesial, nasi, laukSpesial, lauk, pauk, sayur, mayur, sambal, buahPuding, kerupuk, lalapan,
  nasiSpesialM, nasiM, laukSpesialM, laukM, paukM, sayurM, mayurM, sambalM,
  gubukan, buahPotong, dessert, minumDingin, minumPanas, kue1, kue2, nusantara,
} from './menu';

const v = nusantara;

/* ---------------------------------------------------------------- Nasi box */
const nasiBoxPackages: Package[] = [
  {
    id: 'premium-a', name: 'Premium A', price: 55000, unit: 'kotak', minOrder: 25,
    note: 'Besek berlogo 20 × 20 cm',
    variants: [
      v('Menu Nusantara', [nasiSpesial, laukSpesial, pauk, sayur, mayur, sambal, buahPuding, kerupuk]),
      v('Menu Mancanegara', [nasiSpesialM, laukSpesialM, paukM, sayurM, mayurM, sambalM, buahPuding, kerupuk]),
    ],
  },
  {
    id: 'premium-b', name: 'Premium B', price: 52000, unit: 'kotak', minOrder: 25,
    note: 'Besek berlogo 20 × 20 cm',
    variants: [
      v('Menu Nusantara', [nasiSpesial, lauk, pauk, sayur, mayur, sambal, buahPuding, kerupuk]),
      v('Menu Mancanegara', [nasiSpesialM, laukM, paukM, sayurM, mayurM, sambalM, buahPuding, kerupuk]),
    ],
  },
  {
    id: 'spesial-a', name: 'Spesial A', price: 45000, unit: 'kotak', minOrder: 35,
    note: 'Kotak berlogo 20 × 20 cm',
    variants: [
      v('Menu Nusantara', [nasi, laukSpesial, pauk, sayur, mayur, sambal, buahPuding, kerupuk]),
      v('Menu Mancanegara', [nasiM, laukSpesialM, paukM, sayurM, mayurM, sambalM, buahPuding, kerupuk]),
    ],
  },
  {
    id: 'spesial-b', name: 'Spesial B', price: 42000, unit: 'kotak', minOrder: 35,
    note: 'Kotak berlogo 20 × 20 cm',
    variants: [
      v('Menu Nusantara', [nasi, lauk, pauk, sayur, mayur, sambal, buahPuding, kerupuk]),
      v('Menu Mancanegara', [nasiM, laukM, paukM, sayurM, mayurM, sambalM, buahPuding, kerupuk]),
    ],
  },
  {
    id: 'lengkap-a', name: 'Lengkap A', price: 38000, unit: 'kotak', minOrder: 50,
    note: 'Kotak berlogo 20 × 20 cm',
    variants: [
      v('Menu Nusantara', [nasi, laukSpesial, sayur, mayur, sambal, buahPuding, kerupuk]),
      v('Menu Mancanegara', [nasiM, laukSpesialM, sayurM, mayurM, sambalM, buahPuding, kerupuk]),
    ],
  },
  {
    id: 'lengkap-b', name: 'Lengkap B', price: 35000, unit: 'kotak', minOrder: 50,
    note: 'Kotak berlogo 20 × 20 cm',
    variants: [
      v('Menu Nusantara', [nasi, lauk, sayur, mayur, sambal, buahPuding, kerupuk]),
      v('Menu Mancanegara', [nasiM, laukM, sayurM, mayurM, sambalM, buahPuding, kerupuk]),
    ],
  },
  {
    id: 'standar', name: 'Standar', price: 29000, unit: 'kotak', minOrder: 75,
    note: 'Kotak berlogo 20 × 20 cm',
    variants: [
      v('Nusantara 1', [nasi, lauk, sayur, sambal, kerupuk]),
      v('Nusantara 2', [nasi, lauk, mayur, sambal, buahPuding, kerupuk]),
      v('Mancanegara 1', [nasiM, laukM, sayurM, sambalM, kerupuk]),
      v('Mancanegara 2', [nasiM, laukM, mayurM, sambalM, buahPuding, kerupuk]),
    ],
  },
  {
    id: 'hemat', name: 'Hemat', price: 22500, unit: 'kotak', minOrder: 100,
    note: 'Kotak kraft bercap 18 × 18 cm',
    variants: [
      v('Nusantara 1', [nasi, pauk, sayur, mayur, sambal, kerupuk]),
      v('Nusantara 2', [nasi, lauk, sambal, kerupuk, lalapan]),
      v('Mancanegara 1', [nasiM, paukM, sayurM, mayurM, sambalM, kerupuk]),
      v('Mancanegara 2', [nasiM, laukM, sambalM, kerupuk, lalapan]),
    ],
  },
];

/* -------------------------------------------------------------------- Bento */
const b = (name: string, items: string[]): MenuVariant => ({
  name,
  groups: [{ label: 'Isi', items }],
});

const bentoPackages: Package[] = [
  {
    id: 'premium', name: 'Premium', price: 42500, unit: 'bento', minOrder: 25,
    note: 'Lima pilihan bento',
    variants: [
      b('Kebuli Iga Sapi', ['Nasi kebuli beras basmati', 'Iga sapi bakar', 'Martabak telur', 'Acar nanas', 'Sambal dabu', 'Emping']),
      b('Dendeng Batokok', ['Nasi', 'Dendeng batokok', 'Gulai pucuk ubi', 'Perkedel kentang', 'Kerupuk kulit', 'Sambal ijo']),
      b('Ayam Saus Thailand', ['Nasi', 'Ayam saus Thailand', 'Capcay', 'Tahu cabe garam', 'Keripik pangsit', 'Sambal korek']),
      b('Beef Teriyaki', ['Nasi', 'Beef teriyaki', 'Egg chicken roll', 'Salad', 'Saus sambal', 'Mayones']),
      b('Nasi Bakar Gepuk', ['Nasi bakar teri', 'Daging gepuk', 'Kentang goreng ati', 'Urap', 'Bakwan jagung', 'Sambal goreng']),
    ],
  },
  {
    id: 'spesial', name: 'Spesial', price: 37500, unit: 'bento', minOrder: 35,
    note: 'Lima pilihan bento',
    variants: [
      b('Ayam Bakar Padang', ['Nasi', 'Ayam bakar bumbu Padang', 'Gulai pucuk ubi', 'Perkedel kentang', 'Kerupuk kulit', 'Sambal ijo']),
      b('Dendeng Batokok', ['Nasi', 'Dendeng batokok', 'Gulai pucuk ubi', 'Perkedel kentang', 'Kerupuk kulit', 'Sambal ijo']),
      b('Ayam Mentega', ['Nasi', 'Ayam goreng mentega', 'Capcay', 'Tahu cabe garam', 'Keripik pangsit', 'Sambal korek']),
      b('Chicken Teriyaki', ['Nasi', 'Chicken teriyaki', 'Egg chicken roll', 'Salad', 'Saus sambal', 'Mayones']),
      b('Nasi Bakar Kalasan', ['Nasi bakar teri', 'Ayam bakar Kalasan', 'Kentang goreng ati', 'Urap', 'Bakwan jagung', 'Sambal goreng']),
    ],
  },
  {
    id: 'standar', name: 'Standar', price: 30000, unit: 'bento', minOrder: 50,
    note: 'Enam pilihan bento',
    variants: [
      b('Nasi Goreng Ayam', ['Nasi goreng ayam', 'Telur mata sapi', 'Kentang mustopa', 'Acar timun', 'Saus sambal', 'Emping']),
      b('Nasi Goreng Seafood', ['Nasi goreng seafood', 'Telur mata sapi', 'Kentang mustopa', 'Acar', 'Saus sambal', 'Emping']),
      b('Nasi Uduk', ['Nasi uduk', 'Ayam goreng serundeng', 'Bihun goreng', 'Orek tempe kering', 'Lalapan', 'Sambal goreng']),
      b('Nasi Kuning', ['Nasi kuning', 'Ayam goreng serundeng', 'Bihun goreng', 'Orek tempe kering', 'Lalapan', 'Sambal goreng']),
      b('Fried Chicken', ['Nasi', 'Fried chicken', 'Mie goreng bakso', 'Lalapan buncis wortel', 'Saus sambal', 'Mayones']),
      b('Rolade', ['Nasi', 'Rolade saus bistik', 'Mie goreng bakso', 'Lalapan buncis wortel', 'Saus sambal', 'Puding']),
    ],
  },
];

/* ---------------------------------------------------------------- Snack box */
const s = (name: string, items: string[]): MenuVariant => ({ name, groups: [{ label: 'Isi', items }] });

const snackPackages: Package[] = [
  {
    id: 'premium', name: 'Premium', price: 45000, unit: 'kotak', minOrder: 25,
    note: 'Dengan air mineral botol',
    variants: [
      s('Premium A', ['3 kue premium', 'Puding vla', 'Air mineral botol']),
      s('Premium B', ['2 kue premium', 'Roti premium', 'Air mineral botol']),
      s('Premium C', ['2 roti premium', 'Puding vla', 'Air mineral botol']),
    ],
  },
  {
    id: 'spesial', name: 'Spesial', price: 32500, unit: 'kotak', minOrder: 35,
    note: 'Dengan air mineral cup',
    variants: [
      s('Spesial A', ['2 kue premium', 'Puding vla', 'Air mineral cup']),
      s('Spesial B', ['Kue premium', 'Roti premium', 'Air mineral cup']),
      s('Spesial C', ['Roti premium', 'Kue', 'Puding vla', 'Air mineral cup']),
    ],
  },
  {
    id: 'standar', name: 'Standar', price: 17500, unit: 'kotak', minOrder: 50,
    note: 'Dengan air mineral cup',
    variants: [
      s('Standar A', ['3 kue', 'Puding cup', 'Air mineral cup']),
      s('Standar B', ['2 kue', 'Roti', 'Air mineral cup']),
      s('Standar C', ['2 roti', 'Puding cup', 'Air mineral cup']),
    ],
  },
];

/* ---------------------------------------------------------------- Prasmanan */
const prasmananPackages: Package[] = [
  {
    id: 'premium', name: 'Premium', price: 125000, unit: 'pax', minOrder: 30,
    note: 'Dengan gubukan, dessert, minuman panas dan dingin',
    variants: [
      v('Menu Nusantara', [nasiSpesial, laukSpesial, lauk, pauk, sayur, mayur, sambal, gubukan, buahPotong, dessert, minumDingin, minumPanas, kue1, kue2, kerupuk], ['Air mineral 330 ml']),
      v('Menu Mancanegara', [nasiSpesialM, laukSpesialM, laukM, paukM, sayurM, mayurM, sambalM, gubukan, buahPotong, dessert, minumDingin, minumPanas, kue1, kue2, kerupuk], ['Air mineral 330 ml']),
    ],
  },
  {
    id: 'spesial', name: 'Spesial', price: 96000, unit: 'pax', minOrder: 50,
    note: 'Dengan gubukan, dessert, minuman panas dan dingin',
    variants: [
      v('Menu Nusantara', [nasi, laukSpesial, lauk, pauk, sayur, mayur, sambal, gubukan, buahPotong, dessert, minumDingin, minumPanas, kue1, kue2, kerupuk], ['Air mineral 330 ml']),
      v('Menu Mancanegara', [nasiM, laukSpesialM, laukM, paukM, sayurM, mayurM, sambalM, gubukan, buahPotong, dessert, minumDingin, minumPanas, kue1, kue2, kerupuk], ['Air mineral 330 ml']),
    ],
  },
  {
    id: 'lengkap', name: 'Lengkap', price: 69000, unit: 'pax', minOrder: 75,
    note: 'Dengan buah dan minuman dingin',
    variants: [
      v('Menu Nusantara', [nasi, laukSpesial, lauk, pauk, sayur, mayur, sambal, buahPotong, minumDingin, kerupuk]),
      v('Menu Mancanegara', [nasiM, laukSpesialM, laukM, paukM, sayurM, mayurM, sambalM, buahPotong, minumDingin, kerupuk]),
    ],
  },
  {
    id: 'standar', name: 'Standar', price: 47000, unit: 'pax', minOrder: 100,
    note: 'Dengan buah',
    variants: [
      v('Menu Nusantara', [nasi, laukSpesial, pauk, sayur, mayur, sambal, buahPotong, kerupuk]),
      v('Menu Mancanegara', [nasiM, laukSpesialM, paukM, sayurM, mayurM, sambalM, buahPotong, kerupuk]),
    ],
  },
];

/* ------------------------------------------------------------------ Tumpeng */
const tg = (label: string, items: string[]) => ({ label, items });
const tNasi = tg('Nasi', ['Nasi Kuning', 'Nasi Uduk', 'Nasi Liwet']);
const tEmpal = tg('Lauk spesial', ['Empal Gepuk', 'Gurame Goreng']);
const tAyam = tg('Ayam', ['Ayam Bakar', 'Ayam Serundeng']);
const tTelur = tg('Pauk', ['Telur Balado', 'Kentang Goreng Ati']);
const tMie = tg('Mie', ['Mie Goreng', 'Bihun Goreng']);
const tUrap = tg('Sayur', ['Urap', 'Orek Tahu Tempe']);
const tTahu = tg('Gorengan', ['Tahu Tempe Goreng', 'Bakwan Jagung', 'Tahu Tempe Bacem']);
const tSambal = tg('Pelengkap', ['Sambal', 'Lalapan']);
const tumpengExtras = ['Piring, sendok makan, pisau potong dan sendok nasi'];

const tumpengPackages: Package[] = [
  { id: 'premium', name: 'Premium', price: 1250000, unit: 'set', minOrder: 1, note: 'Satu tampah untuk 20–25 orang',
    variants: [{ name: 'Pilihan menu', groups: [tNasi, tEmpal, tAyam, tTelur, tMie, tUrap, tTahu, tSambal], extras: tumpengExtras }] },
  { id: 'spesial', name: 'Spesial', price: 1025000, unit: 'set', minOrder: 1, note: 'Satu tampah untuk 20–25 orang',
    variants: [{ name: 'Pilihan menu', groups: [tNasi, tAyam, tTelur, tMie, tUrap, tTahu, tSambal], extras: tumpengExtras }] },
  { id: 'lengkap', name: 'Lengkap', price: 925000, unit: 'set', minOrder: 1, note: 'Satu tampah untuk 20–25 orang',
    variants: [{ name: 'Pilihan menu', groups: [tNasi, tAyam, tMie, tUrap, tTahu, tSambal], extras: tumpengExtras }] },
  { id: 'standar', name: 'Standar', price: 825000, unit: 'set', minOrder: 1, note: 'Satu tampah untuk 20–25 orang',
    variants: [{ name: 'Pilihan menu', groups: [tNasi, tAyam, tMie, tTahu, tSambal], extras: tumpengExtras }] },
];

const tmNasi = tg('Nasi', ['Nasi Kuning', 'Nasi Uduk']);
const tmUrap = tg('Sayur', ['Urap', 'Orek Tempe']);
const tumpengMiniPackages: Package[] = [
  { id: 'spesial', name: 'Spesial', price: 45000, unit: 'pax', minOrder: 25, note: 'Tumpeng pribadi dalam kotak',
    variants: [
      { name: 'Spesial A', groups: [tmNasi, tEmpal, tMie, tmUrap, tTahu, tSambal] },
      { name: 'Spesial B', groups: [tmNasi, tAyam, tTelur, tMie, tUrap, tTahu, tSambal] },
    ] },
  { id: 'lengkap', name: 'Lengkap', price: 35000, unit: 'pax', minOrder: 35, note: 'Tumpeng pribadi dalam kotak',
    variants: [
      { name: 'Lengkap A', groups: [tmNasi, tEmpal, tMie, tTahu, tSambal] },
      { name: 'Lengkap B', groups: [tmNasi, tAyam, tMie, tUrap, tTahu, tSambal] },
    ] },
];

export const services: Service[] = [
  {
    slug: 'nasi-box', title: 'Nasi Box', short: 'Nasi Box', order: 1, leadDays: 2, unit: 'kotak',
    tagline: 'Makan lengkap dalam satu kotak, untuk rapat sampai syukuran.',
    intro: 'Delapan paket dari Rp22.500 sampai Rp55.000 per kotak. Pilih menu Nusantara atau Mancanegara, satu hidangan untuk setiap baris. Harga sudah termasuk antar di Kota Bogor.',
    photo: photos.nasiboxRendang, gallery: [photos.nasiboxUdang, photos.nasiboxAyamSuwir, photos.nasiboxBalado, photos.nasiboxNasiMerah, photos.dapurPacking],
    packages: nasiBoxPackages,
  },
  {
    slug: 'bento', title: 'Bento', short: 'Bento', order: 2, leadDays: 2, unit: 'bento',
    tagline: 'Satu menu jadi, rapi dalam satu wadah.',
    intro: 'Enam belas pilihan bento dengan menu yang sudah ditentukan, dari Kebuli Iga Sapi sampai Nasi Kuning. Cocok untuk pelatihan, kunjungan kerja dan acara kantor.',
    photo: photos.bentoKebuli, gallery: [photos.bentoNasgor, photos.bentoKebuli],
    packages: bentoPackages,
  },
  {
    slug: 'snack-box', title: 'Snack Box', short: 'Snack Box', order: 3, leadDays: 1, unit: 'kotak',
    tagline: 'Kue basah dan roti untuk rapat, pengajian dan seminar.',
    intro: 'Tiga tingkat paket, masing-masing dengan tiga susunan isi. Pilih sendiri kuenya dari daftar di bawah.',
    photo: photos.kueKu, gallery: [photos.kueKu, photos.kueLumpur, photos.klepon, photos.pastel],
    packages: snackPackages,
    choices: [
      { label: 'Pilihan kue', items: ['Pastel', 'Risoles', 'Combro', 'Sosis Solo', 'Martabak Telur', 'Lumpia', 'Tempe Mendoan', 'Arem-arem', 'Lemper'] },
      { label: 'Pilihan kue premium', items: ['Mini Schotel', 'Ragout', 'Bitterballen', 'Roti Sosis', 'Abon Gulung', 'Panada', 'Mini Pizza', 'Korean Bread', 'Pie Buah', 'Klappertaart', 'Brownies', 'Bolen'] },
    ],
  },
  {
    slug: 'prasmanan', title: 'Prasmanan', short: 'Prasmanan', order: 4, leadDays: 3, unit: 'pax',
    tagline: 'Meja saji lengkap, gubukan dan pramusaji di lokasi acara.',
    intro: 'Kami datang dengan meja prasmanan dan dekorasinya, gerobak gubukan, peralatan saji dan alat makan. Layanan berlangsung empat jam sejak hidangan tersaji.',
    photo: photos.prasmananMalam, gallery: [photos.prasmananMalam, photos.prasmananOutdoor, photos.prasmananTeh, photos.dapurBaki],
    packages: prasmananPackages,
    terms: [
      'Untuk prasmanan, kami menyediakan meja prasmanan dan dekorasinya, gerobak gubukan dan dekorasinya, peralatan saji, serta peralatan makan.',
      'Durasi layanan prasmanan 4 jam sejak hidangan tersaji. Kelebihan waktu dikenakan biaya Rp150.000 per jam.',
    ],
  },
  {
    slug: 'tumpeng', title: 'Tumpeng', short: 'Tumpeng', order: 5, leadDays: 2, unit: 'set',
    tagline: 'Tumpeng tampah untuk 20–25 orang, siap dipotong.',
    intro: 'Empat paket tumpeng tampah lengkap dengan lauk di sekelilingnya. Sudah termasuk piring, sendok makan, pisau potong dan sendok nasi.',
    photo: photos.tumpeng, gallery: [photos.tumpeng],
    packages: tumpengPackages,
  },
  {
    slug: 'tumpeng-mini', title: 'Tumpeng Mini', short: 'Tumpeng Mini', order: 6, leadDays: 2, unit: 'pax',
    tagline: 'Tumpeng pribadi, satu kotak untuk satu tamu.',
    intro: 'Kerucut nasi kuning atau nasi uduk dengan lauk pilihan, dikemas per orang. Praktis untuk syukuran kantor dan ulang tahun.',
    photo: photos.tumpengMini, gallery: [photos.tumpengMini],
    packages: tumpengMiniPackages,
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
