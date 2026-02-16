import { Page, Locator } from '@playwright/test';
import { PriceUtils } from '../utils/PriceUtils';

export class CartDrawer {
  readonly page: Page;
  readonly container: Locator;
  readonly countLabel: Locator;
  readonly totalPriceLabel: Locator;
  readonly cartItems: Locator;
  readonly cartCloseButton: Locator;
  readonly checkOut: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('nav.EZDrawer__container').filter({ visible: true });
    this.cartItems = this.container.getByTestId('cartProductItem');
    this.totalPriceLabel = this.container.getByTestId('totalPrice');
    this.countLabel = this.container.getByTestId('productInCartTotalCount');
    this.cartCloseButton = this.container.locator('.size-28');
    this.checkOut = this.container.getByTestId('checkoutBtn');
  }

  async addOneMore(productName?: string) {
    const targetRow = productName
      ? this.cartItems.filter({ hasText: productName })
      : this.cartItems.first();
    await targetRow.getByTestId('plus').click();
  }

  async removeProduct(productName: string) {
    const productRow = this.cartItems.filter({ hasText: productName });
    const trashBtn = productRow.getByTestId('trashBtn');
    await trashBtn.click();
  }

  async getTotalPrice(): Promise<number> {
    const rawPrice = await this.totalPriceLabel.innerText();
    return PriceUtils.clean(rawPrice);
  }

  async getProductPriceBySlug(slug: string): Promise<number> {
    const cleanSlug = slug.split('/').pop() || slug;

    const productItem = this.container
      .locator('[data-testid="cartProductItem"]')
      .filter({
        has: this.page.locator(`a[href*="${cleanSlug}"]`),
      })
      .first();
    await productItem.waitFor({ state: 'visible', timeout: 5000 });

    const priceLabel = productItem.getByTestId('finalPrice');

    await priceLabel.waitFor({ state: 'visible', timeout: 5000 });

    const rawPrice = await priceLabel.innerText();
    return PriceUtils.clean(rawPrice);
  }
}
