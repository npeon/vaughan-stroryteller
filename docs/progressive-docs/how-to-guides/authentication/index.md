# 🔐 Authentication & Security Guides

Guías prácticas para resolver problemas de autenticación y configurar seguridad en The Vaughan Storyteller.

## 🚨 Critical Issues

### 🔥 [RLS Recursion Fix](./rls-recursion-fix.md)
**Problema crítico resuelto**: "infinite recursion detected in policy for relation 'profiles'"
- ⚠️ **Síntoma**: Login falla silenciosamente, página se recarga sin errores
- 🎯 **Causa**: Políticas RLS recursivas con funciones `is_admin()`
- ✅ **Solución**: Eliminación de funciones recursivas y políticas simples
- 🚀 **Estado**: Completamente resuelto en producción

## 🔧 General Troubleshooting

### 🛠️ [Authentication Troubleshooting](./authentication-troubleshooting.md)
Soluciones para problemas comunes de autenticación y redirección
- Profile creation issues
- Redirect loops
- Router guard problems  
- User session management

## 🎯 Quick Reference

### Common Issues & Solutions
```
🔄 Login page reloads without error     → Check RLS policies recursion
🚫 "Cannot coerce result to single JSON" → Profile creation needed
⚠️ Infinite redirect in navigation     → Remove manual redirects
❌ $q.notify is not a function         → Add Notify plugin to quasar.config
```

### Emergency Commands
```bash
# Check for RLS recursion errors
supabase logs --level error

# Reset local database with all migrations
supabase db reset

# Apply production migration
supabase db push

# Verify authentication flow
npm run dev
```

### Files to Check When Authentication Fails
- `src/composables/useAuth.ts` - Authentication logic
- `src/router/index.ts` - Router guards
- `src/pages/auth/LoginPage.vue` - Login component
- `supabase/migrations/*.sql` - Database policies

## 🔗 Related Documentation

- [Supabase Setup](../../getting-started/02-supabase-setup.md) - Initial configuration
- [Authentication System](../../getting-started/03-authentication-system.md) - System overview
- [Supabase Config Reference](../../reference/configurations/supabase-config.md) - Technical reference