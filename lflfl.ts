
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve('.');
const OUTPUT_FILE = path.join(ROOT, 'project_summary_for_ai.txt');

const IMPORTANT_PATHS = [
  'package.json',
  'prisma/schema.prisma',
  'prisma.config.ts',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  '.env.example',
  'app/layout.tsx',
  'app/api',
  'lib/prisma.ts',
  'lib/jwt.ts',
  'src/app/layout.tsx',
];

function readFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(ROOT, fullPath);

    if (
      relPath.includes('node_modules') ||
      relPath.includes('.next') ||
      relPath.endsWith('.log') ||
      relPath.startsWith('.') && !relPath.startsWith('./')
    ) continue;

    if (fs.statSync(fullPath).isDirectory()) {
      readFiles(fullPath, fileList);
    } else {
      fileList.push(relPath);
    }
  }
  return fileList;
}

function main() {
  let output = '';

  for (const p of IMPORTANT_PATHS) {
    const fullPath = path.join(ROOT, p);
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        const files = readFiles(fullPath);
        for (const f of files) {
          try {
            const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
            output += `\n=== ${f} ===\n${content}\n`;
          } catch (e) {}
        }
      } else {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          output += `\n=== ${p} ===\n${content}\n`;
        } catch (e) {}
      }
    }
  }

  const allFiles = readFiles(ROOT);
  output += `\n\n=== PROJECT STRUCTURE ===\n${allFiles.sort().join('\n')}`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✅ Проект проанализирован. Результат: ${OUTPUT_FILE}`);
}

main();