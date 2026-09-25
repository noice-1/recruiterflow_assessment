import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.describe('SauceDemo - Checkout Flow Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('Scenario 4: Complete the full checkout flow with items in the cart', async ({ page }) => {
    // 1. Add items to cart
    await productsPage.addFirstNItemsToCart(2);
    await expect(productsPage.cartBadge).toHaveText('2');

    // 2. Navigate to cart
    await productsPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(cartPage.cartItems).toHaveCount(2);

    // 3. Initiate checkout
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);

    // 4. Fill shipping information & continue
    await checkoutPage.fillInformation('Alex', 'Doe', '94043');
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);

    // 5. Finish order
    await checkoutPage.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);

    // 6. Verify confirmation message
    await expect(checkoutPage.completeHeader).toBeVisible();
    await expect(checkoutPage.completeHeader).toHaveText(/Thank you for your order!/i);
  });
});
