import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();
vi.mock('@sanity/client', () => ({ createClient: () => ({ fetch: fetchMock }) }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  fetchMock.mockReset();
});

describe('content loader', () => {
  it('uses bundled content when no Sanity project is configured', async () => {
    vi.stubEnv('SANITY_PROJECT_ID', '');
    const { getServices, getSite } = await import('../../src/lib/content');
    const services = await getServices();
    expect(services.map((s) => s.slug)).toContain('nasi-box');
    expect((await getSite()).csPhone).toBe('6285295535588');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps Sanity documents and keeps bundled values for anything missing', async () => {
    vi.stubEnv('SANITY_PROJECT_ID', 'abc123');
    fetchMock.mockImplementation(async (q: string) => {
      if (q.includes('siteSettings')) return { _id: 'siteSettings', csPhone: '6281111111111', email: null };
      return [
        {
          slug: 'nasi-box', title: 'Nasi Box', tagline: 'Baru', intro: null, leadDays: 2, unit: 'kotak', order: 1,
          photo: { alt: 'Foto', asset: { _id: 'image-abc-800x600-jpg', url: 'https://cdn.sanity.io/images/abc123/production/abc-800x600.jpg', metadata: { dimensions: { width: 800, height: 600 } } } },
          gallery: [
            { alt: 'Sama', asset: { _id: 'image-abc-800x600-jpg', url: 'https://cdn.sanity.io/images/abc123/production/abc-800x600.jpg' } },
            { alt: 'Lain', asset: { _id: 'image-def-800x600-jpg', url: 'https://cdn.sanity.io/images/abc123/production/def-800x600.jpg' } },
          ],
          packages: [{ id: 'hemat', name: 'Hemat', price: 25000, unit: null, minOrder: 0, variants: [{ name: 'Nusantara', groups: null }] }],
        },
        { slug: null, title: 'Draft tanpa slug' },
      ];
    });
    const { getServices, getSite } = await import('../../src/lib/content');
    const services = await getServices();
    expect(services).toHaveLength(1);
    const s = services[0];
    expect(s.tagline).toBe('Baru');
    expect(s.intro.length).toBeGreaterThan(20); // fell back to bundled intro
    expect(s.photo.kind).toBe('remote');
    expect(s.photo.kind === 'remote' && s.photo.width).toBe(800);
    expect(s.gallery[0]).toBe(s.photo); // same asset as the main photo, so pages can leave it out
    expect(s.gallery[1]).not.toBe(s.photo);
    expect(s.packages[0]).toMatchObject({ id: 'hemat', price: 25000, unit: 'kotak', minOrder: 1 });
    expect(s.packages[0].variants[0].groups).toEqual([]);
    const site = await getSite();
    expect(site.csPhone).toBe('6281111111111');
    expect(site.email).toBe('tanya@aromalangit.id');
    expect(site.depositRate).toBe(50);
    expect(site.settlementDays).toBe(1);
  });

  it('keeps the payment numbers from Sanity, and falls back when they are out of range', async () => {
    vi.stubEnv('SANITY_PROJECT_ID', 'abc123');
    fetchMock.mockImplementation(async (q: string) => (q.includes('siteSettings') ? { depositRate: 30, settlementDays: 2 } : null));
    let { getSite } = await import('../../src/lib/content');
    expect(await getSite()).toMatchObject({ depositRate: 30, settlementDays: 2 });

    vi.resetModules();
    fetchMock.mockImplementation(async (q: string) => (q.includes('siteSettings') ? { depositRate: 0, settlementDays: 1.5 } : null));
    ({ getSite } = await import('../../src/lib/content'));
    expect(await getSite()).toMatchObject({ depositRate: 50, settlementDays: 1 });
  });

  it('falls back entirely when Sanity returns nothing', async () => {
    vi.stubEnv('SANITY_PROJECT_ID', 'abc123');
    fetchMock.mockResolvedValue(null);
    const { getServices, getSite } = await import('../../src/lib/content');
    expect((await getServices()).length).toBe(6);
    expect((await getSite()).brand).toBe('Aroma Langit');
  });
});
