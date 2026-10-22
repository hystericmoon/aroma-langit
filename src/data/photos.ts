import type { ImageMetadata } from 'astro';
import type { Photo } from './types';
import bentoKebuli from '../assets/photos/bento-kebuli.webp';
import bentoNasgor from '../assets/photos/bento-nasgor.webp';
import dapurBaki from '../assets/photos/dapur-baki.webp';
import dapurKoki from '../assets/photos/dapur-koki.webp';
import dapurLuas from '../assets/photos/dapur-luas.webp';
import dapurPacking from '../assets/photos/dapur-packing.webp';
import dapurPotongPaprika from '../assets/photos/dapur-potong-paprika.webp';
import dapurSayur from '../assets/photos/dapur-sayur.webp';
import hidanganFlatlay from '../assets/photos/hidangan-flatlay.webp';
import klepon from '../assets/photos/klepon.webp';
import korporatBuffet from '../assets/photos/korporat-buffet.webp';
import kueKu from '../assets/photos/kue-ku.webp';
import kueLumpur from '../assets/photos/kue-lumpur.webp';
import nasiboxAyamSuwir from '../assets/photos/nasibox-ayam-suwir.webp';
import nasiboxBalado from '../assets/photos/nasibox-balado.webp';
import nasiboxNasiMerah from '../assets/photos/nasibox-nasi-merah.webp';
import nasiboxRendang from '../assets/photos/nasibox-rendang.webp';
import nasiboxUdang from '../assets/photos/nasibox-udang.webp';
import pastel from '../assets/photos/pastel.webp';
import pernikahan from '../assets/photos/pernikahan.webp';
import prasmananMalam from '../assets/photos/prasmanan-malam.webp';
import prasmananOutdoor from '../assets/photos/prasmanan-outdoor.webp';
import prasmananTeh from '../assets/photos/prasmanan-teh.webp';
import tumpeng from '../assets/photos/tumpeng.webp';
import tumpengMini from '../assets/photos/tumpeng-mini.webp';

const p = (src: ImageMetadata, alt: string): Photo => ({ kind: 'local', src, alt });

export const photos = {
  bentoKebuli: p(bentoKebuli, 'Bento nasi kebuli dengan ayam bakar, acar sayur dan sambal'),
  bentoNasgor: p(bentoNasgor, 'Bento nasi goreng dengan telur mata sapi, kentang dan acar timun'),
  dapurBaki: p(dapurBaki, 'Juru masak membawa baki berisi udang balado dari dapur'),
  dapurKoki: p(dapurKoki, 'Juru masak bermasker dan bertopi rambut bekerja di dapur'),
  dapurLuas: p(dapurLuas, 'Dapur katering Aroma Langit dengan kompor besar dan meja stainless'),
  dapurPacking: p(dapurPacking, 'Tangan bersarung tangan mengemas lauk ke dalam nasi box putih'),
  dapurPotongPaprika: p(dapurPotongPaprika, 'Juru masak memotong paprika di atas talenan putih'),
  dapurSayur: p(dapurSayur, 'Sayur segar disiapkan di meja dapur'),
  hidanganFlatlay: p(hidanganFlatlay, 'Beberapa piring lauk dilihat dari atas'),
  klepon: p(klepon, 'Klepon hijau bertabur kelapa parut'),
  korporatBuffet: p(korporatBuffet, 'Tamu mengambil lauk dari meja saji katering kantor'),
  kueKu: p(kueKu, 'Kue ku merah, hijau dan kuning'),
  kueLumpur: p(kueLumpur, 'Kue lumpur dengan kismis di atas piring putih'),
  nasiboxAyamSuwir: p(nasiboxAyamSuwir, 'Nasi box berisi ayam suwir, semangka, sayur dan nasi terbungkus kertas'),
  nasiboxBalado: p(nasiboxBalado, 'Nasi box berisi telur balado, empal, tumis paprika dan nasi'),
  nasiboxNasiMerah: p(nasiboxNasiMerah, 'Nasi box dengan nasi merah, perkedel, lauk balado dan jeruk'),
  nasiboxRendang: p(nasiboxRendang, 'Nasi box berisi rendang, gulai, sayur, kerupuk dan jeruk, dengan sleeve oranye Aroma Langit'),
  nasiboxUdang: p(nasiboxUdang, 'Nasi box berisi udang goreng, perkedel, sayur dan buah nanas'),
  pastel: p(pastel, 'Pastel goreng di atas daun selada'),
  pernikahan: p(pernikahan, 'Rangkaian bunga dan meja prasmanan di resepsi pernikahan'),
  prasmananMalam: p(prasmananMalam, 'Meja prasmanan malam hari dengan lampu gantung dan tamu'),
  prasmananOutdoor: p(prasmananOutdoor, 'Pramusaji melayani tamu di meja prasmanan luar ruang'),
  prasmananTeh: p(prasmananTeh, 'Pramusaji menuang teh untuk tamu di acara luar ruang'),
  tumpeng: p(tumpeng, 'Tumpeng nasi kuning dengan lauk di atas tampah'),
  tumpengMini: p(tumpengMini, 'Tumpeng mini nasi kuning dalam kotak dengan lauk dan sambal'),
};

export type PhotoKey = keyof typeof photos;
