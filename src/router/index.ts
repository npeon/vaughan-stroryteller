import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Configurar guards de autenticación globales
  Router.beforeEach(async (to, from, next) => {
    // Importación dinámica para evitar dependencias circulares
    const { useAuth } = await import('../composables/useAuth');
    const { isAuthenticated, loading, profile } = useAuth();

    console.log(`🧭 Navigating to: ${to.path}`)

    // Esperar a que se complete la inicialización de auth
    if (loading.value) {
      console.log('⏳ Waiting for auth initialization...')
      // Esperar máximo 5 segundos por la inicialización
      let attempts = 0
      const maxAttempts = 50
      while (loading.value && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
    const requiredRole = to.meta.role as string | undefined

    console.log(`🔐 Auth check - Authenticated: ${isAuthenticated.value}, RequiresAuth: ${requiresAuth}, RequiresGuest: ${requiresGuest}`)

    // Rutas que requieren NO estar autenticado (guests)
    if (requiresGuest && isAuthenticated.value) {
      console.log('🏠 Already authenticated, redirecting to dashboard')
      const redirectPath = profile.value?.role === 'admin' ? '/admin' : '/dashboard'
      next(redirectPath)
      return
    }

    // Rutas que requieren autenticación
    if (requiresAuth && !isAuthenticated.value) {
      console.log('🔒 Authentication required, redirecting to login')
      next('/auth/login')
      return
    }

    // Rutas que requieren rol de administrador
    if (requiresAdmin && (!isAuthenticated.value || profile.value?.role !== 'admin')) {
      console.log('👮 Admin access denied')
      if (!isAuthenticated.value) {
        next('/auth/login')
      } else {
        next('/dashboard') // Usuario autenticado pero no admin
      }
      return
    }

    // Rutas con rol específico requerido
    if (requiredRole && isAuthenticated.value && profile.value?.role !== requiredRole) {
      console.log(`🚫 Role '${requiredRole}' required, user has '${profile.value?.role}'`)
      const redirectPath = profile.value?.role === 'admin' ? '/admin' : '/dashboard'
      next(redirectPath)
      return
    }

    // Permitir navegación
    next()
  })

  // Logging de navegación en desarrollo
  if (process.env.NODE_ENV === 'development') {
    Router.afterEach((to, from) => {
      console.log(`✅ Navigated from ${from.path} to ${to.path}`)
    })
  }

  return Router;
});
