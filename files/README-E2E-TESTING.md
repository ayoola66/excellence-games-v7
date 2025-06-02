# End-to-End Testing with Playwright

This document explains how to set up and run Playwright end-to-end tests for the Elite Games Trivia Platform.

## Setup Instructions

### 1. Install Dependencies

First, install the necessary dependencies at the root level:

```bash
npm install --save-dev @playwright/test @types/node concurrently
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Start the Development Server

Before running tests, ensure your development server is running:

**Option A: Using the startup script**
```bash
chmod +x files/start-dev.sh
./files/start-dev.sh
```

**Option B: Manual startup**
```bash
# Terminal 1 - Backend
cd files/apps/backend
npm install
npm run develop

# Terminal 2 - Frontend  
cd files/apps/frontend
npm install
npm run dev
```

The frontend should be accessible at `http://localhost:3000`

### 4. Run the Tests

Once the server is running, execute the tests:

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# View test reports
npm run test:report
```

## Test Coverage

The Playwright test suite (`tests/e2e/page-rendering.spec.ts`) covers:

### ✅ Page Rendering Tests
- **Homepage**: Verifies main layout, game cards, header/navigation, and footer
- **Admin Page**: Checks admin-specific content and layout
- **Game Pages**: Tests game routing and content rendering
- **Landing Page**: Validates landing page content
- **Profile Page**: Ensures profile page accessibility

### ✅ Layout & Styling Tests
- **Footer Verification**: Checks "Elite Games" branding and UK text
- **CSS Loading**: Verifies Tailwind classes and custom styles are applied
- **Responsive Design**: Tests mobile viewport (375px width)
- **Element Positioning**: Ensures no negative positioning or overlaps

### ✅ Interaction Tests
- **Button Accessibility**: Verifies buttons have proper dimensions
- **Link Functionality**: Checks navigation links are clickable
- **Element Visibility**: Ensures all key elements are visible and not collapsed

### ✅ Screenshot Capture
- Automatically takes screenshots of each page for visual confirmation
- Screenshots saved to `test-results/` directory
- Full-page captures for comprehensive layout verification

## Troubleshooting

### Common Issues

**Server Not Running**
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
- Ensure the frontend development server is running on port 3000
- Check that both backend (port 1337) and frontend (port 3000) are accessible

**Missing Dependencies**
```
Cannot find module '@playwright/test'
```
- Run `npm install` in the root directory
- Install Playwright browsers: `npx playwright install`

**PostCSS/Tailwind Issues**
- Ensure `postcss.config.js` exists in the frontend directory
- Verify Tailwind CSS is properly configured

**Node.js Version**
- Ensure you're using Node.js 18+ for optimal compatibility
- Use `node --version` to check your current version

### Test Failures

If tests fail, check:

1. **Server Status**: Verify both frontend and backend are running
2. **Console Logs**: Check browser console for JavaScript errors
3. **Screenshots**: Review captured screenshots in `test-results/`
4. **Network**: Ensure no network issues preventing page loads

## Configuration

### Browsers Tested
- **Desktop**: Chrome, Firefox, Safari (WebKit)
- **Mobile**: Pixel 5 (Chrome), iPhone 12 (Safari)

### Test Settings
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure

## Manual Testing Checklist

If automated tests pass but you notice visual issues:

1. **Icon Sizes**: Verify icons (like Heroicons) are not oversized
2. **Color Rendering**: Check that Tailwind background colors appear
3. **Layout Spacing**: Ensure proper padding and margins
4. **Font Loading**: Confirm Inter font loads correctly
5. **Responsive Breakpoints**: Test various screen sizes manually

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run Playwright Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run test
```

The tests are configured to:
- Run with 1 worker on CI (sequential execution)
- Retry failed tests 2 times
- Generate HTML reports for review 