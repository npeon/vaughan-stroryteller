/// <reference types="cypress" />

/**
 * Custom Cypress commands for The Vaughan Storyteller - PWA & Offline Functionality
 * These commands handle PWA installation, offline/online simulation, and sync testing
 */

Cypress.Commands.add('installPWA', () => {
  // Check if PWA is installable
  cy.window().then((win) => {
    // Simulate beforeinstallprompt event
    const installEvent = new CustomEvent('beforeinstallprompt');
    win.dispatchEvent(installEvent);
  });
  
  // Verify install prompt appears
  cy.dataCy('pwa-install-banner').should('be.visible');
  cy.dataCy('install-pwa-btn').should('be.visible').click();
  
  // Confirm installation in dialog
  cy.get('body').then($body => {
    if ($body.find('[data-cy="confirm-install-dialog"]').length) {
      cy.dataCy('confirm-install-btn').click();
    }
  });
  
  // Verify PWA installation success
  cy.verifyQNotification('App installed successfully', 'positive');
  
  // Verify install banner is hidden
  cy.dataCy('pwa-install-banner').should('not.exist');
});

Cypress.Commands.add('goOffline', () => {
  // Simulate offline network condition
  cy.log('Simulating offline mode');
  
  // Set navigator.onLine to false
  cy.window().then((win) => {
    cy.stub(win.navigator, 'onLine').value(false);
    
    // Dispatch offline event
    const offlineEvent = new Event('offline');
    win.dispatchEvent(offlineEvent);
  });
  
  // Verify offline indicator appears
  cy.dataCy('offline-indicator').should('be.visible');
  cy.dataCy('network-status').should('contain.text', 'Offline');
  
  // Verify offline message is shown
  cy.dataCy('offline-message').should('be.visible');
});

Cypress.Commands.add('goOnline', () => {
  // Simulate online network condition
  cy.log('Simulating online mode');
  
  // Set navigator.onLine to true
  cy.window().then((win) => {
    cy.stub(win.navigator, 'onLine').value(true);
    
    // Dispatch online event
    const onlineEvent = new Event('online');
    win.dispatchEvent(onlineEvent);
  });
  
  // Verify offline indicator disappears
  cy.dataCy('offline-indicator').should('not.exist');
  cy.dataCy('network-status').should('contain.text', 'Online');
  
  // Verify sync notification appears
  cy.verifyQNotification('Back online, syncing data', 'positive');
});

Cypress.Commands.add('verifyCacheStrategy', (resource: string) => {
  // Check if resource is cached in service worker
  cy.window().then(async (win) => {
    if ('serviceWorker' in win.navigator && 'caches' in win) {
      const cacheNames = await win.caches.keys();
      let found = false;
      
      for (const cacheName of cacheNames) {
        const cache = await win.caches.open(cacheName);
        const cachedResponse = await cache.match(resource);
        if (cachedResponse) {
          found = true;
          break;
        }
      }
      
      expect(found).to.be.true;
    }
  });
  
  // Verify cached resource loads when offline
  cy.goOffline();
  cy.visit(resource);
  cy.get('body').should('be.visible'); // Page should load from cache
  cy.goOnline();
});

Cypress.Commands.add('verifyOfflineSync', () => {
  // Create some data while online
  cy.addWordToVocabulary('test-word-offline');
  cy.generateStory('B1', 'adventure');
  
  // Go offline
  cy.goOffline();
  
  // Try to create more data (should be queued)
  cy.addWordToVocabulary('offline-word');
  cy.verifyQNotification('Saved offline, will sync when online', 'info');
  
  // Verify sync queue indicator
  cy.dataCy('sync-queue-indicator').should('be.visible');
  cy.dataCy('pending-sync-count').should('contain.text', '1');
  
  // Go back online
  cy.goOnline();
  
  // Verify sync process starts
  cy.dataCy('sync-in-progress').should('be.visible');
  
  // Wait for sync to complete
  cy.dataCy('sync-in-progress', { timeout: 10000 }).should('not.exist');
  
  // Verify sync success
  cy.verifyQNotification('Data synced successfully', 'positive');
  cy.dataCy('sync-queue-indicator').should('not.exist');
});

Cypress.Commands.add('triggerBackgroundSync', () => {
  // Manually trigger background sync
  cy.window().then(async (win) => {
    if ('serviceWorker' in win.navigator) {
      const registration = await win.navigator.serviceWorker.ready;
      // Check if sync is available (Background Sync API)
      if ('sync' in registration) {
        // Trigger background sync
        await (registration as any).sync.register('background-sync');
      } else {
        // Fallback: simulate sync trigger without actual API
        cy.log('Background Sync API not available, simulating trigger');
      }
    }
  });
  
  // Verify background sync notification
  cy.verifyQNotification('Background sync triggered', 'info');
  
  // Check sync status
  cy.dataCy('last-sync-time').should('not.be.empty');
});

// Helper command to verify service worker registration
Cypress.Commands.add('verifyServiceWorkerRegistration', () => {
  cy.window().then((win) => {
    expect(win.navigator.serviceWorker).to.exist;
    
    // Check if service worker is registered
    win.navigator.serviceWorker.ready.then((registration) => {
      expect(registration).to.exist;
      expect(registration.active).to.exist;
    });
  });
  
  // Verify service worker status in DevTools
  cy.dataCy('sw-status-indicator').should('be.visible');
  cy.dataCy('sw-status').should('contain.text', 'Active');
});

// Helper command to test offline page functionality
Cypress.Commands.add('verifyOfflinePageFunctionality', () => {
  // Go offline
  cy.goOffline();
  
  // Try to navigate to a page that requires network
  cy.visit('/stories/generate');
  
  // Verify offline page is shown
  cy.dataCy('offline-page').should('be.visible');
  cy.dataCy('offline-message').should('contain.text', 'You are currently offline');
  
  // Verify cached content is still accessible
  cy.dataCy('offline-available-content').should('be.visible');
  cy.dataCy('cached-stories-link').should('be.visible');
  cy.dataCy('offline-vocabulary-link').should('be.visible');
  
  // Test cached content access
  cy.dataCy('cached-stories-link').click();
  cy.dataCy('cached-stories-list').should('be.visible');
});

// Helper command to verify PWA manifest
Cypress.Commands.add('verifyPWAManifest', () => {
  // Check manifest link in head
  cy.get('head link[rel="manifest"]').should('exist');
  
  // Fetch and verify manifest content
  cy.request('/manifest.json').then((response) => {
    expect(response.status).to.eq(200);
    
    const manifest = response.body;
    expect(manifest).to.have.property('name', 'The Vaughan Storyteller');
    expect(manifest).to.have.property('short_name', 'Vaughan Storyteller');
    expect(manifest).to.have.property('display', 'standalone');
    expect(manifest.icons).to.be.an('array').and.have.length.greaterThan(0);
  });
});

// Helper command to test app shell caching
Cypress.Commands.add('verifyAppShellCaching', () => {
  // Visit app and let it cache
  cy.visit('/');
  cy.wait(2000); // Allow service worker to cache resources
  
  // Go offline
  cy.goOffline();
  
  // Verify app shell still loads
  cy.visit('/');
  cy.dataCy('app-shell').should('be.visible');
  cy.dataCy('navigation').should('be.visible');
  cy.dataCy('main-content').should('be.visible');
  
  // Go back online
  cy.goOnline();
});

