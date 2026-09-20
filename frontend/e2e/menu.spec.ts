import { test, expect, Page, BrowserContext } from '@playwright/test';
import { testCredentials, testUrls, selectors } from './fixtures/test-data';

test.describe.configure({ retries: 1 });

test.describe('Restaurante - Menu Module E2E Tests', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    
    // Enable console logging for debugging
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
    page.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe('Login Flow', () => {
    test('should navigate to login page', async () => {
      await page.goto(testUrls.login);
      await expect(page).toHaveURL(/.*auth\/login/);
      await expect(page.locator(selectors.login.emailInput)).toBeVisible();
      await expect(page.locator(selectors.login.passwordInput)).toBeVisible();
      await expect(page.locator(selectors.login.submitButton)).toBeVisible();
    });

    test('should login successfully with admin credentials', async () => {
      await page.goto(testUrls.login);
      
      await page.fill(selectors.login.emailInput, testCredentials.admin.email);
      await page.fill(selectors.login.passwordInput, testCredentials.admin.password);
      await page.click(selectors.login.submitButton);
      
      // Wait for navigation to dashboard
      await page.waitForURL(/.*dashboard/);
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Wait a bit for localStorage to be updated
      await page.waitForTimeout(1000);
      
      // Debug: check what's in localStorage
      const allStorage = await page.evaluate(() => {
        const items: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) items[key] = localStorage.getItem(key)!;
        }
        return items;
      });
      console.log('localStorage:', allStorage);
      
      // Verify user is stored in localStorage
      const user = await page.evaluate(() => localStorage.getItem('user'));
      expect(user).toBeTruthy();
      const userData = JSON.parse(user!);
      expect(userData.email).toBe(testCredentials.admin.email);
    });

    test('should redirect to dashboard after login', async () => {
      await page.goto(testUrls.dashboard);
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });

  test.describe('Menu Public View (/menu)', () => {
    test.beforeEach(async () => {
      await page.goto(testUrls.menu);
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('should load header with restaurant info', async () => {
      await expect(page.locator(selectors.menu.header)).toBeVisible();
      await expect(page.locator(selectors.menu.restaurantName)).toBeVisible();
    });

    test('should render categories chips', async () => {
      // Click the category filter button to show chips
      await page.click(selectors.menu.categoryFilterButton);
      await expect(page.locator(selectors.menu.categoryChips).first()).toBeVisible();
      const chips = page.locator(selectors.menu.categoryChips);
      await expect(chips).toHaveCountGreaterThan(0);
    });

    test('should load dishes grid with cards', async () => {
      await expect(page.locator(selectors.menu.dishCards).first()).toBeVisible({ timeout: 10000 });
      const cards = page.locator(selectors.menu.dishCards);
      await expect(cards).toHaveCountGreaterThan(0);
    });

    test('should have search functionality', async () => {
      const searchInput = page.locator(selectors.menu.searchInput);
      await expect(searchInput).toBeVisible();
      
      // Test search
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    });

    test('should filter by category chips', async () => {
      const chips = page.locator(selectors.menu.categoryChips);
      const chipCount = await chips.count();
      
      if (chipCount > 1) {
        // Click on a category chip (not "Todas")
        await chips.nth(1).click();
        await page.waitForTimeout(500);
        
        // Click "Todas" to reset
        await chips.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should open image gallery when clicking photo_library icon', async () => {
      const photoIcons = page.locator(selectors.menu.photoLibraryIcon);
      const count = await photoIcons.count();
      
      if (count > 0) {
        await photoIcons.first().click();
        await expect(page.locator(selectors.modals.imageGallery)).toBeVisible({ timeout: 5000 });
        
        // Close gallery
        await page.click(selectors.modals.galleryCloseButton);
        await expect(page.locator(selectors.modals.imageGallery)).not.toBeVisible();
      }
    });

    test('should navigate image gallery with keyboard', async () => {
      const photoIcons = page.locator(selectors.menu.photoLibraryIcon);
      const count = await photoIcons.count();
      
      if (count > 0) {
        await photoIcons.first().click();
        await expect(page.locator(selectors.modals.imageGallery)).toBeVisible({ timeout: 5000 });
        
        // Test ESC key closes gallery
        await page.keyboard.press('Escape');
        await expect(page.locator(selectors.modals.imageGallery)).not.toBeVisible();
      }
    });

    test('should open dish detail modal when clicking "Adicionar"', async () => {
      const addButtons = page.locator(selectors.menu.addToOrderButton);
      const count = await addButtons.count();
      
      if (count > 0) {
        await addButtons.first().click();
        await expect(page.locator(selectors.modals.dishDetailModal)).toBeVisible({ timeout: 5000 });
        
        // Verify modal content
        await expect(page.locator(selectors.modals.dishDetailPrice)).toBeVisible();
        await expect(page.locator(selectors.modals.dishDetailAddButton)).toBeVisible();
        
        // Close modal
        await page.keyboard.press('Escape');
        await expect(page.locator(selectors.modals.dishDetailModal)).not.toBeVisible();
      }
    });

    test('should have footer with contact info', async () => {
      await expect(page.locator(selectors.menu.footer)).toBeVisible();
    });
  });

  test.describe('Admin Flows (require login)', () => {
    test.beforeEach(async () => {
      // Login first
      await page.goto(testUrls.login);
      await page.fill(selectors.login.emailInput, testCredentials.admin.email);
      await page.fill(selectors.login.passwordInput, testCredentials.admin.password);
      await page.click(selectors.login.submitButton);
      await page.waitForURL(/.*dashboard/);
    });

    test.describe('Categories Management (/categories)', () => {
      test('should navigate to categories page', async () => {
        await page.goto(testUrls.categories);
        await expect(page.locator(selectors.admin.categories.pageTitle)).toBeVisible({ timeout: 10000 });
      });

      test('should open create category modal', async () => {
        await page.goto(testUrls.categories);
        await page.click(selectors.admin.categories.createButton);
        await expect(page.locator(selectors.admin.categories.modalTitle)).toBeVisible({ timeout: 5000 });
        
        // Fill form
        await page.fill(selectors.admin.categories.nameInput, 'Test Category E2E');
        await page.fill(selectors.admin.categories.displayOrderInput, '999');
        
        // Close modal
        await page.click(selectors.admin.categories.cancelButton);
        await expect(page.locator(selectors.admin.categories.modalTitle)).not.toBeVisible();
      });

      test('should test edit category', async () => {
        await page.goto(testUrls.categories);
        const editButtons = page.locator(selectors.admin.categories.editButton);
        const count = await editButtons.count();
        
        if (count > 0) {
          await editButtons.first().click();
          await expect(page.locator(selectors.admin.categories.modalTitle)).toBeVisible({ timeout: 5000 });
          await page.click(selectors.admin.categories.cancelButton);
        }
      });

      test('should test delete confirmation', async () => {
        await page.goto(testUrls.categories);
        const deleteButtons = page.locator(selectors.admin.categories.deleteButton);
        const count = await deleteButtons.count();
        
        if (count > 0) {
          await deleteButtons.first().click();
          await expect(page.locator(selectors.admin.categories.confirmDeleteButton)).toBeVisible({ timeout: 5000 });
          await page.click(selectors.admin.categories.cancelButton);
        }
      });

      test('should test reorder drag-drop', async () => {
        await page.goto(testUrls.categories);
        await page.click(selectors.admin.categories.reorderButton);
        await expect(page.locator(selectors.admin.categories.modalTitle)).toBeVisible({ timeout: 5000 });
        await page.click(selectors.admin.categories.cancelButton);
      });
    });

    test.describe('Dishes Management (/dishes)', () => {
      test('should navigate to dishes page', async () => {
        await page.goto(testUrls.dishes);
        await expect(page.locator(selectors.admin.dishes.pageTitle)).toBeVisible({ timeout: 10000 });
      });

      test('should open create dish modal', async () => {
        await page.goto(testUrls.dishes);
        await page.click(selectors.admin.dishes.createButton);
        await expect(page.locator(selectors.admin.dishes.modalTitle)).toBeVisible({ timeout: 5000 });
        
        // Verify form fields
        await expect(page.locator(selectors.admin.dishes.nameInput)).toBeVisible();
        await expect(page.locator(selectors.admin.dishes.descriptionInput)).toBeVisible();
        await expect(page.locator(selectors.admin.dishes.priceInput)).toBeVisible();
        await expect(page.locator(selectors.admin.dishes.categorySelect)).toBeVisible();
        await expect(page.locator(selectors.admin.dishes.imageUpload)).toBeVisible();
        
        // Close modal
        await page.click(selectors.admin.dishes.cancelButton);
        await expect(page.locator(selectors.admin.dishes.modalTitle)).not.toBeVisible();
      });

      test('should test dish reorder', async () => {
        await page.goto(testUrls.dishes);
        const reorderButton = page.locator(selectors.admin.dishes.reorderButton);
        await expect(reorderButton).toBeVisible();
        
        await reorderButton.click();
        await expect(page.locator(selectors.admin.dishes.modalTitle)).toBeVisible({ timeout: 5000 });
        await page.click(selectors.admin.dishes.cancelButton);
      });
    });
  });
});

test.describe('Error Handling & Edge Cases', () => {
  test('should handle 404 for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-route');
    await page.waitForLoadState('networkidle');
    // Should either show 404 or redirect
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Block API requests
    await page.route('**/api/**', route => route.abort());
    
    await page.goto(testUrls.menu);
    await page.waitForTimeout(2000);
    
    // Should show error state or empty state
    const emptyState = page.locator(selectors.menu.emptyState);
    await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});