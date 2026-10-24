// Writes studio/seed/aroma-langit.ndjson from the bundled content so a fresh Sanity
// dataset starts with every service, package, price and setting the site ships with.
// Run: npm run seed  (then: cd studio && npm run import-seed)
import { test } from 'vitest';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { services } from '../src/data/services';
import { site } from '../src/data/site';
import type { Photo } from '../src/data/types';
import { presets } from '../src/data/presets';
import { buildCatalog } from '../src/lib/calculator';
import { weddingCatering } from '../src/data/wedding';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const photoDir = join(root, 'src/assets/photos');
const files = readdirSync(photoDir);

function asset(p: Photo) {
  if (p.kind !== 'local') return undefined;
  // Vite serves imported images with their original file name in the URL.
  const name = basename(p.src.src.split('?')[0]);
  const file = files.find((f) => name.startsWith(f.replace(/\.\w+$/, '')));
  if (!file) throw new Error(`No source file for ${name}`);
  return { _type: 'image', alt: p.alt, _sanityAsset: `image@file://${join(photoDir, file)}` };
}

const key = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60);

test('write Sanity seed', () => {
  const docs: Record<string, unknown>[] = [];
  docs.push({
    _id: 'siteSettings',
    _type: 'siteSettings',
    legalName: site.legalName,
    email: site.email,
    csPhone: site.csPhone,
    csHours: site.csHours,
    marketingPhone: site.marketingPhone,
    marketingHours: site.marketingHours,
    office: site.office,
    kitchen: site.kitchen,
    socials: site.socials.map((s) => ({ _key: key(s.label), ...s })),
    halal: site.halal,
    hygiene: site.hygiene,
    staffCerts: site.staffCerts,
    clients: site.clients,
    milestones: site.milestones.map((m, i) => ({ _key: `m${i}`, ...m })),
    team: site.team.map((t, i) => ({ _key: `t${i}`, ...t })),
    sharedTerms: site.sharedTerms,
    depositRate: site.depositRate,
    settlementDays: site.settlementDays,
  });
  for (const s of services) {
    docs.push({
      _id: `service-${s.slug}`,
      _type: 'service',
      title: s.title,
      slug: { _type: 'slug', current: s.slug },
      short: s.short,
      order: s.order,
      tagline: s.tagline,
      intro: s.intro,
      leadDays: s.leadDays,
      unit: s.unit,
      photo: asset(s.photo),
      gallery: s.gallery.map((g, i) => ({ _key: `g${i}`, ...asset(g) })),
      packages: s.packages.map((p) => ({
        _key: p.id,
        _type: 'servicePackage',
        name: p.name,
        price: p.price,
        unit: p.unit,
        minOrder: p.minOrder,
        note: p.note,
        variants: p.variants.map((v, i) => ({
          _key: `v${i}`,
          _type: 'menuVariant',
          name: v.name,
          extras: v.extras,
          groups: v.groups.map((g, k) => ({ _key: `g${k}`, _type: 'menuGroup', label: g.label, items: g.items })),
        })),
      })),
      choices: s.choices?.map((c, i) => ({ _key: `c${i}`, _type: 'menuGroup', ...c })),
      terms: s.terms,
    });
  }
  const catalog = buildCatalog(services, weddingCatering);
  presets.forEach((p, i) => {
    docs.push({
      _id: `preset-${p.id}`,
      _type: 'calculatorPreset',
      title: p.title,
      slug: { _type: 'slug', current: p.id },
      order: i + 1,
      description: p.description,
      guests: p.guests,
      guestWord: p.guestWord,
      items: p.items.map((it, k) => ({
        _key: `p${k}`,
        _type: 'presetItem',
        label: it.label,
        service: it.service,
        package: catalog.find((c) => c.slug === it.service)!.packages.find((x) => x.id === it.pkg)!.name,
        mode: it.mode,
        perGuest: it.perGuest ?? 1,
        fixed: it.fixed ?? 1,
      })),
    });
  });
  const out = join(root, 'studio/seed/aroma-langit.ndjson');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
  console.log(`Wrote ${docs.length} documents to ${out}`);
});
