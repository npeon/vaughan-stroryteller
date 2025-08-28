<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-icon name="admin_panel_settings" class="q-mr-sm" />
          Admin Panel
        </q-toolbar-title>

        <q-space />

        <!-- User Menu -->
        <q-btn-dropdown
          flat
          :label="profile?.full_name || 'Admin'"
          icon="account_circle"
        >
          <q-list>
            <q-item clickable v-close-popup @click="goToProfile">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Profile</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="goToUserDashboard">
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>
                <q-item-label>User Dashboard</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item clickable v-close-popup @click="handleSignOut">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Sign Out</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="admin-drawer"
    >
      <q-list>
        <!-- Dashboard -->
        <q-item
          clickable
          :active="router.currentRoute.value.name === 'admin-dashboard'"
          @click="goToDashboard"
          v-ripple
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
            <q-item-label caption>Overview & stats</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- User Management -->
        <q-item
          clickable
          :active="router.currentRoute.value.name === 'admin-users'"
          @click="goToUsers"
          v-ripple
        >
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Users</q-item-label>
            <q-item-label caption>Manage users & limits</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Banner Management -->
        <q-item
          clickable
          :active="router.currentRoute.value.name === 'admin-banners'"
          @click="goToBanners"
          v-ripple
        >
          <q-item-section avatar>
            <q-icon name="campaign" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Banners</q-item-label>
            <q-item-label caption>Ad banner management</q-item-label>
          </q-item-section>
        </q-item>

        <!-- API Health -->
        <q-item
          clickable
          :active="router.currentRoute.value.name === 'admin-api-health'"
          @click="goToApiHealth"
          v-ripple
        >
          <q-item-section avatar>
            <q-icon name="monitor_heart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>API Health</q-item-label>
            <q-item-label caption>Monitor external APIs</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- Quick Actions -->
        <q-item-label header class="text-grey-8">Quick Actions</q-item-label>
        
        <q-item clickable @click="refreshData" v-ripple>
          <q-item-section avatar>
            <q-icon name="refresh" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Refresh Data</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAdminGuard } from '../composables/useAuthGuard'

const router = useRouter()
const { profile, signOut } = useAuth()
const { requireAdmin } = useAdminGuard()

// Requiere acceso de administrador
requireAdmin()

const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const goToProfile = () => {
  void router.push('/dashboard/profile')
}

const goToUserDashboard = () => {
  void router.push('/dashboard')
}

const handleSignOut = async () => {
  try {
    await signOut()
    void router.push('/auth/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const goToDashboard = () => {
  void router.push('/admin')
}

const goToUsers = () => {
  void router.push('/admin/users')
}

const goToBanners = () => {
  void router.push('/admin/banners')
}

const goToApiHealth = () => {
  void router.push('/admin/api-health')
}

const refreshData = () => {
  // TODO: Implement data refresh
  console.log('Refreshing admin data...')
}
</script>

<style lang="scss" scoped>
.admin-drawer {
  .q-item {
    border-radius: 0 25px 25px 0;
    margin-right: 12px;
    
    &.q-item--active {
      background: rgba($primary, 0.1);
      color: $primary;
    }
  }
}
</style>