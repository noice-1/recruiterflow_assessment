import { type Page, type Locator } from '@playwright/test';

/**
 * CartPage - Page Object for https://www.saucedemo.com/cart.html
 *
 * Locator strategy:
 *
 *   checkoutButton  → getByRole('button', { name: 'Checkout' })
 *     A standard <button> with visible text "Checkout". getByRole
 *     is the most semantic and readable choice.
 *
 *   cartItems       → getByTestId('inventory-item')
 *     Same structural <div> containers as on the inventory page.
 *     No semantic role — test ID is appropriate.
 */
export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    // Standard <button> with text "Checkout"
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    // Structural <div> containers — no semantic role
    this.cartItems = page.getByTestId('inventory-item');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }
}
