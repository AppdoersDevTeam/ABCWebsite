import fs from 'node:fs';
import path from 'node:path';

const root = 'pages/public';
const files = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) files.push(full);
  }
}

walk(root);

const styleRe =
  /\s*style=\{\{\s*fontFamily:\s*'Kaushan Script',\s*fontSize:\s*'(?:4\.25rem|clamp\([^']+\))',\s*lineHeight:\s*(?:'1\.2'|1\.15)\s*\}\}/g;
const classFrom =
  'className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250"';
const classTo =
  'className="hero-title text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250"';

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  if (!source.includes('Kaushan Script')) continue;
  const next = source.replace(styleRe, '').replaceAll(classFrom, classTo);
  if (next !== source) {
    fs.writeFileSync(file, next);
    console.log(file);
  }
}
