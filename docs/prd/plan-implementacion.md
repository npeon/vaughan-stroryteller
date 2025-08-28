# Plan de Implementación TDD - The Vaughan Storyteller

## 🎯 Seguimiento de Progreso de Desarrollo

Este documento es un checklist ejecutable para realizar el seguimiento del desarrollo de "The Vaughan Storyteller" usando metodología TDD con arquitectura completa Supabase + Vercel + APIs externas.

> **📋 Instrucciones**: Marcar con `[x]` las tareas completadas. Mantener actualizado para seguimiento del progreso.

---

## ⚙️ Fase 0: Setup Foundation

### 🛠️ Configuración Inicial del Entorno TDD con Quasar

- [x] **Task 0.1**: Instalar extensión de testing unitario de Quasar: `quasar ext add @quasar/testing-unit-vitest`
- [x] **Task 0.2**: Instalar extensión de testing E2E de Quasar: `quasar ext add @quasar/testing-e2e-cypress`
- [x] **Task 0.3**: Configurar MSW para API mocking (OpenRouter, ElevenLabs)
- [x] **Task 0.4**: Verificar configuración automática de scripts de testing en package.json
- [x] **Task 0.5**: Crear setup de tests con installQuasarPlugin()
- [x] **Task 0.6**: Verificar integración Quasar + Vitest funcionando
- [x] **Task 0.7**: Configurar comandos custom de Cypress para componentes Quasar
- [x] **Task 0.8**: Verificar funcionamiento de dataCy, selectDate y testRoute commands

### 🗄️ Setup Supabase Backend

- [x] **Task 0.7**: Configurar proyecto Supabase y obtener credentials
- [x] **Task 0.8**: Instalar Supabase CLI y configurar entorno local
- [x] **Task 0.9**: Crear esquema de base de datos con tablas principales
- [x] **Task 0.10**: Crear tablas de administración (ad_banners, user_limits, api_health_checks)
- [x] **Task 0.11**: Configurar Row Level Security (RLS) policies
- [x] **Task 0.12**: Configurar políticas RLS para tablas de administración
- [x] **Task 0.13**: Configurar Supabase Auth con OAuth providers y roles
- [ ] **Task 0.14**: Configurar Supabase Storage para assets

### 🔗 Setup APIs Externas

- [ ] **Task 0.15**: Configurar cuenta OpenRouter y obtener API key
- [ ] **Task 0.16**: Configurar cuenta ElevenLabs y obtener API key
- [ ] **Task 0.17**: Configurar cuenta WordsAPI y obtener API key
- [ ] **Task 0.18**: Configurar cuenta Upstash Redis para rate limiting
- [ ] **Task 0.19**: Configurar variables de entorno para todas las APIs
- [ ] **Task 0.20**: Crear servicios base para cada API externa

### 🚀 Setup Vercel Deployment

- [ ] **Task 0.21**: Conectar repositorio GitHub con Vercel
- [ ] **Task 0.22**: Configurar variables de entorno en Vercel
- [ ] **Task 0.23**: Configurar preview deployments automáticos
- [ ] **Task 0.24**: Configurar dominio customizado y SSL

---

## 📖 Fase 1: Core Story System (Semanas 1-3)

### Sprint 1.1: Modelo de Datos y Tipos (Días 2-4)

- [ ] **Task 1.1.1**: Definir interfaces TypeScript para Story, User Profile, Vocabulary
- [ ] **Task 1.1.2**: Crear tipos CEFRLevel y StoryGenre
- [ ] **Task 1.1.3**: Implementar utilidades de validación de historias
- [ ] **Task 1.1.4**: Tests para validación de estructura de historias
- [ ] **Task 1.1.5**: Tests para cálculo de tiempo de lectura
- [ ] **Task 1.1.6**: Tests para extracción de vocabulario
- [ ] **Task 1.1.7**: Implementar modelos de datos Supabase-compatible

### Sprint 1.2: Story Service con OpenRouter (Días 5-8)

- [ ] **Task 1.2.1**: Implementar OpenRouterClient con múltiples modelos
- [ ] **Task 1.2.2**: Crear StoryGenerator service con fallback strategy
- [ ] **Task 1.2.3**: Implementar rate limiting con Redis para OpenRouter
- [ ] **Task 1.2.4**: Tests para generación de historias por nivel CEFR
- [ ] **Task 1.2.5**: Tests para sistema de fallback de modelos AI
- [ ] **Task 1.2.6**: Implementar StoryRepository con Supabase client
- [ ] **Task 1.2.7**: Tests para almacenamiento de historias en Supabase
- [ ] **Task 1.2.8**: Crear Story Store (Pinia) con estado Supabase
- [ ] **Task 1.2.9**: Tests para carga de historias desde base de datos
- [ ] **Task 1.2.10**: Tests para tracking de progreso de lectura

### Sprint 1.3: Story Reader Component con Audio (Días 9-14)

- [ ] **Task 1.3.1**: Crear componente StoryReader básico
- [ ] **Task 1.3.2**: Implementar renderizado de título y contenido
- [ ] **Task 1.3.3**: Implementar barra de progreso de lectura con persistencia
- [ ] **Task 1.3.4**: Tests para renderizado de contenido de historia
- [ ] **Task 1.3.5**: Tests para actualización de progreso en Supabase
- [ ] **Task 1.3.6**: Implementar selección interactiva de palabras
- [ ] **Task 1.3.7**: Tests para highlight de palabras clickeadas
- [ ] **Task 1.3.8**: Integrar ElevenLabs TTS para narración de historias
- [ ] **Task 1.3.9**: Crear componente AudioPlayer para reproducción
- [ ] **Task 1.3.10**: Tests para generación y reproducción de audio
- [ ] **Task 1.3.11**: Implementar caché de audio en Supabase Storage

---

## 📚 Fase 2: Vocabulary System con WordsAPI (Semanas 4-6)

### Sprint 2.1: Word Bank Management con WordsAPI (Días 15-21)

- [ ] **Task 2.1.1**: Implementar WordsAPI client para definiciones
- [ ] **Task 2.1.2**: Crear DictionaryService con pronunciación y etimología
- [ ] **Task 2.1.3**: Definir interfaces para VocabularyWord con datos WordsAPI
- [ ] **Task 2.1.4**: Tests para obtención de definiciones desde WordsAPI
- [ ] **Task 2.1.5**: Tests para creación correcta de palabras de vocabulario
- [ ] **Task 2.1.6**: Implementar VocabularyStorage service con Supabase
- [ ] **Task 2.1.7**: Tests para guardado de palabras en base de datos
- [ ] **Task 2.1.8**: Tests para recuperación de palabras para revisión
- [ ] **Task 2.1.9**: Crear componente WordBank con datos de Supabase
- [ ] **Task 2.1.10**: Tests para visualización de palabras guardadas
- [ ] **Task 2.1.11**: Tests para filtrado de palabras por estatus
- [ ] **Task 2.1.12**: Implementar rate limiting para WordsAPI

### Sprint 2.2: Spaced Repetition System (Días 22-28)

- [ ] **Task 2.2.1**: Implementar algoritmo de repetición espaciada
- [ ] **Task 2.2.2**: Tests para cálculo de próxima fecha de revisión
- [ ] **Task 2.2.3**: Tests para ajuste de dificultad basado en rendimiento
- [ ] **Task 2.2.4**: Crear componente Flashcard con datos WordsAPI
- [ ] **Task 2.2.5**: Tests para mostrar palabra al frente, definición atrás
- [ ] **Task 2.2.6**: Tests para emisión de rating de confianza
- [ ] **Task 2.2.7**: Integrar sistema de revisión con Supabase storage
- [ ] **Task 2.2.8**: Tests para actualización de progreso en base de datos
- [ ] **Task 2.2.9**: Implementar notificaciones push para recordatorios
- [ ] **Task 2.2.10**: Tests para scheduling de palabras por revisar

---

## 🛡️ Fase 3: Panel de Administrador (Semana 7)

### Sprint 3.1: Sistema de Administración (Días 29-35)

- [ ] **Task 3.1.1**: Crear middleware de autorización para administradores
- [ ] **Task 3.1.2**: Tests para verificación de rol de administrador
- [ ] **Task 3.1.3**: Implementar AdminService para test de conectividad APIs
- [ ] **Task 3.1.4**: Tests para verificación de conexión OpenRouter
- [ ] **Task 3.1.5**: Tests para verificación de conexión ElevenLabs
- [ ] **Task 3.1.6**: Crear Edge Function admin-panel
- [ ] **Task 3.1.7**: Tests para Edge Function de administración
- [ ] **Task 3.1.8**: Implementar sistema de gestión de banners publicitarios
- [ ] **Task 3.1.9**: Tests para creación y activación de banners
- [ ] **Task 3.1.10**: Tests para desactivación de banners
- [ ] **Task 3.1.11**: Implementar sistema de límites de historias por usuario
- [ ] **Task 3.1.12**: Tests para configuración de límites de usuario
- [ ] **Task 3.1.13**: Tests para validación de límites en generación de historias
- [ ] **Task 3.1.14**: Crear componente AdminDashboard
- [ ] **Task 3.1.15**: Tests para renderizado de dashboard de administrador
- [ ] **Task 3.1.16**: Implementar componente BannerManager con CRUD
- [ ] **Task 3.1.17**: Tests para gestión de banners desde UI
- [ ] **Task 3.1.18**: Crear componente UserLimitManager
- [ ] **Task 3.1.19**: Tests para configuración de límites desde UI
- [ ] **Task 3.1.20**: Implementar visualización de banners para usuarios
- [ ] **Task 3.1.21**: Tests para mostrar banners activos en historias

---

## 🔧 Fase 4: Edge Functions y Serverless (Semanas 8-10)

### Sprint 4.1: Supabase Edge Functions (Días 36-42)

- [ ] **Task 4.1.1**: Crear Edge Function para generación de historias con límites
- [ ] **Task 4.1.2**: Implementar Edge Function para audio generation
- [ ] **Task 4.1.3**: Crear Edge Function para word lookup con WordsAPI
- [ ] **Task 4.1.4**: Tests para Edge Functions con Deno testing
- [ ] **Task 4.1.5**: Tests para validación de límites en Edge Functions
- [ ] **Task 4.1.6**: Implementar rate limiting distribuido en Edge Functions
- [ ] **Task 4.1.7**: Tests para quotas y rate limiting por usuario
- [ ] **Task 4.1.8**: Deploy de Edge Functions en Supabase (incluyendo admin-panel)
- [ ] **Task 4.1.9**: Tests de integración con funciones desplegadas
- [ ] **Task 4.1.10**: Configurar monitoring y alertas para Edge Functions
- [ ] **Task 4.1.11**: Tests para manejo de errores y fallbacks

### Sprint 4.2: PWA y Offline Functionality (Días 43-49)

- [ ] **Task 4.2.1**: Configurar Service Worker para PWA con Quasar
- [ ] **Task 4.2.2**: Implementar estrategia de caché para recursos estáticos
- [ ] **Task 4.2.3**: Configurar IndexedDB para datos offline
- [ ] **Task 4.2.4**: Tests E2E con Cypress para cache de recursos esenciales
- [ ] **Task 4.2.5**: Tests E2E con Cypress para funcionamiento offline
- [ ] **Task 4.2.6**: Implementar cola de sincronización offline
- [ ] **Task 4.2.7**: Tests para sincronización cuando regresa online
- [ ] **Task 4.2.8**: Implementar background sync con Supabase
- [ ] **Task 4.2.9**: Crear componente InstallPrompt para PWA
- [ ] **Task 4.2.10**: Tests para instalación y funcionamiento PWA
- [ ] **Task 4.2.11**: Configurar manifest.json completo
- [ ] **Task 4.2.12**: Tests para detección de PWA instalable

---

## 🎨 Fase 5: UI/UX Polish (Semanas 11-13)

### Sprint 5.1: Responsive Design (Días 50-56)

- [ ] **Task 5.1.1**: Implementar componentes mobile-first con Quasar
- [ ] **Task 5.1.2**: Tests para adaptación de layout móvil
- [ ] **Task 5.1.3**: Tests para navegación desktop
- [ ] **Task 5.1.4**: Implementar breakpoints responsive
- [ ] **Task 5.1.5**: Implementar modo oscuro/claro
- [ ] **Task 5.1.6**: Tests para toggle entre modos de tema
- [ ] **Task 5.1.7**: Tests para persistencia de preferencia de tema
- [ ] **Task 5.1.8**: Optimizar performance en dispositivos móviles
- [ ] **Task 5.1.9**: Tests para rendimiento en diferentes dispositivos
- [ ] **Task 5.1.10**: Implementar responsive design para panel de admin

### Sprint 5.2: Accessibility (Días 57-63)

- [ ] **Task 5.2.1**: Implementar soporte para screen readers
- [ ] **Task 5.2.2**: Tests E2E con Cypress para etiquetas ARIA apropiadas
- [ ] **Task 5.2.3**: Tests E2E con Cypress para navegación por teclado
- [ ] **Task 5.2.4**: Implementar ratios de contraste de color WCAG
- [ ] **Task 5.2.5**: Auditoría de accesibilidad WCAG 2.1 AA
- [ ] **Task 5.2.6**: Tests automatizados de accesibilidad con Axe
- [ ] **Task 5.2.7**: Implementar skip links y landmarks
- [ ] **Task 5.2.8**: Tests para compatibilidad con tecnologías asistivas

---

## 📊 Fase 6: Analytics & Performance (Semanas 14-16)

### Sprint 6.1: Performance Optimization (Días 64-70)

- [ ] **Task 6.1.1**: Análisis de tamaño de bundle con Vercel
- [ ] **Task 6.1.2**: Tests para tamaño aceptable de bundle (<500KB)
- [ ] **Task 6.1.3**: Implementar lazy loading de componentes no críticos
- [ ] **Task 6.1.4**: Tests para lazy loading de rutas (incluyendo panel admin)
- [ ] **Task 6.1.5**: Optimizar imágenes con Vercel Image Optimization
- [ ] **Task 6.1.6**: Tests para servir tamaños apropiados de imagen
- [ ] **Task 6.1.7**: Tests para uso de formato WebP cuando se soporte
- [ ] **Task 6.1.8**: Optimización de Code Splitting con Vite
- [ ] **Task 6.1.9**: Tests para métricas Core Web Vitals
- [ ] **Task 6.1.10**: Configurar Lighthouse CI para monitoring continuo

### Sprint 6.2: Monitoring y Analytics (Días 71-77)

- [ ] **Task 6.2.1**: Configurar Sentry para error monitoring
- [ ] **Task 6.2.2**: Implementar tracking de eventos con Vercel Analytics
- [ ] **Task 6.2.3**: Configurar alertas para errores críticos
- [ ] **Task 6.2.4**: Tests para tracking de métricas de usuario
- [ ] **Task 6.2.5**: Configurar dashboard de monitoring en Supabase
- [ ] **Task 6.2.6**: Tests para alertas de performance y uptime
- [ ] **Task 6.2.7**: Implementar health checks para APIs externas desde admin panel
- [ ] **Task 6.2.8**: Tests para circuit breakers y fallbacks
- [ ] **Task 6.2.9**: Integrar métricas de admin panel en monitoring

---

## 🚀 Sprint Final: Production Ready (Días 78-84)

### Testing E2E Completo con Cypress

- [ ] **Task 7.1.1**: Implementar suite de tests E2E críticos con Cypress
- [ ] **Task 7.1.2**: Test E2E con Cypress para flujo completo de generación de historia con OpenRouter
- [ ] **Task 7.1.3**: Test E2E con Cypress para guardado y revisión de vocabulario con WordsAPI
- [ ] **Task 7.1.4**: Test E2E con Cypress para sistema de progreso de usuario
- [ ] **Task 7.1.5**: Test E2E con Cypress para panel de administrador completo
- [ ] **Task 7.1.6**: Test E2E con Cypress para gestión de banners publicitarios
- [ ] **Task 7.1.7**: Test E2E con Cypress para límites de historias por usuario
- [ ] **Task 7.1.8**: Test E2E con Cypress para funcionalidad offline completa
- [ ] **Task 7.1.9**: Test E2E con Cypress para autenticación con roles (user/admin)
- [ ] **Task 7.1.10**: Test E2E con Cypress para reproducción de audio con ElevenLabs
- [ ] **Task 7.1.11**: Test E2E con Cypress para sincronización cross-device
- [ ] **Task 7.1.12**: Test E2E con Cypress para instalación y uso como PWA
- [ ] **Task 7.1.10**: Usar comandos custom de Quasar: dataCy para selección de elementos
- [ ] **Task 7.1.11**: Usar comandos custom de Quasar: selectDate para testing de QDate
- [ ] **Task 7.1.12**: Usar comandos custom de Quasar: within[Portal|Menu|Dialog] para scoping

### Performance Benchmarks

- [ ] **Task 7.2.1**: Implementar tests de rendimiento con Lighthouse CI
- [ ] **Task 7.2.2**: Tests para thresholds de rendimiento (>90)
- [ ] **Task 7.2.3**: Tests para thresholds de accesibilidad (>90)
- [ ] **Task 7.2.4**: Tests para score PWA (>90)
- [ ] **Task 7.2.5**: Tests para funcionamiento sin gamificación
- [ ] **Task 7.2.6**: Benchmarks de tiempo de carga (<3s)
- [ ] **Task 7.2.7**: Tests para rate limiting y quotas de APIs
- [ ] **Task 7.2.8**: Tests para escalabilidad y carga

### Deployment y Go-Live

- [ ] **Task 7.3.1**: Configurar pipeline CI/CD completo con GitHub Actions
- [ ] **Task 7.3.2**: Configurar deployment automático a Vercel production
- [ ] **Task 7.3.3**: Configurar backup automático de base de datos Supabase
- [ ] **Task 7.3.4**: Tests para deployment y rollback procedures
- [ ] **Task 7.3.5**: Configurar dominio production y certificados SSL
- [ ] **Task 7.3.6**: Tests para configuración DNS y CDN
- [ ] **Task 7.3.7**: Go-live checklist y testing final en production

---

## ✅ Checklists de Finalización

### 🔧 Code Quality Checklist

- [ ] **Test Coverage**: > 80% líneas cubiertas
- [ ] **TypeScript**: 0 errores de tipos
- [ ] **ESLint**: 0 warnings en modo strict
- [ ] **Bundle Size**: < 500KB initial load
- [ ] **Performance**: Lighthouse > 90 todas las categorías
- [ ] **Accessibility**: WCAG 2.1 AA compliant
- [ ] **PWA**: Instalable + offline functionality

### 🧪 Functional Testing Checklist

- [ ] **Story Reading**: Flow completo con OpenRouter funcional
- [ ] **Vocabulary**: Sistema WordsAPI + Supabase completamente operativo
- [ ] **Audio**: ElevenLabs TTS integrado y funcionando
- [ ] **Authentication**: Supabase Auth con OAuth providers
- [ ] **Progress**: Tracking de progreso de lectura y vocabulario
- [ ] **Offline**: Funciona sin conexión con sync automático
- [ ] **Responsive**: Móvil + desktop + tablet
- [ ] **Dark Mode**: Cambio de tema persistente
- [ ] **Installation**: PWA se puede instalar en todos los dispositivos

### 🔗 External Services Checklist

- [ ] **Supabase**: Database, Auth, Storage, Edge Functions, Realtime
- [ ] **OpenRouter**: Story generation con múltiples modelos AI
- [ ] **ElevenLabs**: Text-to-speech con múltiples voces
- [ ] **WordsAPI**: Dictionary con definiciones, pronunciación, etimología
- [ ] **Upstash Redis**: Rate limiting distribuido funcionando
- [ ] **Vercel**: Hosting, Edge Functions, Analytics, Preview deployments
- [ ] **Rate Limiting**: Quotas por usuario implementadas para todas las APIs
- [ ] **Error Handling**: Circuit breakers y fallbacks para todas las integraciones

### 📚 Documentation Checklist

- [ ] **README**: Instrucciones completas de instalación y setup
- [ ] **API Docs**: Documentación de Edge Functions y endpoints
- [ ] **Database Schema**: Documentación completa de Supabase schema
- [ ] **Environment Variables**: Guía completa de configuración
- [ ] **Testing**: Guías para escribir y ejecutar tests
- [ ] **Deployment**: Proceso de despliegue paso a paso
- [ ] **Security**: Best practices y configuración de seguridad
- [ ] **Troubleshooting**: Guía de solución de problemas comunes

### 🚀 MVP Ready Checklist

- [ ] **Content Generation**: Sistema de historias AI completamente funcional
- [ ] **Vocabulary System**: WordsAPI + spaced repetition operativo
- [ ] **Audio Narration**: ElevenLabs TTS integrado
- [ ] **User Authentication**: Supabase Auth con perfiles y roles (user/admin)
- [ ] **User Progress**: Sistema de seguimiento de avances
- [ ] **Admin Panel**: Panel completo de administración funcionando
- [ ] **Story Limits**: Sistema de límites de historias por usuario
- [ ] **Ad Banners**: Sistema de banners publicitarios con activación
- [ ] **API Health**: Test de conectividad de APIs desde admin panel
- [ ] **PWA Features**: Instalable y funcionalidad offline
- [ ] **Performance**: Score Lighthouse > 90
- [ ] **Accessibility**: Cumplimiento WCAG AA
- [ ] **Cross-Device Sync**: Supabase Realtime funcionando
- [ ] **Rate Limiting**: Protección contra abuse de APIs
- [ ] **Error Monitoring**: Sentry + alertas configuradas
- [ ] **Testing**: Cobertura > 80% y tests E2E completos
- [ ] **Documentation**: Completa y actualizada

---

## 📈 Métricas de Seguimiento

### 🎯 Métricas de Calidad de Código

- [ ] **Test Coverage**: > 80%
- [ ] **Test Execution Time**: < 45 segundos (suite completa)
- [ ] **Code Duplication**: < 5%
- [ ] **Cyclomatic Complexity**: < 10 por función
- [ ] **Type Coverage**: 100% TypeScript

### ⚡ Métricas de Performance

- [ ] **Bundle Size**: < 500KB
- [ ] **First Contentful Paint**: < 2s
- [ ] **Time to Interactive**: < 3s
- [ ] **Lighthouse Score**: > 90 (Performance, Accessibility, PWA, SEO)
- [ ] **API Response Time**: < 1s para Edge Functions

### 🎮 Métricas de Funcionalidad

- [ ] **Feature Completeness**: 100% casos de uso implementados
- [ ] **Bug Rate**: < 1 bug por 1000 líneas de código
- [ ] **User Flow Success**: 100% flujos críticos funcionando
- [ ] **API Uptime**: > 99.9% para servicios críticos
- [ ] **Cross-Device Sync**: < 1s latencia para Realtime updates

### 💰 Métricas de Costos APIs

- [ ] **OpenRouter**: Tracking de costos por usuario y modelo
- [ ] **ElevenLabs**: Monitoring de usage de caracteres TTS
- [ ] **WordsAPI**: Tracking de requests y quotas
- [ ] **Upstash Redis**: Monitoring de operations y storage
- [ ] **Supabase**: Database size, bandwidth, storage usage
- [ ] **Vercel**: Function invocations, bandwidth, build time

---

## 🔧 Comandos de Desarrollo

### Testing Workflow Diario con Quasar

```bash
# Ejecutar todos los tests unitarios (Vitest)
npm run test:unit

# Tests unitarios en modo watch
npm run test:unit:watch

# Coverage report unitario
npm run test:unit:coverage

# E2E tests con Cypress
npm run test:e2e

# E2E tests en modo CI
npm run test:e2e:ci

# Component testing con Cypress
npm run test:component

# Linting + type checking
npm run lint && npm run type-check

# Supabase local development
npx supabase start
npx supabase db reset

# Edge Functions local testing
npx supabase functions serve

# Build production
npm run build

# Deploy a Vercel
vercel --prod
```

### Database Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > src/types/supabase.ts
```

### API Testing Local con Quasar

```bash
# Test OpenRouter integration con Vitest
npm run test:api:openrouter

# Test ElevenLabs integration con Vitest
npm run test:api:elevenlabs

# Test WordsAPI integration con Vitest
npm run test:api:wordsapi

# Test all external APIs con Vitest
npm run test:apis

# Cypress E2E para APIs integradas
npm run test:e2e:api
```

---

**Status**: 🚧 En Progreso  
**Última Actualización**: Agosto 2025  
**Responsable**: AI Implementation Team  
**Metodología**: Test-Driven Development (TDD)  
**Arquitectura**: Quasar + Supabase + Vercel + OpenRouter + ElevenLabs + WordsAPI + Redis
**Duración Actualizada**: 16 semanas (112 días) - Gamificación removida, Panel Admin agregado

> 💡 **Tip**: Mantener este documento actualizado marcando las tareas completadas facilita el seguimiento del progreso y asegura que no se olvide ningún paso crítico en la implementación con la arquitectura completa de servicios externos.
