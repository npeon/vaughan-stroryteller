<template>
  <div 
    class="progress-indicator"
    :class="`progress-indicator--${variant}`"
  >
    <!-- Linear Progress -->
    <template v-if="variant === 'linear'">
      <div v-if="showLabel && label" class="progress-label">
        {{ label }}
      </div>
      
      <q-linear-progress
        :value="normalizedValue"
        :color="color"
        :track-color="trackColor"
        :size="`${props.size || 16}px`"
        :indeterminate="indeterminate"
        :class="`progress-linear--${props.size || 16}`"
      >
        <div v-if="showValue" class="progress-value">
          {{ displayValue }}
        </div>
      </q-linear-progress>
      
      <div v-if="showStatus && status" class="progress-status">
        <q-icon 
          v-if="statusIcon" 
          :name="statusIcon" 
          :color="statusColor" 
          size="16px" 
        />
        {{ status }}
      </div>
    </template>

    <!-- Circular Progress -->
    <template v-else-if="variant === 'circular'">
      <div class="progress-circular-container">
        <q-circular-progress
          :value="normalizedValue"
          :size="`${props.size || 16}px`"
          :color="color"
          :track-color="trackColor"
          :thickness="thickness"
          :indeterminate="indeterminate"
          :show-value="showValue && !indeterminate"
          :class="`progress-circular--${Math.round((props.size || 16) / 20)}`"
        >
          <template v-if="$slots.center" #default>
            <slot name="center" :value="normalizedValue" :display-value="displayValue" />
          </template>
        </q-circular-progress>
        
        <div v-if="showLabel && label" class="progress-label circular">
          {{ label }}
        </div>
        
        <div v-if="showStatus && status" class="progress-status circular">
          <q-icon 
            v-if="statusIcon" 
            :name="statusIcon" 
            :color="statusColor" 
            size="14px" 
          />
          {{ status }}
        </div>
      </div>
    </template>

    <!-- Step Progress -->
    <template v-else-if="variant === 'step'">
      <div class="progress-steps">
        <div v-if="showLabel && label" class="progress-label">
          {{ label }}
        </div>
        
        <q-stepper
          :model-value="currentStep || 1"
          :color="color"
          :done-color="color"
          class="progress-stepper"
          flat
        >
          <q-step
            v-for="(step, index) in steps"
            :key="`step-${index}`"
            :name="index + 1"
            :title="step.title || `Step ${index + 1}`"
            :caption="step.caption"
            :icon="step.icon || (index + 1 <= (currentStep || 1) ? 'check' : undefined)"
            :done="index + 1 < (currentStep || 1)"
            :error="step.error"
          />
        </q-stepper>
        
        <div v-if="showStatus && status" class="progress-status step">
          <q-icon 
            v-if="statusIcon" 
            :name="statusIcon" 
            :color="statusColor" 
            size="16px" 
          />
          {{ status }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ProgressStep {
  title?: string;
  caption?: string;
  icon?: string;
  error?: boolean;
}

export interface Props {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Progress variant */
  variant?: 'linear' | 'circular' | 'step';
  /** Progress color */
  color?: string;
  /** Track color */
  trackColor?: string;
  /** Size in pixels */
  size?: number;
  /** Thickness for circular progress (0.1-1) */
  thickness?: number;
  /** Show indeterminate progress */
  indeterminate?: boolean;
  /** Show progress value */
  showValue?: boolean;
  /** Show progress label */
  showLabel?: boolean;
  /** Progress label text */
  label?: string;
  /** Show status message */
  showStatus?: boolean;
  /** Status message */
  status?: string;
  /** Status icon */
  statusIcon?: string;
  /** Status color */
  statusColor?: string;
  /** Steps for step variant */
  steps?: ProgressStep[];
  /** Current step for step variant */
  currentStep?: number;
  /** Format function for displaying values */
  formatValue?: (value: number, max: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  variant: 'linear',
  color: 'primary',
  trackColor: 'grey-3',
  size: 16,
  thickness: 0.2,
  indeterminate: false,
  showValue: false,
  showLabel: false,
  showStatus: false,
  statusColor: 'grey-6',
  currentStep: 1,
  formatValue: (value: number, max: number) => `${Math.round((value / max) * 100)}%`
});

defineEmits<{
  /** Emitted when progress completes */
  complete: [];
  /** Emitted when progress value changes */
  change: [value: number];
}>();

const normalizedValue = computed(() => {
  if (props.indeterminate) return 0;
  return Math.min(Math.max(props.value || 0, 0), props.max) / props.max;
});

const displayValue = computed(() => {
  if (props.indeterminate) return '';
  return props.formatValue(props.value || 0, props.max);
});
</script>

<style scoped>
.progress-indicator {
  width: 100%;
}

/* Linear Progress Styles */
.progress-indicator--linear {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-primary);
  margin-bottom: 4px;
}

.progress-label.circular,
.progress-label.step {
  text-align: center;
  margin-top: 8px;
  margin-bottom: 0;
}

.progress-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.progress-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--q-dark);
  margin-top: 4px;
}

.progress-status.circular {
  justify-content: center;
  margin-top: 8px;
}

.progress-status.step {
  margin-top: 16px;
  justify-content: center;
}

/* Circular Progress Styles */
.progress-indicator--circular {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-circular-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Step Progress Styles */
.progress-indicator--step {
  display: flex;
  flex-direction: column;
}

.progress-steps {
  width: 100%;
}

.progress-stepper {
  background: transparent;
  box-shadow: none;
  border: none;
}

/* Size Variants */
.progress-linear--small {
  height: 4px;
}

.progress-linear--medium {
  height: 6px;
}

.progress-linear--large {
  height: 8px;
}

.progress-circular--small {
  font-size: 10px;
}

.progress-circular--medium {
  font-size: 12px;
}

.progress-circular--large {
  font-size: 14px;
}

/* Animation */
.progress-indicator {
  transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 600px) {
  .progress-label {
    font-size: 13px;
  }
  
  .progress-status {
    font-size: 12px;
  }
  
  .progress-value {
    font-size: 11px;
  }
}
</style>