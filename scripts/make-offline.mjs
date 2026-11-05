// Turn a normal build into an offline package that opens by double-clicking
// index.html (file:// URLs, no server needed).
//
//   OFFLINE=true npx astro build --outDir dist-offline
//   node scripts/make-offline.mjs dist-offline
//
// Rewrites every root-absolute URL ("/_astro/…", "/en/work/") in HTML, CSS
// and JS to a path relative to the file, and points directory links at their
// index.html (file:// does not resolve folders to index.html).
// Browsers refuse ES-module scripts and preloaded fonts from file://, so each
// page's module scripts are bundled into one classic inline script at the end
// of <body>, and font preloads are dropped.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, dirname, posix, resolve } from 'node:path';
import { rolldown } from 'rolldown';

const root = process.argv[2] ?? 'dist-offline';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(root);

/** "/en/work/" seen from <fileDir> → "../en/work/index.html" */
function rel(url, fileDir) {
  const [pathPart, ...rest] = url.split(/(?=[?#])/);
  let target = pathPart;
  if (target.endsWith('/')) target += 'index.html';
  let out = posix.relative(fileDir, target.slice(1) || 'index.html') || 'index.html';
  if (!out.startsWith('.')) out = `./${out}`;
  return out + rest.join('');
}

for (const file of files) {
  if (!/\.(html|css|js)$/.test(file)) continue;
  const fileDir = relative(root, dirname(file)).split('\\').join('/') || '.';
  const fromDir = fileDir === '.' ? '' : fileDir;
  let src = readFileSync(file, 'utf8');
  const fix = (u) => rel(u, fromDir);

  const isHtml = file.endsWith('.html');
  if (!isHtml) {
    // CSS/JS: only CSS url() references (JS chunks import each other relatively).
    src = src.replace(/url\((['"]?)(\/(?!\/)[^)'"]+)\1\)/g, (_, q, u) => `url(${q}${fix(u)}${q})`);
    writeFileSync(file, src);
    continue;
  }

  // attributes: href="/…", src="/…", content="/…"
  src = src.replace(/(\b(?:href|src|action|poster)=["'])(\/(?!\/)[^"']*)/g, (_, a, u) => a + fix(u));
  // srcset="/a.avif 480w, /b.avif 800w"
  src = src.replace(/(\bsrcset=["'])([^"']*)/g, (_, a, list) =>
    a + list.replace(/(^|,\s*)(\/(?!\/)[^\s,]+)/g, (__, sep, u) => sep + fix(u)),
  );
  // CSS url(/…)
  src = src.replace(/url\((['"]?)(\/(?!\/)[^)'"]+)\1\)/g, (_, q, u) => `url(${q}${fix(u)}${q})`);
  // JSON / JS string values that are site paths ("href":"/en/…", "/_astro/…")
  src = src.replace(/(["'])(\/(?:_astro|fonts|en|work|shop|orbit|about|contact|cart|styleguide)(?:\/[^"']*)?)\1/g, (_, q, u) => q + fix(u) + q);

  writeFileSync(file, src);
}
/* Bundle module scripts into inline classic scripts (cached per entry set). */
const cache = new Map();
async function bundle(entries) {
  const key = entries.join('|');
  if (cache.has(key)) return cache.get(key);
  const code = entries.map((e) => `import ${JSON.stringify(e)};`).join('\n');
  const virtual = resolve(root, '__offline_entry__.js');
  const build = await rolldown({
    input: virtual,
    logLevel: 'silent',
    transform: { define: { 'import.meta.url': 'location.href', 'import.meta.env': '{}' } },
    plugins: [{
      name: 'offline-entry',
      resolveId: (id) => (id === virtual ? id : null),
      load: (id) => (id === virtual ? code : null),
    }],
  });
  const { output } = await build.generate({ format: 'iife', codeSplitting: false });
  const out = output[0].code.replace(/<\/script/gi, '<\\/script');
  cache.set(key, out);
  return out;
}

for (const file of files.filter((f) => f.endsWith('.html'))) {
  let html = readFileSync(file, 'utf8');
  const dir = dirname(file);
  const entries = [];
  html = html.replace(/<script type="module" src="([^"]+)"><\/script>/g, (_, src) => {
    entries.push(resolve(dir, src));
    return '';
  });
  html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
  html = html.replace(/<link rel="preload" as="font"[^>]*>/g, '');
  if (entries.length) {
    const js = await bundle(entries);
    html = html.replace('</body>', `<script>${js}</script></body>`);
  }
  writeFileSync(file, html);
}

console.log(`offline: rewrote ${files.length} files in ${root}`);
