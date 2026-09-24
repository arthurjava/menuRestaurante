const fs = require('fs');
const path = require('path');

const SRC_DIR = 'D:\\Projetos\\restaurante\\frontend\\src';

// Only files that had mat-icon in templates and imported MatIconModule
const TARGET_FILES = [
  'app\\layout\\admin-layout\\admin-layout.component.ts',
  'app\\layout\\admin-layout\\header\\admin-header.component.ts',
  'app\\layout\\admin-layout\\footer\\admin-footer.component.ts',
  'app\\layout\\admin-layout\\sidebar\\admin-sidebar.component.ts',
  'app\\layout\\public-layout\\public-layout.component.ts',
  'app\\features\\categories\\categories-list.component.ts',
  'app\\features\\dishes\\dishes-list.component.ts',
  'app\\features\\users\\users-list.component.ts',
  'app\\features\\dashboard\\dashboard.component.ts',
  'app\\features\\menu\\menu.component.ts',
  'app\\features\\settings\\settings.component.ts',
  'app\\features\\auth\\login\\login.component.ts',
  'app\\features\\auth\\register\\register.component.ts',
  'app\\shared\\components\\image-upload\\image-upload.component.ts',
  'app\\shared\\components\\image-gallery\\image-gallery.component.ts',
  'app\\shared\\components\\forms\\image-upload-field.component.ts',
  'app\\shared\\components\\forms\\form-section.component.ts',
  'app\\shared\\components\\data-display\\empty-state.component.ts',
  'app\\shared\\components\\data-display\\stat-card.component.ts',
  'app\\shared\\components\\data-display\\status-badge.component.ts',
  'app\\shared\\components\\feedback\\toast-container.component.ts',
  'app\\shared\\components\\notification\\notification.component.ts',
  'app\\shared\\components\\layout\\filter-bar.component.ts',
  'app\\shared\\components\\layout\\page-actions.component.ts',
  'app\\shared\\components\\layout\\page-header.component.ts',
  'app\\shared\\components\\navigation\\pagination.component.ts',
  'app\\shared\\components\\navigation\\breadcrumb.component.ts',
  'app\\shared\\components\\modal\\base-modal\\base-modal.component.ts',
  'app\\shared\\components\\modal\\modal.component.ts',
  'app\\shared\\components\\modal\\category-modal.component.ts',
  'app\\shared\\components\\modal\\cat-form.component.ts',
  'app\\shared\\components\\modal\\dish-form.component.ts',
  'app\\shared\\components\\modal\\dish-modal.component.ts',
  'app\\shared\\components\\modal\\user-form.component.ts',
  'app\\shared\\components\\modal\\user-modal.component.ts',
  'app\\shared\\components\\modal\\del-confirm.component.ts',
  'app\\shared\\components\\modal\\delete-confirm-modal.component.ts',
  'app\\shared\\components\\modal\\reorder-wrapper.component.ts',
  'app\\shared\\components\\modal\\reorder-modal.component.ts',
  'app\\shared\\components\\modal\\reorder-modal\\reorder-modal.component.ts',
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  let changed = false;

  // Remove import line for MatIconModule (various quote styles)
  content = content.replace(
    /import\s*\{[^}]*MatIconModule[^}]*\}\s*from\s*['"]@angular\/material\/icon['"];?\s*\n?/g,
    ''
  );

  // Remove MatIconModule from imports array (with or without trailing comma)
  content = content.replace(
    /\bMatIconModule\s*,?\s*/g,
    ''
  );

  // Clean up empty lines left by import removal (max 2 consecutive)
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

let count = 0;
for (const relPath of TARGET_FILES) {
  const fullPath = path.join(SRC_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    if (processFile(fullPath)) {
      count++;
      console.log('Removed MatIconModule from: ' + relPath);
    }
  } else {
    console.log('NOT FOUND: ' + relPath);
  }
}
console.log('Total files updated: ' + count);