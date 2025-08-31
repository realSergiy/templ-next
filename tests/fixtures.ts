import { test as base, type Page } from '@playwright/test';

type TestFixtures = {
  roadmapWithFeatures: Page;
};

export const test = base.extend<TestFixtures>({
  page: async ({ page }, use) => {
    // Seed database before each test
    const response = await page.request.post('/api/test/seed');
    if (!response.ok()) {
      throw new Error(`Failed to seed database: ${response.status()}`);
    }
    
    await use(page);
  },

  roadmapWithFeatures: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10_000 });

    // Wait for features to load from seeded database
    await page.waitForSelector('g.group', { timeout: 5000 });

    const featureCount = await page.locator('g.group').count();
    if (featureCount === 0) {
      throw new Error('No features found after seeding database');
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
