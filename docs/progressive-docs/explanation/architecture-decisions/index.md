# 🏗️ Decisiones Arquitectónicas

> **Registro de decisiones técnicas importantes tomadas durante el desarrollo de The Vaughan Storyteller**

## 📋 Índice de Decisiones

### **🤖 Inteligencia Artificial y APIs**

1. **[TDD Methodology Decision](./why-tdd-methodology.md)**
   - **Estado**: ✅ Implementado
   - **Fecha**: 2024-2025
   - **Impacto**: Metodología de desarrollo, testing, calidad de código
   - **Resumen**: Por qué elegimos Test-Driven Development como metodología principal

2. **[OpenRouter Model Change: Claude 3.5 → GPT-4o Mini](./openrouter-model-change-decision.md)** 
   - **Estado**: ✅ Implementado - Enero 2025
   - **Fecha**: 2025-08-29
   - **Impacto**: 95% reducción de costos, sostenibilidad económica
   - **Resumen**: Cambio del modelo primario de IA para optimizar costos sin comprometer calidad

---

## 📊 Estadísticas de Decisiones

- **Total de decisiones**: 2
- **Implementadas**: 2
- **En progreso**: 0
- **Pendientes**: 0

---

## 🎯 Categorías de Decisiones

### **Metodología y Procesos**
- [TDD Methodology Decision](./why-tdd-methodology.md)

### **Tecnología y Costos**
- [OpenRouter Model Change Decision](./openrouter-model-change-decision.md)

### **Próximas Decisiones Potenciales**
- Selección de stack de monitoring/observabilidad
- Estrategia de caching para APIs externas
- Arquitectura de audio streaming para TTS
- Implementación de offline-first functionality

---

## 📝 Plantilla para Nuevas Decisiones

Para documentar una nueva decisión arquitectónica, usar la estructura:

```markdown
# Título de la Decisión

## Contexto
[Situación que llevó a tomar esta decisión]

## Decisión
[Qué se decidió hacer y las razones técnicas]

## Alternativas Consideradas
[Otras opciones que se evaluaron y por qué se descartaron]

## Consecuencias
[Resultados positivos y negativos de la decisión]

## Métricas de Éxito
[Cómo medir si la decisión fue correcta]

## Plan de Rollback
[Cómo revertir si es necesario]
```

---

## 🔗 Enlaces Relacionados

- **[Explanation Index](../index.md)** - Volver al índice de explicaciones
- **[How-to Guides](../../how-to-guides/index.md)** - Implementación práctica de estas decisiones
- **[Implementation Plan](../../../prd/plan-implementacion.md)** - Plan TDD con tasks específicas

---

**📅 Última actualización**: 2025-08-29  
**🔄 Próxima revisión**: 2025-09-29