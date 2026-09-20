# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: menu.spec.ts >> Restaurante - Menu Module E2E Tests >> Admin Flows (require login) >> Dishes Management (/dishes) >> should test dish reorder
- Location: e2e\menu.spec.ts:263:11

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Reordenar")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('button:has-text("Reordenar")') with timeout 5000ms
  - waiting for locator('button:has-text("Reordenar")')

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
  191 |         await expect(page.locator(selectors.admin.categories.pageTitle)).toBeVisible({ timeout: 10000 });
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
> 266 |         await expect(reorderButton).toBeVisible();
      |                                     ^ Error: expect(locator).toBeVisible() failed
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
  292 |     await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
  293 |   });
  294 | });
```