<template>
  <q-page class="login-page">
    <!-- Mensaje de bienvenida -->
    <div class="text-center q-mb-xl">
      <h2 class="text-h5 text-weight-medium q-mt-none q-mb-sm">
        Welcome back!
      </h2>
      <p class="text-body1 text-grey-7 q-mt-none">
        Continue your English learning journey
      </p>
    </div>

    <!-- Botones de autenticación -->
    <div class="login-options q-gutter-md">
      <!-- Google OAuth Button -->
      <q-btn
        @click="handleGoogleSignIn"
        :loading="loading"
        :disable="loading"
        color="white"
        text-color="grey-8"
        unelevated
        size="lg"
        class="full-width google-btn"
        icon="img:https://developers.google.com/identity/images/g-logo.png"
        data-testid="google-signin-btn"
      >
        <span class="q-ml-sm">Continue with Google</span>
      </q-btn>

      <!-- Información adicional -->
      <div class="text-center q-mt-xl">
        <p class="text-caption text-grey-6 q-mb-sm">
          By continuing, you agree to our terms of service
        </p>
        <p class="text-caption text-grey-6">
          New to our platform? Your account will be created automatically
        </p>
      </div>
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
          @click="clearError"
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
import { useAuth } from '../../composables/useAuth'
import { useAuthGuard } from '../../composables/useAuthGuard'

const { signInWithGoogle, loading, error } = useAuth()
const { requireGuest } = useAuthGuard()

// Solo permitir acceso a invitados (no autenticados)
requireGuest()

const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle()
  } catch (err) {
    console.error('❌ Login error:', err)
  }
}

const clearError = () => {
  // El error se maneja en el composable, aquí solo limpiamos la UI si es necesario
}
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

.login-options {
  width: 100%;
}

.google-btn {
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(1px);
  }

  .q-btn__content {
    align-items: center;
  }

  // Google logo styling
  :deep(.q-icon img) {
    width: 20px;
    height: 20px;
  }
}
</style>