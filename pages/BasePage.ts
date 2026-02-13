import { Page, Locator, expect } from '@playwright/test';
import { routes } from '../testData/routes';

export class BasePage {
  readonly page: Page;
  readonly ageModal: Locator;
  readonly confirmAgeBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.ageModal = page.locator('div[data-slot="dialog-content"]');
    this.confirmAgeBtn = this.ageModal.locator('button.bg-primary-20');
  }

  async goto(route: keyof typeof routes) {
    await this.page.goto(routes[route], { waitUntil: 'domcontentloaded' });
  }

  async changeToRus() {
    const ruLink = this.page.getByTestId('languageSwitcher').getByRole('link', { name: 'Рус' });

    const ruPattern = /\/ru($|\/)/;

    await Promise.all([this.page.waitForURL(ruPattern, { timeout: 20000 }), ruLink.click()]);

    await expect(this.page).toHaveURL(ruPattern);
  }

  async changeToUa() {
    const uaLink = this.page.getByTestId('languageSwitcher').getByRole('link', { name: 'Укр' });

    await Promise.all([
      this.page.waitForURL((url) => !url.pathname.match(/\/ru($|\/)/), { timeout: 20000 }),
      uaLink.click(),
    ]);

    await expect(this.page).not.toHaveURL(/\/ru($|\/)/);
  }

  async confirmAge() {
    try {
      await expect(this.ageModal).toBeVisible({ timeout: 15000 });
      await this.confirmAgeBtn.click();
      await expect(this.ageModal).toBeHidden();
    } catch (e) {
      console.log('Age confirmation modal did not appear or was already closed.');
    }
  }
}
