# EtherAgent Studio - Development Guide

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm run test
```

## Architecture Overview

### Routing
- React Router v6 con lazy loading
- Rutas disponibles:
  - `/` → TemplateVault (default)
  - `/spaces` → SystemSpaces
  - `/engine` → IntelligenceEngine
  - `/influencers` → InfluencerRoster
  - `/broadcaster` → BroadcasterLab
  - `/templates` → TemplateVault
  - `/telemetry` → ActiveTelemetry
  - `/pricing` → PricingPlans

### API Layer
- Configurable via environment variables in `.env`
- Mock mode: `VITE_USE_MOCK=true` (default: true)
- Production: set `VITE_USE_MOCK=false`
- API Base URL: `VITE_API_BASE_URL=/api`

### Key Components
- **ErrorBoundary**: Catch errores en componentes
- **DashboardLayout**: Wrapper con Sidebar + MobileNav
- **PageTransition**: Transiciones con Framer Motion
- **useServiceWorker**: Hook para PWA
- **useAnalysisHistory**: Hook para historial de análisis

### Estado de Navegación
- Persistido en localStorage (`etheragent_navigation`)
- Guarda: última ruta, avatar seleccionado, categoría

### Analytics
- Función `trackAnalytics(path)` en Index.tsx
- Función `trackEvent(eventName, params)` para eventos personalizados
- Configurar con `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### PWA / Offline
- Service Worker configurado con vite-plugin-pwa
- Caching para fuentes Google y assets estáticos

## Adding New Routes

1. Crear componente en `src/components/dashboard/`
2. Importar lazy en `src/pages/Index.tsx`
3. Agregar navItem en el array navItems
4. Agregar Route en el Routes component

## API Methods

```typescript
// Available in src/services/api.ts
api.getAvatars()
api.getTemplates()
api.getSystemFlows()
api.getTelemetry()
api.renderVideo(avatarId, script, platform)
api.purchaseTemplate(templateId)
api.analyzeUrl(url)  // Intelligence Engine

// Error handling
import { ApiError } from '@/services/api';
```

## Environment Variables

Crear `.env` file:
```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

NO commitear secrets - agregar `.env` a `.gitignore`

## Testing

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch
```

Tests located in `src/test/`:
- `api.test.ts` - Unit tests for API layer
- `IntelligenceEngine.test.tsx` - Component tests
- `ErrorBoundary.test.tsx` - Error handling tests

## Features Implemented

- [x] Lazy Loading with React Router
- [x] Page Transitions with Framer Motion
- [x] Navigation Persistence (localStorage)
- [x] Route Analytics
- [x] Error Boundary
- [x] PWA / Service Worker
- [x] URL Validation
- [x] Toast Notifications
- [x] Analysis History
- [x] Unit Tests
