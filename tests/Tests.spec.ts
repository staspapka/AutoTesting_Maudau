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
