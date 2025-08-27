# 📖 Reference - Documentación Técnica

> **Documentación técnica detallada de configuraciones, APIs y patrones implementados**

## 🎯 Sobre la Reference

La documentación Reference contiene información técnica detallada, configuraciones exactas, especificaciones de APIs y patrones de código implementados en el proyecto. Es tu fuente de verdad para detalles específicos.

**Diferencia con Guides**: Los guides te enseñan cómo hacer algo, la reference te dice exactamente qué está implementado y cómo funciona.

## 📂 Organización por Categorías

### **⚙️ [Configurations](./configurations/)**
Configuraciones exactas de herramientas de desarrollo

```
configurations/
├── 🧪 vitest-config.md                # vitest.config.mts línea por línea
├── 🔍 cypress-config.md              # cypress.config.ts + custom commands  
└── 🎭 msw-setup.md                   # MSW browser/node configuration
```

**Cuándo consultar**: Cuando necesitas entender o modificar configuraciones específicas

---

### **🌐 [APIs](./apis/)**
Especificaciones completas de APIs externas integradas

```
apis/
├── 🤖 openrouter-reference.md        # API completa + tipos TypeScript
├── 🎙️ elevenlabs-reference.md       # Endpoints + voice management
└── 📚 wordsapi-reference.md          # Endpoints + data structures  
```

**Cuándo consultar**: Cuando necesitas detalles específicos de endpoints, parámetros o responses

---

### **🧪 [Testing Patterns](./testing-patterns/)**
Patrones de testing implementados y utilities del proyecto

```
testing-patterns/
├── 🛠️ test-utilities.md             # src/test-utils/msw.ts explained
├── 📊 mock-data.md                   # src/mocks/data/ structure
└── ✅ assertion-patterns.md          # Common testing assertions
```

**Cuándo consultar**: Cuando necesitas reutilizar patterns de testing o entender utilities

---

### **🏗️ [Project Structure](./project-structure/)**
Arquitectura y organización del proyecto

```
project-structure/
├── 📁 directory-layout.md            # Estructura completa explicada
├── 🏷️ typescript-types.md           # src/types/ documentation  
└── 🎨 quasar-integration.md          # Quasar-specific patterns
```

**Cuándo consultar**: Cuando necesitas entender la organización del código o agregar nuevos archivos

## 🎯 Cómo Usar la Reference

### **1. Búsqueda por Necesidad**
- **¿Configuración específica?** → **Configurations**
- **¿Detalles de API?** → **APIs**
- **¿Pattern de testing?** → **Testing Patterns**
- **¿Estructura del proyecto?** → **Project Structure**

### **2. Navegación Técnica**
Cada reference incluye:
- 🔧 **Configuración actual**: Estado exacto implementado
- 📝 **Código completo**: Con comentarios explicativos
- 🎯 **Purpose**: Por qué está configurado así
- 🔗 **Dependencies**: Qué otras partes dependen de esto
- ⚠️ **Breaking changes**: Qué puede romper si lo modificas

### **3. Copy-Paste Ready**
Todo el código en Reference está listo para copiar y usar directamente en el proyecto.

## 📊 Estado de Documentación

### **✅ Completamente Documentado**
- **[Vitest Configuration](./configurations/vitest-config.md)** - vitest.config.mts completo
- **[Cypress Configuration](./configurations/cypress-config.md)** - cypress.config.ts + commands
- **[MSW Setup](./configurations/msw-setup.md)** - Configuración browser/node completa

### **🚧 En Desarrollo**
- **OpenRouter API Reference** - Endpoints y tipos TypeScript
- **ElevenLabs API Reference** - Voice management y TTS
- **WordsAPI Reference** - Dictionary endpoints completos

### **📋 Planeado**
- **Test Utilities Reference** - src/test-utils/msw.ts explicado
- **Mock Data Structure** - src/mocks/data/ completo
- **TypeScript Types** - src/types/ documentation

## 🔍 Referencias Técnicas Clave

### **Configuraciones Core**
- **[vitest.config.mts](./configurations/vitest-config.md)** - Testing unitario configuration
- **[cypress.config.ts](./configurations/cypress-config.md)** - E2E + Component testing
- **[MSW setup](./configurations/msw-setup.md)** - API mocking configuration

### **APIs Externas Integradas**
- **[OpenRouter API](./apis/openrouter-reference.md)** - IA models: Claude 3.5, GPT-4, Llama 3.1
- **[ElevenLabs API](./apis/elevenlabs-reference.md)** - Text-to-speech con voces naturales
- **[WordsAPI](./apis/wordsapi-reference.md)** - Dictionary y vocabulary management

### **Testing Infrastructure**
- **[Test Utilities](./testing-patterns/test-utilities.md)** - MSW helpers y assertions
- **[Mock Data](./testing-patterns/mock-data.md)** - Data structures para testing
- **[Assertion Patterns](./testing-patterns/assertion-patterns.md)** - Common testing patterns

### **Project Architecture**
- **[Directory Layout](./project-structure/directory-layout.md)** - Organización completa
- **[TypeScript Types](./project-structure/typescript-types.md)** - Type definitions
- **[Quasar Integration](./project-structure/quasar-integration.md)** - Framework-specific patterns

## 🎨 Formato de Reference Documentation

### **Template Estándar**
```markdown
# [Component/Tool Name] Reference

## Overview
[Descripción técnica breve]

## Configuration
[Configuración actual completa]

## API/Interface
[Métodos, props, o endpoints disponibles]

## Examples
[Ejemplos de uso directo del proyecto]

## Dependencies
[Qué depende de esto]

## Breaking Changes
[Cuidados al modificar]
```

### **Código Documentado**
Todo código incluye:
- **Inline comments**: Explicando líneas específicas
- **Block comments**: Explicando secciones
- **JSDoc/TSDoc**: Para APIs y interfaces
- **Type annotations**: TypeScript completo

## 🔗 Cross-References

### **Desde Reference a Guides**
- Cada reference incluye enlaces a how-to guides relacionados
- Enlaces a tutorials que usan esa referencia
- Connections con architectural decisions

### **Desde Reference a Examples**
- Todo reference incluye examples del proyecto real
- Links a tests que validan esa configuración
- Conexiones con implementation patterns

## 💻 Herramientas de Búsqueda

### **Por Tecnología**
- **Vitest**: [vitest-config.md](./configurations/vitest-config.md), [test-utilities.md](./testing-patterns/test-utilities.md)
- **Cypress**: [cypress-config.md](./configurations/cypress-config.md), [assertion-patterns.md](./testing-patterns/assertion-patterns.md)
- **MSW**: [msw-setup.md](./configurations/msw-setup.md), [mock-data.md](./testing-patterns/mock-data.md)
- **TypeScript**: [typescript-types.md](./project-structure/typescript-types.md)
- **Quasar**: [quasar-integration.md](./project-structure/quasar-integration.md)

### **Por API**
- **OpenRouter**: [openrouter-reference.md](./apis/openrouter-reference.md)
- **ElevenLabs**: [elevenlabs-reference.md](./apis/elevenlabs-reference.md)  
- **WordsAPI**: [wordsapi-reference.md](./apis/wordsapi-reference.md)

## 📈 Mantener Reference Updated

### **Workflow de Actualización**
1. **Code change** → Update corresponding reference
2. **New API integration** → Add new API reference  
3. **Configuration change** → Update configuration reference
4. **New pattern** → Document in testing-patterns

### **Validation Process**
- **Code examples tested**: Todos los ejemplos funcionan
- **Links validated**: No broken links
- **Dependencies checked**: Referencias cruzadas correctas
- **Version tracking**: Cambios documentados

---

**🔍 ¿Buscas algo específico?**

Usa las categorías de arriba o busca por tecnología/API específica.

**💡 Tip**: La Reference es complementaria a [Getting Started](../getting-started/) (para aprender) y [How-to Guides](../how-to-guides/) (para resolver problemas específicos).