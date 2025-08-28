<template>
  <q-page class="admin-dashboard-page">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Header -->
        <div class="col-12">
          <div class="page-header">
            <div>
              <h4 class="text-h4 q-my-none">
                <q-icon name="dashboard" class="q-mr-sm" />
                Admin Dashboard
              </h4>
              <p class="text-subtitle1 text-grey-7 q-mb-none">
                System overview and key metrics
              </p>
            </div>
            <q-btn
              color="primary"
              icon="refresh"
              label="Refresh Data"
              unelevated
              @click="refreshData"
              :loading="refreshing"
            />
          </div>
        </div>

        <!-- Key Stats -->
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-primary">{{ stats.totalUsers }}</div>
                  <div class="text-subtitle2">Total Users</div>
                  <div class="text-caption text-positive">
                    +{{ stats.newUsersToday }} today
                  </div>
                </div>
                <div class="col-auto">
                  <q-icon name="people" size="48px" color="primary" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-secondary">{{ stats.totalStories }}</div>
                  <div class="text-subtitle2">Stories Generated</div>
                  <div class="text-caption text-positive">
                    +{{ stats.storiesGenerated }} today
                  </div>
                </div>
                <div class="col-auto">
                  <q-icon name="auto_stories" size="48px" color="secondary" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-accent">{{ stats.activeUsers }}</div>
                  <div class="text-subtitle2">Active Users</div>
                  <div class="text-caption text-grey-6">
                    Last 7 days
                  </div>
                </div>
                <div class="col-auto">
                  <q-icon name="trending_up" size="48px" color="accent" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-warning">{{ stats.apiCalls }}</div>
                  <div class="text-subtitle2">API Calls</div>
                  <div class="text-caption text-grey-6">
                    Today
                  </div>
                </div>
                <div class="col-auto">
                  <q-icon name="api" size="48px" color="warning" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- API Health Overview -->
        <div class="col-12 col-lg-8">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="monitor_heart" class="q-mr-sm" />
                API Health Status
              </div>
              
              <div class="row q-col-gutter-md">
                <div 
                  v-for="api in apiHealth" 
                  :key="api.name"
                  class="col-12 col-sm-6"
                >
                  <div class="api-status-item">
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-weight-medium">{{ api.name }}</div>
                        <div class="text-caption text-grey-6">{{ api.endpoint }}</div>
                      </div>
                      <div class="col-auto">
                        <q-badge 
                          :color="api.status === 'healthy' ? 'positive' : 'negative'"
                          :label="api.status.toUpperCase()"
                        />
                      </div>
                    </div>
                    <div class="row items-center q-mt-sm">
                      <div class="col">
                        <div class="text-caption">Response Time: {{ api.responseTime }}ms</div>
                      </div>
                      <div class="col-auto">
                        <div class="text-caption">Last Check: {{ formatTime(api.lastCheck) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="q-mt-md">
                <q-btn 
                  color="primary" 
                  outline 
                  icon="monitor_heart"
                  label="View Detailed Health"
                  @click="goToApiHealth"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Recent Activity -->
        <div class="col-12 col-lg-4">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="history" class="q-mr-sm" />
                Recent Activity
              </div>
              
              <q-list>
                <q-item 
                  v-for="activity in recentActivity" 
                  :key="activity.id"
                  dense
                >
                  <q-item-section avatar>
                    <q-icon 
                      :name="activity.icon" 
                      :color="activity.color"
                      size="sm" 
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label lines="2" class="text-body2">
                      {{ activity.description }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ formatTime(activity.timestamp) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div class="q-mt-md" v-if="recentActivity.length === 0">
                <div class="text-center text-grey-6">
                  <q-icon name="history" size="48px" />
                  <div class="q-mt-sm">No recent activity</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="flash_on" class="q-mr-sm" />
                Quick Actions
              </div>
              
              <div class="row q-gutter-md">
                <q-btn
                  color="primary"
                  icon="people"
                  label="Manage Users"
                  unelevated
                  @click="goToUsers"
                />
                
                <q-btn
                  color="secondary"
                  icon="campaign"
                  label="Manage Banners"
                  unelevated
                  @click="goToBanners"
                />
                
                <q-btn
                  color="accent"
                  icon="settings"
                  label="System Settings"
                  unelevated
                  @click="openSettings"
                />
                
                <q-btn
                  color="warning"
                  icon="backup"
                  label="Backup Data"
                  unelevated
                  @click="initiateBackup"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminGuard } from '../../composables/useAuthGuard'

// Types
interface RecentActivity {
  id: string | number
  icon: string
  color: string
  description: string
  timestamp: Date
}


const router = useRouter()
const { requireAdmin } = useAdminGuard()

// Requiere acceso de administrador
requireAdmin()

// State
const refreshing = ref(false)

const stats = ref({
  totalUsers: 0,
  newUsersToday: 0,
  totalStories: 0,
  storiesGenerated: 0,
  activeUsers: 0,
  apiCalls: 0
})

const apiHealth = ref([
  {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1',
    status: 'healthy',
    responseTime: 245,
    lastCheck: new Date()
  },
  {
    name: 'ElevenLabs',
    endpoint: 'https://api.elevenlabs.io/v1',
    status: 'healthy',
    responseTime: 180,
    lastCheck: new Date()
  },
  {
    name: 'WordsAPI',
    endpoint: 'https://wordsapiv1.p.rapidapi.com',
    status: 'healthy',
    responseTime: 320,
    lastCheck: new Date()
  },
  {
    name: 'Supabase',
    endpoint: 'https://supabase.co',
    status: 'healthy',
    responseTime: 120,
    lastCheck: new Date()
  }
])

const recentActivity = ref<RecentActivity[]>([])

// Methods
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  return date.toLocaleDateString()
}

const refreshData = async () => {
  refreshing.value = true
  try {
    await Promise.all([
      loadStats(),
      loadApiHealth(),
      loadRecentActivity()
    ])
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    refreshing.value = false
  }
}

const loadStats = () => {
  try {
    // TODO: Load real stats from Supabase
    console.log('Loading admin stats...')
    
    // Mock data
    stats.value = {
      totalUsers: 0,
      newUsersToday: 0,
      totalStories: 0,
      storiesGenerated: 0,
      activeUsers: 0,
      apiCalls: 0
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadApiHealth = () => {
  try {
    // TODO: Load real API health status
    console.log('Loading API health...')
  } catch (error) {
    console.error('Error loading API health:', error)
  }
}

const loadRecentActivity = () => {
  try {
    // TODO: Load real recent activity from Supabase
    console.log('Loading recent activity...')
    // Mock data with proper types
    recentActivity.value = [
      {
        id: 1,
        icon: 'person_add',
        color: 'positive',
        description: 'New user registered',
        timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        id: 2,
        icon: 'library_books',
        color: 'primary',
        description: 'Story generated for user',
        timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      }
    ]
  } catch (error) {
    console.error('Error loading recent activity:', error)
  }
}

// Navigation methods
const goToUsers = () => {
  void router.push('/admin/users')
}

const goToBanners = () => {
  void router.push('/admin/banners')
}

const goToApiHealth = () => {
  void router.push('/admin/api-health')
}

const openSettings = () => {
  // TODO: Implement system settings dialog
  console.log('Opening system settings...')
}

const initiateBackup = () => {
  // TODO: Implement data backup
  console.log('Initiating backup...')
}

onMounted(() => {
  void refreshData()
})
</script>

<style lang="scss" scoped>
.admin-dashboard-page {
  background: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.stats-card {
  .text-h4 {
    font-weight: 600;
  }
}

.api-status-item {
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}
</style>