import { test, expect } from '../fixtures/base';

test.describe('Catalog Filters Validation', () => {
  test.beforeEach(async ({ page, data }) => {
    await page.goto(data.routes.hairOilCategory);
    await page.waitForLoadState('domcontentloaded');
  });

  test('Should filter by Popular Filters', async ({ catalogPage, page }) => {
    await catalogPage.selectFilter(/Популярн/i, /Акції|Акции/i);
    await expect(page).toHaveURL(/populiarni_filtry=promo/);
  });

  test('Should filter by Delivery status', async ({ catalogPage, page }) => {
    await catalogPage.selectFilter(/Доставк/i, /Готов/i);
    await expect(page).toHaveURL(/delivery=ready_for_delivery/);
  });

  test('Should filter by Price range', async ({ catalogPage, page, data, utils }) => {
    const { min, max } = data.filters;

    await catalogPage.filterByPrice(min, max);

    await expect(page).toHaveURL(new RegExp(`price=${min}00-${max}00`));

    const allPricesText = await catalogPage.productPrices.allTextContents();

    const prices = allPricesText.map((text) => utils.clean(text));

    expect(prices.length).toBeGreaterThan(0);

    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(Number(min));
      expect(price).toBeLessThanOrEqual(Number(max));
    }
  });

  test('Should filter by Brand', async ({ catalogPage }) => {
    await catalogPage.selectFilter('Бренд', 'Elgon');

    const titles = await catalogPage.productTitles.allInnerTexts();

    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) {
      expect(title.toLowerCase()).toContain('elgon');
    }
  });

  test('Should filter by Product Type', async ({ catalogPage, page }) => {
    await catalogPage.selectFilter('Вид', /Арганов/i);
    await expect(page).toHaveURL(/vyd_66=arhanova-2/);
  });

  test('Should filter by Gender', async ({ catalogPage, page }) => {
    await catalogPage.selectFilter(/Стать|Пол/i, /Женские|Жіночі/i);
    await expect(page).toHaveURL(/stat_18=zhinochi-5/);
  });
});
