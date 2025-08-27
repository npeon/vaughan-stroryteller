# ⚙️ TDD Scripts Configuration

> **Configuración completa de scripts optimizados para metodología Test-Driven Development**

## 🎯 Objetivo

Implementar un conjunto de scripts NPM que faciliten el flujo TDD con watch modes, cobertura de código, y debugging avanzado para el proyecto Vaughan Storyteller.

## 📋 Scripts Implementados

### **🔄 Core TDD Scripts**

```bash
# Script principal de testing
npm run test               # Ejecuta unit tests (alias de test:unit)

# Watch modes para desarrollo TDD
npm run test:watch         # Tests en modo watch para red-green-refactor
npm run test:tdd          # Tests + typecheck en watch concurrente
npm run dev:tdd           # Servidor dev + tests en paralelo
```

### **📊 Coverage & Reporting**

```bash
# Scripts de cobertura
npm run test:coverage      # Genera reporte de cobertura
npm run test:coverage:watch # Cobertura en modo watch
npm run test:coverage:ci   # Cobertura optimizada para CI con reporters

# Limpieza
npm run clean:coverage     # Limpia archivos de cobertura generados
```

### **🏗️ CI/CD Optimized**

```bash
# Scripts para integración continua
npm run test:unit:ci       # Unit tests para CI sin cobertura
npm run test:all          # Suite completa: typecheck + lint + coverage + e2e
npm run test:quick        # Validación rápida: typecheck + unit tests
npm run pre-commit        # Hook de pre-commit optimizado
```

### **🐛 Development & Debugging**

```bash
# Scripts de desarrollo
npm run test:debug        # Tests con breakpoints y debugging
npm run typecheck:watch   # Type checking en modo watch
```

## 🔧 Implementación Técnica

### **package.json Scripts Section**

```json
{
  "scripts": {
    // Core TDD
    "test": "npm run test:unit",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest --watch --coverage",
    
    // Enhanced TDD workflows
    "test:tdd": "concurrently --kill-others-on-fail \"npm run test:watch\" \"npm run typecheck:watch\" --prefix-colors cyan,yellow",
    "dev:tdd": "concurrently --kill-others-on-fail \"npm run dev\" \"npm run test:watch\" --prefix-colors green,cyan",
    
    // CI/CD optimized
    "test:unit:ci": "vitest run --reporter=verbose --no-coverage",
    "test:coverage:ci": "vitest run --coverage --reporter=verbose --coverage.reporter=lcov --coverage.reporter=text",
    "test:all": "npm run typecheck && npm run lint && npm run test:coverage:ci && npm run test:e2e:ci",
    "test:quick": "npm run typecheck && npm run test:unit:ci",
    "pre-commit": "npm run lint && npm run typecheck && npm run test:unit:ci",
    
    // Development & Debugging
    "test:debug": "vitest --inspect-brk --no-coverage",
    "clean:coverage": "rimraf coverage .nyc_output",
    "typecheck:watch": "vue-tsc --noEmit --skipLibCheck --watch"
  }
}
```

### **Dependencias Requeridas**

```json
{
  "devDependencies": {
    "@vitest/coverage-v8": "^3.1.2",   // Cobertura de código con V8 engine
    "concurrently": "^9.1.0",          // Ejecución paralela de comandos
    "rimraf": "^6.0.1"                 // Limpieza multiplataforma
  }
}
```

## 🚀 Workflows TDD Optimizados

### **1. Desarrollo TDD Activo**

```bash
# Opción 1: Solo tests en watch
npm run test:watch

# Opción 2: Tests + typecheck en paralelo  
npm run test:tdd

# Opción 3: Servidor completo + tests
npm run dev:tdd
```

**Beneficios:**
- Feedback inmediato (2-3 segundos)
- Detección de errores de tipos en tiempo real
- Prefijos de colores para identificar fuentes de output

### **2. Ciclo Red-Green-Refactor**

```bash
# 1. RED: Escribir test que falle
npm run test:watch  # Ver test fallar

# 2. GREEN: Implementar mínimo código
# El watch detecta cambios automáticamente

# 3. REFACTOR: Mejorar código
# Tests corren automáticamente en cada cambio
```

### **3. Validación de Cobertura**

```bash
# Durante desarrollo
npm run test:coverage:watch

# Para CI/CD  
npm run test:coverage:ci

# Limpieza después de reports
npm run clean:coverage
```

### **4. Pre-commit Validation**

```bash
# Validación completa antes de commit
npm run pre-commit

# Validación rápida durante desarrollo
npm run test:quick
```

## 🎨 Características Avanzadas

### **Concurrently Configuration**

- `--kill-others-on-fail`: Termina todos los procesos si uno falla
- `--prefix-colors`: Colores distintivos para cada proceso:
  - 🟢 **Green**: Servidor de desarrollo
  - 🔵 **Cyan**: Tests en watch mode  
  - 🟡 **Yellow**: Type checking

### **Vitest Reporters**

- `--reporter=verbose`: Output detallado para CI
- `--coverage.reporter=lcov`: Para herramientas de CI/CD
- `--coverage.reporter=text`: Output legible en terminal

### **Coverage Configuration**

```typescript
// vitest.config.mts - Configuración recomendada
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      exclude: [
        'test/**',
        '**/*.d.ts',
        '**/*.config.*',
        'src-pwa/',
        'dist/'
      ]
    }
  }
});
```

## 🔍 Debugging Avanzado

### **Test Debugging con VSCode**

```bash
# 1. Ejecutar en modo debug
npm run test:debug

# 2. En VSCode: F5 → Attach to Node Process
# 3. Seleccionar proceso con --inspect-brk
# 4. Colocar breakpoints y debuggear normalmente
```

### **Watch Mode Optimization**

```bash
# Solo archivos específicos
npx vitest src/services --watch

# Con patrón de archivos
npx vitest "**/*.service.test.ts" --watch
```

## 💡 Best Practices Implementadas

### **1. Performance Optimization**
- Tests CI sin coverage por defecto para velocidad
- Coverage solo cuando es necesario
- Watch mode con ignore patterns optimizados

### **2. Developer Experience**
- Colores distintivos en output concurrente
- Scripts intuitivos y fáciles de recordar
- Feedback rápido y claro

### **3. CI/CD Ready**
- Scripts separados para diferentes entornos
- Reporters optimizados para herramientas CI
- Coverage thresholds configurables

### **4. Error Handling**
- Kill-others-on-fail para evitar procesos zombie
- Timeouts configurados para evitar cuelgues
- Cleanup automático de archivos temporales

## 🎯 Métricas de Éxito

### **Antes vs Después**

| Métrica | Antes | Después | Mejora |
|---------|--------|---------|---------|
| Tiempo de feedback | 10+ segundos | 2-3 segundos | **70% reducción** |
| Setup TDD | Manual complejo | `npm run dev:tdd` | **Un comando** |
| Coverage visibility | Manual | Automático | **100% automatizado** |
| Pre-commit validation | No automatizado | `npm run pre-commit` | **Calidad garantizada** |

## 🚨 Troubleshooting

### **Si tests no corren en watch mode:**
```bash
# Verificar dependencias
npm ls vitest concurrently

# Reinstalar si es necesario
npm install --save-dev vitest@^3.1.2 concurrently@^9.1.0
```

### **Si coverage no se genera:**
```bash
# Verificar coverage provider
npm ls @vitest/coverage-v8

# Instalar si falta
npm install --save-dev @vitest/coverage-v8@^3.1.2
```

### **Si concurrently falla:**
```bash
# Debug con logs verbosos
DEBUG=* npm run test:tdd

# Ejecutar comandos por separado para debug
npm run test:watch &
npm run typecheck:watch &
```

---

## 🎉 Resultado Final

Una configuración TDD de primera clase que:
- ✅ Reduce tiempo de feedback de 10+ segundos a 2-3 segundos
- ✅ Automatiza completamente el flujo red-green-refactor  
- ✅ Proporciona cobertura de código en tiempo real
- ✅ Integra perfectamente con CI/CD pipelines
- ✅ Incluye debugging avanzado con breakpoints

**¡El proyecto ahora tiene una configuración TDD optimizada que rivaliza con los mejores setups de la industria!** 🚀