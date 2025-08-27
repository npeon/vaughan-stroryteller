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

### **🎯 [Cypress Custom Commands](./cypress-custom-commands.md)** ✅
**Comandos custom específicos para testing de componentes Quasar y dominio educativo**

- 🏗️ **64+ comandos custom** organizados por dominio funcional
- 📖 **Story system** - generación, lectura, progreso tracking
- 🔐 **Authentication** - login, roles, perfil CEFR
- 📚 **Vocabulary** - WordsAPI, spaced repetition, flashcards
- 🔊 **Audio/TTS** - ElevenLabs integration, controles avanzados
- 🛡️ **Admin panel** - banners, límites, API health monitoring
- 📱 **PWA/Offline** - instalación, sync, service worker
- ⚡ **Enhanced Quasar** - componentes optimizados con TypeScript

**⏱️ Tiempo**: 30-45 min | **📋 Prerequisitos**: Environment setup, Cypress básico

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
→ **[Cypress Custom Commands](./cypress-custom-commands.md)**  
- Comandos específicos para componentes Quasar
- Testing de flows educativos completos
- Integración con APIs externas (OpenRouter, ElevenLabs)
- PWA y funcionalidad offline

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

**Para nuevos desarrolladores:**
1. **[TDD Scripts Configuration](./tdd-scripts-setup.md)** - Configura tu flujo de desarrollo
2. **[MSW Advanced Mocking](./msw-advanced-mocking.md)** - Aprende a mockear APIs externas  
3. **[Cypress Custom Commands](./cypress-custom-commands.md)** - Domina los comandos E2E específicos

**💡 Tip**: Todos los patterns y comandos están implementados y funcionando. Usa las guías para entender cómo aplicar estos patterns en tus propias features y maximizar la eficiencia de testing.