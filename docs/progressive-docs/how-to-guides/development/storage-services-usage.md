# 🛠️ Guía Práctica: Uso de Servicios de Storage

> **Guía completa para desarrolladores sobre cómo integrar y usar el sistema de Storage en Vue 3 + Quasar**

## 🎯 Problema que Resuelve

Como desarrollador frontend, necesitas integrar funcionalidades de upload, gestión y visualización de archivos educativos (audio TTS, avatares, banners, grabaciones) de manera eficiente y con manejo robusto de errores en una aplicación Vue 3 + Quasar.

## 💡 Solución: Patrones de Uso Implementados

### **1. Upload de Avatar con Crop y Progress**

#### **Implementación Completa en Vue Component**

```vue
<template>
  <div class="user-profile-section">
    <!-- Avatar Display + Upload -->
    <AvatarUpload
      :size="150"
      :allow-crop="true"
      :quality="0.8"
      :auto-upload="true"
      @upload-complete="onAvatarUploaded"
      @upload-error="handleUploadError"
      @upload-progress="updateProgress"
    />

    <!-- Progress Feedback -->
    <div v-if="uploadInProgress" class="upload-feedback">
      <q-linear-progress 
        :value="progress / 100" 
        color="primary" 
        class="q-mt-md"
      />
      <p class="text-center q-mt-sm">
        Uploading avatar... {{ progress }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AvatarUpload from '@/components/ui/AvatarUpload.vue';
import type { UploadResult } from '@/types/storage';

// Estado del upload
const uploadInProgress = ref(false);
const progress = ref(0);

// Handlers del upload
const onAvatarUploaded = (result: UploadResult) => {
  uploadInProgress.value = false;
  progress.value = 0;
  
  // Actualizar UI o store
  console.log('Avatar uploaded successfully:', result.data?.publicUrl);
  
  // Mostrar notificación de éxito
  $q.notify({
    type: 'positive',
    message: 'Avatar updated successfully!',
    icon: 'check_circle'
  });
};

const handleUploadError = (error: string) => {
  uploadInProgress.value = false;
  progress.value = 0;
  
  // Manejo de errores user-friendly
  $q.notify({
    type: 'negative',
    message: `Upload failed: ${error}`,
    icon: 'error',
    timeout: 5000
  });
};

const updateProgress = (newProgress: number) => {
  uploadInProgress.value = true;
  progress.value = newProgress;
};
</script>
```

#### **Uso Avanzado con Validación Personalizada**

```typescript
// En un composable personalizado
export function useProfileAvatar() {
  const { useAvatar } = await import('@/composables/useAvatar');
  const avatar = useAvatar();

  // Validación personalizada adicional
  const validateCompanyBranding = async (file: File): Promise<boolean> => {
    // Verificar que la imagen tenga colores corporativos apropiados
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // ... lógica de análisis de imagen
    return true;
  };

  const uploadWithBrandingValidation = async (file: File) => {
    try {
      // 1. Validación estándar
      const standardValidation = await avatar.validateAvatarFile(file);
      if (!standardValidation.valid) {
        throw new Error(standardValidation.errors.join(', '));
      }

      // 2. Validación personalizada
      const brandingValid = await validateCompanyBranding(file);
      if (!brandingValid) {
        throw new Error('Image does not meet company branding guidelines');
      }

      // 3. Upload con opciones específicas
      const result = await avatar.uploadAvatar({
        file,
        quality: 0.9,
        cropData: {
          x: 0, y: 0, 
          width: 400, height: 400
        }
      });

      return result;

    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  return {
    ...avatar,
    uploadWithBrandingValidation
  };
}
```

### **2. Audio TTS con ElevenLabs Integration**

#### **Generación y Almacenamiento Automático**

```typescript
// En un servicio o composable
export async function generateAndStoreNarration(
  text: string,
  storyId: string,
  chapterId?: string
) {
  const { elevenLabsService } = await import('@/services/elevenlabs/ElevenLabsService');

  try {
    // Generar audio TTS con storage automático
    const result = await elevenLabsService.generateStoryNarration(
      text,
      {
        storyId,
        chapterId,
        useCache: true,        // Usar cache inteligente
        quality: 'high',       // Calidad para educación
        forceRegenerate: false // Respetar cache
      },
      'STORY_NARRATION',      // Voice preset educativo
      (progress) => {
        // Progress callback
        console.log(`TTS Progress: ${progress}%`);
        updateProgressBar(progress);
      }
    );

    if (result.success && result.audioUrl) {
      // Audio generado y almacenado automáticamente
      return {
        audioUrl: result.audioUrl,
        duration: result.duration,
        cached: true // Cache hit si ya existía
      };
    } else {
      throw new Error(result.error || 'TTS generation failed');
    }

  } catch (error) {
    console.error('TTS generation error:', error);
    
    // Fallback graceful
    return {
      audioUrl: null,
      error: error.message,
      fallbackAvailable: true
    };
  }
}
```

#### **Sistema de Cache Inteligente**

```typescript
// Verificación de cache antes de generar
export async function getOrGenerateTTS(
  text: string, 
  options: TTSOptions
): Promise<string | null> {
  const { audioStorageService } = await import('@/services/storage/AudioStorageService');

  // 1. Intentar obtener desde cache
  const cachedUrl = await audioStorageService.getTTSAudio({
    storyId: options.storyId,
    chapterId: options.chapterId,
    text,
    voice: 'EXAVITQu4vr4xnSDxMaL', // Bella voice
    language: 'en-GB',
    model: 'eleven_multilingual_v2'
  });

  if (cachedUrl) {
    console.log('✅ TTS Cache hit - using existing audio');
    return cachedUrl;
  }

  // 2. Generar nuevo si no existe en cache
  console.log('❌ TTS Cache miss - generating new audio');
  const result = await generateAndStoreNarration(text, options.storyId, options.chapterId);
  
  return result.audioUrl;
}
```

### **3. Grabaciones de Usuario con Validación**

#### **Recording Component con Validación Educativa**

```vue
<template>
  <div class="pronunciation-recorder">
    <!-- Estado del Recording -->
    <div class="recording-status">
      <q-icon 
        :name="recordingIcon" 
        :color="recordingColor"
        size="lg"
        class="q-mr-sm"
      />
      <span>{{ recordingStatusText }}</span>
    </div>

    <!-- Controles -->
    <div class="recording-controls q-mt-md">
      <q-btn
        v-if="!isRecording && !audioBlob"
        @click="startRecording"
        icon="mic"
        color="primary"
        :disabled="!microphonePermission"
      >
        Start Recording
      </q-btn>

      <q-btn
        v-if="isRecording"
        @click="stopRecording"
        icon="stop"
        color="negative"
      >
        Stop Recording
      </q-btn>

      <q-btn
        v-if="audioBlob && !isUploading"
        @click="uploadRecording"
        icon="cloud_upload"
        color="positive"
      >
        Save Recording
      </q-btn>
    </div>

    <!-- Audio Playback -->
    <audio 
      v-if="audioUrl" 
      :src="audioUrl" 
      controls 
      class="q-mt-md full-width"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { audioStorageService } from '@/services/storage/AudioStorageService';

interface Props {
  exerciseId?: string;
  expectedText?: string;
  maxDuration?: number; // seconds
  autoSave?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxDuration: 30,
  autoSave: true
});

// Estado del recording
const isRecording = ref(false);
const audioBlob = ref<Blob | null>(null);
const audioUrl = ref<string | null>(null);
const isUploading = ref(false);
const microphonePermission = ref(false);

let mediaRecorder: MediaRecorder | null = null;
let recordingTimer: NodeJS.Timeout | null = null;

// Computed properties
const recordingIcon = computed(() => {
  if (isRecording.value) return 'radio_button_checked';
  if (audioBlob.value) return 'check_circle';
  return 'mic';
});

const recordingColor = computed(() => {
  if (isRecording.value) return 'red';
  if (audioBlob.value) return 'green';
  return 'grey';
});

const recordingStatusText = computed(() => {
  if (isRecording.value) return 'Recording...';
  if (audioBlob.value) return 'Ready to save';
  if (!microphonePermission.value) return 'Microphone permission needed';
  return 'Ready to record';
});

// Methods
const requestMicrophonePermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    microphonePermission.value = true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    microphonePermission.value = false;
  }
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(chunks, { type: 'audio/webm' });
      audioUrl.value = URL.createObjectURL(audioBlob.value);
      
      // Auto-save si está habilitado
      if (props.autoSave) {
        uploadRecording();
      }
    };

    mediaRecorder.start();
    isRecording.value = true;

    // Timer de máximo duración
    recordingTimer = setTimeout(() => {
      if (isRecording.value) {
        stopRecording();
      }
    }, props.maxDuration * 1000);

  } catch (error) {
    console.error('Failed to start recording:', error);
  }
};

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;
    
    if (recordingTimer) {
      clearTimeout(recordingTimer);
      recordingTimer = null;
    }

    // Detener stream
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
};

const uploadRecording = async () => {
  if (!audioBlob.value) return;

  isUploading.value = true;

  try {
    const result = await audioStorageService.storeUserRecording(
      audioBlob.value,
      {
        userId: 'current-user-id', // Desde auth context
        type: 'pronunciation',
        exerciseId: props.exerciseId,
        expectedText: props.expectedText,
        metadata: {
          recorded_at: new Date().toISOString(),
          duration: audioBlob.value.size, // Approximate
          quality: 'standard'
        }
      },
      (progress) => {
        console.log(`Upload progress: ${progress.percentage}%`);
      }
    );

    if (result.success) {
      // Notificar éxito
      $q.notify({
        type: 'positive',
        message: 'Recording saved successfully!',
        icon: 'cloud_done'
      });

      // Limpiar estado local
      audioBlob.value = null;
      if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value);
        audioUrl.value = null;
      }

    } else {
      throw new Error(result.error || 'Upload failed');
    }

  } catch (error) {
    console.error('Upload failed:', error);
    
    $q.notify({
      type: 'negative',
      message: `Failed to save recording: ${error.message}`,
      icon: 'error'
    });

  } finally {
    isUploading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  requestMicrophonePermission();
});

onBeforeUnmount(() => {
  if (recordingTimer) {
    clearTimeout(recordingTimer);
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>
```

### **4. Banner Management para Administradores**

#### **Dashboard de Banner Management**

```vue
<template>
  <div class="banner-management-dashboard">
    <div class="dashboard-header q-mb-lg">
      <h3>Banner Management</h3>
      <q-btn
        color="primary"
        icon="add"
        label="Create New Banner"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Banners por Ubicación -->
    <div 
      v-for="(locationBanners, location) in bannersByLocation" 
      :key="location"
      class="location-section q-mb-xl"
    >
      <h4 class="section-title">
        {{ location.toUpperCase() }} 
        <q-chip :label="locationBanners.length" color="primary" />
      </h4>

      <!-- Lista Draggable de Banners -->
      <draggable
        v-model="locationBanners"
        @end="onReorderBanners(location)"
        item-key="id"
        class="banner-list"
      >
        <template #item="{ element: banner }">
          <BannerCard
            :banner="banner"
            @edit="editBanner(banner)"
            @delete="confirmDeleteBanner(banner)"
            @toggle-active="toggleBannerStatus(banner)"
            class="q-mb-md"
          />
        </template>
      </draggable>
    </div>

    <!-- Dialog de Creación/Edición -->
    <q-dialog v-model="showCreateDialog" max-width="800px">
      <BannerEditor
        :banner="selectedBanner"
        @save="onBannerSaved"
        @cancel="closeDialog"
      />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import draggable from 'vuedraggable';
import { useBannerManagement } from '@/composables/useBannerManagement';
import BannerCard from './BannerCard.vue';
import BannerEditor from './BannerEditor.vue';

const {
  banners,
  bannersByLocation,
  loading,
  error,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} = useBannerManagement();

const showCreateDialog = ref(false);
const selectedBanner = ref(null);

// Methods
const editBanner = (banner) => {
  selectedBanner.value = banner;
  showCreateDialog.value = true;
};

const onBannerSaved = async (bannerData) => {
  try {
    if (selectedBanner.value) {
      // Update existing
      await updateBanner(selectedBanner.value.id, bannerData);
    } else {
      // Create new
      await createBanner(bannerData, 'homepage'); // default location
    }
    
    closeDialog();
    
    $q.notify({
      type: 'positive',
      message: 'Banner saved successfully!',
      icon: 'check'
    });
    
  } catch (error) {
    $q.notify({
      type: 'negative', 
      message: `Failed to save banner: ${error.message}`,
      icon: 'error'
    });
  }
};

const onReorderBanners = async (location) => {
  const locationBanners = bannersByLocation.value[location];
  const reorderData = locationBanners.map((banner, index) => ({
    id: banner.id,
    display_order: index + 1
  }));

  try {
    await reorderBanners(reorderData);
    
    $q.notify({
      type: 'positive',
      message: 'Banner order updated',
      icon: 'swap_vert'
    });
    
  } catch (error) {
    console.error('Reorder failed:', error);
  }
};

const toggleBannerStatus = async (banner) => {
  try {
    await updateBanner(banner.id, {
      is_active: !banner.is_active
    });

    $q.notify({
      type: 'info',
      message: `Banner ${banner.is_active ? 'activated' : 'deactivated'}`,
      icon: banner.is_active ? 'visibility' : 'visibility_off'
    });

  } catch (error) {
    console.error('Status toggle failed:', error);
  }
};

const confirmDeleteBanner = (banner) => {
  $q.dialog({
    title: 'Delete Banner',
    message: `Are you sure you want to delete "${banner.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await deleteBanner(banner.id);
      
      $q.notify({
        type: 'positive',
        message: 'Banner deleted successfully',
        icon: 'delete'
      });
      
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: `Failed to delete banner: ${error.message}`,
        icon: 'error'
      });
    }
  });
};

const closeDialog = () => {
  showCreateDialog.value = false;
  selectedBanner.value = null;
};

// Lifecycle
onMounted(() => {
  // Los banners se cargan automáticamente via el composable
});
</script>
```

## 📝 Patrones de Integración Avanzados

### **1. Lazy Loading de Assets Grandes**

```typescript
// Composable para lazy loading de audio TTS
export function useLazyTTSAudio(storyId: string) {
  const audioUrl = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadAudio = async (chapterId: string, text: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Intentar cache primero
      const cachedUrl = await getOrGenerateTTS(text, { storyId, chapterId });
      
      if (cachedUrl) {
        audioUrl.value = cachedUrl;
      } else {
        // Generar en background
        generateAndStoreNarration(text, storyId, chapterId)
          .then(result => {
            if (result.audioUrl) {
              audioUrl.value = result.audioUrl;
            }
          });
      }

    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    audioUrl: readonly(audioUrl),
    loading: readonly(loading),
    error: readonly(error),
    loadAudio
  };
}
```

### **2. Drag & Drop Multi-File Upload**

```typescript
// Composable para drag & drop avanzado
export function useMultiFileUpload(context: EducationalContext) {
  const uploadQueue = ref<FileUploadItem[]>([]);
  const totalProgress = ref(0);
  const isUploading = ref(false);

  interface FileUploadItem {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    result?: UploadResult;
  }

  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      uploadQueue.value.push({
        file,
        progress: 0,
        status: 'pending'
      });
    });
  };

  const uploadAll = async () => {
    isUploading.value = true;
    const pendingItems = uploadQueue.value.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      item.status = 'uploading';

      try {
        const result = await storageService.upload({
          bucket: 'user-content',
          path: `uploads/${item.file.name}`,
          file: item.file,
          educationalContext: context
        }, (progress) => {
          item.progress = progress.percentage;
          updateTotalProgress();
        });

        if (result.success) {
          item.status = 'completed';
          item.result = result;
        } else {
          throw new Error(result.error);
        }

      } catch (error) {
        item.status = 'error';
        item.error = error.message;
      }
    }

    isUploading.value = false;
  };

  const updateTotalProgress = () => {
    const totalFiles = uploadQueue.value.length;
    const totalProgressSum = uploadQueue.value.reduce((sum, item) => sum + item.progress, 0);
    totalProgress.value = totalProgressSum / totalFiles;
  };

  return {
    uploadQueue: readonly(uploadQueue),
    totalProgress: readonly(totalProgress),
    isUploading: readonly(isUploading),
    addFiles,
    uploadAll
  };
}
```

## ⚠️ Consideraciones y Best Practices

### **🔒 Seguridad**
- **Validación doble**: Cliente + servidor para todos los uploads
- **Sanitización**: Limpieza de nombres de archivo y metadatos
- **Rate limiting**: Prevenir abuse de APIs de generación TTS
- **RLS policies**: Verificar que las políticas protejan datos de usuario

### **⚡ Performance**
- **Lazy loading**: Cargar assets solo cuando son necesarios
- **Caching inteligente**: Usar SHA-256 para deduplicación
- **Compresión**: WebP para imágenes, opus para audio
- **CDN**: Aprovechar URLs públicas de Supabase para assets estáticos

### **🎯 UX/UI**
- **Progress feedback**: Siempre mostrar progreso de uploads
- **Error handling**: Mensajes claros y acciones de recovery
- **Fallback graceful**: Alternativas cuando servicios fallan
- **Accessibility**: Support para screen readers y keyboard navigation

## 🔗 Referencias Técnicas

### **📚 Documentación Relacionada**
- [Storage Service API Reference](../../reference/apis/storage-api.md)
- [ElevenLabs Integration Guide](../apis/elevenlabs-integration.md)
- [Component Testing Patterns](../testing/component-testing-patterns.md)
- [Vue 3 Composition API Best Practices](../../reference/vue3/composition-api-patterns.md)

### **🔧 Configuraciones**
- [Supabase Storage Configuration](../../reference/configurations/supabase-storage-config.md)
- [TypeScript Strict Mode Setup](../../reference/configurations/typescript-strict-config.md)
- [Quasar UI Component Integration](../../reference/configurations/quasar-component-config.md)

### **🧪 Testing**
- [Storage Service Testing](../testing/storage-service-testing.md)
- [Component Integration Testing](../testing/component-integration-testing.md)
- [Mock Strategies for File Uploads](../testing/mock-file-upload-strategies.md)

**💡 Pro Tip**: El sistema de Storage está diseñado para ser extensible. Puedes crear nuevos servicios especializados heredando de `SupabaseStorageService` para casos de uso específicos como certificados PDF, portfolios multimedia, o recursos de currículo.