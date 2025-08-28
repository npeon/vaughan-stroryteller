import { reactive, computed } from 'vue'
import { supabase } from '../services/supabase/client'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

type UserProfile = Database['public']['Tables']['profiles']['Row']

// Estado global de autenticación
const state = reactive({
  user: null as User | null,
  session: null as Session | null,
  profile: null as UserProfile | null,
  loading: true,
  error: null as AuthError | string | null,
})

// Variable para evitar múltiples inicializaciones
let initialized = false

/**
 * Composable principal para gestión de autenticación con Supabase
 * Maneja OAuth, roles (user/admin), y estado de sesión
 */
export function useAuth() {
  // Estados reactivos
  const user = computed(() => state.user)
  const session = computed(() => state.session)
  const profile = computed(() => state.profile)
  const loading = computed(() => state.loading)
  const error = computed(() => state.error)

  // Estados computados
  const isAuthenticated = computed(() => !!state.user && !!state.session)
  const isAdmin = computed(() => state.profile?.role === 'admin')
  const isUser = computed(() => state.profile?.role === 'user')

  /**
   * Inicializa el listener de autenticación una sola vez
   */
  const initialize = async () => {
    if (initialized) return
    initialized = true

    state.loading = true
    state.error = null

    try {
      // Obtener sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      // Actualizar estado inicial
      state.session = session
      state.user = session?.user || null

      // Si hay usuario, obtener perfil
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }

      // Configurar listener de cambios de autenticación
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state change:', event)
          
          state.session = session
          state.user = session?.user || null
          
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserProfile(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            clearState()
          }
        }
      )

      // Cleanup en el beforeUnmount (opcional)
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          subscription?.unsubscribe()
        })
      }

    } catch (authError) {
      console.error('❌ Auth initialization error:', authError)
      state.error = authError instanceof Error ? authError.message : String(authError)
    } finally {
      state.loading = false
    }
  }

  /**
   * Cargar perfil de usuario desde la base de datos
   */
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error loading profile:', error)
        return null
      }

      state.profile = profile
      return profile
    } catch (error) {
      console.error('❌ Profile fetch error:', error)
      return null
    }
  }

  /**
   * Limpiar estado de autenticación
   */
  const clearState = () => {
    state.user = null
    state.session = null
    state.profile = null
    state.error = null
  }

  /**
   * Iniciar sesión con Google OAuth
   */
  const signInWithGoogle = async () => {
    state.loading = true
    state.error = null

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }

      // El redirect se maneja automáticamente
      // El estado se actualizará en el callback
      
    } catch (authError) {
      console.error('❌ Google sign-in error:', authError)
      state.error = authError instanceof Error ? authError.message : String(authError)
      state.loading = false
    }
  }

  /**
   * Cerrar sesión
   */
  const signOut = async () => {
    state.loading = true
    state.error = null

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      // El estado se limpia automáticamente en el listener
      console.log('✅ Signed out successfully')
      
    } catch (authError) {
      console.error('❌ Sign out error:', authError)
      state.error = authError instanceof Error ? authError.message : String(authError)
    } finally {
      state.loading = false
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: 'user' | 'admin'): boolean => {
    return state.profile?.role === role
  }

  /**
   * Actualizar perfil de usuario
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user || !state.profile) {
      throw new Error('No authenticated user')
    }

    state.loading = true
    state.error = null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      state.profile = data
      return data
      
    } catch (updateError) {
      console.error('❌ Profile update error:', updateError)
      state.error = updateError instanceof Error ? updateError.message : String(updateError)
      throw updateError
    } finally {
      state.loading = false
    }
  }

  /**
   * Obtener límites del usuario
   */
  const getUserLimits = async () => {
    if (!state.user) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('user_limits')
        .select('*')
        .eq('user_id', state.user.id)
        .single()

      if (error) {
        console.error('❌ Error fetching user limits:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ User limits fetch error:', error)
      return null
    }
  }

  /**
   * Refrescar datos del usuario
   */
  const refreshUser = async () => {
    if (!state.user) return

    state.loading = true
    try {
      await loadUserProfile(state.user.id)
    } finally {
      state.loading = false
    }
  }

  // Inicializar al usar el composable
  void initialize()

  return {
    // Estado
    user,
    session,
    profile,
    loading,
    error,
    
    // Estados computados
    isAuthenticated,
    isAdmin,
    isUser,
    
    // Métodos
    signInWithGoogle,
    signOut,
    hasRole,
    updateProfile,
    getUserLimits,
    refreshUser,
    loadUserProfile,
    
    // Utilidades
    initialize,
  }
}