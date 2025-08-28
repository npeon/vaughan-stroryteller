<template>
  <q-page class="callback-page">
    <div class="text-center">
      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <div class="loading-animation q-mb-lg">
          <q-spinner-orbit
            color="primary"
            size="80px"
          />
        </div>
        <h3 class="text-h5 text-weight-medium q-mt-none q-mb-sm">
          Completing authentication...
        </h3>
        <p class="text-body1 text-grey-7">
          Please wait while we set up your account
        </p>
        <div class="progress-steps q-mt-lg">
          <div class="step" :class="{ active: currentStep >= 1 }">
            <q-icon name="verified" size="24px" />
            <span>Verifying credentials</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 2 }">
            <q-icon name="account_circle" size="24px" />
            <span>Creating profile</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <q-icon name="dashboard" size="24px" />
            <span>Redirecting to dashboard</span>
          </div>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon q-mb-lg">
          <q-icon 
            name="error_outline" 
            size="80px" 
            color="red-5" 
          />
        </div>
        <h3 class="text-h5 text-weight-medium text-negative q-mt-none q-mb-sm">
          Authentication Failed
        </h3>
        <p class="text-body1 text-grey-7 q-mb-lg">
          {{ error }}
        </p>
        <div class="error-actions q-gutter-md">
          <q-btn
            @click="retryAuth"
            color="primary"
            unelevated
            size="lg"
            icon="refresh"
            label="Try Again"
          />
          <q-btn
            @click="goToLogin"
            color="grey-8"
            outline
            size="lg"
            icon="login"
            label="Back to Login"
          />
        </div>
        
        <!-- Detalles técnicos (solo en desarrollo) -->
        <div v-if="isDevelopment && errorDetails" class="error-details q-mt-xl">
          <q-expansion-item
            icon="bug_report"
            label="Technical Details"
            class="text-left"
          >
            <q-card>
              <q-card-section>
                <pre class="text-caption">{{ errorDetails }}</pre>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>

      <!-- Estado de éxito (breve) -->
      <div v-else-if="success" class="success-state">
        <div class="success-icon q-mb-lg">
          <q-icon 
            name="check_circle" 
            size="80px" 
            color="positive" 
          />
        </div>
        <h3 class="text-h5 text-weight-medium text-positive q-mt-none q-mb-sm">
          Welcome aboard!
        </h3>
        <p class="text-body1 text-grey-7">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useAuthGuard } from '../../composables/useAuthGuard'

const router = useRouter()
const { user, profile, error: authError, loading: authLoading } = useAuth()
const { redirectByRole } = useAuthGuard()

// Estados locales
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref(false)
const currentStep = ref(1)
const errorDetails = ref<Record<string, unknown> | null>(null)
const isDevelopment = ref(process.env.NODE_ENV === 'development')

/**
 * Procesar el callback de OAuth
 */
const processOAuthCallback = async () => {
  try {
    loading.value = true
    currentStep.value = 1
    
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')
    const authError = urlParams.get('error')
    const authErrorDescription = urlParams.get('error_description')

    // Verificar si hay error en la URL
    if (authError) {
      throw new Error(authErrorDescription || authError)
    }

    // Verificar si tenemos el código de autorización
    if (!authCode) {
      throw new Error('No authorization code received from OAuth provider')
    }

    console.log('🔐 Processing OAuth callback...')

    // Esperar a que Supabase procese automáticamente la sesión
    // El useAuth composable manejará el estado
    currentStep.value = 2

    // Esperar un momento para que se procese la autenticación
    let attempts = 0
    const maxAttempts = 30 // 15 segundos máximo
    
    while (attempts < maxAttempts && (!user.value || authLoading.value)) {
      await new Promise(resolve => setTimeout(resolve, 500))
      attempts++
    }

    if (!user.value) {
      throw new Error('Authentication timeout - please try again')
    }

    console.log('✅ User authenticated:', user.value.email)

    // Verificar que el perfil se haya creado
    currentStep.value = 3
    
    attempts = 0
    while (attempts < maxAttempts && !profile.value) {
      await new Promise(resolve => setTimeout(resolve, 500))
      attempts++
    }

    if (!profile.value) {
      console.warn('⚠️ Profile not loaded, but user is authenticated')
    }

    // Mostrar éxito brevemente
    success.value = true
    loading.value = false

    // Pequeña pausa para mostrar el éxito
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Redirigir según el rol
    redirectByRole()

  } catch (err) {
    console.error('❌ OAuth callback error:', err)
    
    loading.value = false
    success.value = false
    
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'An unexpected error occurred during authentication'
    }
    
    errorDetails.value = err as Record<string, unknown>
  }
}

/**
 * Reintentar autenticación
 */
const retryAuth = async () => {
  error.value = null
  errorDetails.value = null
  success.value = false
  await processOAuthCallback()
}

/**
 * Volver al login
 */
const goToLogin = () => {
  void router.push('/auth/login')
}

// Procesar callback al montar
onMounted(() => {
  // Si ya hay error de auth, mostrarlo directamente
  if (authError.value) {
    error.value = typeof authError.value === 'string' 
      ? authError.value 
      : 'Authentication error occurred'
    errorDetails.value = authError.value as unknown as Record<string, unknown>
    loading.value = false
    return
  }

  // Si ya estamos autenticados, redirigir
  if (user.value && !authLoading.value) {
    success.value = true
    loading.value = false
    
    setTimeout(() => {
      redirectByRole()
    }, 1500)
    return
  }

  // Procesar el callback
  void processOAuthCallback()
})
</script>

<style lang="scss" scoped>
.callback-page {
  width: 100%;
  max-width: 100%;
  padding: 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-animation {
  display: flex;
  justify-content: center;
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 280px;
  margin: 0 auto;

  .step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    opacity: 0.5;
    transition: all 0.3s ease;
    
    &.active {
      opacity: 1;
      background: rgba(25, 118, 210, 0.1);
      color: $primary;
    }

    .q-icon {
      flex-shrink: 0;
    }

    span {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.error-state {
  max-width: 400px;
  margin: 0 auto;

  .error-icon {
    display: flex;
    justify-content: center;
  }
}

.success-state {
  max-width: 400px;
  margin: 0 auto;

  .success-icon {
    display: flex;
    justify-content: center;
  }
}

.error-actions {
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: center;
  }
}

.error-details {
  max-width: 600px;
  margin: 0 auto;

  pre {
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.05);
    padding: 12px;
    border-radius: 4px;
  }
}
</style>