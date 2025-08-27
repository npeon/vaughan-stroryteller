# PRD - The Vaughan Storyteller

## 🎯 Información General del Proyecto

### Resumen Ejecutivo
**The Vaughan Storyteller** es una aplicación web progresiva (PWA) que utiliza inteligencia artificial para generar historias personalizadas en inglés adaptadas al nivel CEFR del usuario (A1-C2). La aplicación proporciona una experiencia inmersiva de aprendizaje de idiomas a través de contenido narrativo personalizado.

### Objetivos del Producto
- Proporcionar contenido narrativo personalizado e ilimitado para aprendices de inglés
- Acelerar la adquisición de vocabulario mediante técnicas de repetición espaciada
- Funcionar como PWA con capacidades offline completas
- Ofrecer experiencia nativa en dispositivos móviles y desktop
- Integrar servicios de audio y diccionario para una experiencia completa

### Datos del Proyecto
- **Nombre**: The Vaughan Storyteller
- **Tipo**: Progressive Web App (PWA)
- **Plataformas**: Web, iOS, Android (via Capacitor)
- **Framework**: Quasar Framework v2.5.0+
- **Metodología**: Test-Driven Development (TDD)
- **Duración**: 16 semanas (112 días)
- **Equipo**: AI Implementation Team

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico Principal

#### Frontend
- **Framework**: Quasar Framework v2.16+
- **UI Library**: Vue 3 Composition API con TypeScript
- **Router**: Vue Router 4
- **State Management**: Pinia
- **Build Tool**: Vite
- **PWA**: Workbox para service workers
- **Mobile**: Capacitor para aplicaciones nativas

#### Backend y Servicios
- **Backend-as-a-Service**: Supabase
  - **Base de Datos**: PostgreSQL con Row Level Security (RLS)
  - **Autenticación**: Supabase Auth con proveedores OAuth
  - **Almacenamiento**: Supabase Storage para assets
  - **API**: Auto-generada REST API + GraphQL
  - **Edge Functions**: Deno-based serverless functions
  - **Realtime**: WebSocket subscriptions para sincronización

#### Hosting y Deployment
- **Frontend Hosting**: Vercel
  - **Edge Functions**: Para server-side logic
  - **CDN Global**: Distribución optimizada de contenido
  - **Analytics**: Vercel Analytics para métricas
  - **Preview Deployments**: Para cada PR/branch

#### APIs Externas e Integraciones
- **AI Story Generation**: OpenRouter API
  - **Modelos**: Claude 3.5, GPT-4, Llama 3.1
  - **Rate Limiting**: Distributed rate limiting con Redis
  - **Fallback Strategy**: Multiple model fallbacks
  - **Cost Optimization**: Intelligent model routing

- **Text-to-Speech**: ElevenLabs API
  - **Voces**: Múltiples voces en inglés nativo
  - **Streaming Audio**: Para historias largas
  - **Voice Cloning**: Personalización de narrador
  - **Audio Caching**: Optimización de costos

- **Dictionary Services**: WordsAPI
  - **Definiciones**: Contextuales y etimológicas
  - **Pronunciación**: IPA y audio samples
  - **Ejemplos de uso**: En contextos reales
  - **Sinónimos/Antónimos**: Para expansión de vocabulario

#### Infraestructura y Cache
- **Distributed Cache**: Redis (Upstash)
  - **Rate Limiting**: Per-user API quotas
  - **Session Storage**: Temporary user state
  - **Queue Management**: Background job processing
  - **Real-time Features**: Pub/Sub messaging

#### Testing
- **Unit Testing**: Vitest (con @quasar/testing-unit-vitest)
- **Component Testing**: @vue/test-utils con installQuasarPlugin()
- **E2E Testing**: Cypress (con @quasar/testing-e2e-cypress)
- **API Testing**: Supertest con Supabase client
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Vitest coverage + Cypress coverage

#### Herramientas de Desarrollo
- **TypeScript**: Modo strict habilitado
- **Linting**: ESLint v8+ con configuración Vue/TypeScript
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: Vercel + Supabase CLI integration

### Arquitectura de Componentes

#### Estructura de Directorios
```
src/
├── components/          # Componentes Vue reutilizables
│   ├── story/          # Componentes relacionados con historias
│   ├── vocabulary/     # Componentes de gestión de vocabulario
│   └── ui/            # Componentes UI genéricos
├── composables/        # Lógica reutilizable de Vue
├── stores/            # Stores de Pinia
├── services/          # Servicios de API y lógica de negocio
│   ├── supabase/      # Cliente y configuración Supabase
│   ├── openrouter/    # Integración AI story generation
│   ├── elevenlabs/    # Text-to-speech service
│   └── wordsapi/      # Dictionary service integration
├── types/             # Definiciones de tipos TypeScript
├── utils/             # Utilidades y helpers
├── layouts/           # Layouts de página
└── boot/              # Quasar boot files para configuración
```

#### Patrones de Diseño
- **Repository Pattern**: Para abstracción de datos
- **Composables Pattern**: Para lógica reutilizable
- **Provider Pattern**: Para inyección de dependencias
- **Observer Pattern**: Para sistema de eventos
- **Strategy Pattern**: Para algoritmos intercambiables
- **Circuit Breaker**: Para resiliencia de APIs externas

---

## 🗄️ Arquitectura de Base de Datos (Supabase)

### Esquema de Tablas Principales

#### Tabla `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  preferences JSONB DEFAULT '{}',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  stories_completed INTEGER DEFAULT 0,
  vocabulary_mastered INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla `stories`
```sql
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  genre TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  estimated_read_time INTEGER,
  word_count INTEGER,
  vocabulary_words TEXT[],
  audio_url TEXT,
  reading_progress FLOAT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla `vocabulary_words`
```sql
CREATE TABLE vocabulary_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  context TEXT,
  story_id UUID REFERENCES stories(id),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  review_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  mastery_level TEXT DEFAULT 'new' CHECK (mastery_level IN ('new', 'learning', 'review', 'mastered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word)
);
```


#### Tabla `usage_analytics`
```sql
CREATE TABLE usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla `ad_banners` (Panel Admin)
```sql
CREATE TABLE ad_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla `user_limits` (Panel Admin)
```sql
CREATE TABLE user_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  max_stories INTEGER DEFAULT 10,
  current_stories INTEGER DEFAULT 0,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### Tabla `api_health_checks` (Panel Admin)
```sql
CREATE TABLE api_health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL CHECK (service_name IN ('openrouter', 'elevenlabs', 'wordsapi')),
  status TEXT NOT NULL CHECK (status IN ('connected', 'error', 'timeout')),
  response_time INTEGER, -- milliseconds
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

#### Políticas para `profiles`
```sql
-- Users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### Políticas para `stories`
```sql
-- Users can only access their own stories
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Políticas para Tablas de Administración
```sql
-- Solo administradores pueden gestionar banners
CREATE POLICY "Only admins can manage ad banners" ON ad_banners
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Solo administradores pueden gestionar límites de usuario
CREATE POLICY "Only admins can manage user limits" ON user_limits
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Solo administradores pueden ver health checks
CREATE POLICY "Only admins can view health checks" ON api_health_checks
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Usuarios pueden ver banners activos
CREATE POLICY "Users can view active banners" ON ad_banners
  FOR SELECT USING (is_active = true);

-- Usuarios pueden ver sus propios límites
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT USING (auth.uid() = user_id);
```

### Edge Functions (Deno)

#### Función: `generate-story`
```typescript
// supabase/functions/generate-story/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface StoryRequest {
  genre: string
  cefr_level: string
  user_preferences?: Record<string, any>
}

serve(async (req) => {
  const { genre, cefr_level, user_preferences } = await req.json() as StoryRequest
  
  // Rate limiting check
  const rateLimitCheck = await checkUserRateLimit(userId)
  if (!rateLimitCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), 
      { status: 429 })
  }
  
  // Check user story limits
  const userLimits = await supabase
    .from('user_limits')
    .select('max_stories, current_stories')
    .eq('user_id', userId)
    .single()
  
  if (userLimits.data && userLimits.data.current_stories >= userLimits.data.max_stories) {
    return new Response(JSON.stringify({ error: 'Story limit reached' }), 
      { status: 403 })
  }
  
  // Generate story with OpenRouter
  const story = await generateStoryWithAI({
    genre,
    cefr_level,
    preferences: user_preferences
  })
  
  // Store in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data, error } = await supabase
    .from('stories')
    .insert([{
      user_id: userId,
      title: story.title,
      content: story.content,
      genre,
      cefr_level,
      estimated_read_time: story.estimatedTime,
      word_count: story.wordCount,
      vocabulary_words: story.vocabularyWords
    }])
    .select()
    .single()
  
  // Update story count
  await supabase
    .from('user_limits')
    .upsert({
      user_id: userId,
      current_stories: (userLimits.data?.current_stories || 0) + 1
    })
  
  // Check for active banner and include it
  const activeBanner = await supabase
    .from('ad_banners')
    .select('*')
    .eq('is_active', true)
    .single()
  
  const response = {
    ...data,
    banner: activeBanner.data || null
  }
  
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### Función: `generate-audio`
```typescript
// supabase/functions/generate-audio/index.ts
serve(async (req) => {
  const { story_id, text } = await req.json()
  
  // Generate audio with ElevenLabs
  const audioBuffer = await generateAudioWithElevenLabs(text)
  
  // Upload to Supabase Storage
  const fileName = `stories/${story_id}/audio.mp3`
  const { data: uploadData } = await supabase.storage
    .from('story-assets')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600'
    })
  
  // Update story with audio URL
  const { publicUrl } = supabase.storage
    .from('story-assets')
    .getPublicUrl(fileName)
  
  await supabase
    .from('stories')
    .update({ audio_url: publicUrl.publicUrl })
    .eq('id', story_id)
  
  return new Response(JSON.stringify({ audio_url: publicUrl.publicUrl }))
})
```

#### Función: `admin-panel`
```typescript
// supabase/functions/admin-panel/index.ts
serve(async (req) => {
  const { action, data } = await req.json()
  
  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), 
      { status: 403 })
  }
  
  switch (action) {
    case 'test_apis':
      return await testAPIConnectivity()
    
    case 'create_banner':
      return await createAdBanner(data)
    
    case 'update_user_limit':
      return await updateUserLimit(data.userId, data.limit)
    
    case 'get_dashboard_stats':
      return await getDashboardStats()
    
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), 
        { status: 400 })
  }
})

async function testAPIConnectivity() {
  const results = {
    openrouter: await testOpenRouter(),
    elevenlabs: await testElevenLabs()
  }
  
  // Store results
  for (const [service, result] of Object.entries(results)) {
    await supabase.from('api_health_checks').insert({
      service_name: service,
      status: result.status,
      response_time: result.responseTime,
      error_message: result.error
    })
  }
  
  return new Response(JSON.stringify(results))
}

async function createAdBanner(bannerData) {
  const { data, error } = await supabase
    .from('ad_banners')
    .insert(bannerData)
    .select()
    .single()
  
  return new Response(JSON.stringify({ data, error }))
}
```

---

## 📱 Funcionalidades Core

### 1. Sistema de Historias Generativas con IA

#### Características Principales
- Generación de historias personalizadas usando OpenRouter API
- Adaptación automática al nivel CEFR del usuario
- Categorización por géneros (aventura, romance, misterio, sci-fi)
- Estimación automática de tiempo de lectura
- Progreso de lectura con persistencia en Supabase
- Audio narration con ElevenLabs TTS

#### Integración con OpenRouter
```typescript
// services/openrouter/story-generator.ts
export class StoryGeneratorService {
  private openRouterClient: OpenRouterClient
  
  async generateStory(params: StoryParams): Promise<Story> {
    const prompt = this.buildPrompt(params)
    
    // Try multiple models with fallback
    const models = ['anthropic/claude-3.5-sonnet', 'openai/gpt-4-turbo', 'meta-llama/llama-3.1-70b-instruct']
    
    for (const model of models) {
      try {
        const response = await this.openRouterClient.complete({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.8
        })
        
        return this.parseStoryResponse(response.choices[0].message.content)
      } catch (error) {
        console.warn(`Model ${model} failed, trying next...`)
        continue
      }
    }
    
    throw new Error('All AI models failed to generate story')
  }
}
```

#### Componentes Técnicos
- **StoryGenerator Service**: Integración con OpenRouter API
- **StoryReader Component**: Renderizado y navegación de historias
- **ProgressTracker**: Sistema de seguimiento de progreso
- **StoryCache**: Sistema de caché optimizado con Supabase
- **AudioPlayer Component**: Reproducción de narración TTS

### 2. Panel de Administrador

#### Características Principales
- **Test de Conectividad APIs**: Verificación en tiempo real de OpenRouter y ElevenLabs
- **Gestión de Banners Publicitarios**: Creación, edición y activación/desactivación
- **Control de Límites de Usuario**: Configuración de máximo historias por usuario
- **Dashboard de Métricas**: Estadísticas de uso de APIs y costos
- **Gestión de Usuarios**: Visualización de usuarios activos y sus límites

#### Herramientas de Administración
```typescript
// services/admin/admin-service.ts
export class AdminService {
  // 1. Test de conectividad a APIs
  async testAPIConnectivity(): Promise<APIHealthStatus> {
    const [openRouterStatus, elevenLabsStatus] = await Promise.allSettled([
      this.testOpenRouterConnection(),
      this.testElevenLabsConnection()
    ])
    
    return {
      openRouter: {
        status: openRouterStatus.status === 'fulfilled' ? 'connected' : 'error',
        responseTime: openRouterStatus.responseTime,
        lastCheck: new Date()
      },
      elevenLabs: {
        status: elevenLabsStatus.status === 'fulfilled' ? 'connected' : 'error',
        responseTime: elevenLabsStatus.responseTime,
        lastCheck: new Date()
      }
    }
  }
  
  // 2. Gestión de banners publicitarios
  async createAdBanner(banner: AdBannerData): Promise<AdBanner> {
    return await this.supabase
      .from('ad_banners')
      .insert({
        title: banner.title,
        description: banner.description,
        cta_link: banner.ctaLink,
        is_active: banner.isActive,
        created_by: banner.adminId
      })
      .select()
      .single()
  }
  
  // 3. Control de límites de historias
  async setUserStoryLimit(userId: string, limit: number): Promise<void> {
    await this.supabase
      .from('user_limits')
      .upsert({
        user_id: userId,
        max_stories: limit,
        updated_at: new Date().toISOString()
      })
  }
}
```

#### Componentes Técnicos
- **AdminDashboard Component**: Panel principal de administración
- **APIHealthChecker**: Monitor de conectividad de APIs
- **BannerManager Component**: CRUD de banners publicitarios
- **UserLimitManager**: Gestión de límites por usuario
- **AdminAuth Guard**: Protección de rutas de administrador

### 3. Sistema de Gestión de Vocabulario con WordsAPI

#### Características Principales
- Diccionario personal con definiciones de WordsAPI
- Sistema de repetición espaciada (Spaced Repetition)
- Flashcards interactivas con múltiples formatos
- Tracking de progreso de aprendizaje por palabra
- Integración con contexto de historias
- Pronunciación y etimología desde WordsAPI

#### Integración con WordsAPI
```typescript
// services/wordsapi/dictionary-service.ts
export class DictionaryService {
  private wordsApiClient: WordsAPIClient
  
  async getWordDefinition(word: string): Promise<WordDefinition> {
    const [definition, pronunciation, examples] = await Promise.allSettled([
      this.wordsApiClient.getDefinition(word),
      this.wordsApiClient.getPronunciation(word),
      this.wordsApiClient.getExamples(word)
    ])
    
    return {
      word,
      definitions: definition.status === 'fulfilled' ? definition.value : [],
      pronunciation: pronunciation.status === 'fulfilled' ? pronunciation.value : null,
      examples: examples.status === 'fulfilled' ? examples.value : [],
      etymology: await this.wordsApiClient.getEtymology(word)
    }
  }
}
```

#### Algoritmo de Repetición Espaciada
```typescript
interface SpacedRepetitionConfig {
  easyInterval: number;    // 4 días
  normalInterval: number;  // 1 día  
  hardInterval: number;    // 10 minutos
  graduatingInterval: number; // 15 días
  multiplier: number;      // 2.5
}

class SpacedRepetitionService {
  calculateNextReview(difficulty: ReviewDifficulty, currentInterval: number): Date {
    const config = this.getConfig()
    let nextInterval: number
    
    switch (difficulty) {
      case 'easy':
        nextInterval = Math.max(currentInterval * config.multiplier, config.easyInterval)
        break
      case 'normal':
        nextInterval = Math.max(currentInterval * 1.3, config.normalInterval)
        break
      case 'hard':
        nextInterval = Math.max(currentInterval * 0.5, config.hardInterval)
        break
    }
    
    return addDays(new Date(), nextInterval)
  }
}
```


---

## 🔗 Integraciones de APIs Externas

### OpenRouter API Configuration
```typescript
// services/openrouter/client.ts
export class OpenRouterClient {
  private baseURL = 'https://openrouter.ai/api/v1'
  private apiKey = process.env.OPENROUTER_API_KEY
  
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Rate limiting check with Redis
    await this.checkRateLimit(request.userId)
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.SITE_URL,
        'X-Title': 'The Vaughan Storyteller',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens,
        temperature: request.temperature,
        stream: false
      })
    })
    
    if (!response.ok) {
      throw new OpenRouterError(`API call failed: ${response.statusText}`)
    }
    
    return await response.json()
  }
}
```

### ElevenLabs Integration
```typescript
// services/elevenlabs/tts-service.ts
export class TextToSpeechService {
  private elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
  private defaultVoiceId = 'pNInz6obpgDQGcFmaJgB' // Adam voice
  
  async generateAudio(text: string, options?: TTSOptions): Promise<AudioBuffer> {
    const voiceId = options?.voiceId || this.defaultVoiceId
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    )
    
    if (!response.ok) {
      throw new ElevenLabsError(`TTS generation failed: ${response.statusText}`)
    }
    
    return await response.arrayBuffer()
  }
}
```

### Rate Limiting y Quota Management
```typescript
// services/rate-limiting/quota-manager.ts
export class QuotaManager {
  private redis: Redis
  
  async checkQuota(userId: string, service: 'openrouter' | 'elevenlabs' | 'wordsapi'): Promise<QuotaResult> {
    const key = `quota:${service}:${userId}`
    const current = await this.redis.get(key)
    const limits = this.getServiceLimits(service)
    
    if (!current) {
      await this.redis.setex(key, limits.window, '1')
      return { allowed: true, remaining: limits.max - 1 }
    }
    
    const currentCount = parseInt(current)
    if (currentCount >= limits.max) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: await this.redis.ttl(key)
      }
    }
    
    await this.redis.incr(key)
    return { allowed: true, remaining: limits.max - currentCount - 1 }
  }
  
  private getServiceLimits(service: string) {
    const limits = {
      openrouter: { max: 50, window: 3600 },  // 50 requests per hour
      elevenlabs: { max: 20, window: 3600 },  // 20 TTS per hour
      wordsapi: { max: 100, window: 3600 }    // 100 lookups per hour
    }
    return limits[service]
  }
}
```

---

## 🎨 Diseño de Interfaz

### Principios de Diseño
- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Accessibility**: Cumplimiento WCAG 2.1 AA
- **Dark/Light Mode**: Soporte para preferencias de tema
- **Responsive**: Adaptación fluida a diferentes tamaños de pantalla
- **Progressive Enhancement**: Funcionalidad base + mejoras incrementales

### Paleta de Colores
```scss
// Colores primarios
$primary: #1976D2;      // Azul corporativo
$secondary: #26A69A;    // Verde aqua
$accent: #9C27B0;       // Púrpura para highlights

// Colores de estado
$positive: #21BA45;     // Verde éxito
$negative: #C10015;     // Rojo error  
$warning: #F2C037;      // Amarillo advertencia
$info: #31CCEC;         // Azul información
```

### Componentes de UI
- **Layout Responsivo**: Header, sidebar, main content, footer
- **Navigation**: Bottom tabs (móvil), sidebar (desktop)
- **Cards**: Contenedores de historias y vocabulario
- **Modals**: Dialogs para flashcards y configuración
- **Progress Bars**: Indicadores de progreso de lectura
- **Audio Controls**: Controles de reproducción de audio

---

## 📊 Gestión de Datos

### Modelos de Datos

#### Story Interface
```typescript
interface Story {
  id: string;
  user_id: string;
  title: string;
  content: string;
  level: CEFRLevel;
  genre: StoryGenre;
  estimated_read_time: number; // minutes
  word_count: number;
  vocabulary_words: string[];
  audio_url?: string;
  reading_progress: number; // 0-100%
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

#### VocabularyWord Interface
```typescript
interface VocabularyWord {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  context: string;
  story_id?: string;
  difficulty: number; // 1-5
  review_count: number;
  success_rate: number; // 0-100%
  last_reviewed?: Date;
  next_review?: Date;
  mastery_level: 'new' | 'learning' | 'review' | 'mastered';
  created_at: Date;
  updated_at: Date;
}
```

#### User Profile Interface
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  cefr_level: CEFRLevel;
  preferences: UserPreferences;
  role: 'user' | 'admin';
  stories_completed: number;
  vocabulary_mastered: number;
  created_at: Date;
  updated_at: Date;
}
```

#### Admin Panel Interfaces
```typescript
interface AdBanner {
  id: string;
  title: string;
  description: string;
  cta_link: string;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface UserLimit {
  id: string;
  user_id: string;
  max_stories: number;
  current_stories: number;
  reset_date: Date;
  created_at: Date;
  updated_at: Date;
}

interface APIHealthCheck {
  id: string;
  service_name: 'openrouter' | 'elevenlabs' | 'wordsapi';
  status: 'connected' | 'error' | 'timeout';
  response_time?: number;
  error_message?: string;
  checked_at: Date;
}

interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalStories: number;
  apiUsage: {
    openrouter: { requests: number; cost: number };
    elevenlabs: { requests: number; cost: number };
  };
  userLimits: {
    totalWithLimits: number;
    averageLimit: number;
  };
}
```

### Estrategia de Almacenamiento
- **Supabase Database**: Datos estructurados con PostgreSQL
- **Supabase Storage**: Assets como audio files e imágenes
- **Pinia Stores**: Estado de aplicación en memoria
- **LocalStorage**: Configuraciones de usuario y preferencias offline
- **IndexedDB**: Cache de datos para funcionalidad offline

### Sincronización de Datos
- **Supabase Realtime**: Sincronización automática cross-device
- **Offline Queue**: Cola de cambios para sincronizar al reconectar
- **Conflict Resolution**: Estrategias para resolver conflictos de datos
- **Background Sync**: Service Worker para sincronización en segundo plano

---

## 🔧 Implementación PWA

### Service Worker Strategy
- **Precaching**: Recursos críticos (shell, fonts, icons)
- **Runtime Caching**: Contenido dinámico con TTL
- **Background Sync**: Sincronización offline con Supabase
- **Push Notifications**: Recordatorios de práctica

### Manifest Configuration
```json
{
  "name": "The Vaughan Storyteller",
  "short_name": "Storyteller",
  "description": "AI-powered English learning through interactive stories",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1976D2",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "categories": ["education", "books"],
  "lang": "en",
  "scope": "/"
}
```

### Capacidades Offline
- Lectura de historias descargadas desde Supabase
- Práctica de vocabulario sin conexión
- Sincronización automática al reconectar con Realtime
- Indicadores de estado offline/online
- Queue de acciones pendientes para sincronizar

---

## 🚀 Rendimiento y Optimización

### Métricas Objetivo
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (inicial)
- **Lighthouse Score**: > 90 (todas las categorías)

### Estrategias de Optimización
- **Code Splitting**: Carga bajo demanda de rutas
- **Lazy Loading**: Componentes no críticos
- **Tree Shaking**: Eliminación de código no utilizado
- **Image Optimization**: WebP, lazy loading, responsive images
- **Supabase Edge Functions**: Para lógica server-side optimizada
- **Vercel Edge Network**: CDN global para assets estáticos

---

## 🔐 Consideraciones de Seguridad

### Autenticación con Supabase Auth
- **JWT Tokens**: Manejo seguro de tokens con refresh automático
- **OAuth Providers**: Google, GitHub, Apple sign-in
- **Email Verification**: Confirmación de email obligatoria
- **Password Reset**: Flow seguro de recuperación

### Row Level Security (RLS)
- **Políticas granulares**: Control de acceso a nivel de fila
- **User isolation**: Cada usuario solo ve sus datos
- **Admin overrides**: Políticas especiales para administradores

### API Security
- **Rate Limiting**: Distributed con Redis/Upstash
- **Input Validation**: Sanitización en Edge Functions
- **CORS Configuration**: Políticas restrictivas para APIs
- **API Key Rotation**: Rotación regular de keys de servicios externos

### Frontend Security
- **Content Security Policy**: Prevención XSS
- **Secure Headers**: HSTS, X-Frame-Options con Vercel
- **Environment Variables**: Separación de secrets por ambiente
- **Dependency Auditing**: Escaneo regular con `npm audit`

---

## 📈 Métricas y Monitoreo

### KPIs de Producto
- **User Engagement**: Tiempo promedio de sesión
- **Learning Progress**: Vocabulario aprendido por semana
- **Retention Rate**: Usuarios activos en 7/30 días
- **Completion Rate**: Historias terminadas vs iniciadas
- **API Usage**: Costos y usage de OpenRouter, ElevenLabs

### Métricas Técnicas
- **Performance**: Core Web Vitals con Vercel Analytics
- **Error Rate**: Errores JavaScript con Sentry
- **Database Performance**: Supabase slow query monitoring
- **API Response Times**: Latencia de Edge Functions

### Herramientas de Monitoreo
- **Vercel Analytics**: Real User Monitoring y Web Vitals
- **Supabase Dashboard**: Database performance y usage
- **Sentry**: Error monitoring y performance profiling
- **Upstash Console**: Redis performance y rate limiting metrics

---

## 🚀 Plan de Deployment

### Infraestructura de Deployment
- **Frontend**: Vercel (auto-deploy desde GitHub)
- **Backend**: Supabase (managed PostgreSQL + Edge Functions)
- **Cache Layer**: Upstash Redis
- **DNS**: Vercel Edge Network

### Estrategia de Release
- **Semantic Versioning**: vMajor.Minor.Patch
- **Feature Flags**: Supabase Feature Flags para rollout gradual
- **Preview Deployments**: Vercel preview URLs para cada PR
- **Database Migrations**: Supabase CLI para schema changes

### Ambientes
- **Development**: Local con Supabase local development
- **Staging**: Vercel preview + Supabase staging project
- **Production**: Vercel production + Supabase production project

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run type-check
      - run: npm run lint
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🧪 Estrategia de Testing

### Pirámide de Testing con Quasar
```
    E2E Tests con Cypress (10%)
      ↗️        ↖️
Integration (20%)  Component con Quasar (20%)
         ↗️              ↖️
        Unit Tests con Vitest (50%)
```

### Configuración de Testing Quasar
```bash
# Instalar extensiones de testing de Quasar
quasar ext add @quasar/testing-unit-vitest
quasar ext add @quasar/testing-e2e-cypress
```

### Setup de Tests con Quasar
```typescript
// tests/setup.ts
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';

// Instalar plugin de Quasar para tests
installQuasarPlugin();
```

### Testing con Servicios Externos
- **Supabase Testing**: Local development server + test database
- **API Mocking**: MSW para OpenRouter, ElevenLabs, WordsAPI
- **Edge Function Testing**: Deno testing framework
- **Database Testing**: Transactional tests con rollback

### Herramientas de Testing
- **Vitest**: Fast unit testing con hot reload (configurado con Quasar App Extension)
- **@vue/test-utils**: Component testing con installQuasarPlugin() de Quasar
- **Cypress**: E2E testing con comandos custom de Quasar (dataCy, selectDate, testRoute)
- **MSW**: API mocking para tests determinísticos
- **Supabase Test Helpers**: Database testing utilities
- **Quasar Custom Commands**: within[Portal|Menu|SelectMenu|Dialog] para componentes Quasar

---

## ✅ Criterios de Aceptación

### Funcionalidad
- [ ] Generación de historias con OpenRouter API funcional
- [ ] Sistema de vocabulario con WordsAPI integration
- [ ] Text-to-speech con ElevenLabs operativo
- [ ] Sistema de progreso de usuario y tracking de avances
- [ ] Panel de administrador con test de APIs, banners y límites
- [ ] Control de límites de historias por usuario implementado
- [ ] Sistema de banners publicitarios con activación/desactivación
- [ ] Autenticación con Supabase Auth y roles de administrador
- [ ] PWA instalable con funcionalidad offline
- [ ] Responsive design (móvil + desktop)
- [ ] Accesibilidad WCAG 2.1 AA compliant

### Integración de Servicios
- [ ] Supabase database con RLS policies funcionando
- [ ] Edge Functions deployed y operativas (incluyendo admin-panel)
- [ ] Rate limiting con Redis implementado
- [ ] Sistema de límites de historias por usuario operativo
- [ ] Panel de administrador accesible solo para admins
- [ ] Test de conectividad de APIs desde panel admin
- [ ] Vercel deployment con preview URLs
- [ ] Todas las APIs externas integradas y testeadas

### Calidad Técnica
- [ ] Test coverage > 80%
- [ ] TypeScript sin errores
- [ ] ESLint warnings = 0
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 90
- [ ] Cross-browser compatibility

### Performance y Seguridad
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Row Level Security policies verificadas
- [ ] Rate limiting funcionando correctamente
- [ ] Error monitoring con alertas configurado

---

## 📋 Entregables Finales

### Código y Deployment
- [ ] Aplicación web funcional desplegada en Vercel
- [ ] Base de datos Supabase configurada con RLS
- [ ] Edge Functions deployed en Supabase
- [ ] Suite de tests completa con >80% coverage
- [ ] Documentación técnica actualizada
- [ ] Scripts de deployment automatizados

### Configuración de Servicios
- [ ] OpenRouter API integration configurada
- [ ] ElevenLabs TTS service operativo
- [ ] WordsAPI dictionary service integrado
- [ ] Redis rate limiting configurado
- [ ] Monitoring y alertas configurados

### Documentación
- [ ] Manual de usuario
- [ ] Guía de desarrollo y deployment
- [ ] API documentation de Edge Functions
- [ ] Database schema documentation
- [ ] Troubleshooting guide
- [ ] Security best practices guide

---

**Estado del Documento**: ✅ Completo y Aprobado  
**Fecha de Última Actualización**: Agosto 2025  
**Responsable**: AI Implementation Team  
**Metodología**: Test-Driven Development (TDD)  
**Arquitectura**: Quasar + Supabase + Vercel + External APIs

> 🎯 **Objetivo**: Este PRD sirve como blueprint completo para la implementación de The Vaughan Storyteller usando metodología TDD con arquitectura moderna full-stack. Incluye todas las integraciones de servicios externos, arquitectura de seguridad empresarial, y configuración completa para desarrollo autónomo por AI.