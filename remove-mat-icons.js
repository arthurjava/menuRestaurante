const fs = require('fs');
const path = require('path');

const SRC_DIR = 'D:\\Projetos\\restaurante\\frontend\\src';

// Unicode replacements for functional icon-only buttons (following codebase precedent: admin-header uses ✕ ☰ ▸ ◂ 🔔 ⚙ 👤 ⤴)
const ICON_REPLACEMENTS = {
  // Navigation/chevrons
  'chevron_left': '\u2039',
  'chevron_right': '\u203A',
  'expand_more': '\u25BE',
  'expand_less': '\u25B4',
  'first_page': '\u00AB',
  'last_page': '\u00BB',

  // Actions
  'close': '\u2715',
  'fullscreen': '\u26F6',
  'drag_indicator': '\u22EE',

  // Status
  'check_circle': '\u2713',
  'error': '\u2715',
  'warning': '\u26A0',
  'info': '\u2139',
  'trending_up': '\u2191',
  'trending_down': '\u2193',

  // UI
  'search': '\uD83D\uDD0D',
  'filter_list': '\u2630',
  'filter_alt_off': '\u2715',
  'add': '+',
  'delete': '\u2715',
  'content_copy': '\u24CE',
  'star': '\u2605',
  'star_outline': '\u2606',
  'person': '\uD83D\uDC64',
  'person_add': '\uD83D\uDC64+',
  'login': '\u2192',
  'logout': '\u2934',
  'settings': '\u2699',
  'restaurant': '\uD83C\uDF7D',
  'restaurant_menu': '\uD83C\uDF7D',
  'category': '\uD83D\uDCC1',
  'photo_library': '\uD83D\uDDBC',
  'cloud_upload': '\u2601\u2191',
  'inbox': '\uD83D\uDCE5',
  'email': '\u2709',
  'phone': '\uD83D\uDCDF',
  'location_on': '\uD83D\uDCCD',
  'key': '\uD83D\uDD11',
  'dashboard': '\uD83D\uDCCA',
  'people': '\uD83D\uDC65',
  'menu_book': '\uD83D\uDCD6',
  'history': '\uD83D\uDD50',
  'access_time': '\uD83D\uDD50',
  'schedule': '\uD83D\uDD50',
  'edit': '\u270E',
  'archive': '\uD83D\uDCE6',
  'cancel': '\u2715',
  'add_shopping_cart': '\uD83D\uDED2+',
};

// Files to process
const TEMPLATE_EXTENSIONS = ['.html', '.ts']; // inline templates in .ts

// Check if a mat-icon is icon-only (functional button) vs decorative/inline
function shouldReplaceWithUnicode(match, fullContent, startIndex) {
  // Get context before and after
  const before = fullContent.substring(Math.max(0, startIndex - 200), startIndex);
  const after = fullContent.substring(startIndex + match.length, startIndex + match.length + 200);

  // Check if inside a button with aria-label or matTooltip (functional icon-only)
  const inIconButton = /<button[^>]*mat-icon-button|<button[^>]*matTooltip|<button[^>]*aria-label/.test(before.slice(-150)) ||
                       /<button[^>]*matTooltip|<button[^>]*aria-label/.test(after.slice(0, 150));

  // Check if mat-icon is the ONLY content of its parent (button, a, div with flex)
  const parentTagMatch = before.match(/<(\w+)[^>]*>\s*$/);
  if (parentTagMatch) {
    const parentTag = parentTagMatch[1];
    // If parent is button/a and icon is sole child, it's icon-only
    if (['button', 'a'].includes(parentTag) && !before.match(/>\s*\S/)) {
      return true;
    }
  }

  return inIconButton;
}

function processTemplate(content, filePath) {
  let result = content;
  let changes = 0;

  // Pattern 1: <mat-icon ...>content</mat-icon> (possibly multi-line)
  // Also handles </mat-icon\n> (split closing tag)
  const pattern1 = /<mat-icon\b([\s\S]*?)<\/mat-icon\s*>/gi;

  // Pattern 2: Self-closing <mat-icon ... />
  const pattern2 = /<mat-icon\b[^>]*\/>/gi;

  function replaceMatIcon(match, innerContent) {
    changes++;

    // Extract icon name from content or fontIcon/svgIcon attribute
    let iconName = '';
    if (innerContent) {
      // Content between tags: {{ icon }} or static text
      const textMatch = innerContent.match(/>\s*([^<{}\s]+)\s*</) || innerContent.match(/>\s*([^<{}\s]+)\s*$/);
      if (textMatch) iconName = textMatch[1].trim();
      else {
        // Try {{ expression }}
        const interpMatch = innerContent.match(/\{\{\s*([^}]+)\s*\}\}/);
        if (interpMatch) iconName = interpMatch[1].trim();
      }
    }

    // Also check attributes for fontIcon or [fontIcon]
    const fontIconMatch = match.match(/fontIcon\s*=\s*["']([^"']+)["']/i) ||
                          match.match(/\[fontIcon\]\s*=\s*["']([^"']+)["']/i) ||
                          match.match(/fontIcon\s*=\s*([^\s>]+)/i);
    if (fontIconMatch) iconName = fontIconMatch[1];

    // Check svgIcon
    const svgIconMatch = match.match(/svgIcon\s*=\s*["']([^"']+)["']/i) ||
                         match.match(/\[svgIcon\]\s*=\s*["']([^"']+)["']/i);
    if (svgIconMatch) iconName = svgIconMatch[1];

    // Check if icon-only functional (has aria-label, matTooltip, or sole child of button)
    const isIconOnlyFunctional = shouldReplaceWithUnicode(match, result, result.indexOf(match));

    // Get class attribute for potential styling
    const classMatch = match.match(/class\s*=\s*["']([^"']*)["']/i);
    const classes = classMatch ? classMatch[1] : '';

    // Determine replacement
    let replacement = '';
    if (iconName && ICON_REPLACEMENTS[iconName]) {
      replacement = ICON_REPLACEMENTS[iconName];
    } else if (iconName) {
      // Unknown icon - use first char or generic
      replacement = '\u2022';
    } else {
      // Dynamic icon - use generic
      replacement = '\u2022';
    }

    if (isIconOnlyFunctional) {
      // Wrap in span with classes for styling
      const classAttr = classes ? ' class="' + classes.replace(/text-\w+-\d+/g, '').trim() + '"' : '';
      return '<span' + classAttr + ' aria-hidden="true">' + replacement + '</span>';
    } else {
      // Decorative/inline - remove entirely but preserve whitespace context
      return '';
    }
  }

  // Apply replacements
  result = result.replace(pattern1, (match, inner) => replaceMatIcon(match, inner));
  result = result.replace(pattern2, (match) => replaceMatIcon(match, ''));

  // Post-process: clean up empty lines left by removals
  const lines = result.split('\n');
  const cleanedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '') {
      const prev = i > 0 ? lines[i-1].trim() : '';
      const next = i < lines.length-1 ? lines[i+1].trim() : '';
      if (prev.endsWith('>') && next.startsWith('<')) {
      } else if (prev === '' && next === '') {
        continue;
      } else {
        continue;
      }
    }
    cleanedLines.push(line);
  }
  result = cleanedLines.join('\n');

  return { content: result, changes };
}

// Find all template files
function findFiles(dir, extensions) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'playwright-report', 'test-results', '.git', 'e2e'].includes(entry.name)) {
        files = files.concat(findFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

console.log('Finding template files...');
const templateFiles = findFiles(SRC_DIR, TEMPLATE_EXTENSIONS);
console.log('Found ' + templateFiles.length + ' template files');

let totalChanges = 0;
const modifiedFiles = [];

for (const file of templateFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('<mat-icon') || content.includes('mat-icon')) {
    const processed = processTemplate(content, file);
    if (processed.changes > 0) {
      fs.writeFileSync(file, processed.content, 'utf-8');
      modifiedFiles.push({ file: file.replace(SRC_DIR + '\\', ''), changes: processed.changes });
      totalChanges += processed.changes;
      console.log('  \u2713 ' + file.replace(SRC_DIR + '\\', '') + ' (' + processed.changes + ' icons)');
    }
  }
}

console.log('\nTotal: ' + totalChanges + ' mat-icon occurrences removed from ' + modifiedFiles.length + ' files');

fs.writeFileSync(
  'D:\\Projetos\\restaurante\\modified-templates.json',
  JSON.stringify(modifiedFiles, null, 2)
);