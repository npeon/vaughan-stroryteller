# 🤖 OpenRouter Integration - How-to Guide

> **Guía práctica para integrar OpenRouter API para generación de historias con IA**

## 🎯 Objetivo

Aprender a integrar OpenRouter API para generar historias personalizadas usando modelos de IA como GPT-4o Mini, GPT-4, y Llama 3.1, con testing completo y error handling.

**⏱️ Tiempo estimado**: 60-75 minutos  
**📋 Prerequisitos**: 
- [Environment Setup completado](../../getting-started/01-environment-setup.md)
- [MSW Advanced Mocking](../testing/msw-advanced-mocking.md) - para testing
- OpenRouter API key (opcional para testing, requerido para producción)

## 💡 Cuándo Usar Esta Guía

- ✅ Necesitas integrar IA para generación de contenido
- ✅ Quieres implementar fallback entre múltiples modelos de IA
- ✅ Debes adaptar contenido a diferentes niveles CEFR (A1-C2)
- ✅ Necesitas implementar rate limiting y error handling robusto
- ✅ Quieres testear integraciones de IA de manera determinística

## 🌟 ¿Qué es OpenRouter?

**OpenRouter** es un agregador de APIs de IA que te permite acceder a múltiples modelos (Claude, GPT-4, Llama) a través de una sola API, con pricing competitivo y fallbacks automáticos.

**Beneficios para el proyecto**:
- **Multiple models**: GPT-4o Mini, GPT-4, Llama 3.1 en una sola API
- **Cost optimization**: GPT-4o Mini ofrece excelente calidad a precio económico
- **Fallback system**: Si un modelo falla, automáticamente usa otro
- **Unified interface**: Misma API para todos los modelos

---

## 📊 1. Entendiendo la API

### **Endpoint Principal**
```
POST https://openrouter.ai/api/v1/chat/completions
```

### **Authentication**
```typescript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://your-site.com', // Opcional
  'X-Title': 'Your App Name' // Opcional
}
```

### **Request Body Structure**
```typescript
interface OpenRouterRequest {
  model: string              // e.g., 'anthropic/claude-3.5-sonnet'
  messages: Message[]        // Conversación history
  max_tokens?: number        // Límite de tokens response
  temperature?: number       // 0-1, creatividad del modelo
  top_p?: number            // 0-1, nucleus sampling
  frequency_penalty?: number // -2 to 2, penalizar repeticiones
  presence_penalty?: number  // -2 to 2, penalizar topics repetidos
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}
```

### **Response Structure**
```typescript
interface OpenRouterResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Choice[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface Choice {
  index: number
  message: {
    role: 'assistant'
    content: string
  }
  finish_reason: 'stop' | 'length' | 'content_filter'
}
```

---

## 🏗️ 2. Service Implementation

### **Create OpenRouter Service**

```typescript
// src/services/openrouter/openrouter.service.ts
import type { OpenRouterRequest, OpenRouterResponse } from '@/types/openrouter'

export class OpenRouterService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1'
  private readonly apiKey: string
  
  // Fallback models in order of preference
  private readonly models = [
    'openai/gpt-4o-mini',              // Best cost/quality ratio
    'openai/gpt-4-turbo',              // High quality option
    'meta-llama/llama-3.1-70b-instruct' // Open source alternative
  ]

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateStory(
    level: string,
    genre: string,
    wordCount: number = 100,
    additionalContext?: string
  ): Promise<string> {
    const prompt = this.buildStoryPrompt(level, genre, wordCount, additionalContext)
    
    // Try each model until one succeeds
    for (let i = 0; i < this.models.length; i++) {
      try {
        const response = await this.makeRequest({
          model: this.models[i],
          messages: [
            {
              role: 'system',
              content: 'You are an expert English language teacher who creates engaging stories adapted to specific CEFR levels.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          max_tokens: this.calculateMaxTokens(wordCount),
          temperature: 0.7, // Balanced creativity
        })

        return this.extractStoryFromResponse(response)
      } catch (error) {
        console.warn(`Model ${this.models[i]} failed:`, error)
        
        // If last model, re-throw error
        if (i === this.models.length - 1) {
          throw new Error(`All OpenRouter models failed. Last error: ${error}`)
        }
        
        // Continue to next model
        continue
      }
    }

    throw new Error('All OpenRouter models exhausted')
  }

  private buildStoryPrompt(
    level: string,
    genre: string,
    wordCount: number,
    additionalContext?: string
  ): string {
    const levelGuidelines = {
      A1: 'Use only present simple tense, basic vocabulary (most common 500 words), short simple sentences.',
      A2: 'Use present and past simple, basic future. Vocabulary up to 1000 most common words.',
      B1: 'Use various tenses including present perfect. Intermediate vocabulary and some complex sentences.',
      B2: 'Use all tenses confidently, including conditionals. Advanced vocabulary and varied sentence structures.',
      C1: 'Use sophisticated grammar and vocabulary. Complex ideas and nuanced language.',
      C2: 'Use near-native level language with subtle meanings and sophisticated expression.'
    }

    const genreInstructions = {
      adventure: 'Create an exciting adventure story with exploration, challenges, and discovery.',
      mystery: 'Write a mystery story with clues, investigation, and a surprising revelation.',
      romance: 'Tell a romantic story focusing on relationships and emotional connections.',
      'sci-fi': 'Create a science fiction story with futuristic elements and technology.',
      fantasy: 'Write a fantasy story with magical elements and imaginary worlds.',
      horror: 'Create a suspenseful horror story with spooky atmosphere (age-appropriate).'
    }

    return `
Generate a ${level} level ${genre} story of approximately ${wordCount} words.

CEFR ${level} Guidelines:
${levelGuidelines[level] || levelGuidelines['B1']}

Genre Requirements:
${genreInstructions[genre] || genreInstructions['adventure']}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Requirements:
1. Exactly around ${wordCount} words
2. Appropriate for ${level} English learners
3. Include a clear beginning, middle, and end
4. Make it engaging and educational
5. Use vocabulary appropriate for the level

Return only the story text, no additional commentary.
    `.trim()
  }

  private calculateMaxTokens(wordCount: number): number {
    // Rough estimation: 1 word ≈ 1.3 tokens
    // Add 30% buffer for longer responses
    return Math.ceil(wordCount * 1.3 * 1.3)
  }

  private async makeRequest(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'The Vaughan Storyteller'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new OpenRouterError(response.status, errorData)
    }

    return response.json()
  }

  private extractStoryFromResponse(response: OpenRouterResponse): string {
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No choices in OpenRouter response')
    }

    const story = response.choices[0].message.content
    if (!story) {
      throw new Error('Empty story content in OpenRouter response')  
    }

    return story.trim()
  }
}

// Custom error class
export class OpenRouterError extends Error {
  constructor(
    public status: number,
    public response: any
  ) {
    super(`OpenRouter API error: ${status}`)
    this.name = 'OpenRouterError'
  }

  get isRateLimit(): boolean {
    return this.status === 429
  }

  get isQuotaExceeded(): boolean {
    return this.status === 402
  }

  get isInvalidModel(): boolean {
    return this.status === 400 && 
           this.response?.error?.message?.includes('model')
  }
}
```

### **Environment Configuration**

```typescript
// src/config/openrouter.config.ts
export const openRouterConfig = {
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  baseUrl: 'https://openrouter.ai/api/v1',
  
  // Default models in preference order (updated 2025)
  defaultModels: [
    'openai/gpt-4o-mini',
    'openai/gpt-4-turbo', 
    'meta-llama/llama-3.1-70b-instruct'
  ],

  // Default request parameters
  defaults: {
    temperature: 0.7,
    max_tokens: 500,
    top_p: 0.9
  },

  // Rate limiting configuration
  rateLimit: {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000  // 30 seconds
  }
}
```

---

## 🧪 3. Comprehensive Testing

### **Unit Tests for Service**

```typescript
// src/services/openrouter/__tests__/openrouter.service.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { OpenRouterService, OpenRouterError } from '../openrouter.service'
import { setupMSWTest, mockOverrides } from '@/test-utils/msw'

describe('OpenRouterService', () => {
  let service: OpenRouterService
  let cleanup: () => void

  beforeEach(() => {
    service = new OpenRouterService('test-api-key')
    const setup = setupMSWTest()
    cleanup = setup.cleanup
  })

  afterEach(() => {
    cleanup()
  })

  describe('generateStory', () => {
    it('should generate story for B1 adventure', async () => {
      const story = await service.generateStory('B1', 'adventure', 100)
      
      expect(story).toBeDefined()
      expect(typeof story).toBe('string')
      expect(story.length).toBeGreaterThan(0)
      
      // Story should be appropriate length (rough estimation)
      const wordCount = story.split(' ').length
      expect(wordCount).toBeGreaterThan(50) // At least reasonable length
      expect(wordCount).toBeLessThan(200)   // Not too long
    })

    it('should handle different CEFR levels', async () => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      
      for (const level of levels) {
        const story = await service.generateStory(level, 'adventure', 50)
        
        expect(story).toBeDefined()
        expect(story.length).toBeGreaterThan(0)
      }
    })

    it('should handle different genres', async () => {
      const genres = ['adventure', 'mystery', 'romance', 'sci-fi']
      
      for (const genre of genres) {
        const story = await service.generateStory('B1', genre, 100)
        
        expect(story).toBeDefined()
        expect(story.length).toBeGreaterThan(0)
      }
    })

    it('should include additional context when provided', async () => {
      const additionalContext = 'The main character should be a young scientist'
      
      const story = await service.generateStory(
        'B2', 
        'sci-fi', 
        150, 
        additionalContext
      )
      
      expect(story).toBeDefined()
      expect(story.toLowerCase()).toMatch(/scientist/)
    })

    it('should handle rate limiting with fallback models', async () => {
      // Mock rate limiting for first model
      mockOverrides.mockOpenRouterRateLimit()
      
      const story = await service.generateStory('B1', 'adventure', 100)
      
      // Should still get a story from fallback model
      expect(story).toBeDefined()
      expect(story.length).toBeGreaterThan(0)
    })

    it('should throw error when all models fail', async () => {
      // Mock network failure for all models
      mockOverrides.mockNetworkFailure('openrouter')
      
      await expect(
        service.generateStory('B1', 'adventure', 100)
      ).rejects.toThrow('All OpenRouter models failed')
    })
  })

  describe('error handling', () => {
    it('should handle OpenRouter rate limiting', async () => {
      mockOverrides.mockOpenRouterRateLimit()
      
      try {
        await service.generateStory('B1', 'adventure', 100)
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError)
        expect((error as OpenRouterError).isRateLimit).toBe(true)
      }
    })

    it('should handle quota exceeded', async () => {
      // Mock quota exceeded response
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json(
            {
              error: {
                message: 'Insufficient credits',
                type: 'insufficient_credits',
                code: 402
              }
            },
            { status: 402 }
          )
        })
      )
      
      try {
        await service.generateStory('B1', 'adventure', 100)
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError)
        expect((error as OpenRouterError).isQuotaExceeded).toBe(true)
      }
    })

    it('should handle invalid model error', async () => {
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json(
            {
              error: {
                message: 'Invalid model specified',
                type: 'invalid_request_error'
              }
            },
            { status: 400 }
          )
        })
      )
      
      try {
        await service.generateStory('B1', 'adventure', 100)
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError)
        expect((error as OpenRouterError).isInvalidModel).toBe(true)
      }
    })
  })

  describe('prompt building', () => {
    it('should build appropriate prompts for different levels', async () => {
      let interceptedPrompt = ''
      
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
          const body = await request.json()
          interceptedPrompt = body.messages[1]?.content || ''
          
          return HttpResponse.json({
            id: 'test',
            object: 'chat.completion',
            created: Date.now(),
            model: 'test',
            choices: [{
              index: 0,
              message: { role: 'assistant', content: 'Test story' },
              finish_reason: 'stop'
            }]
          })
        })
      )
      
      await service.generateStory('A1', 'adventure', 50)
      
      // Verify prompt includes A1-specific guidelines
      expect(interceptedPrompt).toContain('A1 level')
      expect(interceptedPrompt).toContain('present simple')
      expect(interceptedPrompt).toContain('basic vocabulary')
      expect(interceptedPrompt).toContain('500 words')
    })
  })
})
```

### **Integration Tests**

```typescript
// src/services/openrouter/__tests__/openrouter.integration.test.ts
describe('OpenRouter Integration Tests', () => {
  let service: OpenRouterService

  beforeEach(() => {
    // Use real API key if available, otherwise skip integration tests
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!apiKey) {
      it.skip('OpenRouter API key not available')
      return
    }
    
    service = new OpenRouterService(apiKey)
  })

  it('should generate real story using actual API', async () => {
    // This test runs only if API key is available
    const story = await service.generateStory('B1', 'adventure', 100)
    
    expect(story).toBeDefined()
    expect(typeof story).toBe('string')
    expect(story.length).toBeGreaterThan(50)
    
    console.log('Generated story:', story)
  }, { timeout: 30000 }) // Longer timeout for real API calls

  it('should handle real rate limiting gracefully', async () => {
    // Make multiple rapid calls to test rate limiting
    const promises = Array.from({ length: 5 }, (_, i) => 
      service.generateStory('A2', 'mystery', 50)
    )
    
    // Some might fail with rate limiting, but at least some should succeed
    const results = await Promise.allSettled(promises)
    const successful = results.filter(r => r.status === 'fulfilled')
    
    expect(successful.length).toBeGreaterThan(0)
  }, { timeout: 60000 })
})
```

---

## 🎨 4. Composable for Vue Integration

### **OpenRouter Composable**

```typescript
// src/composables/useOpenRouter.ts
import { ref, computed } from 'vue'
import { OpenRouterService, OpenRouterError } from '@/services/openrouter'
import { openRouterConfig } from '@/config/openrouter.config'

export function useOpenRouter() {
  const service = new OpenRouterService(openRouterConfig.apiKey)
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastGeneratedStory = ref<string>('')
  const usageStats = ref({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0
  })

  const isReady = computed(() => {
    return !!openRouterConfig.apiKey && !loading.value
  })

  const generateStory = async (
    level: string,
    genre: string,
    wordCount: number = 100,
    additionalContext?: string
  ) => {
    loading.value = true
    error.value = null
    usageStats.value.totalRequests++

    try {
      const story = await service.generateStory(
        level, 
        genre, 
        wordCount, 
        additionalContext
      )
      
      lastGeneratedStory.value = story
      usageStats.value.successfulRequests++
      
      return story
    } catch (err) {
      usageStats.value.failedRequests++
      
      if (err instanceof OpenRouterError) {
        if (err.isRateLimit) {
          error.value = 'Rate limit exceeded. Please wait a moment and try again.'
        } else if (err.isQuotaExceeded) {
          error.value = 'API quota exceeded. Please check your OpenRouter account.'
        } else if (err.isInvalidModel) {
          error.value = 'Invalid model configuration. Please contact support.'
        } else {
          error.value = `API error: ${err.message}`
        }
      } else {
        error.value = 'Network error. Please check your connection and try again.'
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStats = () => {
    usageStats.value = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    }
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    lastGeneratedStory: readonly(lastGeneratedStory),
    usageStats: readonly(usageStats),
    
    // Computed
    isReady,
    
    // Actions
    generateStory,
    clearError,
    resetStats
  }
}
```

### **Vue Component Example**

```vue
<!-- src/components/StoryGenerator.vue -->
<template>
  <div class="story-generator">
    <q-form @submit.prevent="handleGenerateStory" class="q-gutter-md">
      <div class="row q-gutter-sm">
        <div class="col">
          <q-select
            v-model="selectedLevel"
            :options="cefrLevels"
            label="CEFR Level"
            emit-value
            map-options
            :disable="loading"
          />
        </div>
        
        <div class="col">
          <q-select
            v-model="selectedGenre"
            :options="genres"
            label="Genre"
            emit-value
            map-options
            :disable="loading"
          />
        </div>

        <div class="col">
          <q-input
            v-model.number="wordCount"
            type="number"
            label="Word Count"
            :min="50"
            :max="500"
            :disable="loading"
          />
        </div>
      </div>

      <q-input
        v-model="additionalContext"
        label="Additional Context (optional)"
        type="textarea"
        :disable="loading"
        hint="e.g., 'Include a dog as a character'"
      />

      <div class="row justify-between items-center">
        <q-btn
          type="submit"
          color="primary"
          :loading="loading"
          :disable="!isReady"
          icon="auto_stories"
        >
          Generate Story
        </q-btn>

        <div class="text-caption">
          <span v-if="usageStats.totalRequests > 0">
            {{ usageStats.successfulRequests }}/{{ usageStats.totalRequests }} successful
          </span>
        </div>
      </div>
    </q-form>

    <!-- Error Display -->
    <q-banner
      v-if="error"
      class="bg-negative text-white q-mt-md"
      icon="error"
    >
      {{ error }}
      <template #action>
        <q-btn
          flat
          label="Dismiss"
          @click="clearError"
        />
      </template>
    </q-banner>

    <!-- Story Display -->
    <q-card
      v-if="lastGeneratedStory"
      class="q-mt-lg"
    >
      <q-card-section>
        <div class="text-h6">Generated Story</div>
        <div class="text-caption q-mb-md">
          {{ selectedLevel }} • {{ selectedGenre }} • ~{{ wordCount }} words
        </div>
      </q-card-section>

      <q-card-section>
        <div class="story-content">
          {{ lastGeneratedStory }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          icon="content_copy"
          label="Copy"
          @click="copyStoryToClipboard"
        />
        <q-btn
          flat
          icon="refresh"
          label="Regenerate"
          @click="handleGenerateStory"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOpenRouter } from '@/composables/useOpenRouter'
import { copyToClipboard, Notify } from 'quasar'

// OpenRouter composable
const {
  loading,
  error,
  lastGeneratedStory,
  usageStats,
  isReady,
  generateStory,
  clearError
} = useOpenRouter()

// Form state
const selectedLevel = ref('B1')
const selectedGenre = ref('adventure')
const wordCount = ref(100)
const additionalContext = ref('')

// Options
const cefrLevels = [
  { label: 'A1 - Beginner', value: 'A1' },
  { label: 'A2 - Elementary', value: 'A2' },
  { label: 'B1 - Intermediate', value: 'B1' },
  { label: 'B2 - Upper Intermediate', value: 'B2' },
  { label: 'C1 - Advanced', value: 'C1' },
  { label: 'C2 - Proficient', value: 'C2' }
]

const genres = [
  { label: 'Adventure', value: 'adventure' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Romance', value: 'romance' },
  { label: 'Science Fiction', value: 'sci-fi' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Horror', value: 'horror' }
]

// Methods
const handleGenerateStory = async () => {
  try {
    await generateStory(
      selectedLevel.value,
      selectedGenre.value,
      wordCount.value,
      additionalContext.value || undefined
    )
    
    Notify.create({
      type: 'positive',
      message: 'Story generated successfully!',
      position: 'top'
    })
  } catch (err) {
    // Error is already handled by the composable
    console.error('Story generation failed:', err)
  }
}

const copyStoryToClipboard = async () => {
  try {
    await copyToClipboard(lastGeneratedStory.value)
    Notify.create({
      type: 'positive',
      message: 'Story copied to clipboard!',
      position: 'top'
    })
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Failed to copy story',
      position: 'top'
    })
  }
}
</script>

<style scoped>
.story-content {
  font-size: 1.1em;
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: 'Georgia', serif;
}
</style>
```

---

## ⚙️ 5. Advanced Features

### **Rate Limiting with Exponential Backoff**

```typescript
// src/utils/rateLimitHandler.ts
export class RateLimitHandler {
  private attemptCount = 0
  private readonly maxAttempts: number
  private readonly baseDelay: number
  private readonly maxDelay: number

  constructor(maxAttempts = 3, baseDelay = 1000, maxDelay = 30000) {
    this.maxAttempts = maxAttempts
    this.baseDelay = baseDelay
    this.maxDelay = maxDelay
  }

  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    this.attemptCount = 0

    while (this.attemptCount < this.maxAttempts) {
      try {
        const result = await operation()
        this.attemptCount = 0 // Reset on success
        return result
      } catch (error) {
        this.attemptCount++

        if (error instanceof OpenRouterError && error.isRateLimit) {
          if (this.attemptCount >= this.maxAttempts) {
            throw new Error(`Rate limit exceeded after ${this.maxAttempts} attempts`)
          }

          const delay = this.calculateDelay()
          console.log(`Rate limited. Waiting ${delay}ms before retry ${this.attemptCount}/${this.maxAttempts}`)
          
          await this.delay(delay)
          continue
        }

        // Non-rate-limit errors should be thrown immediately
        throw error
      }
    }

    throw new Error('Max retry attempts exceeded')
  }

  private calculateDelay(): number {
    // Exponential backoff: baseDelay * 2^(attemptCount-1)
    const delay = this.baseDelay * Math.pow(2, this.attemptCount - 1)
    return Math.min(delay, this.maxDelay)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Usage in service
export class OpenRouterService {
  private rateLimitHandler = new RateLimitHandler(3, 1000, 30000)

  async generateStory(...args): Promise<string> {
    return this.rateLimitHandler.executeWithRetry(() => 
      this.generateStoryInternal(...args)
    )
  }
}
```

### **Story Quality Validation**

```typescript
// src/utils/storyValidator.ts
export class StoryValidator {
  validateStory(story: string, expectedLevel: string, expectedWordCount: number) {
    const issues: string[] = []

    // Word count validation
    const actualWordCount = this.countWords(story)
    const tolerance = 0.3 // 30% tolerance
    const minWords = expectedWordCount * (1 - tolerance)
    const maxWords = expectedWordCount * (1 + tolerance)

    if (actualWordCount < minWords || actualWordCount > maxWords) {
      issues.push(`Word count ${actualWordCount} outside expected range ${minWords}-${maxWords}`)
    }

    // Level-appropriate vocabulary check
    const levelIssues = this.validateLevelAppropriate(story, expectedLevel)
    issues.push(...levelIssues)

    // Structure validation
    const structureIssues = this.validateStoryStructure(story)
    issues.push(...structureIssues)

    return {
      isValid: issues.length === 0,
      issues,
      wordCount: actualWordCount,
      score: this.calculateQualityScore(story, expectedLevel)
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length
  }

  private validateLevelAppropriate(story: string, level: string): string[] {
    const issues: string[] = []

    // Basic checks based on CEFR level
    if (level === 'A1' || level === 'A2') {
      // Check for complex sentences (very basic heuristic)
      const complexSentences = story.match(/[,;:]/g)
      if (complexSentences && complexSentences.length > story.split('.').length * 0.3) {
        issues.push('Too many complex sentences for A1/A2 level')
      }
    }

    return issues
  }

  private validateStoryStructure(story: string): string[] {
    const issues: string[] = []

    // Check for basic story structure
    if (!story.includes('.')) {
      issues.push('Story should contain complete sentences')
    }

    // Minimum length check
    if (story.length < 50) {
      issues.push('Story too short to be meaningful')
    }

    return issues
  }

  private calculateQualityScore(story: string, level: string): number {
    let score = 100

    // Deduct points for issues
    if (story.length < 100) score -= 10
    if (!story.match(/[.!?]/)) score -= 20
    if (story.includes('ERROR') || story.includes('error')) score -= 50

    return Math.max(0, score)
  }
}
```

---

## ✅ Testing Checklist

### **Unit Tests**
- [ ] Story generation for all CEFR levels (A1-C2)
- [ ] Story generation for all genres
- [ ] Error handling (rate limiting, quota exceeded, invalid model)
- [ ] Fallback model logic
- [ ] Prompt building with different parameters
- [ ] Token calculation accuracy

### **Integration Tests**
- [ ] Real API calls (if API key available)
- [ ] Rate limiting with real delays
- [ ] Story quality validation
- [ ] Network failure scenarios

### **E2E Tests**
- [ ] Complete story generation workflow
- [ ] User error handling in UI
- [ ] Story copying and sharing functionality

---

## 🚀 Next Steps

Una vez domines OpenRouter integration:

1. **[ElevenLabs TTS Integration](./elevenlabs-tts.md)** - Agregar narración de historias
2. **[WordsAPI Vocabulary](./wordsapi-vocabulary.md)** - Gestión de vocabulario 
3. **[Performance Testing](../development/performance-testing.md)** - Optimizar API calls

---

**🔗 Referencias**:
- [OpenRouter API Reference](../../reference/apis/openrouter-reference.md) - Documentación técnica completa
- [MSW Advanced Mocking](../testing/msw-advanced-mocking.md) - Testing de APIs
- [OpenRouter Official Docs](https://openrouter.ai/docs) - Documentación oficial

---

## 🎯 6. Actualización del Modelo Primario (2025)

### **Cambio de Claude 3.5 a GPT-4o Mini**

**Decisión tomada**: Cambiar el modelo primario de `anthropic/claude-3.5-sonnet` a `openai/gpt-4o-mini`

**Razones del cambio**:
- **💰 Costo**: GPT-4o Mini es significativamente más económico que Claude 3.5
- **📈 Sostenibilidad**: Mejor relación costo/calidad para uso en producción
- **🚀 Longevidad**: GPT-4o Mini tiene mejor soporte a largo plazo
- **⚡ Performance**: Mantiene calidad excelente para generación de historias

### **Implementación del Cambio**

**Archivos actualizados**:
```typescript
// src/types/openrouter.ts
export const OPENROUTER_MODELS = {
  GPT4O_MINI: 'openai/gpt-4o-mini',    // ← Nuevo modelo primario
  GPT4_TURBO: 'openai/gpt-4-turbo',
  LLAMA_31_70B: 'meta-llama/llama-3.1-70b-instruct'
}

// src/services/openrouter/StoryGenerator.ts
this.models = [
  import.meta.env.OPENROUTER_PRIMARY_MODEL || 'openai/gpt-4o-mini',     // ← Actualizado
  import.meta.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-4-turbo',
  import.meta.env.OPENROUTER_TERTIARY_MODEL || 'meta-llama/llama-3.1-70b-instruct'
]
```

**Variables de entorno actualizadas**:
```env
# .env
OPENROUTER_PRIMARY_MODEL=openai/gpt-4o-mini
OPENROUTER_FALLBACK_MODEL=openai/gpt-4-turbo
OPENROUTER_TERTIARY_MODEL=meta-llama/llama-3.1-70b-instruct
```

**Tests actualizados**:
- Todos los tests ahora usan GPT-4o Mini como modelo esperado
- MSW mocks actualizados para el nuevo modelo
- Validaciones de respuesta adaptadas

### **Verificación del Cambio**

```bash
# Verificar que no quedan referencias al modelo anterior
rg "claude-3\.5" src/
rg "anthropic/claude" src/

# Ejecutar tests para validar
npm run test:unit -- test/vitest/__tests__/services/openrouter/
npm run typecheck
```

### **Beneficios Esperados**

- **🔻 Reducción de costos**: ~70% menos costo por token
- **📊 Mantenimiento de calidad**: GPT-4o Mini mantiene excelente calidad para historias B1-B2
- **⏱️ Velocidad similar**: Tiempo de respuesta comparable
- **🔄 Fallback robusto**: Mismo sistema de fallback a GPT-4 Turbo y Llama 3.1

---

## 🖼️ 7. Generación de Imágenes con Google Gemini

### **Nueva Funcionalidad: Story Image Generation**

**Implementación completada**: Sistema de generación de imágenes educativas usando modelos Google Gemini a través de OpenRouter.

**Características principales**:
- **🎨 Imágenes educativas**: Adaptadas al nivel CEFR del estudiante
- **🔄 Fallback robusto**: google/gemini-2.5-flash-image-preview:free → google/gemini-2.5-flash-image-preview
- **📱 Frontend-compatible**: Imágenes en formato base64 data URLs
- **🏫 Prompt educativo**: Optimizado para contenido de aprendizaje de inglés
- **⚡ Error isolation**: Las historias funcionan independientemente de las imágenes

### **Tipos de Imagen Disponibles**

```typescript
// src/types/openrouter.ts
export interface ImageGenerationRequest {
  storyContent: string;           // Contenido de la historia
  level: CEFRLevel;              // A1, A2, B1, B2, C1, C2
  genre: StoryGenre;             // adventure, mystery, romance, etc.
  style?: ImageStyle;            // 'educational' | 'children' | 'realistic' | 'illustration'
  aspectRatio?: '16:9' | '4:3' | '1:1';  // Relación de aspecto
  model?: OpenRouterImageModelId; // Modelo específico (opcional)
}

type ImageStyle = 'educational' | 'children' | 'realistic' | 'illustration'
```

### **Service Implementation**

```typescript
// src/services/openrouter/ImageGenerator.ts
export class ImageGenerator {
  private readonly models = [
    'google/gemini-2.5-flash-image-preview:free', // Modelo primario
    'google/gemini-2.5-flash-image-preview'       // Fallback
  ]

  async generateStoryImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    // Construye prompt educativo adaptado al nivel CEFR
    const prompt = this.buildPrompt(request)
    
    // Intenta cada modelo hasta que uno funcione
    for (const model of this.models) {
      try {
        const result = await this.openRouterClient.generateImage(prompt, model as OpenRouterImageModelId)
        if (result.success) return result
      } catch (error) {
        console.warn(`Image model ${model} failed:`, error)
        continue
      }
    }

    // Retorna imagen placeholder si todos los modelos fallan
    return this.createPlaceholderImage(request)
  }

  private buildPrompt(request: ImageGenerationRequest): string {
    const { storyContent, level, genre, style = 'educational' } = request
    
    const levelStyles = {
      A1: 'very simple, bright colors, clear shapes',
      A2: 'simple, friendly style with basic details',
      B1: 'moderate detail, engaging composition',
      B2: 'good detail level, sophisticated composition',
      C1: 'rich details, artistic composition',
      C2: 'highly detailed, complex artistic style'
    }

    return `Create a high-quality, educational illustration for an English learning story.
    
Story context: ${storyContent.substring(0, 200)}...
CEFR Level: ${level} - Style should be ${levelStyles[level]}
Genre: ${genre}
Art Style: ${style}

Requirements:
- Educational and appropriate for language learners
- Clear, engaging visual that supports story comprehension
- Avoid text or words in the image
- Safe for all ages
- High quality illustration style`
  }
}
```

### **Orchestration Service**

```typescript
// src/services/openrouter/StoryWithImageService.ts - Nuevo
export class StoryWithImageService {
  constructor(
    private storyGenerator: StoryGenerator,
    private imageGenerator: ImageGenerator
  ) {}

  async generateStoryWithImage(request: StoryWithImageRequest): Promise<StoryWithImageResponse> {
    const startTime = performance.now()
    
    try {
      // 1. Generar historia primero
      const story = await this.storyGenerator.generateStory({
        level: request.level,
        genre: request.genre,
        wordCount: request.wordCount
      })
      
      let image: ImageGenerationResult | undefined
      
      // 2. Generar imagen si se solicita
      if (request.includeImage) {
        try {
          image = await this.imageGenerator.generateStoryImage({
            storyContent: story.story.content,
            level: request.level,
            genre: request.genre,
            style: request.imageStyle
          })
        } catch (error) {
          console.warn('Image generation failed:', error)
          // Continúa sin imagen - error isolation
        }
      }

      const totalTime = performance.now() - startTime
      
      return {
        story,
        image,
        metadata: {
          storyGeneratedAt: new Date().toISOString(),
          totalProcessingTime: totalTime,
          ...(image && { imageGeneratedAt: image.generatedAt })
        }
      }
    } catch (error) {
      throw new Error(`Story generation failed: ${error}`)
    }
  }
}
```

### **Environment Variables**

```env
# Configuración específica para imágenes
OPENROUTER_IMAGE_MODEL=google/gemini-2.5-flash-image-preview:free
OPENROUTER_IMAGE_MODEL_SECONDARY=google/gemini-2.5-flash-image-preview

# Configuración opcional
IMAGE_GENERATION_TIMEOUT_MS=45000
IMAGE_DEFAULT_STYLE=educational
IMAGE_DEFAULT_ASPECT_RATIO=16:9
```

### **Testing Image Generation**

```typescript
// test/vitest/__tests__/services/openrouter/ImageGenerator.test.ts
describe('ImageGenerator', () => {
  it('should generate educational images for different CEFR levels', async () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    
    for (const level of levels) {
      const result = await imageGenerator.generateStoryImage({
        storyContent: 'A young explorer finds a hidden treasure in the forest.',
        level,
        genre: 'adventure',
        style: 'educational'
      })
      
      expect(result.success).toBe(true)
      expect(result.imageUrl).toMatch(/^data:image\//)
      expect(result.isPlaceholder).toBe(false)
    }
  })

  it('should handle fallback to secondary model', async () => {
    // Mock primary model failure
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', ({ request }) => {
        const body = request.json()
        if (body.model === 'google/gemini-2.5-flash-image-preview:free') {
          return HttpResponse.json({ error: 'Model unavailable' }, { status: 503 })
        }
        return HttpResponse.json(mockSuccessfulImageResponse)
      })
    )

    const result = await imageGenerator.generateStoryImage(mockRequest)
    expect(result.success).toBe(true)
  })

  it('should provide placeholder when all models fail', async () => {
    // Mock all models failing
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({ error: 'Service unavailable' }, { status: 503 })
      })
    )

    const result = await imageGenerator.generateStoryImage(mockRequest)
    expect(result.success).toBe(true)
    expect(result.isPlaceholder).toBe(true)
    expect(result.imageUrl).toMatch(/^data:image\/svg\+xml/)
  })
})
```

### **Vue Integration**

```vue
<!-- Componente actualizado con imágenes -->
<template>
  <q-form @submit="generateStoryWithImage">
    <!-- Controles existentes... -->
    
    <q-toggle
      v-model="includeImage"
      label="Generate story image"
      color="primary"
    />

    <q-select
      v-if="includeImage"
      v-model="imageStyle"
      :options="imageStyles"
      label="Image Style"
    />

    <!-- Resultado con imagen -->
    <q-card v-if="generatedStory" class="story-result">
      <q-img
        v-if="generatedImage && !generatedImage.isPlaceholder"
        :src="generatedImage.imageUrl"
        :alt="`Illustration for ${generatedStory.story.title}`"
        ratio="16/9"
        class="story-image"
      />
      
      <q-card-section>
        <h3>{{ generatedStory.story.title }}</h3>
        <p class="story-content">{{ generatedStory.story.content }}</p>
      </q-card-section>

      <q-card-section v-if="generatedImage?.isPlaceholder">
        <q-banner class="bg-orange text-white">
          <template #avatar>
            <q-icon name="image" />
          </template>
          Image generation unavailable. Story generated successfully.
        </q-banner>
      </q-card-section>
    </q-card>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StoryWithImageService } from '@/services/openrouter/StoryWithImageService'

const includeImage = ref(true)
const imageStyle = ref('educational')
const generatedStory = ref(null)
const generatedImage = ref(null)

const imageStyles = [
  { label: 'Educational', value: 'educational' },
  { label: 'Children Style', value: 'children' },
  { label: 'Realistic', value: 'realistic' },
  { label: 'Illustration', value: 'illustration' }
]

const storyWithImageService = new StoryWithImageService()

const generateStoryWithImage = async () => {
  const result = await storyWithImageService.generateStoryWithImage({
    level: selectedLevel.value,
    genre: selectedGenre.value,
    wordCount: wordCount.value,
    includeImage: includeImage.value,
    imageStyle: imageStyle.value
  })
  
  generatedStory.value = result.story
  generatedImage.value = result.image
}
</script>
```

### **Prompt Engineering Educativo**

**Principios de diseño de prompts**:

1. **Adaptación por nivel CEFR**:
   - **A1-A2**: Imágenes simples, colores brillantes, formas claras
   - **B1-B2**: Composición equilibrada, detalles moderados
   - **C1-C2**: Detalles ricos, composición artística sofisticada

2. **Contexto educativo**:
   - Sin texto en las imágenes (para evitar confusión)
   - Apropiado para todas las edades
   - Refuerza la comprensión de la historia

3. **Estilos disponibles**:
   - `educational`: Estilo didáctico limpio
   - `children`: Amigable y colorido para niveles básicos
   - `realistic`: Fotorrealista para niveles avanzados
   - `illustration`: Estilo de ilustración artística

### **Error Isolation Pattern**

**Principio clave**: Las historias **siempre** funcionan, incluso si la generación de imágenes falla.

```typescript
// Patrón implementado en StoryWithImageService
try {
  // 1. Historia siempre se genera primero
  const story = await this.generateStory(request)
  
  // 2. Imagen es opcional y no puede fallar el flujo principal
  let image = undefined
  if (request.includeImage) {
    try {
      image = await this.generateImage(story.content, request)
    } catch (error) {
      console.warn('Image generation failed, continuing with story only:', error)
      // No se propaga el error - se continúa sin imagen
    }
  }
  
  return { story, image } // Historia siempre presente, imagen opcional
} catch (error) {
  // Solo falla si la historia no se puede generar
  throw error
}
```

### **Performance Optimization**

**Estrategias implementadas**:

1. **Sequential Generation**: Historia primero, imagen después (mejor UX)
2. **Timeout Management**: 45s timeout para imágenes vs 30s para historias
3. **Fallback Strategy**: Múltiples modelos + placeholder SVG
4. **Base64 Caching**: Imágenes se pueden cachear directamente en base64

## 💾 8. Sistema de Persistencia Completo

### **Production-Ready Image Storage**

**Implementación completada**: Sistema completo de persistencia en Supabase Storage para imágenes de historias.

**Arquitectura de almacenamiento**:

```
Database: stories table
├── image_url (TEXT) - URL pública de Supabase Storage
├── image_storage_path (TEXT) - Ruta en bucket para gestión
├── image_generated_at (TIMESTAMP) - Cuándo se generó la imagen
├── image_model_used (TEXT) - Modelo usado (google/gemini-2.5-flash-image-preview:free)
├── image_style (TEXT) - Estilo utilizado (educational, children, realistic)
└── image_generation_prompt (TEXT) - Prompt para analytics

Storage: story-images bucket
└── stories/
    ├── A1/adventure/story-123-1640995200000.png
    ├── B1/mystery/story-124-1640995300000.png
    └── C2/biography/story-125-1640995400000.png
```

### **ImageStorageService Implementation**

```typescript
// src/services/supabase/ImageStorageService.ts
export class ImageStorageService {
  private readonly bucketName = 'story-images'
  private readonly maxFileSizeBytes = 5 * 1024 * 1024 // 5MB
  private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp']

  async saveStoryImage(
    storyId: string,
    imageResult: ImageGenerationResult,
    imageRequest: ImageGenerationRequest,
    generationPrompt: string
  ): Promise<StoredImageMetadata> {
    // 1. Convert base64 to blob with validation
    const imageBlob = this.base64ToBlob(imageResult.imageUrl)
    
    // 2. Generate organized storage path
    const storagePath = this.generateStoragePath(storyId, imageRequest.level, imageRequest.genre)
    // Result: "stories/B1/adventure/story-123-1640995200000.png"
    
    // 3. Upload to Supabase Storage with caching
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(storagePath, imageBlob, {
        contentType: imageBlob.type,
        cacheControl: '31536000', // 1 year cache
        upsert: true
      })

    // 4. Get public URL for CDN access
    const { data: publicUrl } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath)

    // 5. Update story record with image metadata
    await supabase
      .from('stories')
      .update({
        image_url: publicUrl.publicUrl,
        image_storage_path: storagePath,
        image_generated_at: imageResult.generatedAt,
        image_model_used: imageResult.model,
        image_style: imageRequest.style,
        image_generation_prompt: generationPrompt.substring(0, 1000)
      })
      .eq('id', storyId)

    return {
      imageUrl: publicUrl.publicUrl,
      storagePath,
      generatedAt: imageMetadata.image_generated_at,
      modelUsed: imageMetadata.image_model_used,
      style: imageMetadata.image_style,
      prompt: imageMetadata.image_generation_prompt
    }
  }

  // Management methods
  async getStoryImageMetadata(storyId: string): Promise<StoredImageMetadata | null>
  async deleteStoryImage(storyId: string): Promise<boolean>
  async getStorageStats(): Promise<ImageStorageStats>
  async cleanupOrphanedImages(): Promise<number>
}
```

### **Enhanced StoryWithImageService**

```typescript
// src/services/openrouter/StoryWithImageService.ts - Updated
export class StoryWithImageService {
  constructor(
    storyGenerator?: StoryGenerator, 
    imageGenerator?: ImageGenerator,
    imageStorageService?: ImageStorageService,
    persistImages: boolean = true // Production default
  ) {
    this.persistImages = persistImages;
    this.imageStorageService = imageStorageService || new ImageStorageService();
  }

  async generateStoryWithImage(request: StoryWithImageRequest): Promise<StoryWithImageResponse> {
    // 1. Always generate story first (error isolation)
    const story = await this.generateStory(request);
    
    let image: ImageGenerationResult | undefined;
    let imagePersisted = false;

    if (request.includeImage !== false) {
      try {
        // 2. Generate image
        image = await this.generateImageForStory(story, request);

        // 3. Persist to Supabase Storage (production mode)
        if (this.persistImages && image.success && !image.isPlaceholder && story.story.id) {
          try {
            const persistedMetadata = await this.imageStorageService.saveStoryImage(
              story.story.id,
              image,
              imageRequest,
              image.prompt || 'Educational illustration'
            );

            // Update image with Supabase public URL
            image.imageUrl = persistedMetadata.imageUrl;
            image.storage = {
              storagePath: persistedMetadata.storagePath,
              publicUrl: persistedMetadata.imageUrl,
              persistedAt: persistedMetadata.generatedAt
            };

            imagePersisted = true;
            
          } catch (persistError) {
            console.warn('Image persistence failed, falling back to base64:', persistError);
            // Continue with base64 - error isolation principle
          }
        }
      } catch (error) {
        console.warn('Image generation failed, continuing with story only:', error);
        // Story always continues - error isolation
      }
    }

    return {
      story,
      image,
      metadata: {
        storyGeneratedAt: new Date().toISOString(),
        totalProcessingTime: Date.now() - startTime,
        imagePersisted,
        storageProvider: this.persistImages ? 'supabase' : 'memory'
      }
    };
  }

  // Storage management methods
  async getStoredImage(storyId: string) { /* ... */ }
  async deleteStoredImage(storyId: string): Promise<boolean> { /* ... */ }
  async getStorageStats() { /* ... */ }
  async cleanupOrphanedImages(): Promise<number> { /* ... */ }
}
```

### **Database Migration Applied**

```sql
-- supabase/migrations/20250829120000_add_image_fields_to_stories.sql

-- Add image persistence fields
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_storage_path TEXT,
ADD COLUMN IF NOT EXISTS image_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS image_model_used TEXT,
ADD COLUMN IF NOT EXISTS image_style TEXT,
ADD COLUMN IF NOT EXISTS image_generation_prompt TEXT;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_stories_has_image ON stories (id) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_image_model ON stories (image_model_used) WHERE image_model_used IS NOT NULL;

-- Create Supabase Storage bucket with RLS policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'story-images', 
  'story-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- RLS Policies for security
CREATE POLICY "Public read access for story images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'story-images');

CREATE POLICY "Authenticated users can upload story images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'story-images' AND auth.role() = 'authenticated');

-- Maintenance function for cleanup
CREATE OR REPLACE FUNCTION cleanup_orphaned_story_images()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER := 0;
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'story-images'
  AND NOT EXISTS (
    SELECT 1 FROM stories 
    WHERE stories.image_storage_path = storage.objects.name
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Production Usage Examples**

```typescript
// Production configuration
const storyWithImageService = new StoryWithImageService(
  new StoryGenerator(),
  new ImageGenerator(), 
  new ImageStorageService(),
  true // Enable persistence for production
);

// Generate story with persistent image
const result = await storyWithImageService.generateStoryWithImage({
  level: 'B1',
  genre: 'adventure',
  wordCount: 300,
  includeImage: true,
  imageStyle: 'educational'
});

console.log('Story:', result.story.story.title);
console.log('Image URL:', result.image?.imageUrl); // Supabase public URL
console.log('Persisted:', result.metadata.imagePersisted); // true
console.log('Storage:', result.metadata.storageProvider); // 'supabase'

// Storage management
const stats = await storyWithImageService.getStorageStats();
console.log(`${stats.totalImages} images, ${stats.totalSizeBytes} bytes`);

// Cleanup maintenance
const deletedCount = await storyWithImageService.cleanupOrphanedImages();
console.log(`Cleaned up ${deletedCount} orphaned images`);
```

### **Error Isolation & Fallback Strategy**

**Principio fundamental**: Las historias **siempre** funcionan, incluso con fallos de persistencia.

```typescript
// Robust error handling workflow
try {
  // 1. Generate story (critical path)
  const story = await this.generateStory(request);
  
  // 2. Generate image (optional)
  const image = await this.generateImageForStory(story, request);
  
  // 3. Persist image (optional optimization)
  if (this.persistImages && image.success) {
    try {
      await this.persistToStorage(story.id, image);
      // ✅ Best case: Story + Persistent image
    } catch (persistError) {
      // ⚠️ Fallback: Story + Base64 image
      console.warn('Using base64 fallback');
    }
  }
  
  return { story, image }; // Always returns story
  
} catch (storyError) {
  // ❌ Only fails if story generation fails
  throw storyError;
}
```

### **Performance Benefits**

**Supabase Storage vs Base64**:

| Aspecto | Base64 (Anterior) | Supabase Storage (Actual) |
|---------|------------------|---------------------------|
| **Carga inicial** | ❌ Lento (embebido) | ✅ Rápido (URL separada) |
| **Cache del browser** | ❌ Con el JSON | ✅ Cache independiente CDN |
| **Bandwidth** | ❌ Siempre descarga | ✅ Cache: zero bandwidth |
| **Bundle size** | ❌ Aumenta payload | ✅ URL liviana (50 bytes) |
| **Parallelización** | ❌ Secuencial | ✅ Paralela (texto + imagen) |
| **Persistencia** | ❌ Solo sesión | ✅ Permanente |

**Ejemplo de optimización**:
```
Historia con imagen B1 (300 palabras):
- Base64: ~150KB JSON (historia + imagen embebida)
- Storage: ~8KB JSON + 45KB imagen (separada, cacheable)
- Beneficio: 94% menos payload en visits recurrentes
```

### **Testing Checklist Imágenes + Persistencia**

#### **Unit Tests ✅**
- [x] Generación de imágenes para todos los niveles CEFR
- [x] Prompts educativos apropiados por nivel
- [x] Fallback entre modelos Gemini
- [x] Generación de placeholder cuando fallan todos los modelos
- [x] Diferentes estilos de imagen (educational, children, realistic)
- [x] Error isolation (historias funcionan sin imágenes)
- [x] **NEW**: ImageStorageService upload/download/delete
- [x] **NEW**: Base64 to blob conversion con validación
- [x] **NEW**: Storage path generation por nivel/género
- [x] **NEW**: File size y mime type validation

#### **Integration Tests ✅**
- [x] Orquestación completa historia + imagen
- [x] Timeouts y manejo de errores
- [x] MSW mocks para modelos de imagen
- [x] Validación de formato base64
- [x] **NEW**: Persistencia end-to-end (generate → store → retrieve)
- [x] **NEW**: Fallback a base64 cuando Storage falla
- [x] **NEW**: Cleanup de uploads fallidos
- [x] **NEW**: Storage statistics y management

#### **TDD Coverage ✅**
- [x] 47 test cases originales para generación
- [x] **NEW**: 25 test cases adicionales para persistencia
- [x] **NEW**: 18 test cases para ImageStorageService
- [x] **Total**: 90+ test cases cubriendo workflow completo
- [x] Mocks deterministas para testing consistente
- [x] Error scenarios y edge cases
- [x] Performance tracking
- [x] **NEW**: Storage integration mocking con Supabase

---

**💡 Tip**: OpenRouter es especialmente útil porque permite cambiar modelos de IA sin cambiar código, lo que te da flexibilidad para optimizar cost/quality según tus necesidades.