import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'

/**
 * Composable para guards de autenticación
 * Maneja redirecciones automáticas basadas en estado de auth
 */
export function useAuthGuard() {
  const router = useRouter()
  const { isAuthenticated, loading, profile } = useAuth()

  /**
   * Requiere que el usuario esté autenticado
   * Redirige al login si no está autenticado
   */
  const requireAuth = (redirectTo: string = '/auth/login') => {
    watch(
      [isAuthenticated, loading],
      ([authenticated, isLoading]) => {
        if (!isLoading && !authenticated) {
          console.log('🔒 Auth required - redirecting to:', redirectTo)
          void router.push(redirectTo)
        }
      },
      { immediate: true }
    )

    return isAuthenticated
  }

  /**
   * Requiere que el usuario NO esté autenticado
   * Redirige al dashboard si ya está autenticado
   */
  const requireGuest = (redirectTo: string = '/dashboard') => {
    watch(
      [isAuthenticated, loading],
      ([authenticated, isLoading]) => {
        if (!isLoading && authenticated) {
          console.log('🏠 Already authenticated - redirecting to:', redirectTo)
          void router.push(redirectTo)
        }
      },
      { immediate: true }
    )

    return computed(() => !isAuthenticated.value)
  }

  /**
   * Redirigir basado en rol después de login
   */
  const redirectByRole = () => {
    watch(
      [profile, loading],
      ([userProfile, isLoading]) => {
        if (!isLoading && userProfile) {
          const redirectPath = userProfile.role === 'admin' ? '/admin' : '/dashboard'
          console.log('👤 Redirecting by role:', userProfile.role, '→', redirectPath)
          void router.push(redirectPath)
        }
      },
      { immediate: true }
    )
  }

  return {
    requireAuth,
    requireGuest,
    redirectByRole,
    
    // Estados para templates
    isAuthenticated,
    loading,
  }
}

/**
 * Composable específico para guards de administrador
 */
export function useAdminGuard() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, loading, profile } = useAuth()

  /**
   * Requiere que el usuario sea administrador
   * Redirige si no es admin o no está autenticado
   */
  const requireAdmin = (
    unauthorizedRedirect: string = '/dashboard',
    unauthenticatedRedirect: string = '/auth/login'
  ) => {
    watch(
      [isAuthenticated, isAdmin, loading, profile],
      ([authenticated, admin, isLoading, userProfile]) => {
        if (isLoading) return

        if (!authenticated) {
          console.log('🔒 Admin access requires authentication - redirecting to:', unauthenticatedRedirect)
          void router.push(unauthenticatedRedirect)
          return
        }

        if (authenticated && userProfile && !admin) {
          console.log('🚫 Admin access denied for role:', userProfile.role, '- redirecting to:', unauthorizedRedirect)
          void router.push(unauthorizedRedirect)
          return
        }

        if (authenticated && admin) {
          console.log('✅ Admin access granted')
        }
      },
      { immediate: true }
    )

    return computed(() => isAuthenticated.value && isAdmin.value)
  }

  /**
   * Verifica si el usuario puede acceder a funciones de admin
   */
  const canAccessAdmin = computed(() => {
    return isAuthenticated.value && isAdmin.value
  })

  return {
    requireAdmin,
    canAccessAdmin,
    
    // Estados para templates  
    isAdmin,
    isAuthenticated,
    loading,
  }
}

/**
 * Hook para rutas que requieren roles específicos
 */
export function useRoleGuard() {
  const router = useRouter()
  const { isAuthenticated, profile, loading } = useAuth()

  /**
   * Requiere un rol específico
   */
  const requireRole = (
    requiredRole: 'user' | 'admin',
    unauthorizedRedirect: string = '/dashboard',
    unauthenticatedRedirect: string = '/auth/login'
  ) => {
    watch(
      [isAuthenticated, profile, loading],
      ([authenticated, userProfile, isLoading]) => {
        if (isLoading) return

        if (!authenticated) {
          console.log(`🔒 Role '${requiredRole}' requires authentication - redirecting to:`, unauthenticatedRedirect)
          void router.push(unauthenticatedRedirect)
          return
        }

        if (authenticated && userProfile && userProfile.role !== requiredRole) {
          console.log(`🚫 Role '${requiredRole}' required, user has '${userProfile.role}' - redirecting to:`, unauthorizedRedirect)
          void router.push(unauthorizedRedirect)
          return
        }

        if (authenticated && userProfile?.role === requiredRole) {
          console.log(`✅ Role '${requiredRole}' access granted`)
        }
      },
      { immediate: true }
    )

    return computed(() => {
      return isAuthenticated.value && profile.value?.role === requiredRole
    })
  }

  return {
    requireRole,
    
    // Estados para templates
    isAuthenticated,
    profile,
    loading,
  }
}