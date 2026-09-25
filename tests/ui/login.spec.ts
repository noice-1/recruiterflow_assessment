import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ProductsPage } from '../../pages/ProductsPage';

test.describe('SauceDemo - Authentication Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Scenario 1: Standard user can log in and land on the products page', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.title).toBeVisible();
    await expect(productsPage.title).toHaveText('Products');
  });

  test('Scenario 2: Locked-out user sees the correct error message and is NOT logged in', async ({ page }) => {
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Epic sadface: Sorry, this user has been locked out.'
    );

    // Verify user is not logged in and remains on the login page
    await expect(page).not.toHaveURL(/.*inventory\.html/);
    await expect(loginPage.usernameInput).toBeVisible();
  });
});
