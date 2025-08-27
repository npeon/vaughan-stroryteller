# 🔧 01. Configuración del Entorno TDD

> **✅ Tasks 0.1-0.3 Completadas** - Setup completo de Vitest + Cypress + MSW funcionando

## 🎯 Objetivo

Verificar y comprender la configuración TDD profesional ya implementada en el proyecto. Al completar esta sección, tendrás:

- ✅ **Environment TDD funcionando**: Vitest + Cypress + MSW configurados
- ✅ **Comprensión de setup**: Entiendes cada parte de la configuración
- ✅ **Testing commands**: Dominas todos los comandos de testing
- ✅ **Validación completa**: Confirmas que todo funciona correctamente

**⏱️ Tiempo estimado**: 2-3 horas  
**📋 Prerequisitos**: Node.js 18+, proyecto clonado y `npm install` ejecutado

## 📊 Estado Actual de Configuración

### **✅ Task 0.1: Testing Unitario con Vitest**
```bash
# ✅ Extensión instalada automáticamente
@quasar/quasar-app-extension-testing-unit-vitest: ^1.2.3
```

### **✅ Task 0.2: Testing E2E con Cypress**  
```bash
# ✅ Extensión instalada automáticamente
@quasar/quasar-app-extension-testing-e2e-cypress: ^6.2.1
```

### **✅ Task 0.3: MSW para API Mocking**
```bash
# ✅ MSW y utilities instaladas
msw: ^2.10.5
@mswjs/data: ^0.16.2
```

## 🧪 1. Verificación de Testing Unitario (Vitest)

### **Configuración Actual**
El archivo `vitest.config.mts` está configurado con:

```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    environment: 'happy-dom',           // ✅ DOM simulation
    setupFiles: 'test/vitest/setup-file.ts',  // ✅ MSW auto-start
    include: [
      'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: 'src/quasar-variables.scss' }),
    tsconfigPaths(),
  ],
});
```

### **🔍 Elementos Clave de la Configuración**

1. **`happy-dom`**: DOM simulation ligero y rápido
2. **`setup-file.ts`**: Inicializa MSW automáticamente
3. **Quasar plugin**: Soporte completo para componentes Quasar
4. **tsconfigPaths**: Resolve automático de aliases de TypeScript

### **✅ Verificación - Comandos Disponibles**

```bash
# Testing unitario básico
npm run test:unit

# Testing con UI (interfaz visual)
npm run test:unit:ui

# Testing para CI (sin watch mode)
npm run test:unit:ci
```

### **🧪 Test de Verificación**
Ejecuta este comando para verificar que Vitest funciona:

```bash
npm run test:unit:ci
```

**Resultado esperado**: Tests pasan sin errores y se ejecuta el test de verificación MSW.

---

## 🌐 2. Verificación de Testing E2E (Cypress)

### **Configuración Actual**
El archivo `cypress.config.ts` incluye:

```typescript
// cypress.config.ts
import registerCodeCoverageTasks from '@cypress/code-coverage/task';
import { injectQuasarDevServerConfig } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';
import { defineConfig } from 'cypress';

export default defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  e2e: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
    baseUrl: 'http://localhost:8080/',
    supportFile: 'test/cypress/support/e2e.ts',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  component: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
    supportFile: 'test/cypress/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'test/cypress/support/component-index.html',
    devServer: injectQuasarDevServerConfig(),
  },
});
```

### **🔍 Elementos Clave de la Configuración**

1. **E2E Testing**: Configurado para http://localhost:8080/
2. **Component Testing**: Integrado con Quasar dev server
3. **Code Coverage**: Instrumentación automática
4. **Video Recording**: Grabación de tests para debugging

### **✅ Verificación - Comandos Disponibles**

```bash
# E2E testing (modo interactivo)
npm run test:e2e

# E2E testing para CI (headless)
npm run test:e2e:ci

# Component testing (modo interactivo)  
npm run test:component

# Component testing para CI (headless)
npm run test:component:ci
```

### **🧪 Test de Verificación**
Para verificar E2E, necesitas el servidor desarrollo corriendo:

```bash
# Terminal 1: Iniciar servidor de desarrollo
npm run dev

# Terminal 2: Ejecutar tests E2E
npm run test:e2e:ci
```

**Resultado esperado**: Cypress ejecuta el test de home page sin errores.

---

## 🎭 3. Verificación de MSW (API Mocking)

### **Configuración Browser**
MSW está configurado para browser en `src/mocks/browser.ts`:

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### **Configuración Node (Tests)**
Para Vitest en `src/mocks/node.ts`:

```typescript
// src/mocks/node.ts  
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### **🔍 APIs Mockeadas**

#### **OpenRouter API** (IA para historias)
```typescript
// Mock para: https://openrouter.ai/api/v1/chat/completions
// Modelos: Claude 3.5, GPT-4, Llama 3.1
```

#### **ElevenLabs API** (Text-to-Speech)
```typescript
// Mock para: https://api.elevenlabs.io/v1/text-to-speech/:voiceId
// Mock para: https://api.elevenlabs.io/v1/voices
```

#### **WordsAPI** (Diccionario)
```typescript
// Mock para: https://wordsapiv1.p.rapidapi.com/words/:word
// Endpoints: definitions, synonyms, pronunciation
```

### **✅ Verificación - Test MSW**
El proyecto incluye un test completo de verificación MSW:

```bash
npm run test:unit -- test/vitest/__tests__/msw-verification.test.ts
```

Este test verifica:
- ✅ **OpenRouter**: Success, rate limiting, different models
- ✅ **ElevenLabs**: TTS, voices, quota exceeded, invalid voice  
- ✅ **WordsAPI**: Word lookup, definitions, synonyms, pronunciation
- ✅ **MSW Utilities**: Request tracking, waiting, patterns
- ✅ **Error Scenarios**: Network failures, slow responses

**Resultado esperado**: 25+ tests pasan, confirmando que todas las APIs están correctamente mockeadas.

---

## 🛠️ 4. Testing de la Configuración Completa

### **✅ Checklist de Verificación**

Ejecuta cada comando y verifica que funciona:

```bash
# 1. ✅ Vitest unitario
npm run test:unit:ci
# Debe pasar todos los tests incluyendo MSW verification

# 2. ✅ Vitest con UI
npm run test:unit:ui  
# Debe abrir interfaz web en http://localhost:51204

# 3. ✅ TypeScript check
npm run typecheck
# No debe tener errores de tipos

# 4. ✅ Lint check
npm run lint
# No debe tener errores de ESLint

# 5. ✅ Cypress component (con dev server)
npm run dev & npm run test:component:ci
# Debe pasar component tests
```

### **🔍 Validación Detallada**

#### **Estructura de Tests Creada**
```
test/
├── cypress/
│   ├── e2e/
│   │   └── home.cy.ts              # ✅ E2E test básico
│   ├── support/
│   │   ├── commands.ts             # ✅ Custom commands
│   │   └── component.ts            # ✅ Component support
│   └── fixtures/
│       └── example.json            # ✅ Test data
└── vitest/
    ├── __tests__/
    │   ├── msw-verification.test.ts # ✅ MSW complete testing
    │   ├── ExampleComponent.test.ts # ✅ Component test
    │   └── LayoutComponent.test.ts  # ✅ Layout test
    └── setup-file.ts               # ✅ MSW auto-start
```

#### **Configuraciones TypeScript**
```
test/cypress/tsconfig.json          # ✅ Cypress TS config
src/env.d.ts                        # ✅ Vite env types
tsconfig.json                       # ✅ Main TS config
```

---

## 🎓 5. Comprensión de la Configuración

### **¿Por Qué Esta Configuración?**

#### **Vitest vs Jest**
- ✅ **Performance**: ~10x más rápido que Jest
- ✅ **Vue 3 Integration**: Soporte nativo con @vitejs/plugin-vue
- ✅ **ESM Support**: No necesita transformación adicional
- ✅ **TypeScript**: Soporte first-class sin configuración extra

#### **Cypress vs Playwright**
- ✅ **Quasar Integration**: Plugin oficial de Quasar
- ✅ **Component Testing**: Testing de componentes individual
- ✅ **Debug Experience**: Interfaz visual excelente
- ✅ **Stability**: Amplia adopción en la comunidad

#### **MSW vs Alternatives**
- ✅ **Network Layer**: Intercepta a nivel de network requests
- ✅ **Browser + Node**: Mismo código para development y testing
- ✅ **Real Network Behavior**: Simula comportamiento de red real
- ✅ **Developer Experience**: Debugging visual de requests

### **Patterns Implementados**

#### **Test Organization**
- **Unit tests**: `test/vitest/__tests__/`
- **E2E tests**: `test/cypress/e2e/`
- **Component tests**: `src/**/*.cy.{js,jsx,ts,tsx}`

#### **Mock Data Organization**
- **Handlers**: `src/mocks/handlers/` (por API)
- **Data**: `src/mocks/data/` (mock data estructurada)
- **Test utilities**: `src/test-utils/` (helpers para testing)

---

## 🚀 6. Próximos Pasos

### **Si Todo Funciona Correctamente** ✅
¡Perfecto! Tu environment TDD está listo. Continúa con:
- **[02. Fundamentos de TDD](./02-tdd-fundamentals.md)** - Aprende la metodología Red-Green-Refactor

### **Si Hay Problemas** ⚠️

#### **Vitest no funciona**
```bash
# Revisar dependencies
npm install

# Verificar Node.js version (debe ser 18+)
node --version

# Verificar que el setup file existe
ls test/vitest/setup-file.ts
```

#### **Cypress no funciona**
```bash
# Instalar Cypress binary
npx cypress install

# Verificar que el dev server está corriendo
npm run dev
# Debe estar en http://localhost:8080
```

#### **MSW no funciona**
```bash
# Verificar que el MSW worker está generado
ls public/mockServiceWorker.js

# Regenerar si es necesario
npx msw init public/ --save
```

### **Troubleshooting Común**
- **Port conflicts**: Cambiar puerto en `cypress.config.ts` si 8080 está ocupado
- **TypeScript errors**: Ejecutar `npm run typecheck` para ver errores específicos
- **ESLint errors**: Ejecutar `npm run lint` para ver problemas de código

---

## 📚 Referencias

### **Configuraciones Detalladas**
- [Vitest Configuration Reference](../reference/configurations/vitest-config.md)
- [Cypress Configuration Reference](../reference/configurations/cypress-config.md)
- [MSW Setup Reference](../reference/configurations/msw-setup.md)

### **Testing Patterns**
- [MSW Advanced Mocking Guide](../how-to-guides/testing/msw-advanced-mocking.md)
- [Test Utilities Reference](../reference/testing-patterns/test-utilities.md)

### **Architectural Decisions**
- [Why TDD Methodology](../explanation/architecture-decisions/why-tdd-methodology.md)
- [Testing Tools Choice](../explanation/architecture-decisions/testing-tools-choice.md)

---

**✅ Environment Setup Completado**

Tienes un environment TDD profesional funcionando con:
- **Testing unitario** rápido y confiable (Vitest)
- **Testing E2E y componentes** con excelente DX (Cypress)  
- **API mocking** completo para desarrollo y testing (MSW)
- **Type safety** completo (TypeScript strict)
- **Code quality** automatizada (ESLint + Prettier)

**➡️ Siguiente**: [02. Fundamentos de TDD](./02-tdd-fundamentals.md) - Aprende cómo aplicar metodología TDD en el proyecto