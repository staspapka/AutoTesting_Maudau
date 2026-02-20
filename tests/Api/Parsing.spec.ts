import { test, expect } from '../../fixtures/base';
import { User } from './controllers/JsonPlaceholderController';

test.describe('JSON Placeholder API: Full Validation Suite', () => {
  let users: User[];

  test.beforeEach(async ({ apiPlaceholder }) => {
    users = await apiPlaceholder.getUsers();
  });

  test('Test 1 - Should validate users array structure and mandatory fields', async () => {
    expect(Array.isArray(users), 'Response should be an array').toBe(true);
    expect(users).toHaveLength(10);

    users.forEach((user) => {
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.address.city).toBeDefined();

      expect(typeof user.id).toBe('number');
      expect(user.email).toContain('@');
    });
  });

  test('Test 2 - Should find specific user and filter emails', async () => {
    const userFive = users.find((u) => u.id === 5);
    expect(userFive, 'User with ID 5 should exist').toBeDefined();
    expect(userFive?.username).toBe('Kamren');

    const bizEmails = users
      .filter((u) => u.email.toLowerCase().endsWith('.biz'))
      .map((u) => u.email);

    expect(bizEmails.length).toBeGreaterThan(0);
    console.log('Emails ending with .biz:', bizEmails);
  });

  test('Test 3 - Typing and Helper Function validation', async () => {
    const getUserByEmail = (list: User[], email: string): User | undefined => {
      return list.find((u) => u.email.toLowerCase() === email.toLowerCase());
    };

    const emailToSearch = 'Lucio_Hettinger@annie.ca';
    const result = getUserByEmail(users, emailToSearch);

    expect(result).toBeDefined();
    expect(result?.username).toBe('Kamren');
    expect(result?.id).toBe(5);
  });

  test('Test 4 - Aggregate posts by user and find the most active one', async ({
    apiPlaceholder,
  }) => {
    const posts = await apiPlaceholder.getPosts();

    const postCounts = posts.reduce(
      (acc, post) => {
        acc[post.userId] = (acc[post.userId] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    console.log('Post distribution by UserID:', postCounts);

    const userIds = Object.keys(postCounts).map(Number);
    const topUserId = userIds.reduce((a, b) => (postCounts[a] > postCounts[b] ? a : b));
    const maxPostsCount = postCounts[topUserId];

    console.log(`Top User: ID ${topUserId} with ${maxPostsCount} posts`);

    expect(userIds.length).toBeGreaterThan(0);
    expect(maxPostsCount).toBeGreaterThan(0);

    expect(postCounts[3]).toBe(10);
  });
});
