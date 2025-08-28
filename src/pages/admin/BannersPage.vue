<template>
  <q-page class="banners-page">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Header -->
        <div class="col-12">
          <div class="page-header">
            <div>
              <h4 class="text-h4 q-my-none">
                <q-icon name="campaign" class="q-mr-sm" />
                Banner Management
              </h4>
              <p class="text-subtitle1 text-grey-7 q-mb-none">
                Manage advertisement banners and campaigns
              </p>
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Create Banner"
              unelevated
              @click="showCreateDialog = true"
            />
          </div>
        </div>

        <!-- Banners List -->
        <div class="col-12">
          <q-card v-if="banners.length === 0">
            <q-card-section class="text-center q-pa-xl">
              <q-icon name="campaign" size="120px" color="grey-4" />
              <div class="text-h6 text-grey-6 q-mt-md">
                No banners created yet
              </div>
              <div class="text-body2 text-grey-5 q-mb-lg">
                Create your first advertisement banner
              </div>
              <q-btn
                color="primary"
                icon="add"
                label="Create First Banner"
                unelevated
                @click="showCreateDialog = true"
              />
            </q-card-section>
          </q-card>

          <div v-else class="row q-col-gutter-md">
            <div 
              v-for="banner in banners" 
              :key="banner.id"
              class="col-12 col-lg-6"
            >
              <q-card class="banner-card">
                <!-- Banner Preview -->
                <div class="banner-preview" :style="{ backgroundColor: banner.background_color || '#f5f5f5' }">
                  <img 
                    v-if="banner.image_url"
                    :src="banner.image_url"
                    :alt="banner.title"
                    class="banner-image"
                  />
                  <div v-else class="banner-placeholder">
                    <q-icon name="image" size="48px" color="grey-4" />
                    <div class="text-grey-6">No image</div>
                  </div>
                </div>

                <q-card-section>
                  <div class="row items-start q-mb-sm">
                    <div class="col">
                      <div class="text-h6">{{ banner.title }}</div>
                      <div class="text-body2 text-grey-6">{{ banner.description }}</div>
                    </div>
                    <div class="col-auto">
                      <q-badge 
                        :color="banner.is_active ? 'positive' : 'grey'"
                        :label="banner.is_active ? 'ACTIVE' : 'INACTIVE'"
                      />
                    </div>
                  </div>

                  <!-- Banner Details -->
                  <div class="banner-details q-gutter-y-sm">
                    <div class="row">
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Position</div>
                        <div class="text-body2">{{ banner.position }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Priority</div>
                        <div class="text-body2">{{ banner.priority }}</div>
                      </div>
                    </div>
                    
                    <div class="row">
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Start Date</div>
                        <div class="text-body2">{{ formatDate(banner.start_date) }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-6">End Date</div>
                        <div class="text-body2">{{ formatDate(banner.end_date) || 'No end date' }}</div>
                      </div>
                    </div>
                    
                    <div class="row">
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Impressions</div>
                        <div class="text-body2">{{ banner.impressions_count || 0 }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Clicks</div>
                        <div class="text-body2">{{ banner.clicks_count || 0 }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Target Audience -->
                  <div v-if="banner.target_audience" class="q-mt-sm">
                    <div class="text-caption text-grey-6">Target Audience</div>
                    <div class="row q-gutter-xs q-mt-xs">
                      <q-chip
                        v-for="level in banner.target_audience.cefr_levels || []"
                        :key="level"
                        size="sm"
                        color="primary"
                        outline
                        :label="level"
                      />
                      <q-chip
                        v-for="role in banner.target_audience.roles || []"
                        :key="role"
                        size="sm"
                        color="secondary"
                        outline
                        :label="role"
                      />
                    </div>
                  </div>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn 
                    flat 
                    color="primary" 
                    icon="edit"
                    label="Edit"
                    @click="editBanner(banner)"
                  />
                  <q-btn 
                    flat 
                    :color="banner.is_active ? 'negative' : 'positive'"
                    :icon="banner.is_active ? 'pause' : 'play_arrow'"
                    :label="banner.is_active ? 'Deactivate' : 'Activate'"
                    @click="toggleBanner(banner)"
                  />
                  <q-btn 
                    flat 
                    color="negative" 
                    icon="delete"
                    @click="deleteBanner(banner)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Banner Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">{{ editingBanner ? 'Edit' : 'Create' }} Banner</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Basic Info -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="bannerForm.title"
                label="Banner Title"
                outlined
                :rules="[val => !!val || 'Title is required']"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-select
                v-model="bannerForm.position"
                :options="positionOptions"
                label="Position"
                outlined
                emit-value
                map-options
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="bannerForm.description"
                label="Description"
                outlined
                type="textarea"
                rows="2"
              />
            </div>

            <!-- Image and URL -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="bannerForm.image_url"
                label="Image URL"
                outlined
                hint="URL to banner image"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="bannerForm.click_url"
                label="Click URL"
                outlined
                hint="Where users go when clicking"
              />
            </div>

            <!-- Styling -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="bannerForm.background_color"
                label="Background Color"
                outlined
                hint="Hex color code (e.g., #ffffff)"
              >
                <template #append>
                  <q-icon name="palette" class="cursor-pointer">
                    <q-popup-proxy>
                      <q-color v-model="bannerForm.background_color" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="bannerForm.priority"
                label="Priority"
                outlined
                type="number"
                min="1"
                max="100"
                hint="Higher numbers show first"
              />
            </div>

            <!-- Dates -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="bannerForm.start_date"
                label="Start Date"
                outlined
                type="date"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="bannerForm.end_date"
                label="End Date (Optional)"
                outlined
                type="date"
                clearable
              />
            </div>

            <!-- Target Audience -->
            <div class="col-12">
              <div class="text-subtitle2 q-mb-sm">Target Audience</div>
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="bannerForm.target_cefr_levels"
                    :options="cefrOptions"
                    label="CEFR Levels"
                    outlined
                    multiple
                    emit-value
                    map-options
                    hint="Leave empty for all levels"
                  />
                </div>
                
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="bannerForm.target_roles"
                    :options="roleOptions"
                    label="User Roles"
                    outlined
                    multiple
                    emit-value
                    map-options
                    hint="Leave empty for all roles"
                  />
                </div>
              </div>
            </div>

            <!-- Active toggle -->
            <div class="col-12">
              <q-toggle
                v-model="bannerForm.is_active"
                label="Banner is active"
                color="primary"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showCreateDialog = false"
          />
          <q-btn 
            color="primary" 
            :label="editingBanner ? 'Update' : 'Create'"
            :loading="saving"
            @click="saveBanner"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminGuard } from '../../composables/useAuthGuard'

const { requireAdmin } = useAdminGuard()

// Requiere acceso de administrador
requireAdmin()

// State
interface Banner {
  id: string
  title: string
  description: string
  image_url: string
  click_url?: string
  background_color: string
  position: string
  priority: number
  start_date: string | null | undefined
  end_date: string | null | undefined
  is_active: boolean
  impressions_count: number
  clicks_count: number
  target_audience: {
    cefr_levels: string[]
    roles: string[]
  }
}

const banners = ref<Banner[]>([])
const showCreateDialog = ref(false)
const editingBanner = ref<Banner | null>(null)
const saving = ref(false)

const bannerForm = ref({
  title: '',
  description: '',
  image_url: '',
  click_url: '',
  position: 'top',
  priority: 50,
  background_color: '#ffffff',
  start_date: '' as string,
  end_date: '' as string,
  target_cefr_levels: [] as string[],
  target_roles: [] as string[],
  is_active: true
})

// Options
const positionOptions = [
  { label: 'Top of Page', value: 'top' },
  { label: 'Bottom of Page', value: 'bottom' },
  { label: 'Sidebar', value: 'sidebar' },
  { label: 'Between Content', value: 'content' },
  { label: 'Story Reader', value: 'story' },
  { label: 'Vocabulary Page', value: 'vocabulary' }
]

const cefrOptions = [
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
  { label: 'B2', value: 'B2' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' }
]

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

// Methods
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString()
}

const loadBanners = () => {
  try {
    // TODO: Load banners from Supabase
    console.log('Loading banners...')
    
    // Mock data for now
    banners.value = [
      {
        id: '1',
        title: 'Welcome Banner',
        description: 'Welcome to Vaughan Storyteller',
        image_url: '/images/welcome-banner.jpg',
        background_color: '#007bff',
        position: 'top',
        priority: 100,
        start_date: new Date().toISOString(),
        end_date: null,
        is_active: true,
        impressions_count: 1250,
        clicks_count: 45,
        target_audience: {
          cefr_levels: ['A1', 'A2'],
          roles: ['user']
        }
      }
    ]
  } catch (error) {
    console.error('Error loading banners:', error)
  }
}

const editBanner = (banner: Banner) => {
  editingBanner.value = banner
  
  // Populate form
  bannerForm.value = {
    title: banner.title ?? '',
    description: banner.description ?? '',
    image_url: banner.image_url ?? '',
    click_url: banner.click_url ?? '',
    position: banner.position ?? 'top',
    priority: banner.priority ?? 50,
    background_color: banner.background_color ?? '#ffffff',
    // @ts-expect-error - Date formatting for form
    start_date: (banner.start_date && typeof banner.start_date === 'string') ? new Date(banner.start_date).toISOString().split('T')[0] : '',
    // @ts-expect-error - Date formatting for form
    end_date: (banner.end_date && typeof banner.end_date === 'string') ? new Date(banner.end_date).toISOString().split('T')[0] : '',
    target_cefr_levels: banner.target_audience?.cefr_levels ?? [],
    target_roles: banner.target_audience?.roles ?? [],
    is_active: banner.is_active !== false
  }
  
  showCreateDialog.value = true
}

const saveBanner = () => {
  saving.value = true
  try {
    // Prepare data
    const bannerData = {
      ...bannerForm.value,
      target_audience: {
        cefr_levels: bannerForm.value.target_cefr_levels,
        roles: bannerForm.value.target_roles
      }
    }
    
    // Remove the separated target fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { target_cefr_levels, target_roles, ...cleanBannerData } = bannerData
    
    if (editingBanner.value) {
      // TODO: Update banner in Supabase
      console.log('Updating banner:', editingBanner.value.id, cleanBannerData)
    } else {
      // TODO: Create banner in Supabase
      console.log('Creating banner:', cleanBannerData)
    }
    
    showCreateDialog.value = false
    resetForm()
    void loadBanners()
  } catch (error) {
    console.error('Error saving banner:', error)
  } finally {
    saving.value = false
  }
}

const toggleBanner = (banner: Banner) => {
  try {
    // TODO: Toggle banner status in Supabase
    console.log('Toggling banner:', banner.id, !banner.is_active)
    
    void loadBanners()
  } catch (error) {
    console.error('Error toggling banner:', error)
  }
}

const deleteBanner = (banner: Banner) => {
  // TODO: Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete "${String(banner.title)}"?`)
  
  if (confirmed) {
    try {
      // TODO: Delete banner from Supabase
      console.log('Deleting banner:', banner.id)
      
      void loadBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }
}

const resetForm = () => {
  editingBanner.value = null
  bannerForm.value = {
    title: '',
    description: '',
    image_url: '',
    click_url: '',
    position: 'top',
    priority: 50,
    background_color: '#ffffff',
    start_date: '',
    end_date: '',
    target_cefr_levels: [],
    target_roles: [],
    is_active: true
  }
}

onMounted(() => {
  void loadBanners()
})
</script>

<style lang="scss" scoped>
.banners-page {
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

.banner-card {
  height: 100%;
  
  .banner-preview {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    
    .banner-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .banner-placeholder {
      text-align: center;
      color: #999;
    }
  }
  
  .banner-details {
    background: rgba(0, 0, 0, 0.02);
    padding: 12px;
    border-radius: 4px;
    margin-top: 8px;
  }
}
</style>