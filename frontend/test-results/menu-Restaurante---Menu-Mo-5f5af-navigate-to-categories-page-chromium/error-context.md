# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: menu.spec.ts >> Restaurante - Menu Module E2E Tests >> Admin Flows (require login) >> Categories Management (/categories) >> should navigate to categories page
- Location: e2e\menu.spec.ts:189:11

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1:has-text("Categorias")')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('h1:has-text("Categorias")') with timeout 10000ms
  - waiting for locator('h1:has-text("Categorias")')

```

```yaml
- heading "Entrar no Sistema" [level=1]
- paragraph: Acesse sua conta para gerenciar o cardápio
- text: E-mail
- textbox "E-mail":
  - /placeholder: seu@email.com
- text: Senha
- textbox "Senha":
  - /placeholder: ••••••••
- checkbox "Lembrar-me"
- text: Lembrar-me
- link "Esqueceu a senha?":
  - /url: /auth/forgot-password
- button "Entrar" [disabled]
- paragraph:
  - text: Não tem uma conta?
  - link "Cadastre-se":
    - /url: /auth/register
```

# Test source

```ts
  91  |     });
  92  | 
  93  |     test('should load dishes grid with cards', async () => {
  94  |       await expect(page.locator(selectors.menu.dishCards).first()).toBeVisible({ timeout: 10000 });
  95  |       const cards = page.locator(selectors.menu.dishCards);
  96  |       await expect(cards).toHaveCountGreaterThan(0);
  97  |     });
  98  | 
  99  |     test('should have search functionality', async () => {
  100 |       const searchInput = page.locator(selectors.menu.searchInput);
  101 |       await expect(searchInput).toBeVisible();
  102 |       
  103 |       // Test search
  104 |       await searchInput.fill('test');
  105 |       await page.waitForTimeout(500);
  106 |       
  107 |       // Clear search
  108 |       await searchInput.clear();
  109 |       await page.waitForTimeout(500);
  110 |     });
  111 | 
  112 |     test('should filter by category chips', async () => {
  113 |       const chips = page.locator(selectors.menu.categoryChips);
  114 |       const chipCount = await chips.count();
  115 |       
  116 |       if (chipCount > 1) {
  117 |         // Click on a category chip (not "Todas")
  118 |         await chips.nth(1).click();
  119 |         await page.waitForTimeout(500);
  120 |         
  121 |         // Click "Todas" to reset
  122 |         await chips.first().click();
  123 |         await page.waitForTimeout(500);
  124 |       }
  125 |     });
  126 | 
  127 |     test('should open image gallery when clicking photo_library icon', async () => {
  128 |       const photoIcons = page.locator(selectors.menu.photoLibraryIcon);
  129 |       const count = await photoIcons.count();
  130 |       
  131 |       if (count > 0) {
  132 |         await photoIcons.first().click();
  133 |         await expect(page.locator(selectors.modals.imageGallery)).toBeVisible({ timeout: 5000 });
  134 |         
  135 |         // Close gallery
  136 |         await page.click(selectors.modals.galleryCloseButton);
  137 |         await expect(page.locator(selectors.modals.imageGallery)).not.toBeVisible();
  138 |       }
  139 |     });
  140 | 
  141 |     test('should navigate image gallery with keyboard', async () => {
  142 |       const photoIcons = page.locator(selectors.menu.photoLibraryIcon);
  143 |       const count = await photoIcons.count();
  144 |       
  145 |       if (count > 0) {
  146 |         await photoIcons.first().click();
  147 |         await expect(page.locator(selectors.modals.imageGallery)).toBeVisible({ timeout: 5000 });
  148 |         
  149 |         // Test ESC key closes gallery
  150 |         await page.keyboard.press('Escape');
  151 |         await expect(page.locator(selectors.modals.imageGallery)).not.toBeVisible();
  152 |       }
  153 |     });
  154 | 
  155 |     test('should open dish detail modal when clicking "Adicionar"', async () => {
  156 |       const addButtons = page.locator(selectors.menu.addToOrderButton);
  157 |       const count = await addButtons.count();
  158 |       
  159 |       if (count > 0) {
  160 |         await addButtons.first().click();
  161 |         await expect(page.locator(selectors.modals.dishDetailModal)).toBeVisible({ timeout: 5000 });
  162 |         
  163 |         // Verify modal content
  164 |         await expect(page.locator(selectors.modals.dishDetailPrice)).toBeVisible();
  165 |         await expect(page.locator(selectors.modals.dishDetailAddButton)).toBeVisible();
  166 |         
  167 |         // Close modal
  168 |         await page.keyboard.press('Escape');
  169 |         await expect(page.locator(selectors.modals.dishDetailModal)).not.toBeVisible();
  170 |       }
  171 |     });
  172 | 
  173 |     test('should have footer with contact info', async () => {
  174 |       await expect(page.locator(selectors.menu.footer)).toBeVisible();
  175 |     });
  176 |   });
  177 | 
  178 |   test.describe('Admin Flows (require login)', () => {
  179 |     test.beforeEach(async () => {
  180 |       // Login first
  181 |       await page.goto(testUrls.login);
  182 |       await page.fill(selectors.login.emailInput, testCredentials.admin.email);
  183 |       await page.fill(selectors.login.passwordInput, testCredentials.admin.password);
  184 |       await page.click(selectors.login.submitButton);
  185 |       await page.waitForURL(/.*dashboard/);
  186 |     });
  187 | 
  188 |     test.describe('Categories Management (/categories)', () => {
  189 |       test('should navigate to categories page', async () => {
  190 |         await page.goto(testUrls.categories);
> 191 |         await expect(page.locator(selectors.admin.categories.pageTitle)).toBeVisible({ timeout: 10000 });
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  192 |       });
  193 | 
  194 |       test('should open create category modal', async () => {
  195 |         await page.goto(testUrls.categories);
  196 |         await page.click(selectors.admin.categories.createButton);
  197 |         await expect(page.locator(selectors.admin.categories.modalTitle)).toBeVisible({ timeout: 5000 });
  198 |         
  199 |         // Fill form
  200 |         await page.fill(selectors.admin.categories.nameInput, 'Test Category E2E');
  201 |         await page.fill(selectors.admin.categories.displayOrderInput, '999');
  202 |         
  203 |         // Close modal
  204 |         await page.click(selectors.admin.categories.cancelButton);
  205 |         await expect(page.locator(selectors.admin.categories.modalTitle)).not.toBeVisible();
  206 |       });
  207 | 
  208 |       test('should test edit category', async () => {
  209 |         await page.goto(testUrls.categories);
  210 |         const editButtons = page.locator(selectors.admin.categories.editButton);
  211 |         const count = await editButtons.count();
  212 |         
  213 |         if (count > 0) {
  214 |           await editButtons.first().click();
  215 |           await expect(page.locator(selectors.admin.categories.modalTitle)).toBeVisible({ timeout: 5000 });
  216 |           await page.click(selectors.admin.categories.cancelButton);
  217 |         }
  218 |       });
  219 | 
  220 |       test('should test delete confirmation', async () => {
  221 |         await page.goto(testUrls.categories);
  222 |         const deleteButtons = page.locator(selectors.admin.categories.deleteButton);
  223 |         const count = await deleteButtons.count();
  224 |         
  225 |         if (count > 0) {
  226 |           await deleteButtons.first().click();
  227 |           await expect(page.locator(selectors.admin.categories.confirmDeleteButton)).toBeVisible({ timeout: 5000 });
  228 |           await page.click(selectors.admin.categories.cancelButton);
  229 |         }
  230 |       });
  231 | 
  232 |       test('should test reorder drag-drop', async () => {
  233 |         await page.goto(testUrls.categories);
  234 |         await page.click(selectors.admin.categories.reorderButton);
  235 |         await expect(page.locator(selectors.admin.categories.modalTitle)).toBeVisible({ timeout: 5000 });
  236 |         await page.click(selectors.admin.categories.cancelButton);
  237 |       });
  238 |     });
  239 | 
  240 |     test.describe('Dishes Management (/dishes)', () => {
  241 |       test('should navigate to dishes page', async () => {
  242 |         await page.goto(testUrls.dishes);
  243 |         await expect(page.locator(selectors.admin.dishes.pageTitle)).toBeVisible({ timeout: 10000 });
  244 |       });
  245 | 
  246 |       test('should open create dish modal', async () => {
  247 |         await page.goto(testUrls.dishes);
  248 |         await page.click(selectors.admin.dishes.createButton);
  249 |         await expect(page.locator(selectors.admin.dishes.modalTitle)).toBeVisible({ timeout: 5000 });
  250 |         
  251 |         // Verify form fields
  252 |         await expect(page.locator(selectors.admin.dishes.nameInput)).toBeVisible();
  253 |         await expect(page.locator(selectors.admin.dishes.descriptionInput)).toBeVisible();
  254 |         await expect(page.locator(selectors.admin.dishes.priceInput)).toBeVisible();
  255 |         await expect(page.locator(selectors.admin.dishes.categorySelect)).toBeVisible();
  256 |         await expect(page.locator(selectors.admin.dishes.imageUpload)).toBeVisible();
  257 |         
  258 |         // Close modal
  259 |         await page.click(selectors.admin.dishes.cancelButton);
  260 |         await expect(page.locator(selectors.admin.dishes.modalTitle)).not.toBeVisible();
  261 |       });
  262 | 
  263 |       test('should test dish reorder', async () => {
  264 |         await page.goto(testUrls.dishes);
  265 |         const reorderButton = page.locator(selectors.admin.dishes.reorderButton);
  266 |         await expect(reorderButton).toBeVisible();
  267 |         
  268 |         await reorderButton.click();
  269 |         await expect(page.locator(selectors.admin.dishes.modalTitle)).toBeVisible({ timeout: 5000 });
  270 |         await page.click(selectors.admin.dishes.cancelButton);
  271 |       });
  272 |     });
  273 |   });
  274 | });
  275 | 
  276 | test.describe('Error Handling & Edge Cases', () => {
  277 |   test('should handle 404 for non-existent routes', async ({ page }) => {
  278 |     await page.goto('/non-existent-route');
  279 |     await page.waitForLoadState('networkidle');
  280 |     // Should either show 404 or redirect
  281 |   });
  282 | 
  283 |   test('should handle network errors gracefully', async ({ page }) => {
  284 |     // Block API requests
  285 |     await page.route('**/api/**', route => route.abort());
  286 |     
  287 |     await page.goto(testUrls.menu);
  288 |     await page.waitForTimeout(2000);
  289 |     
  290 |     // Should show error state or empty state
  291 |     const emptyState = page.locator(selectors.menu.emptyState);
```