// Packages dist/ for Apache / LiteSpeed shared hosting (cPanel).
//   npm run package:hosting          → hosting/aroma-langit.zip (live site, public_html)
//   npm run package:hosting:staging  → hosting/aroma-langit-staging.zip (noindex, for new.aromalangit.id)
// Upload the zip into the domain's document root and extract it there.
import { cpSync, rmSync, writeFileSync, appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
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

// robots.txt comes from the build (SITE_ENV). Refuse to package a build for the other site:
// a staging build in public_html would hide the live site from search engines.
const builtForStaging = readFileSync('dist/robots.txt', 'utf8').includes('Disallow: /');
if (builtForStaging !== staging) {
  console.error(
    staging
      ? 'dist/ is a production build. Use `npm run package:hosting:staging` for new.aromalangit.id.'
      : 'dist/ is a staging build and must never go to aromalangit.id. Use `npm run package:hosting`.',
  );
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
  // Keep the test copy out of search results. robots.txt and the noindex meta tag come from
  // the staging build; this header covers files the meta tag can't (PDFs, images).
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
