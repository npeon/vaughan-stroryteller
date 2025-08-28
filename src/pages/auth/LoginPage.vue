<template>
  <q-page class="login-page">
    <!-- Form Header -->
    <div class="form-header">
      <h2 class="form-title">
        Welcome back
      </h2>
      <p class="form-subtitle">
        Please sign in to your account
      </p>
    </div>

    <!-- Auth Mode Tabs -->
    <div class="auth-tabs">
      <q-tabs
        v-model="authMode"
        class="prime-tabs"
        active-color="indigo-6"
        indicator-color="indigo-6"
        align="left"
        narrow-indicator
        dense
        no-caps
      >
        <q-tab name="login" label="Sign In" class="prime-tab" />
        <q-tab name="register" label="Sign Up" class="prime-tab" />
      </q-tabs>
    </div>

    <!-- Auth Forms -->
    <q-tab-panels v-model="authMode" animated transition-prev="slide-right" transition-next="slide-left" class="prime-tab-panels">
      <!-- Login Form -->
      <q-tab-panel name="login" class="q-pa-none">
        <q-form @submit="handleEmailSignIn" class="q-gutter-md">
          <!-- Email Input -->
          <q-input
            v-model="loginForm.email"
            type="email"
            label="Email address"
            outlined
            :rules="[validateEmailRule]"
            lazy-rules
            :error="!!fieldErrors.email"
            :error-message="fieldErrors.email"
            @blur="validateField('email', loginForm.email)"
            :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
            :aria-invalid="!!fieldErrors.email"
            data-testid="login-email-input"
          >
            <template #prepend>
              <q-icon name="email" color="grey-6" />
            </template>
          </q-input>

          <!-- Password Input -->
          <q-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            :rules="[validatePasswordRule]"
            lazy-rules
            :error="!!fieldErrors.password"
            :error-message="fieldErrors.password"
            @blur="validateField('password', loginForm.password)"
            data-testid="login-password-input"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-6" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Forgot Password Link -->
          <div class="text-right q-mb-sm">
            <q-btn
              flat
              no-caps
              size="sm"
              color="primary"
              @click="authMode = 'reset'"
              class="q-pa-xs"
              data-testid="forgot-password-link"
            >
              Forgot your password?
            </q-btn>
          </div>

          <!-- Login Button -->
          <q-btn
            type="submit"
            color="primary"
            size="lg"
            class="full-width"
            :loading="loading"
            :disable="loading || !isLoginFormValid"
            no-caps
            data-testid="email-signin-btn"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else>Signing in...</span>
          </q-btn>
        </q-form>
      </q-tab-panel>

      <!-- Register Form -->
      <q-tab-panel name="register" class="q-pa-none">
        <q-form @submit="handleEmailSignUp" class="q-gutter-md">
          <!-- Full Name Input -->
          <q-input
            v-model="registerForm.fullName"
            type="text"
            label="Full name"
            outlined
            :rules="[validateNameRule]"
            lazy-rules
            :error="!!fieldErrors.fullName"
            :error-message="fieldErrors.fullName"
            @blur="validateField('fullName', registerForm.fullName)"
            data-testid="register-name-input"
          >
            <template #prepend>
              <q-icon name="person" color="grey-6" />
            </template>
          </q-input>

          <!-- Email Input -->
          <q-input
            v-model="registerForm.email"
            type="email"
            label="Email address"
            outlined
            :rules="[validateEmailRule]"
            lazy-rules
            :error="!!fieldErrors.email"
            :error-message="fieldErrors.email"
            @blur="validateField('email', registerForm.email)"
            data-testid="register-email-input"
          >
            <template #prepend>
              <q-icon name="email" color="grey-6" />
            </template>
          </q-input>

          <!-- Password Input -->
          <q-input
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            :rules="[validatePasswordRule]"
            lazy-rules
            :error="!!fieldErrors.password"
            :error-message="fieldErrors.password"
            @blur="validateField('password', registerForm.password)"
            data-testid="register-password-input"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-6" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Password Strength Indicator -->
          <div v-if="registerForm.password" class="password-strength q-mb-sm">
            <div class="text-caption text-grey-6 q-mb-xs">Password strength:</div>
            <q-linear-progress
              :value="passwordStrength.score / 4"
              :color="passwordStrength.color"
              size="4px"
              class="q-mb-xs"
            />
            <div class="text-caption" :class="`text-${passwordStrength.color}`">
              {{ passwordStrength.text }}
            </div>
          </div>

          <!-- Register Button -->
          <q-btn
            type="submit"
            color="primary"
            size="lg"
            class="full-width"
            :loading="loading"
            :disable="loading || !isRegisterFormValid"
            no-caps
            data-testid="email-signup-btn"
          >
            <span v-if="!loading">Create Account</span>
            <span v-else>Creating account...</span>
          </q-btn>
        </q-form>
      </q-tab-panel>

      <!-- Reset Password Form -->
      <q-tab-panel name="reset" class="q-pa-none">
        <q-form @submit="handlePasswordReset" class="q-gutter-md">
          <!-- Back to Login -->
          <div class="row items-center q-mb-md">
            <q-btn
              flat
              round
              icon="arrow_back"
              color="grey-6"
              size="sm"
              @click="authMode = 'login'"
              data-testid="back-to-login-btn"
            />
            <div class="text-h6 q-ml-sm">Reset Password</div>
          </div>

          <!-- Instructions -->
          <p class="text-body2 text-grey-7 q-mb-md">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <!-- Email Input -->
          <q-input
            v-model="resetForm.email"
            type="email"
            label="Email address"
            outlined
            :rules="[validateEmailRule]"
            lazy-rules
            :error="!!fieldErrors.email"
            :error-message="fieldErrors.email"
            @blur="validateField('email', resetForm.email)"
            data-testid="reset-email-input"
          >
            <template #prepend>
              <q-icon name="email" color="grey-6" />
            </template>
          </q-input>

          <!-- Reset Button -->
          <q-btn
            type="submit"
            color="primary"
            size="lg"
            class="full-width"
            :loading="loading"
            :disable="loading || !isResetFormValid"
            no-caps
            data-testid="reset-password-btn"
          >
            <span v-if="!loading">Send Reset Link</span>
            <span v-else>Sending link...</span>
          </q-btn>
        </q-form>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Alternative Login Options (Hidden by default) -->
    <div v-if="showAlternatives" class="auth-alternatives q-mt-lg">
      <q-separator class="q-my-md">
        <span class="text-grey-6 bg-white px-3 text-caption">
          or continue with
        </span>
      </q-separator>
      
      <!-- Google OAuth Button (Now secondary) -->
      <q-btn
        @click="handleGoogleSignIn"
        :loading="loading"
        :disable="loading"
        outline
        color="grey-7"
        text-color="grey-8"
        size="md"
        class="full-width"
        no-caps
        data-testid="google-signin-btn"
      >
        <q-icon name="img:https://developers.google.com/identity/images/g-logo.png" size="18px" class="q-mr-sm" />
        Google
      </q-btn>
    </div>

    <!-- Toggle Alternative Options -->
    <div class="text-center q-mt-md">
      <q-btn
        flat
        no-caps
        size="sm"
        color="grey-6"
        @click="showAlternatives = !showAlternatives"
        data-testid="toggle-alternatives-btn"
      >
        {{ showAlternatives ? 'Fewer options' : 'More sign-in options' }}
      </q-btn>
    </div>

    <!-- Terms and Privacy -->
    <div class="text-center q-mt-lg">
      <p class="text-caption text-grey-6">
        By continuing, you agree to our <a href="#" class="text-primary">terms of service</a> 
        and <a href="#" class="text-primary">privacy policy</a>
      </p>
    </div>

    <!-- Estado de carga -->
    <q-inner-loading :showing="loading" color="primary" data-testid="inner-loading">
      <q-spinner-dots size="40px" data-testid="loading-spinner" />
      <div class="q-mt-md text-center">
        <p class="text-body2">Redirecting to Google...</p>
        <p class="text-caption text-grey-6">This may take a few seconds</p>
      </div>
    </q-inner-loading>

    <!-- Mensaje de error -->
    <q-banner
      v-if="error"
      class="text-white bg-red q-mt-md"
      rounded
    >
      <template #avatar>
        <q-icon name="error" />
      </template>
      <div>
        <div class="text-subtitle2">Authentication Error</div>
        <div class="text-body2">{{ error }}</div>
      </div>
      <template #action>
        <q-btn
          @click="() => {}"
          flat
          color="white"
          label="Dismiss"
          size="sm"
          data-testid="error-dismiss-btn"
        />
      </template>
    </q-banner>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useAuthGuard } from '../../composables/useAuthGuard'

const $q = useQuasar()
const router = useRouter()

const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading, error, isAuthenticated } = useAuth()
const { requireGuest } = useAuthGuard()

// Solo permitir acceso a invitados (no autenticados)
requireGuest()

// Form state
const authMode = ref<'login' | 'register' | 'reset'>('login')
const showPassword = ref(false)
const showAlternatives = ref(false)

// Form data
const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  password: '',
  fullName: ''
})

const resetForm = reactive({
  email: ''
})

// Field-level errors
const fieldErrors = reactive({
  email: '',
  password: '',
  fullName: ''
})

// Type guard para verificar si un error tiene una propiedad message
const hasErrorMessage = (error: unknown): error is { message: string } => {
  return typeof error === 'object' && error !== null && 'message' in error
}

// Validation rules
const validateEmailRule = (val: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(val) || 'Please enter a valid email address'
}

const validatePasswordRule = (val: string) => {
  if (val.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(val)) return 'Password must contain uppercase letter'
  if (!/[a-z]/.test(val)) return 'Password must contain lowercase letter'
  if (!/\d/.test(val)) return 'Password must contain number'
  return true
}

const validateNameRule = (val: string) => {
  if (!val || val.trim().length < 3) return 'Full name must be at least 3 characters'
  return true
}

// Field validation
const validateField = (field: string, value: string) => {
  fieldErrors[field as keyof typeof fieldErrors] = ''
  
  switch (field) {
    case 'email': {
      const emailResult = validateEmailRule(value)
      if (typeof emailResult === 'string') {
        fieldErrors.email = emailResult
      }
      break
    }
    case 'password': {
      const passwordResult = validatePasswordRule(value)
      if (typeof passwordResult === 'string') {
        fieldErrors.password = passwordResult
      }
      break
    }
    case 'fullName': {
      const nameResult = validateNameRule(value)
      if (typeof nameResult === 'string') {
        fieldErrors.fullName = nameResult
      }
      break
    }
  }
}

// Password strength calculation
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return { score: 0, color: 'grey', text: '' }
  
  let score = 0
  // Password strength scoring logic
  
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  
  if (score < 2) {
    return { score, color: 'red', text: 'Very Weak' }
  } else if (score < 3) {
    return { score, color: 'orange', text: 'Weak' }
  } else if (score < 4) {
    return { score, color: 'yellow', text: 'Good' }
  } else if (score < 5) {
    return { score, color: 'light-green', text: 'Strong' }
  } else {
    return { score, color: 'green', text: 'Very Strong' }
  }
})

// Form validation computed
const isLoginFormValid = computed(() => {
  return loginForm.email && 
         loginForm.password && 
         !fieldErrors.email && 
         !fieldErrors.password &&
         validateEmailRule(loginForm.email) === true &&
         validatePasswordRule(loginForm.password) === true
})

const isRegisterFormValid = computed(() => {
  return registerForm.email && 
         registerForm.password && 
         registerForm.fullName &&
         !fieldErrors.email && 
         !fieldErrors.password &&
         !fieldErrors.fullName &&
         validateEmailRule(registerForm.email) === true &&
         validatePasswordRule(registerForm.password) === true &&
         validateNameRule(registerForm.fullName) === true
})

const isResetFormValid = computed(() => {
  return resetForm.email && 
         !fieldErrors.email &&
         validateEmailRule(resetForm.email) === true
})

// Form handlers
const handleEmailSignIn = async () => {
  // Clear field errors
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key as keyof typeof fieldErrors] = ''
  })

  try {
    const data = await signInWithEmail(loginForm.email, loginForm.password)
    
    if (data && data.user) {
      $q.notify({
        type: 'positive',
        message: 'Successfully signed in!',
        position: 'top'
      })
      
      // Esperar a que el estado de auth se actualice reactivamente
      await nextTick()
      
      // Verificar que la autenticación esté completa antes de redirigir
      if (isAuthenticated.value) {
        console.log('✅ Authentication confirmed, redirecting to dashboard')
        await router.push('/dashboard')
      } else {
        console.log('⏳ Authentication still processing, router guard will handle redirect')
      }
    }
    
  } catch (err: unknown) {
    console.error('❌ Email sign-in error:', err)
    
    // Handle specific validation errors
    const errMessage = hasErrorMessage(err) ? err.message : String(err)
    if (errMessage === 'Invalid email format') {
      fieldErrors.email = 'Please enter a valid email address'
    } else if (errMessage.includes('Password must be at least')) {
      fieldErrors.password = errMessage
    } else {
      // Show generic error notification for auth failures
      $q.notify({
        type: 'negative',
        message: (typeof error.value === 'string' ? error.value : error.value?.message) || 'Sign-in failed. Please try again.',
        position: 'top',
        timeout: 5000
      })
    }
  }
}

const handleEmailSignUp = async () => {
  // Clear field errors
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key as keyof typeof fieldErrors] = ''
  })

  try {
    const data = await signUpWithEmail(registerForm.email, registerForm.password, registerForm.fullName)
    $q.notify({
      type: 'positive',
      message: 'Account created successfully! Please check your email for verification.',
      position: 'top',
      timeout: 8000
    })
    
    // Si se creó exitosamente y hay sesión activa, redirigir a dashboard
    // Sino, mostrar login para que confirmen email
    if (data.session) {
      await router.push('/dashboard')
    } else {
      // Switch to login form after successful registration
      authMode.value = 'login'
      loginForm.email = registerForm.email
      loginForm.password = ''
    }
    
  } catch (err: unknown) {
    console.error('❌ Email sign-up error:', err)
    
    // Handle specific validation errors
    const errMessage = hasErrorMessage(err) ? err.message : String(err)
    if (errMessage === 'Invalid email format') {
      fieldErrors.email = 'Please enter a valid email address'
    } else if (errMessage.includes('Password must be at least')) {
      fieldErrors.password = errMessage
    } else if (errMessage.includes('Full name must be at least')) {
      fieldErrors.fullName = errMessage
    } else {
      // Show generic error notification for auth failures
      $q.notify({
        type: 'negative',
        message: (typeof error.value === 'string' ? error.value : error.value?.message) || 'Registration failed. Please try again.',
        position: 'top',
        timeout: 5000
      })
    }
  }
}

const handlePasswordReset = async () => {
  // Clear field errors
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key as keyof typeof fieldErrors] = ''
  })

  try {
    await resetPassword(resetForm.email)
    $q.notify({
      type: 'positive',
      message: 'Password reset link sent to your email!',
      position: 'top',
      timeout: 8000
    })
    
    // Switch back to login form
    authMode.value = 'login'
    loginForm.email = resetForm.email
    
  } catch (err: unknown) {
    console.error('❌ Password reset error:', err)
    
    const errMessage = hasErrorMessage(err) ? err.message : String(err)
    if (errMessage === 'Invalid email format') {
      fieldErrors.email = 'Please enter a valid email address'
    } else {
      $q.notify({
        type: 'negative',
        message: (typeof error.value === 'string' ? error.value : error.value?.message) || 'Failed to send reset link. Please try again.',
        position: 'top',
        timeout: 5000
      })
    }
  }
}

const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle()
  } catch (err) {
    console.error('❌ Google sign-in error:', err)
    $q.notify({
      type: 'negative',
      message: 'Google sign-in failed. Please try again.',
      position: 'top',
      timeout: 5000
    })
  }
}

// Clear errors when switching modes
watch(authMode, () => {
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key as keyof typeof fieldErrors] = ''
  })
})

// Redirección automática cuando el usuario se autentica
watch(isAuthenticated, async (newValue, oldValue) => {
  // Solo redirigir si cambió de false a true (evitar loops)
  if (newValue && !oldValue) {
    console.log('🔄 Authentication state changed, redirecting...')
    await nextTick()
    await router.push('/dashboard')
  }
}, { immediate: false })
</script>

<style lang="scss" scoped>
// ===== PRIME ADMIN LOGIN PAGE STYLES =====

:root {
  --prime-indigo: #6366f1;
  --prime-purple: #8b5cf6;
  --prime-cyan: #06b6d4;
  --prime-grey-50: #f8fafc;
  --prime-grey-100: #f1f5f9;
  --prime-grey-400: #94a3b8;
  --prime-grey-500: #64748b;
  --prime-grey-600: #475569;
  --prime-grey-900: #0f172a;
}

.login-page {
  width: 100%;
  max-width: 100%;
  padding: 0;
  min-height: 100%;
}

// ===== FORM HEADER =====
.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.form-subtitle {
  font-size: 1rem;
  color: var(--prime-grey-500);
  margin: 0;
  line-height: 1.5;
}

// ===== AUTH TABS =====
.auth-tabs {
  margin-bottom: 2rem;
  
  .prime-tabs {
    :deep(.q-tabs__content) {
      border-bottom: 1px solid var(--prime-grey-100);
    }
    
    :deep(.q-tab) {
      font-weight: 500;
      color: var(--prime-grey-500);
      padding: 1rem 0;
      margin-right: 2rem;
      text-transform: none;
      font-size: 0.875rem;
      
      &.q-tab--active {
        color: var(--prime-indigo);
        font-weight: 600;
      }
      
      .q-tab__content {
        min-width: auto;
      }
    }
    
    :deep(.q-tabs__indicator) {
      height: 2px;
      border-radius: 2px 2px 0 0;
    }
  }
}

// ===== TAB PANELS =====
.prime-tab-panels {
  :deep(.q-tab-panel) {
    padding: 0;
  }
}

// ===== PRIME FORMS =====
.prime-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

// ===== PRIME INPUTS =====
.prime-input {
  :deep(.q-field__control) {
    border-radius: 8px;
    min-height: 48px;
    border: 1px solid var(--prime-grey-100);
    background-color: white;
    
    &:before {
      border: none !important;
    }
    
    &:after {
      border: none !important;
    }
    
    &:hover {
      border-color: var(--prime-grey-400);
    }
  }
  
  :deep(.q-field--outlined.q-field--focused .q-field__control) {
    border-color: var(--prime-indigo);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  :deep(.q-field--error .q-field__control) {
    border-color: #ef4444;
  }
  
  :deep(.q-field__label) {
    color: var(--prime-grey-600);
    font-weight: 500;
    font-size: 0.875rem;
    left: 16px;
    
    &.q-field__label--floating {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--prime-indigo);
    }
  }
  
  :deep(.q-field__native) {
    padding: 0 16px;
    font-size: 0.875rem;
    color: var(--prime-grey-900);
  }
  
  :deep(.q-field__append) {
    padding-right: 12px;
  }
}

// ===== FORM ACTIONS =====
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.forgot-link {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

// ===== PRIME BUTTONS =====
.prime-btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  min-height: 48px;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.25), 0 4px 6px -2px rgba(99, 102, 241, 0.05);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
  }
}

// ===== PASSWORD STRENGTH =====
.password-strength {
  margin-top: 0.5rem;
  
  .q-linear-progress {
    border-radius: 2px;
    height: 4px;
  }
  
  .text-caption {
    font-size: 0.75rem;
    font-weight: 500;
  }
}

// ===== ALTERNATIVE AUTH OPTIONS =====
.auth-alternatives {
  margin-top: 1.5rem;
  
  .q-separator {
    margin: 1.5rem 0;
    
    :deep(.q-separator__content) {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--prime-grey-400);
      padding: 0 1rem;
      background-color: white;
    }
  }
  
  .q-btn {
    border: 1px solid var(--prime-grey-100);
    border-radius: 8px;
    min-height: 48px;
    color: var(--prime-grey-600);
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--prime-grey-400);
      background-color: var(--prime-grey-50);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    :deep(.q-icon img) {
      width: 20px;
      height: 20px;
    }
  }
}

// ===== RESPONSIVE DESIGN =====
@media (max-width: 640px) {
  .form-title {
    font-size: 1.5rem;
  }
  
  .auth-tabs {
    margin-bottom: 1.5rem;
    
    .prime-tabs :deep(.q-tab) {
      margin-right: 1rem;
      font-size: 0.8rem;
    }
  }
  
  .prime-form {
    gap: 1.25rem;
  }
  
  .prime-input {
    :deep(.q-field__control) {
      min-height: 44px;
    }
  }
  
  .prime-btn {
    min-height: 44px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .form-header {
    margin-bottom: 1.5rem;
  }
  
  .form-title {
    font-size: 1.375rem;
  }
  
  .auth-tabs .prime-tabs :deep(.q-tab) {
    margin-right: 0.5rem;
    padding: 0.75rem 0;
  }
}

// ===== LOADING & STATES =====
.q-inner-loading {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 8px;
}

// ===== ERROR ANIMATIONS =====
.prime-input:deep(.q-field--error .q-field__control) {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

// ===== ACCESSIBILITY =====
.prime-btn:focus-visible {
  outline: 2px solid var(--prime-indigo);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.prime-input:deep(.q-field__control:focus-within) {
  border-color: var(--prime-indigo);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

// ===== TERMS AND PRIVACY SECTION =====
.text-center {
  .text-caption {
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--prime-grey-400);
    
    a {
      color: var(--prime-indigo);
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>