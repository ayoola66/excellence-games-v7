# Test info

- Name: Elite Games Trivia Platform - Page Rendering Tests >> Landing page renders correctly
- Location: /Users/ayoogunrekun/Projects/targeted/files/tests/e2e/page-rendering.spec.ts:201:7

# Error details

```
Error: Footer should be visible: Error: strict mode violation: locator('footer') resolved to 2 elements:
    1) <footer class="bg-blue-950 text-blue-200 py-12">…</footer> aka locator('footer').filter({ hasText: 'Elite GamesPremium British' })
    2) <footer class="w-full py-6 bg-blue-900 text-white text-center text-sm shadow-inner">…</footer> aka getByText('Elite Games © 2025 · Made')

Call log:
  - Footer should be visible with timeout 5000ms
  - waiting for locator('footer')

    at checkFooter (/Users/ayoogunrekun/Projects/targeted/files/tests/e2e/page-rendering.spec.ts:21:52)
    at /Users/ayoogunrekun/Projects/targeted/files/tests/e2e/page-rendering.spec.ts:211:11
```

# Page snapshot

```yaml
- main:
  - navigation:
    - heading "Elite Games" [level=1]
    - paragraph: Premium Board Games
    - button "Play Online"
    - button "Buy Now"
  - heading "The Ultimate British TriviaBoard Game" [level=2]
  - paragraph: Handcrafted in Britain with over 1000 meticulously researched questions spanning history, culture, science, and entertainment. Perfect for family gatherings and competitive friends.
  - button "Shop Now"
  - button "Try Digital Version"
  - heading "Free Digital Access Included!" [level=3]
  - paragraph: Every board game purchase includes 6 months of premium digital access
  - text: Handcrafted in the United Kingdom Premium quality materials 1000+ carefully researched questions Perfect for 2-8 players
  - heading "Why Elite Games Board Game?" [level=3]
  - paragraph: Experience the perfect blend of traditional board gaming and modern innovation
  - heading "Premium Quality" [level=4]
  - paragraph: Handcrafted with the finest British materials, from sustainably sourced wood to precision-cut game pieces.
  - heading "Expertly Crafted Questions" [level=4]
  - paragraph: Over 1000 questions researched and fact-checked by British educators and trivia experts.
  - heading "Perfect for Everyone" [level=4]
  - paragraph: Designed for 2-8 players with scalable difficulty, perfect for family gatherings and competitive friends.
  - heading "What Our Customers Say" [level=3]
  - paragraph: Join thousands of satisfied families across the UK
  - paragraph: "\"Absolutely brilliant! Our family game nights have never been more engaging. The questions are challenging yet fair, and the quality is exceptional.\""
  - paragraph: Sarah & James Wilson
  - paragraph: Manchester
  - paragraph: "\"As an educator, I appreciate the thoughtful categorisation and difficulty progression. Elite Games makes learning genuinely enjoyable.\""
  - paragraph: Dr. Margaret Thompson
  - paragraph: Edinburgh
  - paragraph: "\"Three generations playing together! The game scales beautifully from children to grandparents. Brilliant British quality throughout.\""
  - paragraph: The Patel Family
  - paragraph: Birmingham
  - heading "Choose Your Edition" [level=3]
  - paragraph: Select the perfect package for your family
  - heading "Basic Edition" [level=4]
  - paragraph: Perfect for families starting their trivia journey
  - text: £49.99
  - list:
    - listitem: 200 Classic Trivia Questions
    - listitem: Basic Game Board
    - listitem: Player Pieces & Dice
    - listitem: Quick Start Guide
    - listitem: Digital Access to Basic Games
  - button "Choose Basic Edition"
  - text: Most Popular
  - heading "Premium Edition" [level=4]
  - paragraph: The complete Elite Games experience with exclusive content
  - text: £89.99
  - list:
    - listitem: 500+ Premium Questions
    - listitem: Deluxe Wooden Game Board
    - listitem: Premium Metal Player Pieces
    - listitem: Digital Premium Subscription (6 months)
    - listitem: Exclusive Question Categories
    - listitem: Music Cards & Sound Effects
    - listitem: Strategy Guide & Tips
  - button "Choose Premium Edition"
  - heading "Collector's Edition" [level=4]
  - paragraph: Limited edition for the ultimate trivia enthusiast
  - text: £149.99
  - list:
    - listitem: 1000+ Expert Questions
    - listitem: Hand-crafted Oak Game Board
    - listitem: Gold-plated Player Pieces
    - listitem: Lifetime Digital Premium Access
    - listitem: All Question Categories
    - listitem: Personalised Engraving
    - listitem: Certificate of Authenticity
    - listitem: VIP Customer Support
  - button "Choose Collector's Edition"
  - text: 30-day money-back guarantee • Free UK shipping
  - heading "Ready to Elevate Your Game Night?" [level=3]
  - paragraph: Join thousands of families across the UK who have made Elite Games their go-to entertainment choice.
  - button "Order Your Board Game"
  - button "Try Digital First"
  - text: Elite Games
  - paragraph: Premium British trivia games designed to bring families and friends together through the joy of learning.
  - heading "Products" [level=4]
  - list:
    - listitem:
      - link "Board Games":
        - /url: "#"
    - listitem:
      - link "Digital Games":
        - /url: /
    - listitem:
      - link "Premium Editions":
        - /url: "#packages"
  - heading "Support" [level=4]
  - list:
    - listitem:
      - link "Customer Service":
        - /url: "#"
    - listitem:
      - link "Shipping Info":
        - /url: "#"
    - listitem:
      - link "Returns":
        - /url: "#"
  - heading "Company" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: "#"
    - listitem:
      - link "Contact":
        - /url: "#"
    - listitem:
      - link "Privacy Policy":
        - /url: "#"
  - paragraph: © 2024 Elite Games. Proudly crafted in the United Kingdom. All rights reserved.
- contentinfo: Elite Games © 2025 · Made with pride in the United Kingdom 🇬🇧
- alert
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 |
   3 | // Configuration
   4 | const BASE_URL = 'http://localhost:3000';
   5 | const TIMEOUT = 30000;
   6 |
   7 | // Helper function to check if element is visible and not overlapped
   8 | async function checkElementVisibility(page: Page, selector: string, elementName: string) {
   9 |   const element = page.locator(selector);
   10 |   await expect(element, `${elementName} should be present`).toBeVisible();
   11 |   
   12 |   // Check if element has reasonable dimensions (not collapsed)
   13 |   const boundingBox = await element.boundingBox();
   14 |   expect(boundingBox?.width, `${elementName} should have reasonable width`).toBeGreaterThan(0);
   15 |   expect(boundingBox?.height, `${elementName} should have reasonable height`).toBeGreaterThan(0);
   16 | }
   17 |
   18 | // Helper function to check footer content and positioning
   19 | async function checkFooter(page: Page) {
   20 |   const footer = page.locator('footer');
>  21 |   await expect(footer, 'Footer should be visible').toBeVisible();
      |                                                    ^ Error: Footer should be visible: Error: strict mode violation: locator('footer') resolved to 2 elements:
   22 |   
   23 |   // Check footer content
   24 |   await expect(footer, 'Footer should contain Elite Games branding').toContainText('Elite Games');
   25 |   await expect(footer, 'Footer should contain UK branding').toContainText('United Kingdom');
   26 |   await expect(footer, 'Footer should contain current year').toContainText(new Date().getFullYear().toString());
   27 |   
   28 |   // Check footer positioning (should be at bottom)
   29 |   const footerBox = await footer.boundingBox();
   30 |   const pageHeight = await page.evaluate(() => document.body.scrollHeight);
   31 |   expect(footerBox?.y, 'Footer should be positioned at bottom of page').toBeGreaterThan(pageHeight - 200);
   32 | }
   33 |
   34 | // Helper function to wait for page to fully load
   35 | async function waitForPageLoad(page: Page) {
   36 |   await page.waitForLoadState('networkidle');
   37 |   await page.waitForTimeout(1000); // Additional wait for any animations
   38 | }
   39 |
   40 | test.describe('Elite Games Trivia Platform - Page Rendering Tests', () => {
   41 |   test.beforeEach(async ({ page }) => {
   42 |     // Set viewport size for consistent testing
   43 |     await page.setViewportSize({ width: 1280, height: 720 });
   44 |   });
   45 |
   46 |   test('Homepage renders correctly with all key elements', async ({ page }) => {
   47 |     await page.goto(BASE_URL);
   48 |     await waitForPageLoad(page);
   49 |
   50 |     // Take initial screenshot
   51 |     await page.screenshot({ 
   52 |       path: 'test-results/homepage-full.png',
   53 |       fullPage: true 
   54 |     });
   55 |
   56 |     // Check main layout structure
   57 |     await checkElementVisibility(page, 'body', 'Page body');
   58 |     await checkElementVisibility(page, 'main', 'Main content area');
   59 |     
   60 |     // Check for game cards or main content
   61 |     const gameCards = page.locator('[class*="game-card"], .game-card');
   62 |     const hasGameCards = await gameCards.count() > 0;
   63 |     
   64 |     if (hasGameCards) {
   65 |       await expect(gameCards.first(), 'At least one game card should be visible').toBeVisible();
   66 |       console.log(`Found ${await gameCards.count()} game cards`);
   67 |     } else {
   68 |       // Check for alternative main content
   69 |       const mainContent = page.locator('main');
   70 |       const contentText = await mainContent.textContent();
   71 |       expect(contentText?.length, 'Main content should have substantial text').toBeGreaterThan(10);
   72 |     }
   73 |
   74 |     // Check header/navigation (look for common patterns)
   75 |     const possibleHeaders = [
   76 |       'header',
   77 |       'nav',
   78 |       '[role="banner"]',
   79 |       '[class*="header"]',
   80 |       '[class*="nav"]'
   81 |     ];
   82 |     
   83 |     let headerFound = false;
   84 |     for (const selector of possibleHeaders) {
   85 |       const element = page.locator(selector);
   86 |       if (await element.count() > 0 && await element.first().isVisible()) {
   87 |         headerFound = true;
   88 |         console.log(`Header found with selector: ${selector}`);
   89 |         break;
   90 |       }
   91 |     }
   92 |     
   93 |     // If no dedicated header, check for navigation links
   94 |     if (!headerFound) {
   95 |       const navLinks = page.locator('a[href*="/"]');
   96 |       if (await navLinks.count() > 0) {
   97 |         headerFound = true;
   98 |         console.log('Navigation links found');
   99 |       }
  100 |     }
  101 |
  102 |     // Check footer
  103 |     await checkFooter(page);
  104 |
  105 |     // Verify no major layout overlaps by checking key elements don't have negative positions
  106 |     const mainElement = page.locator('main');
  107 |     const mainBox = await mainElement.boundingBox();
  108 |     expect(mainBox?.x, 'Main content should not be off-screen left').toBeGreaterThanOrEqual(0);
  109 |     expect(mainBox?.y, 'Main content should not be off-screen top').toBeGreaterThanOrEqual(0);
  110 |
  111 |     // Take final screenshot after checks
  112 |     await page.screenshot({ 
  113 |       path: 'test-results/homepage-final.png',
  114 |       fullPage: true 
  115 |     });
  116 |   });
  117 |
  118 |   test('Admin page renders correctly', async ({ page }) => {
  119 |     await page.goto(`${BASE_URL}/admin`);
  120 |     await waitForPageLoad(page);
  121 |
```