<template>
  <q-page class="dashboard-page">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Header de bienvenida -->
        <div class="col-12">
          <q-card class="welcome-card">
            <q-card-section>
              <div class="text-h4 text-weight-light">
                Welcome back, {{ profile?.full_name || 'Student' }}!
              </div>
              <div class="text-subtitle1 text-grey-7">
                Ready to continue your English learning journey?
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Cards de stats rápidas -->
        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6 q-mb-sm">Your Level</div>
              <div class="text-h4 text-primary">{{ profile?.cefr_level || 'A1' }}</div>
              <div class="text-caption text-grey-6">CEFR Level</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6 q-mb-sm">Stories Read</div>
              <div class="text-h4 text-positive">0</div>
              <div class="text-caption text-grey-6">This month</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6 q-mb-sm">Vocabulary</div>
              <div class="text-h4 text-orange">0</div>
              <div class="text-caption text-grey-6">Words learned</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick actions -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Quick Actions</div>
              <div class="row q-gutter-md">
                <q-btn 
                  color="primary" 
                  icon="auto_stories" 
                  label="Generate New Story"
                  unelevated
                  size="lg"
                  @click="goToStories"
                />
                <q-btn 
                  color="secondary" 
                  icon="book" 
                  label="Review Vocabulary"
                  unelevated
                  size="lg"
                  @click="goToVocabulary"
                />
                <q-btn 
                  color="accent" 
                  icon="account_circle" 
                  label="Update Profile"
                  unelevated
                  size="lg"
                  @click="goToProfile"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Placeholder para contenido futuro -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Recent Activity</div>
              <div class="text-center q-pa-xl">
                <q-icon name="history" size="64px" color="grey-4" />
                <div class="text-grey-6 q-mt-md">
                  Start reading stories to see your activity here
                </div>
              </div>
            </q-card-section>
          </q-card>
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
.dashboard-page {
  background: #f5f5f5;
}

.welcome-card {
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  color: white;
  
  .text-subtitle1 {
    color: rgba(255, 255, 255, 0.8);
  }
}

.stats-card {
  text-align: center;
  
  .text-h4 {
    font-weight: 600;
  }
}
</style>