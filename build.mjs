// Inlines css/style.css and js/main.js into dist/editsoulstudio.html (one self-contained file).
// Usage: node build.mjs
import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const js = fs.readFileSync('js/main.js', 'utf8');
const out = html
  .replace('<link rel="stylesheet" href="css/style.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="js/main.js"></script>', () => `<script type="module">\n${js}\n</script>`);
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/editsoulstudio.html', out);
// A fragment version (no <html>/<head>/<body>) for hosts that wrap the page themselves.
const head = out.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*/g, '');
const body = out.match(/<body>([\s\S]*?)<\/body>/)[1];
fs.writeFileSync('dist/fragment.html', head + body);
console.log('dist/editsoulstudio.html', out.length, 'bytes');
