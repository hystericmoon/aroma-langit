// Which copy of the site this build is for, chosen at build time with SITE_ENV.
//   production (default): aromalangit.id, open to every crawler.
//   staging: new.aromalangit.id, closed to crawlers except Claude-User, and noindex on every page.
export type SiteEnv = 'production' | 'staging';

export function parseSiteEnv(value: string | undefined): SiteEnv {
  const v = (value ?? '').trim().toLowerCase();
  if (v === '' || v === 'production') return 'production';
  if (v === 'staging') return 'staging';
  // A typo must not quietly produce an indexable staging site.
  throw new Error(`SITE_ENV must be "production" or "staging", got "${value}"`);
}

export const siteEnv: SiteEnv = parseSiteEnv(import.meta.env.SITE_ENV as string | undefined);
export const isStaging = siteEnv === 'staging';

export function robotsTxt(env: SiteEnv, site: URL | string = 'https://aromalangit.id/'): string {
  if (env === 'staging') {
    return ['User-agent: Claude-User', 'Allow: /', '', 'User-agent: *', 'Disallow: /', ''].join('\n');
  }
  return ['User-agent: *', 'Allow: /', `Sitemap: ${new URL('/sitemap-index.xml', site).href}`, ''].join('\n');
}
