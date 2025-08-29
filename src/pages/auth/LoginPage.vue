<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="prime-auth-page">
    <div class="auth-container">
      <!-- Brand Section -->
      <div class="brand-section">
        <!-- Educational Information -->
        <div class="learning-preview">
          <div class="brand-logo">
            <div class="logo-icon">
              <q-icon name="auto_stories" />
            </div>
            <div class="logo-text">
              <div class="brand-name">The Vaughan Storyteller</div>
              <div class="brand-tagline">AI-Powered English Learning</div>
            </div>
          </div>

          <!-- Features Highlights -->
          <div class="feature-highlights">
            <div class="feature-item">
              <q-icon name="psychology" class="feature-icon" />
              <div class="feature-text">
                <div class="feature-title">Personalized Stories</div>
                <div class="feature-desc">Adapted to your CEFR level (A1-C2)</div>
              </div>
            </div>
            <div class="feature-item">
              <q-icon name="trending_up" class="feature-icon" />
              <div class="feature-text">
                <div class="feature-title">Track Your Progress</div>
                <div class="feature-desc">Vocabulary growth & reading skills</div>
              </div>
            </div>
            <div class="feature-item">
              <q-icon name="record_voice_over" class="feature-icon" />
              <div class="feature-text">
                <div class="feature-title">Audio Narration</div>
                <div class="feature-desc">Perfect pronunciation & listening</div>
              </div>
            </div>
          </div>

          <!-- Trust Indicators -->
          <div class="trust-indicators">
            <div class="trust-item">
              <q-icon name="verified" class="trust-icon" />
              <span>CEFR Framework Based</span>
            </div>
            <div class="trust-item">
              <q-icon name="group" class="trust-icon" />
              <span>Join 10,000+ learners</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Auth Card -->
      <div class="auth-card-container">
        <div class="prime-card auth-card">
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
            class="prime-input"
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
            class="prime-input"
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
            class="full-width prime-btn prime-btn--primary"
            :loading="loading"
            :disable="loading || !isLoginFormValid"
            unelevated
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
            class="prime-input"
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
            class="prime-input"
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
            class="prime-input"
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
            class="full-width prime-btn prime-btn--primary"
            :loading="loading"
            :disable="loading || !isRegisterFormValid"
            unelevated
            data-testid="email-signup-btn"
            v-show="false"
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
            class="prime-input"
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
            class="full-width prime-btn prime-btn--primary"
            :loading="loading"
            :disable="loading || !isResetFormValid"
            unelevated
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
        size="md"
        class="full-width prime-btn prime-btn--secondary"
        unelevated
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
        <div class="terms-section">
          <p class="terms-text">
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
          class="error-banner"
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
        </div>
      </div>
    </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useAuthGuard } from '../../composables/useAuthGuard'

const $q = useQuasar()
const router = useRouter()

const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading, error } = useAuth()
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
      
      // El router guard manejará automáticamente la redirección
      console.log('✅ Authentication successful, router guard will handle redirect')
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

// El router guard ya maneja la redirección automática
// No necesitamos watch manual aquí para evitar loops infinitos
</script>

<style lang="scss" scoped>
// ===== PRIME AUTH PAGE STYLES =====
@import '../../css/quasar.variables.scss';

// Prevenir scroll horizontal pero permitir vertical
:global(html, body) {
  overflow-x: hidden;
  max-width: 100vw;
}

:global(.q-layout) {
  overflow-x: hidden;
}

.prime-auth-page {
  background: linear-gradient(135deg, var(--prime-grey-50) 0%, var(--prime-grey-100) 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $prime-space-sm;
  width: 100%;
  box-sizing: border-box;
  
  // En móviles, permitir scroll vertical
  @media (max-width: 768px) {
    min-height: 100vh;
    align-items: flex-start;
    padding: $prime-space-md 0;
    overflow-y: auto;
  }
}

// ===== AUTH CONTAINER =====
.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $prime-space-md;
  max-width: 1000px;
  height: 85vh;
  width: 100%;
  box-sizing: border-box;
  overflow: visible; // Changed from hidden to visible
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    max-width: 90vw;
    gap: $prime-space-sm;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr; // Stack en móviles
    gap: $prime-space-lg;
    max-width: 95vw;
    height: auto; // Permitir altura automática
    min-height: calc(100vh - 2rem); // Ensure minimum height with padding
    padding: $prime-space-md;
    padding-bottom: $prime-space-xl; // Extra bottom padding for error messages
    overflow: visible;
    
    // Reordenar: brand section primero, luego auth card
    .brand-section {
      order: 1;
    }
    
    .auth-card-container {
      order: 2;
    }
  }
  
  @media (max-width: 480px) {
    max-width: 100%;
    padding: $prime-space-sm;
    padding-bottom: $prime-space-xl; // Maintain extra bottom padding
    gap: $prime-space-md;
    min-height: calc(100vh - 1rem); // Adjust for smaller padding
  }
}

// ===== BRAND SECTION =====
.brand-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: $prime-space-lg $prime-space-md;
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.03) 0%, 
    rgba(139, 92, 246, 0.05) 100%);
  border-radius: var(--radius-md);
  position: relative;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    padding: $prime-space-sm;
    max-height: 80vh;
  }
  
  @media (max-width: 768px) {
    text-align: center;
    padding: $prime-space-lg $prime-space-md;
    height: auto;
    min-height: auto;
    max-height: none;
    justify-content: center;
    gap: $prime-space-md;
  }
  
  @media (max-width: 480px) {
    padding: $prime-space-md;
    gap: $prime-space-sm;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, 
      rgba(99, 102, 241, 0.05) 0%, 
      transparent 70%);
    animation: rotate 20s linear infinite;
    z-index: 0;
    border-radius: var(--radius-md);
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

// Character showcase removed - now using centered icon approach

@keyframes floating {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-15px) rotate(0.5deg); 
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// ===== LEARNING PREVIEW =====
.learning-preview {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.brand-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $prime-space-xl;
  margin-bottom: $prime-space-xl;
  justify-content: center;
}

.logo-icon {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 60px;
  box-shadow: var(--shadow-xl);
  animation: floating 6s ease-in-out infinite;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 50px;
  }

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
    font-size: 40px;
  }
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand-name {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: var(--prime-primary);
  line-height: 1.2;
  margin-bottom: $prime-space-xs;
  text-align: center;
}

.brand-tagline {
  font-size: 1rem;
  color: var(--prime-grey-600);
  font-weight: 500;
  text-align: center;
}

// ===== FEATURE HIGHLIGHTS =====
.feature-highlights {
  margin-bottom: $prime-space-lg;
  
  @media (max-width: 768px) {
    margin-bottom: $prime-space-md;
    
    // Mantener las 3 características principales en móvil
    // (Personalized Stories, Track Progress, Audio Narration)
  }
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: $prime-space-md;
  margin-bottom: $prime-space-md;
  
  .feature-icon {
    font-size: 24px;
    color: var(--prime-primary);
    background: rgba(99, 102, 241, 0.1);
    padding: 8px;
    border-radius: var(--radius-md);
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .feature-text {
    flex: 1;
    
    .feature-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--prime-grey-900);
      margin-bottom: $prime-space-xs;
      line-height: 1.3;
    }
    
    .feature-desc {
      font-size: 0.875rem;
      color: var(--prime-grey-600);
      line-height: 1.4;
    }
  }
}

// ===== TRUST INDICATORS =====
.trust-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: $prime-space-lg;
  justify-content: center;
  
  .trust-item {
    display: flex;
    align-items: center;
    gap: $prime-space-sm;
    color: var(--prime-grey-700);
    font-size: 0.875rem;
    font-weight: 500;
    
    .trust-icon {
      font-size: 18px;
      color: var(--prime-positive);
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: $prime-space-md;
  }
}

// ===== AUTH CARD =====
.auth-card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $prime-space-sm;
  height: 100%;
  box-sizing: border-box;
  overflow: visible; // Changed from hidden to visible
  
  @media (max-width: 768px) {
    height: auto;
    min-height: auto;
    padding: 0;
    align-items: flex-start;
    overflow: visible;
  }
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: $prime-space-lg;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 
    var(--shadow-xl),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  max-height: none; // Remove height restriction
  min-height: auto; // Allow natural height expansion
  overflow: visible; // Ensure content overflow is visible
  
  @media (max-width: 1024px) {
    max-width: 360px;
    padding: $prime-space-md;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: $prime-space-lg;
    margin-bottom: $prime-space-md; // Add bottom margin for error messages
  }
  
  @media (max-width: 480px) {
    padding: $prime-space-md;
    margin-bottom: $prime-space-lg; // More space on smaller screens
  }
}

// ===== FORM HEADER =====
.form-header {
  text-align: center;
  margin-bottom: $prime-space-xl;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0 0 $prime-space-sm 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.form-subtitle {
  font-size: 1rem;
  color: var(--prime-grey-600);
  margin: 0;
  line-height: 1.5;
}

// ===== AUTH TABS =====
.auth-tabs {
  margin-bottom: $prime-space-xl;
  
  .prime-tabs {
    :deep(.q-tabs__content) {
      border-bottom: 1px solid var(--prime-grey-200);
    }
    
    :deep(.q-tab) {
      font-weight: 500;
      color: var(--prime-grey-500);
      padding: $prime-space-md 0;
      margin-right: $prime-space-xl;
      text-transform: none;
      font-size: 0.875rem;
      
      &.q-tab--active {
        color: var(--prime-primary);
        font-weight: 600;
      }
    }
    
    :deep(.q-tabs__indicator) {
      height: 2px;
      border-radius: 2px 2px 0 0;
      background: var(--prime-primary);
    }
  }
}

// ===== TAB PANELS =====
.prime-tab-panels {
  :deep(.q-tab-panel) {
    padding: 0;
  }
}

// ===== PASSWORD STRENGTH =====
.password-strength {
  margin-top: $prime-space-sm;
  
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
  margin-top: $prime-space-lg;
  
  .q-separator {
    margin: $prime-space-lg 0;
    
    :deep(.q-separator__content) {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--prime-grey-400);
      padding: 0 $prime-space-md;
      background-color: white;
    }
  }
}

// ===== TERMS SECTION =====
.terms-section {
  text-align: center;
  margin-top: $prime-space-lg;
  
  .terms-text {
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--prime-grey-500);
    margin: 0;
    
    a {
      color: var(--prime-primary);
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// ===== ERROR BANNER =====
.error-banner {
  background: var(--prime-negative);
  color: white;
  margin-top: $prime-space-md;
  
  .q-banner__avatar {
    color: white;
  }
}

// ===== LOADING STATE =====
.q-inner-loading {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
}

// ===== RESPONSIVE DESIGN =====
@media (max-width: 1024px) {
  .feature-highlights {
    .feature-item {
      margin-bottom: $prime-space-md;
    }
  }
}

@media (max-width: 768px) {
  // Brand section mobile adjustments
  .brand-section {
    padding: $prime-space-lg $prime-space-md;
    
    &::before {
      display: none; // Remove background animation on mobile
    }
  }
  
  .brand-name {
    font-size: 1.75rem;
  }
  
  .brand-tagline {
    font-size: 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .auth-card {
    padding: $prime-space-lg;
    margin: 0;
  }
  
  // Reduce logo size on mobile  
  .logo-icon {
    width: 80px;
    height: 80px;
    font-size: 40px;
  }
  
  // Feature highlights mobile
  .feature-highlights {
    margin-bottom: $prime-space-lg;
    
    .feature-item {
      margin-bottom: $prime-space-md;
      
      .feature-icon {
        font-size: 20px;
        min-width: 36px;
        height: 36px;
      }
      
      .feature-text {
        .feature-title {
          font-size: 0.875rem;
        }
        
        .feature-desc {
          font-size: 0.8125rem;
        }
      }
    }
  }
  
  // Trust indicators mobile
  .trust-indicators {
    .trust-item {
      font-size: 0.8125rem;
    }
  }
}

@media (max-width: 480px) {
  .prime-auth-page {
    padding: $prime-space-sm;
    min-height: 100vh;
  }
  
  .auth-container {
    max-width: 100%;
    padding: $prime-space-xs;
  }
  
  .brand-section {
    padding: $prime-space-md $prime-space-sm;
    margin-bottom: 0;
  }
  
  .brand-name {
    font-size: 1.5rem;
    margin-bottom: $prime-space-xs;
  }
  
  .brand-tagline {
    font-size: 0.9rem;
    margin-bottom: $prime-space-md;
  }
  
  .form-title {
    font-size: 1.25rem;
  }
  
  .auth-card {
    padding: $prime-space-md;
    max-width: 100%;
    margin: 0;
  }
  
  .logo-icon {
    width: 70px;
    height: 70px;
    font-size: 35px;
  }
  
  .feature-item {
    gap: $prime-space-sm;
    margin-bottom: $prime-space-sm;
    
    .feature-icon {
      min-width: 32px;
      height: 32px;
      font-size: 18px;
    }
    
    .feature-text {
      .feature-title {
        font-size: 0.875rem;
      }
      
      .feature-desc {
        font-size: 0.75rem;
      }
    }
  }
  
  // Simplify trust indicators on very small screens
  .trust-indicators {
    .trust-item {
      font-size: 0.75rem;
      
      .trust-icon {
        font-size: 16px;
      }
    }
  }
}

// ===== INPUT FIELD STYLES =====
.prime-input {
  // Override any autocomplete styling to remove blue background
  :deep(input:-webkit-autofill) {
    -webkit-box-shadow: 0 0 0 1000px white inset !important;
    -webkit-text-fill-color: var(--prime-grey-900) !important;
  }
  
  :deep(input:-webkit-autofill:hover) {
    -webkit-box-shadow: 0 0 0 1000px white inset !important;
  }
  
  :deep(input:-webkit-autofill:focus) {
    -webkit-box-shadow: 0 0 0 1000px white inset !important;
  }
}

// ===== BUTTON STYLES =====
.prime-btn {
  border-radius: 8px !important;
  
  &.prime-btn--primary {
    border-radius: 8px !important;
  }
  
  &.prime-btn--secondary {
    border-radius: 8px !important;
  }
  
  // Ensure all button states have rounded corners
  &:hover, &:focus, &:active {
    border-radius: 8px !important;
  }
}

// ===== ANIMATIONS =====
.auth-card {
  animation: fadeInUp 0.6s ease-out;
}

.brand-section {
  animation: fadeInLeft 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>