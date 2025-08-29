# 🔧 How-to Guides

> **Soluciones prácticas a problemas específicos del desarrollo con TDD**

## 🎯 Sobre los How-to Guides

Los How-to Guides te ayudan a resolver problemas específicos que aparecen durante el desarrollo del proyecto. Cada guía es una solución paso a paso, probada y funcionando en el proyecto real.

**Diferencia con Tutorials**: Los tutorials te enseñan, los how-to guides te resuelven problemas específicos.

## 📂 Organización por Categorías

### **🔐 [Authentication](./authentication/)**
Solución a problemas críticos de autenticación y seguridad

```
authentication/
├── 🔥 rls-recursion-fix.md              # CRITICAL: RLS infinite recursion fix
└── 🛠️ authentication-troubleshooting.md # General auth troubleshooting
```

**Cuándo usar**: Cuando el login falla, hay errores de RLS, o problemas de redirección

---

### **🧪 [Testing](./testing/)**
Patrones y técnicas específicas de testing en el proyecto

```
testing/
├── 📖 unit-testing-patterns.md         # Patterns específicos del proyecto  
├── 🎭 msw-advanced-mocking.md          # Scenarios avanzados con MSW
└── 🧩 cypress-quasar-components.md     # Testing componentes Quasar específicos
```

**Cuándo usar**: Cuando necesitas implementar un patrón de testing específico o resolver un problema de testing

---

### **🌐 [APIs](./apis/)**
Integración práctica con APIs externas del proyecto

```
apis/
├── 🤖 openrouter-integration.md        # IA: Claude 3.5, GPT-4, Llama 3.1
├── 🎙️ elevenlabs-tts.md               # Text-to-speech con voces naturales  
└── 📚 wordsapi-vocabulary.md           # Diccionario y vocabulario
```

**Cuándo usar**: Cuando necesitas integrar una API específica o resolver problemas de integración

---

### **🛠️ [Development](./development/)**
Herramientas y procesos de desarrollo del proyecto

```
development/
├── 🛠️ storage-services-usage.md       # Patrones de storage (avatares, TTS, banners)
└── 🖼️ image-persistence-integration.md # Sistema de persistencia de imágenes IA
```

**Cuándo usar**: Cuando implementas storage, uploads de archivos, o persistencia de contenido generado por IA

## 🎯 Cómo Usar los How-to Guides

### **1. Identifica tu Problema**
- 🚨 ¿Login falla o errores de RLS? → **Authentication**
- ¿Necesitas implementar algo específico? → **APIs**
- ¿Tu test falla o se comporta raro? → **Testing** 
- ¿Problema de performance o CI/CD? → **Development**

### **2. Sigue la Guía Paso a Paso**
Cada guía incluye:
- ✅ **Prerequisitos**: Qué necesitas antes de empezar
- 🎯 **Resultado esperado**: Qué conseguirás al completarla
- 📝 **Pasos detallados**: Instrucciones exactas
- 🧪 **Testing**: Cómo validar que funciona
- ⚠️ **Troubleshooting**: Problemas comunes y soluciones

### **3. Adapta a tu Caso**
Las guías están basadas en el proyecto real, pero incluyen variaciones para diferentes casos de uso.

## 🔥 Guías Más Populares

### **🚨 Para Authentication (CRÍTICO)**
1. **[RLS Recursion Fix](./authentication/rls-recursion-fix.md)** - ⚠️ CRITICAL: "infinite recursion detected in policy"
2. **[Authentication Troubleshooting](./authentication/authentication-troubleshooting.md)** - Login issues, redirect loops

### **Para Testing**
1. **[MSW Advanced Mocking](./testing/msw-advanced-mocking.md)** - Rate limiting, errores, timeouts
2. **[Unit Testing Patterns](./testing/unit-testing-patterns.md)** - Patterns extraídos del proyecto
3. **[Cypress Quasar Components](./testing/cypress-quasar-components.md)** - Testing componentes específicos

### **Para APIs**
1. **[OpenRouter Integration](./apis/openrouter-integration.md)** - IA para generación de historias
2. **[ElevenLabs TTS](./apis/elevenlabs-tts.md)** - Narración de historias
3. **[WordsAPI Vocabulary](./apis/wordsapi-vocabulary.md)** - Gestión de vocabulario

### **Para Development**
1. **[Storage Services Usage](./development/storage-services-usage.md)** - Patrones de storage (avatares, TTS, banners)
2. **[Image Persistence Integration](./development/image-persistence-integration.md)** - Sistema de persistencia para IA

## 🎨 Templates de How-to Guide

### **Template Básico**
```markdown
# Como Hacer [X]

## 🎯 Objetivo
[Descripción clara del resultado]

## ✅ Prerequisitos
- [ ] Prerequisito 1
- [ ] Prerequisito 2

## 📝 Pasos
### 1. Paso uno
[Instrucción detallada]

### 2. Paso dos
[Código de ejemplo]

## 🧪 Testing
[Como validar que funciona]

## ⚠️ Troubleshooting
[Problemas comunes]
```

## 🔗 Enlaces de Referencia

### **Para Testing Profundo**
- [Test Utilities Reference](../reference/testing-patterns/test-utilities.md)
- [MSW Configuration](../reference/configurations/msw-setup.md)
- [Vitest Configuration](../reference/configurations/vitest-config.md)

### **Para APIs Detalladas**
- [OpenRouter API Reference](../reference/apis/openrouter-reference.md)
- [ElevenLabs API Reference](../reference/apis/elevenlabs-reference.md)
- [WordsAPI Reference](../reference/apis/wordsapi-reference.md)

### **Para Conceptos**
- [TDD Methodology](../explanation/architecture-decisions/why-tdd-methodology.md)
- [API Selection Rationale](../explanation/architecture-decisions/api-selection-rationale.md)
- [Testing Tools Choice](../explanation/architecture-decisions/testing-tools-choice.md)

## 💡 Contribuir con How-to Guides

¿Resolviste un problema que no está documentado? ¡Agrega tu propio how-to guide!

### **Guidelines para Contribuir**
1. **Problema específico**: Debe resolver un problema concreto
2. **Paso a paso**: Instrucciones claras y probadas
3. **Code examples**: Código real del proyecto
4. **Tested solution**: Solución funcionando y verificada

### **Template para Nuevas Guías**
- Usa el template básico de arriba
- Incluye tiempo estimado
- Agrega troubleshooting section
- Cross-reference con documentación existente

---

**🚀 ¿Tienes un problema específico?**

Busca en las categorías de arriba o usa la función de búsqueda para encontrar la solución específica que necesitas.

**💡 Tip**: Los how-to guides son complementarios a los [tutorials](../getting-started/) (para aprender) y la [reference](../reference/) (para consultar detalles técnicos).