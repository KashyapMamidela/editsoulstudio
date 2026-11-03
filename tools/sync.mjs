// Copies the shared head, header and footer (partials/) into every page between marker comments.
// Pages stay plain HTML and work without this; it only keeps the shared parts identical.
// Usage: node tools/sync.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(root, 'partials', f), 'utf8').trim();
const logo = read('logo.svg');
const parts = { head: read('head.html'), header: read('header.html'), footer: read('footer.html') };

const pages = ['index.html', ...fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'index.html')))
  .map(d => `${d.name}/index.html`)];

for (const page of pages) {
  const file = path.join(root, page);
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<!-- header:start -->')) continue;
  const rel = page.includes('/') ? '../' : '';
  const current = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1];
  for (const [name, src] of Object.entries(parts)) {
    let out = src.replaceAll('{{logo}}', logo).replaceAll('{{root}}', rel || './');
    if (name === 'header' && current) out = out.replace(`data-nav="${current}"`, `data-nav="${current}" aria-current="page"`);
    html = html.replace(new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`), `<!-- ${name}:start -->\n${out}\n<!-- ${name}:end -->`);
  }
  fs.writeFileSync(file, html);
  console.log('synced', page);
}
