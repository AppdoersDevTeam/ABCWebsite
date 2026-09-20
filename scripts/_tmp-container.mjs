import fs from 'node:fs';
import path from 'node:path';

const root = 'pages/public';

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) {
      let source = fs.readFileSync(full, 'utf8');
      const next = source
        .replaceAll('container relative z-10 px-4 mx-auto', 'page-container relative z-10')
        .replaceAll('container relative z-10 px-4 sm:px-6 mx-auto', 'page-container relative z-10');
      if (next !== source) {
        fs.writeFileSync(full, next);
        console.log(full);
      }
    }
  }
}

walk(root);
