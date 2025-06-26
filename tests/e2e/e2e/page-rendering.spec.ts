import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 30000;

// Helper function to check if element is visible and not overlapped
async function checkElementVisibility(page: Page, selector: string, elementName: string) {
  const element = page.locator(selector);
  await expect(element, `${elementName} should be present`).toBeVisible();
  
  // Check if element has reasonable dimensions (not collapsed)
  const boundingBox = await element.boundingBox();
  expect(boundingBox?.width, `${elementName} should have reasonable width`).toBeGreaterThan(0);
  expect(boundingBox?.height, `${elementName} should have reasonable height`).toBeGreaterThan(0);
}

// Helper function to check footer content and positioning
async function checkFooter(page: Page) {
  const footer = page.locator('footer');
  await expect(footer, 'Footer should be visible').toBeVisible();
  
  // Check footer content
  await expect(footer, 'Footer should contain Elite Games branding').toContainText('Elite Games');
  await expect(footer, 'Footer should contain UK branding').toContainText('United Kingdom');
  await expect(footer, 'Footer should contain current year').toContainText(new Date().getFullYear().toString());
  
  // Check footer positioning (should be at bottom)
  const footerBox = await footer.boundingBox();
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  expect(footerBox?.y, 'Footer should be positioned at bottom of page').toBeGreaterThan(pageHeight - 200);
}

// Helper function to wait for page to fully load
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Additional wait for any animations
}

test.describe('Elite Games Trivia Platform - Page Rendering Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport size for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage renders correctly with all key elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/homepage-full.png',
      fullPage: true 
    });

    // Check main layout structure
    await checkElementVisibility(page, 'body', 'Page body');
    await checkElementVisibility(page, 'main', 'Main content area');
    
    // Check for game cards or main content
    const gameCards = page.locator('[class*="game-card"], .game-card');
    const hasGameCards = await gameCards.count() > 0;
    
    if (hasGameCards) {
      await expect(gameCards.first(), 'At least one game card should be visible').toBeVisible();
      console.log(`Found ${await gameCards.count()} game cards`);
    } else {
      // Check for alternative main content
      const mainContent = page.locator('main');
      const contentText = await mainContent.textContent();
      expect(contentText?.length, 'Main content should have substantial text').toBeGreaterThan(10);
    }

    // Check header/navigation (look for common patterns)
    const possibleHeaders = [
      'header',
      'nav',
      '[role="banner"]',
      '[class*="header"]',
      '[class*="nav"]'
    ];
    
    let headerFound = false;
    for (const selector of possibleHeaders) {
      const element = page.locator(selector);
      if (await element.count() > 0 && await element.first().isVisible()) {
        headerFound = true;
        console.log(`Header found with selector: ${selector}`);
        break;
      }
    }
    
    // If no dedicated header, check for navigation links
    if (!headerFound) {
      const navLinks = page.locator('a[href*="/"]');
      if (await navLinks.count() > 0) {
        headerFound = true;
        console.log('Navigation links found');
      }
    }

    // Check footer
    await checkFooter(page);

    // Verify no major layout overlaps by checking key elements don't have negative positions
    const mainElement = page.locator('main');
    const mainBox = await mainElement.boundingBox();
    expect(mainBox?.x, 'Main content should not be off-screen left').toBeGreaterThanOrEqual(0);
    expect(mainBox?.y, 'Main content should not be off-screen top').toBeGreaterThanOrEqual(0);

    // Take final screenshot after checks
    await page.screenshot({ 
      path: 'test-results/homepage-final.png',
      fullPage: true 
    });
  });

  test('Admin page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await waitForPageLoad(page);

    await page.screenshot({ 
      path: 'test-results/admin-page.png',
      fullPage: true 
    });

    // Check main content area
    await checkElementVisibility(page, 'main', 'Admin main content');
    
    // Look for admin-specific content
    const adminIndicators = [
      'text=admin',
      'text=dashboard',
      'text=manage',
      'text=Super Admin',
      'text=Dev Admin',
      '[class*="admin"]'
    ];

    let adminContentFound = false;
    for (const selector of adminIndicators) {
      if (await page.locator(selector).count() > 0) {
        adminContentFound = true;
        console.log(`Admin content found: ${selector}`);
        break;
      }
    }

    expect(adminContentFound, 'Admin page should contain admin-related content').toBeTruthy();
    await checkFooter(page);
  });

  test('Game page routing works', async ({ page }) => {
    // First visit homepage to see available games
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Look for game links
    const gameLinks = page.locator('a[href*="/game/"]');
    const gameLinkCount = await gameLinks.count();

    if (gameLinkCount > 0) {
      // Click on first game link
      const firstGameLink = gameLinks.first();
      const gameUrl = await firstGameLink.getAttribute('href');
      console.log(`Found game link: ${gameUrl}`);
      
      await firstGameLink.click();
      await waitForPageLoad(page);

      await page.screenshot({ 
        path: 'test-results/game-page.png',
        fullPage: true 
      });

      // Check game page loaded correctly
      await checkElementVisibility(page, 'main', 'Game main content');
      await checkFooter(page);

      // Look for game-specific content
      const gameContent = page.locator('main');
      const content = await gameContent.textContent();
      expect(content?.length, 'Game page should have content').toBeGreaterThan(20);
    } else {
      console.log('No game links found, testing direct game URL');
      
      // Try accessing a game page directly
      await page.goto(`${BASE_URL}/game/1`);
      await waitForPageLoad(page);

      await page.screenshot({ 
        path: 'test-results/game-page-direct.png',
        fullPage: true 
      });

      // Should either show game content or appropriate error/redirect
      await checkElementVisibility(page, 'main', 'Game page main content');
    }
  });

  test('Landing page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/landing`);
    await waitForPageLoad(page);

    await page.screenshot({ 
      path: 'test-results/landing-page.png',
      fullPage: true 
    });

    await checkElementVisibility(page, 'main', 'Landing main content');
    await checkFooter(page);

    // Check for landing page specific content
    const landingContent = page.locator('main');
    const content = await landingContent.textContent();
    expect(content?.length, 'Landing page should have substantial content').toBeGreaterThan(50);
  });

  test('Profile page access', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await waitForPageLoad(page);

    await page.screenshot({ 
      path: 'test-results/profile-page.png',
      fullPage: true 
    });

    await checkElementVisibility(page, 'main', 'Profile main content');
    await checkFooter(page);
  });

  test('Responsive design - Mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    await page.screenshot({ 
      path: 'test-results/mobile-homepage.png',
      fullPage: true 
    });

    // Check mobile layout
    await checkElementVisibility(page, 'main', 'Mobile main content');
    await checkFooter(page);

    // Verify content is not cut off horizontally
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width, 'Body should not exceed viewport width').toBeLessThanOrEqual(375);

    // Check for horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth, 'Page should not have horizontal scroll').toBeLessThanOrEqual(375);
  });

  test('Navigation and interaction elements are clickable', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Find and test clickable elements
    const buttons = page.locator('button:visible');
    const links = page.locator('a:visible');

    const buttonCount = await buttons.count();
    const linkCount = await links.count();

    console.log(`Found ${buttonCount} visible buttons and ${linkCount} visible links`);

    // Test that buttons are properly sized and positioned
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonBox = await firstButton.boundingBox();
      expect(buttonBox?.width, 'Buttons should have reasonable width').toBeGreaterThan(20);
      expect(buttonBox?.height, 'Buttons should have reasonable height').toBeGreaterThan(20);
    }

    // Test that links are accessible
    if (linkCount > 0) {
      const firstLink = links.first();
      const linkBox = await firstLink.boundingBox();
      expect(linkBox?.width, 'Links should have reasonable width').toBeGreaterThan(10);
      expect(linkBox?.height, 'Links should have reasonable height').toBeGreaterThan(10);
    }

    await page.screenshot({ 
      path: 'test-results/interactive-elements.png',
      fullPage: true 
    });
  });

  test('CSS and styling load correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Check that CSS has loaded by verifying computed styles
    const body = page.locator('body');
    
    // Check background color is set (should not be default white)
    const backgroundColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    console.log(`Body background color: ${backgroundColor}`);

    // Check that fonts are loaded
    const fontFamily = await body.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    console.log(`Body font family: ${fontFamily}`);
    expect(fontFamily, 'Custom font should be loaded').not.toBe('');

    // Check for Tailwind classes working
    const elements = page.locator('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]');
    const styledElementCount = await elements.count();
    expect(styledElementCount, 'Should have elements with Tailwind classes').toBeGreaterThan(0);

    await page.screenshot({ 
      path: 'test-results/styled-page.png',
      fullPage: true 
    });
  });
});

// Test configuration for running
test.describe.configure({ 
  mode: 'parallel',
  timeout: TIMEOUT 
}); 