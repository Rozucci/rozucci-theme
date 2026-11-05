// Copy the self-hosted font files from Fontsource packages into public/fonts.
// Run with `npm run fonts` after changing font packages. Output is committed.
// All @font-face rules live in src/styles/fonts.css — keep the two in sync.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = join(root, 'node_modules');
const out = join(root, 'public', 'fonts');

/** family folder → [package, files[]] */
const FONTS = {
  'instrument-serif': ['@fontsource/instrument-serif', [
    'instrument-serif-latin-400-normal.woff2',
    'instrument-serif-latin-400-italic.woff2',
  ]],
  inter: ['@fontsource-variable/inter', [
    'inter-latin-wght-normal.woff2',
  ]],
  'roboto-mono': ['@fontsource-variable/roboto-mono', [
    'roboto-mono-latin-wght-normal.woff2',
  ]],
  vazirmatn: ['@fontsource-variable/vazirmatn', [
    'vazirmatn-arabic-wght-normal.woff2',
    'vazirmatn-latin-wght-normal.woff2',
  ]],
};

for (const [family, [pkg, files]] of Object.entries(FONTS)) {
  const dest = join(out, family);
  mkdirSync(dest, { recursive: true });
  for (const file of files) {
    copyFileSync(join(nm, pkg, 'files', file), join(dest, file));
  }
  const license = join(nm, pkg, 'LICENSE');
  if (existsSync(license)) copyFileSync(license, join(dest, 'LICENSE'));
  console.log(`fonts: ${family} (${files.length} files)`);
}
