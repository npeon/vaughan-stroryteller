/// <reference types="cypress" />

/**
 * Custom Cypress commands for The Vaughan Storyteller - Story System
 * These commands handle story generation, reading, and interaction functionality
 */

Cypress.Commands.add('generateStory', (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', genre?: string) => {
  // Navigate to story generation if not already there
  cy.url().then((url) => {
    if (!url.includes('/generate') && !url.includes('/stories')) {
      cy.visit('/stories/generate');
    }
  });

  // Select CEFR level
  cy.dataCy('cefr-level-select').click();
  cy.get('.q-menu').should('be.visible');
  cy.get('.q-item').contains(level).click();

  // Select genre if provided
  if (genre) {
    cy.dataCy('genre-select').click();
    cy.get('.q-menu').should('be.visible');
    cy.get('.q-item').contains(genre).click();
  }

  // Click generate button
  cy.dataCy('generate-story-btn').should('be.enabled').click();
});

Cypress.Commands.add('waitForStoryGeneration', () => {
  // Wait for loading indicator to appear and disappear
  cy.dataCy('story-generation-loading').should('be.visible');
  cy.dataCy('story-generation-loading').should('not.exist', { timeout: 30000 });
  
  // Verify story content is loaded
  cy.dataCy('story-content').should('be.visible');
  cy.dataCy('story-title').should('not.be.empty');
  cy.dataCy('story-text').should('not.be.empty');
});

Cypress.Commands.add('selectStoryWord', (wordText: string) => {
  // Find and click the specific word in story text
  cy.dataCy('story-text')
    .contains(wordText, { matchCase: false })
    .should('be.visible')
    .click();
    
  // Verify word selection UI appears
  cy.dataCy('word-selection-popup').should('be.visible');
  cy.dataCy('selected-word').should('contain.text', wordText);
});

Cypress.Commands.add('verifyStoryProgress', (expectedProgress: number) => {
  // Check progress bar value
  cy.dataCy('reading-progress-bar')
    .should('be.visible')
    .and('have.attr', 'aria-valuenow', expectedProgress.toString());
    
  // Verify progress percentage display
  cy.dataCy('progress-percentage')
    .should('contain.text', `${expectedProgress}%`);
});

Cypress.Commands.add('completeStoryReading', () => {
  // Scroll to end of story
  cy.dataCy('story-text').scrollTo('bottom');
  
  // Click complete reading button
  cy.dataCy('complete-reading-btn').should('be.visible').click();
  
  // Verify completion dialog or redirect
  cy.get('body').then($body => {
    if ($body.find('[data-cy="story-completed-dialog"]').length) {
      cy.dataCy('story-completed-dialog').should('be.visible');
      cy.dataCy('confirm-completion-btn').click();
    }
  });
  
  // Verify story is marked as completed
  cy.dataCy('story-status').should('contain.text', 'Completed');
  
  // Verify progress is 100%
  cy.verifyStoryProgress(100);
});

// Helper command to navigate directly to a story by ID
Cypress.Commands.add('openStory', (storyId: string) => {
  cy.visit(`/stories/${storyId}`);
  cy.waitForStoryGeneration();
});

// Helper command to verify story metadata
Cypress.Commands.add('verifyStoryMetadata', (expectedData: {
  level?: string;
  genre?: string;
  wordCount?: number;
  estimatedReadingTime?: number;
}) => {
  if (expectedData.level) {
    cy.dataCy('story-level').should('contain.text', expectedData.level);
  }
  
  if (expectedData.genre) {
    cy.dataCy('story-genre').should('contain.text', expectedData.genre);
  }
  
  if (expectedData.wordCount) {
    cy.dataCy('story-word-count').should('contain.text', expectedData.wordCount.toString());
  }
  
  if (expectedData.estimatedReadingTime) {
    cy.dataCy('estimated-reading-time').should('contain.text', `${expectedData.estimatedReadingTime} min`);
  }
});

