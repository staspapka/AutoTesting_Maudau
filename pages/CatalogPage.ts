import { BasePage } from './BasePage';
import { Locator, Page, expect } from '@playwright/test';
import { PriceUtils } from '../utils/PriceUtils';

export class CatalogPage extends BasePage {
  readonly headerContainer: Locator;
  readonly filterContainer: Locator;

  readonly searchInput: Locator;
  readonly searchBtn: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly submitPriceBtn: Locator;
  readonly sortTrigger: Locator;
  readonly cheapSortOption: Locator;
  readonly productPrices: Locator;
  readonly productTitles: Locator;

  constructor(page: Page) {
    super(page);

    this.headerContainer = this.page.locator('header');
    this.searchInput = this.headerContainer.getByTestId('searchInput');
    this.searchBtn = this.headerContainer.getByTestId('searchBtn');

    this.filterContainer = this.page.locator('aside, .filter-block').first();
    this.minPriceInput = this.page.getByTestId('fromPrice');
    this.maxPriceInput = this.page.getByTestId('toPrice');
    this.submitPriceBtn = this.page.getByTestId('submitPriceBtn');
    this.sortTrigger = page.getByTestId('sortBy').getByRole('button');
    this.cheapSortOption = page.getByTestId('sortModal').locator('a[href*="sort=cheap"]');
    this.productPrices = page.getByTestId('finalPrice');
    this.productTitles = this.page.getByTestId('productName');
  }

  async search(productName: string) {
    await this.page.waitForLoadState('networkidle');
    await this.searchInput.fill(productName);
    await this.searchBtn.click();
  }

  async filterByPrice(min: string, max: string) {
    await this.minPriceInput.fill(min);
    await this.maxPriceInput.fill(max);
    await this.submitPriceBtn.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async sortByCheap() {
    await this.sortTrigger.hover();
    await expect(this.cheapSortOption).toBeVisible({ timeout: 10000 });
    await this.cheapSortOption.click();
    await this.page.waitForURL(/\/sort=cheap/);
  }

  async getPriceByIndex(index: number): Promise<number> {
    const priceText = await this.productPrices.nth(index).innerText();
    return PriceUtils.clean(priceText);
  }
}
