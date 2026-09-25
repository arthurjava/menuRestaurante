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
const regex = /<div\s+class=\"[^\"]*flex\s+items-center\s+justify-center[^\"]*\"[^>]*>\s*<\/div>/g;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  const matches = content.match(regex);
  if (matches) {
    console.log('FILE:', f.replace('D:\\Projetos\\restaurante\\frontend\\', ''));
    matches.forEach(m => console.log('  MATCH:', m.substring(0, 200)));
  }
}