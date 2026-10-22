import { defineArrayMember, defineField, defineType } from 'sanity';

const rupiah = (n?: number) => (typeof n === 'number' ? `Rp${n.toLocaleString('id-ID')}` : '');

export const menuGroup = defineType({
  name: 'menuGroup',
  title: 'Baris menu',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Nama baris', type: 'string', description: 'Misalnya "Lauk spesial". Pelanggan memilih satu hidangan dari baris ini.', validation: (r) => r.required() }),
    defineField({ name: 'items', title: 'Pilihan hidangan', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' }, validation: (r) => r.required().min(1) }),
  ],
  preview: { select: { title: 'label', items: 'items' }, prepare: ({ title, items }) => ({ title, subtitle: (items ?? []).join(' · ') }) },
});

export const menuVariant = defineType({
  name: 'menuVariant',
  title: 'Pilihan menu',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: 'Nama', type: 'string', description: 'Misalnya "Menu Nusantara" atau nama bento.', validation: (r) => r.required() }),
    defineField({ name: 'groups', title: 'Baris menu', type: 'array', of: [defineArrayMember({ type: 'menuGroup' })], validation: (r) => r.required().min(1) }),
    defineField({ name: 'extras', title: 'Sudah termasuk', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
  ],
});

export const servicePackage = defineType({
  name: 'servicePackage',
  title: 'Paket',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: 'Nama paket', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'price', title: 'Harga (Rp)', type: 'number', validation: (r) => r.required().integer().min(1000) }),
    defineField({ name: 'unit', title: 'Satuan', type: 'string', description: 'kotak, bento, pax atau set', options: { list: ['kotak', 'bento', 'pax', 'set'] }, validation: (r) => r.required() }),
    defineField({ name: 'minOrder', title: 'Minimum pesanan', type: 'number', initialValue: 1, validation: (r) => r.required().integer().min(1) }),
    defineField({ name: 'note', title: 'Catatan singkat', type: 'string', description: 'Kemasan, porsi atau isi tambahan.' }),
    defineField({ name: 'variants', title: 'Pilihan menu', type: 'array', of: [defineArrayMember({ type: 'menuVariant' })], validation: (r) => r.required().min(1) }),
  ],
  preview: {
    select: { name: 'name', price: 'price', unit: 'unit', min: 'minOrder' },
    prepare: ({ name, price, unit, min }) => ({ title: name, subtitle: `${rupiah(price)}/${unit ?? ''} · minimum ${min ?? 1}` }),
  },
});

const imageWithAlt = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [defineField({ name: 'alt', title: 'Deskripsi gambar', type: 'string', description: 'Untuk pembaca layar dan mesin pencari.', validation: (r) => r.required() })],
  });

export const service = defineType({
  name: 'service',
  title: 'Layanan',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Nama layanan', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Alamat halaman', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'short', title: 'Nama pendek', type: 'string' }),
    defineField({ name: 'order', title: 'Urutan', type: 'number', validation: (r) => r.required().integer() }),
    defineField({ name: 'tagline', title: 'Kalimat utama', type: 'string', validation: (r) => r.required().max(90) }),
    defineField({ name: 'intro', title: 'Pengantar', type: 'text', rows: 3, validation: (r) => r.required().max(320) }),
    defineField({ name: 'leadDays', title: 'Pesan paling lambat (hari sebelum acara)', type: 'number', validation: (r) => r.required().integer().min(0).max(60) }),
    defineField({ name: 'unit', title: 'Satuan', type: 'string', options: { list: ['kotak', 'bento', 'pax', 'set'] }, validation: (r) => r.required() }),
    imageWithAlt('photo', 'Foto utama'),
    defineField({ name: 'gallery', title: 'Galeri', type: 'array', of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Deskripsi gambar', type: 'string' })] })] }),
    defineField({ name: 'packages', title: 'Paket', type: 'array', of: [defineArrayMember({ type: 'servicePackage' })], validation: (r) => r.required().min(1) }),
    defineField({ name: 'choices', title: 'Daftar pilihan tambahan', type: 'array', of: [defineArrayMember({ type: 'menuGroup' })] }),
    defineField({ name: 'terms', title: 'Syarat khusus layanan ini', type: 'array', of: [defineArrayMember({ type: 'text', rows: 2 })] }),
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', media: 'photo', n: 'packages' }, prepare: ({ title, media, n }) => ({ title, media, subtitle: `${(n ?? []).length} paket` }) },
});

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Pengaturan situs',
  type: 'document',
  groups: [
    { name: 'kontak', title: 'Kontak', default: true },
    { name: 'sertifikat', title: 'Sertifikat' },
    { name: 'tentang', title: 'Tentang' },
  ],
  fields: [
    defineField({ name: 'legalName', title: 'Nama badan usaha', type: 'string', group: 'kontak' }),
    defineField({ name: 'email', title: 'Email', type: 'string', group: 'kontak', validation: (r) => r.email() }),
    defineField({ name: 'csPhone', title: 'WhatsApp layanan pelanggan', type: 'string', group: 'kontak', description: 'Format internasional tanpa +, misalnya 6285295535588', validation: (r) => r.regex(/^62\d{8,13}$/) }),
    defineField({ name: 'csHours', title: 'Jam layanan pelanggan', type: 'string', group: 'kontak' }),
    defineField({ name: 'marketingPhone', title: 'WhatsApp marketing', type: 'string', group: 'kontak', validation: (r) => r.regex(/^62\d{8,13}$/) }),
    defineField({ name: 'marketingHours', title: 'Jam marketing', type: 'string', group: 'kontak' }),
    defineField({
      name: 'office', title: 'Kantor', type: 'object', group: 'kontak',
      fields: [
        defineField({ name: 'label', type: 'string', title: 'Label' }),
        defineField({ name: 'lines', type: 'array', title: 'Alamat (per baris)', of: [defineArrayMember({ type: 'string' })] }),
        defineField({ name: 'mapUrl', type: 'url', title: 'Tautan Google Maps' }),
      ],
    }),
    defineField({
      name: 'kitchen', title: 'Dapur', type: 'object', group: 'kontak',
      fields: [
        defineField({ name: 'label', type: 'string', title: 'Label' }),
        defineField({ name: 'lines', type: 'array', title: 'Alamat (per baris)', of: [defineArrayMember({ type: 'string' })] }),
        defineField({ name: 'mapUrl', type: 'url', title: 'Tautan Google Maps' }),
      ],
    }),
    defineField({
      name: 'socials', title: 'Media sosial', type: 'array', group: 'kontak',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'label', type: 'string' }), defineField({ name: 'url', type: 'url' })] })],
    }),
    defineField({
      name: 'halal', title: 'Sertifikat halal', type: 'object', group: 'sertifikat',
      fields: [defineField({ name: 'number', type: 'string', title: 'Nomor' }), defineField({ name: 'decree', type: 'string', title: 'Ketetapan MUI' }), defineField({ name: 'date', type: 'string', title: 'Tanggal' })],
    }),
    defineField({
      name: 'hygiene', title: 'Laik higiene', type: 'object', group: 'sertifikat',
      fields: [defineField({ name: 'grade', type: 'string', title: 'Golongan' }), defineField({ name: 'number', type: 'string', title: 'Nomor' }), defineField({ name: 'issuer', type: 'string', title: 'Penerbit' })],
    }),
    defineField({ name: 'staffCerts', title: 'Sertifikasi tim', type: 'array', group: 'sertifikat', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
    defineField({ name: 'clients', title: 'Klien', type: 'array', group: 'tentang', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
    defineField({
      name: 'milestones', title: 'Perjalanan', type: 'array', group: 'tentang',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'when', type: 'string', title: 'Kapan' }), defineField({ name: 'text', type: 'string', title: 'Peristiwa' })] })],
    }),
    defineField({
      name: 'team', title: 'Tim', type: 'array', group: 'tentang',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'name', type: 'string', title: 'Nama' }), defineField({ name: 'role', type: 'string', title: 'Jabatan' }), defineField({ name: 'bio', type: 'text', rows: 3, title: 'Profil' })] })],
    }),
    defineField({ name: 'sharedTerms', title: 'Syarat pemesanan umum', type: 'array', group: 'kontak', of: [defineArrayMember({ type: 'text', rows: 2 })] }),
  ],
  preview: { prepare: () => ({ title: 'Pengaturan situs' }) },
});

export const schemaTypes = [menuGroup, menuVariant, servicePackage, service, siteSettings];
