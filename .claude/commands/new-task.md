---
allowed-tools: Task, TodoWrite, mcp__serena__*, mcp__context7-mcp__*
argument-hint: [solicitud/tarea a implementar]
description: Gestiona tareas complejas con agentes especializados y metodología TDD
---

# Comando /new-task - Gestor Inteligente de Tareas

Este comando gestiona de forma proactiva e inteligente cualquier tarea de desarrollo utilizando todos los agentes especializados disponibles y siguiendo estrictamente la metodología TDD.

## Flujo de Trabajo

### 1. ANÁLISIS DE LA SOLICITUD

Primero analizo la solicitud recibida: **$ARGUMENTS**

Evalúo:

- Complejidad de la tarea
- Tecnologías involucradas
- Necesidad de investigación
- Agentes especializados requeridos
- Si es suficientemente simple para gestión directa

### 2. CONSULTA PROACTIVA DE AGENTES ESPECIALIZADOS

Según el contexto de la solicitud, utilizaré PROACTIVAMENTE estos agentes:

#### **documentation-researcher**

- Para investigar documentación técnica
- Clarificar implementaciones de APIs/frameworks
- Buscar mejores prácticas y patrones

#### **education-platform-specialist**

- Para funcionalidades educativas
- Patrones UX en plataformas de enseñanza
- Compliance y arquitectura educativa

#### **ai-integration-specialist**

- Para integraciones con OpenRouter/IA
- Diseño de prompts educativos
- Workflows de evaluación automática

#### **frontend-design-advisor**

- Para decisiones UI/UX
- Optimización de diseño
- Revisión de código frontend

#### **backend-logic-advisor**

- Para lógica de servidor
- APIs y endpoints
- Arquitectura backend
- Operaciones de base de datos

#### **code-quality-auditor**

- Revisión proactiva de código implementado
- Identificación de bugs y mejoras
- Adherencia a estándares

### 3. METODOLOGÍA TDD (OBLIGATORIO)

**ANTES de cualquier implementación de código:**

1. Usar agente `tdd-test-generator` para diseñar las pruebas
2. Implementar tests que fallen inicialmente (Red)
3. Escribir código mínimo para hacer pasar tests (Green)
4. Refactorizar manteniendo tests pasando (Refactor)

### 4. PLANIFICACIÓN GRANULAR

Crear plan detallado con `TodoWrite` que incluya:

- Tareas específicas basadas en información de agentes
- Subtareas ejecutables
- Validaciones en cada paso

### 5. IMPLEMENTACIÓN

- Usar información consultiva de los agentes especializados
- Mantener contexto limpio derivando trabajo complejo a agentes
- Seguir patrones y estándares del proyecto
- Implementar siguiendo el ciclo TDD estrictamente

### 6. VALIDACIÓN FINAL

- Usar `code-quality-auditor` para revisión final
- Ejecutar comandos de validación:
  - `npm run lint`
  - `npm run format`
  - `npm run typecheck`

### 7. GESTIÓN DE COMPLEJIDAD

Si la tarea es EXCEPCIONALMENTE simple y no requiere la operativa completa:

- Lo indico claramente al usuario
- Procedo con implementación directa
- Mantengo alta calidad de código

Si requiere acciones adicionales no especificadas:

- Informo al usuario claramente
- Pido confirmación antes de proceder
- Explico la necesidad de acciones extra

### 8. PROCESAMIENTO DE REFERENCIAS

Si la solicitud contiene referencias a documentos:

- Los localizo y leo proactivamente
- Incorporo la información en el análisis
- Uso para contextualizar la implementación

## Ejecución

Al invocar `/new-task [solicitud]`, iniciaré automáticamente este flujo completo, utilizando todos los agentes necesarios de forma proactiva para entregar una implementación de alta calidad siguiendo TDD y las mejores prácticas del proyecto Oxford Tests Platform.
