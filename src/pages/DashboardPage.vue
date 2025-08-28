<template>
  <q-page class="prime-dashboard">
    <div class="prime-container q-pa-lg">
      <!-- Welcome Header -->
      <div class="prime-welcome-card q-mb-xl">
        <div class="welcome-content">
          <div class="welcome-title">
            Welcome back, {{ profile?.full_name || 'Student' }}!
          </div>
          <div class="welcome-subtitle">
            Ready to continue your English learning journey?
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="prime-grid prime-grid--3 q-mb-xl">
        <div class="prime-stats-card">
          <div class="stats-icon">
            <q-icon name="school" />
          </div>
          <div class="stats-number">{{ profile?.cefr_level || 'A1' }}</div>
          <div class="stats-label">Your Level</div>
          <div class="stats-caption">CEFR Level</div>
        </div>

        <div class="prime-stats-card">
          <div class="stats-icon">
            <q-icon name="menu_book" />
          </div>
          <div class="stats-number">0</div>
          <div class="stats-label">Stories Read</div>
          <div class="stats-caption">This month</div>
        </div>

        <div class="prime-stats-card">
          <div class="stats-icon">
            <q-icon name="translate" />
          </div>
          <div class="stats-number">0</div>
          <div class="stats-label">Vocabulary</div>
          <div class="stats-caption">Words learned</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="q-mb-xl">
        <h2 class="section-title q-mb-lg">Quick Actions</h2>
        <div class="prime-action-grid">
          <div class="prime-action-card" @click="goToStories">
            <div class="action-icon action-icon--primary">
              <q-icon name="auto_stories" />
            </div>
            <div class="action-title">Generate New Story</div>
            <div class="action-description">
              Create personalized stories adapted to your English level
            </div>
          </div>

          <div class="prime-action-card" @click="goToVocabulary">
            <div class="action-icon action-icon--secondary">
              <q-icon name="translate" />
            </div>
            <div class="action-title">Review Vocabulary</div>
            <div class="action-description">
              Practice and reinforce words you've learned from stories
            </div>
          </div>

          <div class="prime-action-card" @click="goToProfile">
            <div class="action-icon action-icon--accent">
              <q-icon name="account_circle" />
            </div>
            <div class="action-title">Update Profile</div>
            <div class="action-description">
              Manage your learning preferences and track progress
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="q-mb-xl">
        <h2 class="section-title q-mb-lg">Recent Activity</h2>
        <div class="prime-empty-state">
          <div class="empty-icon">
            <q-icon name="history" />
          </div>
          <div class="empty-title">No Recent Activity</div>
          <div class="empty-description">
            Start reading stories to track your learning progress and see your activity here. 
            Your journey begins with just one story!
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAuthGuard } from '../composables/useAuthGuard'

const router = useRouter()
const { profile } = useAuth()
const { requireAuth } = useAuthGuard()

// Requiere autenticación
requireAuth()

const goToStories = () => {
  void router.push('/dashboard/stories')
}

const goToVocabulary = () => {
  void router.push('/dashboard/vocabulary')
}

const goToProfile = () => {
  void router.push('/dashboard/profile')
}
</script>

<style lang="scss" scoped>
// ===== PRIME DASHBOARD PAGE STYLES =====
@import '../css/quasar.variables.scss';

.prime-dashboard {
  background: var(--prime-grey-50);
  min-height: calc(100vh - 64px);
}

// ===== WELCOME SECTION =====
.welcome-content {
  position: relative;
  z-index: 1;
}

// ===== SECTION TITLES =====
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0;
  padding: 0;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
    margin-top: $prime-space-sm;
    border-radius: 2px;
  }
}

// ===== RESPONSIVE DESIGN =====
@media (max-width: 768px) {
  .prime-container {
    padding: $prime-space-md;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .prime-welcome-card {
    padding: $prime-space-lg;
    
    .welcome-title {
      font-size: 1.5rem;
    }
    
    .welcome-subtitle {
      font-size: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .prime-container {
    padding: $prime-space-sm;
  }
  
  .prime-welcome-card {
    padding: $prime-space-md;
    
    .welcome-title {
      font-size: 1.25rem;
    }
    
    .welcome-subtitle {
      font-size: 0.875rem;
    }
  }
}

// ===== ANIMATIONS =====
.prime-stats-card,
.prime-action-card,
.prime-empty-state {
  animation: fadeInUp 0.6s ease-out;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
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

.prime-welcome-card {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>