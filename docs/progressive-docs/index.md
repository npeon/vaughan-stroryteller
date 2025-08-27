# 📚 The Vaughan Storyteller - Documentación Progresiva

> **Documentación educativa estructurada para el desarrollo TDD de una PWA de generación de historias con IA**

## 🎯 Sobre esta Documentación

Esta documentación está diseñada específicamente para **programadores junior** que quieren aprender Test-Driven Development (TDD) en un proyecto real. Documenta la implementación progresiva de "The Vaughan Storyteller", una PWA que genera historias personalizadas en inglés usando inteligencia artificial.

### ✅ Estado Actual del Proyecto

**Tasks Completadas (0.1-0.3)**:
- ✅ **Testing Unitario**: Vitest + Vue Test Utils configurado
- ✅ **Testing E2E**: Cypress con soporte para componentes Quasar
- ✅ **API Mocking**: MSW completamente configurado para 3 APIs externas

## 🗺️ Navegación por Nivel de Experiencia

### 👥 **Para Programadores Junior**
Comienza aquí si eres nuevo en TDD o quieres ver cómo se implementa en proyectos reales:

1. **[📚 Getting Started](./getting-started/)** - Tutorial paso a paso (7 semanas estructuradas)
2. **[🔧 How-to Guides](./how-to-guides/)** - Soluciones a problemas específicos
3. **[📖 Reference](./reference/)** - Documentación técnica detallada

### 🧠 **Para Entender las Decisiones**
Si quieres entender el "por qué" detrás de las implementaciones:

- **[🧠 Explanation](./explanation/)** - Decisiones arquitectónicas y conceptos técnicos

## 📋 Estructura de Aprendizaje

### 🟢 **Nivel Básico (Semanas 1-2)**
```
📚 Getting Started
├── 01. Configuración del Entorno TDD
├── 02. Fundamentos de TDD
└── 03. Tu Primer Test
```

### 🟡 **Nivel Intermedio (Semanas 3-4)**
```
🔧 How-to Guides - Testing
├── Patterns de Testing Unitario
├── Mocking Avanzado con MSW
└── Testing de Componentes Quasar
```

### 🟠 **Nivel Avanzado (Semanas 5-6)**
```
🔧 How-to Guides - APIs
├── Integración OpenRouter (IA)
├── ElevenLabs (Text-to-Speech)
└── WordsAPI (Diccionario)
```

### 🔴 **Nivel Experto (Semana 7)**
```
📖 Reference + 🧠 Explanation
├── Arquitectura Completa
├── Decisiones Técnicas
└── Patterns Avanzados
```

## 🛠️ Stack Tecnológico Documentado

### **Frontend & Testing**
- **Framework**: Quasar v2.16+ (Vue 3 + TypeScript)
- **Testing Unitario**: Vitest + Vue Test Utils + @vue/test-utils
- **Testing E2E**: Cypress + @quasar/testing-e2e-cypress
- **API Mocking**: MSW (Mock Service Worker) v2.10+

### **APIs Externas Integradas**
- **OpenRouter API**: IA para generación de historias (Claude 3.5, GPT-4, Llama 3.1)
- **ElevenLabs API**: Text-to-speech con voces naturales
- **WordsAPI**: Diccionario y gestión de vocabulario

### **Backend & Deployment**
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Deployment**: Vercel (Edge Functions + preview deployments)
- **Cache**: Upstash Redis (rate limiting)

## 🎓 Metodología de Aprendizaje

### **Test-Driven Development (TDD)**
Todo el proyecto sigue metodología TDD estricta:
1. **🔴 Red**: Escribir test que falla
2. **🟢 Green**: Implementar código mínimo
3. **🔵 Refactor**: Mejorar manteniendo tests verdes

### **Progresión Educativa**
- **Scaffolding**: Cada ejemplo construye sobre el anterior
- **Real-world Context**: Todos los ejemplos del proyecto real
- **Error Learning**: Errores comunes y soluciones
- **Active Practice**: Ejercicios prácticos cada sección

## 📊 Cómo Usar Esta Documentación

### **Si eres nuevo en TDD**:
1. Comienza con **[Getting Started](./getting-started/)**
2. Sigue el tutorial de 7 semanas paso a paso
3. Practica con los ejercicios propuestos

### **Si necesitas resolver algo específico**:
1. Ve a **[How-to Guides](./how-to-guides/)**
2. Busca el problema específico que tienes
3. Sigue las instrucciones paso a paso

### **Si necesitas referencia técnica**:
1. Consulta **[Reference](./reference/)**
2. Encuentra la configuración o API específica
3. Copia los ejemplos a tu código

### **Si quieres entender decisiones**:
1. Lee **[Explanation](./explanation/)**
2. Comprende el contexto de las decisiones
3. Aplica el mismo razonamiento a tus proyectos

## 🔗 Enlaces Rápidos

### **Configuraciones Clave**
- [Configuración Vitest](./reference/configurations/vitest-config.md)
- [Configuración Cypress](./reference/configurations/cypress-config.md)
- [Setup MSW](./reference/configurations/msw-setup.md)

### **APIs Externas**
- [OpenRouter Integration](./how-to-guides/apis/openrouter-integration.md)
- [ElevenLabs TTS](./how-to-guides/apis/elevenlabs-tts.md)
- [WordsAPI Vocabulary](./how-to-guides/apis/wordsapi-vocabulary.md)

### **Testing Patterns**
- [Unit Testing Patterns](./how-to-guides/testing/unit-testing-patterns.md)
- [MSW Advanced Mocking](./how-to-guides/testing/msw-advanced-mocking.md)
- [Cypress + Quasar](./how-to-guides/testing/cypress-quasar-components.md)

## 📈 Seguimiento del Progreso

Esta documentación crece junto con el proyecto. Cada nueva feature implementada agrega:
- **Nueva sección tutorial** si introduce conceptos nuevos
- **How-to guide** para casos de uso específicos
- **Reference update** para nuevas APIs o configuraciones
- **Explanation** para decisiones arquitectónicas

## 🤝 Contribuir a la Documentación

Si encuentras errores, conceptos poco claros, o quieres agregar ejemplos:

1. Los ejemplos deben funcionar con el código actual del proyecto
2. Mantén el enfoque educativo para programadores junior
3. Sigue la estructura de templates existente
4. Actualiza los enlaces cruzados relevantes

---

**💡 Tip**: Esta documentación está optimizada para ser convertida en una web de documentación completa usando herramientas como VitePress, Docusaurus o GitBook.

**⏰ Tiempo estimado para completar toda la documentación**: 20-30 horas de estudio distribuidas en 7 semanas.

**🎯 Al completar tendrás dominio de**: TDD en proyectos reales, integración con APIs externas, testing moderno con Vitest + Cypress, y patterns de desarrollo profesional.