# 📘 Guía Completa de Comandos Supabase CLI

## 🎯 Índice

- [🏠 Comandos de Desarrollo Local](#-comandos-de-desarrollo-local)
- [📊 Comandos de Estado y Monitoreo](#-comandos-de-estado-y-monitoreo)
- [🔄 Comandos de Migraciones](#-comandos-de-migraciones)
- [☁️ Comandos de Sincronización Remota](#️-comandos-de-sincronización-remota)
- [💾 Comandos de Backup y Restauración](#-comandos-de-backup-y-restauración)
- [🏗️ Comandos de Configuración y Setup](#️-comandos-de-configuración-y-setup)
- [⚠️ Comandos PELIGROSOS](#️-comandos-peligrosos)
- [🔄 Flujo de Trabajo Recomendado](#-flujo-de-trabajo-recomendado)
- [🚨 Casos de Emergencia](#-casos-de-emergencia)

---

## 🏠 Comandos de Desarrollo Local

### `supabase start`
**Qué hace:** Inicia todos los servicios de Supabase localmente (PostgreSQL, API, Auth, Storage, Studio)  
**Afecta:** Solo entorno local  
**Peligros:** ⚡ Mínimo - Consume recursos del sistema  
**Uso diario:** ⭐⭐⭐⭐⭐ (Comando más usado)

```bash
supabase start
# Inicia: API (54321), DB (54322), Studio (54323), Inbucket (54324)
```

**Cuándo usar:**
- Al iniciar desarrollo cada día
- Después de reiniciar el ordenador
- Cuando necesites trabajar offline

**Scripts npm equivalentes:**
```bash
npm run supabase:start
```

---

### `supabase stop`
**Qué hace:** Detiene todos los servicios locales de Supabase  
**Afecta:** Solo entorno local  
**Peligros:** ⚡ Ninguno - Datos locales se mantienen  
**Uso diario:** ⭐⭐⭐⭐ (Comando frecuente)

```bash
supabase stop
# Para todos los contenedores Docker de Supabase
```

**Cuándo usar:**
- Al terminar el día de desarrollo
- Para liberar recursos del sistema
- Antes de reiniciar servicios

**Scripts npm equivalentes:**
```bash
npm run supabase:stop
```

---

## 📊 Comandos de Estado y Monitoreo

### `supabase status`
**Qué hace:** Muestra el estado de servicios locales y URLs de conexión  
**Afecta:** Solo lectura - no modifica nada  
**Peligros:** ⚡ Ninguno - Solo consulta  
**Uso diario:** ⭐⭐⭐⭐ (Para verificar estado)

```bash
supabase status
# Muestra:
# - Estado de servicios (corriendo/parado)
# - URLs de conexión
# - Claves JWT y anon key locales
```

**Cuándo usar:**
- Para verificar si los servicios están corriendo
- Para obtener URLs de conexión local
- Para copiar claves de desarrollo

**Scripts npm equivalentes:**
```bash
npm run supabase:status
```

---

### `supabase projects list`
**Qué hace:** Lista todos los proyectos Supabase remotos de tu cuenta  
**Afecta:** Solo consulta remota  
**Peligros:** ⚡ Ninguno - Solo lectura  
**Uso diario:** ⭐⭐ (Ocasional)

```bash
supabase projects list
# Muestra tabla con:
# - LINKED (●) - Proyecto actual vinculado
# - ORG ID - ID de la organización
# - REFERENCE ID - ID único del proyecto
# - NAME - Nombre del proyecto
# - REGION - Región del servidor
# - CREATED AT - Fecha de creación
```

**Cuándo usar:**
- Para verificar a qué proyecto estás conectado
- Para cambiar de proyecto
- Para ver todos tus proyectos disponibles

---

## 🔄 Comandos de Migraciones

### `supabase migration new <nombre>`
**Qué hace:** Crea un nuevo archivo de migración SQL  
**Afecta:** Solo archivo local - no ejecuta nada  
**Peligros:** ⚡ Ninguno - Solo crea archivo  
**Uso diario:** ⭐⭐⭐⭐ (Para cambios de schema)

```bash
supabase migration new add_user_preferences
# Crea: supabase/migrations/20250829123456_add_user_preferences.sql
```

**Nomenclatura recomendada:**
- `add_` para nuevas tablas/columnas
- `update_` para modificaciones
- `fix_` para correcciones
- `remove_` para eliminaciones

**Cuándo usar:**
- Antes de cualquier cambio de schema
- Para crear nuevas tablas
- Para modificar estructura existente

**Scripts npm equivalentes:**
```bash
npm run supabase:migration:new -- add_user_preferences
```

---

### `supabase migration list`
**Qué hace:** Lista migraciones aplicadas localmente  
**Afecta:** Solo consulta local  
**Peligros:** ⚡ Ninguno - Solo lectura  
**Uso diario:** ⭐⭐⭐ (Para verificar estado)

```bash
supabase migration list --local
# Muestra migraciones aplicadas en la DB local

supabase migration list --linked
# Muestra comparación Local vs Remote
```

**Interpretación del output:**
```
   Local          | Remote         | Time (UTC)          
  ----------------|----------------|---------------------
   20250828081235 | 20250828081235 | 2025-08-28 08:12:35 ✅ Sincronizado
   20250829123456 |                | 2025-08-29 12:34:56 ❌ Falta en remoto
```

**Scripts npm equivalentes:**
```bash
npm run supabase:migration:list  # Equivalent to --linked
```

---

## ☁️ Comandos de Sincronización Remota

### `supabase db push`
**Qué hace:** Aplica migraciones locales pendientes al proyecto remoto  
**Afecta:** ⚠️ BASE DE DATOS REMOTA (PRODUCCIÓN)  
**Peligros:** 🔴 ALTO - Modifica producción irreversiblemente  
**Uso diario:** ⭐⭐ (Solo cuando estés seguro)

```bash
supabase db push
# Aplica TODAS las migraciones locales que falten en remoto
```

**⚠️ PRECAUCIONES CRÍTICAS:**
- Siempre hacer backup antes: `supabase db dump > backup.sql`
- Verificar migraciones con `supabase migration list --linked`
- Probar cambios localmente primero
- No usar si hay usuarios activos sin mantenimiento programado

**Cuándo usar:**
- Después de probar exhaustivamente en local
- Durante ventanas de mantenimiento
- Con backup confirmado

**Scripts npm equivalentes:**
```bash
npm run supabase:push
```

---

### `supabase db pull`
**Qué hace:** Extrae el esquema remoto y crea migraciones locales  
**Afecta:** ⚠️ Archivos de migraciones locales  
**Peligros:** 🟡 MEDIO - Puede sobrescribir migraciones locales  
**Uso diario:** ⭐ (Rara vez necesario)

```bash
supabase db pull
# Genera migraciones basadas en diferencias remoto vs local
```

**⚠️ PRECAUCIONES:**
- Puede generar migraciones conflictivas
- Revisar siempre los archivos generados
- Hacer commit antes de ejecutar

**Cuándo usar:**
- Cuando alguien más hizo cambios en remoto
- Para sincronizar después de cambios manuales en Dashboard
- En proyectos colaborativos

---

## 💾 Comandos de Backup y Restauración

### `supabase db dump`
**Qué hace:** Exporta la base de datos completa a un archivo SQL  
**Afecta:** Solo crea archivo - no modifica BDs  
**Peligros:** ⚡ Ninguno - Solo exportación  
**Uso diario:** ⭐⭐⭐ (Para backups regulares)

```bash
# Backup de base de datos remota (RECOMENDADO)
supabase db dump > backup_remoto_$(date +%Y%m%d_%H%M%S).sql

# Backup de base de datos local
supabase db dump --local > backup_local.sql

# Solo datos (sin schema)
supabase db dump --data-only > solo_datos.sql

# Solo schema (sin datos)
supabase db dump --schema-only > solo_schema.sql
```

**Mejores prácticas:**
- Usar timestamp en nombre de archivo
- Backup antes de cualquier `db push`
- Guardar backups en carpeta `supabase/backups/`

**Scripts npm equivalentes:**
```bash
npm run supabase:dump:remote   # Para remoto
npm run supabase:dump:local    # Para local
```

---

## 🏗️ Comandos de Configuración y Setup

### `supabase init`
**Qué hace:** Inicializa configuración de Supabase en el proyecto  
**Afecta:** Solo archivos locales del proyecto  
**Peligros:** ⚡ Ninguno - Solo crea configuración  
**Uso diario:** ⭐ (Una sola vez por proyecto)

```bash
supabase init
# Crea:
# - supabase/config.toml
# - supabase/migrations/
# - supabase/.gitignore
```

**Cuándo usar:**
- Al configurar Supabase en un proyecto nuevo
- Solo una vez por proyecto

---

### `supabase link`
**Qué hace:** Vincula el proyecto local con un proyecto remoto  
**Afecta:** Configuración local del proyecto  
**Peligros:** 🟡 MEDIO - Puede cambiar proyecto de destino  
**Uso diario:** ⭐ (Una vez por proyecto)

```bash
supabase link --project-ref gsmxqozuihsyuiaboqqk
# Vincula con el proyecto remoto específico
```

**⚠️ PRECAUCIÓN:**
- Verifica el project-ref correcto
- Una vez vinculado, todos los comandos `--linked` afectarán este proyecto

---

### `supabase gen types`
**Qué hace:** Genera tipos TypeScript basados en el esquema de la BD  
**Afecta:** Solo archivo de tipos local  
**Peligros:** ⚡ Ninguno - Solo genera código  
**Uso diario:** ⭐⭐⭐ (Después de cambios de schema)

```bash
# Generar tipos del proyecto remoto (RECOMENDADO)
supabase gen types typescript --linked > src/types/supabase.ts

# Generar tipos de la base local
supabase gen types typescript --local > src/types/supabase-local.ts
```

**Cuándo usar:**
- Después de cualquier migración aplicada
- Cuando cambies el schema
- Para mantener tipos actualizados

**Scripts npm equivalentes:**
```bash
npm run supabase:types
```

---

## ⚠️ Comandos PELIGROSOS

### `supabase db reset`
**Qué hace:** Elimina TODA la base de datos local y la recrea aplicando todas las migraciones  
**Afecta:** 🔴 DESTRUYE todos los datos locales  
**Peligros:** 🔴 ALTO - Pérdida total de datos locales  
**Uso diario:** ⭐⭐⭐⭐ (Comando más usado para desarrollo)

```bash
# Reset base de datos LOCAL (seguro para desarrollo)
supabase db reset

# Reset base de datos REMOTA (¡¡¡PELIGROSO!!!)
supabase db reset --linked
```

**⚠️ DIFERENCIAS CRÍTICAS:**
- `supabase db reset` → Solo afecta LOCAL ✅ Seguro
- `supabase db reset --linked` → Afecta REMOTO ❌ Peligroso

**Para desarrollo local (seguro):**
```bash
supabase db reset  # Recrea DB local limpia con todas las migraciones
```

**Para reset remoto (peligroso):**
```bash
# ¡¡¡SOLO en caso de emergencia!!!
supabase db dump > emergency_backup.sql  # BACKUP PRIMERO
supabase db reset --linked  # Destruye PRODUCCIÓN
```

**Scripts npm equivalentes:**
```bash
npm run supabase:reset          # LOCAL (seguro)
npm run supabase:reset:remote   # REMOTO (peligroso)
```

---

### `supabase projects delete`
**Qué hace:** Elimina completamente un proyecto de Supabase  
**Afecta:** 🔴 DESTRUYE proyecto completo en la nube  
**Peligros:** 🔴 EXTREMO - Pérdida total e irreversible  
**Uso diario:** ⭐ (Nunca, salvo emergencia)

```bash
supabase projects delete <project-id>
# ¡¡¡ELIMINA TODO EL PROYECTO PARA SIEMPRE!!!
```

**⚠️ NUNCA USAR SALVO:**
- Proyecto de prueba que quieres eliminar
- Error grave que requiere empezar de cero
- Con autorización expresa del equipo

---

## 🔄 Flujo de Trabajo Recomendado

### 📅 Flujo Diario de Desarrollo

```bash
# 🌅 INICIO DEL DÍA
# 1. Iniciar servicios locales
supabase start                    # o npm run supabase:start
npm run dev                       # Iniciar aplicación

# 2. Verificar estado
supabase status                   # o npm run supabase:status

# 💻 DURANTE EL DESARROLLO
# 3. Si necesitas cambios de schema
supabase migration new add_feature  # o npm run supabase:migration:new
# Editar archivo SQL creado

# 4. Aplicar cambios localmente
supabase db reset                 # o npm run supabase:reset

# 5. Probar aplicación
npm run dev                       # Verificar que todo funciona

# 🌅 FIN DEL DÍA (opcional)
supabase stop                     # o npm run supabase:stop
```

---

### 🚀 Flujo de Despliegue a Producción

```bash
# ⚠️ SOLO CUANDO ESTÉ TODO PROBADO LOCALMENTE

# 1. Verificar estado de migraciones
supabase migration list --linked  # o npm run supabase:migration:list

# 2. Backup de seguridad (OBLIGATORIO)
supabase db dump > supabase/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Aplicar migraciones a producción
supabase db push                  # o npm run supabase:push

# 4. Verificar que se aplicó correctamente
supabase migration list --linked  # Verificar sincronización

# 5. Actualizar tipos TypeScript
supabase gen types typescript --linked > src/types/supabase.ts
# o npm run supabase:types

# 6. Commit cambios
git add .
git commit -m "feat: aplicar migración X a producción"
git push
```

---

### 🔧 Flujo para Nuevo Proyecto

```bash
# 1. Inicializar Supabase
supabase init

# 2. Vincular con proyecto remoto
supabase link --project-ref tu-project-id

# 3. Si existe schema remoto, traerlo
supabase db pull                  # Solo si hay datos remotos

# 4. Iniciar desarrollo local
supabase start
npm run dev

# 5. Crear primera migración
supabase migration new initial_setup
# Editar archivo SQL

# 6. Aplicar localmente
supabase db reset

# 7. Cuando esté listo, aplicar a remoto
supabase db push
```

---

## 🚨 Casos de Emergencia

### 🆘 "¡Rompí la base de datos remota!"

```bash
# 1. ¡NO PANIC!
# 2. Si tienes backup reciente
psql "postgresql://postgres:tu-password@db.proyecto.supabase.co:5432/postgres" < backup.sql

# 3. Si no tienes backup pero tienes migraciones
supabase db reset --linked        # ¡¡¡Después de confirmar que tienes migraciones!!!
```

### 🆘 "Las migraciones están desincronizadas"

```bash
# 1. Hacer backup
supabase db dump > emergency_backup.sql

# 2. Reset total y reconstruir
supabase db reset --linked

# 3. Verificar sincronización
supabase migration list --linked
```

### 🆘 "No puedo conectar con el proyecto remoto"

```bash
# 1. Verificar proyectos disponibles
supabase projects list

# 2. Verificar vinculación
cat .git/config | grep supabase     # Ver configuración

# 3. Re-vincular si es necesario
supabase link --project-ref tu-project-id
```

### 🆘 "Los servicios locales no arrancan"

```bash
# 1. Parar todo
supabase stop

# 2. Limpiar contenedores Docker
docker system prune -f

# 3. Reiniciar
supabase start
```

---

## 📋 Comandos por Frecuencia de Uso

### ⭐⭐⭐⭐⭐ Uso Diario
```bash
supabase start                    # Iniciar día
supabase status                   # Verificar estado
supabase db reset                 # Aplicar cambios locales
supabase migration new            # Crear cambios
```

### ⭐⭐⭐⭐ Uso Frecuente
```bash
supabase stop                     # Parar servicios
supabase migration list --linked # Verificar migraciones
supabase gen types typescript    # Actualizar tipos
```

### ⭐⭐⭐ Uso Semanal
```bash
supabase db dump                 # Backups regulares
supabase db push                 # Desplegar cambios
```

### ⭐⭐ Uso Ocasional
```bash
supabase projects list           # Ver proyectos
supabase db pull                 # Sincronizar remoto
```

### ⭐ Uso Raro
```bash
supabase init                    # Solo nuevos proyectos
supabase link                    # Solo configuración inicial
supabase db reset --linked      # Solo emergencias
```

---

## 🎯 Comandos Esenciales de Memoria

**Para desarrollo diario:**
```bash
supabase start && npm run dev
supabase migration new nombre
supabase db reset
```

**Para despliegue:**
```bash
supabase db dump > backup.sql
supabase db push
supabase migration list --linked
```

**Para emergencias:**
```bash
supabase db dump > emergency_backup.sql
supabase db reset --linked
```

---

## 🔗 Scripts NPM Recomendados

Tu `package.json` ya incluye estos scripts útiles:

```json
{
  "scripts": {
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop", 
    "supabase:status": "supabase status",
    "supabase:reset": "supabase db reset",
    "supabase:reset:remote": "supabase db reset --linked",
    "supabase:push": "supabase db push",
    "supabase:migration:new": "supabase migration new",
    "supabase:migration:list": "supabase migration list --linked",
    "supabase:types": "supabase gen types typescript --linked > src/types/supabase.ts",
    "supabase:dump:remote": "supabase db dump > supabase/backups/backup_$(date +%Y%m%d_%H%M%S).sql",
    "supabase:dump:local": "supabase db dump --local > supabase/backups/backup_local_$(date +%Y%m%d_%H%M%S).sql"
  }
}
```

---

**💡 Recordatorio Final:** En caso de duda, siempre hacer backup primero con `supabase db dump`
