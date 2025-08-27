# 🎭 MSW Setup Reference

> **Configuración completa de Mock Service Worker para API mocking en desarrollo y testing**

## 📋 Overview

MSW (Mock Service Worker) está configurado para interceptar y mockear 3 APIs externas: OpenRouter (IA), ElevenLabs (TTS), y WordsAPI (diccionario). Funciona tanto en browser (development) como en Node.js (testing).

**Version**: `msw: ^2.10.5`  
**APIs Mockeadas**: OpenRouter, ElevenLabs, WordsAPI  
**Environments**: Browser + Node.js (Vitest)

## 🏗️ Arquitectura MSW

```
src/mocks/
├── browser.ts              # MSW worker para browser/development
├── node.ts                 # MSW server para Node.js/testing
├── handlers/               # Request handlers por API
│   ├── index.ts           # Central export de todos los handlers
│   ├── openrouter.ts      # OpenRouter API handlers
│   ├── elevenlabs.ts      # ElevenLabs API handlers
│   └── wordsapi.ts        # WordsAPI handlers
└── data/                  # Mock data estructurada
    ├── stories.ts         # Stories por CEFR level y género
    ├── vocabulary.ts      # Vocabulary mock data
    └── audio-urls.ts      # Audio URLs para TTS mocking
```

---

## 🌐 Browser Configuration (Development)

### **Archivo**: `src/mocks/browser.ts`

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Configuración del Service Worker para browser
export const worker = setupWorker(...handlers)
```

### **Inicialización en Development**
MSW worker se puede inicializar condicionalmente en desarrollo:

```typescript
// En src/main.ts o boot file
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'warn', // Warn para requests no mockeadas
  })
}
```

### **Service Worker File**
MSW requiere el archivo `public/mockServiceWorker.js`:

```bash
# Generar service worker (ya incluido en proyecto)
npx msw init public/ --save
```

**¿Qué hace?**
- Intercepta network requests en el browser
- Permite mocking sin modificar código de aplicación
- Funciona con cualquier HTTP client (fetch, axios, etc.)

---

## 🖥️ Node.js Configuration (Testing)

### **Archivo**: `src/mocks/node.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configuración del server para Node.js testing
export const server = setupServer(...handlers)
```

### **Auto-inicialización en Vitest**
En `test/vitest/setup-file.ts`:

```typescript
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../../src/mocks/node'

// Setup MSW server antes de todos los tests
beforeAll(() => server.listen({ 
  onUnhandledRequest: 'error' // Error para requests no mockeadas
}))

// Reset handlers después de cada test
afterEach(() => server.resetHandlers())

// Cerrar server después de todos los tests
afterAll(() => server.close())
```

**Key Features**:
- **`onUnhandledRequest: 'error'`**: Falla tests si hay requests no mockeadas
- **`resetHandlers()`**: Limpia overrides después de cada test
- **`server.close()`**: Cleanup completo

---

## 🔗 Handlers Configuration

### **Central Export**: `src/mocks/handlers/index.ts`

```typescript
import { openRouterHandlers } from './openrouter'
import { elevenLabsHandlers } from './elevenlabs'
import { wordsApiHandlers } from './wordsapi'

// Todos los handlers exportados centralmente
export const handlers = [
  ...openRouterHandlers,
  ...elevenLabsHandlers,
  ...wordsApiHandlers,
]
```

### **¿Por Qué Esta Estructura?**
- **Modular**: Cada API en su propio archivo
- **Maintainable**: Fácil agregar/modificar handlers
- **Reusable**: Mismos handlers para browser y node
- **Testable**: Cada set de handlers se puede testear independientemente

---

## 🤖 OpenRouter API Handlers

### **Archivo**: `src/mocks/handlers/openrouter.ts`

```typescript
import { http, HttpResponse } from 'msw'
import { storyData } from '../data/stories'
import type { OpenRouterRequest, OpenRouterResponse } from '../../types/openrouter'

export const openRouterHandlers = [
  // Chat completions endpoint
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as OpenRouterRequest
    
    // Extract story parameters from prompt
    const content = body.messages[0]?.content || ''
    const level = extractCEFRLevel(content) || 'B1'
    const genre = extractGenre(content) || 'adventure'
    
    // Get appropriate story for level/genre
    const story = getStoryForLevel(level, genre)
    
    const response: OpenRouterResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body.model || 'anthropic/claude-3.5-sonnet',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: story
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: estimateTokens(content),
        completion_tokens: estimateTokens(story),
        total_tokens: estimateTokens(content) + estimateTokens(story)
      }
    }
    
    return HttpResponse.json(response)
  }),

  // Rate limiting simulation
  http.post('https://openrouter.ai/api/v1/chat/completions', ({ request }) => {
    // This handler can be activated via test overrides
    return HttpResponse.json(
      {
        error: {
          message: 'Rate limit exceeded',
          type: 'rate_limit_exceeded',
          code: 429
        }
      },
      { status: 429 }
    )
  }, { once: true }) // Only active when explicitly triggered
]
```

### **Features Implementadas**

#### **Story Selection Logic**
```typescript
function getStoryForLevel(level: string, genre: string): string {
  const stories = storyData[level]?.[genre]
  if (!stories || stories.length === 0) {
    return getDefaultStory(level)
  }
  
  // Return random story from appropriate level/genre
  return stories[Math.floor(Math.random() * stories.length)]
}
```

#### **Token Estimation**
```typescript
function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}
```

#### **CEFR Level Extraction**
```typescript
function extractCEFRLevel(prompt: string): string | null {
  const levelMatch = prompt.match(/\b(A1|A2|B1|B2|C1|C2)\b/i)
  return levelMatch ? levelMatch[1].toUpperCase() : null
}
```

---

## 🎙️ ElevenLabs API Handlers

### **Archivo**: `src/mocks/handlers/elevenlabs.ts`

```typescript
import { http, HttpResponse } from 'msw'
import { audioUrls } from '../data/audio-urls'
import type { ElevenLabsTTSRequest, ElevenLabsTTSResponse } from '../../types/elevenlabs'

export const elevenLabsHandlers = [
  // Text-to-speech endpoint
  http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId', async ({ request, params }) => {
    const { voiceId } = params
    const body = await request.json() as ElevenLabsTTSRequest
    
    // Validate voice ID exists
    if (!isValidVoiceId(voiceId as string)) {
      return HttpResponse.json(
        {
          detail: {
            status: 'voice_not_found',
            message: `Voice ${voiceId} not found`
          }
        },
        { status: 404 }
      )
    }
    
    // Simulate quota check
    if (body.text.length > 10000) {
      return HttpResponse.json(
        {
          detail: {
            status: 'quota_exceeded',
            message: 'Character limit exceeded'
          }
        },
        { status: 402 }
      )
    }
    
    const response: ElevenLabsTTSResponse = {
      audio_url: generateMockAudioUrl(),
      audio_duration_seconds: estimateAudioDuration(body.text),
      characters_used: body.text.length,
      voice_id: voiceId as string,
      model_id: body.model_id || 'eleven_monolingual_v1'
    }
    
    return HttpResponse.json(response)
  }),

  // Get voices endpoint
  http.get('https://api.elevenlabs.io/v1/voices', () => {
    return HttpResponse.json({
      voices: [
        {
          voice_id: '21m00Tcm4TlvDq8ikWAM',
          name: 'Rachel',
          settings: {
            stability: 0.75,
            similarity_boost: 0.5
          },
          category: 'premade'
        },
        {
          voice_id: 'AZnzlk1XvdvUeBnXmlld',
          name: 'Domi',
          settings: {
            stability: 0.1,
            similarity_boost: 0.75
          },
          category: 'premade'
        }
        // ... más voces
      ]
    })
  })
]
```

### **Audio Duration Estimation**
```typescript
function estimateAudioDuration(text: string): number {
  // Average reading speed: ~150 words per minute
  const words = text.split(' ').length
  const minutes = words / 150
  return Math.round(minutes * 60 * 100) / 100 // Round to 2 decimals
}
```

---

## 📚 WordsAPI Handlers

### **Archivo**: `src/mocks/handlers/wordsapi.ts`

```typescript
import { http, HttpResponse } from 'msw'
import { vocabularyData } from '../data/vocabulary'

export const wordsApiHandlers = [
  // Word lookup endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word', ({ params }) => {
    const { word } = params
    const wordData = vocabularyData[word as string]
    
    if (!wordData) {
      return HttpResponse.json(
        {
          success: false,
          message: `word "${word}" not found`
        },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      word: word,
      results: wordData.definitions.map(def => ({
        definition: def.definition,
        partOfSpeech: def.partOfSpeech,
        synonyms: def.synonyms || [],
        examples: def.examples || []
      }))
    })
  }),

  // Specific endpoints
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/definitions', ({ params }) => {
    const { word } = params
    const wordData = vocabularyData[word as string]
    
    if (!wordData) {
      return HttpResponse.json({ definitions: [] })
    }
    
    return HttpResponse.json({
      word: word,
      definitions: wordData.definitions
    })
  }),

  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/synonyms', ({ params }) => {
    const { word } = params
    const wordData = vocabularyData[word as string]
    
    const allSynonyms = wordData?.definitions
      .flatMap(def => def.synonyms || []) || []
    
    return HttpResponse.json({
      word: word,
      synonyms: [...new Set(allSynonyms)] // Remove duplicates
    })
  }),

  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/pronunciation', ({ params }) => {
    const { word } = params
    const wordData = vocabularyData[word as string]
    
    return HttpResponse.json({
      word: word,
      pronunciation: {
        all: wordData?.pronunciation || `/${word}/`
      }
    })
  })
]
```

---

## 📊 Mock Data Structure

### **Stories Data**: `src/mocks/data/stories.ts`

```typescript
export const storyData = {
  A1: {
    adventure: [
      "Tom goes to the park. He sees a big tree. A cat is in the tree. Tom helps the cat down. The cat says thank you.",
      // ... más historias A1 adventure
    ],
    mystery: [
      "Anna loses her book. She looks everywhere. Her friend helps her. They find it under the bed.",
      // ... más historias A1 mystery
    ]
  },
  B1: {
    adventure: [
      "Sarah decided to explore the old forest behind her house. As she walked deeper into the woods, she discovered a hidden path that led to an ancient stone bridge...",
      // ... más historias B1 adventure
    ]
  }
  // ... otros niveles
}
```

### **Vocabulary Data**: `src/mocks/data/vocabulary.ts`

```typescript
export const vocabularyData = {
  adventure: {
    definitions: [
      {
        definition: "An exciting or dangerous experience",
        partOfSpeech: "noun",
        synonyms: ["journey", "quest", "expedition"],
        examples: ["They went on a great adventure in the mountains."]
      }
    ],
    pronunciation: "/ədˈventʃər/"
  },
  // ... más palabras
}
```

---

## 🧪 Test Utilities Integration

### **MSW Test Utilities**: `src/test-utils/msw.ts`

```typescript
import { server } from '../mocks/node'

// Request tracking
let requestLog: Array<{ url: string; method: string; timestamp: number }> = []

// Setup function para tests
export function setupMSWTest() {
  return {
    cleanup: () => {
      requestLog = []
      server.resetHandlers()
    }
  }
}

// Tracking utilities
export const mswTestUtils = {
  clearLogs: () => { requestLog = [] },
  
  wasApiCalled: (apiName: string): boolean => {
    const patterns = {
      openrouter: /openrouter\.ai/,
      elevenlabs: /api\.elevenlabs\.io/,
      wordsapi: /wordsapiv1\.p\.rapidapi\.com/
    }
    
    return requestLog.some(req => patterns[apiName]?.test(req.url))
  },
  
  getApiCallCount: (apiName: string): number => {
    const patterns = {
      openrouter: /openrouter\.ai/,
      elevenlabs: /api\.elevenlabs\.io/,
      wordsapi: /wordsapiv1\.p\.rapidapi\.com/
    }
    
    return requestLog.filter(req => patterns[apiName]?.test(req.url)).length
  },
  
  waitForRequest: async (urlPattern: string, timeout = 5000): Promise<any> => {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      
      const check = () => {
        const request = requestLog.find(req => req.url.includes(urlPattern))
        
        if (request) {
          resolve(request)
        } else if (Date.now() - start > timeout) {
          reject(new Error(`Request to ${urlPattern} not found within ${timeout}ms`))
        } else {
          setTimeout(check, 100)
        }
      }
      
      check()
    })
  }
}
```

---

## 🎯 Dynamic Overrides

### **Mock Overrides para Testing**

```typescript
export const mockOverrides = {
  // Simular rate limiting de OpenRouter
  mockOpenRouterRateLimit: () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json(
          {
            error: {
              message: 'Rate limit exceeded',
              type: 'rate_limit_exceeded',
              code: 429
            }
          },
          { status: 429 }
        )
      })
    )
  },

  // Simular quota exceeded de ElevenLabs
  mockElevenLabsQuotaExceeded: () => {
    server.use(
      http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId', () => {
        return HttpResponse.json(
          {
            detail: {
              status: 'quota_exceeded',
              message: 'Monthly quota exceeded'
            }
          },
          { status: 402 }
        )
      })
    )
  },

  // Simular network failure
  mockNetworkFailure: (apiName: string) => {
    const endpoints = {
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      elevenlabs: 'https://api.elevenlabs.io/v1/text-to-speech/:voiceId',
      wordsapi: 'https://wordsapiv1.p.rapidapi.com/words/:word'
    }
    
    server.use(
      http.post(endpoints[apiName] || endpoints.openrouter, () => {
        return HttpResponse.error()
      })
    )
  },

  // Simular respuesta lenta
  mockSlowResponse: (apiName: string, delayMs: number = 1000) => {
    server.use(
      http.post(endpoints[apiName], async () => {
        await new Promise(resolve => setTimeout(resolve, delayMs))
        return HttpResponse.json({ data: 'delayed response' })
      })
    )
  }
}
```

---

## 📈 Usage Examples

### **En Tests Unitarios**
```typescript
import { describe, it, expect } from 'vitest'
import { mswTestUtils, mockOverrides } from '@/test-utils/msw'

describe('OpenRouter Integration', () => {
  it('handles rate limiting correctly', async () => {
    // Override con rate limiting
    mockOverrides.mockOpenRouterRateLimit()
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ model: 'test', messages: [] })
    })
    
    expect(response.status).toBe(429)
    expect(mswTestUtils.wasApiCalled('openrouter')).toBe(true)
  })
})
```

### **En Development**
```typescript
// Enable MSW en modo desarrollo
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser')
  await worker.start()
  console.log('MSW mocking enabled')
}
```

---

## ⚠️ Considerations

### **Performance Impact**
- **Browser**: Service Worker añade ~20-30ms por request
- **Node.js**: Server interceptor añade ~5-10ms por request
- **Development**: Negligible para development UX

### **Memory Usage**
- **Mock data**: ~2-3MB en memory para todos los mock data
- **Request logs**: Se limpia automáticamente después de cada test

### **Network Debugging**
MSW requests aparecen en DevTools Network tab con prefijo `[MSW]` para fácil identificación.

---

**🔗 Referencias Relacionadas**:
- [Vitest Configuration Reference](./vitest-config.md) - Integración con testing
- [Test Utilities Reference](../testing-patterns/test-utilities.md) - MSW test helpers  
- [OpenRouter API Reference](../apis/openrouter-reference.md) - API siendo mockeada
- [Getting Started - Environment Setup](../../getting-started/01-environment-setup.md) - Tutorial setup MSW

**💡 Tip**: MSW es especialmente poderoso porque intercepta a nivel de network, lo que significa que tu código de aplicación usa exactamente las mismas APIs tanto con mocks como con servicios reales.