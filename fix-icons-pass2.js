const fs = require('fs');
const path = require('path');

const SRC_DIR = 'D:\\Projetos\\restaurante\\frontend\\src';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  let changed = false;

  // Fix 1: Empty pagination buttons - add unicode symbols
  // Pattern: button with matTooltip/aria-label but empty content
  content = content.replace(
    /(<button[^>]*matTooltip="Primeira p[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u00AB</span></button>'
  );
  content = content.replace(
    /(<button[^>]*matTooltip="[Pp]r[oó]xima p[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u203A</span></button>'
  );
  content = content.replace(
    /(<button[^>]*matTooltip="[Pp][aá]gina anterior[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2039</span></button>'
  );
  content = content.replace(
    /(<button[^>]*matTooltip="[Uu]ltima p[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u00BB</span></button>'
  );

  // Fix 2: Empty modal close buttons (aria-label="Fechar")
  content = content.replace(
    /(<button[^>]*aria-label="Fechar[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2715</span></button>'
  );
  content = content.replace(
    /(<button[^>]*aria-label="Fechar modal[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2715</span></button>'
  );

  // Fix 3: Empty gallery nav buttons (aria-label="Imagem anterior"/"Pr[oó]xima imagem"/"Fechar"/"Ver em tela cheia")
  content = content.replace(
    /(<button[^>]*aria-label="Imagem anterior[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2039</span></button>'
  );
  content = content.replace(
    /(<button[^>]*aria-label="Pr[oó]xima imagem[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u203A</span></button>'
  );
  content = content.replace(
    /(<button[^>]*aria-label="Fechar[^>]*matTooltip="Ver em tela cheia[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2715</span></button>'
  );
  content = content.replace(
    /(<button[^>]*aria-label="Ver em tela cheia[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u26F6</span></button>'
  );

  // Fix 4: Empty reorder drag handle buttons
  content = content.replace(
    /(<button[^>]*cdkDragHandle[^>]*aria-label="Arrastar para reordenar[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u22EE</span></button>'
  );

  // Fix 5: Empty star buttons in image upload (aria-label="Definir como principal"/"Imagem principal"/"Remover")
  content = content.replace(
    /(<button[^>]*aria-label="Definir como principal[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2605</span></button>'
  );
  content = content.replace(
    /(<button[^>]*matTooltip="Imagem principal"[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2605</span></button>'
  );
  content = content.replace(
    /(<button[^>]*aria-label="Remover( imagem)?"[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2715</span></button>'
  );

  // Fix 6: Empty brand-icon divs (colored squares that contained icons)
  // Pattern: <div class="brand-icon ..."><div> with only whitespace inside
  content = content.replace(
    /<div class="brand-icon[^>]*>\s*<\/div>/g,
    ''
  );
  // Also sidebar brand-icon
  content = content.replace(
    /<div class="brand-icon[^>]*>\s*<\/div>\s*\n\s*@if/,
    '@if'
  );

  // Fix 7: Empty modal-icon divs (circular containers that held header icons)
  content = content.replace(
    /<div class="modal-icon[^>]*>\s*<\/div>/g,
    ''
  );

  // Fix 8: Empty upload-placeholder mat-icon (cloud_upload) - keep the placeholder div but remove the empty icon line
  content = content.replace(
    /<div class="upload-placeholder[^>]*>\s*<div[^>]*>\s*<\/div>\s*<p/,
    (m) => m.replace(/<div[^>]*>\s*<\/div>\s*/, '')
  );

  // Fix 9: Empty empty-gallery mat-icon (photo_library)
  content = content.replace(
    /<div class="empty-gallery[^>]*>\s*<div[^>]*>\s*<\/div>\s*<p/,
    (m) => m.replace(/<div[^>]*>\s*<\/div>\s*/, '')
  );

  // Fix 10: Empty status-icon spans (in status-badge)
  content = content.replace(
    /<mat-icon class="status-icon"[^>]*>\s*<\/mat-icon>/g,
    ''
  );

  // Fix 11: Clean up empty class="" attributes
  content = content.replace(/class=""\s*/g, '');
  content = content.replace(/class="\s+"/g, '');
  content = content.replace(/class="\s+([^"]*)"/g, 'class="$1"');

  // Fix 12: Remove lines that are just empty spans with aria-hidden (leftover from pattern)
  content = content.replace(/<span aria-hidden="true"><\/span>/g, '');

  // Fix 13: Filter bar search icon - the input had pl-10 for the absolute icon, now icon gone
  // The icon was: <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</mat-icon>
  // Input has: class="input w-full pl-10 pr-4 py-2"
  // Need to remove pl-10 from the input
  content = content.replace(
    /(<input[^>]*class="input w-full) pl-10( pr-4 py-2[^>]*>)/g,
    '$1$2'
  );
  content = content.replace(
    /(<input[^>]*class="input w-full) pl-10( pr-4[^>]*>)/g,
    '$1$2'
  );

  // Fix 14: Categories/Dishes/Users list search inputs with matPrefix - mat-icon matPrefix is gone, input is fine
  // matPrefix on mat-icon is removed with the icon, no CSS change needed

  // Fix 15: Toast close button (matTooltip="Fechar notifica[^>]*")
  content = content.replace(
    /(<button[^>]*aria-label="Fechar notifica[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2715</span></button>'
  );

  // Fix 16: Notification component close button
  content = content.replace(
    /(<button[^>]*aria-label="Fechar notifica[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2715</span></button>'
  );

  // Fix 17: Form section error icons (error_outline) - these are inline with text, just remove
  // Already handled by first pass

  // Fix 18: Image upload field - star/close/drag_indicator buttons in image previews
  // These have aria-label/matTooltip - already targeted above

  // Fix 19: Menu component - photo_library button (aria-label="Ver todas as imagens")
  content = content.replace(
    /(<button[^>]*aria-label="Ver todas as imagens[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\uD83D\uDDBC</span></button>'
  );

  // Fix 20: Settings avatar placeholder (person icon) - decorative, empty div fine
  // But it's inside a div that's an avatar container - remove empty icon div
  content = content.replace(
    /<div class="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center">\s*<\/div>/g,
    '<div class="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center"><span aria-hidden="true">\uD83D\uDC64</span></div>'
  );

  // Fix 21: Dashboard activity icons (person, access_time) - tiny text icons inline
  // These are inline with text, leave as unicode in span
  content = content.replace(
    /<mat-icon class="text-\[10px\]">person<\/mat-icon>/g,
    '<span aria-hidden="true">\uD83D\uDC64</span>'
  );
  content = content.replace(
    /<mat-icon class="text-\[10px\]">access_time<\/mat-icon>/g,
    '<span aria-hidden="true">\uD83D\uDD50</span>'
  );

  // Fix 22: Menu component phone/email/location_on icons in footer - inline with text
  content = content.replace(
    /<mat-icon class="text-sm">phone<\/mat-icon>/g,
    '<span aria-hidden="true">\uD83D\uDCDE</span>'
  );
  content = content.replace(
    /<mat-icon class="text-sm">email<\/mat-icon>/g,
    '<span aria-hidden="true">\u2709</span>'
  );
  content = content.replace(
    /<mat-icon class="text-sm mt-0\.5">location_on<\/mat-icon>/g,
    '<span aria-hidden="true">\uD83D\uDCCD</span>'
  );

  // Fix 23: Dashboard stat card trend icons (trending_up/trending_down)
  content = content.replace(
    /<mat-icon class="inline align-middle text-xs">trending_up<\/mat-icon>/g,
    '<span aria-hidden="true">\u2191</span>'
  );
  content = content.replace(
    /<mat-icon class="inline align-middle text-xs">trending_down<\/mat-icon>/g,
    '<span aria-hidden="true">\u2193</span>'
  );

  // Fix 24: Menu category icon (category) - decorative in h-10 w-10 container
  content = content.replace(
    /<div class="h-10 w-10 bg-brand-primary-subtle rounded-lg flex items-center justify-center">\s*<\/div>/g,
    '<div class="h-10 w-10 bg-brand-primary-subtle rounded-lg flex items-center justify-center"><span aria-hidden="true">\uD83D\uDCC1</span></div>'
  );

  // Fix 25: Menu empty state restaurant_menu icon - decorative large
  content = content.replace(
    /<mat-icon class="text-6xl text-text-tertiary mb-4">restaurant_menu<\/mat-icon>/g,
    '<span class="text-6xl text-text-tertiary mb-4" aria-hidden="true">\uD83C\uDF7D</span>'
  );
  content = content.replace(
    /<mat-icon class="text-4xl text-text-tertiary">restaurant<\/mat-icon>/g,
    '<span class="text-4xl text-text-tertiary" aria-hidden="true">\uD83C\uDF7D</span>'
  );
  content = content.replace(
    /<mat-icon class="text-text-tertiary">photo_library<\/mat-icon>/g,
    '<span class="text-text-tertiary" aria-hidden="true">\uD83D\uDDBC</span>'
  );

  // Fix 26: Image gallery empty state photo_library
  content = content.replace(
    /<mat-icon class="text-4xl text-gray-300">photo_library<\/mat-icon>/g,
    '<span class="text-4xl text-gray-300" aria-hidden="true">\uD83D\uDDBC</span>'
  );

  // Fix 27: Image gallery fullscreen button (fullscreen icon)
  content = content.replace(
    /(<button[^>]*class="fullscreen-btn"[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u26F6</span></button>'
  );

  // Fix 28: Image upload component - star/delete buttons in overlay
  content = content.replace(
    /(<button[^>]*matTooltip="Definir como principal"[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2605</span></button>'
  );
  content = content.replace(
    /(<button[^>]*matTooltip="Imagem principal"[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2605</span></button>'
  );
  content = content.replace(
    /(<button[^>]*matTooltip="Remover"[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u2715</span></button>'
  );

  // Fix 29: Reorder modal empty state (inbox/drag_indicator) - decorative
  content = content.replace(
    /<mat-icon class="text-4xl mb-2">inbox<\/mat-icon>/g,
    '<span class="text-4xl mb-2" aria-hidden="true">\uD83D\uDCE5</span>'
  );
  content = content.replace(
    /<mat-icon class="text-3xl mb-2">drag_indicator<\/mat-icon>/g,
    '<span class="text-3xl mb-2" aria-hidden="true">\u22EE</span>'
  );

  // Fix 30: Reorder modal drag handle buttons
  content = content.replace(
    /(<button[^>]*cdkDragHandle[^>]*>\s*)<\/button>/g,
    '$1<span aria-hidden="true">\u22EE</span></button>'
  );

  // Fix 31: Category modal header icon (category)
  content = content.replace(
    /<mat-icon class="text-indigo-600">category<\/mat-icon>/g,
    '<span class="text-indigo-600" aria-hidden="true">\uD83D\uDCC1</span>'
  );

  // Fix 32: Dish modal header icon (restaurant_menu)
  content = content.replace(
    /<mat-icon class="text-indigo-600">restaurant_menu<\/mat-icon>/g,
    '<span class="text-indigo-600" aria-hidden="true">\uD83C\uDF7D</span>'
  );

  // Fix 33: User modal header icon (person)
  content = content.replace(
    /<mat-icon class="text-indigo-600">person<\/mat-icon>/g,
    '<span class="text-indigo-600" aria-hidden="true">\uD83D\uDC64</span>'
  );

  // Fix 34: Dashboard quick action buttons (icon="...") - these are app-button with dead icon attr, no template change needed

  // Fix 35: Empty state action icon (actionIcon) - inline in button
  content = content.replace(
    /<mat-icon class="mr-2">\s*\{\{\s*actionIcon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="mr-2" aria-hidden="true">\u2022</span>'
  );

  // Fix 36: Stat card action icons
  content = content.replace(
    /<mat-icon class="mr-1\.5 text-sm">\s*\{\{\s*action\.icon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="mr-1.5 text-sm" aria-hidden="true">\u2022</span>'
  );

  // Fix 37: Filter bar expand_more/expand_less toggle button
  content = content.replace(
    /<mat-icon>\s*\{\{\s*isExpanded\(\)\s*\?\s*'expand_less'\s*:\s*'expand_more'\s*\}\}\s*<\/mat-icon>/g,
    '<span aria-hidden="true">\u25B4</span>'
  );

  // Fix 38: Filter bar filter_alt_off icon in clear button
  content = content.replace(
    /<mat-icon class="mr-1\.5 text-sm">filter_alt_off<\/mat-icon>/g,
    '<span class="mr-1.5 text-sm" aria-hidden="true">\u2715</span>'
  );

  // Fix 39: Toast icons (check_circle, error, warning, info) - these are state indicators
  content = content.replace(
    /<mat-icon class="text-xl">\s*\{\{\s*getTypeConfig\(toast\.type\)\.icon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="text-xl" aria-hidden="true">\u2713</span>'
  );
  // More specific for each type would need runtime - use generic check
  content = content.replace(
    /<mat-icon class="text-xl">check_circle<\/mat-icon>/g,
    '<span class="text-xl" aria-hidden="true">\u2713</span>'
  );
  content = content.replace(
    /<mat-icon class="text-xl">error<\/mat-icon>/g,
    '<span class="text-xl" aria-hidden="true">\u2715</span>'
  );
  content = content.replace(
    /<mat-icon class="text-xl">warning<\/mat-icon>/g,
    '<span class="text-xl" aria-hidden="true">\u26A0</span>'
  );
  content = content.replace(
    /<mat-icon class="text-xl">info<\/mat-icon>/g,
    '<span class="text-xl" aria-hidden="true">\u2139</span>'
  );

  // Fix 40: Notification icons (check_circle, error, warning, info)
  content = content.replace(
    /<mat-icon class="text-current shrink-0">\s*\{\{\s*getIcon\(notification\.type\)\s*\}\}\s*<\/mat-icon>/g,
    '<span class="text-current shrink-0" aria-hidden="true">\u2713</span>'
  );

  // Fix 41: Status badge icon (config().icon)
  content = content.replace(
    /<mat-icon class="status-icon"[^>]*>\s*\{\{\s*config\(\)\.icon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="status-icon" aria-hidden="true">\u2022</span>'
  );

  // Fix 42: Breadcrumb home/separator/item icons - decorative
  content = content.replace(
    /<mat-icon class="text-base">\s*\{\{\s*homeIcon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="text-base" aria-hidden="true">\uD83C\uDFE0</span>'
  );
  content = content.replace(
    /<mat-icon class="breadcrumb-separator text-gray-300 text-sm">\s*\{\{\s*separator\s*\}\}\s*<\/mat-icon>/g,
    '<span class="breadcrumb-separator text-gray-300 text-sm" aria-hidden="true">\u203A</span>'
  );
  content = content.replace(
    /<mat-icon class="text-base">\s*\{\{\s*item\.icon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="text-base" aria-hidden="true">\u2022</span>'
  );

  // Fix 43: Page header icon (icon input) - decorative in w-10 h-10 container
  content = content.replace(
    /<div class="page-icon w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"[^>]*>\s*<\/div>/g,
    ''
  );

  // Fix 44: Image upload field cloud_upload placeholder
  content = content.replace(
    /<mat-icon class="text-5xl text-gray-300 mb-3">cloud_upload<\/mat-icon>/g,
    '<span class="text-5xl text-gray-300 mb-3" aria-hidden="true">\u2601\u2191</span>'
  );

  // Fix 45: Image upload field add button (add icon)
  content = content.replace(
    /<mat-icon class="text-3xl text-gray-400">add<\/mat-icon>/g,
    '<span class="text-3xl text-gray-400" aria-hidden="true">+</span>'
  );

  // Fix 46: Image upload field error icon
  content = content.replace(
    /<mat-icon class="text-base">error_outline<\/mat-icon>/g,
    '<span class="text-base" aria-hidden="true">\u26A0</span>'
  );

  // Fix 47: Form section icon in header
  content = content.replace(
    /<mat-icon class="text-gray-400">\s*\{\{\s*icon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="text-gray-400" aria-hidden="true">\u2022</span>'
  );

  // Fix 48: Form section error_outline icons
  content = content.replace(
    /<mat-icon class="text-red-500 mt-0\.5">error_outline<\/mat-icon>/g,
    '<span class="text-red-500 mt-0.5" aria-hidden="true">\u26A0</span>'
  );
  content = content.replace(
    /<mat-icon class="text-base">error_outline<\/mat-icon>/g,
    '<span class="text-base" aria-hidden="true">\u26A0</span>'
  );

  // Fix 49: Empty state icons (iconSizeClasses + effectiveIcon)
  content = content.replace(
    /<mat-icon[^>]*>\s*\{\{\s*effectiveIcon\(\)\s*\}\}\s*<\/mat-icon>/g,
    '<span aria-hidden="true">\u2022</span>'
  );
  content = content.replace(
    /<mat-icon[^>]*>\s*\{\{\s*iconSizeClasses\(\)\[size\]\s*\+\s*'\s*'\s*\+\s*effectiveIcon\(\)\s*\}\}\s*<\/mat-icon>/g,
    '<span aria-hidden="true">\u2022</span>'
  );

  // Fix 50: Dashboard history icon
  content = content.replace(
    /<mat-icon class="text-3xl mb-2">history<\/mat-icon>/g,
    '<span class="text-3xl mb-2" aria-hidden="true">\uD83D\uDD50</span>'
  );

  // Fix 51: Toast close button (close icon)
  content = content.replace(
    /<mat-icon class="text-lg">close<\/mat-icon>/g,
    '<span class="text-lg" aria-hidden="true">\u2715</span>'
  );

  // Fix 52: Stat card trendIcon()
  content = content.replace(
    /<mat-icon class="text-sm">\s*\{\{\s*trendIcon\(\)\s*\}\}\s*<\/mat-icon>/g,
    '<span class="text-sm" aria-hidden="true">\u2191</span>'
  );

  // Fix 53: Empty state actionIcon
  content = content.replace(
    /<mat-icon class="mr-2">\s*\{\{\s*actionIcon\s*\}\}\s*<\/mat-icon>/g,
    '<span class="mr-2" aria-hidden="true">\u2022</span>'
  );

  // Fix 54: Filter bar search icon (already handled by pl-10 removal, but also remove the absolute icon div)
  content = content.replace(
    /<mat-icon class="absolute left-3 top-1\/2 -translate-y-1\/2 text-gray-400 text-lg">search<\/mat-icon>/g,
    ''
  );

  // Fix 55: Page header breadcrumb chevron_right
  content = content.replace(
    /<mat-icon class="text-gray-300 text-sm">chevron_right<\/mat-icon>/g,
    '<span class="text-gray-300 text-sm" aria-hidden="true">\u203A</span>'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    changed = true;
  }
  return changed;
}

function findFiles(dir, extensions) {
  let files = [];
  try {
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
  } catch (e) {}
  return files;
}

const files = findFiles(SRC_DIR, ['.html', '.ts']);
let count = 0;
for (const f of files) {
  if (processFile(f)) {
    count++;
    console.log('Fixed: ' + f.replace(SRC_DIR + '\\', ''));
  }
}
console.log('Total files fixed: ' + count);