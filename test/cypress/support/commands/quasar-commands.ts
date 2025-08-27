/// <reference types="cypress" />

/**
 * Custom Cypress commands for The Vaughan Storyteller - Enhanced Quasar Components
 * These commands provide improved interaction with Quasar-specific components
 */

Cypress.Commands.add('selectFromQSelect', (selector: string, option: string) => {
  // Click to open QSelect dropdown
  cy.get(selector).click();
  
  // Wait for dropdown menu to appear
  cy.get('.q-menu').should('be.visible');
  
  // Find and click the option
  cy.withinSelectMenu(() => {
    cy.get('.q-item').contains(option).click();
  });
  
  // Verify selection was made
  cy.get(selector).should('contain.text', option);
  
  // Ensure dropdown is closed
  cy.get('.q-menu').should('not.exist');
});

Cypress.Commands.add('openQDialog', (dialogName: string) => {
  // Click trigger element that opens the dialog
  cy.dataCy(`open-${dialogName}-dialog`).click();
  
  // Wait for dialog to appear
  cy.withinDialog(() => {
    cy.get('.q-dialog').should('be.visible');
    cy.dataCy(`${dialogName}-dialog`).should('be.visible');
  });
  
  // Verify dialog is modal and backdrop is present
  cy.get('.q-dialog__backdrop').should('be.visible');
});

Cypress.Commands.add('closeQDialog', () => {
  // Try multiple methods to close dialog
  cy.get('body').then($body => {
    if ($body.find('.q-dialog').length) {
      // Method 1: Click close button if available
      if ($body.find('[data-cy="dialog-close-btn"]').length) {
        cy.dataCy('dialog-close-btn').click();
      }
      // Method 2: Press Escape key
      else if ($body.find('.q-dialog').is(':visible')) {
        cy.get('.q-dialog').type('{esc}');
      }
      // Method 3: Click backdrop if allowed
      else {
        cy.get('.q-dialog__backdrop').click({ force: true });
      }
    }
  });
  
  // Verify dialog is closed
  cy.get('.q-dialog').should('not.exist');
});

Cypress.Commands.add('verifyQNotification', (message: string, type?: string) => {
  // Wait for notification to appear
  cy.get('.q-notification', { timeout: 5000 }).should('be.visible');
  
  // Verify message content
  cy.get('.q-notification__message').should('contain.text', message);
  
  // Verify notification type if specified
  if (type) {
    cy.get('.q-notification').should('have.class', `q-notification--${type}`);
  }
  
  // Wait for notification to disappear or dismiss it
  cy.get('.q-notification').then($notification => {
    if ($notification.find('.q-notification__dismiss').length) {
      cy.get('.q-notification__dismiss').click();
    }
  });
  
  // Verify notification is gone
  cy.get('.q-notification', { timeout: 8000 }).should('not.exist');
});

Cypress.Commands.add('toggleQDrawer', () => {
  // Click drawer toggle button
  cy.dataCy('drawer-toggle-btn').click();
  
  // Verify drawer state changed
  cy.get('.q-drawer').should('be.visible').then($drawer => {
    const isOpen = $drawer.hasClass('q-drawer--open');
    
    if (isOpen) {
      cy.get('.q-drawer__content').should('be.visible');
    } else {
      cy.get('.q-drawer').should('not.have.class', 'q-drawer--open');
    }
  });
});

Cypress.Commands.add('waitForQLoading', () => {
  // Wait for any loading indicators to appear and disappear
  cy.get('body').then($body => {
    // Check for various loading indicators
    const loadingSelectors = [
      '.q-loading',
      '.q-spinner',
      '.q-circular-progress',
      '.q-linear-progress',
      '[data-cy*="loading"]'
    ];
    
    loadingSelectors.forEach(selector => {
      if ($body.find(selector).length) {
        cy.get(selector).should('not.exist', { timeout: 10000 });
      }
    });
  });
  
  // Ensure page is ready for interaction
  cy.get('body').should('not.have.class', 'q-loading-bar');
});

// Helper command for QTable interactions
Cypress.Commands.add('interactWithQTable', (tableSelector: string, actions: {
  search?: string;
  sort?: { column: string; direction: 'asc' | 'desc' };
  filter?: { column: string; value: string };
  selectRow?: number;
  pagination?: { page: number; rowsPerPage?: number };
}) => {
  const table = cy.get(tableSelector);
  
  // Search functionality
  if (actions.search && actions.search.trim()) {
    table.within(() => {
      cy.dataCy('table-search-input').type(actions.search!);
    });
  }
  
  // Sorting
  if (actions.sort) {
    table.within(() => {
      cy.get(`th[data-sortable="${actions.sort!.column}"]`).click();
      
      // Click again for descending if needed
      if (actions.sort!.direction === 'desc') {
        cy.get(`th[data-sortable="${actions.sort!.column}"]`).click();
      }
    });
  }
  
  // Row selection
  if (actions.selectRow !== undefined) {
    table.within(() => {
      cy.get('tbody tr').eq(actions.selectRow!).click();
    });
  }
  
  // Pagination
  if (actions.pagination) {
    table.within(() => {
      if (actions.pagination!.rowsPerPage) {
        cy.dataCy('rows-per-page-select').click();
        cy.get('.q-menu .q-item').contains(actions.pagination!.rowsPerPage!.toString()).click();
      }
      
      if (actions.pagination!.page > 1) {
        cy.dataCy('pagination-btn').contains(actions.pagination!.page.toString()).click();
      }
    });
  }
});

// Helper command for QForm validation
Cypress.Commands.add('validateQForm', (formSelector: string, expectedErrors?: string[]) => {
  const form = cy.get(formSelector);
  
  // Trigger form validation
  form.within(() => {
    cy.get('button[type="submit"]').click();
  });
  
  if (expectedErrors) {
    // Check for specific validation errors
    expectedErrors.forEach(error => {
      cy.get('.q-field--error .q-field__messages').should('contain.text', error);
    });
  } else {
    // Check that no validation errors exist
    cy.get('.q-field--error').should('not.exist');
  }
});

// Helper command for QTab navigation
Cypress.Commands.add('navigateQTabs', (tabsSelector: string, tabName: string) => {
  // Click on the specified tab
  cy.get(tabsSelector).within(() => {
    cy.get('.q-tab').contains(tabName).click();
  });
  
  // Verify tab is active
  cy.get(tabsSelector).within(() => {
    cy.get('.q-tab--active').should('contain.text', tabName);
  });
  
  // Verify corresponding tab panel is visible
  cy.get('.q-tab-panel').contains(tabName).should('be.visible');
});

// Helper command for QExpansionItem interaction
Cypress.Commands.add('toggleQExpansionItem', (itemSelector: string) => {
  // Click expansion item header
  cy.get(itemSelector).within(() => {
    cy.get('.q-expansion-item__toggle-icon').click();
  });
  
  // Verify expansion state changed
  cy.get(itemSelector).then($item => {
    if ($item.hasClass('q-expansion-item--expanded')) {
      cy.wrap($item).find('.q-expansion-item__content').should('be.visible');
    } else {
      cy.wrap($item).find('.q-expansion-item__content').should('not.be.visible');
    }
  });
});

// Helper command for QStepper navigation
Cypress.Commands.add('navigateQStepper', (stepperSelector: string, action: 'next' | 'previous' | number) => {
  const stepper = cy.get(stepperSelector);
  
  if (typeof action === 'number') {
    // Navigate to specific step
    stepper.within(() => {
      cy.get(`.q-stepper__step[data-step="${action}"]`).click();
    });
  } else {
    // Navigate next or previous
    stepper.within(() => {
      cy.dataCy(`stepper-${action}-btn`).click();
    });
  }
  
  // Verify step navigation
  stepper.within(() => {
    cy.get('.q-stepper__step--active').should('be.visible');
  });
});

