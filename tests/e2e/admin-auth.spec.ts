import { test, expect } from '@playwright/test';

test.describe('Admin Authentication Flow', () => {
  test.setTimeout(120000); // 2 minutes timeout

  let browser;
  let context;
  let page;

  test.beforeAll(async ({ playwright }) => {
    browser = await playwright.chromium.launch();
  });

  test.afterAll(async () => {
    await browser?.close();
  });
  // Increase timeouts
  test.setTimeout(60000);

  test.beforeEach(async () => {
    // Create a fresh context for each test
    context = await browser.newContext();
    page = await context.newPage();
    // Start from a clean slate - no cookies
    await context.clearCookies();
  });

  test('complete authentication flow', async () => {
    test.setTimeout(30000);
    // 1. Login
    console.log('Testing login...');
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    // First ensure the page is fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // Then wait for the form inputs with appropriate timeout
    await Promise.all([
      page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 }),
      page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 })
    ]);

    // Log page state for debugging
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    // Output page HTML for debugging
    console.log(await page.content());
    
    await page.fill('input[type="email"]', 'superadmin@elitegames.com');
    await page.fill('input[type="password"]', 'Passw0rd');
    
    // Click login and wait for navigation
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/admin/auth/login')),
      page.click('button[type="submit"]')
    ]);
    
    // Log response for debugging
    console.log('Login response status:', response.status());
    const responseBody = await response.json();
    console.log('Login response body:', responseBody);

    // Verify successful login
    expect(response.status()).toBe(200);
    expect(responseBody.success).toBe(true);

    // Wait for redirect to dashboard
    await page.waitForURL('**/admin/dashboard');
    expect(page.url()).toContain('/admin/dashboard');

    // 2. Verify Protected Routes
    console.log('Testing protected routes...');
    
    // Test dashboard access
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/dashboard');

    // Test users page access
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/users');

    // Test settings page access
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/settings');

    // 3. Test Logout
    console.log('Testing logout...');
    
    // Find and click logout button
    await page.click('text=Sign Out');
    
    // Wait for logout API call
    const [logoutResponse] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/admin/auth/logout')),
      page.waitForNavigation()
    ]);

    // Log logout response for debugging
    console.log('Logout response status:', logoutResponse.status());
    const logoutBody = await logoutResponse.json().catch(() => ({}));
    console.log('Logout response body:', logoutBody);

    // Verify redirect to login page
    expect(page.url()).toContain('/admin/login');

    // 4. Verify Protection After Logout
    console.log('Testing protection after logout...');
    
    // Try accessing protected route after logout
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should be redirected back to login
    expect(page.url()).toContain('/admin/login');

    // Verify cookies are cleared
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(cookie => 
      cookie.name === 'admin_token' || 
      cookie.name === 'session'
    );
    expect(authCookies.length).toBe(0);
  });

  test('should handle invalid credentials', async () => {
    const page = await context.newPage();
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Try invalid credentials
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/admin/auth/login')),
      page.click('button[type="submit"]')
    ]);
    
    // Verify error response
    expect(response.status()).toBe(401);
    
    // Should stay on login page
    expect(page.url()).toContain('/admin/login');
    
    // Should show error message
    await page.waitForSelector('text=Invalid credentials');
  });

  test.afterEach(async () => {
    await page?.close();
    await context?.close();
    // Close the context after each test
    await context.close();
  });

  test('should redirect to login for protected routes when not authenticated', async () => {
    const page = await context.newPage();
    // Try accessing protected routes directly
    const protectedRoutes = [
      '/admin/dashboard',
      '/admin/users',
      '/admin/settings'
    ];

    for (const route of protectedRoutes) {
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/admin/login');
    }
  });
});
