<template>
  <div class="avatar-upload-container">
    <!-- Avatar Display -->
    <div class="avatar-display">
      <div 
        class="avatar-wrapper"
        :class="{ 'uploading': isUploading }"
        @click="!isUploading && fileInput?.click()"
      >
        <!-- Avatar Image -->
        <q-avatar
          :size="`${size}px`"
          class="avatar-image"
          :class="{ 'clickable': !isUploading }"
        >
          <q-img
            :src="avatarUrl"
            :alt="altText"
            loading="lazy"
            fit="cover"
            :placeholder-src="'/images/default-avatar.png'"
          >
            <template #error>
              <q-icon 
                name="person" 
                :size="`${(props.size || 120) * 0.6}px`" 
                color="grey-6"
              />
            </template>
          </q-img>

          <!-- Upload Overlay -->
          <div 
            v-if="!isUploading"
            class="avatar-overlay"
          >
            <q-icon 
              name="camera_alt" 
              size="24px" 
              color="white" 
            />
            <div class="overlay-text">
              {{ hasCustomAvatar ? 'Change' : 'Upload' }}
            </div>
          </div>

          <!-- Upload Progress -->
          <div 
            v-if="isUploading"
            class="avatar-progress"
          >
            <q-circular-progress
              :value="uploadProgress"
              size="60px"
              color="primary"
              track-color="grey-3"
              :thickness="0.2"
              show-value
            />
          </div>
        </q-avatar>

        <!-- Upload Status -->
        <div v-if="error" class="upload-status error">
          <q-icon name="error" color="negative" size="16px" />
          {{ error }}
        </div>
        <div v-else-if="isUploading" class="upload-status uploading">
          <q-icon name="cloud_upload" color="primary" size="16px" />
          Uploading avatar...
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="!hideActions" class="avatar-actions">
        <q-btn
          v-if="!isUploading"
          flat
          dense
          round
          icon="photo_camera"
          color="primary"
          size="sm"
          @click="fileInput?.click()"
        >
          <q-tooltip>{{ hasCustomAvatar ? 'Change Avatar' : 'Upload Avatar' }}</q-tooltip>
        </q-btn>

        <q-btn
          v-if="hasCustomAvatar && !isUploading"
          flat
          dense
          round
          icon="delete"
          color="negative"
          size="sm"
          @click="confirmRemoval = true"
        >
          <q-tooltip>Remove Avatar</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Image Crop Dialog -->
    <q-dialog 
      v-model="showCropDialog" 
      persistent
      maximized
      class="avatar-crop-dialog"
    >
      <q-card class="crop-card">
        <q-card-section class="crop-header">
          <div class="text-h6">Crop Your Avatar</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="cancelCrop"
          />
        </q-card-section>

        <q-card-section class="crop-content">
          <div class="crop-container">
            <canvas
              ref="cropCanvas"
              class="crop-canvas"
              @mousedown="startCrop"
              @mousemove="updateCrop"
              @mouseup="endCrop"
              @touchstart="startCrop"
              @touchmove="updateCrop"
              @touchend="endCrop"
            />
          </div>

          <div class="crop-preview">
            <div class="preview-label">Preview:</div>
            <q-avatar size="120px" class="preview-avatar">
              <canvas ref="previewCanvas" width="120" height="120" />
            </q-avatar>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="crop-actions">
          <q-btn
            flat
            label="Cancel"
            @click="cancelCrop"
          />
          <q-btn
            unelevated
            label="Apply Crop"
            color="primary"
            :loading="isUploading"
            @click="applyCrop"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Removal Confirmation -->
    <q-dialog 
      v-model="confirmRemoval"
      persistent
    >
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Remove your current avatar?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="confirmRemoval = false" />
          <q-btn 
            unelevated 
            label="Remove" 
            color="negative" 
            @click="removeCurrentAvatar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Validation Messages -->
    <div v-if="validationResults.length" class="validation-messages">
      <div 
        v-for="(result, index) in validationResults"
        :key="index"
        class="validation-message"
        :class="result.type"
      >
        <q-icon 
          :name="result.type === 'error' ? 'error' : 'warning'" 
          :color="result.type === 'error' ? 'negative' : 'orange'" 
          size="16px"
        />
        {{ result.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAvatar } from '../../composables/useAvatar';

interface Props {
  size?: number;
  altText?: string;
  hideActions?: boolean;
  allowCrop?: boolean;
  quality?: number;
  autoUpload?: boolean;
}

interface Emits {
  (e: 'upload-start'): void;
  (e: 'upload-progress', progress: number): void;
  (e: 'upload-complete', result: unknown): void;
  (e: 'upload-error', error: string): void;
  (e: 'avatar-removed'): void;
}

const props = withDefaults(defineProps<Props>(), {
  size: 120,
  altText: 'User avatar',
  hideActions: false,
  allowCrop: true,
  quality: 0.8,
  autoUpload: true
});

const emit = defineEmits<Emits>();

// Composable
const {
  isUploading,
  uploadProgress,
  avatarUrl,
  hasCustomAvatar,
  error,
  validateAvatarFile,
  uploadAvatar,
  removeAvatar
} = useAvatar();

// Local state
const fileInput = ref<HTMLInputElement>();
const cropCanvas = ref<HTMLCanvasElement>();
const previewCanvas = ref<HTMLCanvasElement>();
const showCropDialog = ref(false);
const confirmRemoval = ref(false);
const selectedFile = ref<File | null>(null);
const cropData = ref({
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  isDragging: false,
  isResizing: false
});

// Validation messages
const validationResults = ref<Array<{type: 'error' | 'warning', message: string}>>([]);

// ============================================================================
// FILE HANDLING
// ============================================================================

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  try {
    validationResults.value = [];
    
    // Validar archivo
    const validation = await validateAvatarFile(file);
    
    // Mostrar errores y advertencias
    validation.errors.forEach((error: string) => {
      validationResults.value.push({ type: 'error', message: error });
    });
    
    validation.warnings.forEach((warning: string) => {
      validationResults.value.push({ type: 'warning', message: warning });
    });

    if (!validation.valid) {
      return;
    }

    selectedFile.value = file;

    // Mostrar dialog de crop si está habilitado
    if (props.allowCrop) {
      showCropImage(file);
    } else if (props.autoUpload) {
      await uploadSelectedFile();
    }

  } catch (err) {
    validationResults.value = [{
      type: 'error', 
      message: err instanceof Error ? err.message : 'Failed to process file'
    }];
  } finally {
    // Limpiar input
    target.value = '';
  }
};

const uploadSelectedFile = async (cropData?: unknown) => {
  if (!selectedFile.value) return;

  try {
    emit('upload-start');
    
    const result = await uploadAvatar({
      file: selectedFile.value,
      cropData: cropData as { x: number; y: number; width: number; height: number; scaleX?: number; scaleY?: number },
      quality: props.quality
    });

    if (result.success) {
      emit('upload-complete', result);
      validationResults.value = [];
    } else {
      emit('upload-error', result.error || 'Upload failed');
      validationResults.value = [{
        type: 'error',
        message: result.error || 'Upload failed'
      }];
    }

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Upload failed';
    emit('upload-error', errorMessage);
    validationResults.value = [{ type: 'error', message: errorMessage }];
  }
};

// ============================================================================
// IMAGE CROPPING
// ============================================================================

const showCropImage = (file: File) => {
  if (!cropCanvas.value || !previewCanvas.value) return;

  const img = new Image();
  
  img.onload = () => {
    const canvas = cropCanvas.value!;
    const ctx = canvas.getContext('2d')!;
    
    // Configurar canvas
    const maxSize = 500;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    // Dibujar imagen
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Inicializar área de crop
    const size = Math.min(canvas.width, canvas.height) * 0.8;
    cropData.value = {
      x: (canvas.width - size) / 2,
      y: (canvas.height - size) / 2,
      width: size,
      height: size,
      isDragging: false,
      isResizing: false
    };
    
    drawCropOverlay();
    updatePreview();
    
    showCropDialog.value = true;
    URL.revokeObjectURL(img.src);
  };

  img.src = URL.createObjectURL(file);
};

const drawCropOverlay = () => {
  if (!cropCanvas.value) return;

  const canvas = cropCanvas.value;
  const ctx = canvas.getContext('2d')!;
  const { x, y, width, height } = cropData.value;

  // Redibujar imagen base
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Overlay oscuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Área de crop clara
    ctx.clearRect(x, y, width, height);
    ctx.drawImage(img, x, y, width, height, x, y, width, height);
    
    // Borde del crop
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Handles de resize
    const handleSize = 8;
    ctx.fillStyle = '#1976d2';
    // Esquinas
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
  };
  
  img.src = canvas.toDataURL();
};

const updatePreview = () => {
  if (!cropCanvas.value || !previewCanvas.value || !selectedFile.value) return;

  const sourceCanvas = cropCanvas.value;
  const previewCanvasEl = previewCanvas.value;
  const previewCtx = previewCanvasEl.getContext('2d')!;
  const { x, y, width, height } = cropData.value;

  // Limpiar preview
  previewCtx.clearRect(0, 0, 120, 120);

  // Crear imagen temporal para obtener datos originales
  const img = new Image();
  img.onload = () => {
    // Calcular coordenadas en imagen original
    const scale = img.width / sourceCanvas.width;
    const sourceX = x * scale;
    const sourceY = y * scale;
    const sourceWidth = width * scale;
    const sourceHeight = height * scale;

    // Dibujar crop en preview
    previewCtx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 120, 120
    );
    
    URL.revokeObjectURL(img.src);
  };

  img.src = URL.createObjectURL(selectedFile.value);
};

// Eventos de crop (implementación simplificada)
const startCrop = (event: MouseEvent | TouchEvent) => {
  event.preventDefault();
  // const rect = cropCanvas.value!.getBoundingClientRect();
  // const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
  // const clientY = 'touches' in event ? event.touches[0]?.clientY : event.clientY;
  
  // const x = (clientX || 0) - rect.left;
  // const y = (clientY || 0) - rect.top;
  
  cropData.value.isDragging = true;
};

const updateCrop = (event: MouseEvent | TouchEvent) => {
  if (!cropData.value.isDragging) return;
  event.preventDefault();
  
  // Implementación simplificada - en producción sería más compleja
  drawCropOverlay();
  updatePreview();
};

const endCrop = () => {
  cropData.value.isDragging = false;
  cropData.value.isResizing = false;
};

const applyCrop = async () => {
  if (!selectedFile.value) return;

  const cropOptions = {
    x: cropData.value.x,
    y: cropData.value.y,
    width: cropData.value.width,
    height: cropData.value.height
  };

  showCropDialog.value = false;
  
  if (props.autoUpload) {
    await uploadSelectedFile(cropOptions);
  } else {
    emit('upload-complete', { file: selectedFile.value, cropData: cropOptions });
  }
};

const cancelCrop = () => {
  showCropDialog.value = false;
  selectedFile.value = null;
};

// ============================================================================
// AVATAR REMOVAL
// ============================================================================

const removeCurrentAvatar = async () => {
  try {
    const success = await removeAvatar();
    if (success) {
      emit('avatar-removed');
      validationResults.value = [];
    }
  } catch {
    validationResults.value = [{
      type: 'error',
      message: 'Failed to remove avatar'
    }];
  } finally {
    confirmRemoval.value = false;
  }
};

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Emitir progreso cuando cambie
  if (uploadProgress.value) {
    emit('upload-progress', uploadProgress.value);
  }
});

onUnmounted(() => {
  // Limpiar URLs de objetos
  if (selectedFile.value) {
    URL.revokeObjectURL(URL.createObjectURL(selectedFile.value));
  }
});
</script>

<style lang="scss" scoped>
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  transition: all 0.2s ease;

  &.uploading {
    opacity: 0.8;
  }

  .avatar-image {
    position: relative;
    border: 3px solid transparent;
    transition: all 0.2s ease;

    &.clickable {
      cursor: pointer;
      
      &:hover {
        border-color: var(--q-primary);
        transform: scale(1.02);
      }
    }
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 50%;

    .overlay-text {
      color: white;
      font-size: 12px;
      font-weight: 500;
    }
  }

  &:hover .avatar-overlay {
    opacity: 1;
  }

  .avatar-progress {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-top: 8px;

  &.error {
    color: var(--q-negative);
  }

  &.uploading {
    color: var(--q-primary);
  }
}

.avatar-actions {
  display: flex;
  gap: 8px;
}

.validation-messages {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 300px;
  margin-top: 8px;

  .validation-message {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 4px;

    &.error {
      background: rgba(244, 67, 54, 0.1);
      color: var(--q-negative);
    }

    &.warning {
      background: rgba(255, 152, 0, 0.1);
      color: #f57800;
    }
  }
}

// Dialog styles
.avatar-crop-dialog {
  .crop-card {
    min-height: 600px;
    display: flex;
    flex-direction: column;
  }

  .crop-header {
    border-bottom: 1px solid var(--q-separator-color);
    padding: 16px 24px;
    display: flex;
    align-items: center;
  }

  .crop-content {
    flex: 1;
    display: flex;
    gap: 24px;
    padding: 24px;

    .crop-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      .crop-canvas {
        border: 1px solid var(--q-separator-color);
        cursor: crosshair;
        max-width: 100%;
        max-height: 400px;
      }
    }

    .crop-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      min-width: 160px;

      .preview-label {
        font-weight: 500;
        color: var(--q-primary);
      }

      .preview-avatar {
        border: 2px solid var(--q-separator-color);
        canvas {
          border-radius: 50%;
        }
      }
    }
  }

  .crop-actions {
    border-top: 1px solid var(--q-separator-color);
    padding: 16px 24px;
  }
}

// Responsive
@media (max-width: 768px) {
  .avatar-crop-dialog .crop-content {
    flex-direction: column;
    
    .crop-preview {
      min-width: auto;
    }
  }
}
</style>