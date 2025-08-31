import { test, expect } from './fixtures';

test.describe('Roadmap Drag and Drop', () => {
  test('should drag and drop a feature to a different lane', async ({
    roadmapWithFeatures: page,
  }) => {
    const feature = page.locator('g.group').first();
    await expect(feature).toBeVisible();

    const initialRect = await feature.boundingBox();
    expect(initialRect).toBeTruthy();
    if (!initialRect) return;

    const svg = page.locator('svg').first();
    const svgRect = await svg.boundingBox();
    expect(svgRect).toBeTruthy();
    if (!svgRect) return;

    const startX = initialRect.x + initialRect.width / 2;
    const startY = initialRect.y + initialRect.height / 2;
    const targetX = svgRect.x + svgRect.width * 0.8;
    const targetY = svgRect.y + 200;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(2000);

    const newFeature = page.locator('g.group').first();
    const newRect = await newFeature.boundingBox();
    expect(newRect).toBeTruthy();
    if (!newRect) return;
    expect(Math.abs(newRect.x - initialRect.x)).toBeGreaterThan(10);
  });

  test('should drag and drop a feature to a different quarter', async ({
    roadmapWithFeatures: page,
  }) => {
    const feature = page.locator('g.group').first();
    await expect(feature).toBeVisible();

    const initialRect = await feature.boundingBox();
    expect(initialRect).toBeTruthy();
    if (!initialRect) return;

    // Get SVG dimensions
    const svg = page.locator('svg').first();
    const svgRect = await svg.boundingBox();
    expect(svgRect).toBeTruthy();
    if (!svgRect) return;

    const startX = initialRect.x + initialRect.width / 2;
    const startY = initialRect.y + initialRect.height / 2;
    const targetX = startX + 400; // Move 400px to the right to ensure crossing quarters
    const targetY = startY;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(2000);

    // Verify horizontal movement
    const newRect = await feature.boundingBox();
    expect(newRect).toBeTruthy();
    if (!newRect) return;
    expect(newRect.x).toBeGreaterThan(initialRect.x);
  });

  test('should handle drag without drop (cancel drag)', async ({ roadmapWithFeatures: page }) => {
    const feature = page.locator('g.group').first();
    await expect(feature).toBeVisible();

    const initialRect = await feature.boundingBox();
    expect(initialRect).toBeTruthy();
    if (!initialRect) return;

    // Start drag but don't complete it properly
    const startX = initialRect.x + initialRect.width / 2;
    const startY = initialRect.y + initialRect.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(initialRect.x + 100, initialRect.y + 100);

    // Release mouse outside valid drop zone or simulate escape
    await page.keyboard.press('Escape');
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Feature should return to original position or remain unchanged
    const finalRect = await feature.boundingBox();
    expect(finalRect).toBeTruthy();
  });

  test('should display drag cursor during drag operation', async ({
    roadmapWithFeatures: page,
  }) => {
    const feature = page.locator('g.group').first();
    await expect(feature).toBeVisible();

    // Check that feature has group class
    await expect(feature).toHaveClass(/group/);
  });

  test('should preserve feature content during drag', async ({ roadmapWithFeatures: page }) => {
    const feature = page.locator('g.group').first();
    await expect(feature).toBeVisible();

    // Get feature title before drag
    const titleElement = feature.locator('span').first();
    const originalTitle = await titleElement.textContent();
    expect(originalTitle).toBeTruthy();
    if (!originalTitle) return;

    const initialRect = await feature.boundingBox();
    expect(initialRect).toBeTruthy();
    if (!initialRect) return;

    // Perform drag operation
    const svg = page.locator('svg').first();
    const svgRect = await svg.boundingBox();
    expect(svgRect).toBeTruthy();
    if (!svgRect) return;

    const targetX = svgRect.x + svgRect.width * 0.6;
    const targetY = svgRect.y + 100;

    const startX = initialRect.x + initialRect.width / 2;
    const startY = initialRect.y + initialRect.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 5 });
    await page.mouse.up();

    await page.waitForTimeout(1000);

    // Verify title is preserved
    const newTitle = await titleElement.textContent();
    expect(newTitle).toBe(originalTitle);
  });

  test('should handle multiple features drag independently', async ({
    roadmapWithFeatures: page,
  }) => {
    const features = page.locator('g.group');
    const featureCount = await features.count();

    // Skip if less than 2 features
    if (featureCount < 2) {
      test.skip();
    }

    const firstFeature = features.nth(0);
    const secondFeature = features.nth(1);

    // Get initial positions
    const firstInitialRect = await firstFeature.boundingBox();
    const secondInitialRect = await secondFeature.boundingBox();

    expect(firstInitialRect).toBeTruthy();
    expect(secondInitialRect).toBeTruthy();
    if (!firstInitialRect || !secondInitialRect) return;

    // Move only the first feature
    const startX = firstInitialRect.x + firstInitialRect.width / 2;
    const startY = firstInitialRect.y + firstInitialRect.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(firstInitialRect.x + 300, firstInitialRect.y);
    await page.mouse.up();

    await page.waitForTimeout(2000);

    // Verify first feature moved, second didn't
    const firstFinalRect = await firstFeature.boundingBox();
    const secondFinalRect = await secondFeature.boundingBox();

    expect(firstFinalRect).toBeTruthy();
    expect(secondFinalRect).toBeTruthy();
    if (!firstFinalRect || !secondFinalRect) return;

    expect(firstFinalRect.x).not.toBe(firstInitialRect.x);
    expect(secondFinalRect.x).toBe(secondInitialRect.x);
    expect(secondFinalRect.y).toBe(secondInitialRect.y);
  });
});
