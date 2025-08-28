# 🗄️ 02. Configuración de Supabase Backend

> **✅ Tasks 0.7-0.8 Completadas** - Supabase CLI + proyecto configurado y conectado

## 🎯 Objetivo

Configurar completamente Supabase como backend principal del proyecto. Al completar esta sección, tendrás:

- ✅ **Supabase CLI**: Instalado y configurado localmente
- ✅ **Proyecto enlazado**: Conectado con base de datos remota
- ✅ **Cliente integrado**: Disponible en toda la aplicación Quasar
- ✅ **Tipos TypeScript**: Generados automáticamente desde BD
- ✅ **Conexión verificada**: Testing de conectividad exitoso

**⏱️ Tiempo estimado**: 1-2 horas  
**📋 Prerequisitos**: Environment TDD configurado, cuenta Supabase activa

## 📊 Estado Actual de Configuración

### **✅ Task 0.7: Proyecto Supabase Configurado**
```bash
# ✅ Proyecto remoto enlazado
Project: vaughan-storyteller (gsmxqozuihsyuiaboqqk)
Region: West EU (Paris)
Status: ● Linked and Active
```

### **✅ Task 0.8: CLI y Entorno Local**  
```bash
# ✅ Supabase CLI instalado
supabase v2.30.4
# ✅ Configuración local inicializada
supabase/config.toml created
```

## 🛠️ 1. Instalación y Configuración CLI

### **Verificación de Instalación**

```bash
# Verificar versión de Supabase CLI
supabase --version
# Output: 2.30.4

# Listar proyectos conectados
supabase projects list
# Debe mostrar 'vaughan-storyteller' como ● Linked
```

### **Configuración Local**

El proyecto incluye la configuración local en `supabase/config.toml`:

```toml
# supabase/config.toml
project_id = "gsmxqozuihsyuiaboqqk"

[api]
enabled = true
port = 54321

[auth]
enabled = true
site_url = "http://localhost:3000"
jwt_expiry = 3600

[db]
port = 54322
```

### **🔍 Elementos Clave de la Configuración**

1. **Project ID**: Enlazado con proyecto remoto `gsmxqozuihsyuiaboqqk`
2. **API Gateway**: Puerto 54321 para desarrollo local
3. **Auth Service**: Configurado con JWT de 1 hora
4. **Database**: PostgreSQL en puerto 54322

---

## 🔌 2. Integración con Quasar Framework

### **Cliente Supabase**

El cliente está configurado en `src/services/supabase/client.ts`:

```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Validación de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno Supabase requeridas');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,    // ✅ Refresh automático de tokens
    persistSession: true,      // ✅ Sesión persistente en localStorage
    detectSessionInUrl: true,  // ✅ Detectar auth desde URL
  },
  realtime: {
    params: {
      eventsPerSecond: 10,     // ✅ Rate limiting para Realtime
    },
  },
});
```

### **Boot File de Quasar**

La integración global está en `src/boot/supabase.ts`:

```typescript
// src/boot/supabase.ts
import { boot } from 'quasar/wrappers';
import { supabase } from '../services/supabase/client';

export default boot(async ({ app }) => {
  // Hacer Supabase disponible globalmente
  app.config.globalProperties.$supabase = supabase;
  app.provide('supabase', supabase);

  // Inicializar sesión de auth
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Supabase: Usuario autenticado', session.user.email);
    } else {
      console.log('ℹ️ Supabase: No hay sesión activa');
    }
  } catch (error) {
    console.error('❌ Supabase: Error al obtener sesión', error);
  }
});
```

### **🔍 Patrón de Integración**

1. **Dependency Injection**: Disponible como `$supabase` en todos los componentes
2. **Provide/Inject**: Accesible con `inject('supabase')` en Composition API
3. **Session Management**: Inicialización automática de sesión de usuario
4. **Error Handling**: Logging detallado para debugging

---

## 📋 3. Tipos TypeScript Autogenerados

### **Generación de Tipos desde BD**

Los tipos se generan automáticamente desde la base de datos remota:

```bash
# Generar tipos desde base de datos remota
supabase gen types typescript --linked > src/types/supabase.ts
```

### **Estructura de Tipos**

El archivo `src/types/supabase.ts` incluye:

```typescript
// src/types/supabase.ts - Autogenerado
export type Database = {
  public: {
    Tables: {
      // Tablas de la base de datos aparecerán aquí automáticamente
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
        };
        Update: {
          id?: string;
          email?: string;
        };
      };
      // ... más tablas
    };
    Views: {
      // Vistas de la base de datos
    };
    Functions: {
      // Funciones de la base de datos
    };
  };
};
```

### **🔍 Beneficios del Tipado**

1. **Type Safety**: Autocomplete y validación en tiempo de desarrollo
2. **Refactoring**: Cambios en BD se reflejan automáticamente en el código
3. **Developer Experience**: IntelliSense completo para queries Supabase
4. **Error Prevention**: Detección temprana de errores de schema

---

## 🔧 4. Variables de Entorno

### **Configuración en `.env`**

Las variables de Supabase están configuradas en `.env`:

```env
# Supabase (cuenta nacho_peon@hotmail.com)
# --------------
SUPABASE_URL=https://gsmxqozuihsyuiaboqqk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.gsmxqozuihsyuiaboqqk.supabase.co:5432/postgres
```

### **🔍 Tipos de Keys**

1. **ANON_KEY**: Para operaciones client-side con RLS
2. **SERVICE_ROLE_KEY**: Para operaciones admin/server-side
3. **DATABASE_URL**: Para conexiones directas a PostgreSQL
4. **URL**: Endpoint principal del proyecto Supabase

### **⚠️ Seguridad**

- **Nunca comitear**: El archivo `.env` está en `.gitignore`
- **Production**: Configurar en variables de entorno de Vercel
- **Development**: Solo ANON_KEY es segura para uso client-side
- **Service Role**: Solo para Edge Functions y operaciones server-side

---

## ✅ 5. Verificación de Funcionamiento

### **Test de Conectividad**

Para verificar que Supabase funciona correctamente:

```typescript
// Ejemplo de uso en un componente Vue
<script setup lang="ts">
import { inject } from 'vue';
import type { SupabaseClient } from '../services/supabase/client';

const supabase = inject<SupabaseClient>('supabase')!;

// Test básico de conexión
const testConnection = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ Conexión exitosa:', user ? 'Autenticado' : 'No autenticado');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

// Ejecutar al montar el componente
onMounted(testConnection);
</script>
```

### **Comandos de Verificación**

```bash
# 1. ✅ Verificar proyecto enlazado
supabase projects list
# Debe mostrar ● junto a vaughan-storyteller

# 2. ✅ Verificar tipos generados
ls -la src/types/supabase.ts
# Archivo debe existir con tipos Database

# 3. ✅ Verificar cliente funciona
npm run dev
# Consola del navegador debe mostrar logs de Supabase

# 4. ✅ Verificar variables de entorno
node -e "console.log(process.env.SUPABASE_URL)"
# Debe mostrar la URL de Supabase
```

### **🧪 Checklist de Verificación Completa**

- [ ] **CLI instalado**: `supabase --version` funciona
- [ ] **Proyecto enlazado**: Aparece como ● Linked en `supabase projects list`
- [ ] **Config local**: Archivo `supabase/config.toml` existe
- [ ] **Cliente integrado**: Boot file carga sin errores
- [ ] **Tipos generados**: `src/types/supabase.ts` existe y es válido
- [ ] **Variables configuradas**: `.env` contiene todas las keys necesarias
- [ ] **Conexión funcional**: Console logs muestran conexión exitosa

---

## 🚀 6. Próximos Pasos

### **Base de Datos Schema** 📋
El siguiente paso es crear el schema de base de datos con las tablas principales:

- **users**: Perfiles de usuario con CEFR level
- **stories**: Historias generadas por IA
- **vocabulary**: Palabras guardadas y progreso
- **admin_tables**: Banners, límites, health checks

**➡️ Siguiente**: Task 0.9 - Crear esquema de base de datos con tablas principales

### **Desarrollo con Supabase** 🛠️

#### **Uso en Componentes**
```typescript
// Composition API
const supabase = inject('supabase');

// Options API
this.$supabase
```

#### **Operaciones Comunes**
```typescript
// Auth
const { user } = await supabase.auth.getUser();

// Database
const { data } = await supabase.from('stories').select('*');

// Realtime
supabase.channel('stories').on('postgres_changes', callback);
```

#### **Edge Functions** (Próximamente)
```typescript
// Invocar función remota
const { data } = await supabase.functions.invoke('generate-story');
```

---

## 🔧 7. Troubleshooting Común

### **Error: Cannot find module '@supabase/supabase-js'**
```bash
# Reinstalar dependencias
npm install @supabase/supabase-js
```

### **Error: SUPABASE_URL environment variable is required**
```bash
# Verificar que .env está siendo cargado
npm install --save-dev dotenv
```

### **Error: Cannot find module '@/types/supabase'**
```bash
# Regenerar tipos desde base de datos
supabase gen types typescript --linked > src/types/supabase.ts
```

### **Error: failed to inspect container health**
```bash
# Este error es normal - no necesitamos servicios locales corriendo
# El proyecto está configurado para usar la base de datos remota
```

### **CLI desactualizado**
```bash
# Actualizar Supabase CLI
npm install -g supabase@latest
```

---

## 📚 Referencias

### **Configuraciones Detalladas**
- [Supabase Client Configuration](../reference/configurations/supabase-config.md)
- [Environment Variables Reference](../reference/configurations/env-variables.md)

### **Arquitectura**
- [Backend Architecture Decisions](../explanation/architecture-decisions/backend-architecture.md)
- [Supabase vs Firebase Comparison](../explanation/architecture-decisions/supabase-choice.md)

### **API Integration**
- [Supabase Integration Patterns](../how-to-guides/apis/supabase-integration.md)
- [Auth Flow Implementation](../how-to-guides/apis/auth-implementation.md)

---

**✅ Supabase Setup Completado**

Tienes un backend Supabase completamente configurado con:
- **Database**: PostgreSQL con tipos TypeScript autogenerados
- **Auth**: Sistema de autenticación completo con JWT
- **Realtime**: Sincronización en tiempo real configurada
- **Storage**: Para archivos de audio y assets (ready to use)
- **Edge Functions**: Platform para serverless functions
- **Integration**: Cliente disponible globalmente en Quasar

**➡️ Siguiente**: [03. Database Schema](./03-database-schema.md) - Crear tablas principales del sistema