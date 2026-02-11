import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://maudau.com.ua/', { waitUntil: 'networkidle' });
});

test('Search product by name', async ({ page }) => {
  const searchInput = page.getByTestId('searchInput');
  const productName = 'Jameson';
  const expectedUrlPart = `search?text=${productName}`;

  const ageConfirmationModal = page.getByRole('dialog');

  const confirmButton = page.getByRole('button', { name: 'Так' });
  const firstProductTitle = page.getByTestId('productName').first();

  const searchButton = page.getByTestId('searchBtn');

  await searchInput.fill(productName);

  await searchButton.click();

  await ageConfirmationModal.isVisible;
  await confirmButton.click();

  await expect(firstProductTitle).toBeVisible();
  await expect(firstProductTitle).toContainText(productName, { ignoreCase: true });
});
