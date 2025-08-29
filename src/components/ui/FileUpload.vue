<template>
  <div class="file-upload-container">
    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedFormats"
      v-bind="multiple ? { multiple: true } : {}"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Upload Area -->
    <div 
      class="file-upload-area"
      :class="{
        'file-upload-area--drag-over': isDragOver,
        'file-upload-area--disabled': disabled || isUploading,
        [`file-upload-area--${variant}`]: true
      }"
      @click="!disabled && !isUploading && fileInput?.click()"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
    >
      <!-- Icon or Preview -->
      <div class="file-upload-content">
        <template v-if="variant === 'dropzone'">
          <!-- Dropzone Style -->
          <div class="upload-icon-container">
            <q-icon 
              :name="uploadIcon" 
              :size="iconSize" 
              :color="disabled ? 'grey-5' : 'primary'" 
            />
          </div>
          
          <div class="upload-text">
            <div class="upload-primary-text">
              {{ primaryText }}
            </div>
            <div v-if="secondaryText" class="upload-secondary-text">
              {{ secondaryText }}
            </div>
          </div>

          <!-- File Restrictions -->
          <div v-if="showRestrictions" class="upload-restrictions">
            <div v-if="maxFileSize" class="restriction-item">
              <q-icon name="storage" size="14px" color="grey-6" />
              Max: {{ formatBytes(maxFileSize) }}
            </div>
            <div v-if="acceptedFormats" class="restriction-item">
              <q-icon name="description" size="14px" color="grey-6" />
              {{ formatAcceptedTypes() }}
            </div>
            <div v-if="multiple && maxFiles" class="restriction-item">
              <q-icon name="filter_list" size="14px" color="grey-6" />
              Max {{ maxFiles }} files
            </div>
          </div>
        </template>

        <template v-else-if="variant === 'button'">
          <!-- Button Style -->
          <q-btn
            :color="buttonColor"
            :outline="buttonOutline"
            :flat="buttonFlat"
            :size="buttonSize"
            :icon="uploadIcon"
            :label="primaryText"
            :loading="isUploading"
            :disable="disabled"
          />
        </template>

        <template v-else-if="variant === 'compact'">
          <!-- Compact Style -->
          <div class="upload-compact">
            <q-icon 
              :name="uploadIcon" 
              size="20px" 
              :color="disabled ? 'grey-5' : 'primary'" 
            />
            <span class="upload-compact-text">{{ primaryText }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Selected Files Preview -->
    <div v-if="selectedFiles.length > 0" class="selected-files">
      <div class="selected-files-header">
        <span class="files-count">
          {{ selectedFiles.length }} file{{ selectedFiles.length !== 1 ? 's' : '' }} selected
        </span>
        <q-btn
          v-if="!isUploading"
          flat
          dense
          size="sm"
          icon="clear"
          color="grey-6"
          @click="clearSelection"
        >
          <q-tooltip>Clear Selection</q-tooltip>
        </q-btn>
      </div>

      <div class="files-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="`file-${index}`"
          class="file-item"
          :class="{ 'file-item--error': file.error }"
        >
          <!-- File Info -->
          <div class="file-info">
            <q-icon 
              :name="getFileIcon(file)" 
              size="20px" 
              :color="file.error ? 'negative' : 'primary'" 
            />
            <div class="file-details">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-size">{{ formatBytes(file.size) }}</div>
            </div>
          </div>

          <!-- Progress or Actions -->
          <div class="file-actions">
            <template v-if="isUploading && uploadProgress[index] !== undefined">
              <!-- Upload Progress -->
              <ProgressIndicator
                variant="circular"
                :value="uploadProgress[index]"
                :size="24"
                color="primary"
                show-value
              />
            </template>
            <template v-else>
              <!-- Remove Button -->
              <q-btn
                flat
                dense
                round
                size="xs"
                icon="close"
                color="grey-6"
                @click="removeFile(index)"
              >
                <q-tooltip>Remove File</q-tooltip>
              </q-btn>
            </template>
          </div>

          <!-- Error Message -->
          <div v-if="file.error" class="file-error">
            <q-icon name="error" size="14px" color="negative" />
            {{ file.error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Actions -->
    <div v-if="selectedFiles.length > 0 && showUploadButton" class="upload-actions">
      <q-btn
        color="primary"
        :label="uploadButtonText"
        :loading="isUploading"
        :disable="hasErrors || disabled"
        @click="startUpload"
      />
      <q-btn
        v-if="!isUploading"
        flat
        label="Clear"
        @click="clearSelection"
      />
    </div>

    <!-- Overall Progress -->
    <div v-if="isUploading && showOverallProgress" class="overall-progress">
      <ProgressIndicator
        variant="linear"
        :value="overallProgress"
        :label="`Uploading ${uploadedCount} of ${selectedFiles.length} files...`"
        color="primary"
        show-value
        show-label
      />
    </div>

    <!-- Error Messages -->
    <div v-if="error" class="upload-error">
      <q-icon name="error" color="negative" size="16px" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ProgressIndicator from './ProgressIndicator.vue';

export interface FileWithError extends File {
  error?: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface Props {
  /** Upload variant */
  variant?: 'dropzone' | 'button' | 'compact';
  /** Accept file types (mime types) */
  accept?: string[];
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Upload icon */
  uploadIcon?: string;
  /** Primary text */
  primaryText?: string;
  /** Secondary text */
  secondaryText?: string;
  /** Show file restrictions */
  showRestrictions?: boolean;
  /** Auto upload on selection */
  autoUpload?: boolean;
  /** Show upload button */
  showUploadButton?: boolean;
  /** Upload button text */
  uploadButtonText?: string;
  /** Show overall progress */
  showOverallProgress?: boolean;
  /** Button color (for button variant) */
  buttonColor?: string;
  /** Button outline (for button variant) */
  buttonOutline?: boolean;
  /** Button flat (for button variant) */
  buttonFlat?: boolean;
  /** Button size (for button variant) */
  buttonSize?: string;
  /** Icon size */
  iconSize?: string;
  /** Custom validation function */
  customValidation?: (file: File) => Promise<string | null>;
  /** Educational context for storage */
  educationalContext?: 'tts' | 'avatar' | 'recording' | 'illustration' | 'banner' | 'certificate' | 'portfolio' | 'document' | 'video' | 'thumbnail' | 'generic';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dropzone',
  accept: () => [],
  multiple: false,
  disabled: false,
  uploadIcon: 'cloud_upload',
  primaryText: 'Drop files here or click to browse',
  secondaryText: 'Drag and drop files or click to select from your device',
  showRestrictions: true,
  autoUpload: false,
  showUploadButton: true,
  uploadButtonText: 'Upload Files',
  showOverallProgress: true,
  buttonColor: 'primary',
  buttonOutline: false,
  buttonFlat: false,
  buttonSize: 'md',
  iconSize: '48px',
  educationalContext: 'generic'
});

defineEmits<{
  /** Emitted when files are selected */
  filesSelected: [files: FileWithError[]];
  /** Emitted when upload starts */
  uploadStart: [files: FileWithError[]];
  /** Emitted when individual file upload progresses */
  fileProgress: [fileIndex: number, progress: number];
  /** Emitted when individual file upload completes */
  fileComplete: [fileIndex: number, result: unknown];
  /** Emitted when all uploads complete */
  uploadComplete: [results: unknown[]];
  /** Emitted when upload fails */
  uploadError: [error: string, fileIndex?: number];
  /** Emitted when files are cleared */
  filesCleared: [];
}>();

// State
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<FileWithError[]>([]);
const isUploading = ref(false);
const uploadProgress = ref<Record<number, number>>({});
const isDragOver = ref(false);
const error = ref<string>('');
const uploadResults = ref<unknown[]>([]);

// Computed
const acceptedFormats = computed(() => {
  return props.accept.length > 0 ? props.accept.join(',') : '*/*';
});

const hasErrors = computed(() => {
  return selectedFiles.value.some(file => file.error);
});

const overallProgress = computed(() => {
  if (!isUploading.value || selectedFiles.value.length === 0) return 0;
  
  const totalProgress = Object.values(uploadProgress.value).reduce((sum, progress) => sum + progress, 0);
  return totalProgress / selectedFiles.value.length;
});

const uploadedCount = computed(() => {
  return Object.values(uploadProgress.value).filter(progress => progress === 100).length;
});

// Methods
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatAcceptedTypes = (): string => {
  if (props.accept.length === 0) return 'All file types';
  
  const extensions = props.accept
    .map(type => {
      if (type.startsWith('.')) return type.toUpperCase();
      if (type.includes('/')) {
        const [category, subtype] = type.split('/');
        if (subtype === '*') return category?.toUpperCase() || '';
        return subtype?.toUpperCase() || '';
      }
      return type.toUpperCase();
    })
    .join(', ');
    
  return extensions;
};

const getFileIcon = (file: FileWithError): string => {
  if (file.error) return 'error';
  
  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/')) return 'audiotrack';
  if (type.startsWith('video/')) return 'videocam';
  if (type.includes('pdf')) return 'picture_as_pdf';
  if (type.includes('text') || type.includes('document')) return 'description';
  if (type.includes('spreadsheet') || type.includes('csv')) return 'grid_on';
  if (type.includes('presentation')) return 'slideshow';
  if (type.includes('zip') || type.includes('compressed')) return 'archive';
  
  return 'insert_drive_file';
};

const validateFile = async (file: File): Promise<string | null> => {
  // Size validation
  if (props.maxFileSize && file.size > props.maxFileSize) {
    return `File size exceeds ${formatBytes(props.maxFileSize)}`;
  }
  
  // Type validation
  if (props.accept.length > 0) {
    const isAccepted = props.accept.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });
    
    if (!isAccepted) {
      return `File type not allowed. Accepted: ${formatAcceptedTypes()}`;
    }
  }
  
  // Custom validation
  if (props.customValidation) {
    return await props.customValidation(file);
  }
  
  return null;
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  await processSelectedFiles(files);
};

const processSelectedFiles = async (files: File[]) => {
  error.value = '';
  
  // Validate file count
  if (props.maxFiles && files.length > props.maxFiles) {
    error.value = `Maximum ${props.maxFiles} files allowed`;
    return;
  }
  
  const filesWithValidation: FileWithError[] = [];
  
  for (const file of files) {
    const fileWithError = file as FileWithError;
    const validationError = await validateFile(file);
    if (validationError) {
      fileWithError.error = validationError;
    }
    filesWithValidation.push(fileWithError);
  }
  
  if (props.multiple) {
    selectedFiles.value.push(...filesWithValidation);
  } else {
    selectedFiles.value = filesWithValidation;
  }
  
  // Auto upload if enabled and no errors
  if (props.autoUpload && !hasErrors.value) {
    await startUpload();
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  delete uploadProgress.value[index];
};

const clearSelection = () => {
  selectedFiles.value = [];
  uploadProgress.value = {};
  uploadResults.value = [];
  error.value = '';
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const startUpload = async () => {
  if (hasErrors.value || selectedFiles.value.length === 0) return;
  
  isUploading.value = true;
  uploadResults.value = [];
  
  try {
    // This would integrate with your actual upload service
    // For now, simulate upload progress
    for (let i = 0; i < selectedFiles.value.length; i++) {
      uploadProgress.value[i] = 0;
      
      // Simulate upload progress
      const simulateProgress = () => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            uploadProgress.value[i] = (uploadProgress.value[i] || 0) + Math.random() * 20;
            
            if ((uploadProgress.value[i] || 0) >= 100) {
              uploadProgress.value[i] = 100;
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };
      
      await simulateProgress();
      const currentFile = selectedFiles.value[i];
      if (currentFile) {
        uploadResults.value[i] = { success: true, file: currentFile };
      }
    }
    
    // Upload complete
    // In real implementation, you would call your storage service here
    
  } catch (uploadError: unknown) {
    const errorMessage = uploadError instanceof Error ? uploadError.message : 'Upload failed';
    error.value = errorMessage;
  } finally {
    isUploading.value = false;
  }
};

// Drag and Drop handlers
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (!props.disabled && !isUploading.value) {
    isDragOver.value = true;
  }
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  if (!props.disabled && !isUploading.value) {
    isDragOver.value = true;
  }
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  if (props.disabled || isUploading.value) return;
  
  const files = Array.from(event.dataTransfer?.files ?? []);
  await processSelectedFiles(files);
};
</script>

<style scoped>
.file-upload-container {
  width: 100%;
}

/* Upload Area Styles */
.file-upload-area {
  position: relative;
  border: 2px dashed var(--q-primary);
  border-radius: 8px;
  background: var(--q-grey-1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-area:hover:not(.file-upload-area--disabled) {
  border-color: var(--q-primary-dark);
  background: var(--q-primary-light);
}

.file-upload-area--drag-over {
  border-color: var(--q-positive);
  background: var(--q-positive-light);
}

.file-upload-area--disabled {
  border-color: var(--q-grey-5);
  background: var(--q-grey-2);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Variant Styles */
.file-upload-area--dropzone {
  padding: 32px 24px;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area--button {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: auto;
  border: none;
  background: transparent;
}

.file-upload-area--compact {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: auto;
  border-style: solid;
  border-width: 1px;
}

/* Content Styles */
.file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon-container {
  opacity: 0.8;
}

.upload-text {
  text-align: center;
}

.upload-primary-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--q-primary);
  margin-bottom: 4px;
}

.upload-secondary-text {
  font-size: 14px;
  color: var(--q-grey-7);
  line-height: 1.4;
}

.upload-restrictions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.restriction-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--q-grey-6);
}

.upload-compact {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-compact-text {
  font-size: 14px;
  color: var(--q-primary);
  font-weight: 500;
}

/* Selected Files Styles */
.selected-files {
  margin-top: 24px;
  border: 1px solid var(--q-grey-4);
  border-radius: 8px;
  background: var(--q-grey-1);
}

.selected-files-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--q-grey-4);
  background: var(--q-grey-2);
}

.files-count {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-primary);
}

.files-list {
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--q-grey-4);
  border-radius: 6px;
  background: white;
  transition: all 0.2s ease;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-item--error {
  border-color: var(--q-negative);
  background: var(--q-negative-light);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: var(--q-grey-6);
  margin-top: 2px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--q-negative);
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--q-negative-light);
}

/* Upload Actions */
.upload-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--q-grey-4);
}

/* Overall Progress */
.overall-progress {
  margin-top: 16px;
}

/* Error Styles */
.upload-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: var(--q-negative-light);
  border: 1px solid var(--q-negative);
  border-radius: 6px;
  font-size: 14px;
  color: var(--q-negative);
}

/* Responsive */
@media (max-width: 600px) {
  .file-upload-area--dropzone {
    padding: 24px 16px;
    min-height: 150px;
  }
  
  .upload-primary-text {
    font-size: 14px;
  }
  
  .upload-secondary-text {
    font-size: 13px;
  }
  
  .selected-files-header {
    padding: 10px 12px;
  }
  
  .file-item {
    padding: 10px;
  }
  
  .upload-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>