// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// DO NOT REMOVE
// Imports Quasar Cypress AE predefined commands
import { registerCommands } from '@quasar/quasar-app-extension-testing-e2e-cypress';
registerCommands();

// Import custom command modules for The Vaughan Storyteller
import './commands/story-commands';
import './commands/auth-commands';
import './commands/vocabulary-commands';
import './commands/audio-commands';
import './commands/admin-commands';
import './commands/pwa-commands';
import './commands/quasar-commands';

// Import TypeScript definitions
import './types/cypress-commands';


Cypress.Commands.add('startMSW', () => {
  cy.window().then((win) => {
    // Import MSW worker dynamically
    return win.eval(`
      import('/src/mocks/browser.js').then((module) => {
        return module.workerUtils.start();
      });
    `);
  });
});

Cypress.Commands.add('stopMSW', () => {
  cy.window().then((win) => {
    return win.eval(`
      import('/src/mocks/browser.js').then((module) => {
        return module.workerUtils.stop();
      });
    `);
  });
});

Cypress.Commands.add('resetMSW', () => {
  cy.window().then((win) => {
    return win.eval(`
      import('/src/mocks/browser.js').then((module) => {
        return module.workerUtils.reset();
      });
    `);
  });
});

Cypress.Commands.add('overrideMSW', (handlers: unknown[]) => {
  cy.window().then((win) => {
    return win.eval(`
      import('/src/mocks/browser.js').then((module) => {
        return module.workerUtils.override(...${JSON.stringify(handlers)});
      });
    `);
  });
});
