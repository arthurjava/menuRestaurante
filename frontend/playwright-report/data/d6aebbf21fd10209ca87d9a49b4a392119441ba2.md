# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: menu.spec.ts >> Restaurante - Menu Module E2E Tests >> Menu Public View (/menu) >> should render categories chips
- Location: e2e\menu.spec.ts:85:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('button:has-text("Categorias")')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - img [aria-hidden] [ref=e10]: restaurant
        - generic [ref=e11]:
          - heading "Nosso Restaurante" [level=1] [ref=e12]
          - paragraph [ref=e13]: Cardápio Digital
      - generic [ref=e14]:
        - generic [ref=e15]:
          - img [aria-hidden] [ref=e16]: search
          - textbox "Buscar pratos..." [ref=e17]
        - button [ref=e19] [cursor=pointer]
  - main [ref=e22]
  - contentinfo [ref=e23]:
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]:
          - heading "Nosso Restaurante" [level=3] [ref=e27]
          - paragraph [ref=e28]: O melhor da culinária para você.
        - heading "Horário de Funcionamento" [level=3] [ref=e30]
        - heading "Contato" [level=3] [ref=e32]
      - separator [ref=e33]
      - paragraph [ref=e34]: © 2026 Nosso Restaurante. Todos os direitos reservados.
  - generic [ref=e41]:
    - heading [level=2]
  - generic [ref=e50]:
    - heading [level=2]
```

# Test source

```ts
  1   | import { test, expect, Page, BrowserContext } from '@playwright/test';
  2   | import { testCredentials, testUrls, selectors } from './fixtures/test-data';
  3   | 
  4   | test.describe.configure({ retries: 1 });
  5   | 
  6   | test.describe('Restaurante - Menu Module E2E Tests', () => {
  7   |   let context: BrowserContext;
  8   |   let page: Page;
  9   | 
  10  |   test.beforeAll(async ({ browser }) => {
  11  |     context = await browser.newContext({
  12  |       viewport: { width: 1280, height: 720 }
  13  |     });
  14  |     page = await context.newPage();
  15  |     
  16  |     // Enable console logging for debugging
  17  |     page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
  18  |     page.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));
  19  |   });
  20  | 
  21  |   test.afterAll(async () => {
  22  |     await context.close();
  23  |   });
  24  | 
  25  |   test.describe('Login Flow', () => {
  26  |     test('should navigate to login page', async () => {
  27  |       await page.goto(testUrls.login);
  28  |       await expect(page).toHaveURL(/.*auth\/login/);
  29  |       await expect(page.locator(selectors.login.emailInput)).toBeVisible();
  30  |       await expect(page.locator(selectors.login.passwordInput)).toBeVisible();
  31  |       await expect(page.locator(selectors.login.submitButton)).toBeVisible();
  32  |     });
  33  | 
  34  |     test('should login successfully with admin credentials', async () => {
  35  |       await page.goto(testUrls.login);
  36  |       
  37  |       await page.fill(selectors.login.emailInput, testCredentials.admin.email);
  38  |       await page.fill(selectors.login.passwordInput, testCredentials.admin.password);
  39  |       await page.click(selectors.login.submitButton);
  40  |       
  41  |       // Wait for navigation to dashboard
  42  |       await page.waitForURL(/.*dashboard/);
  43  |       await expect(page).toHaveURL(/.*dashboard/);
  44  |       
  45  |       // Wait a bit for localStorage to be updated
  46  |       await page.waitForTimeout(1000);
  47  |       
  48  |       // Debug: check what's in localStorage
  49  |       const allStorage = await page.evaluate(() => {
  50  |         const items: Record<string, string> = {};
  51  |         for (let i = 0; i < localStorage.length; i++) {
  52  |           const key = localStorage.key(i);
  53  |           if (key) items[key] = localStorage.getItem(key)!;
  54  |         }
  55  |         return items;
  56  |       });
  57  |       console.log('localStorage:', allStorage);
  58  |       
  59  |       // Verify user is stored in localStorage
  60  |       const user = await page.evaluate(() => localStorage.getItem('user'));
  61  |       expect(user).toBeTruthy();
  62  |       const userData = JSON.parse(user!);
  63  |       expect(userData.email).toBe(testCredentials.admin.email);
  64  |     });
  65  | 
  66  |     test('should redirect to dashboard after login', async () => {
  67  |       await page.goto(testUrls.dashboard);
  68  |       await expect(page).toHaveURL(/.*dashboard/);
  69  |     });
  70  |   });
  71  | 
  72  |   test.describe('Menu Public View (/menu)', () => {
  73  |     test.beforeEach(async () => {
  74  |       await page.goto(testUrls.menu);
  75  |       // Wait for content to load
  76  |       await page.waitForLoadState('networkidle');
  77  |       await page.waitForTimeout(1000);
  78  |     });
  79  | 
  80  |     test('should load header with restaurant info', async () => {
  81  |       await expect(page.locator(selectors.menu.header)).toBeVisible();
  82  |       await expect(page.locator(selectors.menu.restaurantName)).toBeVisible();
  83  |     });
  84  | 
  85  |     test('should render categories chips', async () => {
  86  |       // Click the category filter button to show chips
> 87  |       await page.click(selectors.menu.categoryFilterButton);
      |                  ^ Error: page.click: Target page, context or browser has been closed
  88  |       await expect(page.locator(selectors.menu.categoryChips).first()).toBeVisible();
  89  |       const chips = page.locator(selectors.menu.categoryChips);
  90  |       await expect(chips).toHaveCountGreaterThan(0);
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
```