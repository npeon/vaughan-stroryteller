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

  // Estados computados - isAuthenticated solo requiere user y session
  // El profile puede ser null temporalmente sin afectar la autenticación básica
  const isAuthenticated = computed(() => !!state.user && !!state.session)
  const isAdmin = computed(() => state.profile?.role === 'admin')
  const isUser = computed(() => state.profile?.role === 'user')
  const hasProfile = computed(() => !!state.profile)

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
   * Con fallback para crear perfil si no existe
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
        
        // Si el error es que no existe el perfil, intentar crearlo
        if (error.code === 'PGRST116') {
          console.log('⚠️ Profile not found, attempting to create one...')
          return await createUserProfile(userId)
        }
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
   * Crear perfil de usuario si no existe
   */
  const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return null

      const profileData = {
        id: userId,
        full_name: user.user.user_metadata?.full_name || user.user.email?.split('@')[0] || 'User',
        email: user.user.email,
        cefr_level: 'A1', // Nivel por defecto
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating profile:', error)
        return null
      }

      console.log('✅ Profile created successfully:', newProfile)
      state.profile = newProfile
      return newProfile
    } catch (error) {
      console.error('❌ Profile creation error:', error)
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
   * Validaciones de seguridad
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.toLowerCase().trim())
  }

  const validatePasswordStrength = (password: string): boolean => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasNonConsecutive = !/(.)\1{2,}/.test(password)
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonConsecutive
  }

  // Type guard para verificar si un error tiene una propiedad message
  const hasErrorMessage = (error: unknown): error is { message: string } => {
    return typeof error === 'object' && error !== null && 'message' in error
  }

  const getAuthErrorMessage = (error: unknown): string => {
    const errorMessages: Record<string, string> = {
      'Email not confirmed': 'Por favor confirma tu email antes de iniciar sesión',
      'Invalid credentials': 'Credenciales incorrectas',
      'Invalid login credentials': 'Credenciales incorrectas',
      'User already registered': 'Esta dirección de email ya está registrada',
      'User not found': 'Usuario no encontrado',
      'Email rate limit exceeded': 'Demasiados intentos. Inténtalo más tarde.',
      'Too many requests': 'Demasiados intentos. Inténtalo más tarde.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres'
    }

    const message = hasErrorMessage(error) ? error.message : String(error)
    return errorMessages[message] || 'Error de autenticación. Inténtalo de nuevo.'
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  const signInWithEmail = async (email: string, password: string) => {
    // Validaciones de entrada
    if (!validateEmail(email)) {
      throw new Error('Invalid email format')
    }

    if (!validatePasswordStrength(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, numbers')
    }

    state.loading = true
    state.error = null

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        throw error
      }

      // La autenticación exitosa se maneja automáticamente por el listener onAuthStateChange
      // No necesitamos actualizar el estado manualmente aquí
      return data

    } catch (authError) {
      console.error('❌ Email sign-in error:', authError)
      state.error = getAuthErrorMessage(authError)
      throw authError
    } finally {
      state.loading = false
    }
  }

  /**
   * Registrar usuario con email y contraseña
   */
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    // Validaciones de entrada
    if (!validateEmail(email)) {
      throw new Error('Invalid email format')
    }

    if (!validatePasswordStrength(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, numbers')
    }

    if (!fullName || fullName.trim().length < 3) {
      throw new Error('Full name must be at least 3 characters')
    }

    state.loading = true
    state.error = null

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      })

      if (error) {
        throw error
      }

      // El perfil se crea automáticamente por el trigger handle_new_user()
      // Si hay sesión, cargar el perfil
      if (data.session?.user) {
        await loadUserProfile(data.session.user.id)
      }

      return data

    } catch (authError) {
      console.error('❌ Email sign-up error:', authError)
      state.error = getAuthErrorMessage(authError)
      throw authError
    } finally {
      state.loading = false
    }
  }

  /**
   * Restablecer contraseña por email
   */
  const resetPassword = async (email: string) => {
    // Validación de entrada
    if (!validateEmail(email)) {
      throw new Error('Invalid email format')
    }

    state.loading = true
    state.error = null

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )

      if (error) {
        throw error
      }

      console.log('✅ Password reset email sent successfully')

    } catch (authError) {
      console.error('❌ Password reset error:', authError)
      state.error = getAuthErrorMessage(authError)
      throw authError
    } finally {
      state.loading = false
    }
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
    hasProfile,
    
    // Métodos
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
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