# 🎭 MSW Advanced Mocking - How-to Guide

> **Guía práctica para implementar scenarios avanzados de mocking con MSW**

## 🎯 Objetivo

Aprender a usar MSW para scenarios avanzados como rate limiting, errores de red, timeouts, y testing de edge cases que aparecen en el proyecto real.

**⏱️ Tiempo estimado**: 45-60 minutos  
**📋 Prerequisitos**: 
- [Environment Setup completado](../../getting-started/01-environment-setup.md)
- [MSW Setup Reference leída](../../reference/configurations/msw-setup.md)

## 💡 Cuándo Usar Esta Guía

- ✅ Necesitas simular errores de APIs (rate limiting, quota exceeded, 404s)
- ✅ Quieres testear retry logic o error handling
- ✅ Debes simular network failures o timeouts
- ✅ Necesitas testear different responses basados en input parameters
- ✅ Quieres validar que tu app se comporta correctamente en edge cases

## 🛠️ Setup Básico

### **Importaciones Necesarias**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'
import { mockOverrides, mswTestUtils, setupMSWTest } from '@/test-utils/msw'
```

### **Test Setup Pattern**
```typescript
describe('Advanced MSW Scenarios', () => {
  let cleanup: () => void

  beforeEach(() => {
    const setup = setupMSWTest()
    cleanup = setup.cleanup
  })

  afterEach(() => {
    cleanup()
  })

  // Tests aquí...
})
```

---

## 🚨 1. Error Scenarios

### **🔴 Rate Limiting (429)**

#### **OpenRouter Rate Limiting**
```typescript
it('should handle OpenRouter rate limiting gracefully', async () => {
  // Activar rate limiting mock
  mockOverrides.mockOpenRouterRateLimit()

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-key'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'user', content: 'Generate a short story' }
      ]
    })
  })

  // Verificaciones
  expect(response.status).toBe(429)
  
  const errorData = await response.json()
  expect(errorData).toHaveProperty('error')
  expect(errorData.error.type).toBe('rate_limit_exceeded')
  expect(errorData.error.code).toBe(429)
  
  // Verificar que el request fue interceptado
  expect(mswTestUtils.wasApiCalled('openrouter')).toBe(true)
})
```

#### **Custom Rate Limiting Logic**
```typescript
it('should implement custom rate limiting with retry after', async () => {
  // Override con Retry-After header
  server.use(
    http.post('https://openrouter.ai/api/v1/chat/completions', () => {
      return HttpResponse.json(
        {
          error: {
            message: 'Rate limit exceeded. Try again in 60 seconds.',
            type: 'rate_limit_exceeded',
            code: 429
          }
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '1000',
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    })
  )

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ model: 'test', messages: [] })
  })

  expect(response.status).toBe(429)
  expect(response.headers.get('Retry-After')).toBe('60')
  expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
})
```

### **💰 Quota Exceeded (402)**

#### **ElevenLabs Quota Exceeded**
```typescript
it('should handle ElevenLabs quota exceeded', async () => {
  mockOverrides.mockElevenLabsQuotaExceeded()

  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': 'test-key'
    },
    body: JSON.stringify({
      text: 'This is a test text that will trigger quota exceeded',
      model_id: 'eleven_monolingual_v1'
    })
  })

  expect(response.status).toBe(402)
  
  const errorData = await response.json()
  expect(errorData.detail.status).toBe('quota_exceeded')
  expect(mswTestUtils.wasApiCalled('elevenlabs')).toBe(true)
})
```

### **🔍 Not Found (404)**

#### **WordsAPI Word Not Found**
```typescript
it('should handle WordsAPI word not found', async () => {
  const nonExistentWord = 'nonexistentwordxyz123'
  
  const response = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${nonExistentWord}`, {
    headers: {
      'X-RapidAPI-Key': 'test-key',
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  })

  expect(response.status).toBe(404)
  
  const errorData = await response.json()
  expect(errorData.success).toBe(false)
  expect(errorData.message).toContain(nonExistentWord)
})
```

#### **Dynamic 404 Based on Input**
```typescript
it('should return 404 for invalid voice IDs', async () => {
  const invalidVoiceId = 'invalid-voice-123'
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${invalidVoiceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Test' })
  })

  expect(response.status).toBe(404)
  
  const errorData = await response.json()
  expect(errorData.detail.message).toContain('not found')
})
```

---

## 🌐 2. Network Scenarios

### **❌ Network Failures**

#### **Complete Network Failure**
```typescript
it('should handle complete network failure', async () => {
  // Simular network failure para OpenRouter
  mockOverrides.mockNetworkFailure('openrouter')

  try {
    await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ model: 'test', messages: [] })
    })
    
    // No debería llegar aquí
    expect(true).toBe(false)
  } catch (error) {
    // Network error debería ser thrown
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
  }
})
```

#### **Intermittent Network Issues**
```typescript
it('should handle intermittent network issues', async () => {
  let attempts = 0

  server.use(
    http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId', () => {
      attempts++
      
      // Primera llamada falla, segunda succeed
      if (attempts === 1) {
        return HttpResponse.error()
      }
      
      return HttpResponse.json({
        audio_url: 'https://mock-audio-url.com/test.mp3',
        audio_duration_seconds: 5.2,
        characters_used: 10,
        voice_id: '21m00Tcm4TlvDq8ikWAM'
      })
    })
  )

  // Primera llamada - debería fallar
  try {
    await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      body: JSON.stringify({ text: 'Test' })
    })
    expect(true).toBe(false)
  } catch (error) {
    expect(error).toBeDefined()
  }

  // Segunda llamada - debería succeed
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    body: JSON.stringify({ text: 'Test' })
  })

  expect(response.ok).toBe(true)
  expect(attempts).toBe(2)
})
```

### **⏱️ Timeouts y Slow Responses**

#### **Slow API Response**
```typescript
it('should handle slow API responses', async () => {
  const delayMs = 300 // Reduced para tests más rápidos
  mockOverrides.mockSlowResponse('openrouter', delayMs)

  const startTime = Date.now()
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ model: 'test', messages: [] })
  })
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  // Verificar que tomó al menos el delay especificado
  expect(duration).toBeGreaterThan(delayMs - 50) // 50ms tolerance
  expect(response.ok).toBe(true)
})
```

#### **Progressive Timeout Testing**
```typescript
it('should handle progressive timeouts', async () => {
  const delays = [100, 200, 500] // Delays incrementales
  let callCount = 0

  server.use(
    http.post('https://wordsapiv1.p.rapidapi.com/words/:word', async () => {
      const currentDelay = delays[callCount] || 1000
      callCount++
      
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      
      return HttpResponse.json({
        word: 'test',
        definitions: [{ definition: 'A test word', partOfSpeech: 'noun' }]
      })
    })
  )

  // Test múltiples calls con diferentes delays
  for (let i = 0; i < delays.length; i++) {
    const startTime = Date.now()
    
    const response = await fetch(`https://wordsapiv1.p.rapidapi.com/words/test${i}`)
    
    const duration = Date.now() - startTime
    expect(duration).toBeGreaterThan(delays[i] - 50)
    expect(response.ok).toBe(true)
  }
})
```

---

## 🎯 3. Dynamic Response Testing

### **📊 Response Based on Input Parameters**

#### **CEFR Level-Based Stories**
```typescript
it('should return appropriate stories based on CEFR level', async () => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  
  for (const level of levels) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: `Generate a ${level} level adventure story of about 100 words.`
          }
        ]
      })
    })

    expect(response.ok).toBe(true)
    
    const data = await response.json()
    const story = data.choices[0].message.content
    
    // Verificar que la historia es apropiada para el nivel
    expect(story).toBeDefined()
    expect(typeof story).toBe('string')
    expect(story.length).toBeGreaterThan(0)
    
    // Para A1/A2, stories deberían ser más cortas y simples
    if (level === 'A1' || level === 'A2') {
      expect(story.length).toBeLessThan(200) // Historias más cortas
    }
  }
})
```

#### **Genre-Based Story Selection**
```typescript
it('should return stories of correct genre', async () => {
  const genres = ['adventure', 'mystery', 'romance', 'sci-fi']
  
  for (const genre of genres) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: `Generate a B1 level ${genre} story of about 100 words.`
          }
        ]
      })
    })

    const data = await response.json()
    const story = data.choices[0].message.content
    
    expect(story).toBeDefined()
    
    // Verificar que la historia contiene elementos del género
    if (genre === 'mystery') {
      expect(story.toLowerCase()).toMatch(/mystery|clue|detective|solve|secret/)
    } else if (genre === 'adventure') {
      expect(story.toLowerCase()).toMatch(/adventure|journey|explore|discover/)
    }
  }
})
```

### **🎙️ Voice-Specific TTS Testing**
```typescript
it('should handle different voice configurations', async () => {
  const voiceConfigs = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', stability: 0.75 },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', stability: 0.1 },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', stability: 0.5 }
  ]

  for (const voice of voiceConfigs) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Hello, this is ${voice.name} speaking.`,
        voice_settings: {
          stability: voice.stability,
          similarity_boost: 0.5
        }
      })
    })

    expect(response.ok).toBe(true)
    
    const data = await response.json()
    expect(data.voice_id).toBe(voice.id)
    expect(data.audio_url).toBeDefined()
  }
})
```

---

## 📋 4. Request Tracking y Assertions

### **🔍 Advanced Request Tracking**

#### **Sequential API Calls Tracking**
```typescript
it('should track sequential API calls correctly', async () => {
  mswTestUtils.clearLogs()

  // Hacer múltiples calls a diferentes APIs
  await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ model: 'test', messages: [] })
  })

  await fetch('https://api.elevenlabs.io/v1/voices')

  await fetch('https://wordsapiv1.p.rapidapi.com/words/test')

  // Verificar tracking
  expect(mswTestUtils.wasApiCalled('openrouter')).toBe(true)
  expect(mswTestUtils.wasApiCalled('elevenlabs')).toBe(true)
  expect(mswTestUtils.wasApiCalled('wordsapi')).toBe(true)

  expect(mswTestUtils.getApiCallCount('openrouter')).toBe(1)
  expect(mswTestUtils.getApiCallCount('elevenlabs')).toBe(1)
  expect(mswTestUtils.getApiCallCount('wordsapi')).toBe(1)
})
```

#### **Waiting for Specific Requests**
```typescript
it('should wait for specific requests with patterns', async () => {
  // Start request en background
  const requestPromise = fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ model: 'test', messages: [] })
  })

  // Wait for el request específico
  const interceptedRequest = await mswTestUtils.waitForRequest('openrouter.ai', 3000)
  
  expect(interceptedRequest).not.toBeNull()
  expect(interceptedRequest.url).toContain('openrouter.ai')
  expect(interceptedRequest.method).toBe('POST')

  // Completar el request
  await requestPromise
})
```

### **📊 Complex Assertion Patterns**

#### **Request Body Validation**
```typescript
it('should validate request bodies in intercepted calls', async () => {
  let interceptedBody: any = null

  server.use(
    http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
      interceptedBody = await request.json()
      
      return HttpResponse.json({
        id: 'test',
        object: 'chat.completion',
        choices: [
          { 
            index: 0, 
            message: { role: 'assistant', content: 'Test response' },
            finish_reason: 'stop'
          }
        ]
      })
    })
  )

  const requestBody = {
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: 'Test prompt' }],
    max_tokens: 500,
    temperature: 0.7
  }

  await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  // Verificar que el body fue interceptado correctamente
  expect(interceptedBody).not.toBeNull()
  expect(interceptedBody.model).toBe('anthropic/claude-3.5-sonnet')
  expect(interceptedBody.messages).toHaveLength(1)
  expect(interceptedBody.max_tokens).toBe(500)
  expect(interceptedBody.temperature).toBe(0.7)
})
```

---

## 🔧 5. Patterns Reutilizables

### **🎯 Error Testing Helper Function**

```typescript
// Helper para testing error scenarios
async function testApiErrorScenario(
  apiName: 'openrouter' | 'elevenlabs' | 'wordsapi',
  errorType: 'rate_limit' | 'quota_exceeded' | 'not_found' | 'network_error',
  expectedStatus: number
) {
  // Configurar el error específico
  switch (errorType) {
    case 'rate_limit':
      mockOverrides.mockOpenRouterRateLimit()
      break
    case 'quota_exceeded':
      mockOverrides.mockElevenLabsQuotaExceeded()
      break
    case 'network_error':
      mockOverrides.mockNetworkFailure(apiName)
      break
  }

  const endpoints = {
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    elevenlabs: 'https://api.elevenlabs.io/v1/voices',
    wordsapi: 'https://wordsapiv1.p.rapidapi.com/words/test'
  }

  const response = await fetch(endpoints[apiName], {
    method: apiName === 'openrouter' ? 'POST' : 'GET',
    ...(apiName === 'openrouter' && {
      body: JSON.stringify({ model: 'test', messages: [] })
    })
  })

  if (errorType === 'network_error') {
    // Network errors throw exceptions
    expect(response).toBeUndefined()
  } else {
    expect(response.status).toBe(expectedStatus)
    expect(mswTestUtils.wasApiCalled(apiName)).toBe(true)
  }
}

// Uso del helper
it('should handle all error types', async () => {
  await testApiErrorScenario('openrouter', 'rate_limit', 429)
  await testApiErrorScenario('elevenlabs', 'quota_exceeded', 402)
})
```

### **📊 Batch Request Testing**

```typescript
// Helper para testear múltiples requests en paralelo
async function testBatchRequests(requests: Array<{
  api: string
  endpoint: string
  expectedStatus: number
}>) {
  const promises = requests.map(req => 
    fetch(req.endpoint).then(response => ({
      ...req,
      actualStatus: response.status
    }))
  )

  const results = await Promise.all(promises)
  
  results.forEach(result => {
    expect(result.actualStatus).toBe(result.expectedStatus)
  })

  return results
}

it('should handle batch API calls correctly', async () => {
  const requests = [
    {
      api: 'openrouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      expectedStatus: 200
    },
    {
      api: 'elevenlabs',
      endpoint: 'https://api.elevenlabs.io/v1/voices',
      expectedStatus: 200
    },
    {
      api: 'wordsapi',
      endpoint: 'https://wordsapiv1.p.rapidapi.com/words/test',
      expectedStatus: 200
    }
  ]

  await testBatchRequests(requests)
})
```

---

## ✅ Testing Checklist

### **Basic Error Scenarios**
- [ ] Rate limiting (429) for OpenRouter
- [ ] Quota exceeded (402) for ElevenLabs  
- [ ] Not found (404) for invalid words/voices
- [ ] Network failures with proper error handling

### **Advanced Scenarios**
- [ ] Slow responses con timeout testing
- [ ] Intermittent failures con retry logic
- [ ] Dynamic responses basado en input parameters
- [ ] Progressive errors (working → failing → working)

### **Request Tracking**
- [ ] Sequential API calls tracked correctly
- [ ] Request body validation en intercepted calls
- [ ] Waiting for specific requests con patterns
- [ ] Batch request testing con parallel calls

### **Edge Cases**
- [ ] Empty responses handled gracefully
- [ ] Invalid JSON responses
- [ ] Malformed request headers
- [ ] Concurrent requests con same parameters

---

## 🚀 Next Steps

Una vez domines MSW advanced mocking:

1. **[Unit Testing Patterns](./unit-testing-patterns.md)** - Patterns específicos para el proyecto
2. **[Cypress Quasar Components](./cypress-quasar-components.md)** - Component testing avanzado
3. **[OpenRouter Integration Guide](../apis/openrouter-integration.md)** - Implementar real API integration

---

**🔗 Referencias**:
- [MSW Setup Reference](../../reference/configurations/msw-setup.md) - Configuración completa
- [Test Utilities Reference](../../reference/testing-patterns/test-utilities.md) - MSW helpers
- [MSW Documentation](https://mswjs.io/docs/) - Official MSW docs

**💡 Tip**: Los patterns de este guide son reutilizables para cualquier API externa. Adapta los examples para tus propias integraciones de APIs.