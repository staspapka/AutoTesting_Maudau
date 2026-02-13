import { Page, Locator } from '@playwright/test';

export class CartDrawer {
  readonly container: Locator;
  readonly countLabel: Locator;
  readonly totalPriceLabel: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.container = page.locator('nav.EZDrawer__container').filter({ visible: true });
    this.cartItems = this.container.getByTestId('cartProductItem');
    this.totalPriceLabel = this.container.getByTestId('totalPrice');
    this.countLabel = this.container.getByTestId('productInCartTotalCount');
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
}
