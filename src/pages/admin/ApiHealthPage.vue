<template>
  <q-page class="api-health-page">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Header -->
        <div class="col-12">
          <div class="page-header">
            <div>
              <h4 class="text-h4 q-my-none">
                <q-icon name="monitor_heart" class="q-mr-sm" />
                API Health Monitor
              </h4>
              <p class="text-subtitle1 text-grey-7 q-mb-none">
                Monitor external API services and performance
              </p>
            </div>
            <q-btn
              color="primary"
              icon="refresh"
              label="Check All APIs"
              unelevated
              @click="checkAllAPIs"
              :loading="checkingAll"
            />
          </div>
        </div>

        <!-- Overall Status -->
        <div class="col-12">
          <q-card class="status-overview">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">System Status</div>
                  <div class="text-body2 text-grey-6">
                    Last updated: {{ formatTime(lastUpdate) }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-badge 
                    :color="overallStatus.color"
                    :label="overallStatus.label"
                    class="text-h6"
                    style="padding: 8px 16px"
                  />
                </div>
              </div>
              
              <div class="row q-mt-md q-col-gutter-md">
                <div class="col-6 col-sm-3">
                  <div class="text-center">
                    <div class="text-h5 text-positive">{{ healthyAPIs }}</div>
                    <div class="text-caption">Healthy</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-center">
                    <div class="text-h5 text-warning">{{ degradedAPIs }}</div>
                    <div class="text-caption">Degraded</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-center">
                    <div class="text-h5 text-negative">{{ downAPIs }}</div>
                    <div class="text-caption">Down</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-center">
                    <div class="text-h5 text-info">{{ totalAPIs }}</div>
                    <div class="text-caption">Total</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- API Services -->
        <div class="col-12">
          <div class="row q-col-gutter-md">
            <div 
              v-for="api in apis" 
              :key="api.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card class="api-card" :class="{ 'api-down': api.status === 'down' }">
                <q-card-section>
                  <div class="row items-start q-mb-md">
                    <div class="col">
                      <div class="text-h6">{{ api.name }}</div>
                      <div class="text-body2 text-grey-6">{{ api.endpoint }}</div>
                    </div>
                    <div class="col-auto">
                      <q-badge 
                        :color="getStatusColor(api.status)"
                        :label="api.status.toUpperCase()"
                      />
                    </div>
                  </div>

                  <!-- Status Details -->
                  <div class="api-details">
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <div class="detail-item">
                          <div class="text-caption text-grey-6">Response Time</div>
                          <div class="text-body1" :class="getResponseTimeClass(api.response_time)">
                            {{ api.response_time }}ms
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="detail-item">
                          <div class="text-caption text-grey-6">Uptime</div>
                          <div class="text-body1 text-positive">
                            {{ api.uptime_percentage }}%
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="detail-item">
                          <div class="text-caption text-grey-6">Last Check</div>
                          <div class="text-body2">
                            {{ formatTime(api.last_check) }}
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="detail-item">
                          <div class="text-caption text-grey-6">Requests Today</div>
                          <div class="text-body1">
                            {{ api.requests_today || 0 }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Error Message -->
                  <div v-if="api.error_message" class="q-mt-md">
                    <q-banner class="text-negative bg-red-1">
                      <template #avatar>
                        <q-icon name="error" />
                      </template>
                      <div class="text-caption">{{ api.error_message }}</div>
                    </q-banner>
                  </div>

                  <!-- Recent Performance -->
                  <div class="q-mt-md">
                    <div class="text-caption text-grey-6 q-mb-sm">Recent Performance</div>
                    <div class="performance-chart">
                      <!-- Simple visual representation of recent checks -->
                      <div class="performance-dots">
                        <div 
                          v-for="(check, index) in api.recent_checks" 
                          :key="index"
                          class="performance-dot"
                          :class="{
                            'dot-success': check.status === 'healthy',
                            'dot-warning': check.status === 'degraded',
                            'dot-error': check.status === 'down'
                          }"
                          :title="`${formatTime(check.timestamp)}: ${check.response_time}ms`"
                        />
                      </div>
                      <div class="text-caption text-grey-5">Last 24 hours</div>
                    </div>
                  </div>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn 
                    flat 
                    color="primary" 
                    icon="refresh"
                    label="Check Now"
                    size="sm"
                    @click="checkAPI(api)"
                    :loading="api.checking"
                  />
                  <q-btn 
                    flat 
                    color="secondary" 
                    icon="history"
                    label="History"
                    size="sm"
                    @click="showHistory(api)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Performance Chart -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="analytics" class="q-mr-sm" />
                Performance Overview
              </div>
              
              <div class="text-center q-pa-xl text-grey-6">
                <q-icon name="show_chart" size="80px" />
                <div class="q-mt-md">
                  Performance charts will be implemented here
                </div>
                <div class="text-body2">
                  Show API response times, uptime trends, and usage patterns
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- API History Dialog -->
    <q-dialog v-model="showHistoryDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ selectedAPI?.name }} - History</div>
          <div class="text-body2 text-grey-6">{{ selectedAPI?.endpoint }}</div>
        </q-card-section>

        <q-card-section style="max-height: 400px; overflow-y: auto">
          <q-list separator>
            <q-item 
              v-for="check in apiHistory" 
              :key="check.id || check.timestamp.getTime()"
            >
              <q-item-section avatar>
                <q-icon 
                  :name="check.status === 'healthy' ? 'check_circle' : 'error'" 
                  :color="getStatusColor(check.status)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  <q-badge 
                    :color="getStatusColor(check.status)" 
                    :label="check.status.toUpperCase()"
                  />
                  <span class="q-ml-sm">{{ check.response_time }}ms</span>
                </q-item-label>
                <q-item-label caption>
                  {{ formatTime(check.created_at || check.timestamp) }}
                </q-item-label>
                <q-item-label v-if="check.error_message" caption class="text-negative">
                  {{ check.error_message }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="apiHistory.length === 0" class="text-center q-pa-lg text-grey-6">
            No history available
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Close" 
            @click="showHistoryDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAdminGuard } from '../../composables/useAuthGuard'

// Types
interface ApiHealthCheck {
  id?: number
  timestamp: Date
  created_at?: Date
  status: string
  response_time: number
  error_message?: string | null
}

interface ApiHealthItem {
  id: number
  name: string
  endpoint: string
  status: string
  response_time: number
  uptime_percentage: number
  last_check: Date
  requests_today: number
  error_message: string | null
  checking: boolean
  recent_checks: ApiHealthCheck[]
}

const { requireAdmin } = useAdminGuard()

// Requiere acceso de administrador
requireAdmin()

// State
const apis = ref<ApiHealthItem[]>([])
const checkingAll = ref(false)
const lastUpdate = ref(new Date())
const showHistoryDialog = ref(false)
const selectedAPI = ref<ApiHealthItem | null>(null)
const apiHistory = ref<ApiHealthCheck[]>([])

// Computed
const totalAPIs = computed(() => apis.value.length)
const healthyAPIs = computed(() => apis.value.filter(api => api.status === 'healthy').length)
const degradedAPIs = computed(() => apis.value.filter(api => api.status === 'degraded').length)
const downAPIs = computed(() => apis.value.filter(api => api.status === 'down').length)

const overallStatus = computed(() => {
  if (downAPIs.value > 0) {
    return { color: 'negative', label: 'ISSUES DETECTED' }
  }
  if (degradedAPIs.value > 0) {
    return { color: 'warning', label: 'DEGRADED' }
  }
  return { color: 'positive', label: 'ALL SYSTEMS OPERATIONAL' }
})

// Methods
const formatTime = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  return d.toLocaleString()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'positive'
    case 'degraded': return 'warning'
    case 'down': return 'negative'
    default: return 'grey'
  }
}

const getResponseTimeClass = (responseTime: number) => {
  if (responseTime < 200) return 'text-positive'
  if (responseTime < 500) return 'text-warning'
  return 'text-negative'
}

const loadAPIStatus = () => {
  try {
    // TODO: Load API health status from Supabase
    console.log('Loading API health status...')
    
    // Mock data
    apis.value = [
      {
        id: 1,
        name: 'OpenRouter',
        endpoint: 'https://openrouter.ai/api/v1',
        status: 'healthy',
        response_time: 245,
        uptime_percentage: 99.9,
        last_check: new Date(),
        requests_today: 156,
        error_message: null,
        checking: false,
        recent_checks: generateMockRecentChecks()
      },
      {
        id: 2,
        name: 'ElevenLabs',
        endpoint: 'https://api.elevenlabs.io/v1',
        status: 'healthy',
        response_time: 180,
        uptime_percentage: 99.8,
        last_check: new Date(),
        requests_today: 43,
        error_message: null,
        checking: false,
        recent_checks: generateMockRecentChecks()
      },
      {
        id: 3,
        name: 'Supabase',
        endpoint: 'https://supabase.co',
        status: 'healthy',
        response_time: 120,
        uptime_percentage: 99.9,
        last_check: new Date(),
        requests_today: 234,
        error_message: null,
        checking: false,
        recent_checks: generateMockRecentChecks()
      }
    ]
  } catch (error) {
    console.error('Error loading API status:', error)
  }
}

const generateMockRecentChecks = (hasDegraded = false) => {
  const checks = []
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date()
    timestamp.setHours(timestamp.getHours() - i)
    
    let status = 'healthy'
    let responseTime = 200 + Math.random() * 100
    
    if (hasDegraded && Math.random() < 0.3) {
      status = 'degraded'
      responseTime = 500 + Math.random() * 400
    }
    
    checks.push({
      timestamp,
      status,
      response_time: Math.floor(responseTime)
    })
  }
  return checks.reverse()
}

const checkAllAPIs = async () => {
  checkingAll.value = true
  try {
    // Check all APIs in parallel
    const promises = apis.value.map(api => checkAPI(api))
    await Promise.all(promises)
    
    lastUpdate.value = new Date()
  } catch (error) {
    console.error('Error checking APIs:', error)
  } finally {
    checkingAll.value = false
  }
}

const checkAPI = async (api: ApiHealthItem) => {
  api.checking = true
  try {
    // TODO: Implement actual API health check
    console.log('Checking API:', api.name)
    
    // Simulate API check
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Mock response
    const responseTime = 100 + Math.random() * 300
    api.response_time = Math.floor(responseTime)
    api.last_check = new Date()
    
    if (responseTime > 500) {
      api.status = 'degraded'
      api.error_message = 'High response time'
    } else {
      api.status = 'healthy'
      api.error_message = null
    }
    
    // Add to recent checks
    api.recent_checks.push({
      timestamp: new Date(),
      status: api.status,
      response_time: api.response_time
    })
    
    // Keep only last 24 checks
    if (api.recent_checks.length > 24) {
      api.recent_checks = api.recent_checks.slice(-24)
    }
    
  } catch (error) {
    console.error(`Error checking ${api.name}:`, error)
    api.status = 'down'
    api.error_message = 'Connection failed'
  } finally {
    api.checking = false
  }
}

const showHistory = (api: ApiHealthItem) => {
  selectedAPI.value = api
  
  try {
    // TODO: Load API history from Supabase
    console.log('Loading history for:', api.name)
    
    // Mock history data
    apiHistory.value = []
    for (let i = 0; i < 20; i++) {
      const date = new Date()
      date.setMinutes(date.getMinutes() - i * 30)
      
      apiHistory.value.push({
        id: i,
        timestamp: date,
        created_at: date,
        status: Math.random() > 0.1 ? 'healthy' : 'degraded',
        response_time: Math.floor(150 + Math.random() * 200),
        error_message: Math.random() > 0.8 ? 'Timeout error' : null
      })
    }
  } catch (error) {
    console.error('Error loading API history:', error)
  }
  
  showHistoryDialog.value = true
}

// Auto-refresh every 5 minutes
let refreshInterval: NodeJS.Timeout

onMounted(() => {
  void loadAPIStatus()
  
  refreshInterval = setInterval(() => {
    void checkAllAPIs()
  }, 5 * 60 * 1000) // 5 minutes
})

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style lang="scss" scoped>
.api-health-page {
  background: #f5f5f5;
  padding-top: 24px; // Añadir espacio superior entre menú y contenido
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

.status-overview {
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  color: white;
  
  .text-body2 {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .text-caption {
    color: rgba(255, 255, 255, 0.7);
  }
}

.api-card {
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &.api-down {
    border-left: 4px solid $negative;
  }
}

.api-details {
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 4px;
  
  .detail-item {
    text-align: center;
  }
}

.performance-chart {
  .performance-dots {
    display: flex;
    gap: 2px;
    margin-bottom: 4px;
  }
  
  .performance-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ddd;
    
    &.dot-success {
      background: $positive;
    }
    
    &.dot-warning {
      background: $warning;
    }
    
    &.dot-error {
      background: $negative;
    }
  }
}
</style>