<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <!-- Split Screen Container -->
      <div class="auth-layout-container">
        <!-- Left Panel - Branding (Hidden on mobile) -->
        <div class="auth-brand-panel">
          <!-- Background gradient and decorative elements -->
          <div class="brand-background">
            <div class="brand-gradient"></div>
            <div class="brand-pattern"></div>
            <div class="floating-elements">
              <div class="float-element float-1"></div>
              <div class="float-element float-2"></div>
              <div class="float-element float-3"></div>
            </div>
          </div>
          
          <!-- Brand Content -->
          <div class="brand-content">
            <!-- Logo Section -->
            <div class="brand-logo-section">
              <div class="brand-logo">
                <q-icon 
                  name="auto_stories" 
                  size="48px" 
                  color="white" 
                />
              </div>
              <h1 class="brand-title">
                The Vaughan Storyteller
              </h1>
              <p class="brand-subtitle">
                AI-powered English learning through immersive stories
              </p>
            </div>

            <!-- Features Highlights -->
            <div class="brand-features">
              <div class="feature-item">
                <q-icon name="psychology" size="24px" color="white" />
                <div class="feature-text">
                  <div class="feature-title">AI-Generated Stories</div>
                  <div class="feature-desc">Personalized content for your CEFR level</div>
                </div>
              </div>
              <div class="feature-item">
                <q-icon name="record_voice_over" size="24px" color="white" />
                <div class="feature-text">
                  <div class="feature-title">Audio Narration</div>
                  <div class="feature-desc">Professional voice synthesis</div>
                </div>
              </div>
              <div class="feature-item">
                <q-icon name="trending_up" size="24px" color="white" />
                <div class="feature-text">
                  <div class="feature-title">Progress Tracking</div>
                  <div class="feature-desc">Monitor your learning journey</div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="brand-footer">
              <p class="footer-text">
                Trusted by English learners worldwide
              </p>
            </div>
          </div>
        </div>

        <!-- Right Panel - Form Content -->
        <div class="auth-form-panel">
          <!-- Mobile Header (Visible only on mobile) -->
          <div class="mobile-header">
            <div class="mobile-logo">
              <q-icon name="auto_stories" size="32px" color="primary" />
              <span class="mobile-title">Vaughan Storyteller</span>
            </div>
          </div>

          <!-- Form Container -->
          <div class="form-container">
            <div class="form-content">
              <!-- Auth pages content -->
              <router-view />
            </div>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Layout component for authentication pages
// Following Quasar Prime Admin login_cover pattern
import { onMounted } from 'vue'

// Optional: Add some interactive elements or animations
onMounted(() => {
  console.log('Auth Layout - Prime pattern initialized')
})
</script>

<style lang="scss" scoped>
// ===== PRIME ADMIN COLOR PALETTE =====
:root {
  --prime-indigo: #6366f1;
  --prime-purple: #8b5cf6;
  --prime-cyan: #06b6d4;
  --prime-emerald: #10b981;
  --prime-amber: #f59e0b;
  --prime-rose: #f43f5e;
}

// ===== MAIN LAYOUT =====
.auth-layout-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  
  @media (max-width: 960px) {
    flex-direction: column;
  }
}

// ===== LEFT PANEL - BRANDING =====
.auth-brand-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  
  @media (max-width: 960px) {
    display: none;
  }
}

.brand-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.brand-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--prime-indigo) 0%,
    var(--prime-purple) 50%,
    var(--prime-cyan) 100%
  );
  opacity: 0.9;
}

.brand-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 60px 60px, 40px 40px;
  animation: patternMove 20s linear infinite;
}

@keyframes patternMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.float-element {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.float-1 {
  width: 120px;
  height: 120px;
  top: 20%;
  left: 15%;
  animation: float1 8s;
}

.float-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 20%;
  animation: float2 10s;
}

.float-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation: float3 12s;
}

@keyframes float1 {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(30px, -20px) rotate(10deg); }
}

@keyframes float2 {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(-20px, 30px) rotate(-10deg); }
}

@keyframes float3 {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(20px, -30px) rotate(15deg); }
}

// ===== BRAND CONTENT =====
.brand-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rem 3rem;
  color: white;
}

.brand-logo-section {
  text-align: center;
  margin-bottom: 4rem;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
}

.brand-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

// ===== FEATURES SECTION =====
.brand-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(10px);
  }
}

.feature-text {
  flex: 1;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-desc {
  font-size: 0.95rem;
  opacity: 0.8;
  line-height: 1.4;
}

// ===== BRAND FOOTER =====
.brand-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-text {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

// ===== RIGHT PANEL - FORM =====
.auth-form-panel {
  flex: 0 0 480px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 960px) {
    flex: 1;
    min-height: 100vh;
  }
}

// ===== MOBILE HEADER =====
.mobile-header {
  display: none;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  background: white;
  
  @media (max-width: 960px) {
    display: block;
  }
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--prime-indigo);
}

// ===== FORM CONTAINER =====
.form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: calc(100vh - 80px); // Asegurar altura mínima para centrado vertical
  
  @media (max-width: 960px) {
    padding: 1.5rem;
    min-height: calc(100vh - 60px);
  }
}

.form-content {
  width: 100%;
  max-width: 400px;
  
  @media (max-width: 480px) {
    max-width: 100%;
  }
}

// ===== RESPONSIVE DESIGN =====
@media (max-width: 1200px) {
  .auth-form-panel {
    flex: 0 0 420px;
  }
  
  .brand-content {
    padding: 3rem 2rem;
  }
  
  .brand-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 960px) {
  .brand-features {
    display: none;
  }
  
  .form-container {
    align-items: center; // Mantener centrado vertical en mobile
    padding-top: 2rem;
    min-height: calc(100vh - 120px);
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 1rem;
  }
  
  .mobile-header {
    padding: 1rem 1.5rem;
  }
  
  .mobile-title {
    font-size: 1.1rem;
  }
}

// ===== ACCESSIBILITY & FOCUS STATES =====
.feature-item,
.brand-logo {
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
}

// ===== DARK MODE SUPPORT (Optional) =====
@media (prefers-color-scheme: dark) {
  .auth-form-panel {
    background: #0f172a;
    color: #e2e8f0;
  }
  
  .mobile-header {
    background: #0f172a;
    border-color: #334155;
  }
}
</style>