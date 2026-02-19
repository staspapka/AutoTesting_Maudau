import { test as base, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';
import { BasePage } from '../pages/BasePage';
import { CartDrawer } from '../pages/CartDrawer';
import { ProductPage } from '../pages/ProductPage';
import { NotificationComponent } from '../components/notification';
import { PriceUtils } from '../utils/PriceUtils';
import { routes } from '../testData/routes';
import { priceFilter } from '../testData/filters';
import { products, searchData } from '../testData/products';
import { DeviceController } from '../tests/Api/controllers/DeviceController';
import { devicePayloads } from '../testData/api/deviceData';

type MyFixtures = {
  catalogPage: CatalogPage;
  basePage: BasePage;
  cartDrawer: CartDrawer;
  productPage: ProductPage;
  notification: NotificationComponent;
  deviceController: DeviceController;
  utils: typeof PriceUtils;
  data: {
    routes: typeof routes;
    filters: typeof priceFilter;
    products: typeof products;
    search: typeof searchData;
    api: typeof devicePayloads;
  };
};

export const test = base.extend<MyFixtures>({
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  cartDrawer: async ({ page }, use) => {
    await use(new CartDrawer(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  notification: async ({ page }, use) => {
    await use(new NotificationComponent(page));
  },

  utils: async ({}, use) => {
    await use(PriceUtils);
  },

  deviceController: async ({ request }, use) => {
    await use(new DeviceController(request));
  },

  data: async ({}, use) => {
    await use({
      routes: routes,
      filters: priceFilter,
      products: products,
      search: searchData,
      api: devicePayloads,
    });
  },
});

export { expect };
