import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ProductsPage } from '../../pages/ProductsPage';

test.describe('SauceDemo - Product Catalog & Cart Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('Scenario 3: Add any two products to cart and verify cart badge updates to 2', async () => {
    // Add first two products to cart
    await productsPage.addFirstNItemsToCart(2);

    // Verify cart badge displays '2'
    await expect(productsPage.cartBadge).toBeVisible();
    await expect(productsPage.cartBadge).toHaveText('2');
  });

  test('Scenario 5: Sort products by "Price (low to high)" and verify the first product has the lowest price', async () => {
    // Sort products by Price (low to high)
    await productsPage.selectSortOption('lohi');

    // Fetch all product prices displayed on the page
    const prices = await productsPage.getAllPrices();
    expect(prices.length).toBeGreaterThan(0);

    const firstProductPrice = await productsPage.getFirstItemPrice();
    const minCalculatedPrice = Math.min(...prices);

    // Verify the first product displayed has the minimum price among all items
    expect(firstProductPrice).toBe(minCalculatedPrice);

    // Additionally verify entire price list is in non-decreasing order
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  });
});
