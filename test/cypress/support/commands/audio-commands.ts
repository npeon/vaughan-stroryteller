/// <reference types="cypress" />

/**
 * Custom Cypress commands for The Vaughan Storyteller - Audio & TTS System
 * These commands handle ElevenLabs TTS integration, audio playback, and controls
 */

Cypress.Commands.add('playStoryAudio', () => {
  // Ensure we're on a story page with audio available
  cy.dataCy('story-content').should('be.visible');
  
  // Wait for audio to be generated/loaded
  cy.waitForAudioLoad();
  
  // Click play button
  cy.dataCy('audio-play-btn').should('be.visible').and('not.be.disabled').click();
  
  // Verify audio is playing
  cy.dataCy('audio-player').should('have.class', 'playing');
  cy.dataCy('audio-play-btn').should('not.be.visible');
  cy.dataCy('audio-pause-btn').should('be.visible');
  
  // Verify audio progress starts moving
  cy.dataCy('audio-progress-bar').should('have.attr', 'aria-valuenow').and('not.eq', '0');
});

Cypress.Commands.add('pauseStoryAudio', () => {
  // Ensure audio is currently playing
  cy.dataCy('audio-player').should('have.class', 'playing');
  
  // Click pause button
  cy.dataCy('audio-pause-btn').should('be.visible').click();
  
  // Verify audio is paused
  cy.dataCy('audio-player').should('not.have.class', 'playing');
  cy.dataCy('audio-pause-btn').should('not.be.visible');
  cy.dataCy('audio-play-btn').should('be.visible');
  
  // Verify progress bar stops updating
  const currentProgress = cy.dataCy('audio-progress-bar').invoke('attr', 'aria-valuenow');
  cy.wait(1000);
  cy.dataCy('audio-progress-bar').should('have.attr', 'aria-valuenow').then((newProgress) => {
    expect(newProgress).to.equal(currentProgress);
  });
});

Cypress.Commands.add('verifyAudioGeneration', () => {
  // Check if audio generation is in progress
  cy.get('body').then($body => {
    if ($body.find('[data-cy="audio-generation-loading"]').length) {
      cy.dataCy('audio-generation-loading').should('be.visible');
      cy.dataCy('audio-generation-status').should('contain.text', 'Generating audio');
    }
  });
  
  // Wait for generation to complete
  cy.dataCy('audio-generation-loading', { timeout: 30000 }).should('not.exist');
  
  // Verify audio controls are available
  cy.verifyAudioControls();
  
  // Verify audio source is set
  cy.dataCy('audio-player').should('have.attr', 'src').and('not.be.empty');
});

Cypress.Commands.add('waitForAudioLoad', () => {
  // Wait for audio loading indicator to disappear
  cy.dataCy('audio-loading', { timeout: 15000 }).should('not.exist');
  
  // Verify audio element is ready
  cy.dataCy('audio-player').should($audio => {
    const audioElement = $audio[0] as HTMLAudioElement;
    expect(audioElement.readyState).to.be.greaterThan(0);
  });
  
  // Verify play button is enabled
  cy.dataCy('audio-play-btn').should('be.visible').and('not.be.disabled');
});

Cypress.Commands.add('verifyAudioControls', () => {
  // Verify all audio control buttons are present
  cy.dataCy('audio-play-btn').should('be.visible');
  cy.dataCy('audio-progress-bar').should('be.visible');
  cy.dataCy('audio-volume-control').should('be.visible');
  cy.dataCy('audio-duration-display').should('be.visible');
  
  // Verify audio settings menu
  cy.dataCy('audio-settings-btn').should('be.visible');
  
  // Test volume control
  cy.dataCy('audio-volume-control').click();
  cy.dataCy('volume-slider').should('be.visible');
});

// Helper command to test audio speed control
Cypress.Commands.add('changeAudioSpeed', (speed: 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2) => {
  // Open audio settings
  cy.dataCy('audio-settings-btn').click();
  
  // Select speed
  cy.dataCy('speed-control').click();
  cy.get('.q-menu .q-item').contains(`${speed}x`).click();
  
  // Verify speed is applied
  cy.dataCy('current-speed-display').should('contain.text', `${speed}x`);
  
  // Verify audio element playback rate
  cy.dataCy('audio-player').should($audio => {
    const audioElement = $audio[0] as HTMLAudioElement;
    expect(audioElement.playbackRate).to.equal(speed);
  });
});

// Helper command to test audio seeking
Cypress.Commands.add('seekAudioTo', (percentage: number) => {
  // Click on progress bar at specific percentage
  cy.dataCy('audio-progress-bar').then($progressBar => {
    const element = $progressBar[0];
    if (!element) {
      throw new Error('Progress bar element not found');
    }
    
    const rect = element.getBoundingClientRect();
    const x = rect.left + (rect.width * percentage / 100);
    const y = rect.top + rect.height / 2;
    
    cy.wrap($progressBar).click(x, y, { force: true });
  });
  
  // Verify audio position changed
  cy.dataCy('audio-current-time').should('not.contain.text', '0:00');
});

// Helper command to verify audio accessibility
Cypress.Commands.add('verifyAudioAccessibility', () => {
  // Check ARIA labels and roles
  cy.dataCy('audio-player').should('have.attr', 'aria-label');
  cy.dataCy('audio-play-btn').should('have.attr', 'aria-label', 'Play audio');
  cy.dataCy('audio-progress-bar').should('have.attr', 'role', 'slider');
  
  // Test keyboard navigation
  cy.dataCy('audio-play-btn').focus().should('be.focused');
  cy.dataCy('audio-play-btn').type('{enter}');
  
  // Verify audio started playing
  cy.dataCy('audio-player').should('have.class', 'playing');
});

// Helper command to test audio error handling
Cypress.Commands.add('simulateAudioError', () => {
  // Simulate network error or invalid audio source
  cy.dataCy('audio-player').then($audio => {
    const audioElement = $audio[0] as HTMLAudioElement;
    audioElement.src = 'invalid-audio-url.mp3';
  });
  
  // Verify error handling
  cy.dataCy('audio-error-message').should('be.visible');
  cy.dataCy('retry-audio-btn').should('be.visible');
  
  // Test retry functionality
  cy.dataCy('retry-audio-btn').click();
  cy.dataCy('audio-generation-loading').should('be.visible');
});

// Helper command to verify audio caching
Cypress.Commands.add('verifyAudioCaching', () => {
  // Check if audio is cached in Supabase Storage
  cy.window().then((win) => {
    // Check localStorage or IndexedDB for cached audio URLs
    const cachedAudio = win.localStorage.getItem('cached_audio_urls');
    expect(cachedAudio).to.not.be.null;
  });
  
  // Verify subsequent loads are faster
  const startTime = Date.now();
  cy.waitForAudioLoad();
  const loadTime = Date.now() - startTime;
  
  // Cached audio should load in under 2 seconds
  expect(loadTime).to.be.lessThan(2000);
});

