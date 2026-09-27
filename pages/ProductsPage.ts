import { type Page, type Locator } from '@playwright/test';

/**
 * ProductsPage - Page Object for https://www.saucedemo.com/inventory.html
 *
 * Locator strategy (mixed — prefer semantic, fall back to testId):
 *
 *   title           → getByTestId('title')
 *     The element is a plain <span> — no heading role. Test ID is correct.
 *
 *   sortDropdown    → getByRole('combobox', { name: 'Sort products' })
 *     <select aria-label="Sort products"> — getByRole + accessible name
 *     is the most semantic and intention-revealing locator.
 *
 *   cartLink        → getByTestId('shopping-cart-link')
 *     The aria-label on the cart <a> changes dynamically ("Cart, empty" /
 *     "Cart, 1 item" etc.). Matching a dynamic accessible name is fragile
 *     and would fail mid-test as items are added. The test ID is stable
 *     and is the right fallback here.
 *
 *   cartBadge       → getByTestId('shopping-cart-badge')
 *     Plain display <span> with no semantic role.
 *
 *   inventoryItems  → getByTestId('inventory-item')
 *     Structural <div> containers — no role, no accessible name.
 *
 *   itemPrices      → getByTestId('inventory-item-price')
 *     Display <div> — no semantic role.
 *
 *   Add-to-cart buttons → getByTestId(/^add-to-cart/)
 *     Each product's button has a unique data-test like
 *     "add-to-cart-sauce-labs-backpack". A prefix regex gives us all
 *     of them as a collection. The label changes to "Remove" after
 *     clicking, so text-based matching would break mid-loop.
 */
export class ProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    // <span> — no heading role; test ID is the appropriate choice
    this.title = page.getByTestId('title');
    // Structural <div> containers — no semantic role
    this.inventoryItems = page.getByTestId('inventory-item');
    this.itemPrices = page.getByTestId('inventory-item-price');
    // <select aria-label="Sort products"> — role: combobox
    this.sortDropdown = page.getByRole('combobox', { name: 'Sort products' });
    // Cart <a> has a dynamic aria-label that changes as items are added;
    // test ID is more reliable than matching a moving accessible name.
    this.cartLink = page.getByTestId('shopping-cart-link');
    // Plain <span> badge — no semantic role
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  /**
   * Adds `count` distinct products to the cart.
   *
   * Uses getByTestId regex to match all data-test="add-to-cart-*" buttons.
   * Always clicks .first() — after each click the button label changes to
   * "Remove", so the locator naturally resolves to the next un-added item.
   */
  async addFirstNItemsToCart(count: number): Promise<void> {
    const addButtons = this.page.getByTestId(/^add-to-cart/);
    const total = await addButtons.count();
    const limit = Math.min(count, total);

    for (let i = 0; i < limit; i++) {
      await addButtons.first().click();
    }
  }

  async getCartBadgeCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    const countText = await this.cartBadge.textContent();
    return Number(countText?.trim() || 0);
  }

  async selectSortOption(optionValue: 'lohi' | 'hilo' | 'az' | 'za'): Promise<void> {
    await this.sortDropdown.selectOption(optionValue);
  }

  async getAllPrices(): Promise<number[]> {
    const priceElements = await this.itemPrices.all();
    const prices: number[] = [];
    for (const elem of priceElements) {
      const text = await elem.textContent();
      const cleaned = text?.replace(/[^0-9.]/g, '') ?? '0';
      prices.push(parseFloat(cleaned));
    }
    return prices;
  }

  async getFirstItemPrice(): Promise<number> {
    const firstPriceText = await this.itemPrices.first().textContent();
    const cleaned = firstPriceText?.replace(/[^0-9.]/g, '') ?? '0';
    return parseFloat(cleaned);
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }
}
