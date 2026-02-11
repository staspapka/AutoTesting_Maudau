import { test, expect } from '@playwright/test';

test('Search product by name', async ({ page }) => {
  const searchInput = page.getByTestId('searchInput');
  const productName = 'Jameson';

  const ageConfirmationModal = page.getByRole('dialog', { name: 'Вам вже виповнилось 18 років?' });
  const confirmButton = page.getByRole('button', { name: 'Так' });

  const firstProductTitle = page.getByTestId('productName').first();

  const searchButton = page.getByTestId('searchBtn');

  await page.goto('https://maudau.com.ua/', { waitUntil: 'networkidle' });

  await searchInput.fill(productName);

  await searchButton.click();

  await ageConfirmationModal.isVisible;
  await confirmButton.click();

  await expect(firstProductTitle).toBeVisible();
  await expect(firstProductTitle).toContainText(productName, { ignoreCase: true });
});

test('Filter Products by Price Range', async ({ page }) => {
  const minPrice = '500';
  const maxPrice = '1000';

  const minInput = page.getByTestId('fromPrice');
  const maxInput = page.getByTestId('toPrice');

  const ageConfirmationModal = page.getByRole('dialog', { name: 'Вам вже виповнилось 18 років?' });
  const confirmButton = page.getByRole('button', { name: 'Так' });

  const acceptFilerButton = page.getByTestId('submitPriceBtn');
  const productPrices = page.getByTestId('finalPrice');

  await page.goto('https://maudau.com.ua/category/viski', { waitUntil: 'networkidle' });

  await ageConfirmationModal.isVisible;
  await confirmButton.click();

  await minInput.fill(minPrice);
  await maxInput.fill(maxPrice);
  await acceptFilerButton.click();

  await expect(page).toHaveURL(new RegExp(`price=${minPrice}00-${maxPrice}00`));
  await expect(page.getByTestId('activeFilter')).toBeVisible();

  const allPricesText = await productPrices.allTextContents();

  for (const priceText of allPricesText) {
    const cleanPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
    const minRangePrice = 500;
    const maxRangePrice = 1000;

    expect(cleanPrice).toBeGreaterThanOrEqual(minRangePrice);
    expect(cleanPrice).toBeLessThanOrEqual(maxRangePrice);
  }
});

test('Sort Products by Price', async ({ page }) => {
  const productPrice = page.getByTestId('finalPrice');
  const sortTrigger = page.getByTestId('sortBy').getByRole('button');

  const ageConfirmationModal = page.getByRole('dialog', { name: 'Вам вже виповнилось 18 років?' });
  const confirmButton = page.getByRole('button', { name: 'Так' });

  const cheapLink = page.getByTestId('sortModal').getByRole('link', { name: 'Дешеві' });

  await page.goto('https://maudau.com.ua/category/viski', { waitUntil: 'networkidle' });

  await expect(ageConfirmationModal).toBeVisible;
  await confirmButton.click();

  await sortTrigger.hover();
  await expect(cheapLink).toBeVisible({ timeout: 5000 });
  await cheapLink.click();

  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(new RegExp('/category/viski/sort=cheap'));

  const firstPriceText = await productPrice.nth(0).innerText();
  const secondPriceText = await productPrice.nth(1).innerText();

  const firstPrice = parseInt(firstPriceText.replace(/\s/g, ''));
  const secondPrice = parseInt(secondPriceText.replace(/\s/g, ''));

  expect(firstPrice).toBeLessThanOrEqual(secondPrice);
});

test('Add prduct to cart', async ({ page }) => {
  const productPriceOnPage = page.getByTestId('productSideBlock').getByTestId('finalPrice');
  const ageConfirmationModal = page.getByRole('dialog', { name: 'Вам вже виповнилось 18 років?' });
  const confirmButton = page.getByRole('button', { name: 'Так' });

  const buyButton = page.getByTestId('productSideBlock').getByTestId('addToCartBtn');
  const cartOpen = page.getByTestId('Cart');

  const cartProductCount = page.getByTestId('productInCartTotalCount');
  const cartTotalPrice = page.getByTestId('totalPrice');

  await page.goto(
    'https://maudau.com.ua/product/viski-douglas-laing-xop-macallan-1990-30-yo-single-malt-scotch-whisky-v-korobtsi-444-07-l',
    { waitUntil: 'networkidle' },
  );

  await expect(ageConfirmationModal).toBeVisible;
  await confirmButton.click();

  const pagePriceText = await productPriceOnPage.innerText();
  const pagePrice = parseInt(pagePriceText.replace(/[^0-9]/g, ''));

  await buyButton.click();
  await cartOpen.click();

  await expect(page.getByRole('heading', { name: 'Кошик' })).toBeVisible();

  await expect(cartProductCount).toContainText(/^1/);

  const cartPriceText = await cartTotalPrice.innerText();
  const cartPrice = parseInt(cartPriceText.replace(/[^0-9]/g, ''));

  expect(cartPrice).toBe(pagePrice);
});

test('Increase Product Quantity in Cart', async ({ page }) => {
  const productPriceOnPage = page.getByTestId('productSideBlock').getByTestId('finalPrice');
  const ageConfirmationModal = page.getByRole('dialog', { name: 'Вам вже виповнилось 18 років?' });
  const confirmButton = page.getByRole('button', { name: 'Так' });

  const buyButton = page.getByTestId('productSideBlock').getByTestId('addToCartBtn');
  const cartOpen = page.getByTestId('Cart');

  const cartProductCount = page.getByTestId('productInCartTotalCount');
  const cartTotalPrice = page.getByTestId('totalPrice');
  const cartDrawer = page.locator('nav.EZDrawer__container').filter({ hasText: 'Кошик' });

  const plusButton = cartDrawer.getByTestId('plus');
  const multiplyer = '2';

  await page.goto(
    'https://maudau.com.ua/product/viski-douglas-laing-xop-macallan-1990-30-yo-single-malt-scotch-whisky-v-korobtsi-444-07-l',
    { waitUntil: 'networkidle' },
  );

  await expect(ageConfirmationModal).toBeVisible;
  await confirmButton.click();

  const pagePriceText = await productPriceOnPage.innerText();
  const pagePrice = parseInt(pagePriceText.replace(/[^0-9]/g, ''));

  await buyButton.click();
  await cartOpen.click();

  await expect(cartDrawer).toBeVisible();

  await plusButton.click();

  await expect(cartProductCount).toContainText(new RegExp(multiplyer));

  const cartPriceText = await cartTotalPrice.innerText();
  const cartPrice = parseInt(cartPriceText.replace(/[^0-9]/g, ''));

  expect(cartPrice).toBe(pagePrice * Number(multiplyer));
});
