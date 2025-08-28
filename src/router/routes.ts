import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // Auth routes
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { requiresGuest: true },
      },
      {
        path: 'callback',
        name: 'auth-callback',
        component: () => import('pages/auth/CallbackPage.vue'),
      },
    ],
  },

  // Protected user routes
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true, role: 'user' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'stories',
        name: 'stories',
        component: () => import('pages/StoriesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'vocabulary',
        name: 'vocabulary',
        component: () => import('pages/VocabularyPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('pages/admin/AdminDashboardPage.vue'),
        meta: { requiresAuth: true, role: 'admin' },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('pages/admin/UsersPage.vue'),
        meta: { requiresAuth: true, role: 'admin' },
      },
      {
        path: 'banners',
        name: 'admin-banners',
        component: () => import('pages/admin/BannersPage.vue'),
        meta: { requiresAuth: true, role: 'admin' },
      },
      {
        path: 'api-health',
        name: 'admin-api-health',
        component: () => import('pages/admin/ApiHealthPage.vue'),
        meta: { requiresAuth: true, role: 'admin' },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
