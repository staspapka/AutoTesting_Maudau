import { test, expect } from '@playwright/test';
import { PriceUtils } from '../utils/PriceUtils';
import { CartDrawer } from '../pages/CartDrawer';
import { ProductPage } from '../pages/ProductPage';
import { CatalogPage } from '../pages/CatalogPage';
import { BasePage } from '../pages/BasePage';

import { searchData, testProduct } from '../testData/products';
import { priceFilter } from '../testData/filters';

test('Search product by name', async ({ page }) => {
  const catalog = new CatalogPage(page);
  const base = new BasePage(page);

  await base.goto('home');

  await catalog.search(searchData.searchQuery);

  await base.confirmAge();

  const firstTitle = catalog.productTitles.first();

  await expect(firstTitle).toBeVisible();
  await expect(firstTitle).toContainText(searchData.searchQuery, { ignoreCase: true });
});

test('Filter Products by Price Range', async ({ page }) => {
  const catalog = new CatalogPage(page);
  const base = new BasePage(page);

  await base.goto('whiskyCategory');

  await base.confirmAge();

  await catalog.filterByPrice(priceFilter.min, priceFilter.max);

  await expect(page).toHaveURL(new RegExp(`price=${priceFilter.min}00-${priceFilter.max}00`));

  const allPricesText = await catalog.productPrices.allTextContents();

  for (const priceText of allPricesText) {
    const cleanPrice = PriceUtils.clean(priceText);

    expect(cleanPrice).toBeGreaterThanOrEqual(Number(priceFilter.min));
    expect(cleanPrice).toBeLessThanOrEqual(Number(priceFilter.max));
  }
});

test('Sort Products by Price', async ({ page }) => {
  const catalog = new CatalogPage(page);
  const base = new BasePage(page);

  await base.goto('whiskyCategory');
  await base.confirmAge();

  await catalog.sortByCheap();

  const firstPrice = await catalog.getPriceByIndex(0);
  const secondPrice = await catalog.getPriceByIndex(1);

  expect(firstPrice).toBeLessThanOrEqual(secondPrice);
});

test('Add prduct to cart', async ({ page }) => {
  const productPage = new ProductPage(page);
  const cart = new CartDrawer(page);
  const base = new BasePage(page);

  await base.goto('specificProduct');

  await base.confirmAge();

  const pagePrice = PriceUtils.clean(await productPage.priceLabel.innerText());

  await productPage.addToCart();
  await productPage.openCart();

  await expect(cart.container).toBeVisible();
  await expect(cart.countLabel).toContainText(/^1/);

  const cartPrice = PriceUtils.clean(await cart.totalPriceLabel.innerText());
  expect(cartPrice).toBe(pagePrice);
});

test('Increase Product Quantity in Cart', async ({ page }) => {
  const productPage = new ProductPage(page);
  const cart = new CartDrawer(page);
  const base = new BasePage(page);

  await base.goto('specificProduct');

  await base.confirmAge();
  const unitPrice = PriceUtils.clean(await productPage.priceLabel.innerText());

  await productPage.addToCart();
  await productPage.openCart();

  await expect(cart.container).toBeVisible();
  await cart.addOneMore();

  await expect(cart.countLabel).toContainText('2');

  const finalCartPrice = PriceUtils.clean(await cart.totalPriceLabel.innerText());
  expect(finalCartPrice).toBe(unitPrice * 2);
});

test('Remove Product from Cart', async ({ page }) => {
  const productPage = new ProductPage(page);
  const cart = new CartDrawer(page);
  const base = new BasePage(page);

  await base.goto('specificProduct');

  await base.confirmAge();

  const productName = await productPage.title.innerText();

  await productPage.addToCart();
  await productPage.openCart();

  await expect(cart.container).toBeVisible();
  await expect(cart.cartItems).toHaveCount(1);

  await cart.removeProduct(productName);

  await expect(cart.emptyCartHeading).toBeVisible({ timeout: 10000 });

  await expect(cart.cartItems).toHaveCount(0);
});
