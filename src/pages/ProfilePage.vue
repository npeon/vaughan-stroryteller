<template>
  <q-page class="prime-profile-page">
    <div class="prime-container q-pa-lg">
      <!-- Page Header -->
      <div class="prime-page-header q-mb-xl">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="account_circle" />
          </div>
          <div>
            <h1 class="page-title">Profile Settings</h1>
            <p class="page-subtitle">
              Manage your account and learning preferences
            </p>
          </div>
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="prime-card profile-card">
            <div class="profile-header">
              <div class="avatar-section">
                <div class="avatar-container">
                  <div class="user-avatar">
                    <img v-if="profile?.avatar_url" :src="profile.avatar_url" alt="Profile" />
                    <span v-else class="avatar-initials">{{ initials }}</span>
                  </div>
                </div>
                <div class="user-info">
                  <h2 class="user-name">{{ profile?.full_name || 'User' }}</h2>
                  <p class="user-email">{{ profile?.email }}</p>
                  <div class="user-level">
                    <q-icon name="school" class="q-mr-xs" />
                    {{ profile?.cefr_level || 'A1' }} Level
                  </div>
                </div>
              </div>
            </div>
              
            <div class="profile-form">
              <q-form @submit="updateProfile" class="form-container">
                <div class="form-section">
                  <h3 class="section-title">Personal Information</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <q-input
                      v-model="form.full_name"
                      outlined
                      placeholder="Enter your full name"
                      class="prime-input"
                      :rules="[val => !!val || 'Name is required']"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <q-input
                      :model-value="profile?.email"
                      outlined
                      readonly
                      class="prime-input readonly-input"
                    />
                    <p class="form-hint">Email cannot be changed</p>
                  </div>

                  <div class="form-group">
                    <label class="form-label">English Level (CEFR)</label>
                    <q-select
                      v-model="form.cefr_level"
                      :options="cefrOptions"
                      outlined
                      emit-value
                      map-options
                      class="prime-select"
                    />
                  </div>
                </div>

                <div class="form-section">
                  <h3 class="section-title">Preferences</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Interface Language</label>
                    <q-select
                      v-model="form.language"
                      :options="languageOptions"
                      outlined
                      emit-value
                      map-options
                      class="prime-select"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Theme</label>
                    <q-select
                      v-model="form.theme"
                      :options="themeOptions"
                      outlined
                      emit-value
                      map-options
                      class="prime-select"
                    />
                  </div>

                  <div class="form-group toggle-group">
                    <div class="toggle-content">
                      <div>
                        <label class="form-label">Notifications</label>
                        <p class="form-hint">Receive updates about your learning progress</p>
                      </div>
                      <q-toggle
                        v-model="form.notifications"
                        color="primary"
                        size="lg"
                      />
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <q-btn
                    type="submit"
                    class="prime-btn prime-btn--primary"
                    label="Update Profile"
                    :loading="loading"
                    unelevated
                    size="lg"
                  />
                </div>
              </q-form>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="prime-card danger-zone q-mt-lg">
            <div class="danger-header">
              <div class="danger-icon">
                <q-icon name="warning" />
              </div>
              <div>
                <h3 class="danger-title">Account Actions</h3>
                <p class="danger-subtitle">Manage your account settings</p>
              </div>
            </div>
            
            <div class="danger-actions">
              <q-btn
                class="prime-btn prime-btn--outline danger-btn"
                label="Sign Out"
                icon="logout"
                @click="handleSignOut"
                :loading="signingOut"
                unelevated
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccess" class="prime-dialog">
      <div class="prime-card success-dialog">
        <div class="success-content">
          <div class="success-icon">
            <q-icon name="check_circle" />
          </div>
          <h3 class="success-title">Profile Updated!</h3>
          <p class="success-message">
            Your changes have been saved successfully.
          </p>
        </div>
        <div class="success-actions">
          <q-btn 
            class="prime-btn prime-btn--primary"
            label="Continue" 
            unelevated
            @click="showSuccess = false"
          />
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAuthGuard } from '../composables/useAuthGuard'

const router = useRouter()
const { profile, updateProfile: updateUserProfile, signOut, loading } = useAuth()
const { requireAuth } = useAuthGuard()

// Requiere autenticación
requireAuth()

// Form state
const form = ref({
  full_name: '',
  cefr_level: 'A1',
  language: 'es',
  theme: 'light',
  notifications: true
})

const signingOut = ref(false)
const showSuccess = ref(false)

// Options
const cefrOptions = [
  { label: 'A1 - Beginner', value: 'A1' },
  { label: 'A2 - Elementary', value: 'A2' },
  { label: 'B1 - Intermediate', value: 'B1' },
  { label: 'B2 - Upper Intermediate', value: 'B2' },
  { label: 'C1 - Advanced', value: 'C1' },
  { label: 'C2 - Proficiency', value: 'C2' },
]

const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
]

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

// Computed
const initials = computed(() => {
  if (!profile.value?.full_name) return 'U'
  return profile.value.full_name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Methods
const loadProfile = () => {
  if (profile.value) {
    form.value.full_name = profile.value.full_name || ''
    form.value.cefr_level = profile.value.cefr_level || 'A1'
    
    // @ts-expect-error - Type recursion workaround
    const preferencesObj = profile.value.preferences
    form.value.language = preferencesObj?.language || 'es'
    form.value.theme = preferencesObj?.theme || 'light'
    form.value.notifications = preferencesObj?.notifications !== false
  }
}

const updateProfile = async () => {
  try {
    const updates = {
      full_name: form.value.full_name,
      cefr_level: form.value.cefr_level,
      preferences: {
        language: form.value.language,
        theme: form.value.theme,
        notifications: form.value.notifications,
      }
    }

    await updateUserProfile(updates)
    showSuccess.value = true
  } catch (error) {
    console.error('Error updating profile:', error)
    // Error handling is managed by the composable
  }
}

const handleSignOut = async () => {
  signingOut.value = true
  try {
    await signOut()
    void router.push('/auth/login')
  } catch (error) {
    console.error('Error signing out:', error)
  } finally {
    signingOut.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style lang="scss" scoped>
// ===== PRIME PROFILE PAGE STYLES =====
@import '../css/quasar.variables.scss';

.prime-profile-page {
  background: var(--prime-grey-50);
  min-height: calc(100vh - 64px);
}

// ===== PAGE HEADER =====
.prime-page-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.header-content {
  display: flex;
  align-items: center;
  gap: $prime-space-md;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--prime-warning) 0%, #f97316 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--prime-grey-600);
  margin: $prime-space-xs 0 0 0;
  font-weight: 400;
}

// ===== PROFILE CARD =====
.profile-card {
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
  padding: $prime-space-xl;
  color: white;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: $prime-space-lg;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: $prime-space-md;
  }
}

.avatar-container {
  flex-shrink: 0;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-initials {
  font-size: 2rem;
  font-weight: 600;
  color: white;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 $prime-space-xs 0;
  color: white;
}

.user-email {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 $prime-space-sm 0;
}

.user-level {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: $prime-space-xs $prime-space-sm;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(10px);
}

// ===== FORM STYLES =====
.profile-form {
  padding: $prime-space-xl;
}

.form-container {
  max-width: 600px;
}

.form-section {
  margin-bottom: $prime-space-2xl;
  
  &:last-child {
    margin-bottom: $prime-space-xl;
  }
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0 0 $prime-space-lg 0;
  
  &::after {
    content: '';
    display: block;
    width: 40px;
    height: 2px;
    background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
    margin-top: $prime-space-xs;
    border-radius: 1px;
  }
}

.form-group {
  margin-bottom: $prime-space-lg;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--prime-grey-700);
  margin-bottom: $prime-space-sm;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--prime-grey-500);
  margin: $prime-space-xs 0 0 0;
}

.readonly-input {
  background: var(--prime-grey-50) !important;
  
  :deep(.q-field__control) {
    background: var(--prime-grey-50) !important;
  }
}

.toggle-group {
  border: 1px solid var(--prime-grey-200);
  border-radius: var(--radius-md);
  padding: $prime-space-lg;
  background: var(--prime-grey-50);
}

.toggle-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $prime-space-md;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    
    .q-toggle {
      align-self: flex-start;
    }
  }
}

.form-actions {
  padding-top: $prime-space-lg;
  border-top: 1px solid var(--prime-grey-100);
}

// ===== DANGER ZONE =====
.danger-zone {
  border: 1px solid var(--prime-negative);
  border-radius: var(--radius-md);
}

.danger-header {
  display: flex;
  align-items: center;
  gap: $prime-space-md;
  padding: $prime-space-lg $prime-space-xl;
  border-bottom: 1px solid rgba(239, 68, 68, 0.1);
  background: rgba(239, 68, 68, 0.02);
}

.danger-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--prime-negative);
  font-size: 20px;
}

.danger-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--prime-negative);
  margin: 0;
}

.danger-subtitle {
  font-size: 0.875rem;
  color: var(--prime-grey-600);
  margin: $prime-space-xs 0 0 0;
}

.danger-actions {
  padding: $prime-space-lg $prime-space-xl;
}

.danger-btn {
  border-color: var(--prime-negative) !important;
  color: var(--prime-negative) !important;
  
  &:hover {
    background: var(--prime-negative) !important;
    color: white !important;
  }
}

// ===== SUCCESS DIALOG =====
.success-dialog {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.success-content {
  padding: $prime-space-2xl $prime-space-xl $prime-space-lg;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto $prime-space-lg;
  border-radius: 50%;
  background: var(--prime-positive);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  margin: 0 0 $prime-space-sm 0;
}

.success-message {
  font-size: 0.875rem;
  color: var(--prime-grey-600);
  margin: 0;
  line-height: 1.5;
}

.success-actions {
  padding: $prime-space-lg $prime-space-xl $prime-space-xl;
}

// ===== RESPONSIVE DESIGN =====
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .profile-form {
    padding: $prime-space-lg;
  }
  
  .form-container {
    max-width: none;
  }
  
  .user-name {
    font-size: 1.5rem;
  }
  
  .danger-header,
  .danger-actions {
    padding: $prime-space-lg;
  }
  
  .success-content {
    padding: $prime-space-xl $prime-space-lg $prime-space-lg;
  }
  
  .success-actions {
    padding: $prime-space-lg;
  }
}

// ===== ANIMATIONS =====
.profile-card {
  animation: fadeIn 0.6s ease-out;
}

.danger-zone {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
</style>