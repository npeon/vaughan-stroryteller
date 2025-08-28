# 🗄️ Supabase Configuration Reference

> **Configuración completa de Supabase para The Vaughan Storyteller**

## 📋 Overview

Esta referencia documenta la configuración completa de Supabase utilizada en el proyecto, incluyendo cliente, autenticación, tipos TypeScript, y patrones de integración.

## 🔧 Cliente Supabase

### **Configuración Principal**

```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ✅ Auto-refresh de tokens JWT
    autoRefreshToken: true,
    
    // ✅ Persistencia de sesión en localStorage
    persistSession: true,
    
    // ✅ Detectar sesión desde URL (OAuth callbacks)
    detectSessionInUrl: true,
    
    // ✅ Configuración opcional de storage
    storage: window?.localStorage,
    
    // ✅ Debug mode para desarrollo
    debug: process.env.NODE_ENV === 'development',
  },
  
  realtime: {
    params: {
      // ✅ Rate limiting para Realtime
      eventsPerSecond: 10,
    },
    
    // ✅ Configuración de heartbeat
    heartbeatIntervalMs: 30_000,
    
    // ✅ Configuración de reconexión
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30_000),
  },
  
  db: {
    // ✅ Schema por defecto
    schema: 'public',
  },
  
  global: {
    // ✅ Headers globales
    headers: {
      'X-Client-Info': 'vaughan-storyteller@1.0.0',
    },
  },
});
```

### **🔍 Parámetros de Configuración**

| Parámetro | Valor | Propósito |
|-----------|-------|-----------|
| `autoRefreshToken` | `true` | Renueva automáticamente tokens JWT antes de expirar |
| `persistSession` | `true` | Mantiene sesión activa entre recargas de página |
| `detectSessionInUrl` | `true` | Detecta tokens de OAuth en URL parameters |
| `eventsPerSecond` | `10` | Limita eventos Realtime para evitar overload |
| `heartbeatIntervalMs` | `30000` | Envía ping cada 30s para mantener conexión |

## 🚀 Boot File Quasar

### **Integración Global**

```typescript
// src/boot/supabase.ts
import { boot } from 'quasar/wrappers';
import { supabase } from '../services/supabase/client';

export default boot(async ({ app }) => {
  // ✅ Global Properties - Disponible como this.$supabase
  app.config.globalProperties.$supabase = supabase;
  
  // ✅ Provide/Inject - Disponible con inject('supabase')
  app.provide('supabase', supabase);

  // ✅ Session initialization
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase Auth Error:', error.message);
      return;
    }
    
    if (session) {
      console.log('✅ Usuario autenticado:', {
        email: session.user.email,
        role: session.user.user_metadata?.role || 'user',
        expires: new Date(session.expires_at! * 1000).toLocaleString()
      });
    } else {
      console.log('ℹ️ No hay sesión activa - usuario anónimo');
    }
    
  } catch (error) {
    console.error('❌ Error inicializando Supabase:', error);
  }
});

// ✅ TypeScript augmentation
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: typeof supabase;
  }
}
```

### **🔍 Patrones de Uso**

#### **Composition API**
```typescript
<script setup lang="ts">
import { inject } from 'vue';
import type { SupabaseClient } from '../services/supabase/client';

// ✅ Inject en Composition API
const supabase = inject<SupabaseClient>('supabase')!;

// Usar en funciones
const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
</script>
```

#### **Options API**
```typescript
<script>
export default {
  async mounted() {
    // ✅ Global property en Options API
    const { data: { user } } = await this.$supabase.auth.getUser();
    console.log('Usuario:', user);
  }
}
</script>
```

## 📝 Tipos TypeScript

### **Generación Automática**

```bash
# ✅ Generar tipos desde base de datos remota
supabase gen types typescript --linked > src/types/supabase.ts

# ✅ Generar tipos desde base de datos local
supabase gen types typescript --local > src/types/supabase-local.ts
```

### **Estructura de Tipos**

```typescript
// src/types/supabase.ts - Autogenerado
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
          role?: 'user' | 'admin';
        };
        Update: {
          id?: string;
          email?: string;
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
          role?: 'user' | 'admin';
        };
      };
      
      stories: {
        Row: {
          id: string;
          title: string;
          content: string;
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
          genre: string;
          user_id: string;
          created_at: string;
          reading_time: number;
          vocabulary_count: number;
        };
        Insert: {
          title: string;
          content: string;
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
          genre: string;
          user_id: string;
          reading_time: number;
          vocabulary_count: number;
        };
        Update: {
          title?: string;
          content?: string;
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
          genre?: string;
          reading_time?: number;
          vocabulary_count?: number;
        };
      };
    };
    
    Views: {
      // Vistas de la base de datos
    };
    
    Functions: {
      // Edge Functions y stored procedures
    };
  };
};

// ✅ Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type UserRow = Tables<'users'>['Row'];
export type StoryRow = Tables<'stories'>['Row'];
```

### **🔍 Uso de Tipos**

```typescript
// ✅ Typed queries
const { data: users } = await supabase
  .from('users')
  .select('*')
  .returns<UserRow[]>();

// ✅ Typed inserts
const newStory: Tables<'stories'>['Insert'] = {
  title: 'Mi nueva historia',
  content: '...',
  cefr_level: 'B1',
  genre: 'adventure',
  user_id: userId,
  reading_time: 300,
  vocabulary_count: 45
};

await supabase.from('stories').insert(newStory);
```

## 🔐 Variables de Entorno

### **Configuración Requerida**

```env
# .env - Variables de entorno principales
SUPABASE_URL=https://gsmxqozuihsyuiaboqqk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.gsmxqozuihsyuiaboqqk.supabase.co:5432/postgres
```

### **🔍 Uso de Keys**

| Variable | Uso | Seguridad |
|----------|-----|-----------|
| `SUPABASE_URL` | Endpoint principal del proyecto | ✅ Público |
| `SUPABASE_ANON_KEY` | Cliente JavaScript con RLS | ✅ Público |
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones admin/server | ⚠️ Secreto |
| `DATABASE_URL` | Conexión directa PostgreSQL | ⚠️ Secreto |

### **Validación de Variables**

```typescript
// src/services/supabase/client.ts
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('❌ SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('❌ SUPABASE_ANON_KEY environment variable is required');
}

// ✅ Validar formato de URL
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('❌ SUPABASE_URL must be a valid URL');
}

// ✅ Validar formato de JWT
if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('❌ SUPABASE_ANON_KEY must be a valid JWT');
}
```

## 🔄 Configuración CLI

### **Configuración Local**

```toml
# supabase/config.toml
project_id = "gsmxqozuihsyuiaboqqk"

[api]
enabled = true
port = 54321

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = []
jwt_expiry = 3600

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[db]
port = 54322
shadow_port = 54323

[functions]
enabled = true

[storage]
enabled = true
```

### **🔍 Comandos CLI Útiles**

```bash
# ✅ Verificar estado del proyecto
supabase status

# ✅ Generar tipos TypeScript
supabase gen types typescript --linked > src/types/supabase.ts

# ✅ Listar proyectos
supabase projects list

# ✅ Abrir dashboard
supabase dashboard

# ✅ Ver logs (requiere servicio local)
supabase logs

# ✅ Ejecutar SQL
supabase sql --db-url "$DATABASE_URL" --file query.sql
```

## 🛡️ Configuración de Seguridad

### **Row Level Security (RLS)**

```sql
-- ✅ Habilitar RLS en tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ✅ Policy para que usuarios solo vean sus propios datos
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- ✅ Policy para que usuarios actualicen su perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### **Configuración Auth**

```typescript
// Configuración de auth en cliente
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  }
});
```

## 🔄 Patrones de Uso Comunes

### **Query Patterns**

```typescript
// ✅ Select con filtros y joins
const { data: storiesWithProgress } = await supabase
  .from('stories')
  .select(`
    *,
    story_progress (
      progress_percentage,
      last_read_at
    )
  `)
  .eq('user_id', userId)
  .eq('cefr_level', 'B1')
  .order('created_at', { ascending: false })
  .limit(10);

// ✅ Insert con retorno
const { data: newStory } = await supabase
  .from('stories')
  .insert(storyData)
  .select()
  .single();

// ✅ Upsert pattern
const { error } = await supabase
  .from('user_preferences')
  .upsert({
    user_id: userId,
    theme: 'dark',
    language: 'es'
  }, {
    onConflict: 'user_id'
  });
```

### **Realtime Subscriptions**

```typescript
// ✅ Suscripción a cambios en tabla
const subscription = supabase
  .channel('stories-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'stories',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Story changed:', payload);
  })
  .subscribe();

// ✅ Cleanup
onUnmounted(() => {
  subscription.unsubscribe();
});
```

### **Storage Operations**

```typescript
// ✅ Upload audio file
const { data, error } = await supabase.storage
  .from('audio-files')
  .upload(`${storyId}/narration.mp3`, audioBlob, {
    contentType: 'audio/mpeg',
    cacheControl: '3600',
    upsert: true
  });

// ✅ Get signed URL
const { data: { signedUrl } } = await supabase.storage
  .from('audio-files')
  .createSignedUrl(`${storyId}/narration.mp3`, 60 * 60); // 1 hora
```

## 📊 Monitoring y Debugging

### **Error Handling**

```typescript
// ✅ Structured error handling
const handleSupabaseError = (error: any) => {
  if (error.code === 'PGRST116') {
    // No rows found
    return null;
  }
  
  if (error.message?.includes('JWT')) {
    // Auth error
    throw new Error('Sesión expirada');
  }
  
  // Log error for monitoring
  console.error('Supabase Error:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
  
  throw error;
};
```

### **Performance Monitoring**

```typescript
// ✅ Query performance tracking
const trackQuery = async (operation: string, query: Promise<any>) => {
  const start = performance.now();
  
  try {
    const result = await query;
    const duration = performance.now() - start;
    
    console.log(`✅ ${operation}: ${duration.toFixed(2)}ms`);
    return result;
    
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`❌ ${operation}: ${duration.toFixed(2)}ms - Error:`, error);
    throw error;
  }
};

// Uso
const stories = await trackQuery('Fetch Stories', 
  supabase.from('stories').select('*').eq('user_id', userId)
);
```

---

## 📚 Referencias Adicionales

- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)  
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

**✅ Configuración Supabase Completa**

Esta configuración proporciona una base sólida para:
- **Type Safety**: Tipos automáticos desde BD
- **Authentication**: Gestión completa de usuarios
- **Realtime**: Sincronización en tiempo real
- **Security**: RLS y validaciones apropiadas
- **Performance**: Optimizaciones y monitoring