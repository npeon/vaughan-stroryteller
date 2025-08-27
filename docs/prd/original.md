# Product Requirements Document (PRD)

## StoryTeller AI - Migración a Quasar + Supabase + Vercel

**Versión:** 2.0  
**Fecha:** 27 de agosto de 2025  
**Migración de:** Vue 3 + Tauri + Rust → Quasar + Supabase + Vercel  
**Objetivo:** Aplicación multiplataforma (Web + iOS + Android) con código base único

---

## 1. RESUMEN EJECUTIVO

### 1.1 Visión del Proyecto

Migrar StoryTeller AI desde su arquitectura actual (Vue 3 + Tauri + Rust) a una solución moderna multiplataforma usando Quasar Framework, Supabase como backend completo y Vercel para deployment, manteniendo **exactamente las mismas funcionalidades** pero expandiendo la compatibilidad a dispositivos móviles nativos.

### 1.2 Stack Tecnológico Objetivo

- **Frontend:** Quasar Framework (Vue 3 + Vite + TypeScript)
- **Mobile:** Capacitor para compilación iOS/Android nativa
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Deployment:** Vercel (web) + App Stores (mobile)
- **Integración:** OpenRouter (AI), ElevenLabs (TTS), WordsAPI (diccionario)

### 1.3 Objetivos de la Migración

- ✅ **Código base único** para web, iOS y Android
- ✅ **Mantenimiento de funcionalidades** exactas del proyecto actual
- ✅ **Backend escalable** con Supabase
- ✅ **Deployment automatizado** con Vercel
- ✅ **Experiencia nativa** en dispositivos móviles

---

## 2. ANÁLISIS DEL PROYECTO ACTUAL

### 2.1 Funcionalidades Implementadas

#### Sistema de Autenticación

- JWT con bcrypt para hashing de passwords
- Roles: Administrador (primer usuario) y Usuario final
- Validación de tokens en todas las operaciones críticas
- Gestión de sesiones persistentes

#### Generación de Historias con IA

- Integración con OpenRouter API
- Configuración de modelos de IA (gpt-4o, claude-3.5-sonnet, etc.)
- Prompts personalizados con límites de palabras (50-2000)
- Almacenamiento de historias con metadatos completos

#### Sistema de Audio y TTS

- Integración con ElevenLabs API
- Múltiples voces con categorización (narrativa, conversacional, educativa)
- Sincronización texto-audio con timestamps
- Controles de reproducción avanzados (play/pause/restart/seek)
- Configuración de volumen y velocidad de reproducción

#### Palabras Complejas y Diccionario

- Detección automática de palabras complejas durante generación
- Almacenamiento de definiciones y pronunciaciones
- Texto interactivo con popups de definición
- Integración con WordsAPI para definiciones externas

#### Biblioteca Personal

- CRUD completo de historias
- Sistema de favoritos
- Búsqueda y filtrado
- Estadísticas de uso

#### Panel de Administración

- Gestión de API keys (OpenRouter, ElevenLabs, WordsAPI)
- Configuración de modelos de IA disponibles
- Límites y parámetros del sistema
- Creación de administradores adicionales

### 2.2 Arquitectura Actual

```
storyteller-ai/
   src/                     # Frontend Vue 3
      components/          # Componentes Vue
         auth/           # Autenticación (LoginForm)
         story/          # Historias (Generator, Player, Reader)
         audio/          # Audio (AudioPlayer, VoiceSelector)
         settings/       # Configuración (ApiKeySettings, etc.)
         ui/            # UI components (Modals, Notifications)
      stores/            # Pinia stores
         auth.ts        # Estado autenticación
         story.ts       # Estado historias
         audio.ts       # Estado audio/TTS
         dictionary.ts  # Estado diccionario
         settings.ts    # Estado configuración
      types/             # TypeScript types
   src-tauri/             # Backend Rust
      src/
         database/      # SQLite + migraciones
         auth/          # Autenticación JWT
         ai_service/    # OpenRouter integration
         tts_service/   # ElevenLabs integration
      migrations/        # Esquema SQLite
   31 comandos Tauri      # API completa documentada
```

### 2.3 Base de Datos Actual (SQLite)

```sql
-- Usuarios con roles
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT,
    es_admin BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historias con metadatos completos
CREATE TABLE historias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    prompt_original TEXT NOT NULL,
    modelo_usado TEXT NOT NULL,
    audio_path TEXT,
    duracion_audio REAL,
    sincronizacion_data TEXT,
    es_favorito BOOLEAN DEFAULT FALSE,
    palabra_count INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Palabras complejas con posiciones
CREATE TABLE palabras_complejas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    historia_id INTEGER NOT NULL,
    palabra TEXT NOT NULL,
    definicion TEXT NOT NULL,
    pronunciacion TEXT,
    posicion_inicio INTEGER NOT NULL,
    posicion_fin INTEGER NOT NULL,
    FOREIGN KEY (historia_id) REFERENCES historias(id) ON DELETE CASCADE
);

-- Sesiones JWT
CREATE TABLE sesiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Anuncios del sistema
CREATE TABLE announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. ESPECIFICACIONES TÉCNICAS - NUEVA ARQUITECTURA

### 3.1 Arquitectura Quasar + Supabase

```
quasar-storyteller/
   src/
      components/              # Componentes Quasar
         auth/               # QForm, QInput para auth
         story/              # QCard, QList para historias
         audio/              # QSlider, QBtn para audio
         settings/           # QTabs, QSelect para config
         common/             # QDialog, QNotify para UI
      stores/                 # Pinia stores con Supabase
         useAuthStore.ts     # Supabase Auth
         useStoryStore.ts    # Supabase Database
         useAudioStore.ts    # Supabase Storage + Edge Functions
         useSettingsStore.ts # Supabase Database
      services/               # Servicios Supabase
         supabase.ts         # Cliente Supabase
         aiService.ts        # OpenRouter integration
         ttsService.ts       # ElevenLabs integration
         dictionaryService.ts # WordsAPI integration
      types/                  # TypeScript types
   src-capacitor/              # Configuración móvil
   dist/                       # Build para Vercel
   supabase/                   # Configuración Supabase
       migrations/             # SQL migrations
       functions/              # Edge Functions
       seed.sql               # Datos iniciales
```

### 3.2 Configuración Quasar

#### quasar.config.js

```javascript
const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    // Configuración base
    framework: {
      config: {},
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage', 'SessionStorage'],
      components: [
        'QLayout',
        'QHeader',
        'QDrawer',
        'QPageContainer',
        'QPage',
        'QBtn',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QCard',
        'QCardSection',
        'QForm',
        'QInput',
        'QSelect',
        'QDialog',
        'QSlider',
        'QLinearProgress',
        'QChip',
        'QTabs',
        'QTab',
        'QTabPanels',
        'QTabPanel',
        'QTable',
        'QTh',
        'QTr',
        'QTd',
        'QCheckbox',
        'QToggle',
        'QRange',
        'QSplitter',
        'QScrollArea',
      ],
    },

    // Capacitor para móvil
    capacitor: {
      hideSplashscreen: true,
    },

    // Build modes
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16',
      },
      vueRouterMode: 'history',
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
        ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
        WORDSAPI_KEY: process.env.WORDSAPI_KEY,
      },
    },

    // Modes para diferentes plataformas
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: ['render'],
    },
  };
});
```

#### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaughan.storyteller',
  appName: 'StoryTeller AI',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1976d2',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      spinnerColor: '#ffffff',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    buildOptions: {
      keystorePath: 'android/app/key.jks',
      keystoreAlias: 'storyteller',
    },
  },
};

export default config;
```

### 3.3 Esquema Supabase (PostgreSQL)

#### Migración 001: Estructura base

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuarios (integrado con Supabase Auth)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre TEXT,
    es_admin BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historias con metadatos completos
CREATE TABLE public.historias (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    prompt_original TEXT NOT NULL,
    modelo_usado TEXT NOT NULL,
    audio_path TEXT,
    duracion_audio REAL,
    sincronizacion_data JSONB, -- JSON para timestamps de audio
    es_favorito BOOLEAN DEFAULT FALSE,
    palabra_count INTEGER NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Palabras complejas con posiciones
CREATE TABLE public.palabras_complejas (
    id BIGSERIAL PRIMARY KEY,
    historia_id BIGINT NOT NULL REFERENCES public.historias(id) ON DELETE CASCADE,
    palabra TEXT NOT NULL,
    definicion TEXT NOT NULL,
    pronunciacion TEXT,
    posicion_inicio INTEGER NOT NULL,
    posicion_fin INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anuncios del sistema
CREATE TABLE public.announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuraciones de usuario
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    openrouter_api_key TEXT,
    elevenlabs_api_key TEXT,
    wordsapi_key TEXT,
    preferred_model TEXT DEFAULT 'openai/gpt-4o',
    audio_volume REAL DEFAULT 1.0,
    playback_rate REAL DEFAULT 1.0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id)
);

-- Índices para optimización
CREATE INDEX idx_historias_usuario_id ON public.historias(usuario_id);
CREATE INDEX idx_historias_fecha_creacion ON public.historias(fecha_creacion DESC);
CREATE INDEX idx_historias_favorito ON public.historias(es_favorito) WHERE es_favorito = TRUE;
CREATE INDEX idx_palabras_complejas_historia_id ON public.palabras_complejas(historia_id);
CREATE INDEX idx_usuarios_auth_id ON public.usuarios(auth_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historias_updated_at BEFORE UPDATE ON public.historias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palabras_complejas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.usuarios
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.usuarios
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Los admins pueden ver todos los usuarios" ON public.usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid() AND es_admin = TRUE
        )
    );

-- Políticas para historias
CREATE POLICY "Los usuarios pueden ver sus propias historias" ON public.historias
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = usuario_id AND auth_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden crear sus propias historias" ON public.historias
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = usuario_id AND auth_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden actualizar sus propias historias" ON public.historias
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = usuario_id AND auth_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden eliminar sus propias historias" ON public.historias
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = usuario_id AND auth_id = auth.uid()
        )
    );

-- Políticas para palabras complejas
CREATE POLICY "Los usuarios pueden ver palabras de sus historias" ON public.palabras_complejas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.historias h
            JOIN public.usuarios u ON h.usuario_id = u.id
            WHERE h.id = historia_id AND u.auth_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden crear palabras en sus historias" ON public.palabras_complejas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.historias h
            JOIN public.usuarios u ON h.usuario_id = u.id
            WHERE h.id = historia_id AND u.auth_id = auth.uid()
        )
    );

-- Políticas para anuncios
CREATE POLICY "Todos pueden ver anuncios activos" ON public.announcements
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Solo admins pueden gestionar anuncios" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid() AND es_admin = TRUE
        )
    );

-- Políticas para configuraciones
CREATE POLICY "Los usuarios pueden ver su configuración" ON public.user_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = usuario_id AND auth_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios pueden actualizar su configuración" ON public.user_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = usuario_id AND auth_id = auth.uid()
        )
    );
```

### 3.4 Edge Functions de Supabase

#### supabase/functions/generate-story/index.ts

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateStoryRequest {
  prompt: string;
  target_words: number;
  title?: string;
  genre: string;
  language: string;
  model?: string;
}

interface WordPosition {
  palabra: string;
  definicion: string;
  pronunciacion?: string;
  posicion_inicio: number;
  posicion_fin: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Autenticación
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Obtener usuario de la base de datos
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (userError || !usuario) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Obtener configuración del usuario
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('usuario_id', usuario.id)
      .single();

    const openrouterApiKey = settings?.openrouter_api_key || Deno.env.get('OPENROUTER_API_KEY');
    const preferredModel = settings?.preferred_model || 'openai/gpt-4o';

    if (!openrouterApiKey) {
      return new Response(JSON.stringify({ error: 'API key de OpenRouter no configurada' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, target_words, title, genre, language, model } =
      (await req.json()) as GenerateStoryRequest;

    // Generar historia con OpenRouter
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://storyteller-ai.vercel.app',
        'X-Title': 'StoryTeller AI',
      },
      body: JSON.stringify({
        model: model || preferredModel,
        messages: [
          {
            role: 'system',
            content: `Eres un escritor experto. Genera una historia en ${language} de exactamente ${target_words} palabras basada en el prompt del usuario. 

IMPORTANTE: Después de la historia, incluye una sección especial con formato JSON que contenga las palabras complejas encontradas:

<PALABRAS_COMPLEJAS>
[
  {
    "palabra": "palabra_encontrada",
    "definicion": "definición clara y concisa",
    "pronunciacion": "pronunciación fonética opcional",
    "posicion_inicio": posicion_caracter_inicio,
    "posicion_fin": posicion_caracter_fin
  }
]
</PALABRAS_COMPLEJAS>

Identifica palabras que puedan ser difíciles para el lector promedio (términos técnicos, palabras poco comunes, vocabulario avanzado). La historia debe ser engaging y bien estructurada.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: target_words * 2,
        stream: false,
      }),
    });

    if (!openrouterResponse.ok) {
      throw new Error(`OpenRouter error: ${openrouterResponse.statusText}`);
    }

    const aiData = await openrouterResponse.json();
    const fullContent = aiData.choices[0].message.content;

    // Separar historia y palabras complejas
    const palabrasMatch = fullContent.match(/<PALABRAS_COMPLEJAS>(.*?)<\/PALABRAS_COMPLEJAS>/s);
    let story = fullContent;
    let palabrasComplejas: WordPosition[] = [];

    if (palabrasMatch) {
      story = fullContent.replace(/<PALABRAS_COMPLEJAS>.*?<\/PALABRAS_COMPLEJAS>/s, '').trim();
      try {
        palabrasComplejas = JSON.parse(palabrasMatch[1]);
      } catch (e) {
        console.error('Error parsing palabras complejas:', e);
      }
    }

    // Contar palabras reales
    const wordCount = story.split(/\s+/).filter((word) => word.length > 0).length;

    // Crear historia en la base de datos
    const storyData = {
      usuario_id: usuario.id,
      titulo: title || `Historia generada el ${new Date().toLocaleDateString()}`,
      contenido: story,
      prompt_original: prompt,
      modelo_usado: model || preferredModel,
      palabra_count: wordCount,
    };

    const { data: nuevaHistoria, error: storyError } = await supabase
      .from('historias')
      .insert(storyData)
      .select()
      .single();

    if (storyError) {
      throw new Error(`Error creando historia: ${storyError.message}`);
    }

    // Insertar palabras complejas si existen
    if (palabrasComplejas.length > 0) {
      const palabrasData = palabrasComplejas.map((palabra) => ({
        historia_id: nuevaHistoria.id,
        palabra: palabra.palabra,
        definicion: palabra.definicion,
        pronunciacion: palabra.pronunciacion || null,
        posicion_inicio: palabra.posicion_inicio,
        posicion_fin: palabra.posicion_fin,
      }));

      await supabase.from('palabras_complejas').insert(palabrasData);
    }

    const response = {
      story: nuevaHistoria,
      word_count: wordCount,
      generation_time_ms: Date.now(),
      palabras_complejas: palabrasComplejas,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

#### supabase/functions/generate-audio/index.ts

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAudioRequest {
  historia_id: number;
  voice_id: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Autenticación
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { historia_id, voice_id, voice_settings } = (await req.json()) as GenerateAudioRequest;

    // Verificar que la historia pertenece al usuario
    const { data: historia, error: historiaError } = await supabase
      .from('historias')
      .select('*, usuarios!inner(*)')
      .eq('id', historia_id)
      .eq('usuarios.auth_id', user.id)
      .single();

    if (historiaError || !historia) {
      return new Response(JSON.stringify({ error: 'Historia no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Obtener API key de ElevenLabs
    const { data: settings } = await supabase
      .from('user_settings')
      .select('elevenlabs_api_key')
      .eq('usuario_id', historia.usuario_id)
      .single();

    const elevenlabsApiKey = settings?.elevenlabs_api_key || Deno.env.get('ELEVENLABS_API_KEY');

    if (!elevenlabsApiKey) {
      return new Response(JSON.stringify({ error: 'API key de ElevenLabs no configurada' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generar audio con ElevenLabs
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'xi-api-key': elevenlabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: historia.contenido,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: voice_settings?.stability || 0.5,
            similarity_boost: voice_settings?.similarity_boost || 0.75,
            style: voice_settings?.style || 0.0,
            use_speaker_boost: voice_settings?.use_speaker_boost || true,
          },
        }),
      },
    );

    if (!elevenlabsResponse.ok) {
      throw new Error(`ElevenLabs error: ${elevenlabsResponse.statusText}`);
    }

    const audioData = await elevenlabsResponse.json();

    // El audio viene en base64, los timestamps en el campo alignment
    const audioBase64 = audioData.audio_base64;
    const alignment = audioData.alignment;

    // Convertir base64 a buffer para subir a Supabase Storage
    const audioBuffer = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));

    // Subir audio a Supabase Storage
    const fileName = `story_${historia_id}_voice_${voice_id}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Error uploading audio: ${uploadError.message}`);
    }

    // Obtener URL pública del audio
    const {
      data: { publicUrl },
    } = supabase.storage.from('audio-files').getPublicUrl(fileName);

    // Procesar timestamps para sincronización
    const timestamps =
      alignment?.chars?.map((char: any, index: number) => ({
        start_time: char.start,
        end_time: char.end,
        text_start: index,
        text_end: index + 1,
        text: char.character,
        confidence: 1.0,
      })) || [];

    // Actualizar historia con datos de audio
    const { error: updateError } = await supabase
      .from('historias')
      .update({
        audio_path: publicUrl,
        duracion_audio: alignment?.duration || 0,
        sincronizacion_data: { timestamps, voice_id },
      })
      .eq('id', historia_id);

    if (updateError) {
      throw new Error(`Error updating historia: ${updateError.message}`);
    }

    const response = {
      success: true,
      audio_path: publicUrl,
      timestamps: timestamps,
      duration: alignment?.duration || 0,
      voice_info: { voice_id },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-audio function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## 4. ARQUITECTURA DE SEGURIDAD Y CONCURRENCIA

### 4.1 Visión de Seguridad Enterprise

StoryTeller AI implementa una arquitectura de seguridad robusta diseñada para manejar miles de usuarios concurrentes mientras mantiene la integridad de datos y previene abusos del sistema.

### 4.2 Sistema de Límites Administrativos

El sistema permite a los administradores configurar quotas y límites por usuario de forma dinámica, aplicando control granular sobre:

#### Configuración de Quotas

```sql
-- Tabla de configuración de límites por rol
CREATE TABLE public.role_quotas (
    id BIGSERIAL PRIMARY KEY,
    role_name TEXT NOT NULL DEFAULT 'user',
    quota_type TEXT NOT NULL, -- 'stories_per_day', 'audio_per_hour', 'concurrent_sessions'
    quota_value INTEGER NOT NULL,
    reset_interval_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(role_name, quota_type)
);

-- Tabla de seguimiento de uso de usuarios
CREATE TABLE public.user_usage_tracking (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    quota_type TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
    last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(usuario_id, quota_type)
);

-- Tabla de excepciones de límites (override por usuario específico)
CREATE TABLE public.user_quota_overrides (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    quota_type TEXT NOT NULL,
    custom_quota_value INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    created_by UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(usuario_id, quota_type)
);
```

#### Función de Verificación de Límites Mejorada

```sql
CREATE OR REPLACE FUNCTION private.check_user_quota_advanced(
    p_usuario_id UUID,
    p_quota_type TEXT
) RETURNS TABLE(
    allowed BOOLEAN,
    current_usage INTEGER,
    quota_limit INTEGER,
    reset_at TIMESTAMP WITH TIME ZONE,
    time_until_reset INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_quota_limit INTEGER;
    v_current_usage INTEGER;
    v_reset_at TIMESTAMP WITH TIME ZONE;
    v_override_quota INTEGER;
BEGIN
    -- Obtener rol del usuario
    SELECT role INTO v_user_role
    FROM public.usuarios
    WHERE id = p_usuario_id;

    -- Verificar si hay override específico para este usuario
    SELECT custom_quota_value INTO v_override_quota
    FROM public.user_quota_overrides
    WHERE usuario_id = p_usuario_id
      AND quota_type = p_quota_type
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1;

    -- Si hay override, usar ese valor, sino usar el del rol
    IF v_override_quota IS NOT NULL THEN
        v_quota_limit := v_override_quota;
    ELSE
        SELECT quota_value INTO v_quota_limit
        FROM public.role_quotas
        WHERE role_name = COALESCE(v_user_role, 'user')
          AND quota_type = p_quota_type
          AND is_active = true;
    END IF;

    -- Si no hay límite configurado, permitir (infinito)
    IF v_quota_limit IS NULL THEN
        RETURN QUERY SELECT true, 0, 999999, NOW() + INTERVAL '24 hours', INTERVAL '24 hours';
        RETURN;
    END IF;

    -- Obtener o crear registro de uso
    INSERT INTO public.user_usage_tracking (usuario_id, quota_type, usage_count, reset_at)
    VALUES (p_usuario_id, p_quota_type, 0, NOW() + INTERVAL '24 hours')
    ON CONFLICT (usuario_id, quota_type)
    DO UPDATE SET
        reset_at = CASE
            WHEN user_usage_tracking.reset_at <= NOW() THEN NOW() + INTERVAL '24 hours'
            ELSE user_usage_tracking.reset_at
        END,
        usage_count = CASE
            WHEN user_usage_tracking.reset_at <= NOW() THEN 0
            ELSE user_usage_tracking.usage_count
        END;

    -- Obtener datos actuales
    SELECT usage_count, reset_at INTO v_current_usage, v_reset_at
    FROM public.user_usage_tracking
    WHERE usuario_id = p_usuario_id AND quota_type = p_quota_type;

    -- Retornar resultado
    RETURN QUERY SELECT
        v_current_usage < v_quota_limit,
        v_current_usage,
        v_quota_limit,
        v_reset_at,
        v_reset_at - NOW();
END;
$$;

-- Función para incrementar uso
CREATE OR REPLACE FUNCTION private.increment_user_usage(
    p_usuario_id UUID,
    p_quota_type TEXT,
    p_increment INTEGER DEFAULT 1
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quota_check RECORD;
BEGIN
    -- Verificar límite
    SELECT * INTO v_quota_check
    FROM private.check_user_quota_advanced(p_usuario_id, p_quota_type)
    LIMIT 1;

    -- Si no está permitido, retornar false
    IF NOT v_quota_check.allowed THEN
        RETURN false;
    END IF;

    -- Incrementar uso
    UPDATE public.user_usage_tracking
    SET usage_count = usage_count + p_increment,
        last_action_at = NOW()
    WHERE usuario_id = p_usuario_id AND quota_type = p_quota_type;

    RETURN true;
END;
$$;
```

#### RLS Policies para Sistema de Quotas

```sql
-- Solo administradores pueden ver/modificar quotas
ALTER TABLE public.role_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Administradores pueden gestionar quotas" ON public.role_quotas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Usuarios pueden ver su propio tracking
ALTER TABLE public.user_usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su propio usage" ON public.user_usage_tracking
    FOR SELECT USING (
        usuario_id = (
            SELECT id FROM public.usuarios WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Sistema puede actualizar usage" ON public.user_usage_tracking
    FOR UPDATE USING (true);

CREATE POLICY "Sistema puede insertar usage" ON public.user_usage_tracking
    FOR INSERT WITH CHECK (true);

-- Solo admins pueden ver/crear overrides
ALTER TABLE public.user_quota_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Administradores gestionan overrides" ON public.user_quota_overrides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );
```

#### Interface de Administración de Quotas

```typescript
// types/admin.ts
export interface RoleQuota {
  id: number;
  role_name: string;
  quota_type: 'stories_per_day' | 'audio_per_hour' | 'concurrent_sessions';
  quota_value: number;
  reset_interval_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserQuotaOverride {
  id: number;
  usuario_id: string;
  quota_type: string;
  custom_quota_value: number;
  expires_at?: string;
  reason?: string;
  created_by: string;
  created_at: string;
}

export interface UserUsageStats {
  usuario_id: string;
  quota_type: string;
  usage_count: number;
  quota_limit: number;
  reset_at: string;
  time_until_reset: string;
  allowed: boolean;
}
```

```typescript
// stores/adminStore.ts
export const useAdminStore = defineStore('admin', () => {
  const quotas = ref<RoleQuota[]>([]);
  const userOverrides = ref<UserQuotaOverride[]>([]);
  const usageStats = ref<UserUsageStats[]>([]);
  const loading = ref(false);

  // Cargar configuración de quotas
  const loadQuotas = async (): Promise<void> => {
    loading.value = true;
    try {
      const { data, error } = await $fetch('/api/admin/quotas');
      if (error) throw error;
      quotas.value = data;
    } catch (error) {
      console.error('Error loading quotas:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar quota
  const updateQuota = async (quotaId: number, updates: Partial<RoleQuota>): Promise<void> => {
    const { data, error } = await $fetch(`/api/admin/quotas/${quotaId}`, {
      method: 'PATCH',
      body: updates,
    });
    if (error) throw error;

    // Actualizar store local
    const index = quotas.value.findIndex((q) => q.id === quotaId);
    if (index !== -1) {
      quotas.value[index] = { ...quotas.value[index], ...updates };
    }
  };

  // Crear override para usuario específico
  const createUserOverride = async (
    override: Omit<UserQuotaOverride, 'id' | 'created_at' | 'created_by'>,
  ): Promise<void> => {
    const { data, error } = await $fetch('/api/admin/user-overrides', {
      method: 'POST',
      body: override,
    });
    if (error) throw error;
    userOverrides.value.push(data);
  };

  // Obtener estadísticas de uso
  const getUserUsageStats = async (userId?: string): Promise<void> => {
    const params = userId ? `?userId=${userId}` : '';
    const { data, error } = await $fetch(`/api/admin/usage-stats${params}`);
    if (error) throw error;
    usageStats.value = data;
  };

  // Resetear uso de un usuario específico
  const resetUserUsage = async (userId: string, quotaType: string): Promise<void> => {
    const { error } = await $fetch('/api/admin/reset-usage', {
      method: 'POST',
      body: { userId, quotaType },
    });
    if (error) throw error;

    // Actualizar stats localmente
    const stat = usageStats.value.find(
      (s) => s.usuario_id === userId && s.quota_type === quotaType,
    );
    if (stat) {
      stat.usage_count = 0;
      stat.allowed = true;
    }
  };

  return {
    quotas,
    userOverrides,
    usageStats,
    loading,
    loadQuotas,
    updateQuota,
    createUserOverride,
    getUserUsageStats,
    resetUserUsage,
  };
});
```

#### Principios de Seguridad:

- **Zero-Trust**: Cada solicitud es validada independientemente
- **Defensa en Profundidad**: Múltiples capas de seguridad
- **Principio de Menor Privilegio**: Permisos mínimos necesarios
- **Auditabilidad Completa**: Trazabilidad de todas las operaciones

#### Componentes de Seguridad:

- **Multi-Factor Authentication (MFA)**: Obligatorio para administradores
- **Row Level Security (RLS)**: Políticas granulares de PostgreSQL
- **Rate Limiting**: Distribuido con Redis y sliding windows
- **Input Validation**: Sanitización y validación estricta
- **Content Security Policy**: Protección XSS y injection
- **Audit Logging**: Registro completo de operaciones críticas

### 4.2 Sistema de Límites Administrativos

#### Gestión de Quotas Configurables

Los administradores pueden configurar límites personalizados para controlar el uso de recursos costosos:

**Tipos de Límites:**

- Historias generadas por usuario/hora (default: 10)
- Audios sintetizados por usuario/hora (default: 5)
- Palabras máximas por historia (default: 2000)
- Límites especiales para usuarios premium/admin

**Panel de Control:**

```typescript
interface SystemLimits {
  stories_per_hour: number;
  audio_per_hour: number;
  max_words_per_story: number;
  premium_multiplier: number;
  admin_bypass: boolean;
}
```

#### Dashboard de Uso en Tiempo Real

Los administradores tienen visibilidad completa del uso del sistema:

- **Métricas de Usuarios**: Actividad por usuario, quotas alcanzadas
- **Métricas de APIs**: Consumo OpenRouter, ElevenLabs, WordsAPI
- **Performance**: Latencia, throughput, errores por endpoint
- **Alertas**: Notificaciones automáticas de límites o anomalías

### 4.3 Esquema de Base de Datos Extendido

#### Migración 002: Tablas de Seguridad y Límites

```sql
-- Configuraciones globales del sistema
CREATE TABLE public.system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotas individuales por usuario
CREATE TABLE public.user_quotas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    quota_type TEXT NOT NULL, -- 'story_generation', 'audio_generation'
    current_usage INTEGER DEFAULT 0,
    quota_limit INTEGER NOT NULL,
    reset_period TEXT NOT NULL, -- 'hourly', 'daily', 'monthly'
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, quota_type, reset_period)
);

-- Log de límites y accesos
CREATE TABLE public.rate_limit_logs (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id),
    operation_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    quota_exceeded BOOLEAN DEFAULT FALSE,
    request_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auditoría de operaciones administrativas
CREATE TABLE public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones activas para control de concurrencia
CREATE TABLE public.user_sessions (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_mobile BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue jobs para procesamiento asíncrono
CREATE TABLE public.job_queues (
    id BIGSERIAL PRIMARY KEY,
    queue_name TEXT NOT NULL,
    job_id TEXT UNIQUE NOT NULL,
    usuario_id UUID REFERENCES public.usuarios(id),
    job_type TEXT NOT NULL, -- 'story_generation', 'audio_synthesis'
    job_payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    priority INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización de consultas
CREATE INDEX idx_user_quotas_usuario_type ON public.user_quotas(usuario_id, quota_type);
CREATE INDEX idx_rate_limit_logs_usuario_created ON public.rate_limit_logs(usuario_id, created_at DESC);
CREATE INDEX idx_audit_logs_usuario_created ON public.audit_logs(usuario_id, created_at DESC);
CREATE INDEX idx_user_sessions_usuario_active ON public.user_sessions(usuario_id, last_activity DESC);
CREATE INDEX idx_job_queues_status_priority ON public.job_queues(status, priority DESC);
CREATE INDEX idx_job_queues_queue_created ON public.job_queues(queue_name, created_at ASC);
```

#### Políticas RLS para Seguridad

```sql
-- System settings solo para administradores
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo administradores ven system_settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- User quotas: usuarios ven las suyas, admins ven todas
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus quotas" ON public.user_quotas
    FOR SELECT USING (
        usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    );

CREATE POLICY "Administradores gestionan quotas" ON public.user_quotas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Rate limit logs: usuarios ven los suyos, admins todos
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus rate limit logs" ON public.rate_limit_logs
    FOR SELECT USING (
        usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    );

CREATE POLICY "Sistema puede insertar rate limit logs" ON public.rate_limit_logs
    FOR INSERT WITH CHECK (true);

-- Audit logs: solo administradores
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo administradores ven audit logs" ON public.audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- User sessions: usuarios ven sus sesiones
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios gestionan sus sesiones" ON public.user_sessions
    FOR ALL USING (
        usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    );

-- Job queues: usuarios ven sus jobs, sistema puede gestionar
ALTER TABLE public.job_queues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus jobs" ON public.job_queues
    FOR SELECT USING (
        usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    );

CREATE POLICY "Sistema gestiona job queues" ON public.job_queues
    FOR ALL USING (
        -- Service role bypass para Edge Functions
        auth.uid() IS NULL OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );
```

#### Funciones de Seguridad

````sql
-- Función para verificar y actualizar quotas
CREATE OR REPLACE FUNCTION private.check_user_quota(
    p_usuario_id UUID,
    p_quota_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quota RECORD;
    v_reset_needed BOOLEAN;
BEGIN
    -- Obtener quota del usuario
    SELECT * INTO v_quota
    FROM public.user_quotas
    WHERE usuario_id = p_usuario_id AND quota_type = p_quota_type;

    -- Si no existe quota, usar límites del sistema
    IF NOT FOUND THEN
        INSERT INTO public.user_quotas (usuario_id, quota_type, quota_limit, reset_period)
        SELECT p_usuario_id, p_quota_type,
               CASE
                   WHEN p_quota_type = 'story_generation' THEN 10
                   WHEN p_quota_type = 'audio_generation' THEN 5
                   ELSE 1
               END,
               'hourly'
        RETURNING * INTO v_quota;
    END IF;

    -- Verificar si necesita reset
    v_reset_needed := CASE
        WHEN v_quota.reset_period = 'hourly' THEN v_quota.last_reset < NOW() - INTERVAL '1 hour'
        WHEN v_quota.reset_period = 'daily' THEN v_quota.last_reset < NOW() - INTERVAL '1 day'
        WHEN v_quota.reset_period = 'monthly' THEN v_quota.last_reset < NOW() - INTERVAL '1 month'
        ELSE false
    END;

    -- Reset si es necesario
    IF v_reset_needed THEN
        UPDATE public.user_quotas
        SET current_usage = 0, last_reset = NOW()
        WHERE id = v_quota.id;
        v_quota.current_usage := 0;
    END IF;

    -- Verificar si puede usar el servicio
    RETURN v_quota.current_usage < v_quota.quota_limit;
END;
$$;

-- Función para incrementar uso
CREATE OR REPLACE FUNCTION private.increment_usage(
    p_usuario_id UUID,
    p_quota_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar quota
    IF NOT private.check_user_quota(p_usuario_id, p_quota_type) THEN
        RETURN false;
    END IF;

    -- Incrementar uso
    UPDATE public.user_quotas
    SET current_usage = current_usage + 1, updated_at = NOW()
    WHERE usuario_id = p_usuario_id AND quota_type = p_quota_type;

    RETURN true;
END;
$$;

-- Función para log de auditoría
CREATE OR REPLACE FUNCTION private.log_audit_action(
    p_usuario_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        usuario_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_usuario_id, p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
END;
$$;

### 4.4 Arquitectura de Alta Concurrencia

#### Sistema de Colas Distribuido con Redis Bull

Para manejar miles de usuarios simultáneos generando historias y audios, implementamos un sistema de colas robustas:

```typescript
// utils/queueManager.ts
import { Queue, Worker, Job } from 'bull'
import IORedis from 'ioredis'

const redis = new IORedis(process.env.REDIS_URL)

// Configuración de colas por prioridad
export const storyQueue = new Queue('story generation', {
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: 'exponential',
  }
})

export const audioQueue = new Queue('audio synthesis', {
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 3,
    attempts: 2,
    backoff: 'exponential',
  }
})

// Tipos de jobs
interface StoryGenerationJob {
  userId: string
  prompt: string
  metadata: {
    words: number
    difficulty: string
    category: string
  }
}

interface AudioSynthesisJob {
  userId: string
  storyId: number
  voiceId: string
  text: string
  settings: {
    stability: number
    similarity: number
  }
}

// Procesador de historias con rate limiting
export const processStoryGeneration = async (job: Job<StoryGenerationJob>) => {
  const { userId, prompt, metadata } = job.data

  try {
    // Verificar quota antes de procesar
    const quotaAllowed = await checkUserQuota(userId, 'story_generation')
    if (!quotaAllowed) {
      throw new Error('Quota de generación de historias excedida')
    }

    // Actualizar progreso
    job.progress(10)

    // Generar historia con OpenRouter
    const story = await generateStoryWithOpenRouter({
      prompt,
      maxTokens: Math.min(metadata.words * 1.5, 2000),
      temperature: 0.7
    })

    job.progress(60)

    // Extraer palabras complejas
    const complexWords = await extractComplexWords(story.content)

    job.progress(80)

    // Guardar en base de datos
    const { data: savedStory, error } = await supabase
      .from('historias')
      .insert({
        usuario_id: userId,
        titulo: story.title,
        contenido: story.content,
        palabras_complejas: complexWords,
        metadata: {
          ...metadata,
          processing_time: Date.now() - job.timestamp
        }
      })
      .select()
      .single()

    if (error) throw error

    // Incrementar uso
    await incrementUsage(userId, 'story_generation')

    job.progress(100)

    return {
      success: true,
      story: savedStory,
      processingTime: Date.now() - job.timestamp
    }

  } catch (error) {
    console.error('Error processing story generation:', error)
    throw error
  }
}

// Procesador de audio con priorización
export const processAudioSynthesis = async (job: Job<AudioSynthesisJob>) => {
  const { userId, storyId, voiceId, text, settings } = job.data

  try {
    // Verificar quota
    const quotaAllowed = await checkUserQuota(userId, 'audio_generation')
    if (!quotaAllowed) {
      throw new Error('Quota de síntesis de audio excedida')
    }

    job.progress(15)

    // Llamar a ElevenLabs API
    const audioResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: settings
      })
    })

    if (!audioResponse.ok) {
      throw new Error(`ElevenLabs error: ${audioResponse.statusText}`)
    }

    job.progress(60)

    const audioBuffer = await audioResponse.arrayBuffer()

    // Subir a Supabase Storage
    const fileName = `story_${storyId}_${Date.now()}.mp3`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    job.progress(85)

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    // Actualizar historia con audio
    const { error: updateError } = await supabase
      .from('historias')
      .update({
        audio_path: publicUrl,
        audio_generated_at: new Date().toISOString()
      })
      .eq('id', storyId)

    if (updateError) throw updateError

    // Incrementar uso
    await incrementUsage(userId, 'audio_generation')

    job.progress(100)

    return {
      success: true,
      audioUrl: publicUrl,
      processingTime: Date.now() - job.timestamp
    }

  } catch (error) {
    console.error('Error processing audio synthesis:', error)
    throw error
  }
}
````

#### Rate Limiting Distribuido

```typescript
// utils/rateLimiter.ts
import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en ms
  maxRequests: number; // Máximo de requests por ventana
  keyGenerator: (req: Request) => string;
}

export class DistributedRateLimiter {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async checkLimit(
    config: RateLimitConfig,
    identifier: string,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${config.keyGenerator}:${identifier}`;
    const window = Math.floor(Date.now() / config.windowMs);
    const windowKey = `${key}:${window}`;

    // Script Lua para operación atómica
    const luaScript = `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local expiry = tonumber(ARGV[3])
      
      local current = redis.call('INCR', key)
      if current == 1 then
        redis.call('EXPIRE', key, expiry)
      end
      
      local remaining = math.max(0, limit - current)
      local allowed = current <= limit
      
      return {allowed, remaining, current}
    `;

    const [allowed, remaining, current] = (await this.redis.eval(
      luaScript,
      1,
      windowKey,
      config.maxRequests,
      window,
      Math.ceil(config.windowMs / 1000),
    )) as [number, number, number];

    return {
      allowed: allowed === 1,
      remaining: remaining,
      resetTime: (window + 1) * config.windowMs,
    };
  }

  // Rate limiter específico para APIs costosas
  async checkApiLimit(userId: string, apiType: 'openrouter' | 'elevenlabs'): Promise<boolean> {
    const limits = {
      openrouter: { windowMs: 3600000, maxRequests: 100 }, // 100/hora
      elevenlabs: { windowMs: 3600000, maxRequests: 50 }, // 50/hora
    };

    const config = limits[apiType];
    const result = await this.checkLimit(
      {
        ...config,
        keyGenerator: () => `api:${apiType}`,
      },
      userId,
    );

    // Log para auditoría
    await this.logRateLimit(userId, apiType, result.allowed);

    return result.allowed;
  }

  private async logRateLimit(userId: string, apiType: string, allowed: boolean) {
    try {
      await supabase.from('rate_limit_logs').insert({
        usuario_id: userId,
        operation_type: apiType,
        quota_exceeded: !allowed,
        request_metadata: { timestamp: Date.now() },
      });
    } catch (error) {
      console.error('Failed to log rate limit:', error);
    }
  }
}

// Middleware para Nuxt/Express
export const rateLimitMiddleware = (config: RateLimitConfig) => {
  const limiter = new DistributedRateLimiter(process.env.REDIS_URL!);

  return async (req: any, res: any, next: any) => {
    const identifier = config.keyGenerator(req);
    const result = await limiter.checkLimit(config, identifier);

    // Headers informativos
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }

    next();
  };
};
```

#### Monitoreo en Tiempo Real

````typescript
// utils/systemMonitor.ts
export class SystemMonitor {
  private redis: Redis
  private metrics: Map<string, number> = new Map()

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL)
    this.startMetricsCollection()
  }

  // Recolectar métricas cada 30 segundos
  private startMetricsCollection() {
    setInterval(async () => {
      await this.collectMetrics()
    }, 30000)
  }

  private async collectMetrics() {
    try {
      // Métricas de Redis/Queue
      const storyQueueStats = await storyQueue.getJobCounts()
      const audioQueueStats = await audioQueue.getJobCounts()

      // Métricas de base de datos
      const { data: dbStats } = await supabase.rpc('get_system_stats')

      // Métricas de uso de APIs
      const apiUsage = await this.getApiUsageMetrics()

      const currentMetrics = {
        timestamp: Date.now(),
        queues: {
          story: storyQueueStats,
          audio: audioQueueStats
        },
        database: dbStats,
        apis: apiUsage,
        system: {
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      }

      // Almacenar en Redis con TTL de 24 horas
      await this.redis.setex(
        `metrics:${Math.floor(Date.now() / 60000)}`, // Por minuto
        86400, // 24 horas
        JSON.stringify(currentMetrics)
      )

      // Verificar alertas
      await this.checkAlerts(currentMetrics)

    } catch (error) {
      console.error('Error collecting metrics:', error)
    }
  }

  private async getApiUsageMetrics() {
    const now = Date.now()
    const hourAgo = now - 3600000

    // Contar requests por API en la última hora
    const [openrouterCount, elevenlabsCount] = await Promise.all([
      this.redis.zcount('api:openrouter:requests', hourAgo, now),
      this.redis.zcount('api:elevenlabs:requests', hourAgo, now)
    ])

    return {
      openrouter: { requests_last_hour: openrouterCount },
      elevenlabs: { requests_last_hour: elevenlabsCount }
    }
  }

  private async checkAlerts(metrics: any) {
    const alerts = []

    // Alert: Cola de historias muy larga
    if (metrics.queues.story.waiting > 100) {
      alerts.push({
        type: 'queue_backlog',
        message: `Cola de historias con ${metrics.queues.story.waiting} jobs pendientes`,
        severity: 'warning'
      })
    }

    // Alert: Alto uso de memoria
    const memoryUsageMB = metrics.system.memory.heapUsed / 1024 / 1024
    if (memoryUsageMB > 500) {
      alerts.push({
        type: 'high_memory',
        message: `Uso de memoria: ${memoryUsageMB.toFixed(2)}MB`,
        severity: 'warning'
      })
    }

    // Alert: API rate limiting alto
    if (metrics.apis.openrouter.requests_last_hour > 800) {
      alerts.push({
        type: 'api_rate_limit',
        message: 'OpenRouter cerca del límite de rate',
        severity: 'critical'
      })
    }

    // Enviar alertas si las hay
    if (alerts.length > 0) {
      await this.sendAlerts(alerts)
    }
  }

  private async sendAlerts(alerts: any[]) {
    // Aquí se pueden integrar notificaciones (Slack, email, etc.)
    console.warn('System Alerts:', alerts)

    // Guardar en base de datos
    for (const alert of alerts) {
      await supabase
        .from('system_alerts')
        .insert({
          alert_type: alert.type,
          message: alert.message,
          severity: alert.severity,
          created_at: new Date().toISOString()
        })
    }
  }

  // API para dashboard de administración
  async getMetricsDashboard(hours = 24): Promise<any> {
    const endTime = Date.now()
    const startTime = endTime - (hours * 3600000)

    const metricsKeys = await this.redis.keys(
      `metrics:${Math.floor(startTime / 60000)}*`
    )

    const metricsData = await Promise.all(
      metricsKeys.map(key => this.redis.get(key))
    )

    return metricsData
      .filter(data => data !== null)
      .map(data => JSON.parse(data))
      .sort((a, b) => a.timestamp - b.timestamp)
  }
}
---

## 5. IMPLEMENTACIÓN DE STORES Y SERVICIOS MEJORADOS

### 5.1 Store Principal con Control de Quotas

```typescript
// stores/storytellerStore.ts
export const useStorytellerStore = defineStore('storyteller', () => {
  // Estado reactivo
  const historias = ref<Historia[]>([])
  const usuarioActual = ref<Usuario | null>(null)
  const userQuotas = ref<UserQuotaStatus[]>([])
  const loading = ref(false)
  const generationQueue = ref<QueueJob[]>([])
  const audioQueue = ref<QueueJob[]>([])

  // Tipos extendidos
  interface UserQuotaStatus {
    quota_type: 'story_generation' | 'audio_generation'
    current_usage: number
    quota_limit: number
    reset_at: string
    allowed: boolean
  }

  interface QueueJob {
    id: string
    type: 'story' | 'audio'
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    created_at: string
    estimated_completion?: string
  }

  // Servicios integrados
  const queueService = new QueueService()
  const quotaService = new QuotaService()

  // Cargar quotas del usuario
  const loadUserQuotas = async (): Promise<void> => {
    if (!usuarioActual.value) return

    try {
      const { data, error } = await $fetch('/api/user/quotas', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${useSupabaseSession().value.access_token}` }
      })

      if (error) throw error
      userQuotas.value = data
    } catch (error) {
      console.error('Error loading user quotas:', error)
      throw error
    }
  }

  // Verificar si puede generar historia
  const canGenerateStory = computed((): boolean => {
    const storyQuota = userQuotas.value.find(q => q.quota_type === 'story_generation')
    return storyQuota?.allowed ?? false
  })

  // Verificar si puede generar audio
  const canGenerateAudio = computed((): boolean => {
    const audioQuota = userQuotas.value.find(q => q.quota_type === 'audio_generation')
    return audioQuota?.allowed ?? false
  })

  // Generar historia con cola asíncrona
  const generarHistoria = async (parametros: StoryGenerationParams): Promise<QueueJob> => {
    if (!canGenerateStory.value) {
      throw new Error('Quota de generación de historias excedida')
    }

    loading.value = true
    try {
      // Agregar trabajo a la cola
      const job = await queueService.addStoryJob({
        userId: usuarioActual.value!.id,
        prompt: parametros.prompt,
        metadata: {
          words: parametros.palabras,
          difficulty: parametros.dificultad,
          category: parametros.categoria
        }
      })

      // Agregar a cola local para UI
      generationQueue.value.push({
        id: job.id,
        type: 'story',
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString()
      })

      // Actualizar quotas localmente
      const storyQuota = userQuotas.value.find(q => q.quota_type === 'story_generation')
      if (storyQuota) {
        storyQuota.current_usage++
        storyQuota.allowed = storyQuota.current_usage < storyQuota.quota_limit
      }

      return job
    } finally {
      loading.value = false
    }
  }

  // Generar audio con cola asíncrona
  const generarAudio = async (historiaId: number, configuracion: AudioConfig): Promise<QueueJob> => {
    if (!canGenerateAudio.value) {
      throw new Error('Quota de generación de audio excedida')
    }

    loading.value = true
    try {
      const job = await queueService.addAudioJob({
        userId: usuarioActual.value!.id,
        storyId: historiaId,
        voiceId: configuracion.voiceId,
        settings: configuracion.voiceSettings
      })

      audioQueue.value.push({
        id: job.id,
        type: 'audio',
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString()
      })

      // Actualizar quota de audio
      const audioQuota = userQuotas.value.find(q => q.quota_type === 'audio_generation')
      if (audioQuota) {
        audioQuota.current_usage++
        audioQuota.allowed = audioQuota.current_usage < audioQuota.quota_limit
      }

      return job
    } finally {
      loading.value = false
    }
  }

  // Monitorear progreso de trabajos en cola
  const monitorearTrabajos = (): void => {
    // Polling cada 2 segundos para actualizar estado de trabajos
    setInterval(async () => {
      if (generationQueue.value.length === 0 && audioQueue.value.length === 0) return

      try {
        const allJobs = [...generationQueue.value, ...audioQueue.value]
        const jobIds = allJobs.filter(j => j.status !== 'completed' && j.status !== 'failed')
          .map(j => j.id)

        if (jobIds.length === 0) return

        const { data: jobStatuses } = await $fetch('/api/jobs/status', {
          method: 'POST',
          body: { jobIds }
        })

        // Actualizar estado local
        for (const status of jobStatuses) {
          const localJob = allJobs.find(j => j.id === status.id)
          if (localJob) {
            localJob.status = status.status
            localJob.progress = status.progress

            // Si completó, cargar resultado
            if (status.status === 'completed') {
              if (localJob.type === 'story') {
                await cargarHistorias() // Recargar historias
              }
              // Remover de cola local después de 5 segundos
              setTimeout(() => {
                const queueArray = localJob.type === 'story' ? generationQueue : audioQueue
                const index = queueArray.value.findIndex(j => j.id === localJob.id)
                if (index > -1) queueArray.value.splice(index, 1)
              }, 5000)
            }
          }
        }
      } catch (error) {
        console.error('Error monitoring jobs:', error)
      }
    }, 2000)
  }

  // Estado de conexión en tiempo real
  const connectionStatus = ref<'connected' | 'disconnected' | 'reconnecting'>('disconnected')

  // WebSocket para actualizaciones en tiempo real
  const setupRealtimeConnection = (): void => {
    if (!usuarioActual.value) return

    const channel = useSupabaseClient().channel('user_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'historias',
        filter: `usuario_id=eq.${usuarioActual.value.id}`
      }, (payload) => {
        // Actualizar historias en tiempo real
        handleRealtimeUpdate(payload)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_quotas',
        filter: `usuario_id=eq.${usuarioActual.value.id}`
      }, (payload) => {
        // Actualizar quotas en tiempo real
        handleQuotaUpdate(payload)
      })
      .subscribe((status) => {
        connectionStatus.value = status === 'SUBSCRIBED' ? 'connected' : 'disconnected'
      })
  }

  const handleRealtimeUpdate = (payload: any): void => {
    if (payload.eventType === 'INSERT') {
      historias.value.unshift(payload.new)
    } else if (payload.eventType === 'UPDATE') {
      const index = historias.value.findIndex(h => h.id === payload.new.id)
      if (index > -1) {
        historias.value[index] = payload.new
      }
    } else if (payload.eventType === 'DELETE') {
      const index = historias.value.findIndex(h => h.id === payload.old.id)
      if (index > -1) {
        historias.value.splice(index, 1)
      }
    }
  }

  const handleQuotaUpdate = (payload: any): void => {
    if (payload.eventType === 'UPDATE') {
      const index = userQuotas.value.findIndex(q =>
        q.quota_type === payload.new.quota_type
      )
      if (index > -1) {
        userQuotas.value[index] = {
          ...userQuotas.value[index],
          current_usage: payload.new.current_usage,
          allowed: payload.new.current_usage < payload.new.quota_limit
        }
      }
    }
  }

  // Limpiar recursos al desmontar
  const cleanup = (): void => {
    useSupabaseClient().removeAllChannels()
  }

  return {
    // Estado
    historias,
    usuarioActual,
    userQuotas,
    loading,
    generationQueue,
    audioQueue,
    connectionStatus,

    // Getters
    canGenerateStory,
    canGenerateAudio,

    // Acciones
    loadUserQuotas,
    generarHistoria,
    generarAudio,
    monitorearTrabajos,
    setupRealtimeConnection,
    cleanup
  }
})
````

### 5.2 Servicios Especializados

```typescript
// services/queueService.ts
export class QueueService {
  private baseUrl = '/api/queues';

  async addStoryJob(params: StoryJobParams): Promise<QueueJob> {
    const response = await $fetch(`${this.baseUrl}/story`, {
      method: 'POST',
      body: params,
    });
    return response.data;
  }

  async addAudioJob(params: AudioJobParams): Promise<QueueJob> {
    const response = await $fetch(`${this.baseUrl}/audio`, {
      method: 'POST',
      body: params,
    });
    return response.data;
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await $fetch(`${this.baseUrl}/status/${jobId}`);
    return response.data;
  }

  async cancelJob(jobId: string): Promise<void> {
    await $fetch(`${this.baseUrl}/cancel/${jobId}`, {
      method: 'DELETE',
    });
  }
}

// services/quotaService.ts
export class QuotaService {
  async getUserQuotas(userId: string): Promise<UserQuotaStatus[]> {
    const { data } = await supabase.rpc('get_user_quotas_status', {
      p_usuario_id: userId,
    });
    return data;
  }

  async checkQuota(userId: string, quotaType: string): Promise<boolean> {
    const { data } = await supabase.rpc('check_user_quota_advanced', {
      p_usuario_id: userId,
      p_quota_type: quotaType,
    });
    return data[0]?.allowed ?? false;
  }

  async incrementUsage(userId: string, quotaType: string): Promise<boolean> {
    const { data } = await supabase.rpc('increment_user_usage', {
      p_usuario_id: userId,
      p_quota_type: quotaType,
    });
    return data;
  }
}
```

### 5.3 Composables para Gestión de Estado

```typescript
// composables/useQueue.ts
export const useQueue = () => {
  const store = useStorytellerStore();

  const submitStoryGeneration = async (params: StoryGenerationParams) => {
    try {
      const job = await store.generarHistoria(params);

      // Mostrar notificación de éxito
      useNuxtApp().$toast.success('Historia añadida a la cola de generación');

      return job;
    } catch (error) {
      if (error.message.includes('Quota')) {
        useNuxtApp().$toast.error('Has alcanzado tu límite de historias por hora');
      } else {
        useNuxtApp().$toast.error('Error al procesar la solicitud');
      }
      throw error;
    }
  };

  const submitAudioGeneration = async (historiaId: number, config: AudioConfig) => {
    try {
      const job = await store.generarAudio(historiaId, config);

      useNuxtApp().$toast.success('Audio añadido a la cola de generación');

      return job;
    } catch (error) {
      if (error.message.includes('Quota')) {
        useNuxtApp().$toast.error('Has alcanzado tu límite de audios por hora');
      } else {
        useNuxtApp().$toast.error('Error al procesar el audio');
      }
      throw error;
    }
  };

  return {
    submitStoryGeneration,
    submitAudioGeneration,
    generationQueue: readonly(store.generationQueue),
    audioQueue: readonly(store.audioQueue),
  };
};

// composables/useQuotas.ts
export const useQuotas = () => {
  const store = useStorytellerStore();

  const quotaStatus = computed(() => {
    return {
      story: store.userQuotas.find((q) => q.quota_type === 'story_generation'),
      audio: store.userQuotas.find((q) => q.quota_type === 'audio_generation'),
    };
  });

  const canGenerate = computed(() => ({
    story: store.canGenerateStory,
    audio: store.canGenerateAudio,
  }));

  const getQuotaMessage = (type: 'story' | 'audio'): string => {
    const quota = quotaStatus.value[type];
    if (!quota) return '';

    if (quota.allowed) {
      const remaining = quota.quota_limit - quota.current_usage;
      return `${remaining} ${type === 'story' ? 'historias' : 'audios'} restantes`;
    } else {
      const resetTime = new Date(quota.reset_at).toLocaleTimeString();
      return `Límite alcanzado. Se reinicia a las ${resetTime}`;
    }
  };

  return {
    quotaStatus,
    canGenerate,
    getQuotaMessage,
  };
};
```

---

## 6. COMPONENTES DE ADMINISTRACIÓN

### 6.1 Panel de Administración Principal

```vue
<!-- pages/admin/dashboard.vue -->
<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1 class="text-2xl font-bold">Panel de Administración</h1>
      <div class="real-time-status">
        <StatusIndicator :status="connectionStatus" />
      </div>
    </div>

    <!-- Métricas en tiempo real -->
    <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Usuarios Activos"
        :value="metrics.activeUsers"
        :trend="metrics.usersTrend"
        icon="users"
      />
      <MetricCard
        title="Historias Cola"
        :value="metrics.storyQueueLength"
        :trend="metrics.queueTrend"
        icon="queue"
      />
      <MetricCard
        title="APIs Usados/Hora"
        :value="metrics.apiUsageHour"
        :trend="metrics.apiTrend"
        icon="api"
      />
      <MetricCard
        title="Errores/Min"
        :value="metrics.errorRate"
        :trend="metrics.errorTrend"
        icon="alert"
        :is-critical="metrics.errorRate > 10"
      />
    </div>

    <!-- Tabs de gestión -->
    <QTabs v-model="activeTab" class="admin-tabs">
      <QTab name="quotas" label="Gestión de Quotas" />
      <QTab name="users" label="Usuarios" />
      <QTab name="monitoring" label="Monitoreo" />
      <QTab name="system" label="Sistema" />
    </QTabs>

    <QTabPanels v-model="activeTab" class="mt-6">
      <!-- Panel de Quotas -->
      <QTabPanel name="quotas">
        <QuotaManagementPanel />
      </QTabPanel>

      <!-- Panel de Usuarios -->
      <QTabPanel name="users">
        <UserManagementPanel />
      </QTabPanel>

      <!-- Panel de Monitoreo -->
      <QTabPanel name="monitoring">
        <MonitoringPanel />
      </QTabPanel>

      <!-- Panel de Sistema -->
      <QTabPanel name="system">
        <SystemConfigPanel />
      </QTabPanel>
    </QTabPanels>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin-only',
});

const adminStore = useAdminStore();
const { metrics, connectionStatus } = storeToRefs(adminStore);

const activeTab = ref('quotas');

// Cargar métricas al montar
onMounted(async () => {
  await adminStore.loadMetrics();
  adminStore.startRealtimeUpdates();
});

onUnmounted(() => {
  adminStore.stopRealtimeUpdates();
});
</script>
```

### 6.2 Gestión de Quotas por Usuario

```vue
<!-- components/admin/QuotaManagementPanel.vue -->
<template>
  <div class="quota-management">
    <!-- Configuración global de quotas -->
    <div class="global-settings mb-8">
      <h2 class="text-xl font-semibold mb-4">Configuración Global de Límites</h2>

      <QCard class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="quotaType in quotaTypes" :key="quotaType.key">
            <label class="block text-sm font-medium mb-2">
              {{ quotaType.label }}
            </label>
            <QInput
              v-model.number="globalQuotas[quotaType.key]"
              type="number"
              :min="1"
              :max="1000"
              @blur="updateGlobalQuota(quotaType.key)"
            />
            <small class="text-gray-500">Por {{ quotaType.period }}</small>
          </div>
        </div>
      </QCard>
    </div>

    <!-- Búsqueda y filtros -->
    <div class="search-controls mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <QInput
          v-model="searchQuery"
          placeholder="Buscar usuario por email..."
          class="flex-1"
          clearable
        />
        <QSelect v-model="filterRole" :options="roleOptions" label="Filtrar por rol" class="w-48" />
      </div>
    </div>

    <!-- Tabla de usuarios y sus quotas -->
    <QTable
      :rows="filteredUsers"
      :columns="userColumns"
      :loading="loading"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-quotas="props">
        <QTd :props="props">
          <div class="quota-controls">
            <div v-for="quota in props.row.quotas" :key="quota.type" class="quota-item">
              <div class="quota-info">
                <span class="quota-label">{{ getQuotaLabel(quota.type) }}:</span>
                <span class="quota-usage" :class="getUsageClass(quota)">
                  {{ quota.current_usage }}/{{ quota.limit }}
                </span>
              </div>
              <QLinearProgress
                :value="quota.current_usage / quota.limit"
                :color="getProgressColor(quota)"
                size="8px"
                class="mt-1"
              />
            </div>
          </div>
        </QTd>
      </template>

      <template v-slot:body-cell-actions="props">
        <QTd :props="props">
          <div class="action-buttons">
            <QBtn size="sm" color="primary" flat @click="openQuotaEditor(props.row)">
              Editar Quotas
            </QBtn>
            <QBtn size="sm" color="warning" flat @click="resetUserQuotas(props.row.id)">
              Resetear
            </QBtn>
          </div>
        </QTd>
      </template>
    </QTable>

    <!-- Dialog para editar quotas de usuario específico -->
    <QDialog v-model="showQuotaEditor">
      <QCard class="w-96">
        <QCardSection>
          <div class="text-h6">Editar Quotas de {{ selectedUser?.email }}</div>
        </QCardSection>

        <QCardSection>
          <div v-for="quotaType in quotaTypes" :key="quotaType.key" class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="font-medium">{{ quotaType.label }}</label>
              <QCheckbox v-model="customQuotas[quotaType.key].enabled" label="Custom" />
            </div>

            <QInput
              v-model.number="customQuotas[quotaType.key].value"
              type="number"
              :disable="!customQuotas[quotaType.key].enabled"
              :min="0"
              :max="1000"
            />

            <QSelect
              v-model="customQuotas[quotaType.key].period"
              :options="periodOptions"
              :disable="!customQuotas[quotaType.key].enabled"
              class="mt-2"
            />
          </div>
        </QCardSection>

        <QCardActions align="right">
          <QBtn flat label="Cancelar" @click="closeQuotaEditor" />
          <QBtn color="primary" label="Guardar" @click="saveCustomQuotas" />
        </QCardActions>
      </QCard>
    </QDialog>
  </div>
</template>

<script setup lang="ts">
const adminStore = useAdminStore();
const { loading, users } = storeToRefs(adminStore);

const searchQuery = ref('');
const filterRole = ref('all');
const showQuotaEditor = ref(false);
const selectedUser = ref<User | null>(null);
const customQuotas = ref<Record<string, { enabled: boolean; value: number; period: string }>>({});

const quotaTypes = [
  { key: 'story_generation', label: 'Generación de Historias', period: 'hora' },
  { key: 'audio_generation', label: 'Síntesis de Audio', period: 'hora' },
  { key: 'concurrent_sessions', label: 'Sesiones Concurrentes', period: 'simultáneas' },
];

const globalQuotas = reactive({
  story_generation: 10,
  audio_generation: 5,
  concurrent_sessions: 3,
});

const roleOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Usuarios', value: 'user' },
  { label: 'Premium', value: 'premium' },
  { label: 'Administradores', value: 'admin' },
];

const periodOptions = [
  { label: 'Por hora', value: 'hourly' },
  { label: 'Por día', value: 'daily' },
  { label: 'Por semana', value: 'weekly' },
];

const userColumns = [
  { name: 'email', label: 'Usuario', field: 'email', sortable: true },
  { name: 'role', label: 'Rol', field: 'role', sortable: true },
  { name: 'quotas', label: 'Quotas Actuales', field: 'quotas' },
  { name: 'last_activity', label: 'Última Actividad', field: 'last_activity', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions' },
];

const filteredUsers = computed(() => {
  let result = users.value;

  if (searchQuery.value) {
    result = result.filter((user) =>
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }

  if (filterRole.value !== 'all') {
    result = result.filter((user) => user.role === filterRole.value);
  }

  return result;
});

const openQuotaEditor = (user: User) => {
  selectedUser.value = user;

  // Inicializar quotas personalizadas
  quotaTypes.forEach((type) => {
    const existingQuota = user.quotas.find((q) => q.type === type.key);
    customQuotas.value[type.key] = {
      enabled: !!existingQuota?.is_custom,
      value: existingQuota?.limit || globalQuotas[type.key],
      period: existingQuota?.period || 'hourly',
    };
  });

  showQuotaEditor.value = true;
};

const closeQuotaEditor = () => {
  showQuotaEditor.value = false;
  selectedUser.value = null;
  customQuotas.value = {};
};

const saveCustomQuotas = async () => {
  if (!selectedUser.value) return;

  const updates = [];

  for (const [quotaType, config] of Object.entries(customQuotas.value)) {
    if (config.enabled) {
      updates.push({
        usuario_id: selectedUser.value.id,
        quota_type: quotaType,
        custom_quota_value: config.value,
        period: config.period,
        reason: 'Configuración manual por administrador',
      });
    }
  }

  try {
    await adminStore.updateUserQuotas(selectedUser.value.id, updates);
    closeQuotaEditor();
    $q.notify({
      type: 'positive',
      message: 'Quotas actualizadas correctamente',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar quotas',
    });
  }
};

const updateGlobalQuota = async (quotaType: string) => {
  try {
    await adminStore.updateGlobalQuota(quotaType, globalQuotas[quotaType]);
    $q.notify({
      type: 'positive',
      message: `Límite global de ${quotaType} actualizado`,
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar límite global',
    });
  }
};

const resetUserQuotas = async (userId: string) => {
  try {
    await adminStore.resetUserQuotas(userId);
    $q.notify({
      type: 'positive',
      message: 'Quotas del usuario reseteadas',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al resetear quotas',
    });
  }
};

const getQuotaLabel = (type: string): string => {
  return quotaTypes.find((q) => q.key === type)?.label || type;
};

const getUsageClass = (quota: any): string => {
  const percentage = quota.current_usage / quota.limit;
  if (percentage >= 0.9) return 'text-red-600 font-bold';
  if (percentage >= 0.7) return 'text-orange-600 font-semibold';
  return 'text-green-600';
};

const getProgressColor = (quota: any): string => {
  const percentage = quota.current_usage / quota.limit;
  if (percentage >= 0.9) return 'red';
  if (percentage >= 0.7) return 'orange';
  return 'green';
};

// Cargar datos al montar
onMounted(async () => {
  await adminStore.loadUsers();
  await adminStore.loadGlobalQuotas();
});
</script>
```

### 6.3 Panel de Monitoreo en Tiempo Real

```vue
<!-- components/admin/MonitoringPanel.vue -->
<template>
  <div class="monitoring-panel">
    <!-- Alertas activas -->
    <div v-if="alerts.length > 0" class="alerts-section mb-6">
      <h3 class="text-lg font-semibold mb-3">Alertas Activas</h3>
      <div class="grid gap-3">
        <QCard
          v-for="alert in alerts"
          :key="alert.id"
          :class="[
            'alert-card border-l-4 p-4',
            {
              'border-red-500 bg-red-50': alert.severity === 'critical',
              'border-yellow-500 bg-yellow-50': alert.severity === 'warning',
              'border-blue-500 bg-blue-50': alert.severity === 'info',
            },
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">{{ alert.message }}</h4>
              <small class="text-gray-600">{{ formatDate(alert.created_at) }}</small>
            </div>
            <QBtn size="sm" flat icon="close" @click="dismissAlert(alert.id)" />
          </div>
        </QCard>
      </div>
    </div>

    <!-- Gráficos de métricas -->
    <div class="metrics-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Uso de APIs en tiempo real -->
      <QCard class="p-6">
        <h3 class="text-lg font-semibold mb-4">Uso de APIs (Última Hora)</h3>
        <LineChart :data="apiUsageChartData" :options="chartOptions" height="300" />
      </QCard>

      <!-- Estado de colas -->
      <QCard class="p-6">
        <h3 class="text-lg font-semibold mb-4">Estado de Colas</h3>
        <BarChart :data="queueStatusChartData" :options="barChartOptions" height="300" />
      </QCard>

      <!-- Usuarios activos -->
      <QCard class="p-6">
        <h3 class="text-lg font-semibold mb-4">Usuarios Activos</h3>
        <DoughnutChart :data="activeUsersChartData" :options="doughnutOptions" height="300" />
      </QCard>

      <!-- Rendimiento del sistema -->
      <QCard class="p-6">
        <h3 class="text-lg font-semibold mb-4">Rendimiento del Sistema</h3>
        <div class="performance-metrics">
          <div v-for="metric in performanceMetrics" :key="metric.name" class="metric-item mb-4">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium">{{ metric.name }}</span>
              <span class="text-sm">{{ metric.value }}{{ metric.unit }}</span>
            </div>
            <QLinearProgress :value="metric.percentage / 100" :color="metric.color" size="8px" />
          </div>
        </div>
      </QCard>
    </div>

    <!-- Logs de sistema en tiempo real -->
    <QCard class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Logs del Sistema</h3>
        <div class="log-controls">
          <QSelect v-model="logLevel" :options="logLevelOptions" label="Nivel" class="w-32 mr-2" />
          <QBtn
            :color="autoRefresh ? 'primary' : 'grey'"
            :label="autoRefresh ? 'Pausar' : 'Reanudar'"
            @click="toggleAutoRefresh"
          />
        </div>
      </div>

      <div
        class="log-viewer bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto"
      >
        <div
          v-for="log in filteredLogs"
          :key="log.id"
          :class="[
            'log-entry mb-1',
            {
              'text-red-400': log.level === 'error',
              'text-yellow-400': log.level === 'warn',
              'text-blue-400': log.level === 'info',
              'text-gray-400': log.level === 'debug',
            },
          ]"
        >
          [{{ formatTime(log.timestamp) }}] {{ log.level.toUpperCase() }}: {{ log.message }}
        </div>
      </div>
    </QCard>
  </div>
</template>

<script setup lang="ts">
import { LineChart, BarChart, DoughnutChart } from 'vue-chartjs';

const adminStore = useAdminStore();
const { alerts, systemLogs, metrics } = storeToRefs(adminStore);

const logLevel = ref('info');
const autoRefresh = ref(true);

const logLevelOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Error', value: 'error' },
  { label: 'Warning', value: 'warn' },
  { label: 'Info', value: 'info' },
  { label: 'Debug', value: 'debug' },
];

const apiUsageChartData = computed(() => ({
  labels: metrics.value.apiUsage?.timestamps || [],
  datasets: [
    {
      label: 'OpenRouter',
      data: metrics.value.apiUsage?.openrouter || [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1,
    },
    {
      label: 'ElevenLabs',
      data: metrics.value.apiUsage?.elevenlabs || [],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.1,
    },
  ],
}));

const queueStatusChartData = computed(() => ({
  labels: ['Historias Pendientes', 'Audio Pendiente', 'Procesando', 'Completados'],
  datasets: [
    {
      label: 'Jobs en Cola',
      data: [
        metrics.value.queues?.story?.waiting || 0,
        metrics.value.queues?.audio?.waiting || 0,
        metrics.value.queues?.story?.active + metrics.value.queues?.audio?.active || 0,
        metrics.value.queues?.story?.completed + metrics.value.queues?.audio?.completed || 0,
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
    },
  ],
}));

const activeUsersChartData = computed(() => ({
  labels: ['Usuarios Activos', 'Sesiones Inactivas'],
  datasets: [
    {
      data: [
        metrics.value.activeUsers || 0,
        metrics.value.totalUsers - metrics.value.activeUsers || 0,
      ],
      backgroundColor: ['#10B981', '#E5E7EB'],
    },
  ],
}));

const performanceMetrics = computed(() => [
  {
    name: 'Uso de CPU',
    value: metrics.value.system?.cpu || 0,
    unit: '%',
    percentage: metrics.value.system?.cpu || 0,
    color: (metrics.value.system?.cpu || 0) > 80 ? 'red' : 'green',
  },
  {
    name: 'Uso de Memoria',
    value: Math.round((metrics.value.system?.memory?.heapUsed || 0) / 1024 / 1024),
    unit: 'MB',
    percentage:
      ((metrics.value.system?.memory?.heapUsed || 0) /
        (metrics.value.system?.memory?.heapTotal || 1)) *
      100,
    color:
      (metrics.value.system?.memory?.heapUsed || 0) /
        (metrics.value.system?.memory?.heapTotal || 1) >
      0.8
        ? 'red'
        : 'green',
  },
  {
    name: 'Conexiones DB',
    value: metrics.value.database?.connections || 0,
    unit: '',
    percentage: Math.min(((metrics.value.database?.connections || 0) / 100) * 100, 100),
    color: (metrics.value.database?.connections || 0) > 80 ? 'orange' : 'green',
  },
]);

const filteredLogs = computed(() => {
  if (logLevel.value === 'all') return systemLogs.value;
  return systemLogs.value.filter((log) => log.level === logLevel.value);
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const dismissAlert = async (alertId: string) => {
  await adminStore.dismissAlert(alertId);
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    adminStore.startRealtimeUpdates();
  } else {
    adminStore.stopRealtimeUpdates();
  }
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString();
};

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString();
};

onMounted(async () => {
  await adminStore.loadAlerts();
  await adminStore.loadSystemLogs();
});
</script>
```

-- Habilitar RLS en nuevas tablas
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden gestionar configuraciones del sistema
CREATE POLICY "Only admins can manage system settings" ON public.system_settings
FOR ALL TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.usuarios
WHERE auth_id = auth.uid() AND es_admin = TRUE
)
);

-- MFA obligatorio para operaciones administrativas críticas
CREATE POLICY "Enforce MFA for admin operations" ON public.system_settings
AS RESTRICTIVE
TO authenticated
USING (
(SELECT auth.jwt()->>'aal') = 'aal2'
OR NOT EXISTS (
SELECT 1 FROM public.usuarios
WHERE auth_id = auth.uid() AND es_admin = TRUE
)
);

-- Usuarios ven sus propias quotas, admins ven todas
CREATE POLICY "Users can view their own quotas" ON public.user_quotas
FOR SELECT TO authenticated
USING (
usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
OR EXISTS (
SELECT 1 FROM public.usuarios
WHERE auth_id = auth.uid() AND es_admin = TRUE
)
);

-- Solo admins pueden modificar quotas
CREATE POLICY "Only admins can modify quotas" ON public.user_quotas
FOR UPDATE TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.usuarios
WHERE auth_id = auth.uid() AND es_admin = TRUE
)
);

-- Usuarios ven sus propios logs, admins ven todos
CREATE POLICY "Users can view their own rate limit logs" ON public.rate_limit_logs
FOR SELECT TO authenticated
USING (
usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
OR EXISTS (
SELECT 1 FROM public.usuarios
WHERE auth_id = auth.uid() AND es_admin = TRUE
)
);

-- Solo admins pueden ver audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.usuarios
WHERE auth_id = auth.uid() AND es_admin = TRUE
)
);

````

#### Funciones de Seguridad (Security Definer)

```sql
-- Función para verificar límites de quota
CREATE OR REPLACE FUNCTION private.check_user_quota(
    p_usuario_id UUID,
    p_quota_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_current_usage INTEGER;
    v_quota_limit INTEGER;
    v_last_reset TIMESTAMP WITH TIME ZONE;
    v_reset_period TEXT;
BEGIN
    -- Obtener información de quota
    SELECT current_usage, quota_limit, last_reset, reset_period
    INTO v_current_usage, v_quota_limit, v_last_reset, v_reset_period
    FROM public.user_quotas
    WHERE usuario_id = p_usuario_id
    AND quota_type = p_quota_type;

    -- Si no existe quota, crear con límites por defecto
    IF NOT FOUND THEN
        INSERT INTO public.user_quotas (
            usuario_id, quota_type, current_usage, quota_limit, reset_period
        ) VALUES (
            p_usuario_id, p_quota_type, 0,
            CASE p_quota_type
                WHEN 'story_generation' THEN 10
                WHEN 'audio_generation' THEN 5
                ELSE 10
            END,
            'hourly'
        );
        RETURN TRUE;
    END IF;

    -- Verificar si necesita reset
    IF v_reset_period = 'hourly' AND v_last_reset < NOW() - INTERVAL '1 hour' THEN
        UPDATE public.user_quotas
        SET current_usage = 0, last_reset = NOW()
        WHERE usuario_id = p_usuario_id AND quota_type = p_quota_type;
        RETURN TRUE;
    END IF;

    -- Verificar límite
    RETURN COALESCE(v_current_usage, 0) < COALESCE(v_quota_limit, 999999);
END;
$$;

-- Función para incrementar uso de quota
CREATE OR REPLACE FUNCTION private.increment_user_quota(
    p_usuario_id UUID,
    p_quota_type TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_quotas (
        usuario_id, quota_type, current_usage, quota_limit, reset_period
    ) VALUES (
        p_usuario_id, p_quota_type, 1,
        CASE p_quota_type
            WHEN 'story_generation' THEN 10
            WHEN 'audio_generation' THEN 5
            ELSE 10
        END,
        'hourly'
    ) ON CONFLICT (usuario_id, quota_type, reset_period)
    DO UPDATE SET current_usage = user_quotas.current_usage + 1;
END;
$$;

-- Función para logging de auditoría
CREATE OR REPLACE FUNCTION private.log_admin_action(
    p_usuario_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        usuario_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_usuario_id, p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END;
$$;
````

### 4.4 Arquitectura de Alta Concurrencia

#### Sistema de Colas con Redis Bull

```typescript
// src/services/queueService.ts
import Bull from 'bull';
import { RateLimiterRedis } from 'rate-limiter-flexible';

export class QueueService {
  private storyQueue: Bull.Queue;
  private audioQueue: Bull.Queue;
  private rateLimiter: RateLimiterRedis;

  constructor() {
    // Configurar colas de procesamiento
    this.storyQueue = new Bull('story generation', {
      redis: { host: process.env.REDIS_HOST },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        delay: 0,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });

    this.audioQueue = new Bull('audio generation', {
      redis: { host: process.env.REDIS_HOST },
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 20,
        delay: 0,
        attempts: 2,
        backoff: { type: 'exponential', delay: 10000 },
      },
    });

    // Rate limiter distribuido
    this.rateLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl_story_generation',
      points: 10, // Número de requests
      duration: 3600, // Por hora
      blockDuration: 3600, // Bloquear por 1 hora si excede
    });

    this.setupProcessors();
  }

  private setupProcessors() {
    // Procesador de generación de historias
    this.storyQueue.process('generate', 5, async (job) => {
      const { userId, prompt, settings } = job.data;

      try {
        // Verificar quotas antes de procesar
        const hasQuota = await this.checkUserQuota(userId, 'story_generation');
        if (!hasQuota) {
          throw new Error('Quota exceeded for user');
        }

        // Aplicar rate limiting
        await this.rateLimiter.consume(userId);

        // Procesar generación con OpenRouter
        const story = await this.generateStoryWithAI(prompt, settings);

        // Actualizar usage
        await this.incrementUserQuota(userId, 'story_generation');

        // Log de éxito
        await this.logRateLimit(userId, 'story_generation', false);

        return { success: true, story };
      } catch (error) {
        // Log de error o quota exceeded
        await this.logRateLimit(userId, 'story_generation', true, error.message);
        throw error;
      }
    });

    // Procesador de generación de audio
    this.audioQueue.process('generate', 3, async (job) => {
      const { userId, historiaId, voiceId } = job.data;

      try {
        const hasQuota = await this.checkUserQuota(userId, 'audio_generation');
        if (!hasQuota) {
          throw new Error('Audio quota exceeded for user');
        }

        // Generar audio con ElevenLabs
        const audioResult = await this.generateAudioWithElevenLabs(historiaId, voiceId);

        await this.incrementUserQuota(userId, 'audio_generation');

        return { success: true, audioResult };
      } catch (error) {
        await this.logRateLimit(userId, 'audio_generation', true, error.message);
        throw error;
      }
    });
  }

  // API pública para añadir trabajos
  async addStoryJob(data: StoryJobData): Promise<Bull.Job> {
    return this.storyQueue.add('generate', data, {
      priority: data.isPremium ? 1 : 10,
      delay: data.scheduleDelay || 0,
    });
  }

  async addAudioJob(data: AudioJobData): Promise<Bull.Job> {
    return this.audioQueue.add('generate', data, {
      priority: data.isPremium ? 1 : 10,
    });
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const storyJob = await this.storyQueue.getJob(jobId);
    const audioJob = await this.audioQueue.getJob(jobId);

    const job = storyJob || audioJob;
    if (!job) {
      return { status: 'not_found' };
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
    };
  }
}
```

#### Rate Limiting Service

```typescript
// src/services/rateLimitService.ts
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import Redis from 'ioredis';

export class RateLimitService {
  private redis: Redis;
  private limiters: Map<string, RateLimiterRedis>;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.limiters = new Map();

    // Configurar diferentes rate limiters
    this.setupLimiters();
  }

  private setupLimiters() {
    // Rate limiter para generación de historias
    this.limiters.set(
      'story_generation',
      new RateLimiterRedis({
        storeClient: this.redis,
        keyPrefix: 'rl_story',
        points: 10, // 10 requests
        duration: 3600, // por hora
        blockDuration: 3600,
        execEvenly: true, // Distribuir uniformemente
      }),
    );

    // Rate limiter para generación de audio
    this.limiters.set(
      'audio_generation',
      new RateLimiterRedis({
        storeClient: this.redis,
        keyPrefix: 'rl_audio',
        points: 5, // 5 requests
        duration: 3600, // por hora
        blockDuration: 3600,
      }),
    );

    // Rate limiter por IP para prevenir ataques
    this.limiters.set(
      'by_ip',
      new RateLimiterRedis({
        storeClient: this.redis,
        keyPrefix: 'rl_ip',
        points: 100, // 100 requests
        duration: 300, // por 5 minutos
        blockDuration: 600, // bloquear 10 minutos
      }),
    );
  }

  async checkLimit(
    identifier: string,
    limitType: string,
    additionalPoints: number = 1,
  ): Promise<RateLimitResult> {
    const limiter = this.limiters.get(limitType);
    if (!limiter) {
      throw new Error(`Unknown rate limit type: ${limitType}`);
    }

    try {
      const result = await limiter.consume(identifier, additionalPoints);

      return {
        allowed: true,
        remaining: result.remainingPoints,
        resetTime: new Date(Date.now() + result.msBeforeNext),
        totalHits: result.totalHits,
      };
    } catch (rejRes) {
      if (rejRes instanceof Error) {
        throw rejRes;
      }

      // RateLimiterRes cuando se excede el límite
      const rateLimitRes = rejRes as RateLimiterRes;

      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + rateLimitRes.msBeforeNext),
        totalHits: rateLimitRes.totalHits,
        retryAfter: Math.ceil(rateLimitRes.msBeforeNext / 1000),
      };
    }
  }

  async logRateLimit(
    userId: string,
    operation: string,
    quotaExceeded: boolean,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any,
  ) {
    // Log a base de datos para auditoría
    await supabase.from('rate_limit_logs').insert({
      usuario_id: userId,
      operation_type: operation,
      ip_address: ipAddress,
      user_agent: userAgent,
      quota_exceeded: quotaExceeded,
      request_metadata: metadata,
    });
  }
}
```

#### Edge Functions con Seguridad y Límites

```typescript
// supabase/functions/_shared/middleware.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { rateLimitService } from './services.ts';
import { auditService } from './services.ts';

export const withAuth = (handler: Function) => {
  return async (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response('Invalid token', {
        status: 401,
        headers: corsHeaders,
      });
    }

    return handler(req, { user, supabase });
  };
};

export const withRateLimit = (
  handler: Function,
  options: { type: string; customLimit?: number },
) => {
  return async (req: Request, context: any) => {
    const { user } = context;
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';

    // Rate limiting por IP
    const ipLimit = await rateLimitService.checkLimit(clientIP, 'by_ip');
    if (!ipLimit.allowed) {
      return new Response('Too many requests from this IP', {
        status: 429,
        headers: {
          'Retry-After': ipLimit.retryAfter?.toString() || '300',
          ...corsHeaders,
        },
      });
    }

    // Rate limiting por usuario si está autenticado
    if (user) {
      const userLimit = await rateLimitService.checkLimit(
        user.id,
        options.type,
        options.customLimit || 1,
      );

      if (!userLimit.allowed) {
        await auditService.logSecurityEvent(user.id, 'rate_limit_exceeded', {
          operation: options.type,
          ip: clientIP,
          retryAfter: userLimit.retryAfter,
        });

        return new Response('Rate limit exceeded', {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': userLimit.resetTime.toISOString(),
            'Retry-After': userLimit.retryAfter?.toString() || '3600',
            ...corsHeaders,
          },
        });
      }
    }

    return handler(req, context);
  };
};

export const withQuotaCheck = (quotaType: string) => {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      const { user, supabase } = context;

      // Obtener usuario de la base de datos
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!usuario) {
        return new Response('User not found', {
          status: 404,
          headers: corsHeaders,
        });
      }

      // Verificar quota usando función de base de datos
      const { data: quotaCheck } = await supabase.rpc('check_user_quota', {
        p_usuario_id: usuario.id,
        p_quota_type: quotaType,
      });

      if (!quotaCheck) {
        await auditService.logSecurityEvent(user.id, 'quota_exceeded', {
          quotaType,
          userId: usuario.id,
        });

        return new Response('Quota exceeded', {
          status: 429,
          headers: {
            'X-Quota-Type': quotaType,
            'X-Quota-Exceeded': 'true',
            ...corsHeaders,
          },
        });
      }

      return handler(req, { ...context, usuario });
    };
  };
};
```

---

## 5. IMPLEMENTACIÓN DE STORES Y SERVICIOS

### 4.1 Configuración del Cliente Supabase

#### src/services/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Tipos para las tablas principales
export type Usuario = Database['public']['Tables']['usuarios']['Row'];
export type Historia = Database['public']['Tables']['historias']['Row'];
export type PalabraCompleja = Database['public']['Tables']['palabras_complejas']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];

// Tipos para inserción
export type InsertUsuario = Database['public']['Tables']['usuarios']['Insert'];
export type InsertHistoria = Database['public']['Tables']['historias']['Insert'];
export type InsertPalabraCompleja = Database['public']['Tables']['palabras_complejas']['Insert'];
export type InsertUserSettings = Database['public']['Tables']['user_settings']['Insert'];

// Tipos para actualización
export type UpdateUsuario = Database['public']['Tables']['usuarios']['Update'];
export type UpdateHistoria = Database['public']['Tables']['historias']['Update'];
export type UpdateUserSettings = Database['public']['Tables']['user_settings']['Update'];
```

### 4.2 Store de Autenticación con Supabase Auth

#### src/stores/useAuthStore.ts

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';
import type { Usuario } from '@/services/supabase';
import type { AuthResponse, Session, User } from '@supabase/supabase-js';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  nombre?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const usuario = ref<Usuario | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!session.value && !!usuario.value);
  const isAdmin = computed(() => usuario.value?.es_admin || false);
  const token = computed(() => session.value?.access_token || null);

  // Actions
  async function initialize() {
    try {
      // Obtener sesión actual
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (currentSession) {
        session.value = currentSession;
        await loadUserProfile(currentSession.user);
      }

      // Escuchar cambios de autenticación
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession;

        if (newSession?.user) {
          await loadUserProfile(newSession.user);
        } else {
          usuario.value = null;
        }
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error de inicialización';
    }
  }

  async function loadUserProfile(authUser: User) {
    try {
      const { data, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (profileError) {
        // Si no existe el perfil, crearlo
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('usuarios')
            .insert({
              auth_id: authUser.id,
              email: authUser.email!,
              nombre: authUser.user_metadata?.name || null,
              es_admin: await checkIsFirstUser(),
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          usuario.value = newProfile;
        } else {
          throw profileError;
        }
      } else {
        usuario.value = data;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando perfil';
      throw err;
    }
  }

  async function checkIsFirstUser(): Promise<boolean> {
    const { count } = await supabase.from('usuarios').select('*', { count: 'exact', head: true });

    return count === 0;
  }

  async function login(credentials: LoginRequest) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (loginError) {
        throw loginError;
      }

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error de login';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(userData: RegisterRequest) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.nombre || null,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error de registro';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;

    try {
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      // Limpiar estado local
      usuario.value = null;
      session.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error de logout';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    usuario: readonly(usuario),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    isAuthenticated,
    isAdmin,
    token,

    // Actions
    initialize,
    login,
    register,
    logout,
    clearError,
  };
});
```

### 4.3 Store de Historias con Supabase Database

#### src/stores/useStoryStore.ts

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';
import type { Historia, PalabraCompleja } from '@/services/supabase';
import { useAuthStore } from './useAuthStore';

interface CreateStoryRequest {
  titulo?: string;
  prompt: string;
  max_words: number;
  modelo?: string;
}

export const useStoryStore = defineStore('story', () => {
  // State
  const historias = ref<Historia[]>([]);
  const historia_actual = ref<Historia | null>(null);
  const palabras_complejas = ref<PalabraCompleja[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const historias_ordenadas = computed(() => {
    return [...historias.value].sort(
      (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime(),
    );
  });

  const historias_favoritas = computed(() =>
    historias.value.filter((historia) => historia.es_favorito),
  );

  const total_palabras_aprendidas = computed(() => palabras_complejas.value.length);

  // Actions
  async function generateStory(request: CreateStoryRequest) {
    loading.value = true;
    error.value = null;

    try {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      // Llamar a Edge Function para generar historia
      const { data, error: functionError } = await supabase.functions.invoke('generate-story', {
        body: {
          prompt: request.prompt,
          target_words: request.max_words || 150,
          title: request.titulo,
          genre: 'general',
          language: 'Spanish',
          model: request.modelo,
        },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      const response = data;

      // Actualizar estado local
      historias.value.unshift(response.story);
      historia_actual.value = response.story;

      // Procesar palabras complejas si existen
      if (response.palabras_complejas?.length > 0) {
        const nuevasPalabras = response.palabras_complejas.map((palabra: any) => ({
          id: Date.now() + Math.random(),
          historia_id: response.story.id,
          palabra: palabra.palabra,
          definicion: palabra.definicion,
          pronunciacion: palabra.pronunciacion || null,
          posicion_inicio: palabra.posicion_inicio,
          posicion_fin: palabra.posicion_fin,
          created_at: new Date().toISOString(),
        })) as PalabraCompleja[];

        palabras_complejas.value.push(...nuevasPalabras);
      }

      return response.story;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error generando historia';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadHistorias() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: loadError } = await supabase
        .from('historias')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (loadError) {
        throw loadError;
      }

      historias.value = data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando historias';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteStory(id: number) {
    try {
      const { error: deleteError } = await supabase.from('historias').delete().eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Actualizar estado local
      historias.value = historias.value.filter((h) => h.id !== id);
      if (historia_actual.value?.id === id) {
        historia_actual.value = null;
      }

      // Limpiar palabras complejas relacionadas
      palabras_complejas.value = palabras_complejas.value.filter((p) => p.historia_id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando historia';
      throw err;
    }
  }

  async function toggleFavorite(storyId: number) {
    try {
      const historia = historias.value.find((h) => h.id === storyId);
      if (!historia) return;

      const { data, error: updateError } = await supabase
        .from('historias')
        .update({ es_favorito: !historia.es_favorito })
        .eq('id', storyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Actualizar estado local
      const index = historias.value.findIndex((h) => h.id === storyId);
      if (index !== -1) {
        historias.value[index] = data;
      }

      if (historia_actual.value?.id === storyId) {
        historia_actual.value = data;
      }

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error actualizando favorito';
      throw err;
    }
  }

  async function loadComplexWordsForStory(historia_id: number) {
    try {
      const { data, error: loadError } = await supabase
        .from('palabras_complejas')
        .select('*')
        .eq('historia_id', historia_id);

      if (loadError) {
        throw loadError;
      }

      // Reemplazar palabras complejas para esta historia
      palabras_complejas.value = palabras_complejas.value.filter(
        (p) => p.historia_id !== historia_id,
      );
      if (data) {
        palabras_complejas.value.push(...data);
      }

      return data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando palabras complejas';
      return [];
    }
  }

  function setHistoriaActual(historia: Historia) {
    historia_actual.value = historia;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    historias: readonly(historias),
    historia_actual: readonly(historia_actual),
    palabras_complejas: readonly(palabras_complejas),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    historias_ordenadas,
    historias_favoritas,
    total_palabras_aprendidas,

    // Actions
    generateStory,
    loadHistorias,
    deleteStory,
    toggleFavorite,
    loadComplexWordsForStory,
    setHistoriaActual,
    clearError,
  };
});
```

### 4.4 Store de Audio con Supabase Storage

#### src/stores/useAudioStore.ts

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

interface AudioTimestamp {
  start_time: number;
  end_time: number;
  text_start: number;
  text_end: number;
  text: string;
  confidence?: number;
}

export enum AudioStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  LOADING = 'loading',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error',
}

export const useAudioStore = defineStore('audio', () => {
  // State
  const currentAudio = ref<HTMLAudioElement | null>(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(1.0);
  const selectedVoice = ref<Voice | null>(null);
  const voices = ref<Voice[]>([]);
  const isGenerating = ref(false);
  const isLoadingVoices = ref(false);
  const status = ref<AudioStatus>(AudioStatus.IDLE);
  const error = ref<string | null>(null);
  const timestamps = ref<AudioTimestamp[]>([]);

  // Getters
  const hasAudio = computed(() => !!currentAudio.value?.src);
  const progress = computed(() => {
    if (duration.value === 0) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  // Actions
  async function loadVoices() {
    isLoadingVoices.value = true;
    error.value = null;

    try {
      // Obtener configuración del usuario para API key de ElevenLabs
      const { data: settings } = await supabase
        .from('user_settings')
        .select('elevenlabs_api_key')
        .single();

      const apiKey = settings?.elevenlabs_api_key || process.env.ELEVENLABS_API_KEY;

      if (!apiKey) {
        throw new Error('API key de ElevenLabs no configurada');
      }

      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Error loading voices: ${response.statusText}`);
      }

      const data = await response.json();

      voices.value = data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'other',
        description: voice.description,
        preview_url: voice.preview_url,
      }));

      // Seleccionar primera voz por defecto
      if (voices.value.length > 0 && !selectedVoice.value) {
        selectedVoice.value = voices.value[0];
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando voces';
      voices.value = [];
    } finally {
      isLoadingVoices.value = false;
    }
  }

  async function generateAudio(historia_id: number) {
    if (!selectedVoice.value) {
      throw new Error('No hay voz seleccionada');
    }

    isGenerating.value = true;
    status.value = AudioStatus.GENERATING;
    error.value = null;

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-audio', {
        body: {
          historia_id,
          voice_id: selectedVoice.value.voice_id,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.success) {
        // Crear elemento de audio
        await loadAudioFromUrl(data.audio_path);

        // Guardar timestamps para sincronización
        timestamps.value = data.timestamps || [];

        status.value = AudioStatus.READY;
      } else {
        throw new Error('Error generando audio');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error generando audio';
      status.value = AudioStatus.ERROR;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  }

  async function loadAudioFromUrl(audioUrl: string) {
    return new Promise<void>((resolve, reject) => {
      if (currentAudio.value) {
        currentAudio.value.pause();
        currentAudio.value = null;
      }

      const audio = new Audio(audioUrl);

      audio.addEventListener('loadedmetadata', () => {
        duration.value = audio.duration;
        currentAudio.value = audio;
        status.value = AudioStatus.READY;
        resolve();
      });

      audio.addEventListener('error', (e) => {
        error.value = 'Error cargando audio';
        status.value = AudioStatus.ERROR;
        reject(e);
      });

      audio.addEventListener('timeupdate', () => {
        currentTime.value = audio.currentTime;
      });

      audio.addEventListener('ended', () => {
        isPlaying.value = false;
        status.value = AudioStatus.READY;
      });

      audio.volume = volume.value;
      status.value = AudioStatus.LOADING;
    });
  }

  async function playPause() {
    if (!currentAudio.value) return;

    try {
      if (isPlaying.value) {
        currentAudio.value.pause();
        isPlaying.value = false;
        status.value = AudioStatus.PAUSED;
      } else {
        await currentAudio.value.play();
        isPlaying.value = true;
        status.value = AudioStatus.PLAYING;
      }
    } catch (err) {
      error.value = 'Error reproduciendo audio';
      status.value = AudioStatus.ERROR;
      throw err;
    }
  }

  function restart() {
    if (!currentAudio.value) return;

    currentAudio.value.currentTime = 0;
    currentTime.value = 0;
  }

  function setCurrentTime(time: number) {
    if (!currentAudio.value) return;

    currentAudio.value.currentTime = Math.max(0, Math.min(time, duration.value));
    currentTime.value = currentAudio.value.currentTime;
  }

  function setVolume(newVolume: number) {
    volume.value = Math.max(0, Math.min(newVolume, 1));

    if (currentAudio.value) {
      currentAudio.value.volume = volume.value;
    }
  }

  function selectVoice(voice: Voice) {
    selectedVoice.value = voice;
  }

  function cleanup() {
    if (currentAudio.value) {
      currentAudio.value.pause();
      currentAudio.value = null;
    }

    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    timestamps.value = [];
    status.value = AudioStatus.IDLE;
    error.value = null;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    currentAudio: readonly(currentAudio),
    isPlaying: readonly(isPlaying),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    volume: readonly(volume),
    selectedVoice: readonly(selectedVoice),
    voices: readonly(voices),
    isGenerating: readonly(isGenerating),
    isLoadingVoices: readonly(isLoadingVoices),
    status: readonly(status),
    error: readonly(error),
    timestamps: readonly(timestamps),

    // Getters
    hasAudio,
    progress,

    // Actions
    loadVoices,
    generateAudio,
    loadAudioFromUrl,
    playPause,
    restart,
    setCurrentTime,
    setVolume,
    selectVoice,
    cleanup,
    clearError,
  };
});
```

---

## 7. PLAN DE IMPLEMENTACIÓN DETALLADO (13 FASES)

### FASE 1: FUNDAMENTOS DE SEGURIDAD Y ARQUITECTURA (Semana 1-2)

**Duración Estimada**: 10-14 días
**Prioridad**: CRÍTICA

#### Tareas Principales:

**1.1 Setup de Arquitectura de Seguridad**

- [ ] Configurar Supabase con RLS habilitado en todas las tablas
- [ ] Implementar políticas de seguridad granulares
- [ ] Setup de roles y permisos administrativos
- [ ] Configurar MFA obligatorio para administradores
- [ ] Implementar session management con límites de tiempo

**1.2 Base de Datos de Seguridad**

- [ ] Crear tablas de sistema: `system_settings`, `user_quotas`, `rate_limit_logs`
- [ ] Implementar funciones de seguridad (`check_user_quota`, `increment_usage`)
- [ ] Crear índices optimizados para consultas frecuentes
- [ ] Setup de audit logging con `audit_logs`
- [ ] Configurar backup automático y rotación

**1.3 Infraestructura Redis**

- [ ] Setup de Redis en producción (Upstash/Redis Cloud)
- [ ] Configurar conexiones persistentes y pooling
- [ ] Implementar health checks y monitoring básico
- [ ] Setup de alertas para caída de servicios
- [ ] Documentar configuraciones de Redis

**Criterios de Aceptación:**

- ✅ Todas las políticas RLS funcionando correctamente
- ✅ Sistema de quotas operativo con límites configurables
- ✅ Redis conectado y respondiendo en <50ms
- ✅ Audit logging capturando todas las operaciones críticas
- ✅ MFA funcionando para cuentas administrativas

---

### FASE 2: SISTEMA DE COLAS Y RATE LIMITING (Semana 2-3)

**Duración Estimada**: 7-10 días
**Dependencias**: Fase 1
**Prioridad**: ALTA

#### Tareas Principales:

**2.1 Sistema de Colas con Redis Bull**

- [ ] Implementar `QueueService` con colas separadas para historias y audio
- [ ] Configurar workers con priorización (usuarios premium primero)
- [ ] Implementar retry logic con backoff exponencial
- [ ] Setup de dead letter queues para jobs fallidos
- [ ] Monitoreo de estado de colas en tiempo real

**2.2 Rate Limiting Distribuido**

- [ ] Implementar `RateLimitService` con sliding window
- [ ] Configurar límites por usuario, IP y operación
- [ ] Integrar con sistema de quotas de base de datos
- [ ] Implementar bypass para administradores
- [ ] Logs detallados de rate limiting

**2.3 Edge Functions con Seguridad**

- [ ] Refactorizar Edge Functions existentes con middleware de seguridad
- [ ] Implementar verificación de quotas antes de procesar
- [ ] Añadir rate limiting a nivel de función
- [ ] Error handling robusto con códigos apropiados
- [ ] Logging estructurado para debugging

**Criterios de Aceptación:**

- ✅ Colas procesando trabajos con <2s de latencia promedio
- ✅ Rate limiting bloqueando correctamente usuarios que exceden límites
- ✅ Edge Functions rechazando requests sin quota disponible
- ✅ Dashboard mostrando métricas de colas en tiempo real
- ✅ Recovery automático de jobs fallidos funcionando

---

### FASE 3: STORES Y SERVICIOS REACTIVOS (Semana 3-4)

**Duración Estimada**: 7-10 días  
**Dependencias**: Fase 2
**Prioridad**: ALTA

#### Tareas Principales:

**3.1 Store Principal con Quotas**

- [ ] Refactorizar `storytellerStore` con gestión de quotas integrada
- [ ] Implementar estado reactivo de colas y progreso
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Cache inteligente con invalidación automática
- [ ] Estado offline/online con sincronización

**3.2 Servicios Especializados**

- [ ] Implementar `QueueService` para frontend
- [ ] Crear `QuotaService` con verificación local/remota
- [ ] Servicio de notificaciones push para móvil
- [ ] Servicio de analytics y métricas de usuario
- [ ] Servicio de backup/restore de configuraciones

**3.3 Composables Reactivos**

- [ ] `useQueue` para gestión de trabajos en cola
- [ ] `useQuotas` para estado de límites de usuario
- [ ] `useRealtime` para actualizaciones live
- [ ] `useOffline` para funcionalidad offline
- [ ] `useAnalytics` para tracking de eventos

**Criterios de Aceptación:**

- ✅ UI actualizándose en tiempo real cuando cambian quotas
- ✅ Notificaciones cuando trabajos se completan
- ✅ Estado de cola visible con progreso preciso
- ✅ Funcionalidad offline básica operativa
- ✅ Performance de UI <100ms para operaciones comunes

---

### FASE 4: PANEL DE ADMINISTRACIÓN COMPLETO (Semana 4-5)

**Duración Estimada**: 10-14 días
**Dependencias**: Fase 3  
**Prioridad**: ALTA

#### Tareas Principales:

**4.1 Dashboard Administrativo**

- [ ] Crear página principal de admin con métricas en tiempo real
- [ ] Implementar componentes de gráficos (Chart.js/D3)
- [ ] Sistema de alertas automáticas configurables
- [ ] Panel de control de sistema (restart servicios, etc.)
- [ ] Exportación de reportes en PDF/Excel

**4.2 Gestión de Usuarios y Quotas**

- [ ] Interface para editar quotas por usuario individual
- [ ] Búsqueda y filtrado avanzado de usuarios
- [ ] Bulk operations para cambios masivos
- [ ] Historia de cambios en quotas con auditoría
- [ ] Templates de quotas por tipos de usuario (free/premium/admin)

**4.3 Monitoreo y Alertas**

- [ ] Dashboard de métricas del sistema en tiempo real
- [ ] Configuración de alertas personalizables
- [ ] Viewer de logs del sistema con filtrado
- [ ] Health checks automáticos de servicios externos
- [ ] Integración con servicios de notificación (Slack/email)

**Criterios de Aceptación:**

- ✅ Admin puede cambiar quotas de cualquier usuario en <10s
- ✅ Alertas automáticas cuando colas exceden 100 trabajos
- ✅ Dashboard cargando en <2s con datos actualizados
- ✅ Sistema detectando caída de APIs externas automáticamente
- ✅ Logs estructurados permitiendo debugging eficiente

---

### FASE 5: OPTIMIZACIÓN DE ALTA CONCURRENCIA (Semana 5-6)

**Duración Estimada**: 10-14 días
**Dependencias**: Fase 4
**Prioridad**: MEDIA

#### Tareas Principales:

**5.1 Connection Pooling y Cache**

- [ ] Implementar connection pooling para PostgreSQL
- [ ] Cache distribuido para consultas frecuentes
- [ ] CDN setup para assets estáticos
- [ ] Database read replicas para consultas read-only
- [ ] Cache de resultados de APIs externas (24h TTL)

**5.2 Optimización de Queries**

- [ ] Analizar y optimizar consultas más lentas
- [ ] Implementar índices compuestos para queries complejas
- [ ] Materialized views para reporting
- [ ] Query parallelization donde sea posible
- [ ] Database maintenance automático (VACUUM, ANALYZE)

**5.3 Load Testing y Benchmarking**

- [ ] Suite de load tests con Artillery/k6
- [ ] Benchmarking de endpoints críticos
- [ ] Stress testing del sistema de colas
- [ ] Profiling de memory leaks
- [ ] Documentación de límites de capacidad

**Criterios de Aceptación:**

- ✅ Sistema soportando 1000+ usuarios concurrentes sin degradación
- ✅ Response times <200ms para 95% de requests
- ✅ Colas procesando >50 trabajos por minuto
- ✅ Memoria estable durante 24h+ de operación continua
- ✅ Database connection pool utilizándose eficientemente

---

### FASE 6: SISTEMA DE NOTIFICACIONES PUSH (Semana 6-7)

**Duración Estimada**: 7-10 días
**Dependencias**: Fase 3
**Prioridad**: MEDIA

#### Tareas Principales:

**6.1 Setup de Push Notifications**

- [ ] Configurar Firebase Cloud Messaging (FCM)
- [ ] Implementar service worker para notificaciones web
- [ ] Setup de certificados APNs para iOS
- [ ] Testing en dispositivos físicos iOS/Android
- [ ] Interface de configuración de notificaciones por usuario

**6.2 Triggers de Notificaciones**

- [ ] Notificación cuando historia se completa
- [ ] Notificación cuando audio está listo
- [ ] Alertas cuando quota está cerca del límite
- [ ] Notificaciones de mantenimiento programado
- [ ] Sistema de opt-out granular

**6.3 Templates y Personalización**

- [ ] Templates de mensajes configurables
- [ ] Personalización por idioma
- [ ] Scheduling de notificaciones
- [ ] A/B testing de mensajes
- [ ] Analytics de open rates

**Criterios de Aceptación:**

- ✅ Notificaciones llegando en <30s después del evento
- ✅ > 80% delivery rate en dispositivos móviles
- ✅ Usuarios pueden personalizar qué notificaciones recibir
- ✅ Templates funcionando en inglés y español
- ✅ Zero spam complaints por implementar unsubscribe correcto

---

### FASE 7: FUNCIONALIDAD OFFLINE AVANZADA (Semana 7-8)

**Duración Estimada**: 10-14 días
**Dependencias**: Fase 6
**Prioridad**: BAJA

#### Tareas Principales:

**7.1 Service Worker Avanzado**

- [ ] Cache estratégico de historias recientes
- [ ] Queue de trabajos offline con sync cuando se conecta
- [ ] Background sync para datos críticos
- [ ] Cache de assets de audio más utilizados
- [ ] Manejo inteligente de storage limits

**7.2 Sincronización de Datos**

- [ ] Conflict resolution para cambios concurrentes
- [ ] Delta sync para minimizar transferencia de datos
- [ ] Offline indicators en UI
- [ ] Queue visible de acciones pendientes de sync
- [ ] Recovery automático de sync interrumpido

**7.3 Storage Offline**

- [ ] IndexedDB para cache estructurado
- [ ] Compression de datos almacenados localmente
- [ ] Garbage collection de cache antiguo
- [ ] Encryption de datos sensibles offline
- [ ] API de storage uniforme online/offline

**Criterios de Aceptación:**

- ✅ Usuario puede leer historias sin conexión
- ✅ Audio cache funcionando para últimas 5 historias
- ✅ Acciones offline sincronizándose al reconectarse
- ✅ Storage usage <50MB en dispositivos típicos
- ✅ Transition seamless entre offline/online

---

### FASE 8: ANALYTICS Y BUSINESS INTELLIGENCE (Semana 8-9)

**Duración Estimada**: 7-10 días
**Dependencias**: Fase 4
**Prioridad**: BAJA

#### Tareas Principales:

**8.1 Event Tracking**

- [ ] Implementar tracking de eventos clave
- [ ] Setup de Google Analytics 4 / Mixpanel
- [ ] Custom events para acciones de negocio
- [ ] User journey tracking
- [ ] Conversion funnel analysis

**8.2 Métricas de Negocio**

- [ ] Dashboard de KPIs ejecutivos
- [ ] Retention analysis automatizado
- [ ] Segmentación de usuarios por comportamiento
- [ ] Revenue tracking (si aplica)
- [ ] Predictive analytics básico

**8.3 Data Export y Reporting**

- [ ] Export de datos para análisis externo
- [ ] Scheduled reports automáticos
- [ ] API de métricas para integraciones
- [ ] Data warehouse básico (opcional)
- [ ] Compliance con GDPR para data export

**Criterios de Aceptación:**

- ✅ Métricas clave actualizándose diariamente
- ✅ Dashboards cargando datos históricos correctamente
- ✅ Reports automáticos llegando semanalmente por email
- ✅ Data export funcionando sin corrupción
- ✅ Zero PII expuesta en analytics

---

### FASE 9: TESTING INTEGRAL Y QA (Semana 9-10)

**Duración Estimada**: 10-14 días
**Dependencias**: Fases 1-8
**Prioridad**: CRÍTICA

#### Tareas Principales:

**9.1 Unit Testing Completo**

- [ ] > 90% coverage en servicios críticos
- [ ] Tests de stores y composables
- [ ] Tests de utilidades y helpers
- [ ] Mock de APIs externas en tests
- [ ] CI/CD pipeline para tests automáticos

**9.2 Integration Testing**

- [ ] Tests E2E con Playwright para flujos críticos
- [ ] Tests de APIs con casos edge incluidos
- [ ] Tests de carga para identificar bottlenecks
- [ ] Tests de seguridad automatizados
- [ ] Tests de compatibilidad cross-browser

**9.3 Manual QA**

- [ ] Testing en dispositivos físicos iOS/Android
- [ ] Testing de accesibilidad (WCAG 2.1)
- [ ] Performance testing manual
- [ ] Security penetration testing básico
- [ ] Usability testing con usuarios reales

**Criterios de Aceptación:**

- ✅ Test suite completo corriendo en <10 minutos
- ✅ Zero critical bugs en functionality core
- ✅ Performance tests passing en todos los endpoints
- ✅ Accessibility score >90 en herramientas automáticas
- ✅ Security scan sin vulnerabilidades high/critical

---

### FASE 10: DOCUMENTACIÓN Y KNOWLEDGE BASE (Semana 10-11)

**Duración Estimada**: 7-10 días
**Dependencias**: Fase 9
**Prioridad**: MEDIA

#### Tareas Principales:

**10.1 Documentación Técnica**

- [ ] API documentation completa con ejemplos
- [ ] Architecture decision records (ADRs)
- [ ] Deployment guides para diferentes entornos
- [ ] Troubleshooting guides común
- [ ] Code style guides y best practices

**10.2 Documentación de Usuario**

- [ ] User guides para funcionalidad principal
- [ ] FAQ automatizado basado en tickets
- [ ] Video tutorials para flujos complejos
- [ ] Onboarding interactivo
- [ ] Help center searchable

**10.3 Documentación Administrativa**

- [ ] Admin guides para gestión de usuarios
- [ ] Monitoring playbooks
- [ ] Incident response procedures
- [ ] Backup/recovery procedures
- [ ] Compliance documentation

**Criterios de Aceptación:**

- ✅ Nuevo developer puede setup local environment en <1 hora
- ✅ Usuario nuevo puede completar first story en <5 minutos
- ✅ Admin puede resolver issues comunes siguiendo playbooks
- ✅ Documentation up-to-date con features actuales
- ✅ Search en help center retornando resultados relevantes

---

### FASE 11: PREPARACIÓN PARA PRODUCCIÓN (Semana 11-12)

**Duración Estimada**: 10-14 días
**Dependencias**: Fase 10
**Prioridad**: CRÍTICA

#### Tareas Principales:

**11.1 Infrastructure as Code**

- [ ] Scripts de Terraform/CDK para toda la infra
- [ ] CI/CD pipeline optimizado para production
- [ ] Environment parity (dev/staging/prod)
- [ ] Secrets management con vault
- [ ] Infrastructure monitoring con alerts

**11.2 Security Hardening**

- [ ] WAF configuration para protección DDoS
- [ ] SSL/TLS certificates automático con renewal
- [ ] Security headers completos
- [ ] API rate limiting en edge
- [ ] Regular security scans automáticos

**11.3 Performance Optimization**

- [ ] CDN configuration optimizada
- [ ] Database tuning para production load
- [ ] Asset optimization y compression
- [ ] Browser caching strategies
- [ ] Image optimization automática

**Criterios de Aceptación:**

- ✅ Deployment a production en <15 minutos
- ✅ Zero downtime deployments funcionando
- ✅ Security scan pasando sin issues críticas
- ✅ Performance scores >90 en Lighthouse
- ✅ Infrastructure monitoreada 24/7 con alerts

---

### FASE 12: SOFT LAUNCH Y BETA TESTING (Semana 12-13)

**Duración Estimada**: 7-14 días
**Dependencias**: Fase 11
**Prioridad**: ALTA

#### Tareas Principales:

**12.1 Beta Program Setup**

- [ ] Invitations system para beta testers
- [ ] Feedback collection automático
- [ ] Bug reporting integrado en app
- [ ] Analytics específicos para beta metrics
- [ ] Communication channels con beta users

**12.2 Gradual Rollout**

- [ ] Feature flags para enable/disable funcionalidades
- [ ] A/B testing framework funcional
- [ ] Canary releases para updates
- [ ] Circuit breakers para APIs externas
- [ ] Real-time monitoring dashboard para lanzamiento

**12.3 Issue Resolution**

- [ ] Hotfix pipeline para critical issues
- [ ] Bug triage process automatizado
- [ ] User support system básico
- [ ] Knowledge base con common issues
- [ ] Escalation procedures para incidents

**Criterios de Aceptación:**

- ✅ 50+ beta users activos durante 2 semanas
- ✅ <5 critical bugs reportados y resueltos
- ✅ User satisfaction score >4.0/5.0
- ✅ System stability >99.5% uptime durante beta
- ✅ Support response time <24 horas

---

### FASE 13: LANZAMIENTO COMPLETO Y POST-LAUNCH (Semana 13-14)

**Duración Estimada**: 7-14 días
**Dependencias**: Fase 12
**Prioridad**: CRÍTICA

#### Tareas Principales:

**13.1 Go-Live Preparation**

- [ ] Marketing assets y landing page optimizada
- [ ] App store submissions iOS/Android
- [ ] Press kit y communication strategy
- [ ] Customer support team training
- [ ] Launch day runbook detallado

**13.2 Launch Execution**

- [ ] Coordinated launch across todos los canales
- [ ] Real-time monitoring durante launch day
- [ ] Social media management
- [ ] Customer support 24/7 durante launch week
- [ ] Performance monitoring y optimization

**13.3 Post-Launch Operations**

- [ ] Daily standups para issues resolution
- [ ] User feedback analysis y prioritization
- [ ] Performance optimization continua
- [ ] Feature requests backlog management
- [ ] Success metrics tracking y reporting

**Criterios de Aceptación:**

- ✅ App live en todas las plataformas sin issues críticas
- ✅ >95% uptime durante primera semana
- ✅ Customer support resolving >80% tickets en <48h
- ✅ User acquisition targets met (definir específicos)
- ✅ Revenue/engagement metrics tracking funcionando

---

## RECURSOS Y DEPENDENCIAS

### Personal Requerido:

- **1 Full Stack Developer** (Lead): Arquitectura, backend, seguridad
- **1 Frontend Developer**: UI/UX, componentes, optimización
- **1 DevOps Engineer** (0.5 FTE): Infraestructura, deployment, monitoring
- **1 QA Engineer** (0.5 FTE): Testing, quality assurance
- **1 Product Manager** (0.25 FTE): Coordinación, requirements, stakeholders

### Herramientas y Servicios:

- **Desarrollo**: Quasar, Vue 3, TypeScript, Supabase, Vercel
- **Infraestructura**: Redis Cloud, Upstash, AWS/GCP
- **Monitoring**: DataDog, New Relic, o equivalente
- **Testing**: Vitest, Playwright, Artillery
- **Analytics**: Google Analytics, Mixpanel

### Budget Estimado:

- **Infrastructure**: $200-500/mes
- **Third-party APIs**: $300-800/mes (OpenRouter, ElevenLabs, etc.)
- **Tools & Services**: $200-400/mes
- **Personnel**: Según rates locales/remotos

### Riesgos y Mitigaciones:

- **Riesgo**: APIs externas con rate limits agresivos
  - **Mitigación**: Cache inteligente y múltiples proveedores
- **Riesgo**: High concurrency issues no detectadas en testing
  - **Mitigación**: Load testing exhaustivo y gradual rollout
- **Riesgo**: Security vulnerabilities en producción
  - **Mitigación**: Security audits regulares y penetration testing

---

## 6. CRITERIOS DE ACEPTACIÓN

### 6.1 Funcionalidades Obligatorias

#### Sistema de Autenticación ✅

- ✅ Registro e inicio de sesión con email/password
- ✅ Primer usuario se convierte en administrador automáticamente
- ✅ Sesiones persistentes entre reinicios
- ✅ Logout seguro con limpieza de estado
- ✅ Validación de tokens en todas las operaciones

#### Generación de Historias ✅

- ✅ Integración completa con OpenRouter API
- ✅ Configuración de modelos disponibles (gpt-4o, claude-3.5-sonnet, etc.)
- ✅ Control de longitud: 50-2000 palabras
- ✅ Prompts personalizados del usuario
- ✅ Almacenamiento seguro con metadatos completos

#### Sistema de Audio ✅

- ✅ Integración completa con ElevenLabs
- ✅ Múltiples voces con categorización
- ✅ Controles de reproducción (play/pause/restart/seek)
- ✅ Sincronización texto-audio con timestamps
- ✅ Configuración de volumen y velocidad

#### Palabras Complejas ✅

- ✅ Detección automática durante generación
- ✅ Definiciones contextuales con WordsAPI
- ✅ Texto interactivo con popups
- ✅ Pronunciaciones fonéticas
- ✅ Almacenamiento de palabras aprendidas

#### Biblioteca Personal ✅

- ✅ CRUD completo de historias
- ✅ Sistema de favoritos funcional
- ✅ Búsqueda y filtrado
- ✅ Ordenamiento por fecha
- ✅ Estadísticas básicas de uso

### 6.2 Multiplataforma

#### Web (Vercel) ✅

- ✅ PWA completamente funcional
- ✅ Responsive design para todos los tamaños
- ✅ Performance optimizada (Core Web Vitals)
- ✅ SEO básico configurado
- ✅ HTTPS y seguridad completa

#### iOS App ✅

- ✅ Build nativo con Capacitor
- ✅ Iconos y splash screens
- ✅ Funcionalidad completa offline/online
- ✅ Performance nativa
- ✅ Lista para App Store

#### Android App ✅

- ✅ Build nativo con Capacitor
- ✅ Iconos y splash screens adaptativos
- ✅ Funcionalidad completa offline/online
- ✅ Performance nativa
- ✅ Lista para Google Play Store

---

## 7. CONFIGURACIÓN Y DEPLOYMENT

### 7.1 Variables de Entorno

#### .env.example

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter API (for AI story generation)
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

# ElevenLabs API (for text-to-speech)
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# WordsAPI (for dictionary definitions)
WORDSAPI_KEY=your-wordsapi-key

# App Configuration
APP_URL=https://storyteller-ai.vercel.app
APP_NAME=StoryTeller AI
```

### 7.2 Configuración de Vercel

#### vercel.json

```json
{
  "buildCommand": "quasar build",
  "outputDirectory": "dist/spa",
  "devCommand": "quasar dev",
  "installCommand": "npm install",
  "framework": null,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "OPENROUTER_API_KEY": "@openrouter-api-key",
    "ELEVENLABS_API_KEY": "@elevenlabs-api-key",
    "WORDSAPI_KEY": "@wordsapi-key"
  }
}
```

### 7.3 Package.json Scripts

```json
{
  "scripts": {
    "dev": "quasar dev",
    "build": "quasar build",
    "build:spa": "quasar build -m spa",
    "build:capacitor": "quasar build -m capacitor -T ios",
    "build:capacitor:android": "quasar build -m capacitor -T android",
    "deploy": "vercel --prod",
    "deploy:preview": "vercel",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:generate-types": "supabase gen types typescript --local > src/types/database.ts"
  }
}
```

---

## 8. RECURSOS Y DEPENDENCIAS

### 8.1 Stack Tecnológico Completo

```json
{
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/ios": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@quasar/extras": "^1.16.12",
    "@supabase/supabase-js": "^2.45.0",
    "pinia": "^3.0.0",
    "quasar": "^2.16.9",
    "vue": "^3.4.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0",
    "@quasar/app-vite": "^1.9.0",
    "@types/node": "^20.14.10",
    "@typescript-eslint/eslint-plugin": "^7.16.0",
    "@typescript-eslint/parser": "^7.16.0",
    "@vitejs/plugin-vue": "^5.0.5",
    "eslint": "^9.7.0",
    "eslint-plugin-vue": "^9.27.0",
    "typescript": "~5.5.0",
    "vite": "^5.3.3",
    "vitest": "^2.0.3"
  }
}
```

### 8.2 APIs Externas Requeridas

#### OpenRouter (Generación de IA)

- **URL:** https://openrouter.ai/
- **Costo:** Variable por token (~$0.002-0.02 por 1K tokens)
- **Modelos soportados:** GPT-4o, Claude-3.5-Sonnet, Llama-3.1, etc.
- **Rate limits:** 200 requests/minuto

#### ElevenLabs (Text-to-Speech)

- **URL:** https://elevenlabs.io/
- **Costo:** $5-99/mes según plan
- **Caracteres incluidos:** 10K-500K por mes
- **Calidad:** Voces premium con clonado

#### WordsAPI (Diccionario)

- **URL:** https://wordsapi.com/
- **Costo:** $5-25/mes según plan
- **Rate limits:** 2500-100K requests/día
- **Funciones:** Definiciones, sinónimos, pronunciación

### 8.3 Servicios de Infraestructura

#### Supabase

- **Plan:** Pro ($25/mes)
- **Database:** PostgreSQL con 8GB storage
- **Auth:** 100K usuarios incluidos
- **Storage:** 100GB transferencia
- **Edge Functions:** 2M invocaciones

#### Vercel

- **Plan:** Pro ($20/mes por miembro)
- **Bandwidth:** 1TB incluido
- **Function executions:** 1M incluidas
- **Build minutes:** 6K incluidos
- **Deployment:** Automático con GitHub

#### Apple Developer Program

- **Costo:** $99/año
- **Requerido para:** App Store deployment
- **Incluye:** Certificados, provisioning profiles

#### Google Play Console

- **Costo:** $25 una vez
- **Requerido para:** Play Store deployment
- **Incluye:** Analytics, crash reporting

---

## 9. CONCLUSIÓN

Este PRD proporciona una hoja de ruta completa para migrar StoryTeller AI desde su arquitectura actual (Vue 3 + Tauri + Rust) a una solución moderna y escalable usando Quasar Framework, Supabase y Vercel.

### Beneficios de la Migración:

1. **Código Base Único:** Un solo proyecto para web, iOS y Android
2. **Backend Escalable:** Supabase maneja automáticamente la escala y seguridad
3. **Deployment Simplificado:** Vercel para web, stores para móviles
4. **Mantenimiento Reducido:** Menos complejidad técnica que Rust + Tauri
5. **Desarrollo Más Rápido:** Ecosystem Vue/Quasar más accesible

### Funcionalidades Preservadas al 100%:

- ✅ Sistema completo de autenticación con roles
- ✅ Generación de historias con OpenRouter
- ✅ Síntesis de audio con ElevenLabs
- ✅ Palabras complejas con diccionario interactivo
- ✅ Biblioteca personal con favoritos
- ✅ Panel de administración completo
- ✅ Todas las 31+ funcionalidades documentadas

### Resultado Final:

Una aplicación multiplataforma moderna que mantiene todas las funcionalidades actuales mientras expande significativamente su alcance y facilidad de mantenimiento.

El proyecto estará listo para deployment inmediato en:

- **Web:** https://storyteller-ai.vercel.app
- **iOS:** App Store
- **Android:** Google Play Store

Con una experiencia de usuario unificada y rendimiento nativo en todas las plataformas.
