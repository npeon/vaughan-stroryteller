import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '../../../../../src/types/supabase'

type UserProfile = Database['public']['Tables']['profiles']['Row']

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      single: vi.fn(),
      update: vi.fn(() => mockQuery),
    }
    return mockQuery
  }),
}

// Mock de datos de prueba
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
}

const mockUserProfile: UserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  role: 'user',
  cefr_level: 'B2',
  is_active: true,
  last_active: '2024-01-01T00:00:00Z',
  stories_completed: 5,
  streak_days: 3,
  vocabulary_mastered: 100,
  preferences: { theme: 'light', language: 'es', notifications: true },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockAdminProfile: UserProfile = {
  ...mockUserProfile,
  id: 'admin-123',
  email: 'admin@example.com',
  role: 'admin'
}

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() / 1000 + 3600,
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser
}

// Mock Supabase module
vi.mock('../../../../../src/services/supabase/client', () => ({
  supabase: mockSupabaseClient
}))

describe('useAuth Composable', () => {
  // Dynamic import to get fresh instance for each test
  let useAuth: any
  let mockSubscription: any

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup default mock implementations
    mockSubscription = {
      unsubscribe: vi.fn()
    }

    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription }
    })

    // Reset module cache to get fresh state
    vi.resetModules()
    
    // Dynamic import after reset
    const module = await import('../../../../../src/composables/useAuth')
    useAuth = module.useAuth
  })

  afterEach(() => {
    // Cleanup any global state
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with loading state true', async () => {
      // Arrange - Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      // Act
      const { loading } = useAuth()

      // Assert
      expect(loading.value).toBe(true)
    })

    it('should load existing session on initialization', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
      
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      // Act
      const { user, session, profile, loading } = useAuth()

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100))

      // Assert
      expect(user.value).toEqual(mockUser)
      expect(session.value).toEqual(mockSession)
      expect(profile.value).toEqual(mockUserProfile)
      expect(loading.value).toBe(false)
    })

    it('should handle initialization errors gracefully', async () => {
      // Arrange
      const authError = new Error('Failed to get session')
      mockSupabaseClient.auth.getSession.mockRejectedValue(authError)

      // Act
      const { error, loading } = useAuth()

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100))

      // Assert
      expect(error.value).toBe(authError.message)
      expect(loading.value).toBe(false)
    })
  })

  describe('Authentication State Management', () => {
    beforeEach(async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })
    })

    it('should correctly compute isAuthenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
      
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      // Act
      const { isAuthenticated } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Assert
      expect(isAuthenticated.value).toBe(true)
    })

    it('should correctly identify admin users', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { ...mockSession, user: { ...mockUser, id: 'admin-123' } } },
        error: null
      })
      
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockAdminProfile,
        error: null
      })

      // Act
      const { isAdmin, isUser } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Assert
      expect(isAdmin.value).toBe(true)
      expect(isUser.value).toBe(false)
    })

    it('should correctly identify regular users', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
      
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      // Act
      const { isAdmin, isUser } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Assert
      expect(isAdmin.value).toBe(false)
      expect(isUser.value).toBe(true)
    })

    it('should update state when auth state changes', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      let authChangeCallback: any

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authChangeCallback = callback
        return { data: { subscription: mockSubscription } }
      })

      // Act
      const { user, session, isAuthenticated } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50))

      // Initially not authenticated
      expect(isAuthenticated.value).toBe(false)

      // Simulate sign in
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      authChangeCallback('SIGNED_IN', mockSession)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Assert - should be authenticated
      expect(user.value).toEqual(mockUser)
      expect(session.value).toEqual(mockSession)
      expect(isAuthenticated.value).toBe(true)
    })
  })

  describe('Google OAuth Integration', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })
    })

    it('should call signInWithOAuth with correct Google parameters', async () => {
      // Arrange
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: {},
        error: null
      })

      const { signInWithGoogle } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50))

      // Act
      await signInWithGoogle()

      // Assert
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })

    it('should handle OAuth errors', async () => {
      // Arrange
      const oauthError = {
        name: 'AuthError',
        message: 'OAuth provider error',
        status: 400,
        code: 'oauth_error',
        __isAuthError: true
      } as unknown as AuthError

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: {},
        error: oauthError
      })

      const { signInWithGoogle, error, loading } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50))

      // Act
      await signInWithGoogle()

      // Assert
      expect(error.value).toBe(oauthError.message)
      expect(loading.value).toBe(false)
    })

    it('should set loading state during OAuth process', async () => {
      // Arrange
      let resolveOAuth: any
      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveOAuth = resolve
        })
      })

      const { signInWithGoogle, loading } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Initially not loading auth action
      const initialLoading = loading.value

      // Act - start OAuth
      const oauthPromise = signInWithGoogle()

      // Assert - should be loading
      expect(loading.value).toBe(true)

      // Complete OAuth
      resolveOAuth({ data: {}, error: null })
      await oauthPromise

      // Should not change loading back to false since OAuth redirects
      expect(loading.value).toBe(true)
    })
  })

  describe('Profile Management', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })
    })

    it('should load user profile after authentication', async () => {
      // Arrange
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      const { loadUserProfile, profile } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50))

      // Act
      const result = await loadUserProfile('user-123')

      // Assert
      expect(result).toEqual(mockUserProfile)
      expect(profile.value).toEqual(mockUserProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle profile loading errors', async () => {
      // Arrange
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Profile not found')
      })

      const { loadUserProfile, profile } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50))

      // Act
      const result = await loadUserProfile('user-123')

      // Assert
      expect(result).toBeNull()
      expect(profile.value).toBeNull()
    })

    it('should update profile correctly', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const updatedProfile = { ...mockUserProfile, full_name: 'Updated Name' }
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: updatedProfile,
        error: null
      })

      const { updateProfile, profile } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Act
      const result = await updateProfile({ full_name: 'Updated Name' })

      // Assert
      expect(result).toEqual(updatedProfile)
      expect(profile.value).toEqual(updatedProfile)
    })
  })

  describe('Sign Out', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
      
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })
    })

    it('should sign out successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null
      })

      const { signOut } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Act
      await signOut()

      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      // Arrange
      const signOutError = {
        name: 'AuthError',
        message: 'Sign out failed',
        status: 400,
        code: 'signout_error',
        __isAuthError: true
      } as unknown as AuthError

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: signOutError
      })

      const { signOut, error } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Act
      await signOut()

      // Assert
      expect(error.value).toBe(signOutError.message)
    })
  })

  describe('Utility Methods', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    })

    it('should check user role correctly', async () => {
      // Arrange
      const mockQuery = mockSupabaseClient.from()
      mockQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      const { hasRole } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Act & Assert
      expect(hasRole('user')).toBe(true)
      expect(hasRole('admin')).toBe(false)
    })

    it('should get user limits', async () => {
      // Arrange
      const mockLimits = {
        user_id: 'user-123',
        stories_per_day: 5,
        audio_generations_per_day: 10
      }

      const mockQueryProfiles = mockSupabaseClient.from()
      mockQueryProfiles.single.mockResolvedValueOnce({
        data: mockUserProfile,
        error: null
      })
      
      const mockQueryLimits = mockSupabaseClient.from()
      mockQueryLimits.single.mockResolvedValueOnce({
        data: mockLimits,
        error: null
      })

      const { getUserLimits } = useAuth()

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Act
      const limits = await getUserLimits()

      // Assert
      expect(limits).toEqual(mockLimits)
    })
  })
})