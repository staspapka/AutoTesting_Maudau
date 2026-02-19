import { faker } from '@faker-js/faker';

export const devicePayloads = {
  iphone14: {
    name: 'Apple iPhone 14 Pro',
    data: {
      year: 2022,
      price: 1499.99,
      'CPU model': 'A16',
      'Hard disk size': '256 GB',
    },
  },
  iphone14Updated: {
    name: 'Apple iPhone 14 Pro (Updated)',
    data: {
      year: faker.number.int({ min: 2020, max: 2025 }),
      price: parseFloat(faker.commerce.price({ min: 800, max: 1500 })),
      'CPU model': 'A16',
      'Hard disk size': `${faker.helpers.arrayElement(['128', '256', '512'])} GB`,
    },
  },
  iphonePatch: {
    name: 'iPhone 14 Pro Deep Purple',
  },
};
