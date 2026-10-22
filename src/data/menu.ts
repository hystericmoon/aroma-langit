// Dish lists transcribed from the 2024 price list on aromalangit.id.
// Each constant is one slot on the menu; the customer picks one dish per slot.
import type { MenuGroup, MenuVariant } from './types';

const g = (label: string, items: string[]): MenuGroup => ({ label, items });

/* Nusantara */
export const nasiSpesial = g('Nasi spesial', ['Nasi Bakar Ayam', 'Nasi Goreng Kampung', 'Nasi Teri Kecombrang', 'Nasi Tutug Oncom']);
export const nasi = g('Nasi', ['Nasi Putih', 'Nasi Kuning', 'Nasi Liwet', 'Nasi Merah', 'Nasi Uduk']);
export const laukSpesial = g('Lauk spesial', ['Rendang', 'Empal Gepuk', 'Ayam Suwir Bali', 'Gurame Pesmol', 'Udang Balado']);
export const lauk = g('Lauk', ['Ayam Bakar Kalasan', 'Ayam Bakar Taliwang', 'Ayam Serundeng', 'Oseng Cumi Asin', 'Nila Bumbu Cobek']);
export const pauk = g('Pauk', ['Kentang Goreng Ati', 'Telur Bumbu Bali', 'Orek Teri Kacang', 'Asin Kapas Balado']);
export const sayur = g('Sayur', ['Sayur Asem', 'Urap', 'Karedok', 'Kentang Mustopa', 'Gulai Pucuk Ubi']);
export const mayur = g('Gorengan', ['Bakwan Jagung', 'Tahu Tempe Bacem', 'Perkedel Kentang', 'Tempe Mendoan']);
export const sambal = g('Sambal', ['Sambal Bajak', 'Sambal Ijo', 'Sambal Dadak', 'Sambal Balado']);
export const buahPuding = g('Buah atau puding', ['Pisang', 'Jeruk', 'Puding']);
export const kerupuk = g('Kerupuk', ['Kerupuk Udang', 'Kerupuk Palembang']);
export const lalapan = g('Lalapan', ['Lalapan segar']);

/* Mancanegara */
export const nasiSpesialM = g('Nasi spesial', ['Butter Rice', 'Nasi Goreng Oriental', 'Nasi Goreng Seafood']);
export const nasiM = g('Nasi', ['Nasi Putih', 'Nasi Merah']);
export const laukSpesialM = g('Lauk spesial', ['Ayam Kungpao', 'Ayam Saus Thailand', 'Beef Rolade', 'Beef Teriyaki', 'Gurame Asam Manis', 'Sapi Lada Hitam', 'Udang Mayo']);
export const laukM = g('Lauk', ['Ayam Kecap', 'Ayam Goreng Mentega', 'Chicken Rolade', 'Dori Cabe Garam', 'Dori Asam Manis', 'Puyung Hay', 'Sosis Saus BBQ']);
export const paukM = g('Pauk', ['Bakwan Udang', 'Omelet Sosis', 'Martabak Telur', 'Tahu Isi Daging']);
export const sayurM = g('Sayur', ['Capcay', 'Mie Goreng Oriental', 'Tumis Buncis Wortel', 'Tumis Kimlo', 'Salad', 'Sup Kimlo']);
export const mayurM = g('Gorengan', ['Bakwan Sayur', 'Jamur Krispi', 'Pangsit Isi Goreng', 'Tahu Cabe Garam']);
export const sambalM = g('Sambal', ['Sambal Dabu', 'Sambal Korek', 'Saus Sambal']);

/* Prasmanan extras */
export const gubukan = g('Gubukan', ['Dim Sum', 'Mie Kocok Bandung', 'Pempek Palembang', 'Siomay']);
export const buahPotong = g('Buah', ['Buah Potong', 'Jeruk', 'Pisang']);
export const dessert = g('Dessert', ['Es Buah', 'Es Dawet', 'Puding Vla', 'Salad Buah']);
export const minumDingin = g('Minuman dingin', ['Lemon Tea', 'Thai Tea', 'Minuman Bersoda', 'Orange Juice']);
export const minumPanas = g('Minuman panas', ['Bajigur', 'Bandrek', 'Kopi', 'Teh']);
export const kue1 = g('Kue asin', ['Pastel', 'Risoles', 'Samosa', 'Sosis Solo']);
export const kue2 = g('Kue manis', ['Kue Talam', 'Kue Lapis', 'Nagasari', 'Onde-onde']);

export const nusantara = (name: string, groups: MenuGroup[], extras = ['Air mineral cup']): MenuVariant => ({ name, groups, extras });
