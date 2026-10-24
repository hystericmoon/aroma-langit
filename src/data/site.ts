import type { SiteSettings } from './types';

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const site: SiteSettings = {
  legalName: 'PT Aroma Langit Nusantara',
  brand: 'Aroma Langit',
  email: 'tanya@aromalangit.id',
  csPhone: '6285295535588',
  csHours: '08.00–22.00 WIB',
  marketingPhone: '6287823326800',
  marketingHours: '24 jam',
  office: {
    label: 'Kantor',
    lines: ['Ruko Archade Blok D No. 18', 'Jl. Orchard Walk, Bogor Nirwana Residence', 'Bogor Selatan, Kota Bogor'],
    mapUrl: maps('Ruko Archade Blok D No. 18 Bogor Nirwana Residence Bogor'),
  },
  kitchen: {
    label: 'Dapur',
    lines: ['Jl. Jabaru II No. 13', 'Pasir Kuda, Bogor Barat', 'Kota Bogor'],
    mapUrl: maps('Jl. Jabaru II No. 13 Pasir Kuda Bogor Barat'),
  },
  halal: { number: 'ID32110001863560323', decree: 'LPPOM-00330211710423', date: '12 April 2023' },
  hygiene: { grade: 'Golongan B', number: '10.03/237/BOGA-02.0122/P2P', issuer: 'Dinas Kesehatan Kota Bogor' },
  staffCerts: ['Penjamah Makanan (Food Handler)', 'Food Service', 'HACCP', 'Nutrition Care Process'],
  socials: [
    { label: 'Instagram', url: 'https://www.instagram.com/aroma_langit/' },
    { label: 'Facebook', url: 'https://www.facebook.com/OfficialAromaLangit/' },
    { label: 'YouTube', url: 'https://www.youtube.com/channel/UCtBl-yqjh7n2juFFqjVKt1g' },
  ],
  clients: [
    'Pertamina', 'Kementerian ESDM', 'Institut Teknologi Bandung', 'Universitas Padjadjaran', 'Telkom University',
    'IPDN', 'RSUD Tarakan Jakarta', 'Summarecon', 'CGV', 'Bukalapak', 'Dyandra',
  ],
  milestones: [
    { when: 'Februari 2017', text: 'Rumah makan prasmanan Aroma Langit dibuka di Jatinangor, Sumedang.' },
    { when: 'Desember 2017', text: 'Beralih fokus menjadi dapur katering dan pindah ke Cinambo, Bandung.' },
    { when: 'April 2018', text: 'Resmi berbadan hukum sebagai CV Aroma Langit.' },
    { when: 'November 2018', text: 'Menerima sertifikat Halal MUI dan Laik Higiene dari Dinas Kesehatan.' },
    { when: 'Januari 2021', text: 'Bertransformasi menjadi PT Aroma Langit Nusantara.' },
    { when: 'April 2023', text: 'Sertifikat Halal BPJPH ID32110001863560323 terbit untuk dapur di Bogor.' },
  ],
  team: [
    { name: 'Langgie Janu H.', role: 'Chairman', bio: 'Memimpin Hirandhi Corporations, yang menaungi Aroma Langit, dengan usaha di bidang otomotif, IT, migas, konstruksi dan pemasok makanan.' },
    { name: 'Achmad Hussein', role: 'CEO', bio: 'Pendiri Aroma Langit. Juru masak dan pengusaha muda dengan pengalaman panjang di dunia kuliner.' },
    { name: 'Rega P. Arthanto', role: 'COO', bio: 'Ahli gizi yang berpengalaman mengelola penyediaan makanan sehat di dapur rumah sakit ternama.' },
  ],
  sharedTerms: [
    'Pesanan diproses setelah uang muka 50% dari nilai pesanan kami terima. Pelunasan paling lambat sehari sebelum acara (H-1).',
    'Pembatalan sebelum H-3: uang muka kami kembalikan 50%. Pembatalan setelah H-3: uang muka tidak dapat dikembalikan.',
    'Perubahan tanggal acara atau menu bisa dilakukan paling lambat H-3.',
    'Jumlah pesanan hanya bisa ditambah, paling lambat H-1, setelah selisih pembayarannya dilunasi.',
    'Harga sudah termasuk ongkos kirim dan layanan di Kota Bogor untuk pesanan yang memenuhi minimum.',
    'Pesanan di bawah minimum dikenakan biaya tambahan 20% dari selisih minimum pesanan.',
    'Untuk pengiriman di luar Kota Bogor, ongkos kirim menyesuaikan jarak.',
    'Harga dan paket dapat berubah sewaktu-waktu. Hubungi marketing kami untuk penawaran terbaik.',
  ],
  depositRate: 50,
  settlementDays: 1,
  pricelistUrl: '/files/pricelist-aroma-langit-2024.pdf',
  weddingCatalogs: [
    { label: 'Katalog katering pernikahan', url: '/files/katalog-katering-pernikahan-2024.pdf' },
    { label: 'Katalog layanan all-in wedding', url: '/files/katalog-layanan-wedding-2024.pdf' },
  ],
};

export const waLink = (phone: string, text?: string) =>
  `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const formatPhone = (intl: string) => {
  const local = '0' + intl.replace(/^62/, '');
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
};
