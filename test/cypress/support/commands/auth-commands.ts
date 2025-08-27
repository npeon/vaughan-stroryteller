/// <reference types="cypress" />

/**
 * Custom Cypress commands for The Vaughan Storyteller - Authentication & User Management
 * These commands handle user login, logout, profile management, and role verification
 */

// Default test user credentials
const DEFAULT_USER = {
  email: 'testuser@vaughan.com',
  password: 'TestUser123!',
};

const DEFAULT_ADMIN = {
  email: 'admin@vaughan.com',
  password: 'AdminUser123!',
};

Cypress.Commands.add('loginAsUser', (email?: string, password?: string) => {
  const userEmail = email || DEFAULT_USER.email;
  const userPassword = password || DEFAULT_USER.password;
  
  // Navigate to login page
  cy.visit('/auth/login');
  
  // Fill login form
  cy.dataCy('email-input').type(userEmail);
  cy.dataCy('password-input').type(userPassword);
  
  // Submit login
  cy.dataCy('login-submit-btn').click();
  
  // Wait for authentication to complete
  cy.url().should('not.include', '/auth/login');
  
  // Verify user is logged in
  cy.dataCy('user-menu').should('be.visible');
  cy.dataCy('user-avatar').should('be.visible');
  
  // Store authentication state
  cy.window().its('localStorage').invoke('getItem', 'supabase.auth.token').should('exist');
});

Cypress.Commands.add('loginAsAdmin', () => {
  // Use admin credentials
  cy.loginAsUser(DEFAULT_ADMIN.email, DEFAULT_ADMIN.password);
  
  // Verify admin privileges
  cy.verifyUserRole('admin');
  
  // Verify admin menu items are available
  cy.dataCy('user-menu').click();
  cy.dataCy('admin-panel-link').should('be.visible');
  cy.dataCy('user-menu').click(); // Close menu
});

Cypress.Commands.add('logout', () => {
  // Open user menu
  cy.dataCy('user-menu').click();
  
  // Click logout
  cy.dataCy('logout-btn').click();
  
  // Confirm logout if dialog appears
  cy.get('body').then($body => {
    if ($body.find('[data-cy="confirm-logout-dialog"]').length) {
      cy.dataCy('confirm-logout-btn').click();
    }
  });
  
  // Verify logout completed
  cy.url().should('include', '/auth/login');
  cy.dataCy('user-menu').should('not.exist');
  
  // Verify localStorage is cleared
  cy.window().its('localStorage').invoke('getItem', 'supabase.auth.token').should('not.exist');
});

Cypress.Commands.add('selectCEFRLevel', (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') => {
  // Navigate to profile/settings if not already there
  cy.url().then((url) => {
    if (!url.includes('/profile') && !url.includes('/settings')) {
      cy.dataCy('user-menu').click();
      cy.dataCy('profile-link').click();
    }
  });
  
  // Open CEFR level selector
  cy.dataCy('cefr-level-selector').click();
  
  // Select the specified level
  cy.get('.q-menu .q-item').contains(level).click();
  
  // Save changes
  cy.dataCy('save-profile-btn').click();
  
  // Verify level is saved
  cy.dataCy('current-cefr-level').should('contain.text', level);
  
  // Verify success notification
  cy.verifyQNotification('Profile updated successfully', 'positive');
});

Cypress.Commands.add('verifyUserRole', (role: 'user' | 'admin') => {
  // Check if admin-only elements are visible/hidden based on role
  cy.dataCy('user-menu').click();
  
  if (role === 'admin') {
    cy.dataCy('admin-panel-link').should('be.visible');
    cy.dataCy('user-role-badge').should('contain.text', 'Admin');
  } else {
    cy.dataCy('admin-panel-link').should('not.exist');
    cy.dataCy('user-role-badge').should('contain.text', 'User');
  }
  
  // Close menu
  cy.dataCy('user-menu').click();
});

// Helper command to register a new user (for testing)
Cypress.Commands.add('registerUser', (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}) => {
  // Navigate to registration page
  cy.visit('/auth/register');
  
  // Fill registration form
  cy.dataCy('email-input').type(userData.email);
  cy.dataCy('password-input').type(userData.password);
  cy.dataCy('confirm-password-input').type(userData.password);
  cy.dataCy('first-name-input').type(userData.firstName);
  cy.dataCy('last-name-input').type(userData.lastName);
  
  // Select CEFR level
  cy.dataCy('cefr-level-select').click();
  cy.get('.q-menu .q-item').contains(userData.cefrLevel).click();
  
  // Accept terms and conditions
  cy.dataCy('terms-checkbox').check();
  
  // Submit registration
  cy.dataCy('register-submit-btn').click();
  
  // Verify registration success
  cy.url().should('not.include', '/auth/register');
  cy.verifyQNotification('Registration successful', 'positive');
});

// Helper command to reset user password
Cypress.Commands.add('resetPassword', (email: string) => {
  // Navigate to password reset page
  cy.visit('/auth/reset-password');
  
  // Enter email
  cy.dataCy('reset-email-input').type(email);
  
  // Submit reset request
  cy.dataCy('reset-submit-btn').click();
  
  // Verify reset email sent notification
  cy.verifyQNotification('Password reset email sent', 'positive');
});

