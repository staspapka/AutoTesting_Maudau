import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly ageModal: Locator;
  readonly confirmAgeBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ageModal = page.getByRole('dialog', { name: 'Вам вже виповнилось 18 років?' });
    this.confirmAgeBtn = this.ageModal.getByRole('button', { name: 'Так' });
  }

  async confirmAge() {
    await expect(this.ageModal).toBeVisible({ timeout: 15000 });
    await this.confirmAgeBtn.click();
  }
}
