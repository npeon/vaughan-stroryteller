<template>
  <q-page class="users-page">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Header -->
        <div class="col-12">
          <div class="page-header">
            <div>
              <h4 class="text-h4 q-my-none">
                <q-icon name="people" class="q-mr-sm" />
                User Management
              </h4>
              <p class="text-subtitle1 text-grey-7 q-mb-none">
                Manage users, roles, and limits
              </p>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="row q-col-gutter-md items-center">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="searchQuery"
                    placeholder="Search users..."
                    outlined
                    dense
                    clearable
                  >
                    <template #prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
                
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="roleFilter"
                    :options="roleOptions"
                    label="Filter by Role"
                    outlined
                    dense
                    clearable
                    emit-value
                    map-options
                  />
                </div>
                
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="statusFilter"
                    :options="statusOptions"
                    label="Filter by Status"
                    outlined
                    dense
                    clearable
                    emit-value
                    map-options
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-btn
                    color="primary"
                    icon="refresh"
                    label="Refresh"
                    unelevated
                    @click="loadUsers"
                    :loading="loading"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Users Table -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <q-table
                :rows="filteredUsers"
                :columns="columns"
                row-key="id"
                :loading="loading"
                :pagination="pagination"
                @request="onRequest"
                binary-state-sort
                flat
                bordered
              >
                <!-- Avatar column -->
                <template #body-cell-avatar="props">
                  <q-td :props="props">
                    <q-avatar size="40px" color="primary" text-color="white">
                      <img v-if="props.row.avatar_url" :src="props.row.avatar_url" />
                      <span v-else>
                        {{ getInitials(props.row.full_name) }}
                      </span>
                    </q-avatar>
                  </q-td>
                </template>

                <!-- User info column -->
                <template #body-cell-user="props">
                  <q-td :props="props">
                    <div class="text-weight-medium">{{ props.row.full_name || 'No name' }}</div>
                    <div class="text-grey-6">{{ props.row.email }}</div>
                  </q-td>
                </template>

                <!-- Role column -->
                <template #body-cell-role="props">
                  <q-td :props="props">
                    <q-badge 
                      :color="props.row.role === 'admin' ? 'negative' : 'primary'"
                      :label="props.row.role.toUpperCase()"
                    />
                  </q-td>
                </template>

                <!-- CEFR Level column -->
                <template #body-cell-cefr_level="props">
                  <q-td :props="props">
                    <q-badge 
                      :color="getCefrColor(props.row.cefr_level)"
                      :label="props.row.cefr_level"
                    />
                  </q-td>
                </template>

                <!-- Status column -->
                <template #body-cell-is_active="props">
                  <q-td :props="props">
                    <q-badge 
                      :color="props.row.is_active ? 'positive' : 'grey'"
                      :label="props.row.is_active ? 'ACTIVE' : 'INACTIVE'"
                    />
                  </q-td>
                </template>

                <!-- Last login column -->
                <template #body-cell-last_login="props">
                  <q-td :props="props">
                    {{ formatDate(props.row.last_login) }}
                  </q-td>
                </template>

                <!-- Actions column -->
                <template #body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn-group flat>
                      <q-btn
                        flat
                        dense
                        icon="edit"
                        color="primary"
                        @click="editUser(props.row)"
                      />
                      <q-btn
                        flat
                        dense
                        icon="settings"
                        color="secondary"
                        @click="editLimits(props.row)"
                      />
                      <q-btn
                        flat
                        dense
                        :icon="props.row.is_active ? 'block' : 'check'"
                        :color="props.row.is_active ? 'negative' : 'positive'"
                        @click="toggleUserStatus(props.row)"
                      />
                    </q-btn-group>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Edit User Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Edit User</div>
        </q-card-section>

        <q-card-section class="q-gutter-md" v-if="editingUser">
          <q-input
            v-model="editForm.full_name"
            label="Full Name"
            outlined
          />
          
          <q-input
            v-model="editForm.email"
            label="Email"
            outlined
            readonly
            hint="Email cannot be changed"
          />
          
          <q-select
            v-model="editForm.role"
            :options="roleOptionsForEdit"
            label="Role"
            outlined
            emit-value
            map-options
          />
          
          <q-select
            v-model="editForm.cefr_level"
            :options="cefrOptions"
            label="CEFR Level"
            outlined
            emit-value
            map-options
          />
          
          <q-toggle
            v-model="editForm.is_active"
            label="Account Active"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showEditDialog = false"
          />
          <q-btn 
            color="primary" 
            label="Save Changes"
            :loading="updating"
            @click="updateUser"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Limits Dialog -->
    <q-dialog v-model="showLimitsDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit User Limits</div>
          <div class="text-body2 text-grey-6">
            {{ editingUser?.full_name || editingUser?.email }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model.number="limitsForm.stories_per_day"
            label="Stories per Day"
            outlined
            type="number"
            min="0"
          />
          
          <q-input
            v-model.number="limitsForm.audio_generations_per_day"
            label="Audio Generations per Day"
            outlined
            type="number"
            min="0"
          />
          
          <q-input
            v-model.number="limitsForm.vocabulary_words_limit"
            label="Vocabulary Words Limit"
            outlined
            type="number"
            min="0"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancel" 
            @click="showLimitsDialog = false"
          />
          <q-btn 
            color="primary" 
            label="Update Limits"
            :loading="updatingLimits"
            @click="updateLimits"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminGuard } from '../../composables/useAuthGuard'

const { requireAdmin } = useAdminGuard()

// Requiere acceso de administrador
requireAdmin()

// Types
interface User {
  id: string
  full_name: string
  email: string
  role: string
  cefr_level: string
  is_active: boolean
  created_at: string
  last_active: string | null
}

// State
const users = ref<User[]>([])
const loading = ref(false)
const updating = ref(false)
const updatingLimits = ref(false)
const searchQuery = ref('')
const roleFilter = ref(null)
const statusFilter = ref(null)

const showEditDialog = ref(false)
const showLimitsDialog = ref(false)
const editingUser = ref<User | null>(null)

const editForm = ref({
  full_name: '',
  email: '',
  role: 'user',
  cefr_level: 'A1',
  is_active: true
})

const limitsForm = ref({
  stories_per_day: 5,
  audio_generations_per_day: 10,
  vocabulary_words_limit: 1000
})

const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 25
})

// Options
const roleOptions = [
  { label: 'All Roles', value: null },
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const roleOptionsForEdit = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const statusOptions = [
  { label: 'All Status', value: null },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
]

const cefrOptions = [
  { label: 'A1 - Beginner', value: 'A1' },
  { label: 'A2 - Elementary', value: 'A2' },
  { label: 'B1 - Intermediate', value: 'B1' },
  { label: 'B2 - Upper Intermediate', value: 'B2' },
  { label: 'C1 - Advanced', value: 'C1' },
  { label: 'C2 - Proficiency', value: 'C2' }
]

const columns = [
  {
    name: 'avatar',
    label: '',
    field: 'avatar_url',
    align: 'center' as const,
    sortable: false
  },
  {
    name: 'user',
    label: 'User',
    field: 'full_name',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'role',
    label: 'Role',
    field: 'role',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'cefr_level',
    label: 'Level',
    field: 'cefr_level',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'is_active',
    label: 'Status',
    field: 'is_active',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'last_login',
    label: 'Last Login',
    field: 'last_login',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: '',
    align: 'center' as const,
    sortable: false
  }
]

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // Status filter
  if (statusFilter.value !== null) {
    filtered = filtered.filter(user => user.is_active === statusFilter.value)
  }

  return filtered
})

// Methods
const getInitials = (name: string) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getCefrColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': 'red',
    'A2': 'orange', 
    'B1': 'amber',
    'B2': 'green',
    'C1': 'blue',
    'C2': 'purple'
  }
  return colors[level] || 'grey'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString()
}

const loadUsers = () => {
  loading.value = true
  try {
    // TODO: Load users from Supabase
    console.log('Loading users...')
    
    // Mock data for now
    users.value = [
      {
        id: '1',
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        cefr_level: 'B1',
        is_active: true,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }
    ]
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  editForm.value = {
    full_name: user.full_name || '',
    email: user.email || '',
    role: user.role || 'user',
    cefr_level: user.cefr_level || 'A1',
    is_active: user.is_active !== false
  }
  showEditDialog.value = true
}

const updateUser = () => {
  updating.value = true
  try {
    // TODO: Update user in Supabase
    console.log('Updating user:', editingUser.value?.id, editForm.value)
    
    showEditDialog.value = false
    void loadUsers()
  } catch (error) {
    console.error('Error updating user:', error)
  } finally {
    updating.value = false
  }
}

const editLimits = (user: User) => {
  editingUser.value = user
  
  try {
    // TODO: Load user limits from Supabase
    console.log('Loading limits for user:', user.id)
    
    // Mock data
    limitsForm.value = {
      stories_per_day: 5,
      audio_generations_per_day: 10,
      vocabulary_words_limit: 1000
    }
    
    showLimitsDialog.value = true
  } catch (error) {
    console.error('Error loading user limits:', error)
  }
}

const updateLimits = () => {
  updatingLimits.value = true
  try {
    // TODO: Update user limits in Supabase
    console.log('Updating limits:', editingUser.value?.id, limitsForm.value)
    
    showLimitsDialog.value = false
  } catch (error) {
    console.error('Error updating limits:', error)
  } finally {
    updatingLimits.value = false
  }
}

const toggleUserStatus = (user: User) => {
  try {
    // TODO: Toggle user status in Supabase
    console.log('Toggling status for user:', user.id)
    
    void loadUsers()
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

const onRequest = (props: { pagination: typeof pagination.value }) => {
  pagination.value = props.pagination
  // TODO: Implement server-side pagination if needed
}

onMounted(() => {
  void loadUsers()
})
</script>

<style lang="scss" scoped>
.users-page {
  background: #f5f5f5;
  padding-top: 24px; // Añadir espacio superior entre menú y contenido
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>