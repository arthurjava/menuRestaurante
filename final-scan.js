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
const patterns = [
  { name: 'Empty flex containers', regex: /<div\s+class=\"[^\"]*flex\s+items-center\s+justify-center[^\"]*\"[^>]*>\s*<\/div>/g },
  { name: 'Empty span with aria-hidden', regex: /<span\s+[^>]*aria-hidden=\"true\"[^>]*>\s*<\/span>/g },
  { name: 'mat-icon references', regex: /mat-icon/gi },
  { name: 'MatIconModule', regex: /MatIconModule/g },
  { name: 'MatIconRegistry', regex: /MatIconRegistry/g },
  { name: 'fontIcon', regex: /fontIcon/gi },
  { name: 'svgIcon', regex: /svgIcon/gi },
  { name: 'material-icons', regex: /material-icons/gi },
  { name: 'material-symbols', regex: /material-symbols/gi },
];

for (const p of patterns) {
  let count = 0;
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8');
    const matches = content.match(p.regex);
    if (matches) {
      count += matches.length;
    }
  }
  console.log(p.name + ': ' + count);
}