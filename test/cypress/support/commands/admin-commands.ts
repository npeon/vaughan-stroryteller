/// <reference types="cypress" />

/**
 * Custom Cypress commands for The Vaughan Storyteller - Admin Panel
 * These commands handle admin functionality, banner management, user limits, and API health monitoring
 */

Cypress.Commands.add('navigateToAdminPanel', () => {
  // Ensure user has admin privileges
  cy.verifyUserRole('admin');
  
  // Navigate to admin panel
  cy.dataCy('user-menu').click();
  cy.dataCy('admin-panel-link').should('be.visible').click();
  
  // Verify admin panel loaded
  cy.url().should('include', '/admin');
  cy.dataCy('admin-dashboard').should('be.visible');
  cy.dataCy('admin-nav').should('be.visible');
});

Cypress.Commands.add('createAdBanner', (bannerData: {
  title: string;
  content: string;
  imageUrl?: string;
  active?: boolean;
}) => {
  // Navigate to banner management
  cy.navigateToAdminPanel();
  cy.dataCy('banner-management-nav').click();
  
  // Click create new banner
  cy.dataCy('create-banner-btn').click();
  
  // Fill banner form
  cy.dataCy('banner-title-input').type(bannerData.title);
  cy.dataCy('banner-content-input').type(bannerData.content);
  
  if (bannerData.imageUrl) {
    cy.dataCy('banner-image-url-input').type(bannerData.imageUrl);
  }
  
  if (bannerData.active !== undefined) {
    const checkbox = cy.dataCy('banner-active-checkbox');
    if (bannerData.active) {
      checkbox.check();
    } else {
      checkbox.uncheck();
    }
  }
  
  // Submit banner creation
  cy.dataCy('submit-banner-btn').click();
  
  // Verify banner created successfully
  cy.verifyQNotification('Banner created successfully', 'positive');
  cy.dataCy('banner-list').should('contain.text', bannerData.title);
});

Cypress.Commands.add('activateBanner', (bannerId: string) => {
  // Navigate to banner management
  cy.navigateToAdminPanel();
  cy.dataCy('banner-management-nav').click();
  
  // Find banner and activate it
  cy.dataCy(`banner-row-${bannerId}`).within(() => {
    cy.dataCy('activate-banner-btn').click();
  });
  
  // Confirm activation if dialog appears
  cy.get('body').then($body => {
    if ($body.find('[data-cy="confirm-activation-dialog"]').length) {
      cy.dataCy('confirm-activation-btn').click();
    }
  });
  
  // Verify banner is activated
  cy.verifyQNotification('Banner activated', 'positive');
  cy.dataCy(`banner-row-${bannerId}`).within(() => {
    cy.dataCy('banner-status').should('contain.text', 'Active');
    cy.dataCy('deactivate-banner-btn').should('be.visible');
  });
});

Cypress.Commands.add('deactivateBanner', (bannerId: string) => {
  // Navigate to banner management
  cy.navigateToAdminPanel();
  cy.dataCy('banner-management-nav').click();
  
  // Find banner and deactivate it
  cy.dataCy(`banner-row-${bannerId}`).within(() => {
    cy.dataCy('deactivate-banner-btn').click();
  });
  
  // Confirm deactivation if dialog appears
  cy.get('body').then($body => {
    if ($body.find('[data-cy="confirm-deactivation-dialog"]').length) {
      cy.dataCy('confirm-deactivation-btn').click();
    }
  });
  
  // Verify banner is deactivated
  cy.verifyQNotification('Banner deactivated', 'positive');
  cy.dataCy(`banner-row-${bannerId}`).within(() => {
    cy.dataCy('banner-status').should('contain.text', 'Inactive');
    cy.dataCy('activate-banner-btn').should('be.visible');
  });
});

Cypress.Commands.add('setUserStoryLimit', (userId: string, limit: number) => {
  // Navigate to user management
  cy.navigateToAdminPanel();
  cy.dataCy('user-management-nav').click();
  
  // Search for user
  cy.dataCy('user-search-input').type(userId);
  cy.dataCy('search-users-btn').click();
  
  // Select user and edit limits
  cy.dataCy(`user-row-${userId}`).within(() => {
    cy.dataCy('edit-user-limits-btn').click();
  });
  
  // Update story limit
  cy.dataCy('story-limit-input').clear().type(limit.toString());
  
  // Save changes
  cy.dataCy('save-user-limits-btn').click();
  
  // Verify limit was set
  cy.verifyQNotification('User limits updated', 'positive');
  cy.dataCy(`user-row-${userId}`).within(() => {
    cy.dataCy('current-story-limit').should('contain.text', limit.toString());
  });
});

Cypress.Commands.add('verifyAPIHealth', (service: 'openrouter' | 'elevenlabs') => {
  // Navigate to API health monitoring
  cy.navigateToAdminPanel();
  cy.dataCy('api-health-nav').click();
  
  // Find the specific service status
  cy.dataCy(`${service}-health-status`).should('be.visible');
  
  // Test API connection
  cy.dataCy(`test-${service}-connection-btn`).click();
  
  // Wait for test to complete
  cy.dataCy(`${service}-test-loading`).should('be.visible');
  cy.dataCy(`${service}-test-loading`, { timeout: 10000 }).should('not.exist');
  
  // Verify test result
  cy.dataCy(`${service}-health-status`).then($status => {
    const statusText = $status.text().toLowerCase();
    expect(statusText).to.match(/(healthy|connected|operational|warning|error)/);
  });
  
  // Check last test timestamp
  cy.dataCy(`${service}-last-test-time`).should('not.be.empty');
});

Cypress.Commands.add('checkSystemStatus', () => {
  // Navigate to system overview
  cy.navigateToAdminPanel();
  cy.dataCy('system-overview-nav').click();
  
  // Verify all system components are displayed
  cy.dataCy('database-status').should('be.visible');
  cy.dataCy('storage-status').should('be.visible');
  cy.dataCy('auth-status').should('be.visible');
  cy.dataCy('edge-functions-status').should('be.visible');
  
  // Check external API statuses
  cy.verifyAPIHealth('openrouter');
  cy.verifyAPIHealth('elevenlabs');
  
  // Verify system metrics
  cy.dataCy('active-users-count').should('not.be.empty');
  cy.dataCy('stories-generated-today').should('not.be.empty');
  cy.dataCy('api-requests-count').should('not.be.empty');
});

// Helper command to bulk create test banners
Cypress.Commands.add('createTestBanners', (count: number) => {
  for (let i = 1; i <= count; i++) {
    cy.createAdBanner({
      title: `Test Banner ${i}`,
      content: `This is test banner content ${i}`,
      active: i % 2 === 0, // Activate every other banner
    });
    cy.wait(500); // Small delay between creations
  }
});

// Helper command to verify user analytics
Cypress.Commands.add('verifyUserAnalytics', (expectedData: {
  totalUsers?: number;
  activeUsers?: number;
  newUsersToday?: number;
}) => {
  cy.navigateToAdminPanel();
  cy.dataCy('analytics-nav').click();
  
  if (expectedData.totalUsers) {
    cy.dataCy('total-users-metric').should('contain.text', expectedData.totalUsers.toString());
  }
  
  if (expectedData.activeUsers) {
    cy.dataCy('active-users-metric').should('contain.text', expectedData.activeUsers.toString());
  }
  
  if (expectedData.newUsersToday) {
    cy.dataCy('new-users-today-metric').should('contain.text', expectedData.newUsersToday.toString());
  }
});

// Helper command to export admin reports
Cypress.Commands.add('exportAdminReport', (reportType: 'users' | 'stories' | 'vocabulary' | 'system') => {
  cy.navigateToAdminPanel();
  cy.dataCy('reports-nav').click();
  
  // Select report type
  cy.dataCy('report-type-select').click();
  cy.get('.q-menu .q-item').contains(reportType, { matchCase: false }).click();
  
  // Configure report parameters
  cy.dataCy('report-date-range').click();
  cy.get('.q-date').selectDate('2023/01/01'); // Start date
  cy.get('.q-date').selectDate('2023/12/31'); // End date
  
  // Generate and download report
  cy.dataCy('generate-report-btn').click();
  cy.dataCy('download-report-btn', { timeout: 10000 }).should('be.visible').click();
  
  // Verify download initiated
  cy.verifyQNotification('Report download started', 'positive');
});

