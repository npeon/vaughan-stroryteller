# 🗄️ 04. Sistema de Storage para Assets Educativos

> **✅ Task 0.14 COMPLETADA** - Sistema de Storage completo con servicios especializados y componentes UI

## 🎯 Objetivo

Implementar y entender el sistema completo de Supabase Storage diseñado específicamente para la gestión de assets educativos: audio TTS, avatares de usuario, banners administrativos, y recursos de aprendizaje con validación de contexto educativo.

## 📊 Estado Actual de Configuración

### **✅ Task 0.14: Sistema de Storage Completo**
- **Arquitectura de 3 niveles**: Base service + servicios especializados + componentes UI
- **3 Buckets configurados**: story-assets (público), user-content (privado), learning-resources (privado)  
- **11 Contextos educativos**: tts, avatar, recording, illustration, banner, certificate, etc.
- **Seguridad RLS**: Políticas de Row Level Security para protección de datos educativos
- **TypeScript 100%**: Tipos estrictos con exactOptionalPropertyTypes

## 🧪 1. Arquitectura del Sistema de Storage

### **📁 Estructura de Servicios Implementada**

```typescript
src/services/storage/
├── SupabaseStorageService.ts    // ✅ Servicio base con CRUD operations
├── AudioStorageService.ts       // ✅ Especializado para TTS y grabaciones
└── types/
    └── storage.ts              // ✅ Tipos TypeScript completos
```

### **🔍 Elementos Clave de la Arquitectura**

#### **1. Servicio Base (SupabaseStorageService)**
```typescript
export class SupabaseStorageService {
  // 3 buckets especializados para diferentes tipos de contenido
  private readonly bucketConfigs = {
    'story-assets': {
      isPublic: true,
      fileSizeLimit: 52428800, // 50MB para assets grandes
      allowedTypes: ['image/*', 'audio/*', 'video/*']
    },
    'user-content': {
      isPublic: false,
      fileSizeLimit: 20971520, // 20MB para contenido personal
      allowedTypes: ['image/*', 'audio/*', 'application/pdf']
    },
    'learning-resources': {
      isPublic: false, 
      fileSizeLimit: 31457280, // 30MB para recursos educativos
      allowedTypes: ['image/*', 'audio/*', 'video/*', 'application/pdf']
    }
  }

  // 11 contextos educativos con validación específica
  private readonly educationalContexts = {
    tts: { maxSize: 10485760, bucket: 'story-assets' },
    avatar: { maxSize: 5242880, bucket: 'user-content' },
    recording: { maxSize: 10485760, bucket: 'user-content' },
    illustration: { maxSize: 15728640, bucket: 'story-assets' },
    banner: { maxSize: 5242880, bucket: 'story-assets' },
    // ... más contextos
  }
}
```

#### **2. Servicio Especializado (AudioStorageService)**
```typescript
export class AudioStorageService extends SupabaseStorageService {
  // Integración automática con ElevenLabs TTS
  async storeTTSAudio(
    audioBlob: Blob,
    options: TTSAudioOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<AudioProcessingResult>

  // Sistema de cache inteligente para TTS
  async getTTSAudio(options: TTSAudioOptions): Promise<string | null>

  // Gestión de grabaciones de usuario
  async storeUserRecording(
    audioBlob: Blob,
    options: RecordingOptions
  ): Promise<AudioProcessingResult>
}
```

## 🧪 2. Componentes UI Implementados

### **🖼️ Avatar Upload Component**

**Archivo**: `src/components/ui/AvatarUpload.vue`

```vue
<template>
  <div class="avatar-upload-container">
    <!-- Avatar Display con lazy loading -->
    <q-avatar :size="`${size}px`" class="avatar-image">
      <q-img
        :src="avatarUrl"
        :alt="altText"
        loading="lazy"
        fit="cover"
        :placeholder-src="'/images/default-avatar.png'"
      />
    </q-avatar>

    <!-- Controles de Upload -->
    <q-btn
      round icon="photo_camera"
      @click="fileInput?.click()"
      :loading="isUploading"
    />

    <!-- Progreso de Upload -->
    <q-linear-progress 
      v-if="isUploading"
      :value="uploadProgress / 100"
      class="upload-progress"
    />
  </div>
</template>
```

**Características del AvatarUpload**:
- ✅ **Crop funcional**: Canvas-based image cropping
- ✅ **Validación**: Tamaño, formato, dimensiones
- ✅ **Progress tracking**: Progress bar en tiempo real
- ✅ **Optimización**: Conversión a WebP con compresión
- ✅ **Error handling**: Mensajes user-friendly

### **🏪 Banner Manager Component**

**Archivo**: `src/components/admin/BannerManager.vue`

```vue
<script setup lang="ts">
import { useBannerManagement } from '../../composables/useBannerManagement';

const {
  banners,
  loading,
  error,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannersByLocation
} = useBannerManagement();
</script>
```

**Características del BannerManager**:
- ✅ **Admin-only**: Validación de roles
- ✅ **Drag & Drop**: Reordenamiento visual
- ✅ **Analytics**: Tracking de impresiones y clicks
- ✅ **Multi-targeting**: Audiencias específicas

## 🧪 3. Composables Especializados

### **🎭 useAvatar Composable**

```typescript
export function useAvatar() {
  // Estado reactivo
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const currentAvatar = ref<string | null>(null);

  // Validación de archivos
  const validateAvatarFile = async (file: File): Promise<AvatarValidation> => {
    const errors: string[] = [];
    
    // Validar tamaño (5MB max)
    if (file.size > AVATAR_CONFIG.MAX_SIZE) {
      errors.push(`File size exceeds ${formatBytes(AVATAR_CONFIG.MAX_SIZE)}`);
    }

    // Validar formato
    if (!AVATAR_CONFIG.ALLOWED_FORMATS.includes(file.type)) {
      errors.push('Format not supported. Use JPG, PNG, or WebP.');
    }

    // Validar dimensiones
    const dimensions = await getImageDimensions(file);
    if (dimensions.width < 100 || dimensions.height < 100) {
      errors.push('Image too small. Minimum size: 100x100px');
    }

    return { valid: errors.length === 0, errors };
  };

  return {
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    currentAvatar: readonly(currentAvatar),
    validateAvatarFile,
    uploadAvatar,
    removeAvatar
  };
}
```

### **🏪 useBannerManagement Composable**

```typescript
export function useBannerManagement() {
  const banners = ref<Banner[]>([]);

  // Agrupación por ubicación
  const bannersByLocation = computed(() => {
    const grouped: Record<string, Banner[]> = {};
    
    banners.value.forEach(banner => {
      if (!grouped[banner.display_location]) {
        grouped[banner.display_location] = [];
      }
      grouped[banner.display_location]!.push(banner);
    });

    // Ordenar por display_order
    Object.keys(grouped).forEach(location => {
      grouped[location]!.sort((a, b) => a.display_order - b.display_order);
    });

    return grouped;
  });

  return {
    banners: readonly(banners),
    bannersByLocation,
    createBanner,
    updateBanner,
    deleteBanner
  };
}
```

## ✅ 4. Verificación - Sistema Funcionando

### **🔍 Comandos de Verificación Disponibles**

```bash
# 1. Verificar tipos TypeScript
npm run typecheck

# 2. Ejecutar tests del Storage (cuando estén implementados)
npm run test:unit src/services/storage

# 3. Verificar componentes con Cypress
npm run test:component src/components/ui/AvatarUpload.vue
```

### **🧪 Test de Verificación Manual**

#### **Test 1: Upload de Avatar**
```typescript
// En el browser dev tools console:
const { useAvatar } = await import('/src/composables/useAvatar');
const avatar = useAvatar();

// Verificar que el composable está disponible
console.log('Avatar composable loaded:', !!avatar.uploadAvatar);
```

#### **Test 2: Storage Service**
```typescript
// Verificar servicio de Storage
const { audioStorageService } = await import('/src/services/storage/AudioStorageService');
const healthCheck = await audioStorageService.healthCheck();
console.log('Storage service status:', healthCheck);
```

#### **Test 3: Supabase Connection**
```bash
# Verificar conexión con Supabase
npx supabase status

# Debería mostrar:
# supabase local development setup is running.
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
```

## 🔧 5. Configuración Técnica Detallada

### **📊 Buckets de Storage Configurados**

| Bucket | Visibilidad | Tamaño Máx. | Tipos Permitidos | Uso Principal |
|--------|-------------|-------------|------------------|---------------|
| `story-assets` | Público | 50MB | image/*, audio/*, video/* | TTS, ilustraciones, banners |
| `user-content` | Privado | 20MB | image/*, audio/*, application/pdf | Avatares, grabaciones, portafolios |
| `learning-resources` | Privado | 30MB | image/*, audio/*, video/*, pdf | Recursos educativos, certificados |

### **🛡️ Políticas RLS Implementadas**

```sql
-- Política para user-content (solo el propietario)
CREATE POLICY "Users can manage their own content"
ON storage.objects FOR ALL
USING (
  bucket_id = 'user-content' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para story-assets (lectura pública, escritura autenticada)
CREATE POLICY "Public read access for story assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-assets');

CREATE POLICY "Authenticated upload to story assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-assets' 
  AND auth.role() = 'authenticated'
);
```

### **⚡ Características de Performance**

- **Deduplicación**: SHA-256 hash para evitar archivos duplicados
- **Caching inteligente**: Diferentes estrategias por tipo de contenido
- **Lazy loading**: Carga diferida de imágenes y assets grandes
- **Compresión**: WebP automático para imágenes
- **Metadata**: Extracto automático de duración para audio

## 🚀 Próximos Pasos

### **Continuación Recomendada**:
1. **[05. Fundamentos de TDD](./05-tdd-fundamentals.md)** - Aprender metodología de testing
2. **[How-To: Storage Usage](../how-to-guides/development/storage-services-usage.md)** - Patrones de uso en desarrollo
3. **[Reference: Storage API](../reference/apis/storage-api.md)** - Documentación completa de APIs

### **🧠 Conceptos Clave Aprendidos**:
- ✅ **Arquitectura de servicios**: Base class + especializaciones
- ✅ **Contextos educativos**: Validación específica por uso
- ✅ **TypeScript avanzado**: exactOptionalPropertyTypes y type safety
- ✅ **Vue 3 patterns**: Composables especializados y componentes reutilizables
- ✅ **Supabase Storage**: RLS policies y bucket configuration

---

## 📚 Referencias Técnicas

### **🔗 Configuraciones Relacionadas**
- [Supabase Configuration](../reference/configurations/supabase-config.md)
- [TypeScript Strict Mode](../reference/configurations/typescript-config.md)
- [Quasar UI Components](../reference/configurations/quasar-config.md)

### **🔗 APIs Integradas**
- [Storage Service API](../reference/apis/storage-api.md)
- [ElevenLabs Integration](../reference/apis/elevenlabs-reference.md)
- [Supabase Client Reference](../reference/apis/supabase-reference.md)

### **🔗 Desarrollo y Testing**
- [Component Testing Patterns](../how-to-guides/testing/component-testing-patterns.md)
- [Service Layer Testing](../how-to-guides/testing/service-testing-patterns.md)
- [Storage Development Guide](../how-to-guides/development/storage-services-usage.md)

**💡 Tip**: El sistema de Storage es la base para muchas features educativas. Dominar estos conceptos te dará una base sólida para implementar funcionalidades avanzadas como TTS automático, portfolios de estudiantes, y sistemas de certificación.

**⚠️ Importante**: Este sistema fue diseñado específicamente para cumplir con regulaciones educativas (COPPA/FERPA). Los contextos educativos y políticas RLS están optimizados para protección de datos de estudiantes.