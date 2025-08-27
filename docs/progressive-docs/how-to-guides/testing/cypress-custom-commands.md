# 🎯 Cypress Custom Commands para The Vaughan Storyteller

> **Comandos custom específicos para testing de componentes Quasar y funcionalidades del dominio educativo**

## 📋 Resumen

Esta guía documenta la implementación completa de **64+ comandos custom de Cypress** organizados por dominio funcional para The Vaughan Storyteller. Estos comandos mejoran significativamente la legibilidad, reutilización y mantenimiento de los tests E2E.

**⏱️ Tiempo**: 30-45 min | **📋 Prerequisitos**: Environment setup, Cypress básico

---

## 🏗️ Arquitectura de Comandos

### **Estructura Modular Implementada**

```
test/cypress/support/
├── commands.ts                    # Registro principal
├── commands/                      # Comandos por dominio
│   ├── story-commands.ts          # Sistema de historias (7 comandos)
│   ├── auth-commands.ts           # Autenticación (7 comandos)  
│   ├── vocabulary-commands.ts     # Vocabulario (9 comandos)
│   ├── audio-commands.ts          # Audio/TTS (10 comandos)
│   ├── admin-commands.ts          # Panel admin (10 comandos)
│   ├── pwa-commands.ts           # PWA/Offline (10 comandos)
│   └── quasar-commands.ts        # Quasar mejorados (11 comandos)
└── types/
    └── cypress-commands.d.ts      # Definiciones TypeScript
```

### **Principios de Diseño**

1. **Domain-Driven Organization**: Comandos agrupados por funcionalidad de negocio
2. **TypeScript First**: Soporte completo con IntelliSense
3. **Quasar-Aware**: Integración nativa con componentes Quasar
4. **Error Resilient**: Manejo robusto de estados y errores
5. **Accessibility Ready**: Comandos que verifican accesibilidad

---

## 🎯 Comandos por Dominio

### **📖 Story System Commands**

**Comandos principales para testing del sistema de generación y lectura de historias:**

```typescript
// Generar historia con nivel CEFR específico
cy.generateStory('B1', 'adventure');
cy.waitForStoryGeneration();

// Interacción con palabras en historia
cy.selectStoryWord('beautiful');
cy.addWordToVocabulary('beautiful');

// Verificación de progreso de lectura
cy.verifyStoryProgress(75);
cy.completeStoryReading();

// Navegación directa y verificación
cy.openStory('story-123');
cy.verifyStoryMetadata({
  level: 'B1',
  genre: 'Adventure',
  wordCount: 450,
  estimatedReadingTime: 3
});
```

**Casos de uso típicos:**
- ✅ Testing de generación de historias con OpenRouter
- ✅ Verificación de adaptación por nivel CEFR
- ✅ Testing de tracking de progreso de lectura
- ✅ Verificación de metadatos y tiempo estimado

---

### **🔐 Authentication & User Management Commands**

**Comandos para testing de autenticación con Supabase y gestión de perfiles:**

```typescript
// Login con diferentes roles
cy.loginAsUser();                    // Usuario estándar
cy.loginAsAdmin();                   // Administrador
cy.loginAsUser('custom@email.com', 'password123');

// Gestión de perfil de usuario
cy.selectCEFRLevel('B2');
cy.verifyUserRole('admin');

// Flows completos de registro
cy.registerUser({
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
  cefrLevel: 'B1'
});

cy.logout();
```

**Casos de uso típicos:**
- ✅ Testing de flows de login/logout
- ✅ Verificación de roles y permisos
- ✅ Testing de registro de nuevos usuarios
- ✅ Verificación de gestión de perfil CEFR

---

### **📚 Vocabulary System Commands**

**Comandos para testing del sistema de vocabulario con WordsAPI y spaced repetition:**

```typescript
// Gestión de vocabulario
cy.addWordToVocabulary('sophisticated');
cy.bulkAddWordsToVocabulary(['elegant', 'magnificent', 'extraordinary']);

// Sistema de flashcards y revisión
cy.startVocabularyReview(10);
cy.reviewVocabularyCard();
cy.rateVocabularyDifficulty(4);
cy.completeVocabularyReview();

// Verificación de algoritmo de repetición espaciada
cy.verifySpacedRepetitionSchedule('sophisticated', new Date('2024-01-15'));

// Filtros y estadísticas
cy.filterVocabularyBy('learning');
cy.verifyVocabularyStats({
  totalWords: 45,
  newWords: 12,
  learningWords: 28,
  masteredWords: 5
});
```

**Casos de uso típicos:**
- ✅ Testing de integración con WordsAPI
- ✅ Verificación del algoritmo SRS (Spaced Repetition)
- ✅ Testing de flashcards y sistema de rating
- ✅ Verificación de filtros y estadísticas

---

### **🔊 Audio & TTS Commands**

**Comandos para testing de integración con ElevenLabs y reproducción de audio:**

```typescript
// Control básico de audio
cy.playStoryAudio();
cy.pauseStoryAudio();
cy.waitForAudioLoad();

// Verificación de generación TTS
cy.verifyAudioGeneration();
cy.verifyAudioControls();

// Funcionalidades avanzadas
cy.changeAudioSpeed(1.5);
cy.seekAudioTo(50); // 50% de la duración

// Testing de accesibilidad y errores
cy.verifyAudioAccessibility();
cy.simulateAudioError();
cy.verifyAudioCaching();
```

**Casos de uso típicos:**
- ✅ Testing de integración con ElevenLabs TTS
- ✅ Verificación de controles de audio
- ✅ Testing de funcionalidades de accesibilidad
- ✅ Verificación de caché en Supabase Storage

---

### **🛡️ Admin Panel Commands**

**Comandos para testing del panel administrativo completo:**

```typescript
// Navegación y verificación de acceso
cy.loginAsAdmin();
cy.navigateToAdminPanel();

// Gestión de banners publicitarios
cy.createAdBanner({
  title: 'Premium Membership',
  content: 'Upgrade to unlock unlimited stories',
  imageUrl: 'https://example.com/banner.jpg',
  active: true
});
cy.activateBanner('banner-123');
cy.deactivateBanner('banner-456');

// Gestión de límites de usuario
cy.setUserStoryLimit('user-789', 50);

// Monitoring de APIs externas
cy.verifyAPIHealth('openrouter');
cy.verifyAPIHealth('elevenlabs');
cy.verifyAPIHealth('wordsapi');
cy.checkSystemStatus();

// Analytics y reportes
cy.verifyUserAnalytics({
  totalUsers: 1250,
  activeUsers: 340,
  newUsersToday: 15
});
cy.exportAdminReport('users');
```

**Casos de uso típicos:**
- ✅ Testing de funcionalidades administrativas
- ✅ Verificación de gestión de banners
- ✅ Testing de monitoring de APIs externas
- ✅ Verificación de límites y quotas de usuario

---

### **📱 PWA & Offline Commands**

**Comandos para testing de funcionalidad PWA y modo offline:**

```typescript
// Instalación y funcionalidad PWA
cy.installPWA();
cy.verifyPWAManifest();
cy.verifyServiceWorkerRegistration();

// Simulación de conectividad
cy.goOffline();
cy.verifyOfflinePageFunctionality();
cy.goOnline();

// Testing de sincronización
cy.verifyOfflineSync();
cy.triggerBackgroundSync();

// Verificación de estrategias de caché
cy.verifyCacheStrategy('/stories/generate');
cy.verifyAppShellCaching();
```

**Casos de uso típicos:**
- ✅ Testing de instalación PWA
- ✅ Verificación de funcionalidad offline
- ✅ Testing de sincronización background
- ✅ Verificación de estrategias de caché

---

### **⚡ Enhanced Quasar Commands**

**Comandos mejorados para componentes Quasar específicos:**

```typescript
// Componentes básicos mejorados
cy.selectFromQSelect('.level-selector', 'B2');
cy.verifyQNotification('Story generated successfully', 'positive');
cy.waitForQLoading();

// Gestión de diálogos
cy.openQDialog('confirm-delete');
cy.withinDialog(() => {
  cy.dataCy('confirm-btn').click();
});
cy.closeQDialog();

// Componentes complejos
cy.interactWithQTable('.user-table', {
  search: 'john@example.com',
  sort: { column: 'created_at', direction: 'desc' },
  selectRow: 0,
  pagination: { page: 2, rowsPerPage: 25 }
});

// Navegación en tabs y steppers
cy.navigateQTabs('.settings-tabs', 'Profile');
cy.navigateQStepper('.onboarding-stepper', 'next');

// Validación de formularios
cy.validateQForm('.profile-form', ['Email is required']);
```

**Casos de uso típicos:**
- ✅ Interacciones avanzadas con QTable
- ✅ Testing de validación de formularios
- ✅ Navegación en componentes complejos
- ✅ Verificación de notificaciones del sistema

---

## 🔧 Implementación y Uso

### **Configuración Automática**

Los comandos se registran automáticamente al importar:

```typescript
// test/cypress/support/commands.ts
import { registerCommands } from '@quasar/quasar-app-extension-testing-e2e-cypress';
registerCommands(); // Comandos base de Quasar

// Comandos custom del proyecto
import './commands/story-commands';
import './commands/auth-commands';
import './commands/vocabulary-commands';
import './commands/audio-commands';
import './commands/admin-commands';
import './commands/pwa-commands';
import './commands/quasar-commands';
import './types/cypress-commands';
```

### **TypeScript IntelliSense Completo**

```typescript
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // Todos los comandos tienen tipado completo
    generateStory(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', genre?: string): Chainable<void>;
    loginAsUser(email?: string, password?: string): Chainable<void>;
    addWordToVocabulary(word: string): Chainable<void>;
    // ... 60+ comandos más con tipos completos
  }
}
```

### **Ejemplo de Test E2E Completo**

```typescript
describe('Story Learning Flow', () => {
  beforeEach(() => {
    cy.loginAsUser();
    cy.selectCEFRLevel('B1');
  });

  it('should complete full story learning cycle', () => {
    // Generar historia
    cy.generateStory('B1', 'mystery');
    cy.waitForStoryGeneration();
    cy.verifyStoryMetadata({ level: 'B1', genre: 'Mystery' });

    // Interactuar con vocabulario
    cy.selectStoryWord('mysterious');
    cy.addWordToVocabulary('mysterious');

    // Escuchar narración
    cy.playStoryAudio();
    cy.verifyAudioControls();
    cy.changeAudioSpeed(1.25);

    // Completar lectura
    cy.verifyStoryProgress(0);
    cy.completeStoryReading();
    cy.verifyStoryProgress(100);

    // Revisar vocabulario
    cy.startVocabularyReview(1);
    cy.reviewVocabularyCard();
    cy.rateVocabularyDifficulty(3);

    // Verificar estadísticas
    cy.verifyVocabularyStats({ totalWords: 1 });
  });
});
```

---

## 🎯 Beneficios Implementados

### **Para Desarrolladores**

1. **Legibilidad Extrema**: Tests auto-documentados que explican el comportamiento
2. **Reutilización Máxima**: 64+ comandos reutilizables en cualquier test
3. **Mantenimiento Simplificado**: Lógica centralizada y fácil de actualizar
4. **TypeScript Nativo**: IntelliSense completo para todos los comandos

### **Para el Proyecto**

1. **Cobertura Completa**: Comandos específicos para cada funcionalidad
2. **Dominio Educativo**: Comandos optimizados para testing de e-learning
3. **Quasar Optimizado**: Integración perfecta con componentes Quasar
4. **APIs Externas**: Testing robusto de OpenRouter, ElevenLabs, WordsAPI

### **Para Testing**

1. **Faster Feedback**: Tests más rápidos y confiables
2. **Error Resilience**: Manejo robusto de errores y timeouts
3. **Accessibility**: Verificación automática de accesibilidad
4. **Real-world Scenarios**: Comandos que replican uso real de usuario

---

## 📚 Patrones de Uso

### **Pattern: Domain-Specific Test Flows**

```typescript
// ✅ BUENO: Flujo específico del dominio educativo
cy.loginAsUser();
cy.generateStory('A2', 'adventure');
cy.waitForStoryGeneration();
cy.selectStoryWord('journey');
cy.addWordToVocabulary('journey');
cy.playStoryAudio();
cy.completeStoryReading();
cy.startVocabularyReview();
```

```typescript
// ❌ EVITAR: Clicks genéricos sin contexto
cy.get('[data-cy="login-btn"]').click();
cy.get('[data-cy="level-select"]').select('A2');
cy.get('[data-cy="generate-btn"]').click();
cy.get('[data-cy="audio-play"]').click();
// ... código repetitivo y difícil de mantener
```

### **Pattern: Composable Command Chains**

```typescript
// Los comandos se componen naturalmente
cy.loginAsAdmin()
  .navigateToAdminPanel()
  .verifyAPIHealth('openrouter')
  .createAdBanner({
    title: 'New Feature',
    content: 'Try our new vocabulary system!'
  })
  .activateBanner('banner-new-feature');
```

### **Pattern: Data-Driven Testing**

```typescript
// Comandos optimizados para data-driven tests
const testWords = ['sophisticated', 'magnificent', 'extraordinary'];
cy.bulkAddWordsToVocabulary(testWords);
cy.startVocabularyReview(testWords.length);
cy.completeVocabularyReview();
cy.verifyVocabularyStats({ masteredWords: testWords.length });
```

---

## 🔗 Referencias

### **Comandos Base de Quasar Utilizados**

- `cy.dataCy(id)` - Selección por data-cy attribute
- `cy.selectDate(date)` - Selección en QDate components  
- `cy.testRoute(pattern)` - Testing de rutas con wildcards
- `cy.withinPortal(() => {})` - Scoping dentro de portals
- `cy.withinMenu(() => {})` - Scoping dentro de QMenu
- `cy.withinDialog(() => {})` - Scoping dentro de QDialog

### **Documentación Relacionada**

- [MSW Advanced Mocking](./msw-advanced-mocking.md) - Para mockear APIs en tests
- [TDD Scripts Setup](./tdd-scripts-setup.md) - Para flujo de desarrollo TDD
- [Quasar Testing Guide](https://testing.quasar.dev/) - Documentación oficial

### **Archivos de Configuración**

- `cypress.config.ts` - Configuración principal de Cypress
- `test/cypress/tsconfig.json` - TypeScript config para tests
- `test/cypress/support/types/cypress-commands.d.ts` - Definiciones de tipos

---

## 💡 Tips y Mejores Prácticas

### **Para Escribir Tests Efectivos**

1. **Usa comandos específicos del dominio**: `cy.generateStory()` mejor que clicks genéricos
2. **Combina comandos relacionados**: `cy.loginAsAdmin().navigateToAdminPanel()`
3. **Verifica estados intermedios**: `cy.waitForStoryGeneration()` antes de interactuar
4. **Aprovecha el tipado**: IntelliSense te guiará en parámetros requeridos

### **Para Debugging**

1. **Comandos con logging interno**: Todos incluyen logging para debugging
2. **Estados verificables**: Cada comando verifica pre/post condiciones
3. **Error resilience**: Manejo automático de timeouts y estados loading
4. **Cypress DevTools**: Los comandos aparecen claramente en el command log

### **Para Mantenimiento**

1. **Lógica centralizada**: Cambios en un solo lugar para toda la funcionalidad
2. **Versioning de comandos**: Los tipos te alertan sobre breaking changes
3. **Documentación inline**: Cada comando está documentado con JSDoc
4. **Testing de comandos**: Los propios comandos se pueden testear unitariamente

---

## 🚀 Próximos Pasos

### **Implementados ✅**
- 64+ comandos custom organizados por dominio
- TypeScript completo con IntelliSense
- Integración con todos los comandos base de Quasar
- Documentación completa y ejemplos de uso

### **Planeado para Task 0.8 🚧**
- Testing de funcionamiento de comandos dataCy, selectDate, testRoute
- Tests de integración para validar todos los comandos
- Performance benchmarks de comandos custom
- Visual regression testing con comandos

### **Futuras Mejoras 💡**
- Comandos para testing visual con Playwright
- Integración con Lighthouse para performance testing
- Comandos específicos para testing de accesibilidad WCAG
- Auto-generation de tests basado en comandos disponibles

---

**🎯 Status**: ✅ Completamente Implementado y Documentado

**Esta implementación proporciona una base sólida y completa para testing E2E específico del dominio educativo de The Vaughan Storyteller, con comandos reutilizables, tipados y optimizados para el stack tecnológico del proyecto.**