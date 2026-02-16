import { Page, Locator, expect } from '@playwright/test';

export class NotificationComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly success: Locator;

  readonly addSuccessPattern = /Товар доданий в кошик|Товар добавлен в корзину/;
  readonly removeSuccessPattern = /Товар видалено з кошика|Товар удален из корзины/;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('notification').last();
    this.success = page.getByTestId('successNotification');
  }

  private get lastMessage(): Locator {
    return this.page.getByTestId('notificationText').last();
  }

  async waitForVisible(pattern: RegExp) {
    await expect(this.lastMessage).toHaveText(pattern, { timeout: 10000 });
  }

  async getMessageText(): Promise<string> {
    const text = await this.lastMessage.innerText();
    return text.trim();
  }

  async verifyAddSuccess(): Promise<void> {
    await expect(this.lastMessage).toHaveText(this.addSuccessPattern, { timeout: 10000 });
  }

  async verifyRemoveSuccess(): Promise<void> {
    await expect(this.lastMessage).toHaveText(this.removeSuccessPattern, { timeout: 10000 });
  }
}
