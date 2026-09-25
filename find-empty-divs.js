const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  let files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'playwright-report', 'test-results', '.git'].includes(entry.name)) {
          files = files.concat(findFiles(fullPath));
        }
      } else if (entry.name.endsWith('.html') || entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

const files = findFiles('D:\\Projetos\\restaurante\\frontend\\src');
let totalFound = 0;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  // Look for empty divs that might have had mat-icon
  const regex = /<div\s+class=\"[^\"]*(?:h-\d+\s+w-\d+|w-\d+\s+h-\d+)[^\"]*(?:bg-[^\s\"]+)[^\"]*(?:rounded-(?:lg|xl|full|md))?[^\"]*flex\s+items-center\s+justify-center[^\"]*\"[^>]*>\s*<\/div>/g;
  const matches = content.match(regex);
  if (matches) {
    console.log('FILE:', f.replace('D:\\Projetos\\restaurante\\frontend\\', ''));
    matches.forEach(m => console.log('  MATCH:', m.substring(0, 200)));
    totalFound += matches.length;
  }
}

console.log('\nTotal empty divs found:', totalFound);