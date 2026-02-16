import { test, expect } from '@playwright/test';
import { PriceUtils } from '../utils/PriceUtils';
import { CartDrawer } from '../pages/CartDrawer';
import { ProductPage } from '../pages/ProductPage';
import { CatalogPage } from '../pages/CatalogPage';
import { BasePage } from '../pages/BasePage';
import { products } from '../testData/products';
import { routes } from '../testData/routes';
import { NotificationComponent } from '../components/notification';

import { searchData, testProduct } from '../testData/products';
import { priceFilter } from '../testData/filters';

test('Search product by name', async ({ page }) => {
  const catalog = new CatalogPage(page);
  const base = new BasePage(page);

  await base.goto('home');

  await base.changeToRus();

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
  await base.changeToRus();

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

  await base.changeToRus();

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

  await base.changeToRus();

  await base.confirmAge();

  const pagePrice = PriceUtils.clean(await productPage.priceLabel.innerText());

  await productPage.addToCart();
  await base.openCart();

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

  await base.changeToRus();

  await base.confirmAge();

  const unitPrice = PriceUtils.clean(await productPage.priceLabel.innerText());

  await productPage.addToCart();
  await base.openCart();

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

  await base.changeToRus();

  await base.confirmAge();

  const productName = await productPage.title.innerText();

  await productPage.addToCart();
  await base.openCart();

  await expect(cart.container).toBeVisible();
  await expect(cart.cartItems).toHaveCount(1);

  await cart.removeProduct(productName);

  await expect(cart.cartItems).toHaveCount(0);
});

test('Complex test add, remove and add another', async ({ page }) => {
  const cart = new CartDrawer(page);
  const base = new BasePage(page);
  const catalog = new CatalogPage(page);
  const notification = new NotificationComponent(page);

  const ps5 = products.ps5Bundle;
  const nintendo = products.Nintendo;

  await base.goto('home');

  await base.changeToRus();

  await catalog.openCatalog();
  await catalog.tech.click();
  await catalog.goodsForGamers.click();
  await catalog.consoles.click();

  const expectedPricePs = await catalog.getProductPrice(ps5.slug);
  await catalog.clickAddToCart(ps5.slug);
  await notification.waitForVisible(notification.addSuccessPattern);
  await notification.verifyAddSuccess();

  await base.openCart();
  await expect(cart.container).toBeVisible();

  const actualPricePS = await cart.getProductPriceBySlug(ps5.slug);

  await expect(expectedPricePs).toBe(actualPricePS);

  await cart.removeProduct(ps5.name);
  await notification.waitForVisible(notification.removeSuccessPattern);
  await notification.verifyRemoveSuccess();

  await cart.cartCloseButton.click();

  const expectedPriceNintendo = await catalog.getProductPrice(nintendo.slug);

  await catalog.clickAddToCart(nintendo.slug);
  await notification.waitForVisible(notification.addSuccessPattern);
  await notification.verifyAddSuccess();

  await base.openCart();
  await expect(cart.container).toBeVisible();

  const actualPriceNintendo = await cart.getProductPriceBySlug(nintendo.slug);

  await expect(expectedPriceNintendo).toBe(actualPriceNintendo);

  await cart.checkOut.click();

  const checkoutPattern = new RegExp(`${routes.checkOutUa}|${routes.checkOutRu}`);
  await expect(page).toHaveURL(checkoutPattern);
});
