# Ejemplo de Uso del Comando `/document`

## 🎯 Propósito de Ejemplo

Este documento muestra cómo el comando `/document` funcionaría en un escenario real del proyecto The Vaughan Storyteller.

## 📋 Escenario de Prueba

**Situación**: En una sesión de trabajo se implementó la Task 0.9 - "Crear esquema de base de datos con tablas principales"

**Cambios realizados en la sesión**:
- Creación de migración SQL: `supabase/migrations/20250828000001_create_main_schema.sql`
- Generación de tipos TypeScript: `src/types/supabase.ts` actualizado
- Configuración de RLS policies básicas
- Tests de verificación de conexión

## 💻 Invocación del Comando

```bash
/document
```

## 🤖 Análisis Automático del Sistema

### 1. Detección de Cambios
```
ARCHIVOS DETECTADOS:
- ✅ supabase/migrations/20250828000001_create_main_schema.sql (NUEVO)
- ✅ src/types/supabase.ts (MODIFICADO - tipos actualizados)
- ✅ src/services/supabase/client.ts (MODIFICADO - configuración)
- ✅ test/vitest/__tests__/supabase-connection.test.ts (NUEVO)

TIPO DE CAMBIOS: Database migration + TypeScript types + Testing
```

### 2. Mapeo de Task
```
TASK IDENTIFICADA: Task 0.9 en docs/prd/plan-implementacion.md
ESTADO: [x] **Task 0.9**: Crear esquema de base de datos con tablas principales
CATEGORÍA DETERMINADA: getting-started/ (configuración inicial 0.x)
```

### 3. Verificación Anti-Duplicación
```
ESCANEO DE CONTENIDO EXISTENTE:
- docs/progressive-docs/getting-started/02-supabase-setup.md (50% similar - setup inicial)
- docs/progressive-docs/reference/configurations/supabase-config.md (30% similar - configuración)

DECISIÓN: Crear nuevo archivo (similitud <50%, Task específica diferente)
```

### 4. Generación de Contenido
```
ARCHIVO GENERADO: docs/progressive-docs/getting-started/03-database-schema-setup.md
TEMPLATE USADO: Getting Started
CONTENIDO INCLUIDO:
- ✅ Código SQL real de la migración
- ✅ Tipos TypeScript generados
- ✅ Comandos de verificación
- ✅ Referencias cruzadas apropiadas
```

## 📝 Resultado Generado

### Archivo Creado: `03-database-schema-setup.md`

```markdown
# 🗄️ 03. Configuración del Schema de Base de Datos

> **✅ Task 0.9 Completada** - Schema principal con tablas core implementado

## 🎯 Objetivo

Entender la estructura de base de datos de Supabase implementada para The Vaughan Storyteller. Al completar esta sección, tendrás:

- ✅ **Schema principal funcionando**: Tablas core creadas y configuradas
- ✅ **Tipos TypeScript**: Interfaces generadas automáticamente desde BD
- ✅ **RLS policies**: Seguridad básica configurada
- ✅ **Validación completa**: Confirms que la conexión y queries funcionan

**⏱️ Tiempo estimado**: 1-2 horas  
**📋 Prerrequisitos**: Supabase CLI configurado, proyecto inicializado

## 📊 Estado Actual de Configuración

### **✅ Task 0.9: Schema Principal**

```sql
-- Migración implementada: 20250828000001_create_main_schema.sql

-- Tabla de usuarios con perfiles
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de historias
CREATE TABLE public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS habilitado
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
```

### **✅ Tipos TypeScript Generados**

```typescript
// src/types/supabase.ts - Generado automáticamente
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          title: string
          content: string
          cefr_level: string
          user_id: string | null
          created_at: string
        }
        // ... Insert y Update types
      }
    }
  }
}
```

## 🧪 1. Verificación de Migración

### **✅ Verificación - Comandos Disponibles**

```bash
# Verificar estado de migraciones
npx supabase migration list

# Ver schema actual
npx supabase db diff

# Regenerar tipos TypeScript
npx supabase gen types typescript --local > src/types/supabase.ts
```

### **🧪 Test de Verificación**

Ejecuta este test para verificar que el schema funciona:

```bash
npm run test:unit -- test/vitest/__tests__/supabase-connection.test.ts
```

**Resultado esperado**: Tests pasan confirmando conexión a BD y queries básicas funcionando.

---

## 🚀 Próximos Pasos

### **Si Todo Funciona Correctamente** ✅
¡Perfecto! Tu schema de base de datos está listo. Continúa con:
- **[04. RLS Policies Setup](./04-rls-policies-setup.md)** - Configurar seguridad avanzada

### **Si Hay Problemas** ⚠️

#### **Migration no se aplica**
```bash
# Verificar estado de Supabase local
npx supabase status

# Reset si es necesario
npx supabase db reset
```

## 📚 Referencias

### **Configuraciones Detalladas**
- [Supabase Configuration Reference](../reference/configurations/supabase-config.md)
- [Database Schema Reference](../reference/project-structure/database-schema.md)

### **Architectural Decisions**
- [Database Design Decisions](../explanation/architecture-decisions/database-design-choices.md)

---

**✅ Database Schema Setup Completado**

Tienes un schema de base de datos funcional con:
- **Tablas principales** para usuarios e historias
- **Tipos TypeScript** generados automáticamente
- **RLS policies** básicas configuradas  
- **Tests de validación** funcionando

**➡️ Siguiente**: [04. RLS Policies Setup](./04-rls-policies-setup.md) - Configurar políticas de seguridad avanzadas
```

### Índices Actualizados Automáticamente

#### `getting-started/index.md`
```markdown
# 📚 Getting Started - Tutorial Progresivo

## 📋 Tutorial de 7 Semanas

### 🟢 **Semana 1: Fundamentos** (Completado ✅)
- [01. Configuración del Entorno TDD](./01-environment-setup.md)
- [02. Fundamentos de TDD](./02-tdd-fundamentals.md)
- [**03. Configuración del Schema de Base de Datos**](./03-database-schema-setup.md) ⭐ NUEVO
```

#### `docs/progressive-docs/index.md`
```markdown
### ✅ Estado Actual del Proyecto

**Tasks Completadas (0.1-0.9)**:
- ✅ **Testing Unitario**: Vitest + Vue Test Utils configurado
- ✅ **Testing E2E**: Cypress con soporte para componentes Quasar
- ✅ **API Mocking**: MSW completamente configurado para 3 APIs externas
- ✅ **Database Schema**: Tablas principales y tipos TypeScript ⭐ NUEVO
```

## 🎯 Beneficios del Comando

### ✅ **Automatización Completa**
- Detección automática de cambios sin intervención manual
- Mapeo inteligente de tasks del plan de implementación
- Generación de contenido educativo estructurado

### ✅ **Anti-Duplicación Inteligente**  
- Evita documentación redundante
- Actualiza contenido existente cuando es apropiado
- Mantiene consistencia en la estructura

### ✅ **Contexto Educativo**
- Mantiene el enfoque en programadores junior
- Incluye ejemplos reales del código implementado
- Genera explicaciones técnicas apropiadas para el nivel

### ✅ **Mantenimiento Automático**
- Actualiza índices y enlaces cruzados automáticamente
- Mantiene numeración y estructura consistente
- Valida que no se rompan referencias existentes

## 🔄 Flujo Típico de Uso

1. **Durante el desarrollo**: Implementar features siguiendo metodología TDD
2. **Al finalizar sesión**: Ejecutar `/document` para generar documentación
3. **Revisión automática**: El comando analiza cambios y los mapea contra el plan
4. **Documentación generada**: Contenido estructurado y educativo se crea/actualiza
5. **Índices actualizados**: Enlaces cruzados y estructura se mantienen consistentes

**¡El comando `/document` está listo para uso!** 🎉