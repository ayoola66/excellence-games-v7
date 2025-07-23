import { test, expect } from '@playwright/test';

test('debug game creation form', async ({ page }) => {
  // Enable verbose console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  // Navigate to login page
  await page.goto('http://localhost:3000/admin/login');

  // Fill in login credentials
  await page.fill('input[name="email"]', 'superadmin@elitegames.com');
  await page.fill('input[type="password"]', 'Passw0rd');
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForURL('http://localhost:3000/admin/dashboard');

  // Navigate to new game form
  await page.goto('http://localhost:3000/admin/games/new');

  // Fill in game details
  await page.fill('input[name="name"]', 'Test Game ' + Date.now());
  await page.fill('textarea[name="description"]', 'A test game description');
  await page.selectOption('select[name="type"]', 'SOLO');
  await page.selectOption('select[name="status"]', 'PUBLISHED');

  // Watch network requests
  page.on('request', request => {
    if (request.url().includes('/api/games')) {
      console.log('REQUEST:', {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        data: request.postData()
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/games')) {
      console.log('RESPONSE:', {
        url: response.url(),
        status: response.status(),
        body: await response.text().catch(() => 'Could not get response body')
      });
    }
  });

  // Click submit and observe what happens
  await page.click('button[type="submit"]');

  // Wait for any network requests to complete
  await page.waitForLoadState('networkidle');

  // Stay on page for a moment to capture any errors
  await page.waitForTimeout(2000);
});
