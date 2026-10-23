# Panduan mengubah isi situs (Sanity Studio)

Isi situs Aroma Langit (harga, menu, foto, kontak, preset kalkulator) diubah di **Sanity Studio**. Setelah Anda menekan **Publish**, situs memperbarui dirinya sendiri dalam beberapa menit. Anda tidak perlu menyentuh kode atau hosting.

## 1. Masuk ke Studio

1. Buka **https://aromalangit.sanity.studio** (bisa dari laptop atau ponsel).
2. Masuk dengan akun yang diundang (Google, GitHub atau email). Belum punya akses? Minta admin mengundang email Anda di sanity.io/manage → proyek Aroma Langit → **Members** → **Invite**, peran **Editor**.
3. Di kiri ada tiga menu:
   - **Layanan & harga**: nasi box, bento, snack box, prasmanan, tumpeng, tumpeng mini. Berisi paket, harga, minimum, menu, foto dan syarat.
   - **Preset kalkulator**: contoh pesanan di halaman /kalkulator/ (rapat, pelatihan, syukuran, dan lainnya).
   - **Pengaturan situs**: nomor WhatsApp, jam layanan, alamat, sertifikat, klien, tim, syarat pemesanan umum.

## 2. Mengubah harga

1. **Layanan & harga** → pilih layanan, misalnya **Nasi Box**.
2. Gulir ke **Paket**, klik paket yang ingin diubah (misalnya *Spesial A*).
3. Ubah **Harga (Rp)**. Tulis angka saja tanpa titik: `32000`, bukan `Rp32.000`.
4. Bila perlu, ubah juga **Minimum pesanan** atau **Catatan singkat**.
5. Tutup jendela paket, lalu tekan **Publish** (tombol hijau di kanan bawah).

Harga baru otomatis dipakai di halaman layanan, daftar harga di beranda, label pesanan dan kalkulator.

> Hati-hati mengganti **Nama paket**. Preset kalkulator mencari paket berdasarkan namanya. Kalau nama paket diganti, ubah juga nama paket di preset yang memakainya (lihat bagian 4), atau baris itu tidak akan tampil.

## 3. Mengganti foto

1. **Layanan & harga** → pilih layanan.
2. Di **Foto utama** (atau salah satu foto di **Galeri**), klik foto → **Replace** / **Upload**, lalu pilih file dari perangkat.
3. Isi **Deskripsi gambar**: satu kalimat tentang isi foto, misalnya "Nasi box ayam bakar dengan sambal dan lalapan". Ini dibaca oleh pembaca layar dan mesin pencari, jadi wajib diisi.
4. Opsional: klik ikon **crop** untuk menentukan bagian foto yang paling penting (hotspot), agar tidak terpotong di layar kecil.
5. Tekan **Publish**.

Tips foto: minimal 1600 px lebar, terang, makanan terlihat jelas. Ukuran file tidak masalah, situs mengecilkannya sendiri.

## 4. Mengubah preset kalkulator

1. **Preset kalkulator** → pilih acara, misalnya **Rapat**.
2. Ubah **Jumlah tamu awal**, **Sebutan tamu** atau **Keterangan singkat** bila perlu.
3. Di **Isi pesanan**, klik satu baris untuk mengubahnya, atau **Add item** untuk menambah baris:
   - **Nama baris**: misalnya "Snack pagi".
   - **Layanan**: pilih dari daftar.
   - **Nama paket**: tulis **persis** seperti di Layanan & harga, misalnya `Spesial A`.
   - **Cara menghitung**: *Per tamu* (isi **Porsi per tamu**: 1 = satu per tamu, 2 = dua sesi, 0,5 = separuh tamu) atau *Jumlah tetap* (misalnya 1 tumpeng).
4. Untuk mengubah urutan tombol acara, ubah angka **Urutan** (kecil tampil lebih dulu).
5. Tekan **Publish**.

Baris dengan nama paket yang tidak ditemukan dilewati tanpa merusak situs. Jika preset tidak muncul setelah Publish, periksa ejaan nama paketnya.

## 5. Setelah menekan Publish

1. Sanity memberi tahu GitHub, lalu GitHub membangun ulang situs dan mengunggahnya ke hosting.
2. Tunggu **sekitar 5–10 menit**, lalu muat ulang **https://new.aromalangit.id** (tarik layar ke bawah di ponsel). Bila masih lama, buka di jendela penyamaran untuk melewati cache.
3. Beberapa perubahan sekaligus? Tidak apa-apa. Publish berturut-turut digabung, dan situs akhirnya menampilkan versi terakhir.
4. Hanya isi yang sudah di-**Publish** yang tampil. Perubahan yang masih *draft* (belum di-Publish) tidak terlihat di situs.
5. Salah ubah? Buka dokumennya, klik menu **⋯** / **History** di kanan atas, pilih versi sebelumnya, lalu **Restore** dan **Publish**.
6. Kolom yang dikosongkan tidak membuat situs rusak: situs memakai isi bawaan untuk kolom itu. Tetap lebih baik mengisinya dengan benar.

Ada yang tidak berubah setelah 15 menit? Hubungi admin situs dan sebutkan apa yang diubah dan jam berapa Anda menekan Publish.
