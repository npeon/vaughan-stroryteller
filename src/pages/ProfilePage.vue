<template>
  <q-page class="profile-page">
    <div class="q-pa-md">
      <div class="row justify-center">
        <div class="col-12 col-md-8 col-lg-6">
          <q-card>
            <q-card-section>
              <div class="text-h5 q-mb-md">
                <q-icon name="account_circle" class="q-mr-sm" />
                Profile Settings
              </div>
              
              <q-form @submit="updateProfile" class="q-gutter-md">
                <!-- Avatar -->
                <div class="text-center q-mb-lg">
                  <q-avatar size="100px" color="primary" text-color="white">
                    <img v-if="profile?.avatar_url" :src="profile.avatar_url" />
                    <span v-else class="text-h4">
                      {{ initials }}
                    </span>
                  </q-avatar>
                </div>

                <!-- Full Name -->
                <q-input
                  v-model="form.full_name"
                  label="Full Name"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />

                <!-- Email (read only) -->
                <q-input
                  :model-value="profile?.email"
                  label="Email"
                  outlined
                  readonly
                  hint="Email cannot be changed"
                />

                <!-- CEFR Level -->
                <q-select
                  v-model="form.cefr_level"
                  :options="cefrOptions"
                  label="English Level (CEFR)"
                  outlined
                  emit-value
                  map-options
                />

                <!-- Language Preference -->
                <q-select
                  v-model="form.language"
                  :options="languageOptions"
                  label="Interface Language"
                  outlined
                  emit-value
                  map-options
                />

                <!-- Theme Preference -->
                <q-select
                  v-model="form.theme"
                  :options="themeOptions"
                  label="Theme"
                  outlined
                  emit-value
                  map-options
                />

                <!-- Notifications -->
                <q-toggle
                  v-model="form.notifications"
                  label="Enable notifications"
                  color="primary"
                />

                <!-- Submit Button -->
                <div class="q-pt-md">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Update Profile"
                    :loading="loading"
                    unelevated
                    size="lg"
                    class="full-width"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- Danger Zone -->
          <q-card class="q-mt-lg">
            <q-card-section>
              <div class="text-h6 text-negative q-mb-md">
                <q-icon name="warning" class="q-mr-sm" />
                Account Actions
              </div>
              
              <q-btn
                color="negative"
                outline
                label="Sign Out"
                icon="logout"
                @click="handleSignOut"
                :loading="signingOut"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="64px" color="positive" />
          <div class="text-h6 q-mt-md">Profile Updated!</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            Your changes have been saved successfully.
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn 
            color="primary" 
            label="Continue" 
            unelevated
            @click="showSuccess = false"
          />
        </q-card-actions>
      </q-card>
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
.profile-page {
  background: #f5f5f5;
}
</style>