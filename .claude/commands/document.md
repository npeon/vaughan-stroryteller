---
allowed-tools: TodoWrite, mcp__serena__*, Read, Write, Edit, Glob, Bash
argument-hint: [categoría-opcional]
description: Genera documentación automática basada en cambios de sesión mapeados contra plan de implementación
---

# Document Generator Command

## Description

Genera automáticamente documentación estructurada basada en los cambios realizados en la sesión actual, mapeando contra las tareas del `plan-implementacion.md` y organizándola en el directorio `docs/progressive-docs/` sin duplicar información existente.

## Usage

```
/document [categoría]
```

### Parámetros Opcionales

- `categoría`: Fuerza una categoría específica de documentación
  - `getting-started` → Tutoriales y configuración inicial
  - `how-to-guides` → Guías prácticas y soluciones específicas
  - `reference` → Documentación técnica y configuraciones
  - `explanation` → Decisiones arquitectónicas y conceptos

## Examples

```
/document
/document how-to-guides
/document reference
/document getting-started testing-setup
```

## Implementation

### Step 1: Análisis de Cambios de Sesión

- Detectar archivos modificados/creados en la conversación actual
- Identificar tipos de cambios: configuraciones, componentes, tests, servicios
- Extraer snippets de código relevantes y cambios técnicos significativos
- Correlacionar con tasks específicos del `docs/prd/plan-implementacion.md`

### Step 2: Mapeo Inteligente de Categorías

Determinar automáticamente la categoría apropiada basada en el tipo de cambio:

```
Configuraciones iniciales (Tasks 0.x) → getting-started/
├── Vitest, Cypress, MSW setup
├── Supabase configuration
└── Environment variables

Testing & TDD (Tasks con 'test', 'vitest', 'cypress') → how-to-guides/testing/
├── Unit testing patterns
├── E2E testing guides  
└── Mocking strategies

API Integrations → how-to-guides/apis/
├── OpenRouter integration
├── ElevenLabs TTS setup
└── WordsAPI vocabulary

Technical References → reference/
├── Configuration files
├── API documentation
└── Project structure

Architectural Decisions → explanation/
├── TDD methodology choices
├── Technology stack decisions
└── Technical deep-dives
```

### Step 3: Sistema Anti-Duplicación

- Escanear archivos existentes en `docs/progressive-docs/` por contenido similar
- Comparar títulos, snippets de código, y conceptos técnicos
- Actualizar documentación existente en lugar de crear duplicados
- Mantener historial de cambios en metadatos de archivos

### Step 4: Generación de Contenido Estructurado

Usar templates específicos por categoría:

#### Getting Started Template
```markdown
# [Número]. [Título del Tutorial]

## 🎯 Objetivos
[Qué aprenderás en esta sección]

## 📋 Prerrequisitos
[Lo que necesitas antes de comenzar]

## 🛠️ Implementación Paso a Paso
[Steps detallados con código y explicaciones]

## ✅ Verificación
[Cómo validar que todo funciona correctamente]

## 🔗 Próximos Pasos
[Enlaces a siguientes tutoriales]
```

#### How-To Guide Template
```markdown
# [Título del Problema a Resolver]

## 🎯 Problema
[Descripción del problema específico]

## 💡 Solución
[Implementación práctica paso a paso]

## 📝 Código Completo
[Ejemplos de código trabajando]

## ⚠️ Consideraciones
[Gotchas y mejores prácticas]

## 🔗 Referencias
[Enlaces a documentación técnica]
```

#### Reference Template
```markdown
# [Nombre de la Configuración/API]

## Descripción
[Qué hace y cuándo usarlo]

## Configuración
[Archivos y parámetros de configuración]

## API Reference
[Métodos, parámetros, tipos]

## Ejemplos
[Casos de uso comunes]
```

#### Explanation Template
```markdown
# [Título de la Decisión/Concepto]

## Contexto
[Situación que llevó a esta decisión]

## Decisión
[Qué se decidió y por qué]

## Consecuencias
[Resultados positivos y negativos]

## Alternativas Consideradas
[Otras opciones que se evaluaron]
```

### Step 5: Actualización de Índices y Enlaces

- Actualizar automáticamente archivos `index.md` en cada categoría
- Generar enlaces cruzados apropiados entre documentos relacionados
- Mantener tabla de contenidos del `docs/progressive-docs/index.md` principal
- Actualizar referencias a tasks completadas en el plan de implementación

### Step 6: Validación y Estructura

- Verificar que la estructura de archivos mantiene la jerarquía educativa
- Validar que los enlaces cruzados funcionen correctamente
- Confirmar que no se rompen referencias existentes
- Mantener el estilo educativo para programadores junior

## Output Structure

```
docs/progressive-docs/
├── getting-started/
│   ├── index.md (actualizado)
│   └── [nuevo-tutorial].md
├── how-to-guides/
│   ├── testing/
│   │   ├── index.md (actualizado)
│   │   └── [nueva-guia].md
│   └── apis/
│       ├── index.md (actualizado)
│       └── [nueva-integracion].md
├── reference/
│   ├── configurations/
│   │   ├── index.md (actualizado)
│   │   └── [nueva-config].md
│   └── apis/
└── explanation/
    ├── index.md (actualizado)
    └── [nueva-decision].md
```

## Intelligence Features

### Task Correlation
- Parsea `docs/prd/plan-implementacion.md` para identificar tasks completadas en la sesión
- Mapea cambios de código con tasks específicos (Task 0.1, 1.2.3, etc.)
- Genera referencias cruzadas entre documentación y plan de implementación

### Context Awareness
- Detecta si es configuración inicial, feature implementation, o bug fix
- Adapta el nivel de detalle según la audiencia (junior developers)
- Mantiene coherencia con el stack tecnológico documentado

### Content Intelligence
- Extrae snippets de código más relevantes de los cambios
- Genera explicaciones técnicas apropiadas para el nivel
- Crea ejemplos prácticos basados en el código real del proyecto

## Flujo de Ejecución del Comando

### Cuando se invoca `/document [categoría-opcional]`:

#### 1. ANÁLISIS DE CONTEXTO DE SESIÓN
```
- Identificar todos los archivos modificados/creados en la conversación actual
- Extraer snippets de código y cambios técnicos significativos  
- Detectar tipos de implementación: tests, componentes, services, configuraciones
```

#### 2. CORRELACIÓN CON PLAN DE IMPLEMENTACIÓN  
```
- Leer `docs/prd/plan-implementacion.md`
- Mapear cambios de sesión con tasks específicas (Task 0.1, 1.2.3, etc.)
- Identificar qué tareas se han avanzado/completado
```

#### 3. DETERMINACIÓN DE CATEGORÍA AUTOMÁTICA
```
Si no se especifica categoría, determinar automáticamente:
- Configuraciones iniciales (0.x) → getting-started/
- Testing patterns → how-to-guides/testing/  
- API integrations → how-to-guides/apis/
- Technical configs → reference/configurations/
- Architectural decisions → explanation/
```

#### 4. VERIFICACIÓN ANTI-DUPLICACIÓN
```  
- Escanear docs/progressive-docs/ por contenido similar
- Comparar títulos, conceptos técnicos, snippets de código
- Decidir: ¿actualizar existente o crear nuevo?
```

#### 5. GENERACIÓN DE CONTENIDO INTELIGENTE
```
- Aplicar template apropiado según categoría
- Incluir ejemplos reales del código implementado
- Generar explicaciones técnicas para nivel junior
- Crear enlaces cruzados relevantes
```

#### 6. ACTUALIZACIÓN DE ESTRUCTURA
```
- Crear/actualizar archivo de documentación
- Actualizar índices correspondientes (index.md)
- Mantener enlaces cruzados funcionando
- Preservar numeración y organización
```

#### 7. VALIDACIÓN FINAL
```  
- Verificar que la estructura sea coherente
- Confirmar que no se rompan enlaces existentes
- Validar que siga el estilo educativo establecido
```

## Sistema Anti-Duplicación Inteligente

### Algoritmo de Detección de Duplicados

```
1. ESCANEO DE CONTENIDO EXISTENTE
   - Leer todos los archivos .md en docs/progressive-docs/
   - Extraer títulos principales (# headings)
   - Extraer conceptos técnicos clave (keywords)
   - Extraer snippets de código

2. ANÁLISIS DE SIMILARIDAD
   - Comparar títulos usando similarity score (>70% = similar)
   - Detectar overlap de conceptos técnicos (>50% = relacionado)
   - Identificar código duplicado o muy similar

3. DECISIÓN DE ACCIÓN
   - Si similaridad >90%: Actualizar archivo existente
   - Si similaridad 50-90%: Agregar sección a archivo existente
   - Si similaridad <50%: Crear nuevo archivo
   - Si se detecta Task ID coincidente: Actualizar progreso
```

### Templates de Contenido por Categoría

#### Template: Getting Started
```markdown
# 🔧 [NN]. [Título del Tutorial]

> **✅ Tasks [X.Y-X.Z] [Estado]** - [Descripción breve del logro]

## 🎯 Objetivo
[Qué aprenderás y lograrás al completar esta sección]

## 📊 Estado Actual de Configuración
[Tasks específicas completadas con checkmarks y versiones]

## 🧪 [N]. [Sección de Implementación]
### **Configuración Actual**
[Archivos y configuraciones implementadas]

### **🔍 Elementos Clave**  
[Explicación de decisiones técnicas importantes]

### **✅ Verificación - Comandos Disponibles**
[Comandos que el usuario puede ejecutar para verificar]

### **🧪 Test de Verificación**
[Pasos específicos para validar que funciona]

---

## 🚀 Próximos Pasos
[Enlaces a siguientes tutoriales]

## 📚 Referencias
[Enlaces cruzados a documentación técnica]
```

#### Template: How-To Guide
```markdown
# [Título del Problema Específico]

## 🎯 Problema
[Descripción clara del problema que se está resolviendo]

## 💡 Solución
[Implementación paso a paso con explicaciones]

## 📝 Código Completo
[Ejemplos de código funcionando del proyecto real]

## ⚠️ Consideraciones
[Gotchas, limitaciones, mejores prácticas]

## 🔗 Referencias
[Enlaces a configuraciones y documentación relacionada]
```

#### Template: Reference
```markdown
# [Nombre de la Configuración/API]

## Descripción
[Qué hace, cuándo usarlo, por qué es importante]

## Configuración
[Archivos específicos y parámetros de configuración]

## API Reference
[Métodos, parámetros, tipos TypeScript, ejemplos]

## Ejemplos de Uso
[Casos de uso comunes del proyecto]
```

#### Template: Explanation  
```markdown
# [Título de la Decisión Técnica]

## Contexto
[Situación que llevó a tomar esta decisión]

## Decisión
[Qué se decidió hacer y las razones técnicas]

## Consecuencias
[Resultados positivos y negativos de la decisión]

## Alternativas Consideradas
[Otras opciones que se evaluaron y por qué se descartaron]
```

## Implementación Ejecutable

Al invocar este comando, ejecutará automáticamente:

1. **Análisis de Cambios**: Detectar modificaciones de la sesión
2. **Mapeo de Tasks**: Correlacionar con plan-implementacion.md  
3. **Anti-Duplicación**: Verificar contenido existente y decidir acción
4. **Categorización**: Determinar ubicación apropiada
5. **Generación**: Crear contenido estructurado usando templates
6. **Integración**: Actualizar índices y enlaces cruzados
7. **Validación**: Verificar coherencia y estructura

El comando mantendrá la filosofía educativa del proyecto, generando documentación que ayude a programadores junior a entender tanto la implementación como las decisiones técnicas tomadas.

## Actualización Automática de Índices y Enlaces

### Sistema de Enlaces Cruzados

```
1. ACTUALIZACIÓN DE ÍNDICES
   docs/progressive-docs/
   ├── index.md                    # ✅ Índice principal
   ├── getting-started/index.md    # ✅ Índice de tutoriales
   ├── how-to-guides/index.md      # ✅ Índice de guías
   ├── reference/index.md          # ✅ Índice de referencias
   └── explanation/index.md        # ✅ Índice de explicaciones

2. GENERACIÓN DE ENLACES
   - Detectar archivos nuevos/actualizados
   - Generar enlaces con formato consistente
   - Actualizar tablas de contenido
   - Mantener orden lógico (por número o fecha)

3. VALIDACIÓN DE ENLACES
   - Verificar que todos los enlaces funcionen
   - Detectar enlaces rotos después de cambios
   - Actualizar referencias cuando archivos se mueven
```

### Logic de Numeración Automática

```
Getting Started: 01-environment-setup.md, 02-tdd-fundamentals.md, etc.
├── Detectar último número en directorio
├── Incrementar secuencialmente  
└── Mantener formato consistente: NN-titulo-slug.md

How-To Guides: Organizados por subdirectorio
├── testing/ → Guías específicas de testing
├── apis/ → Guías de integración de APIs
└── development/ → Guías de desarrollo general

Reference: Organizados por tipo técnico
├── configurations/ → Archivos de configuración
├── apis/ → Documentación de APIs
└── testing-patterns/ → Patterns de testing

Explanation: Por decisión arquitectónica
├── architecture-decisions/ → Decisiones técnicas
├── technical-deep-dive/ → Análisis técnicos profundos
└── educational-methodology/ → Metodología educativa
```

### Ejemplo de Ejecución del Comando

#### Escenario: Se implementó Task 0.9 - Schema de base de datos

```bash
/document
```

**Análisis automático:**
1. **Cambios detectados**: Migración SQL, tipos TypeScript generados
2. **Task mapeada**: Task 0.9 del plan-implementacion.md  
3. **Categoría determinada**: `getting-started/` (configuración inicial)
4. **Anti-duplicación**: No existe documentación similar
5. **Generación**: `03-database-schema-setup.md`
6. **Actualización**: `getting-started/index.md` + enlaces cruzados

**Contenido generado automáticamente:**
```markdown
# 🗄️ 03. Configuración del Schema de Base de Datos

> **✅ Task 0.9 Completada** - Schema principal con tablas core implementado

## 🎯 Objetivo
Entender la estructura de base de datos de Supabase implementada para The Vaughan Storyteller...

## 📊 Estado Actual de Configuración
### **✅ Task 0.9: Schema Principal**
- [Código SQL real de la migración implementada]
- [Tipos TypeScript generados automáticamente]

## 🧪 1. Verificación de Migración
### **Configuración Actual**
[Archivos específicos creados en la sesión]
```

**Índices actualizados:**
- `getting-started/index.md`: Enlace a nuevo tutorial agregado
- `docs/progressive-docs/index.md`: Progreso actualizado
- Enlaces cruzados a reference/configurations/supabase-config.md

## Inteligencia Contextual del Comando

### Mapeo Task → Categoría

```javascript
const taskMapping = {
  // Configuraciones iniciales
  '0.1-0.8': 'getting-started',
  
  // Supabase setup  
  '0.9-0.14': 'getting-started', // + reference/configurations
  
  // APIs externas
  '0.15-0.20': 'how-to-guides/apis',
  
  // Testing patterns
  'test|vitest|cypress': 'how-to-guides/testing',
  
  // Features principales  
  '1.x': 'how-to-guides/development',
  
  // Decisiones arquitectónicas
  'architecture|decision|why': 'explanation/architecture-decisions'
}
```

### Detección de Contexto de Sesión

```
ARCHIVOS CREADOS/MODIFICADOS →  CATEGORÍA SUGERIDA
├── *.config.ts, *.config.js    →  reference/configurations  
├── *.test.ts, *.spec.ts        →  how-to-guides/testing
├── services/*.ts               →  how-to-guides/apis
├── migrations/*.sql            →  getting-started + reference
├── components/*.vue            →  how-to-guides/development  
└── docs/explanation/*.md       →  explanation/
```

### Ejemplos de Uso del Comando

```bash
# Documentación automática basada en cambios de sesión
/document

# Forzar categoría específica  
/document how-to-guides

# Forzar subcategoría específica
/document reference configurations
```

## Notes

- IMPORTANTE: Siempre verifica archivos existentes antes de crear nuevos
- Mantiene el estilo educativo y progresivo de la documentación existente  
- Preserva la estructura de numeración y organización actual
- Actualiza metadatos de progreso en la documentación principal
- Genera contenido optimizado para conversión a web de documentación
- Correlaciona automáticamente con el plan de implementación TDD
- Mantiene enlaces cruzados funcionando entre todas las categorías