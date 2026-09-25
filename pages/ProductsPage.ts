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

  async addFirstNItemsToCart(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      // Click the first available 'Add to cart' button
      const addToCartButton = this.page.getByRole('button', { name: 'Add to cart' }).first();
      await addToCartButton.click();
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
      // Remove '$' symbol and parse float
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
