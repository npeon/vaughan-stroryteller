# 🌐 APIs - How-to Guides

> **Integración práctica con las APIs externas del proyecto**

## 📋 Guías Disponibles

### **🤖 [OpenRouter Integration](./openrouter-integration.md)** ⭐
**IA para generación de historias personalizadas**

- 🧠 **Multiple AI models**: Claude 3.5, GPT-4, Llama 3.1
- 📚 **CEFR adaptation**: Historias para niveles A1-C2
- 🔄 **Fallback system**: Redundancia automática entre modelos
- ⚡ **Rate limiting**: Manejo robusto de límites de API
- 🧪 **Comprehensive testing**: Unit, integration, y E2E tests

**⏱️ Tiempo**: 60-75 min | **📋 Prerequisitos**: Environment setup, MSW advanced

---

### **🎙️ ElevenLabs TTS** 🚧
**Text-to-speech para narración de historias**

- 🎤 **Multiple voices**: Rachel, Domi, Bella, y más
- ⚙️ **Voice customization**: Stability, similarity boost, style
- 📊 **Usage tracking**: Character count, duration, quota monitoring
- 🔊 **Audio management**: Download, stream, cache strategies

**Estado**: Planeado | **⏱️ Tiempo**: 50 min

---

### **📚 WordsAPI Vocabulary** 🚧
**Diccionario y gestión de vocabulario**

- 📖 **Word lookup**: Definitions, pronunciation, examples
- 🔗 **Synonyms & antonyms**: Vocabulary expansion
- 📊 **Difficulty assessment**: CEFR level mapping
- 💾 **Vocabulary tracking**: User progress y spaced repetition

**Estado**: Planeado | **⏱️ Tiempo**: 45 min

## 🎯 ¿Cuál API Necesitas?

### **Para Contenido Generado**
→ **[OpenRouter Integration](./openrouter-integration.md)**
- Generar historias personalizadas con IA
- Adaptar contenido a nivel CEFR específico
- Implementar retry logic y fallbacks
- Testear diferentes modelos de IA

### **Para Audio y Narración**
→ **ElevenLabs TTS** (próximamente)
- Convertir texto a speech natural
- Gestionar diferentes voces y estilos
- Optimizar para streaming y caching
- Manejar quotas y rate limiting

### **Para Vocabulario y Diccionario**
→ **WordsAPI Vocabulary** (próximamente)
- Lookup de palabras y definiciones  
- Análisis de dificultad de vocabulario
- Tracking de progreso del usuario
- Spaced repetition para memorización

## 📊 Características por API

| API | Propósito | Modelos/Opciones | Rate Limits | Costo |
|-----|-----------|------------------|-------------|--------|
| **OpenRouter** | IA story generation | Claude 3.5, GPT-4, Llama 3.1 | Flexible por modelo | Variable |
| **ElevenLabs** | Text-to-speech | 10+ voces naturales | 10k chars/month free | $0.18/1k chars |
| **WordsAPI** | Dictionary lookup | 1 comprehensive DB | 10k requests/month | $10/month |

## 🛠️ Patterns de Integración

### **Service Layer Architecture**
Cada API tiene su propio service con:
```typescript
- Service class (business logic)
- Error handling (custom error types)  
- Rate limiting (exponential backoff)
- Composable (Vue integration)
- Comprehensive testing (unit + integration)
```

### **Error Handling Strategy**
```typescript
- Custom error classes por API
- Graceful degradation
- User-friendly error messages
- Retry logic con exponential backoff
- Fallback mechanisms
```

### **Testing Approach**
```typescript
- MSW mocking para development
- Unit tests para service logic
- Integration tests con real APIs (optional)
- E2E tests para user flows
- Error scenario comprehensive testing
```

## 🔗 Referencias Técnicas

### **API References**
- [OpenRouter API Reference](../../reference/apis/openrouter-reference.md) - Endpoints completos y tipos
- [ElevenLabs API Reference](../../reference/apis/elevenlabs-reference.md) - TTS API documentation
- [WordsAPI Reference](../../reference/apis/wordsapi-reference.md) - Dictionary API specs

### **Testing Support**
- [MSW Setup](../../reference/configurations/msw-setup.md) - API mocking configuration
- [MSW Advanced Mocking](../testing/msw-advanced-mocking.md) - Error scenarios y edge cases
- [Test Utilities](../../reference/testing-patterns/test-utilities.md) - Testing helpers

### **Architecture Decisions**
- [API Selection Rationale](../../explanation/architecture-decisions/api-selection-rationale.md) - Por qué estas APIs
- [API Integration Patterns](../../explanation/technical-deep-dive/api-integration-patterns.md) - Patterns implementados

## 💡 Best Practices

### **Para Todas las APIs**
1. **Always mock en desarrollo**: Usa MSW para development consistency
2. **Implement retry logic**: Network es unreliable, planifica para failures
3. **Track usage metrics**: Monitor quotas, rate limits, y performance  
4. **Graceful degradation**: Funcionamiento parcial mejor que failure completo
5. **Test error scenarios**: Error handling es tan importante como success paths

### **Para Production**
1. **API key management**: Secure storage, rotation policies
2. **Rate limit monitoring**: Alertas antes de hitting limits  
3. **Cost optimization**: Monitor usage patterns, optimize calls
4. **Caching strategy**: Reduce redundant API calls
5. **Failover mechanisms**: Backup plans cuando APIs fallan

### **Para Testing**
1. **Deterministic tests**: MSW ensures consistent test results
2. **Edge case coverage**: Test rate limiting, network failures, malformed responses
3. **Integration testing**: Optional real API tests para validation
4. **Performance testing**: Monitor API call latency y throughput

---

## 🚀 Implementación Recomendada

### **1. Start with OpenRouter** 
Es el core del sistema de generación de historias y tiene la integración más completa implementada.

### **2. Add ElevenLabs**
Para audio features - complementa perfectly las historias generadas.

### **3. Integrate WordsAPI**  
Para vocabulary management - enhances el learning experience.

---

**🤖 ¿Listo para IA?** 

Comienza con **[OpenRouter Integration](./openrouter-integration.md)** para implementar story generation con inteligencia artificial.

**💡 Tip**: Cada API guide incluye service implementation, Vue composable, testing completo, y error handling robusto - todo probado y funcionando en el proyecto real.