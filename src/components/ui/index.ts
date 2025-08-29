/**
 * Reusable UI Components
 * 
 * This module exports all reusable UI components for the Vaughan Storyteller platform.
 * These components follow Quasar Prime Admin design patterns and are optimized for
 * educational contexts with proper TypeScript support and accessibility.
 */

// Component Exports
export { default as AvatarUpload } from './AvatarUpload.vue';
export { default as FileUpload } from './FileUpload.vue';
export { default as ProgressIndicator } from './ProgressIndicator.vue';

// Type Exports for FileUpload and ProgressIndicator
export type { 
  Props as FileUploadProps, 
  FileWithError, 
  FileValidationOptions 
} from './FileUpload.vue';
export type { 
  Props as ProgressIndicatorProps, 
  ProgressStep 
} from './ProgressIndicator.vue';

// Note: AvatarUpload props are available through component instance

/**
 * Component Usage Examples:
 * 
 * @example Basic FileUpload
 * ```vue
 * <FileUpload
 *   :accept="['image/*', 'audio/*']"
 *   :max-file-size="5242880"
 *   educational-context="avatar"
 *   @files-selected="handleFilesSelected"
 * />
 * ```
 * 
 * @example Progress Indicator Variants
 * ```vue
 * <!-- Linear Progress -->
 * <ProgressIndicator
 *   variant="linear"
 *   :value="progress"
 *   label="Uploading files..."
 *   show-value
 *   show-label
 * />
 * 
 * <!-- Circular Progress -->
 * <ProgressIndicator
 *   variant="circular"
 *   :value="progress"
 *   :size="60"
 *   show-value
 * />
 * 
 * <!-- Step Progress -->
 * <ProgressIndicator
 *   variant="step"
 *   :steps="uploadSteps"
 *   :current-step="currentStep"
 * />
 * ```
 * 
 * @example Avatar Upload
 * ```vue
 * <AvatarUpload
 *   :size="120"
 *   :user-id="user.id"
 *   alt-text="User avatar"
 *   @upload-complete="handleAvatarUpdate"
 * />
 * ```
 */