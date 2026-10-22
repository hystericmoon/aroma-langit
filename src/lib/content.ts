// Content source. When SANITY_PROJECT_ID is set at build time, content comes from
// Sanity; otherwise the bundled data in src/data is used. Both return the same shapes,
// and anything missing in Sanity falls back to the bundled value.
import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { Package, Photo, Service, SiteSettings, MenuVariant } from '../data/types';
import { services as localServices } from '../data/services';
import { site as localSite } from '../data/site';

const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.SANITY_DATASET as string | undefined) ?? 'production';

let client: SanityClient | null = null;
function sanity(): SanityClient | null {
  if (!projectId) return null;
  client ??= createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, perspective: 'published' });
  return client;
}

interface SanityImage {
  alt?: string;
  asset?: { _id: string; url: string; metadata?: { dimensions?: { width: number; height: number } } };
}

function toPhoto(img: SanityImage | null | undefined, fallback: Photo): Photo {
  const c = sanity();
  if (!c || !img?.asset?.url) return fallback;
  const dim = img.asset.metadata?.dimensions;
  const url = createImageUrlBuilder(c).image(img.asset._id).auto('format').url();
  return {
    kind: 'remote',
    url,
    width: dim?.width ?? 1600,
    height: dim?.height ?? 1200,
    alt: img.alt || fallback.alt,
  };
}

const imageFields = `alt, asset->{_id, url, metadata{dimensions{width,height}}}`;

const servicesQuery = `*[_type == "service" && !(_id in path("drafts.**"))] | order(order asc){
  "slug": slug.current, title, short, tagline, intro, leadDays, unit, order,
  photo{${imageFields}}, gallery[]{${imageFields}},
  packages[]{ "id": _key, name, price, unit, minOrder, note,
    variants[]{ name, extras, groups[]{ label, items } } },
  choices[]{ label, items }, terms
}`;

interface SanityService extends Omit<Service, 'photo' | 'gallery' | 'packages'> {
  photo?: SanityImage;
  gallery?: SanityImage[];
  packages?: (Omit<Package, 'variants'> & { variants?: MenuVariant[] })[];
}

let servicesCache: Promise<Service[]> | null = null;
export function getServices(): Promise<Service[]> {
  servicesCache ??= (async () => {
    const c = sanity();
    if (!c) return localServices;
    const rows = await c.fetch<SanityService[]>(servicesQuery);
    if (!rows?.length) return localServices;
    return rows
      .filter((r) => r.slug && r.title)
      .map((r) => {
        const local = localServices.find((s) => s.slug === r.slug) ?? localServices[0];
        const packages: Package[] = (r.packages ?? [])
          .filter((p) => p.name && Number.isFinite(p.price))
          .map((p) => ({
            ...p,
            unit: p.unit || r.unit || local.unit,
            minOrder: Math.max(1, p.minOrder || 1),
            variants: (p.variants ?? []).map((v) => ({ ...v, groups: v.groups ?? [] })),
          }));
        return {
          ...local,
          ...Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null && v !== undefined)),
          photo: toPhoto(r.photo, local.photo),
          gallery: r.gallery?.length ? r.gallery.map((g, i) => toPhoto(g, local.gallery[i % local.gallery.length] ?? local.photo)) : local.gallery,
          packages: packages.length ? packages : local.packages,
        } as Service;
      });
  })();
  return servicesCache;
}

const siteQuery = `*[_id == "siteSettings"][0]`;

let siteCache: Promise<SiteSettings> | null = null;
export function getSite(): Promise<SiteSettings> {
  siteCache ??= (async () => {
    const c = sanity();
    if (!c) return localSite;
    const row = await c.fetch<Partial<SiteSettings> | null>(siteQuery);
    if (!row) return localSite;
    const clean = Object.fromEntries(Object.entries(row).filter(([k, v]) => !k.startsWith('_') && v !== null && v !== undefined));
    return { ...localSite, ...clean } as SiteSettings;
  })();
  return siteCache;
}

export async function getService(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((s) => s.slug === slug);
}
