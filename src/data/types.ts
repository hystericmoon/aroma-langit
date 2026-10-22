import type { ImageMetadata } from 'astro';

/** A picture either bundled with the site or served from the Sanity CDN. */
export type Photo =
  | { kind: 'local'; src: ImageMetadata; alt: string }
  | { kind: 'remote'; url: string; width: number; height: number; alt: string };

export interface MenuGroup {
  /** e.g. "Lauk spesial" */
  label: string;
  /** Choices for this slot; the guest or host picks one. */
  items: string[];
}

export interface MenuVariant {
  /** e.g. "Menu Nusantara" or "Bento Dendeng Batokok" */
  name: string;
  groups: MenuGroup[];
  /** Always-included extras printed under the groups (air mineral, etc.). */
  extras?: string[];
}

export interface Package {
  id: string;
  name: string;
  price: number;
  /** "kotak", "bento", "pax", "set" */
  unit: string;
  /** Minimum quantity in `unit`. 1 for per-set items. */
  minOrder: number;
  /** Short line under the price: packaging, portions, inclusions. */
  note?: string;
  variants: MenuVariant[];
}

export interface Service {
  slug: string;
  title: string;
  /** Short name used in the order label and nav. */
  short: string;
  /** One-line promise, sentence case. */
  tagline: string;
  intro: string;
  /** Days before the event an order must be placed (H-n). */
  leadDays: number;
  unit: string;
  photo: Photo;
  gallery: Photo[];
  packages: Package[];
  /** Extra lists shown on the page (e.g. snack choices). */
  choices?: MenuGroup[];
  /** Service-specific terms added to the shared ones. */
  terms?: string[];
  order: number;
}

export interface Milestone {
  when: string;
  text: string;
}

export interface Person {
  name: string;
  role: string;
  bio: string;
}

export interface SiteSettings {
  legalName: string;
  brand: string;
  email: string;
  csPhone: string;
  csHours: string;
  marketingPhone: string;
  marketingHours: string;
  office: { label: string; lines: string[]; mapUrl: string };
  kitchen: { label: string; lines: string[]; mapUrl: string };
  halal: { number: string; decree: string; date: string };
  hygiene: { grade: string; number: string; issuer: string };
  staffCerts: string[];
  socials: { label: string; url: string }[];
  clients: string[];
  milestones: Milestone[];
  team: Person[];
  sharedTerms: string[];
  pricelistUrl: string;
  weddingCatalogs: { label: string; url: string }[];
}
