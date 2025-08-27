/// <reference types="cypress" />

/**
 * Custom Cypress commands for The Vaughan Storyteller - Vocabulary System
 * These commands handle vocabulary management, flashcards, and spaced repetition
 */

Cypress.Commands.add('addWordToVocabulary', (word: string) => {
  // Ensure we have a word selected or find it in the story
  cy.get('body').then($body => {
    // If word selection popup is not visible, find and select the word first
    if (!$body.find('[data-cy="word-selection-popup"]').length) {
      cy.selectStoryWord(word);
    }
  });
  
  // Click add to vocabulary button
  cy.dataCy('add-to-vocabulary-btn').should('be.visible').click();
  
  // Verify word was added successfully
  cy.verifyQNotification('Word added to vocabulary', 'positive');
  
  // Verify the word appears in vocabulary list
  cy.dataCy('vocabulary-word-count').should('contain.text', '+1');
});

Cypress.Commands.add('reviewVocabularyCard', () => {
  // Navigate to vocabulary review if not already there
  cy.url().then((url) => {
    if (!url.includes('/vocabulary/review')) {
      cy.visit('/vocabulary/review');
    }
  });
  
  // Verify flashcard is visible
  cy.dataCy('vocabulary-flashcard').should('be.visible');
  cy.dataCy('flashcard-word').should('not.be.empty');
  
  // Click to reveal definition (flip card)
  cy.dataCy('flip-flashcard-btn').click();
  
  // Verify definition is shown
  cy.dataCy('flashcard-definition').should('be.visible');
  cy.dataCy('flashcard-pronunciation').should('be.visible');
});

Cypress.Commands.add('rateVocabularyDifficulty', (rating: 1 | 2 | 3 | 4 | 5) => {
  // Ensure we're in review mode with definition visible
  cy.dataCy('flashcard-definition').should('be.visible');
  
  // Click the appropriate rating button
  cy.dataCy(`difficulty-rating-${rating}`).click();
  
  // Verify rating was recorded
  cy.verifyQNotification('Word reviewed', 'positive');
  
  // Verify next card loads or review session completes
  cy.get('body').then($body => {
    if ($body.find('[data-cy="review-session-complete"]').length) {
      cy.dataCy('review-session-complete').should('be.visible');
    } else {
      cy.dataCy('vocabulary-flashcard').should('be.visible');
    }
  });
});

Cypress.Commands.add('verifySpacedRepetitionSchedule', (word: string, expectedNextReview: Date) => {
  // Navigate to vocabulary list
  cy.visit('/vocabulary');
  
  // Search for the specific word
  cy.dataCy('vocabulary-search').type(word);
  
  // Find the word row and check next review date
  cy.dataCy('vocabulary-table')
    .contains('tr', word)
    .within(() => {
      const expectedDateStr = expectedNextReview.toLocaleDateString();
      cy.dataCy('next-review-date').should('contain.text', expectedDateStr);
    });
});

Cypress.Commands.add('filterVocabularyBy', (status: 'new' | 'learning' | 'mastered') => {
  // Navigate to vocabulary page if not already there
  cy.url().then((url) => {
    if (!url.includes('/vocabulary')) {
      cy.visit('/vocabulary');
    }
  });
  
  // Click on the status filter
  cy.dataCy('vocabulary-status-filter').click();
  
  // Select the status from dropdown
  cy.get('.q-menu .q-item').contains(status, { matchCase: false }).click();
  
  // Verify filter is applied
  cy.dataCy('active-filter-badge').should('contain.text', status);
  
  // Verify only words with the selected status are shown
  cy.dataCy('vocabulary-table').within(() => {
    cy.get('tr[data-cy^="vocabulary-row"]').each($row => {
      cy.wrap($row).find('[data-cy="word-status"]').should('contain.text', status);
    });
  });
});

// Helper command to bulk add words for testing
Cypress.Commands.add('bulkAddWordsToVocabulary', (words: string[]) => {
  words.forEach(word => {
    cy.addWordToVocabulary(word);
    cy.wait(500); // Small delay between additions
  });
});

// Helper command to start a vocabulary review session
Cypress.Commands.add('startVocabularyReview', (wordCount?: number) => {
  // Navigate to vocabulary review
  cy.visit('/vocabulary/review');
  
  // If word count is specified, set review session size
  if (wordCount) {
    cy.dataCy('review-session-size').clear().type(wordCount.toString());
  }
  
  // Start review session
  cy.dataCy('start-review-btn').click();
  
  // Verify review session started
  cy.dataCy('vocabulary-flashcard').should('be.visible');
  cy.dataCy('review-progress').should('be.visible');
});

// Helper command to complete vocabulary review session
Cypress.Commands.add('completeVocabularyReview', () => {
  // Keep reviewing words until session is complete
  cy.get('body').then(function checkReviewStatus($body) {
    if ($body.find('[data-cy="review-session-complete"]').length) {
      // Session is complete
      cy.dataCy('review-session-complete').should('be.visible');
      cy.dataCy('session-stats').should('be.visible');
    } else if ($body.find('[data-cy="vocabulary-flashcard"]').length) {
      // More words to review
      cy.reviewVocabularyCard();
      cy.rateVocabularyDifficulty(3); // Default rating
      cy.wait(1000);
      cy.get('body').then(checkReviewStatus);
    }
  });
});

// Helper command to verify vocabulary statistics
Cypress.Commands.add('verifyVocabularyStats', (expectedStats: {
  totalWords?: number;
  newWords?: number;
  learningWords?: number;
  masteredWords?: number;
}) => {
  cy.visit('/vocabulary/stats');
  
  if (expectedStats.totalWords) {
    cy.dataCy('total-words-stat').should('contain.text', expectedStats.totalWords.toString());
  }
  
  if (expectedStats.newWords) {
    cy.dataCy('new-words-stat').should('contain.text', expectedStats.newWords.toString());
  }
  
  if (expectedStats.learningWords) {
    cy.dataCy('learning-words-stat').should('contain.text', expectedStats.learningWords.toString());
  }
  
  if (expectedStats.masteredWords) {
    cy.dataCy('mastered-words-stat').should('contain.text', expectedStats.masteredWords.toString());
  }
});

