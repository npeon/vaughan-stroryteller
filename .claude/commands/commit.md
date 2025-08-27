---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*)
description: Analiza cambios pendientes y genera commit automático inteligente
argument-hint: [mensaje opcional]
model: claude-3-5-sonnet-20241022
---

# Análisis de Cambios Pendientes en Git

## Estado Actual del Repositorio

### Status General

!`git status --porcelain`

### Archivos Modificados (Staged)

!`git diff --cached --name-only`

### Archivos Modificados (Unstaged)

!`git diff --name-only`

### Cambios Detallados (Staged)

!`git diff --cached --stat`

### Cambios Detallados (Unstaged)

!`git diff --stat`

## Tarea

Basándote en el análisis anterior, realiza las siguientes acciones:

1. **Añadir archivos al staging**: Ejecuta `git add` para todos los archivos relevantes (evita archivos temporales, logs, node_modules, etc.)

2. **Generar mensaje de commit**: Crea un mensaje de commit siguiendo el formato conventional commits:

   - `feat(scope): descripción` para nuevas características
   - `fix(scope): descripción` para corrección de errores
   - `docs(scope): descripción` para documentación
   - `style(scope): descripción` para cambios de formato
   - `refactor(scope): descripción` para refactoring
   - `test(scope): descripción` para tests
   - `chore(scope): descripción` para tareas de mantenimiento

3. **Ejecutar commit**: Ejecuta el comando `git commit` con el mensaje generado

### Consideraciones especiales:

- Si hay archivos tanto staged como unstaged, pregunta qué hacer
- Si el argumento $ARGUMENTS está presente, úsalo como contexto adicional para el mensaje
- Genera mensajes descriptivos pero concisos
- Considera el contexto del proyecto Oxford Tests Platform
- Si hay conflictos o problemas, explica cómo resolverlos

### Contexto del Proyecto:

Este es un proyecto de plataforma de tests de inglés usando Nuxt 3, Vue 3, TypeScript y Supabase.

Argumentos adicionales: $ARGUMENTS
