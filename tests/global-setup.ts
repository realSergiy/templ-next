import { chromium } from '@playwright/test';

const globalSetup = async () => {
  // Set environment variable for test mode
  process.env.PLAYWRIGHT_TEST = 'true';

  // Launch browser to trigger Next.js build if needed
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
  } catch {
    console.log('Initial page load failed, server might be starting...');
  } finally {
    await browser.close();
  }
};

export default globalSetup;
