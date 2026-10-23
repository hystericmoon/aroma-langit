// Packages dist/ for Apache / LiteSpeed shared hosting (cPanel).
//   node scripts/package-hosting.mjs            → hosting/aroma-langit.zip (live site)
//   node scripts/package-hosting.mjs --staging  → hosting/aroma-langit-staging.zip (noindex, for a test subdomain)
// Run `npm run build` first. Upload the zip into the domain's document root and extract it there.
import { cpSync, rmSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const staging = process.argv.includes('--staging');
const out = 'hosting';
const root = join(out, staging ? 'aroma-langit-staging' : 'aroma-langit');
const zip = `${root}.zip`;

if (!existsSync('dist/index.html')) {
  console.error('dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

mkdirSync(out, { recursive: true });
rmSync(root, { recursive: true, force: true });
rmSync(zip, { force: true });
cpSync('dist', root, { recursive: true });

// Cloudflare-only files; public/.htaccess carries the same rules for Apache.
rmSync(join(root, '_redirects'), { force: true });
rmSync(join(root, '_headers'), { force: true });

// Astro's hashed assets never change under the same name.
writeFileSync(
  join(root, '_astro', '.htaccess'),
  '<IfModule mod_headers.c>\n  Header set Cache-Control "public, max-age=31536000, immutable"\n</IfModule>\n',
);

if (staging) {
  // Keep the test copy out of search results.
  writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  appendFileSync(
    join(root, '.htaccess'),
    '\n# Staging copy: never index\n<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n',
  );
}

try {
  execFileSync('zip', ['-qr', '-X', '../' + (staging ? 'aroma-langit-staging.zip' : 'aroma-langit.zip'), '.'], { cwd: root });
  console.log(`Ready: ${zip}`);
} catch {
  console.log(`Ready: ${root}/ (zip its contents, including the hidden .htaccess files)`);
}
