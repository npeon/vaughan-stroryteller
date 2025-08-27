# ⚙️ Vitest Configuration Reference

> **Configuración completa de Vitest para testing unitario con Vue 3 + Quasar + MSW**

## 📋 Overview

Este documento detalla la configuración exacta de Vitest implementada en el proyecto, explicando cada línea y decisión técnica.

**Archivo**: `vitest.config.mts`  
**Versión Vitest**: `^3.1.2`  
**Integración**: Vue 3 + Quasar + TypeScript + MSW

## 🔧 Configuración Completa

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    // Environment de ejecución de tests
    environment: 'happy-dom',
    
    // Archivo que se ejecuta antes de cada test suite
    setupFiles: 'test/vitest/setup-file.ts',
    
    // Patrones de archivos que contienen tests
    include: [
      // Tests en src/ con naming pattern específico
      'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      
      // Tests en carpeta dedicada
      'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
  
  // Plugins de Vite para procesamiento
  plugins: [
    // Plugin de Vue con transformación de assets
    vue({
      template: { transformAssetUrls },
    }),
    
    // Plugin de Quasar con variables Sass
    quasar({
      sassVariables: 'src/quasar-variables.scss',
    }),
    
    // Resolución automática de paths TypeScript
    tsconfigPaths(),
  ],
});
```

---

## 📊 Análisis Línea por Línea

### **Imports y Dependencies**

```typescript
import { defineConfig } from 'vitest/config';
```
- **Purpose**: Define configuración de Vitest con tipos TypeScript completos
- **Alternative**: `import { defineConfig } from 'vite'` - menos específico para testing

```typescript
import vue from '@vitejs/plugin-vue';
```
- **Purpose**: Procesar Single File Components (SFCs) de Vue
- **Version**: Compatible con Vue 3.4.18
- **Features**: Template compilation, script setup support

```typescript
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
```
- **Purpose**: Integración específica con Quasar Framework
- **`quasar`**: Plugin principal de Quasar
- **`transformAssetUrls`**: Transformación de URLs en templates Vue

```typescript
import tsconfigPaths from 'vite-tsconfig-paths';
```
- **Purpose**: Resolución automática de path aliases definidos en `tsconfig.json`
- **Example**: `@/components` → `src/components`

### **Test Configuration**

#### **Environment**
```typescript
environment: 'happy-dom',
```

**¿Qué es happy-dom?**
- **DOM simulation** ligero para Node.js
- **Performance**: ~2-3x más rápido que jsdom
- **Compatibility**: Compatible con la mayoría de APIs de DOM
- **Memory usage**: Menor uso de memoria que jsdom

**Alternatives consideradas**:
- `jsdom`: Más completo pero más lento
- `node`: Sin DOM, solo para logic puro
- `edge-runtime`: Para Edge Functions testing

#### **Setup Files**
```typescript
setupFiles: 'test/vitest/setup-file.ts',
```

**Purpose**: Inicialización antes de cada test suite
**Current content** (`test/vitest/setup-file.ts`):
```typescript
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../../src/mocks/node'

// MSW server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Key features**:
- **MSW auto-start**: MSW server se inicia automáticamente
- **`onUnhandledRequest: 'error'`**: Falla si hay requests no mockeadas
- **`resetHandlers()`**: Limpia mocks después de cada test
- **`server.close()`**: Cleanup al terminar suite

#### **Include Patterns**
```typescript
include: [
  'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
],
```

**Pattern 1**: `src/**/*.vitest.{test,spec}.*`
- **Purpose**: Tests co-located con el código source
- **Naming**: `.vitest.` prefix para diferenciarse de otros tests
- **Example**: `src/components/Button.vitest.test.ts`

**Pattern 2**: `test/vitest/__tests__/**/*.{test,spec}.*`
- **Purpose**: Tests centralizados en carpeta dedicada
- **Current usage**: Tests de infrastructure (MSW verification, etc.)
- **Example**: `test/vitest/__tests__/msw-verification.test.ts`

**Extensions soportadas**:
- `.js`, `.mjs`, `.cjs` - JavaScript variants
- `.ts`, `.mts`, `.cts` - TypeScript variants  
- `.jsx`, `.tsx` - JSX/TSX para component testing

### **Plugins Configuration**

#### **Vue Plugin**
```typescript
vue({
  template: { transformAssetUrls },
}),
```

**`transformAssetUrls`**: Transformación automática de URLs de assets en templates
```vue
<!-- En el template -->
<img src="@/assets/logo.png" alt="Logo" />

<!-- Se transforma a -->
<img src="/src/assets/logo.png" alt="Logo" />
```

**Features habilitadas**:
- **Script setup**: `<script setup>` syntax support
- **Template compilation**: Templates a render functions
- **CSS scoping**: Scoped CSS automático
- **Hot reload**: En development mode

#### **Quasar Plugin**
```typescript
quasar({
  sassVariables: 'src/quasar-variables.scss',
}),
```

**Purpose**: Integración completa con Quasar Framework
- **`sassVariables`**: Variables Sass personalizadas del proyecto
- **Auto-import**: Componentes Quasar disponibles automáticamente
- **Icons**: Material Design icons pre-configurados
- **CSS**: Estilos de Quasar incluidos en tests

**Example en tests**:
```typescript
// No necesitas importar componentes Quasar
import { mount } from '@vue/test-utils'

const wrapper = mount({
  template: '<q-btn label="Test" />' // q-btn disponible automáticamente
})
```

#### **TypeScript Paths**
```typescript
tsconfigPaths(),
```

**Purpose**: Resolución de path aliases definidos en `tsconfig.json`
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@services/*": ["src/services/*"]
    }
  }
}
```

**En tests**:
```typescript
// Funciona automáticamente
import { Button } from '@components/Button.vue'
import { ApiService } from '@services/api'
```

---

## 🧪 Testing Features Habilitadas

### **Vue Component Testing**
```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' }
    })
    expect(wrapper.text()).toContain('Test')
  })
})
```

### **Composables Testing**
```typescript
import { ref } from 'vue'
import { describe, it, expect } from 'vitest'

describe('useCounter', () => {
  it('increments count', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})
```

### **MSW Integration**
```typescript
import { describe, it, expect } from 'vitest'

describe('API Integration', () => {
  it('fetches data with mocked API', async () => {
    // MSW ya está configurado automáticamente
    const response = await fetch('/api/users')
    const data = await response.json()
    expect(data).toHaveProperty('users')
  })
})
```

---

## 📊 Performance Characteristics

### **Speed Comparison**
- **Vitest**: ~300ms para suite completa
- **Jest equivalent**: ~2000ms para misma suite
- **Factor**: ~6-7x más rápido

### **Memory Usage**
- **happy-dom**: ~50MB para suite completa
- **jsdom**: ~120MB para misma suite
- **Reduction**: ~60% menos memoria

### **Features vs Performance**
| Feature | Performance Impact | Justification |
|---------|-------------------|---------------|
| happy-dom | +fast | DOM simulation necesaria para Vue |
| Vue plugin | +medium | SFC compilation necesaria |
| Quasar plugin | +medium | Framework integration necesaria |
| MSW setup | +minimal | Network mocking necesario |
| TypeScript | +minimal | Type safety prioritaria |

---

## 🔧 Customization Options

### **Environment Alternatives**
```typescript
// Para tests sin DOM
environment: 'node',

// Para tests con DOM completo (más lento)
environment: 'jsdom',

// Para Edge Functions testing
environment: 'edge-runtime',
```

### **Setup Files Múltiples**
```typescript
setupFiles: [
  'test/vitest/setup-file.ts',      // MSW setup
  'test/vitest/setup-globals.ts',   // Global variables
  'test/vitest/setup-quasar.ts',    // Quasar specific setup
],
```

### **Include/Exclude Patterns**
```typescript
include: [
  // Patterns actuales
  'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
],
exclude: [
  'src/**/*.e2e.test.ts',  // Excluir E2E tests de unit testing
  'src/**/*.manual.test.ts' // Excluir tests manuales
],
```

---

## ⚠️ Breaking Changes Considerations

### **Al Modificar Environment**
```typescript
// ❌ Si cambias a 'node'
environment: 'node'
// Los component tests fallarán porque no hay DOM
```

### **Al Modificar Setup Files**
```typescript
// ❌ Si quitas setup-file.ts
// setupFiles: [], 
// MSW no funcionará y los API tests fallarán
```

### **Al Modificar Include Patterns**
```typescript
// ❌ Si cambias naming pattern
include: ['src/**/*.test.ts'] // Perdería tests con .vitest. prefix
```

---

## 🔗 Dependencies

### **Direct Dependencies**
- `vitest: ^3.1.2` - Testing framework core
- `@vitejs/plugin-vue: latest` - Vue SFC processing
- `@quasar/vite-plugin: latest` - Quasar integration
- `vite-tsconfig-paths: latest` - TypeScript path resolution

### **Peer Dependencies**
- `vue: ^3.4.18` - Vue framework
- `typescript: ~5.5.3` - TypeScript compiler
- `happy-dom: latest` - DOM simulation (auto-installed)

### **Test Dependencies**
- `@vue/test-utils: ^2.4.6` - Vue component testing utilities
- `msw: ^2.10.5` - API mocking (via setup files)

---

## 📈 Métricas Actuales

### **Tests Ejecutándose**
```bash
npm run test:unit:ci
```
- **Total tests**: 25+ tests
- **Test files**: 4 archivos
- **Execution time**: ~800ms
- **Coverage**: Disponible con --coverage

### **Commands Disponibles**
```bash
# Development (watch mode)
npm run test:unit

# UI Mode (interfaz visual)
npm run test:unit:ui

# CI Mode (single run)  
npm run test:unit:ci
```

---

## 🚀 Future Enhancements

### **Coverage Configuration**
```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: ['test/**', 'src/mocks/**']
  }
}
```

### **Parallel Testing**
```typescript
test: {
  pool: 'forks',      // Parallel execution
  maxThreads: 4,      // Max parallel tests
  minThreads: 2,      // Min parallel tests
}
```

### **Reporter Options**
```typescript
test: {
  reporter: ['verbose', 'json', 'html'],
  outputFile: 'test-results.json'
}
```

---

**🔗 Referencias Relacionadas**:
- [MSW Setup Reference](./msw-setup.md) - Configuración de API mocking
- [Test Utilities Reference](../testing-patterns/test-utilities.md) - Helpers de testing
- [Getting Started - Environment Setup](../../getting-started/01-environment-setup.md) - Tutorial setup

**💡 Tip**: Esta configuración está optimizada para el balance entre performance, features, y developer experience. Modifica con cuidado para no romper el ecosystem de testing.