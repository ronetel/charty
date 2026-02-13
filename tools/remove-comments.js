const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', '.next', 'dist', 'build', 'out'];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.scss', '.html', '.md', '.prisma']);

let modified = 0;
let checked = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE.includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (!EXT.has(ext)) continue;
      processFile(full);
    }
  }
}

function processFile(filePath) {
  checked++;
  let src = fs.readFileSync(filePath, 'utf8');
  let original = src;

  // Protect URLs
  src = src.replace(/https?:\/\//g, match => match.replace(/\//g, '__SLASH__'));

  // Remove JSX block comments {/* ... */}
  src = src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // Remove C-style block comments /* ... */
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove line comments // ... (at line end)
  src = src.replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '\n');

  // Remove HTML comments <!-- ... -->
  src = src.replace(/<!--([\s\S]*?)-->/g, '');

  // Restore URLs
  src = src.replace(/__SLASH__/g, '/');

  // Trim trailing spaces on blank lines
  src = src.split('\n').map(l => l.replace(/[ \t]+$/g, '')).join('\n');

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8');
    modified++;
    console.log('Updated:', path.relative(ROOT, filePath));
  }
}

console.log('Starting comment removal from', ROOT);
walk(ROOT);
console.log('\nChecked files:', checked);
console.log('Modified files:', modified);

if (modified === 0) process.exit(0);
process.exit(0);
