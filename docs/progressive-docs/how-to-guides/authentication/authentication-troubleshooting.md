# 🔧 Solución de Problemas de Autenticación y Redirección

## 🎯 Problema
Después del login exitoso, los usuarios se quedaban en la página de login en lugar de ser redirigidos al dashboard, mostrando errores 406 de Supabase relacionados con perfiles de usuario.

## 💡 Diagnóstico del Problema

### Error Principal Identificado
```
❌ Error loading profile: Object
code: "PGRST116"
details: "The result contains 0 rows"
message: "Cannot coerce the result to a single JSON object"
```

### Causa Raíz
1. **Login funcionaba**: Supabase Auth autenticaba correctamente
2. **Profile fallaba**: No existía registro en tabla `profiles` para el usuario
3. **isAuthenticated = false**: El composable requería tanto `user` como `profile`
4. **Router guard bloqueaba**: Detectaba `!isAuthenticated` y mantenía al usuario en login

## 🛠️ Solución Implementada

### 1. Corrección de Lógica de Autenticación

**Problema Original:**
```typescript
// ❌ ANTES: Requería profile obligatoriamente
const isAuthenticated = computed(() => !!state.user && !!state.session && !!state.profile)
```

**Solución:**
```typescript
// ✅ AHORA: Solo requiere user y session
const isAuthenticated = computed(() => !!state.user && !!state.session)
const hasProfile = computed(() => !!state.profile)
```

### 2. Manejo Inteligente de Errores de Profile

```typescript
const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Error loading profile:', error)
      
      // Si el error es que no existe el perfil, intentar crearlo
      if (error.code === 'PGRST116') {
        console.log('⚠️ Profile not found, attempting to create one...')
        return await createUserProfile(userId)
      }
      return null
    }

    state.profile = profile
    return profile
  } catch (error) {
    console.error('❌ Profile fetch error:', error)
    return null
  }
}
```

### 3. Creación Automática de Profile

```typescript
const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return null

    const profileData = {
      id: userId,
      full_name: user.user.user_metadata?.full_name || user.user.email?.split('@')[0] || 'User',
      email: user.user.email,
      cefr_level: 'A1', // Nivel por defecto
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating profile:', error)
      return null
    }

    console.log('✅ Profile created successfully:', newProfile)
    state.profile = newProfile
    return newProfile
  } catch (error) {
    console.error('❌ Profile creation error:', error)
    return null
  }
}
```

### 4. Redirección Reactiva Optimizada

```typescript
// En LoginPage.vue
import { nextTick, watch } from 'vue'

// Redirección automática cuando el usuario se autentica
watch(isAuthenticated, async (newValue, oldValue) => {
  // Solo redirigir si cambió de false a true (evitar loops)
  if (newValue && !oldValue) {
    console.log('🔄 Authentication state changed, redirecting...')
    await nextTick()
    await router.push('/dashboard')
  }
}, { immediate: false })
```

### 5. Logging Detallado para Debugging

```typescript
// En router guards
console.log(`🔐 Auth check - User: ${!!user.value}, Session: ${!!session.value}, Profile: ${!!profile.value}`)
console.log(`🔐 Auth state - Authenticated: ${isAuthenticated.value}`)
```

## 📊 Flujo Corregido

### ANTES (Problema)
1. Login exitoso → User creado ✅
2. Profile falla → Error 406 ❌  
3. isAuthenticated = false ❌
4. Router guard bloquea ❌
5. Usuario se queda en login ❌

### AHORA (Solucionado)
1. Login exitoso → User creado ✅
2. Profile falla → Detectado ✅
3. **Profile se crea automáticamente** ✅
4. **isAuthenticated = true** ✅  
5. **Watcher detecta cambio** ✅
6. **Redirección automática a /dashboard** ✅

## ⚠️ Consideraciones

### Timing y Reactividad
- **nextTick()**: Asegura que el DOM se actualice antes de redirigir
- **Watcher**: Detecta cambios reactivos en el estado de autenticación
- **Doble estrategia**: Redirección inmediata + watcher como fallback

### Manejo de Estados
- **isAuthenticated**: Ahora independiente del perfil
- **hasProfile**: Nueva computed para verificar existencia de perfil
- **Error handling**: Fallbacks robustos para casos edge

### Database Considerations
- **RLS Policies**: Asegurar que las políticas permitan inserción de perfiles
- **Trigger Backup**: Si `handle_new_user()` falla, la creación manual funciona
- **Data Integrity**: Validar que los datos del perfil sean consistentes

## 🧪 Verificación

### Comandos de Testing
```bash
# Verificar build sin errores
npm run build

# Verificar tipos TypeScript
npm run typecheck

# Verificar calidad de código
npm run lint
```

### Test de Flujo Completo
1. **Registro nuevo usuario** → Profile creado automáticamente
2. **Login usuario existente** → Carga profile existente
3. **Login usuario sin profile** → Crea profile automáticamente
4. **Redirección** → Funciona en todos los casos

## 🔗 Referencias

- [Configuración de Supabase Auth](../getting-started/04-supabase-auth-setup.md)
- [Router Guards Configuration](../../reference/configurations/router-config.md)
- [Composables Pattern](../../explanation/architecture-decisions/composables-pattern.md)

## 📝 Archivos Relacionados

- `src/composables/useAuth.ts` - Lógica principal de autenticación
- `src/pages/auth/LoginPage.vue` - Página de login con redirección
- `src/router/index.ts` - Router guards y navegación
- `src/layouts/AuthLayout.vue` - Layout de autenticación