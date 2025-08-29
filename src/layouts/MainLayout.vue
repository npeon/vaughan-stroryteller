<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header with Prime Admin styling -->
    <q-header bordered class="prime-header">
      <q-toolbar class="prime-toolbar">
        <!-- Menu Button -->
        <q-btn
          dense
          flat
          round
          icon="menu"
          color="white"
          @click="toggleLeftDrawer"
          class="menu-btn"
          no-caps
        />

        <!-- Logo and Brand -->
        <q-toolbar-title class="brand-section">
          <div class="brand-logo">
            <q-icon name="auto_stories" size="28px" color="white" />
          </div>
          <span class="brand-text">Vaughan Storyteller</span>
        </q-toolbar-title>

        <!-- User Menu -->
        <div class="user-section" v-if="isAuthenticated">
          <!-- User Info -->
          <div class="user-info">
            <div class="user-name">{{ profile?.full_name || 'User' }}</div>
            <div class="user-level">{{ profile?.cefr_level || 'A1' }}</div>
          </div>

          <!-- User Avatar & Dropdown -->
          <q-btn-dropdown
            flat
            round
            class="user-dropdown"
            dropdown-icon="none"
          >
            <template #label>
              <q-avatar size="36px" class="user-avatar" color="primary" text-color="white">
                <img :src="profile?.avatar_url" v-if="profile?.avatar_url" />
                <q-icon name="person" v-else />
              </q-avatar>
            </template>

            <q-list class="user-menu">
              <!-- Profile -->
              <q-item clickable v-close-popup @click="router.push('/dashboard/profile')">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Profile</q-item-label>
                </q-item-section>
              </q-item>

              <!-- Settings (if admin) -->
              <q-item clickable v-close-popup @click="router.push('/admin')" v-if="isAdmin">
                <q-item-section avatar>
                  <q-icon name="admin_panel_settings" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Admin Panel</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Logout -->
              <q-item clickable v-close-popup @click="handleLogout" class="logout-item">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sign Out</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Left Drawer with Navigation -->
    <q-drawer v-model="leftDrawerOpen" side="left" behavior="mobile" bordered class="prime-drawer">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="drawer-brand">
          <q-icon name="auto_stories" size="24px" color="indigo-6" />
          <span class="drawer-brand-text">Vaughan Storyteller</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <q-list class="navigation-menu">
        <!-- Dashboard -->
        <q-item
          clickable
          :active="route.name === 'dashboard'"
          @click="router.push('/dashboard')"
          class="nav-item"
          active-class="nav-item--active"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Stories -->
        <q-item
          clickable
          :active="route.name === 'stories'"
          @click="router.push('/dashboard/stories')"
          class="nav-item"
          active-class="nav-item--active"
        >
          <q-item-section avatar>
            <q-icon name="menu_book" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Stories</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Vocabulary -->
        <q-item
          clickable
          :active="route.name === 'vocabulary'"
          @click="router.push('/dashboard/vocabulary')"
          class="nav-item"
          active-class="nav-item--active"
        >
          <q-item-section avatar>
            <q-icon name="translate" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Vocabulary</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Profile -->
        <q-item
          clickable
          :active="route.name === 'profile'"
          @click="router.push('/dashboard/profile')"
          class="nav-item"
          active-class="nav-item--active"
        >
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Profile</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Admin Section (if admin) -->
        <template v-if="isAdmin">
          <q-separator class="q-my-md" />
          <q-item-label header class="text-grey-6 text-weight-medium text-uppercase">
            Administration
          </q-item-label>
          
          <q-item
            clickable
            :active="route.path.startsWith('/admin')"
            @click="router.push('/admin')"
            class="nav-item"
            active-class="nav-item--active"
          >
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Admin Panel</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '../composables/useAuth'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// Auth composable
const { 
  profile, 
  isAuthenticated, 
  isAdmin, 
  signOut 
} = useAuth()

// Layout state
const leftDrawerOpen = ref<boolean>(false)

// Methods
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const handleLogout = async () => {
  try {
    await signOut()
    
    $q.notify({
      type: 'positive',
      message: 'Successfully signed out',
      position: 'top',
      timeout: 3000
    })
    
    // Redirect to login
    await router.push('/auth/login')
    
  } catch (error) {
    console.error('❌ Logout error:', error)
    $q.notify({
      type: 'negative',
      message: 'Error signing out. Please try again.',
      position: 'top',
      timeout: 3000
    })
  }
}
</script>

<style lang="scss" scoped>
// ===== PRIME ADMIN MAIN LAYOUT STYLES =====

// Using CSS custom properties from app.scss - no need to redeclare

// ===== HEADER STYLES =====
.prime-header {
  background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-sm);
}

.prime-toolbar {
  height: 64px;
  padding: 0 24px;
  min-height: 64px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
}

.menu-btn {
  margin-right: 16px;
  transition: all 0.2s ease;
  background-color: transparent !important;
  
  // Force transparent background on ALL states
  &,
  &:hover,
  &:focus,
  &:active,
  &.q-btn--active,
  &.q-hoverable:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  // Remove pseudo-element backgrounds
  &:before,
  &:hover:before,
  &:focus:before,
  &:active:before {
    background-color: transparent !important;
    display: none !important;
  }
}

// ===== BRAND SECTION =====
.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  letter-spacing: -0.025em;
  
  @media (max-width: 640px) {
    display: none;
  }
}

// ===== USER SECTION =====
.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.user-level {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.2;
}

.user-dropdown {
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  // Keep the icon properly centered but with original size
  .q-icon {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
}

// ===== USER MENU DROPDOWN =====
.user-menu {
  min-width: 200px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--prime-grey-200);
  
  .q-item {
    padding: 12px 16px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--prime-grey-50);
    }
    
    .q-item-section--avatar {
      min-width: 32px;
    }
    
    .q-icon {
      font-size: 18px;
      color: var(--prime-grey-600);
    }
    
    .q-item-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--prime-grey-700);
    }
  }
  
  .logout-item {
    &:hover {
      background-color: #fef2f2;
      
      .q-icon {
        color: #dc2626;
      }
      
      .q-item-label {
        color: #dc2626;
      }
    }
  }
}

// ===== DRAWER STYLES =====
.prime-drawer {
  width: 280px;
  background-color: white;
  border-right: 1px solid var(--prime-grey-200);
  
  @media (max-width: 768px) {
    width: 260px;
  }
}

// ===== DRAWER HEADER =====
.drawer-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--prime-grey-200);
  background: white;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
  }
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-brand-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--prime-grey-900);
  letter-spacing: -0.025em;
}

// ===== NAVIGATION MENU =====
.navigation-menu {
  padding: 16px 0;
  
  .q-item-label--header {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 16px 20px 8px 20px;
  }
}

.nav-item {
  margin: 2px 12px;
  border-radius: var(--radius-md);
  padding: 12px 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background-color: var(--prime-grey-50);
    transform: translateX(2px);
  }
  
  .q-item-section--avatar {
    min-width: 32px;
  }
  
  .q-icon {
    font-size: 20px;
    color: var(--prime-grey-500);
    transition: color 0.2s ease;
  }
  
  .q-item-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--prime-grey-700);
    transition: color 0.2s ease;
  }
  
  // Active state
  &.nav-item--active {
    background: linear-gradient(135deg, var(--prime-primary) 0%, var(--prime-secondary) 100%);
    color: white;
    box-shadow: var(--shadow-sm);
    
    .q-icon {
      color: white;
    }
    
    .q-item-label {
      color: white;
      font-weight: 600;
    }
    
    &:hover {
      transform: translateX(4px);
      box-shadow: var(--shadow-md);
    }
  }
}

// ===== RESPONSIVE DESIGN =====
@media (max-width: 1024px) {
  .prime-toolbar {
    height: 56px;
    min-height: 56px;
  }
  
  .brand-logo {
    width: 36px;
    height: 36px;
  }
  
  .brand-text {
    font-size: 1.125rem;
  }
  
  .user-avatar {
    width: 32px !important;
    height: 32px !important;
  }
}

@media (max-width: 768px) {
  .drawer-header {
    padding: 20px 16px;
  }
  
  .drawer-brand-text {
    font-size: 1rem;
  }
  
  .navigation-menu {
    padding: 12px 0;
  }
  
  .nav-item {
    margin: 2px 8px;
    padding: 10px 12px;
  }
  
  .q-item-label--header {
    padding: 12px 16px 6px 16px;
  }
}

@media (max-width: 640px) {
  .prime-toolbar {
    height: 56px;
  }
  
  .brand-logo {
    width: 32px;
    height: 32px;
    
    .q-icon {
      font-size: 20px;
    }
  }
  
  .user-dropdown .user-avatar {
    width: 28px !important;
    height: 28px !important;
  }
}

// ===== DARK MODE SUPPORT =====
@media (prefers-color-scheme: dark) {
  .prime-drawer {
    background-color: var(--prime-grey-900);
    border-color: var(--prime-grey-800);
  }
  
  .drawer-header {
    background: linear-gradient(135deg, var(--prime-grey-800) 0%, var(--prime-grey-900) 100%);
    border-color: var(--prime-grey-800);
  }
  
  .drawer-brand-text {
    color: var(--prime-grey-100);
  }
  
  .nav-item {
    &:hover {
      background-color: var(--prime-grey-800);
    }
    
    .q-icon {
      color: var(--prime-grey-400);
    }
    
    .q-item-label {
      color: var(--prime-grey-300);
    }
  }
  
  .user-menu {
    background-color: var(--prime-grey-800);
    border-color: var(--prime-grey-700);
    
    .q-item {
      &:hover {
        background-color: var(--prime-grey-700);
      }
      
      .q-icon {
        color: var(--prime-grey-400);
      }
      
      .q-item-label {
        color: var(--prime-grey-300);
      }
    }
  }
}

// ===== BUTTON OVERRIDES =====
// Nuclear approach to eliminate all backgrounds
.prime-header .q-toolbar .q-btn.menu-btn {
  // Menu button gets subtle hover effect
  &:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  &::before,
  &::after,
  &:focus::before,
  &:active::before {
    display: none !important;
  }
}

// EXACT targeting based on browser inspector
button.q-btn.q-btn-dropdown.user-dropdown {
  // Force no backgrounds at all
  background: none !important;
  background-color: transparent !important;
  
  // Target the exact focus helper that's causing the problem
  .q-focus-helper {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    background: none !important;
    background-color: transparent !important;
  }
  
  // Target dropdown arrow
  .q-btn-dropdown__arrow,
  .q-btn-dropdown__arrow-container {
    display: none !important;
    visibility: hidden !important;
  }
  
  // All hover states
  &:hover,
  &.q-hoverable:hover {
    background: none !important;
    background-color: transparent !important;
    
    .q-focus-helper {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      background: none !important;
      background-color: transparent !important;
    }
  }
}

// Ultra-specific targeting with data attribute
button[data-v-22686b16].q-btn-dropdown.user-dropdown {
  background: transparent !important;
  
  .q-focus-helper {
    display: none !important;
  }
  
  &:hover .q-focus-helper {
    display: none !important;
    background: transparent !important;
  }
}

// ===== ACCESSIBILITY =====
.nav-item:focus-visible,
.menu-btn:focus-visible,
.user-dropdown:focus-visible {
  outline: 2px solid var(--prime-indigo);
  outline-offset: 2px;
}

// ===== ANIMATIONS =====
.nav-item,
.user-dropdown,
.menu-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

// ===== LOADING STATES =====
.user-section.loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>
