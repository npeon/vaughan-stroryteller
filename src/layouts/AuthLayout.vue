<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="window-height window-width row justify-center items-center bg-gradient">
        <div class="auth-container">
          <div class="auth-card">
            <!-- Logo y título -->
            <div class="text-center q-mb-xl">
              <div class="auth-logo q-mb-md">
                <q-icon 
                  name="auto_stories" 
                  size="64px" 
                  color="primary" 
                />
              </div>
              <h1 class="text-h4 text-weight-light q-mt-none q-mb-sm">
                The Vaughan Storyteller
              </h1>
              <p class="text-subtitle1 text-grey-6 q-mt-none">
                AI-powered English learning through stories
              </p>
            </div>

            <!-- Contenido de las páginas de auth -->
            <router-view />

            <!-- Footer -->
            <div class="auth-footer q-mt-xl text-center">
              <p class="text-caption text-grey-5">
                Powered by AI • Designed for English learners
              </p>
            </div>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Layout simple para páginas de autenticación
</script>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="white" fill-opacity="0.05"><circle cx="20" cy="20" r="1"/></g></svg>');
    pointer-events: none;
  }
}

.auth-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  
  @media (max-width: 480px) {
    padding: 32px 24px;
    margin: 16px;
  }
}

.auth-logo {
  display: inline-block;
  padding: 16px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 50%;
}

.auth-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 24px;
  margin-top: 32px;
}
</style>