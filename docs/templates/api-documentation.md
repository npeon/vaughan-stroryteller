# 🌐 [API Name] - How-to Guide Template

> **[Brief description of what this API does and why it's useful]**

## 🎯 Objetivo

[Explain what the reader will learn and be able to do after following this guide]

**⏱️ Tiempo estimado**: [X-Y] minutos  
**📋 Prerequisitos**: 
- [Environment Setup completado](../../getting-started/01-environment-setup.md)
- [Other prerequisite guides]
- [API key requirements if needed]

## 💡 Cuándo Usar Esta Guía

- ✅ [Specific use case 1]
- ✅ [Specific use case 2]
- ✅ [Specific use case 3]
- ✅ [Specific use case 4]

## 🌟 ¿Qué es [API Name]?

**[API Name]** is [description of the service/API]

**Beneficios para el proyecto**:
- **[Benefit 1]**: [Explanation]
- **[Benefit 2]**: [Explanation]  
- **[Benefit 3]**: [Explanation]
- **[Benefit 4]**: [Explanation]

---

## 📊 1. Entendiendo la API

### **Endpoint Principal**
```
[HTTP METHOD] [ENDPOINT URL]
```

### **Authentication**
```typescript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
  // Other headers
}
```

### **Request Structure**
```typescript
interface [APIName]Request {
  // Request interface
}
```

### **Response Structure**
```typescript
interface [APIName]Response {
  // Response interface
}
```

---

## 🏗️ 2. Service Implementation

### **Create [API] Service**

```typescript
// src/services/[api-name]/[api-name].service.ts
export class [APIName]Service {
  // Service implementation
}
```

### **Environment Configuration**

```typescript
// src/config/[api-name].config.ts
export const [apiName]Config = {
  // Configuration
}
```

---

## 🧪 3. Comprehensive Testing

### **Unit Tests for Service**

```typescript
// src/services/[api-name]/__tests__/[api-name].service.test.ts
describe('[APIName]Service', () => {
  // Test implementation
})
```

### **Integration Tests**

```typescript
// Integration test examples
```

---

## 🎨 4. Composable for Vue Integration

### **[API] Composable**

```typescript
// src/composables/use[APIName].ts
export function use[APIName]() {
  // Composable implementation
}
```

### **Vue Component Example**

```vue
<!-- src/components/[Component].vue -->
<template>
  <!-- Component template -->
</template>

<script setup lang="ts">
// Component script
</script>
```

---

## ⚙️ 5. Advanced Features

### **Feature 1**
[Description and implementation]

### **Feature 2**
[Description and implementation]

---

## ✅ Testing Checklist

### **Unit Tests**
- [ ] [Test scenario 1]
- [ ] [Test scenario 2]
- [ ] [Test scenario 3]

### **Integration Tests**
- [ ] [Integration scenario 1]
- [ ] [Integration scenario 2]

### **E2E Tests**
- [ ] [E2E scenario 1]
- [ ] [E2E scenario 2]

---

## 🚀 Next Steps

Una vez domines [API] integration:

1. **[Next Guide 1](./guide1.md)** - [Description]
2. **[Next Guide 2](./guide2.md)** - [Description]
3. **[Next Guide 3](../category/guide3.md)** - [Description]

---

**🔗 Referencias**:
- [[API] API Reference](../../reference/apis/[api-name]-reference.md) - Documentación técnica completa
- [MSW Advanced Mocking](../testing/msw-advanced-mocking.md) - Testing de APIs
- [[API] Official Docs](https://api-docs-url.com) - Documentación oficial

**💡 Tip**: [Helpful tip specific to this API or general advice]