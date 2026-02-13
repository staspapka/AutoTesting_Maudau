import { Page, Locator, expect } from '@playwright/test';
import { routes } from '../testData/routes';

export class BasePage {
  readonly page: Page;
  readonly ageModal: Locator;
  readonly confirmAgeBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ageModal = page.getByRole('dialog', { name: 'Вам вже виповнилось 18 років?' });
    this.confirmAgeBtn = this.ageModal.getByRole('button', { name: 'Так' });
  }

  async goto(route: keyof typeof routes) {
    await this.page.goto(routes[route], { waitUntil: 'domcontentloaded' });
  }

  async confirmAge() {
    await expect(this.ageModal).toBeVisible({ timeout: 15000 });
    await this.confirmAgeBtn.click();
  }
}
