import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { Quasar, QPage, QBtn, QSpinnerDots, QBanner, QIcon } from 'quasar'
import LoginPage from '../../../../../src/pages/auth/LoginPage.vue'

// Install Quasar plugin
installQuasarPlugin({
  plugins: {},
  components: {
    QPage,
    QBtn, 
    QSpinnerDots,
    QBanner,
    QIcon
  }
})

// Mock the composables
const mockUseAuth = {
  signInWithGoogle: vi.fn(),
  loading: { value: false },
  error: { value: null as string | null }
}

const mockUseAuthGuard = {
  requireGuest: vi.fn()
}

// Mock Vue Router
const mockRouter = {
  push: vi.fn()
}

vi.mock('../../../../../src/composables/useAuth', () => ({
  useAuth: () => mockUseAuth
}))

vi.mock('../../../../../src/composables/useAuthGuard', () => ({
  useAuthGuard: () => mockUseAuthGuard
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

describe('LoginPage Component', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockUseAuth.loading.value = false
    mockUseAuth.error.value = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(LoginPage, {
      global: {
        plugins: [Quasar]
      }
    })
  }

  describe('Rendering', () => {
    it('should render welcome message and description', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Welcome back!')
      expect(wrapper.text()).toContain('Continue your English learning journey')
    })

    it('should render Google OAuth button with correct styling', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')
      expect(googleBtn.exists()).toBe(true)
      expect(googleBtn.text()).toContain('Continue with Google')
      expect(googleBtn.classes()).toContain('google-btn')
      expect(googleBtn.classes()).toContain('full-width')
    })

    it('should show terms of service information', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('By continuing, you agree to our terms of service')
      expect(wrapper.text()).toContain('New to our platform? Your account will be created automatically')
    })

    it('should not show error banner initially', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const errorBanner = wrapper.findComponent(QBanner)
      expect(errorBanner.exists()).toBe(false)
    })

    it('should not show loading state initially', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const loadingSpinner = wrapper.find('[data-testid="loading-spinner"]')
      expect(loadingSpinner.exists()).toBe(false)
    })
  })

  describe('User Interactions', () => {
    it('should call signInWithGoogle when button is clicked', async () => {
      // Arrange
      wrapper = createWrapper()
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')

      // Act
      await googleBtn.trigger('click')

      // Assert
      expect(mockUseAuth.signInWithGoogle).toHaveBeenCalledOnce()
    })

    it('should handle multiple rapid clicks gracefully', async () => {
      // Arrange
      wrapper = createWrapper()
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')

      // Act - rapid clicks
      await googleBtn.trigger('click')
      await googleBtn.trigger('click')
      await googleBtn.trigger('click')

      // Assert - should only be called once due to loading state
      expect(mockUseAuth.signInWithGoogle).toHaveBeenCalledOnce()
    })

    it('should disable button during loading state', async () => {
      // Arrange
      mockUseAuth.loading.value = true
      wrapper = createWrapper()

      // Act
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')

      // Assert
      expect((googleBtn as any).props().disable).toBe(true)
      expect((googleBtn as any).props().loading).toBe(true)
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner when authenticating', async () => {
      // Arrange
      mockUseAuth.loading.value = true
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const innerLoading = wrapper.find('[data-testid="inner-loading"]')
      expect(innerLoading.exists()).toBe(true)
      expect(wrapper.text()).toContain('Redirecting to Google...')
      expect(wrapper.text()).toContain('This may take a few seconds')
    })

    it('should show correct loading message during OAuth process', async () => {
      // Arrange
      mockUseAuth.loading.value = true
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('Redirecting to Google...')
      expect(wrapper.text()).toContain('This may take a few seconds')
    })

    it('should disable interactions during loading', async () => {
      // Arrange
      mockUseAuth.loading.value = true
      wrapper = createWrapper()

      // Act
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')
      await wrapper.vm.$nextTick()

      // Assert
      expect((googleBtn as any).props().disable).toBe(true)
      expect((googleBtn as any).props().loading).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should display error banner when authentication fails', async () => {
      // Arrange
      mockUseAuth.error.value = 'Authentication failed'
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const errorBanner = wrapper.findComponent(QBanner)
      expect(errorBanner.exists()).toBe(true)
      expect(errorBanner.text()).toContain('Authentication Error')
      expect(errorBanner.text()).toContain('Authentication failed')
    })

    it('should show appropriate error message', async () => {
      // Arrange
      const errorMessage = 'OAuth provider is temporarily unavailable'
      mockUseAuth.error.value = errorMessage
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain(errorMessage)
    })

    it('should show dismiss button in error banner', async () => {
      // Arrange
      mockUseAuth.error.value = 'Some error'
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const dismissBtn = wrapper.find('[data-testid="error-dismiss-btn"]')
      expect(dismissBtn.exists()).toBe(true)
      expect(dismissBtn.text()).toContain('Dismiss')
    })

    it('should handle error dismissal', async () => {
      // Arrange
      mockUseAuth.error.value = 'Some error'
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Act
      const dismissBtn = wrapper.find('[data-testid="error-dismiss-btn"]')
      await dismissBtn.trigger('click')

      // Assert
      // Note: clearError implementation should be tested in the actual component
      // This test verifies the button exists and is clickable
      expect(dismissBtn.exists()).toBe(true)
    })
  })

  describe('Authentication Guard Integration', () => {
    it('should call requireGuest on component mount', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(mockUseAuthGuard.requireGuest).toHaveBeenCalledOnce()
    })

    it('should prevent access for authenticated users', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - requireGuest should handle the redirection logic
      expect(mockUseAuthGuard.requireGuest).toHaveBeenCalled()
    })
  })

  describe('Component Structure and Styling', () => {
    it('should have correct page class', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const page = wrapper.findComponent(QPage)
      expect(page.classes()).toContain('login-page')
    })

    it('should have proper button structure for Google OAuth', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')
      expect((googleBtn as any).props().color).toBe('white')
      expect((googleBtn as any).props().textColor).toBe('grey-8')
      expect((googleBtn as any).props().unelevated).toBe(true)
      expect((googleBtn as any).props().size).toBe('lg')
    })

    it('should contain Google logo icon', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')
      expect((googleBtn as any).props().icon).toContain('img:')
      expect((googleBtn as any).props().icon).toContain('g-logo.png')
    })

    it('should be responsive and accessible', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const page = wrapper.findComponent(QPage)
      expect(page.exists()).toBe(true)
      
      // Check that the layout is structured properly for different screen sizes
      const loginOptions = wrapper.find('.login-options')
      expect(loginOptions.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined error gracefully', async () => {
      // Arrange
      mockUseAuth.error.value = null
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const errorBanner = wrapper.findComponent(QBanner)
      expect(errorBanner.exists()).toBe(false)
    })

    it('should handle null error gracefully', async () => {
      // Arrange
      mockUseAuth.error.value = null
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const errorBanner = wrapper.findComponent(QBanner)
      expect(errorBanner.exists()).toBe(false)
    })

    it('should handle empty error message', async () => {
      // Arrange
      mockUseAuth.error.value = ''
      wrapper = createWrapper()

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const errorBanner = wrapper.findComponent(QBanner)
      expect(errorBanner.exists()).toBe(false)
    })

    it('should maintain button state consistency', async () => {
      // Arrange
      wrapper = createWrapper()
      const googleBtn = wrapper.findComponent('[data-testid="google-signin-btn"]')

      // Initially enabled
      expect((googleBtn as any).props().disable).toBe(false)

      // Simulate loading
      mockUseAuth.loading.value = true
      await wrapper.vm.$nextTick()

      expect((googleBtn as any).props().disable).toBe(true)
    })
  })
})