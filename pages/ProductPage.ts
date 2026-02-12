import { BasePage } from './BasePage';
import { Locator, Page } from '@playwright/test';

export class ProductPage extends BasePage {
  readonly container: Locator;
  readonly title: Locator;
  readonly priceLabel: Locator;
  readonly buyBtn: Locator;
  readonly cartOpenBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.container = this.page.getByTestId('productSideBlock');

    this.priceLabel = this.container.getByTestId('finalPrice');
    this.buyBtn = this.container.getByTestId('addToCartBtn');

    this.title = page.locator('[product-testid="productTitle"]');
    this.cartOpenBtn = this.page.getByTestId('Cart');
  }

  async addToCart() {
    await this.buyBtn.click();
  }

  async openCart() {
    await this.cartOpenBtn.click();
  }
}
