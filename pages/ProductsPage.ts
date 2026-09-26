import { type Page, type Locator } from '@playwright/test';

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
    this.title = page.getByTestId('title');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  /**
   * Adds `count` distinct products to the cart.
   *
   * SauceDemo renders the Add-to-cart button OUTSIDE the
   * data-test="inventory-item" container, so we cannot scope it
   * to the item card. Instead we collect all visible Add-to-cart
   * buttons up front and click them by index. After each click the
   * button label changes to Remove, so the next index still points
   * to an un-added item — no re-query needed.
   */
  async addFirstNItemsToCart(count: number): Promise<void> {
    // data-test="add-to-cart" is set on every Add-to-cart button
    const addButtons = this.page.getByTestId(/^add-to-cart/);
    const total = await addButtons.count();
    const limit = Math.min(count, total);

    for (let i = 0; i < limit; i++) {
      // Always click the first visible Add-to-cart button;
      // after clicking it becomes Remove, so first() naturally
      // advances to the next product on the following iteration.
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
