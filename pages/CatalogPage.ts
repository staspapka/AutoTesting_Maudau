import { BasePage } from './BasePage';
import { Locator, Page, expect } from '@playwright/test';
import { PriceUtils } from '../utils/PriceUtils';

export class CatalogPage extends BasePage {
  readonly headerContainer: Locator;
  readonly filterContainer: Locator;
  readonly filterSidebar: Locator;

  readonly searchInput: Locator;
  readonly searchBtn: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly submitPriceBtn: Locator;
  readonly sortTrigger: Locator;
  readonly cheapSortOption: Locator;
  readonly productPrices: Locator;
  readonly productTitles: Locator;
  readonly catalogBtn: Locator;
  readonly tech: Locator;
  readonly goodsForGamers: Locator;
  readonly consoles: Locator;
  readonly ps5: Locator;
  readonly addToCart: Locator;

  constructor(page: Page) {
    super(page);

    this.headerContainer = this.page.locator('header');
    this.searchInput = this.headerContainer.getByTestId('searchInput');
    this.searchBtn = this.headerContainer.getByTestId('searchBtn');
    this.filterSidebar = this.page.getByTestId('filterSidebar');

    this.filterContainer = this.page.locator('aside, .filter-block').first();
    this.minPriceInput = this.page.getByTestId('fromPrice');
    this.maxPriceInput = this.page.getByTestId('toPrice');
    this.submitPriceBtn = this.page.getByTestId('submitPriceBtn');
    this.sortTrigger = page.getByTestId('sortBy').getByRole('button');

    this.cheapSortOption = page.getByTestId('sortModal').locator('a[href*="sort=cheap"]');
    this.productPrices = page.getByTestId('finalPrice');
    this.productTitles = this.page.getByTestId('productName');
    this.catalogBtn = this.headerContainer.getByTestId('catalog');

    this.tech = page.locator('a[data-testid="menuLink"][href*="/elektronika"]');
    this.goodsForGamers = page.locator('a[data-testid="menuLink"][href*="/tovary-dlia-heimeriv"]');

    this.consoles = page.locator('a[data-testid="menuLink"][href*="/ihrovi-prystavky"]');
    this.ps5 = page.locator('div[data-testid="productItem"]').filter({
      has: page.locator(
        'a[href*="yhrovaia-konsol-sony-playstation-5-slim-1tb-ustroistvo-dlia-dystantsyonnoi-yhr-sony-playstation-portal-white"]',
      ),
    });
    this.addToCart = page.getByTestId('addToCart');
  }

  private getProductCard(slug: string): Locator {
    return this.page.locator('div[data-testid="productItem"]').filter({
      has: this.page.locator(`a[href*="${slug}"]`),
    });
  }

  async search(productName: string) {
    await this.page.waitForLoadState('networkidle');
    await this.searchInput.fill(productName);
    await this.searchBtn.click();
  }

  async filterByPrice(min: string, max: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await this.minPriceInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(5000);
    await this.minPriceInput.fill(min);
    await this.maxPriceInput.fill(max);

    await this.submitPriceBtn.click();
    await this.page.waitForURL(new RegExp(`price=${min}00-${max}00`), { timeout: 30000 });
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

  async openCatalog() {
    await this.catalogBtn.hover();
    await this.page.waitForTimeout(5000);
    await this.catalogBtn.click();
  }

  async getProductPrice(slug: string): Promise<number> {
    const card = this.getProductCard(slug);
    const rawPrice = await card.getByTestId('finalPrice').innerText();
    return PriceUtils.clean(rawPrice);
  }

  async getProductName(slug: string): Promise<string> {
    const card = this.getProductCard(slug);
    const name = await card.getByTestId('productName').innerText();
    return name;
  }

  async clickAddToCart(slug: string): Promise<void> {
    const card = this.getProductCard(slug);
    await card.getByTestId('addToCart').click();
  }

  async selectFilter(categoryName: string | RegExp, value: string | RegExp) {
    const categoryBlock = this.filterSidebar
      .locator('.md-css-15p3k2a', { hasText: categoryName })
      .first();
    const categoryButton = categoryBlock.getByTestId('filter');

    const isCollapsed = await categoryBlock.locator('div[style*="max-height: 0px"]').isVisible();
    if (isCollapsed) {
      await categoryButton.dispatchEvent('click');
      await this.page.waitForTimeout(1000);
    }

    const option = categoryBlock.locator('a.checkbox', { hasText: value }).first();

    await option.scrollIntoViewIfNeeded();

    await this.page.mouse.wheel(0, -150);

    await option.dispatchEvent('click');

    await this.page.waitForLoadState('networkidle');
  }

  async verifyFilterBadgeVisible(value: string) {
    const badge = this.page.locator('.active-filters, .filter-badge', { hasText: value });
    await expect(badge).toBeVisible({ timeout: 10000 });
  }

  async getAllProductPrices(): Promise<number[]> {
    const priceElements = await this.productPrices.allInnerTexts();
    return priceElements.map((text) => PriceUtils.clean(text));
  }
}
