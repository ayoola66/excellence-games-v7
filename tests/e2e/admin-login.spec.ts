import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test.setTimeout(60000); // Increase timeout to 60 seconds
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and ensure it's loaded
    await page.goto('http://localhost:3000/admin/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  });
  test('should successfully login with correct credentials', async ({ page }) => {
    // Wait for email input to be visible as it's a more reliable indicator
    await page.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000
    });
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'superadmin@elitegames.com');
    await page.fill('input[type="password"]', 'Passw0rd');
    
    // Click submit and log the response
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/admin/auth/login')),
      page.click('button[type="submit"]')
    ]);
    
    // Log response details for debugging
    console.log('Response status:', response.status());
    const responseBody = await response.json().catch(() => null);
    console.log('Response body:', responseBody);
    
    // Add delay to ensure redirect happens
    await page.waitForTimeout(2000);
    
    // Get current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we're redirected to dashboard
    expect(currentUrl).toContain('/admin/dashboard');
  });
});
