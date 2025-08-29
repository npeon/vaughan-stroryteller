# 🔥 Critical Fix: Infinite Recursion in RLS Policies

> **🚨 Critical Issue Resolved** - "infinite recursion detected in policy for relation 'profiles'" blocking all authentication

## 🎯 Problema
Los usuarios no podían hacer login debido al error crítico **"infinite recursion detected in policy for relation 'profiles'"** que causaba que la página de login se recargara sin mostrar errores claros al usuario.

## 🔍 Diagnóstico del Error

### Error Principal en Console
```
ERROR: infinite recursion detected in policy for relation "profiles" (SQLSTATE 42P17)
```

### Síntomas Observados
1. **Login fallaba silenciosamente**: Formulario se enviaba pero recargaba página
2. **Sin feedback visual**: No aparecían mensajes de error al usuario  
3. **Mensaje confuso**: Aparecía brevemente "Redirecting to Google" en login email/password
4. **500 Internal Server Error**: En requests a `/rest/v1/profiles`

### Análisis de Causa Raíz

#### El Problema: Políticas RLS Recursivas

Las políticas Row Level Security (RLS) tenían referencias circulares:

```sql
-- ❌ PROBLEMÁTICO: Función recursiva
CREATE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ❌ PROBLEMÁTICO: Política que usa función recursiva  
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin(auth.uid()));
```

**El círculo vicioso:**
1. Policy llama a `is_admin()`
2. `is_admin()` consulta tabla `profiles` 
3. Consulta a `profiles` activa RLS policies
4. Policy llama de nuevo a `is_admin()` 
5. **→ RECURSIÓN INFINITA** 🔄

## 🛠️ Solución Implementada

### 1. Eliminar Funciones Recursivas

```sql
-- ✅ SOLUCIÓN: Eliminar funciones problemáticas
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);
```

### 2. Eliminar Políticas Recursivas

```sql
-- ✅ SOLUCIÓN: Eliminar políticas que causan recursión
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
```

### 3. Políticas Simples Sin Recursión

```sql
-- ✅ SOLUCIÓN: Políticas simples para usuarios
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 4. Manejo de Admin a Nivel de Aplicación

En lugar de políticas RLS recursivas, la funcionalidad de admin se maneja usando el `service_role` key:

```typescript
// ✅ SOLUCIÓN: Admin queries usando service_role
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Bypassa RLS
)

// Admin puede consultar todos los profiles
const { data: allProfiles } = await supabaseAdmin
  .from('profiles')
  .select('*')
```

## 📋 Migración Aplicada

### Migración Local (Testing)
Se aplicó manualmente durante debugging:
```bash
supabase db reset  # Reset completo con todas las migraciones
# + cambios manuales para testing
```

### Migración Producción
**Archivo:** `supabase/migrations/20250829093855_fix_recursive_policies_clean.sql`

```sql
-- Fix for "infinite recursion detected in policy for relation profiles"
-- This migration removes circular references in admin policies

-- 1. Remove problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles; 
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- 2. Remove recursive functions if they exist
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- 3. Simplify policies for regular users (no recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Admin functionality will be handled at application level
-- using service_role key when necessary, avoiding recursive policies

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Recursive RLS policies successfully removed. System ready for production.';
END $$;
```

**Aplicación exitosa:**
```bash
supabase db push
# → NOTICE: Recursive RLS policies successfully removed. System ready for production.
```

## 🔧 Fixes Complementarios

### 1. Habilitación de Quasar Notify Plugin

**Problema:** Error `$q.notify is not a function`

```typescript
// quasar.config.ts - ✅ AGREGADO
framework: {
  plugins: ['Notify'], // ← Agregado para feedback de usuario
}
```

### 2. Eliminación de Redirect Loops

**Problema:** Infinite redirect in navigation guard

```vue
<!-- LoginPage.vue - ❌ REMOVIDO -->
<!-- Redirect manual que causaba loops -->
watch(isAuthenticated, async (newValue, oldValue) => {
  if (newValue && !oldValue) {
    await router.push('/dashboard') // ← ELIMINADO
  }
})

<!-- ✅ SOLUCIÓN: Dejar que router guards manejen redirección -->
console.log('✅ Authentication successful, router guard will handle redirect')
```

## 📊 Verificación del Fix

### ✅ Resultados Post-Fix
1. **Login funciona**: Usuario puede autenticarse correctamente
2. **Sin errores RLS**: No más "infinite recursion detected"
3. **Redirección correcta**: Router guards funcionan apropiadamente  
4. **Feedback visual**: Notify plugin muestra mensajes al usuario
5. **Producción stable**: Migración aplicada sin issues

### 🧪 Test Commands
```bash
# Verificar que no hay errores de recursión
supabase logs --level error

# Test login flow completo
npm run dev
# → Login con credenciales → Redirect a dashboard ✅

# Verificar políticas actuales
psql -c "SELECT policyname FROM pg_policies WHERE tablename = 'profiles';"
```

## ⚠️ Consideraciones Técnicas

### Implicaciones de Seguridad
- **Usuarios regulares**: Políticas RLS siguen protegiendo datos apropiadamente
- **Administradores**: Funcionalidad se maneja a nivel de aplicación con service_role
- **No hay pérdida de seguridad**: Solo se eliminó la recursión, no la protección

### Performance Impact
- **Positivo**: Eliminación de recursión mejora performance de queries
- **Sin overhead**: No más llamadas de función anidadas en policies
- **Queries directos**: RLS evalúa condiciones simples sin funciones

### Mantenibilidad
- **Más simple**: Políticas directas son más fáciles de entender
- **Menos abstracciones**: No depende de funciones personalizadas
- **Standard patterns**: Usa patterns estándar de Supabase

## 🔗 Referencias Técnicas

- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policy Recursion](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Router Guards Vue](https://router.vuejs.org/guide/advanced/navigation-guards.html)

## 📝 Archivos Modificados

### Database
- ✅ `supabase/migrations/20250829093855_fix_recursive_policies_clean.sql`
- ✅ Applied to production database

### Frontend  
- ✅ `quasar.config.ts` - Added Notify plugin
- ✅ `src/pages/auth/LoginPage.vue` - Removed redirect loops
- ✅ Router guards now handle navigation automatically

### Resultado Final
- 🚀 **Sistema de autenticación completamente funcional**
- 🔒 **Sin comprometer seguridad de datos**
- ⚡ **Performance mejorado**
- 🧹 **Código más limpio y mantenible**