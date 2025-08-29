<template>
  <div class="banner-manager">
    <!-- Header Section -->
    <div class="manager-header">
      <div class="header-content">
        <h2 class="header-title">
          <q-icon name="campaign" size="28px" class="q-mr-sm" />
          Banner Management
        </h2>
        <p class="header-subtitle">
          Manage promotional banners and advertisements across the platform
        </p>
      </div>

      <div class="header-actions">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Create Banner"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <q-card class="stat-card">
        <q-card-section class="stat-content">
          <div class="stat-value">{{ bannerStats.total }}</div>
          <div class="stat-label">Total Banners</div>
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section class="stat-content">
          <div class="stat-value">{{ bannerStats.active }}</div>
          <div class="stat-label">Active Banners</div>
          <q-icon name="visibility" class="stat-icon" color="positive" />
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section class="stat-content">
          <div class="stat-value">{{ bannerStats.totalImpressions.toLocaleString() }}</div>
          <div class="stat-label">Total Impressions</div>
          <q-icon name="visibility" class="stat-icon" color="info" />
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section class="stat-content">
          <div class="stat-value">{{ bannerStats.averageCtr.toFixed(2) }}%</div>
          <div class="stat-label">Average CTR</div>
          <q-icon name="mouse" class="stat-icon" color="warning" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Filters -->
    <q-card class="filters-card">
      <q-card-section>
        <div class="filters-row">
          <q-select
            v-model="selectedLocation"
            :options="locationOptions"
            label="Filter by Location"
            outlined
            clearable
            dense
            style="width: 200px"
          />
          
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            label="Filter by Status"
            outlined
            clearable
            dense
            style="width: 200px"
          />

          <q-input
            v-model="searchQuery"
            label="Search banners..."
            outlined
            dense
            clearable
            style="width: 300px"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-space />

          <q-btn
            flat
            dense
            round
            icon="refresh"
            @click="loadBanners"
            :loading="isLoading"
          >
            <q-tooltip>Refresh</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- Banners List -->
    <q-card class="banners-card">
      <q-card-section class="banners-header">
        <div class="section-title">
          <q-icon name="list" size="20px" class="q-mr-sm" />
          Banners ({{ filteredBanners.length }})
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="banners-content">
        <div v-if="isLoading" class="loading-state">
          <q-spinner-dots size="40px" color="primary" />
          <p>Loading banners...</p>
        </div>

        <div v-else-if="filteredBanners.length === 0" class="empty-state">
          <q-icon name="campaign" size="64px" color="grey-4" />
          <h3>No banners found</h3>
          <p>Create your first banner to get started</p>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Create Banner"
            @click="showCreateDialog = true"
          />
        </div>

        <div v-else class="banners-list">
          <BannerCard
            v-for="banner in filteredBanners"
            :key="banner.id"
            :banner="banner"
            @edit="editBanner"
            @delete="confirmDelete"
            @toggle-status="toggleStatus"
            @track-impression="trackBannerImpression"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Create/Edit Dialog -->
    <q-dialog 
      v-model="showCreateDialog" 
      persistent
      maximized
    >
      <BannerEditor
        :banner="selectedBanner"
        @save="handleSave"
        @cancel="closeEditor"
      />
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete_forever" color="negative" text-color="white" />
          <span class="q-ml-sm">
            Are you sure you want to delete this banner? This action cannot be undone.
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDeleteConfirm = false" />
          <q-btn 
            unelevated 
            color="negative" 
            label="Delete" 
            @click="handleDelete"
            :loading="isDeleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Error Alert -->
    <q-banner 
      v-if="error" 
      class="error-banner"
      color="negative"
      text-color="white"
      icon="error"
      rounded
    >
      <template #action>
        <q-btn flat round dense icon="close" @click="error = null" />
      </template>
      {{ error }}
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBannerManagement } from '../../composables/useBannerManagement';
import BannerCard from './BannerCard.vue';
import BannerEditor from './BannerEditor.vue';
import type { Banner } from '../../composables/useBannerManagement';

// Composables
const {
  banners,
  isLoading,
  error,
  bannerStats,
  loadBanners,
  deleteBanner,
  toggleBannerStatus,
  trackBannerImpression
} = useBannerManagement();

// Local state
const showCreateDialog = ref(false);
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);
const selectedBanner = ref<Banner | null>(null);
const bannerToDelete = ref<Banner | null>(null);

// Filters
const selectedLocation = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);
const searchQuery = ref('');

// Options
const locationOptions = [
  { label: 'Header', value: 'header' },
  { label: 'Sidebar', value: 'sidebar' },
  { label: 'Story End', value: 'story_end' },
  { label: 'Dashboard', value: 'dashboard' }
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

// Computed
const filteredBanners = computed(() => {
  let filtered = [...banners.value];

  // Filter by location
  if (selectedLocation.value) {
    filtered = filtered.filter(banner => banner.display_location === selectedLocation.value);
  }

  // Filter by status
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active';
    filtered = filtered.filter(banner => banner.is_active === isActive);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(banner => 
      banner.title.toLowerCase().includes(query) ||
      (banner.description?.toLowerCase().includes(query)) ||
      banner.display_location.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Methods
const editBanner = (banner: Banner) => {
  selectedBanner.value = banner;
  showCreateDialog.value = true;
};

const confirmDelete = (banner: Banner) => {
  bannerToDelete.value = banner;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (!bannerToDelete.value) return;

  try {
    isDeleting.value = true;
    const success = await deleteBanner(bannerToDelete.value.id);
    
    if (success) {
      showDeleteConfirm.value = false;
      bannerToDelete.value = null;
    }
  } finally {
    isDeleting.value = false;
  }
};

const toggleStatus = async (banner: Banner) => {
  await toggleBannerStatus(banner.id);
};

const handleSave = () => {
  showCreateDialog.value = false;
  selectedBanner.value = null;
  void loadBanners(); // Refresh the list
};

const closeEditor = () => {
  showCreateDialog.value = false;
  selectedBanner.value = null;
};

// Lifecycle
onMounted(() => {
  void loadBanners();
});
</script>

<style lang="scss" scoped>
.banner-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--q-separator-color);

  .header-content {
    .header-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--q-primary);
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
    }

    .header-subtitle {
      font-size: 16px;
      color: var(--q-color-grey-7);
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      padding: 20px;

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--q-primary);
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: var(--q-color-grey-7);
        margin-top: 4px;
      }

      .stat-icon {
        position: absolute;
        top: 16px;
        right: 16px;
        opacity: 0.6;
      }
    }
  }
}

.filters-card {
  margin-bottom: 24px;

  .filters-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
}

.banners-card {
  .banners-header {
    padding: 16px 24px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--q-primary);
      display: flex;
      align-items: center;
    }
  }

  .banners-content {
    min-height: 300px;

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;

      h3 {
        margin: 16px 0 8px 0;
        color: var(--q-color-grey-7);
      }

      p {
        margin: 0 0 24px 0;
        color: var(--q-color-grey-6);
      }
    }

    .banners-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      padding: 4px;
    }
  }
}

.error-banner {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// Responsive
@media (max-width: 768px) {
  .banner-manager {
    padding: 16px;
  }

  .manager-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;

    .q-input,
    .q-select {
      width: 100% !important;
    }
  }

  .banners-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>