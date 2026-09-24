const fs = require('fs');
const path = require('path');

const SRC_DIR = 'D:\\Projetos\\restaurante\\frontend\\src';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  let changed = false;

  // Remove import line for MatIconModule
  content = content.replace(
    /import\s*\{[^}]*MatIconModule[^}]*\}\s*from\s*['"]@angular\/material\/icon['"];?\s*\n?/g,
    ''
  );

  // Remove MatIconModule from imports array
  content = content.replace(
    /\bMatIconModule\s*,?\s*/g,
    ''
  );

  // Clean up empty lines left by import removal
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Clean up trailing commas in imports array
  content = content.replace(/,\s*]/g, ']');
  content = content.replace(/,\s*}/g, '}');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    changed = true;
  }
  return changed;
}

function findFiles(dir) {
  let files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'playwright-report', 'test-results', '.git', 'e2e'].includes(entry.name)) {
          files = files.concat(findFiles(fullPath));
        }
      } else if (entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

const files = findFiles(SRC_DIR);
let count = 0;
for (const f of files) {
  if (processFile(f)) {
    count++;
    console.log('Removed MatIconModule from: ' + f.replace(SRC_DIR + '\\', ''));
  }
}
console.log('Total files updated: ' + count);