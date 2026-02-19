import { test, expect } from '../fixtures/base';

test('Search product by name', async ({ catalogPage, basePage, data }) => {
  await basePage.goto('home');
  await basePage.changeToRus();

  await catalogPage.search(data.search.searchQuery);

  await basePage.confirmAge();

  const firstTitle = catalogPage.productTitles.first();

  await expect(firstTitle).toBeVisible();
  await expect(firstTitle).toContainText(data.search.searchQuery, { ignoreCase: true });
});

test('Filter Products by Price Range', async ({ catalogPage, data, utils, basePage }) => {
  await basePage.goto('whiskyCategory');
  await basePage.confirmAge();
  await basePage.changeToRus();

  await catalogPage.filterByPrice(data.filters.min, data.filters.max);

  const appliedMin = Number(await catalogPage.minPriceInput.inputValue());
  const appliedMax = Number(await catalogPage.maxPriceInput.inputValue());

  const allPricesText = await catalogPage.productPrices.allTextContents();
  const prices = allPricesText.map((text) => utils.clean(text));

  expect(prices.length).toBeGreaterThan(0);

  for (const price of prices) {
    expect(price).toBeGreaterThanOrEqual(appliedMin);
    expect(price).toBeLessThanOrEqual(appliedMax);
  }
});

test('Sort Products by Price', async ({ catalogPage, basePage }) => {
  await basePage.goto('whiskyCategory');
  await basePage.changeToRus();
  await basePage.confirmAge();

  await catalogPage.sortByCheap();

  const prices = await catalogPage.getAllProductPrices();

  expect(prices.length).toBeGreaterThan(1);

  for (let i = 0; i < prices.length - 1; i++) {
    const currentPrice = prices[i];
    const nextPrice = prices[i + 1];

    expect(currentPrice).toBeLessThanOrEqual(nextPrice);
  }
});

test('Add prduct to cart', async ({ productPage, cartDrawer, basePage, utils }) => {
  await basePage.goto('specificProduct');
  await basePage.changeToRus();
  await basePage.confirmAge();

  const pagePrice = utils.clean(await productPage.priceLabel.innerText());

  await productPage.addToCart();
  await basePage.openCart();

  await expect(cartDrawer.container).toBeVisible();
  await expect(cartDrawer.countLabel).toContainText(/^1/);

  const cartPrice = utils.clean(await cartDrawer.totalPriceLabel.innerText());
  expect(cartPrice).toBe(pagePrice);
});

test('Increase Product Quantity in Cart', async ({ productPage, cartDrawer, basePage, utils }) => {
  await basePage.goto('specificProduct');
  await basePage.changeToRus();
  await basePage.confirmAge();

  const unitPrice = utils.clean(await productPage.priceLabel.innerText());

  await productPage.addToCart();
  await basePage.openCart();

  await expect(cartDrawer.container).toBeVisible();
  await cartDrawer.addOneMore();

  await expect(cartDrawer.countLabel).toContainText('2');

  const finalCartPrice = utils.clean(await cartDrawer.totalPriceLabel.innerText());
  expect(finalCartPrice).toBe(unitPrice * 2);
});

test('Remove Product from Cart', async ({ productPage, cartDrawer, basePage }) => {
  await basePage.goto('specificProduct');
  await basePage.changeToRus();
  await basePage.confirmAge();

  const productName = await productPage.title.innerText();

  await productPage.addToCart();
  await basePage.openCart();

  await expect(cartDrawer.container).toBeVisible();
  await expect(cartDrawer.cartItems).toHaveCount(1);

  await cartDrawer.removeProduct(productName);

  await expect(cartDrawer.cartItems).toHaveCount(0);
});

test('Complex test add, remove and add another', async ({
  catalogPage,
  cartDrawer,
  basePage,
  notification,
  page,
  data,
}) => {
  const ps5 = data.products.ps5Bundle;
  const nintendo = data.products.Nintendo;

  await basePage.goto('home');
  await basePage.changeToRus();

  await catalogPage.openCatalog();
  await catalogPage.tech.click();
  await catalogPage.goodsForGamers.click();
  await catalogPage.consoles.click();

  const expectedPricePs = await catalogPage.getProductPrice(ps5.slug);
  await catalogPage.clickAddToCart(ps5.slug);
  await notification.waitForVisible(notification.addSuccessPattern);
  await notification.verifyAddSuccess();

  await basePage.openCart();
  await expect(cartDrawer.container).toBeVisible();

  const actualPricePS = await cartDrawer.getProductPriceBySlug(ps5.slug);
  expect(expectedPricePs).toBe(actualPricePS);

  await cartDrawer.removeProduct(ps5.name);
  await notification.waitForVisible(notification.removeSuccessPattern);
  await notification.verifyRemoveSuccess();

  await cartDrawer.cartCloseButton.click();

  const expectedPriceNintendo = await catalogPage.getProductPrice(nintendo.slug);
  await catalogPage.clickAddToCart(nintendo.slug);
  await notification.waitForVisible(notification.addSuccessPattern);
  await notification.verifyAddSuccess();

  await basePage.openCart();
  await expect(cartDrawer.container).toBeVisible();

  const actualPriceNintendo = await cartDrawer.getProductPriceBySlug(nintendo.slug);
  expect(expectedPriceNintendo).toBe(actualPriceNintendo);

  await cartDrawer.checkOut.click();

  const checkoutPattern = new RegExp(`${data.routes.checkOutUa}|${data.routes.checkOutRu}`);
  await expect(page).toHaveURL(checkoutPattern);
});
