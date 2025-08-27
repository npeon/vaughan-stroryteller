# 🧪 Testing - How-to Guides

> **Soluciones específicas para patterns de testing en el proyecto**

## 📋 Guías Disponibles

### **🎭 [MSW Advanced Mocking](./msw-advanced-mocking.md)** ⭐
**Scenarios avanzados de API mocking con Mock Service Worker**

- ⚡ **Rate limiting** y quota exceeded scenarios
- 🌐 **Network failures** y timeouts  
- 🎯 **Dynamic responses** basados en input parameters
- 📊 **Request tracking** y assertions avanzadas
- 🔧 **Error scenario** testing completo

**⏱️ Tiempo**: 45-60 min | **📋 Prerequisitos**: Environment setup, MSW básico

---

### **⚙️ [TDD Scripts Configuration](./tdd-scripts-setup.md)** ✅
**Configuración completa de scripts para metodología TDD optimizada**

- 🔄 **Watch mode** para ciclo red-green-refactor continuo
- 📊 **Coverage scripts** con thresholds configurables  
- 🚀 **Development TDD** con hot reloading + tests
- 🏗️ **CI/CD optimized** scripts para pipelines
- 🐛 **Debug mode** para breakpoint testing

**⏱️ Tiempo**: 15-20 min | **📋 Prerequisitos**: Environment setup

---

### **📏 Unit Testing Patterns** 🚧
**Patterns específicos de testing unitario implementados en el proyecto**

- Vue 3 Composition API testing patterns
- Quasar component testing strategies
- Composables testing con reactive state
- Service layer testing patterns

**Estado**: Planeado | **⏱️ Tiempo**: 45 min

---

### **🧩 Cypress Quasar Components** 🚧
**Testing de componentes Quasar con Cypress**

- Component testing setup específico
- Quasar UI elements interaction
- Custom commands para componentes comunes
- Visual regression testing

**Estado**: Planeado | **⏱️ Tiempo**: 60 min

## 🎯 Cuándo Usar Cada Guía

### **Si necesitas...**

#### **Configurar flujo TDD optimizado**
→ **[TDD Scripts Configuration](./tdd-scripts-setup.md)**
- Setup inicial de scripts para metodología TDD
- Optimizar tiempo de feedback en desarrollo
- Configurar watch modes y cobertura automática

#### **Mockear APIs externas**
→ **[MSW Advanced Mocking](./msw-advanced-mocking.md)**
- Simular rate limiting de OpenRouter
- Testear quota exceeded de ElevenLabs  
- Manejar network failures gracefully

#### **Testear componentes Vue**
→ **Unit Testing Patterns** (próximamente)
- Testear props y emits
- Testing de composables
- Mocking de dependencies

#### **E2E testing con Quasar**
→ **Cypress Quasar Components** (próximamente)  
- Interactuar con Q-components
- Visual testing
- User flow completo

## 🔗 Referencias Técnicas

### **Configuraciones**
- [Vitest Configuration](../../reference/configurations/vitest-config.md) - Setup unitario
- [Cypress Configuration](../../reference/configurations/cypress-config.md) - Setup E2E
- [MSW Setup](../../reference/configurations/msw-setup.md) - API mocking

### **Testing Patterns**
- [Test Utilities Reference](../../reference/testing-patterns/test-utilities.md) - Helpers implementados
- [Mock Data Structure](../../reference/testing-patterns/mock-data.md) - Data para testing
- [Assertion Patterns](../../reference/testing-patterns/assertion-patterns.md) - Assertion patterns

## 💡 Tips Generales

### **Para Testing Efectivo**
1. **Test one thing**: Cada test debería verificar un solo comportamiento
2. **Descriptive names**: Nombres que explican el escenario exacto
3. **AAA pattern**: Arrange, Act, Assert claramente separados
4. **Mock external dependencies**: Aisla la unidad bajo test

### **Para Debugging Tests**
1. **Use test.only**: Para correr solo el test que estás debugging
2. **Console logging**: En tests, logging es tu amigo  
3. **MSW request logs**: Verifica que los requests se interceptan correctamente
4. **Vitest UI**: Usa la interfaz visual para debugging

---

**🚀 ¿Por dónde empezar?**

Si eres nuevo en testing del proyecto, comienza con **[MSW Advanced Mocking](./msw-advanced-mocking.md)** - es la base para testear todas las integraciones de APIs.

**💡 Tip**: Todos los patterns de testing están implementados y funcionando en el proyecto. Usa las guías para entender cómo replicar estos patterns en tus propias features.