/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      // Story System Commands
      /**
       * Generate a story with specified CEFR level and optional genre
       * @param level - CEFR level (A1, A2, B1, B2, C1, C2)
       * @param genre - Optional story genre
       */
      generateStory(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', genre?: string): Chainable<void>;
      
      /**
       * Wait for story generation to complete
       */
      waitForStoryGeneration(): Chainable<void>;
      
      /**
       * Select a specific word in the story text
       * @param wordText - The text of the word to select
       */
      selectStoryWord(wordText: string): Chainable<void>;
      
      /**
       * Verify story reading progress
       * @param expectedProgress - Expected progress percentage (0-100)
       */
      verifyStoryProgress(expectedProgress: number): Chainable<void>;
      
      /**
       * Complete story reading
       */
      completeStoryReading(): Chainable<void>;
      
      /**
       * Navigate directly to a story by ID
       * @param storyId - The story ID to open
       */
      openStory(storyId: string): Chainable<void>;
      
      /**
       * Verify story metadata information
       * @param expectedData - Expected story metadata
       */
      verifyStoryMetadata(expectedData: {
        level?: string;
        genre?: string;
        wordCount?: number;
        estimatedReadingTime?: number;
      }): Chainable<void>;

      // Authentication & User Management Commands
      /**
       * Login as a regular user
       * @param email - Optional email (defaults to test user)
       * @param password - Optional password (defaults to test password)
       */
      loginAsUser(email?: string, password?: string): Chainable<void>;
      
      /**
       * Login as an administrator
       */
      loginAsAdmin(): Chainable<void>;
      
      /**
       * Logout current user
       */
      logout(): Chainable<void>;
      
      /**
       * Select CEFR level in user profile
       * @param level - CEFR level to select
       */
      selectCEFRLevel(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'): Chainable<void>;
      
      /**
       * Verify current user role
       * @param role - Expected user role
       */
      verifyUserRole(role: 'user' | 'admin'): Chainable<void>;
      
      /**
       * Register a new user account
       * @param userData - User registration data
       */
      registerUser(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
      }): Chainable<void>;
      
      /**
       * Reset user password
       * @param email - Email for password reset
       */
      resetPassword(email: string): Chainable<void>;

      // Vocabulary System Commands
      /**
       * Add a word to vocabulary from story
       * @param word - Word to add to vocabulary
       */
      addWordToVocabulary(word: string): Chainable<void>;
      
      /**
       * Review a vocabulary flashcard
       */
      reviewVocabularyCard(): Chainable<void>;
      
      /**
       * Rate vocabulary word difficulty
       * @param rating - Difficulty rating (1-5)
       */
      rateVocabularyDifficulty(rating: 1 | 2 | 3 | 4 | 5): Chainable<void>;
      
      /**
       * Verify spaced repetition schedule for a word
       * @param word - Word to check
       * @param expectedNextReview - Expected next review date
       */
      verifySpacedRepetitionSchedule(word: string, expectedNextReview: Date): Chainable<void>;
      
      /**
       * Filter vocabulary by status
       * @param status - Vocabulary status filter
       */
      filterVocabularyBy(status: 'new' | 'learning' | 'mastered'): Chainable<void>;
      
      /**
       * Bulk add multiple words to vocabulary
       * @param words - Array of words to add
       */
      bulkAddWordsToVocabulary(words: string[]): Chainable<void>;
      
      /**
       * Start a vocabulary review session
       * @param wordCount - Optional number of words to review
       */
      startVocabularyReview(wordCount?: number): Chainable<void>;
      
      /**
       * Complete the entire vocabulary review session
       */
      completeVocabularyReview(): Chainable<void>;
      
      /**
       * Verify vocabulary statistics
       * @param expectedStats - Expected statistics values
       */
      verifyVocabularyStats(expectedStats: {
        totalWords?: number;
        newWords?: number;
        learningWords?: number;
        masteredWords?: number;
      }): Chainable<void>;

      // Audio & TTS Commands
      /**
       * Play story audio narration
       */
      playStoryAudio(): Chainable<void>;
      
      /**
       * Pause story audio narration
       */
      pauseStoryAudio(): Chainable<void>;
      
      /**
       * Verify audio generation from ElevenLabs
       */
      verifyAudioGeneration(): Chainable<void>;
      
      /**
       * Wait for audio to load completely
       */
      waitForAudioLoad(): Chainable<void>;
      
      /**
       * Verify audio controls are present and functional
       */
      verifyAudioControls(): Chainable<void>;
      
      /**
       * Change audio playback speed
       * @param speed - Playback speed multiplier
       */
      changeAudioSpeed(speed: 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2): Chainable<void>;
      
      /**
       * Seek audio to specific percentage position
       * @param percentage - Position as percentage (0-100)
       */
      seekAudioTo(percentage: number): Chainable<void>;
      
      /**
       * Verify audio accessibility features
       */
      verifyAudioAccessibility(): Chainable<void>;
      
      /**
       * Simulate audio error for testing error handling
       */
      simulateAudioError(): Chainable<void>;
      
      /**
       * Verify audio caching functionality
       */
      verifyAudioCaching(): Chainable<void>;

      // Admin Panel Commands
      /**
       * Navigate to admin panel (requires admin role)
       */
      navigateToAdminPanel(): Chainable<void>;
      
      /**
       * Create a new advertisement banner
       * @param bannerData - Banner configuration data
       */
      createAdBanner(bannerData: {
        title: string;
        content: string;
        imageUrl?: string;
        active?: boolean;
      }): Chainable<void>;
      
      /**
       * Activate an advertisement banner
       * @param bannerId - ID of banner to activate
       */
      activateBanner(bannerId: string): Chainable<void>;
      
      /**
       * Deactivate an advertisement banner
       * @param bannerId - ID of banner to deactivate
       */
      deactivateBanner(bannerId: string): Chainable<void>;
      
      /**
       * Set story generation limit for a user
       * @param userId - Target user ID
       * @param limit - Story generation limit
       */
      setUserStoryLimit(userId: string, limit: number): Chainable<void>;
      
      /**
       * Verify API health status
       * @param service - API service to check
       */
      verifyAPIHealth(service: 'openrouter' | 'elevenlabs' | 'wordsapi'): Chainable<void>;
      
      /**
       * Check overall system status
       */
      checkSystemStatus(): Chainable<void>;
      
      /**
       * Create multiple test banners for testing
       * @param count - Number of banners to create
       */
      createTestBanners(count: number): Chainable<void>;
      
      /**
       * Verify user analytics metrics
       * @param expectedData - Expected analytics values
       */
      verifyUserAnalytics(expectedData: {
        totalUsers?: number;
        activeUsers?: number;
        newUsersToday?: number;
      }): Chainable<void>;
      
      /**
       * Export admin report
       * @param reportType - Type of report to export
       */
      exportAdminReport(reportType: 'users' | 'stories' | 'vocabulary' | 'system'): Chainable<void>;

      // PWA & Offline Commands
      /**
       * Simulate PWA installation
       */
      installPWA(): Chainable<void>;
      
      /**
       * Simulate going offline
       */
      goOffline(): Chainable<void>;
      
      /**
       * Simulate coming back online
       */
      goOnline(): Chainable<void>;
      
      /**
       * Verify cache strategy for specific resource
       * @param resource - Resource to check caching for
       */
      verifyCacheStrategy(resource: string): Chainable<void>;
      
      /**
       * Verify offline synchronization works
       */
      verifyOfflineSync(): Chainable<void>;
      
      /**
       * Trigger background synchronization
       */
      triggerBackgroundSync(): Chainable<void>;
      
      /**
       * Verify service worker is properly registered
       */
      verifyServiceWorkerRegistration(): Chainable<void>;
      
      /**
       * Verify offline page functionality when network is unavailable
       */
      verifyOfflinePageFunctionality(): Chainable<void>;
      
      /**
       * Verify PWA manifest is properly configured
       */
      verifyPWAManifest(): Chainable<void>;
      
      /**
       * Verify app shell caching strategy works offline
       */
      verifyAppShellCaching(): Chainable<void>;

      // Enhanced Quasar Component Commands
      /**
       * Select an option from QSelect dropdown
       * @param selector - QSelect element selector
       * @param option - Option text to select
       */
      selectFromQSelect(selector: string, option: string): Chainable<void>;
      
      /**
       * Open a named QDialog
       * @param dialogName - Name/identifier of dialog
       */
      openQDialog(dialogName: string): Chainable<void>;
      
      /**
       * Close any open QDialog
       */
      closeQDialog(): Chainable<void>;
      
      /**
       * Verify QNotification appears with specific message
       * @param message - Expected notification message
       * @param type - Optional notification type
       */
      verifyQNotification(message: string, type?: string): Chainable<void>;
      
      /**
       * Toggle QDrawer (sidebar)
       */
      toggleQDrawer(): Chainable<void>;
      
      /**
       * Wait for QLoading to disappear
       */
      waitForQLoading(): Chainable<void>;
      
      /**
       * Interact with QTable (search, sort, filter, select, paginate)
       * @param tableSelector - CSS selector for the QTable
       * @param actions - Object defining the interactions to perform
       */
      interactWithQTable(tableSelector: string, actions: {
        search?: string;
        sort?: { column: string; direction: 'asc' | 'desc' };
        filter?: { column: string; value: string };
        selectRow?: number;
        pagination?: { page: number; rowsPerPage?: number };
      }): Chainable<void>;
      
      /**
       * Validate QForm and check for errors
       * @param formSelector - CSS selector for the QForm
       * @param expectedErrors - Optional array of expected error messages
       */
      validateQForm(formSelector: string, expectedErrors?: string[]): Chainable<void>;
      
      /**
       * Navigate between QTabs
       * @param tabsSelector - CSS selector for the QTabs container
       * @param tabName - Name of the tab to activate
       */
      navigateQTabs(tabsSelector: string, tabName: string): Chainable<void>;
      
      /**
       * Toggle QExpansionItem open/closed
       * @param itemSelector - CSS selector for the QExpansionItem
       */
      toggleQExpansionItem(itemSelector: string): Chainable<void>;
      
      /**
       * Navigate QStepper steps
       * @param stepperSelector - CSS selector for the QStepper
       * @param action - Navigation action (next, previous, or step number)
       */
      navigateQStepper(stepperSelector: string, action: 'next' | 'previous' | number): Chainable<void>;

      // MSW Commands for API mocking
      /**
       * Start MSW service worker for API mocking
       */
      startMSW(): Chainable<void>;
      
      /**
       * Stop MSW service worker
       */
      stopMSW(): Chainable<void>;
      
      /**
       * Reset MSW handlers to initial state
       */
      resetMSW(): Chainable<void>;
      
      /**
       * Override MSW handlers for specific test scenarios
       */
      overrideMSW(handlers: unknown[]): Chainable<void>;
    }
}