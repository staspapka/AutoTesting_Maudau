import { test, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';
import { routes } from '../testData/routes';
import { priceFilter } from '../testData/filters';
import { PriceUtils } from '../utils/PriceUtils';

test.describe('Catalog Filters Validation', () => {
  let catalog: CatalogPage;
  const filters = priceFilter;

  test.beforeEach(async ({ page }) => {
    catalog = new CatalogPage(page);
    await page.goto(routes.hairOilCategory);
    await page.waitForLoadState('domcontentloaded');
  });

  test('Should filter by Popular Filters', async () => {
    await catalog.selectFilter(/Популярн/i, /Акції|Акции/i);
    await expect(catalog.page).toHaveURL(/populiarni_filtry=promo/);
  });

  test('Should filter by Delivery status', async () => {
    await catalog.selectFilter(/Доставк/i, /Готов/i);
    await expect(catalog.page).toHaveURL(/delivery=ready_for_delivery/);
  });

  test('Should filter by Price range', async ({ page }) => {
    const catalog = new CatalogPage(page);

    await page.waitForLoadState('networkidle');
    await catalog.filterByPrice(filters.min, filters.max);

    const allPricesText = await catalog.productPrices.allTextContents();

    const prices = allPricesText.map((text) => PriceUtils.clean(text));

    expect(prices.length).toBeGreaterThan(0);

    for (const priceText of allPricesText) {
      const cleanPrice = PriceUtils.clean(priceText);

      expect(cleanPrice).toBeGreaterThanOrEqual(Number(filters.min));
      expect(cleanPrice).toBeLessThanOrEqual(Number(filters.max));
    }
  });

  test('Should filter by Brand', async () => {
    await catalog.selectFilter('Бренд', 'Elgon');
    const titles = await catalog.page.locator('.product-title').allInnerTexts();
    for (const title of titles) {
      expect(title.toLowerCase()).toContain('Elgon');
    }
  });

  test('Should filter by Product Type', async () => {
    await catalog.selectFilter('Вид', /Арганов/i);
    await expect(catalog.page).toHaveURL(/vyd_66=arhanova-2/);
  });

  test('Should filter by Gender', async () => {
    await catalog.selectFilter(/Стать|Пол/i, /Женские|Жіночі/i);
    await expect(catalog.page).toHaveURL(/stat_18=zhinochi-5/);
  });
});
