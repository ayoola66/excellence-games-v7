import { test, expect } from '@playwright/test';

// Helper function to log in
async function adminLogin(page) {
  await page.goto('http://localhost:3000/admin/login');
  await page.fill('input[type="email"]', 'superadmin@elitegames.com');
  await page.fill('input[type="password"]', 'Passw0rd');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL('http://localhost:3000/admin/dashboard');
  
  // Wait for cookies to be set
  await page.waitForTimeout(1000);
  
  // Get all cookies
  const cookies = await page.context().cookies();
  return cookies;
}

test.describe('Admin Dashboard Debug Tests', () => {
  test('should log network requests and responses for dashboard', async ({ page }) => {
    // Enable request/response logging
    page.on('request', request => {
      console.log(`Request: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', async response => {
      const request = response.request();
      console.log(`Response: ${response.status()} ${request.url()}`);
      try {
        if (response.headers()['content-type']?.includes('application/json')) {
          const body = await response.json();
          console.log('Response body:', body);
        }
      } catch (e) {
        // Not JSON response
      }
    });

    const cookies = await adminLogin(page);
    console.log('Cookies after login:', cookies);
    
    // Wait for dashboard stats to load
    await page.waitForTimeout(2000);
    
    // Check network requests
    const failedRequests = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/api/admin/'))
        .map(entry => ({
          url: entry.name,
          duration: entry.duration
        }));
    });
    
    console.log('Failed requests:', failedRequests);
  });

  test('should check dashboard stats API endpoints', async ({ request, page }) => {
    // First login through the UI to get cookies
    const context = await page.context();
    const cookies = await adminLogin(page);
    
    // Test each dashboard endpoint
    const endpoints = [
      '/api/admin/dashboard/stats',
      '/api/admin/dashboard/recent-activity',
      '/api/admin/dashboard/user-stats',
      '/api/admin/dashboard/game-stats'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(`http://localhost:3000${endpoint}`, {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; '),
        }
      });
      
      console.log(`Testing ${endpoint}:`, {
        status: response.status(),
        ok: response.ok()
      });
      
      try {
        const body = await response.json();
        console.log('Response body:', body);
      } catch (e) {
        console.log('Failed to parse response as JSON');
      }
    }
  });

  test('should check games page functionality', async ({ page }) => {
    await adminLogin(page);
    await page.goto('http://localhost:3000/admin/games');
    
    // Log console messages
    page.on('console', msg => {
      console.log('Browser console:', msg.text());
    });
    
    // Wait for potential error messages
    await page.waitForTimeout(2000);
    
    // Check if error messages are displayed
    const errorMessages = await page.$$eval('.error-message, [role="alert"]', 
      elements => elements.map(el => el.textContent)
    );
    
    console.log('Error messages found:', errorMessages);
  });

  test('should verify API routes are correctly configured', async ({ request, page }) => {
    // First login through the UI to get cookies
    const cookies = await adminLogin(page);
    
    // Test Strapi connection
    const strapiResponse = await request.get('http://localhost:1337/api/games', {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
        Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; '),
      }
    });
    
    console.log('Direct Strapi API response:', {
      status: strapiResponse.status(),
      ok: strapiResponse.ok()
    });
    
    // Test Next.js API routes
    const nextResponse = await request.get('http://localhost:3000/api/admin/games', {
      headers: {
        Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; '),
      }
    });
    
    console.log('Next.js API response:', {
      status: nextResponse.status(),
      ok: nextResponse.ok()
    });
  });
});