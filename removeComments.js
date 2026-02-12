const fs = require('fs');
const path = require('path');

const rootDir = '.';
let totalFilesModified = 0;
let totalCommentsRemoved = 0;

function removeComments(content) {
  const originalLength = content.length;

  content = content.replace(/\/\*[\s\S]*?\*\);

  const lines = content.split('\n');
  const processedLines = lines.map(line => {

    let inString = false;
    let stringChar = '';
    let inTemplate = false;
    let result = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '`' && (i === 0 || line[i - 1] !== '\\')) {
        inTemplate = !inTemplate;
        result += char;
        continue;
      }

      if (inTemplate) {
        result += char;
        continue;
      }

      if ((char === '"' || char === "'" || char === '`') && (i === 0 || line[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        result += char;
        continue;
      }

      if (inString) {
        result += char;
        continue;
      }

      if (char === '/' && nextChar === '/') {
        break;
      }

      result += char;
    }

    return result.trimEnd();
  });

  content = processedLines.join('\n');

  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  const commentsRemoved = Math.floor((originalLength - content.length) / 50) || 1;
  return { content, commentsRemoved };
}

function processFile(filePath) {
  const ext = path.extname(filePath);

  if (!['.ts', '.tsx', '.js', '.mjs', '.prisma', '.scss', '.css'].includes(ext)) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    const result = removeComments(content);
    content = result.content;

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFilesModified++;
      totalCommentsRemoved += result.commentsRemoved;
      console.log(`✓ ${filePath} - ${result.commentsRemoved} comments removed`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {

      if (['.git', 'node_modules', '.next', '.vscode', 'dist', 'build'].includes(file)) {
        return;
      }

      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        processFile(filePath);
      }
    });
  } catch (error) {

  }
}

walkDir(rootDir);

console.log('\n=== Summary ===');
console.log(`Files modified: ${totalFilesModified}`);
console.log(`Comments removed (estimated): ${totalCommentsRemoved}`);
