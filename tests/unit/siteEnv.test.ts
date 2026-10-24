import { describe, expect, it } from 'vitest';
import { parseSiteEnv, robotsTxt } from '../../src/lib/siteEnv';

describe('site environment', () => {
  it('defaults to production and rejects typos', () => {
    expect(parseSiteEnv(undefined)).toBe('production');
    expect(parseSiteEnv('')).toBe('production');
    expect(parseSiteEnv('Staging')).toBe('staging');
    expect(() => parseSiteEnv('stage')).toThrow(/SITE_ENV/);
  });

  it('opens production to every crawler and points at the sitemap', () => {
    expect(robotsTxt('production')).toBe('User-agent: *\nAllow: /\nSitemap: https://aromalangit.id/sitemap-index.xml\n');
  });

  it('closes staging to every crawler except Claude-User', () => {
    expect(robotsTxt('staging')).toBe('User-agent: Claude-User\nAllow: /\n\nUser-agent: *\nDisallow: /\n');
  });
});
