describe('Admin Authentication Flow', () => {
  beforeEach(() => {
    // Reset tokens before each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should login successfully with valid credentials', () => {
    cy.visit('/admin/login');
    
    // Fill login form
    cy.get('[data-testid="admin-email"]')
      .type(Cypress.env('ADMIN_EMAIL'));
    cy.get('[data-testid="admin-password"]')
      .type(Cypress.env('ADMIN_PASSWORD'));
    cy.get('[data-testid="admin-login-submit"]')
      .click();

    // Should redirect to admin dashboard
    cy.url().should('include', '/admin/dashboard');
    cy.get('[data-testid="admin-header"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/admin/login');
    
    // Fill login form with invalid credentials
    cy.get('[data-testid="admin-email"]')
      .type('wrong@example.com');
    cy.get('[data-testid="admin-password"]')
      .type('wrongpassword');
    cy.get('[data-testid="admin-login-submit"]')
      .click();

    // Should show error message
    cy.get('[data-testid="admin-login-error"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });

  it('should protect admin routes', () => {
    // Try accessing protected route without auth
    cy.visit('/admin/settings');
    
    // Should redirect to login
    cy.url().should('include', '/admin/login');
  });

  it('should handle token regeneration', () => {
    // Login first
    cy.login(); // Custom command that handles admin login

    // Mock an expired token scenario
    cy.window().then((win) => {
      // Set an expired token
      win.localStorage.setItem('adminToken', 'expired-token');
      
      // Try accessing protected route
      cy.visit('/admin/settings');
      
      // Should auto-refresh token and stay on settings page
      cy.url().should('include', '/admin/settings');
      
      // Verify new token was obtained
      cy.window().then((win) => {
        expect(win.localStorage.getItem('adminToken')).not.to.eq('expired-token');
      });
    });
  });

  it('should handle refresh token expiry', () => {
    // Mock expired refresh token scenario
    cy.window().then((win) => {
      win.localStorage.setItem('adminToken', 'expired-token');
      win.localStorage.setItem('refreshToken', 'expired-refresh-token');
    });

    // Try accessing protected route
    cy.visit('/admin/settings');
    
    // Should redirect to login due to expired refresh token
    cy.url().should('include', '/admin/login');
  });
});

// Add custom command for login
Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: '/admin/auth/login',
    body: {
      email: Cypress.env('ADMIN_EMAIL'),
      password: Cypress.env('ADMIN_PASSWORD')
    }
  }).then((response) => {
    // Store tokens
    window.localStorage.setItem('adminToken', response.body.token);
    window.localStorage.setItem('refreshToken', response.body.refreshToken);
  });
});
