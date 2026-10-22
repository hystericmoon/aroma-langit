// Starting points for the catering calculator. Every line uses a real package;
// visitors can change anything after picking one.
import type { Preset } from '../lib/calculator';

export const presets: Preset[] = [
  {
    id: 'rapat',
    title: 'Rapat kantor',
    description: 'Snack box saat rapat, nasi box untuk makan siang.',
    guests: 35,
    guestWord: 'peserta',
    items: [
      { label: 'Snack rapat', service: 'snack-box', pkg: 'spesial', mode: 'per-guest', perGuest: 1 },
      { label: 'Makan siang', service: 'nasi-box', pkg: 'spesial-a', mode: 'per-guest', perGuest: 1 },
    ],
  },
  {
    id: 'pelatihan',
    title: 'Pelatihan sehari',
    description: 'Snack pagi dan sore, bento untuk makan siang.',
    guests: 40,
    guestWord: 'peserta',
    items: [
      { label: 'Snack pagi', service: 'snack-box', pkg: 'spesial', mode: 'per-guest', perGuest: 1 },
      { label: 'Makan siang', service: 'bento', pkg: 'spesial', mode: 'per-guest', perGuest: 1 },
      { label: 'Snack sore', service: 'snack-box', pkg: 'spesial', mode: 'per-guest', perGuest: 1 },
    ],
  },
  {
    id: 'syukuran',
    title: 'Syukuran & pengajian',
    description: 'Satu tumpeng untuk dipotong, nasi box untuk semua tamu.',
    guests: 100,
    guestWord: 'tamu',
    items: [
      { label: 'Tumpeng utama', service: 'tumpeng', pkg: 'premium', mode: 'fixed', fixed: 1 },
      { label: 'Nasi box tamu', service: 'nasi-box', pkg: 'lengkap-a', mode: 'per-guest', perGuest: 1 },
    ],
  },
  {
    id: 'ulang-tahun',
    title: 'Ulang tahun & arisan',
    description: 'Tumpeng mini untuk setiap tamu, ditambah snack box.',
    guests: 35,
    guestWord: 'tamu',
    items: [
      { label: 'Tumpeng mini', service: 'tumpeng-mini', pkg: 'lengkap', mode: 'per-guest', perGuest: 1 },
      { label: 'Snack', service: 'snack-box', pkg: 'spesial', mode: 'per-guest', perGuest: 1 },
    ],
  },
  {
    id: 'gathering',
    title: 'Gathering & acara besar',
    description: 'Prasmanan dengan pramusaji, snack box untuk sesi sore.',
    guests: 150,
    guestWord: 'tamu',
    items: [
      { label: 'Prasmanan', service: 'prasmanan', pkg: 'lengkap', mode: 'per-guest', perGuest: 1 },
      { label: 'Snack sore', service: 'snack-box', pkg: 'standar', mode: 'per-guest', perGuest: 1 },
    ],
  },
  {
    id: 'pernikahan',
    title: 'Resepsi pernikahan',
    description: 'Prasmanan untuk 60% undangan, sesuai rumus katalog kami.',
    guests: 500,
    guestWord: 'undangan',
    items: [{ label: 'Prasmanan resepsi', service: 'pernikahan', pkg: 'gold', mode: 'per-guest', perGuest: 0.6 }],
  },
  {
    id: 'kustom',
    title: 'Susun sendiri',
    description: 'Mulai dari kosong dan tambahkan apa saja.',
    guests: 50,
    guestWord: 'tamu',
    items: [],
  },
];
