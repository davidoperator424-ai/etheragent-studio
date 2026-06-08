# EtherAI Agent - Documento de Diseño UX

## Visión del Producto

Plataforma B2B para creación y despliegue de Influencers de IA autónomos en multicanal publicitario (físico, metaverso, espacio).

---

## User Journey Principal

```
Marca/Agencia
     │
     ▼
[Login] → [Dashboard Central]
     │
     ├─→ [1. Spaces] ──→ Configurar entorno de campaña
     │
     ├─→ [2. Intelligence] ──→ Análisis estratégico de URL/contenido
     │
     ├─→ [3. Marketplace] ──→ Seleccionar/buscar agente
     │
     ├─→ [4. Social Lab] ──→ Crear contenido con agente
     │
     ├─→ [5. Templates] ──→ Usar plantillas premium
     │
     ├─→ [6. Telemetry] ──→ Monitorizar rendimiento
     │
     ├─→ [7. Planes] ──→ Gestionar suscripción
     │
     ├─→ [8. Deploy] ──→ Desplegar a VerseAds
     │
     └─→ [9. Exchange] ──→ Nodos globales
```

---

## Mapeo Dashboard → Estrategia de Negocio

### 1. SystemSpaces (`/spaces`)
**Propósito**: Arquitectura y configuración de espacios de campaña

**Estrategia de Negocio**: 
- Define el entorno donde operará el agente (físico, metaverso, espacio)
- Conexión con los 3 canales de despliegue (Interiores/Exteriores DOOH, Metaverso, Espacio)

**User Flow**:
1. Crear nuevo espacio
2. Seleccionar tipo: Interior / Exterior / Metaverso / Espacial
3. Configurar parámetros (geolocalización, pantalla, duración)
4. Validar disponibilidad

---

### 2. Intelligence Engine (`/engine`)
**Propósito**: Análisis estratégico y validación de URLs/contenido

**Estrategia de Negocio**:
- Herramienta de preventa para convencer clientes
- Análisis de sitio web del cliente para sugerir agente óptimo

**User Flow**:
1. Ingresar URL del cliente
2. Sistema analiza contenido, nicho, competidores
3. Generar informe con recomendaciones de agente y espacio
4. Guardar en historial para seguimiento

---

### 3. InfluencerRoster / Marketplace (`/influencers`)
**Propósito**: Catálogo y selección de Agent Personas

**Estrategia de Negocio**:
- **Tier 1 (Starter)**: Acceso a agentes básicos
- **Tier 2 (Pro)**: Acceso a múltiples agentes especializados
- **Tier 3 (Enterprise)**: Agentes personalizados desde cero

**Agent Personas**:
| Persona | Nicho | Tono | Canal Ideal |
|---------|-------|------|-------------|
| Cyber-Tech | Web3/Crypto | Analítico, visionario | Metaverso |
| Lifestyle/Fashion | Retail/Moda | Casual, estético | Interiores, Redes |
| Pionero | Espacial/Alta tecnología | Autoritario, inspirador | Espacio, Exterior |

**User Flow**:
1. Explorar agentes por categoría (Tech, Fashion, Finance, Gaming)
2. Ver perfil, demos, pricing por uso
3. Seleccionar agente
4. Ir a Social Lab para crear contenido

---

### 4. BroadcasterLab / Social Lab (`/broadcaster`)
**Propósito**: Centro de creación de contenido con agente

**Estrategia de Negocio**:
- **Core del negocio**: Generación de videos con lip-sync (ElevenLabs + SyncLabs)
- Cola asíncrona de renderizado para producción a escala

**User Flow**:
1. Seleccionar agente (del Marketplace o recientes)
2. Escribir script / subir guión
3. Seleccionar plataforma destino (Instagram, TikTok, YouTube, DOOH)
4. Configurar voz, duración, estilo
5. Enviar a cola de renderizado
6. Descargar / previsualizar resultado

**Features**:
- Vista previa de agente
- Editor de script con sugerencias IA
- Cola de renderizado (status: pending, processing, completed, failed)
- Historial de renders

---

### 5. TemplateVault (`/templates`)
**Propósito**: Plantillas premium preconfiguradas

**Estrategia de Negocio**:
- **Upselling**: Plantillas premium para diferentes nichos y campañas
- Quickstart para usuarios nuevos

**Categorías**:
- Product Launch
- Brand Awareness
- Event Promotion
- Tutorial/Edutainment
- Testimonial

**User Flow**:
1. Explorar plantillas por categoría
2. Preview de plantilla
3. Comprar / desbloquear con suscripción
4. Usar plantilla en Social Lab

---

### 6. ActiveTelemetry (`/telemetry`)
**Propósito**: Monitorización y analytics de campañas

**Estrategia de Negocio**:
- **KPIs para cliente**: Impresiones, engagement, alcance por canal
- **Memory del agente**: Los agentes recuerdan campañas pasadas y optimizan

**Métricas**:
| Métrica | Descripción |
|---------|-------------|
| Total Renders | Videos generados |
| Active Agents | Agentes en uso |
| Campaign Reach | Alcance total por canal |
| Token Usage | Tokens consumidos (facturación) |
| Agent Memory | Conversaciones/campañas recordadas |

**User Flow**:
1. Ver dashboard de métricas
2. Filtrar por agente, campaña, fecha
3. Exportar informes (PDF/CSV)
4. Configurar alertas

---

### 7. PricingPlans (`/pricing`)
**Propósito**: Gestión de suscripción y planes

**Estrategia de Negocio**:
- **Tier 1 - Atmósfera** ($X): 1 agente, texto/imagen, redes sociales
- **Tier 2 - Multiverso** ($XX): Múltiples agentes, video lip-sync, memoria, metaverso
- **Tier 3 - Deep Space** ($XXX): API, agentes personalizados, publicación autónoma, DOOH

**User Flow**:
1. Ver comparativa de planes
2. Seleccionar plan
3. Payment (Stripe)
4. Gestionar suscripción (upgrade/downgrade/cancel)

---

### 8. DeploymentSequence / VerseAds (`/deployment`)
**Propósito**: Despliegue a redes publicitarias

**Estrategia de Negocio**:
- **Interiores/Exteriores (DOOH)**: Envío a redes de aeropuertos, centros comerciales, calles
- **Metaverso**: Despliegue en Spatial, Decentraland, mundos virtuales
- **Espacio**: Colaboraciones con misiones comerciales

**User Flow**:
1. Seleccionar campaña/render
2. Elegir destino (DOOH, Metaverso, Espacio)
3. Programar fecha/hora
4. Confirmar y enviar
5. Tracking de despliegue

---

### 9. GlobalExchange (`/exchange`)
**Propósito**: Red de nodos globales y partners

**Estrategia de Negocio**:
- **Expansión**: Partners en diferentes regiones
- **Ad Exchange**: Compra/venta de espacios publicitarios

**Features**:
- Mapa de nodos activos
- Partners por región
- Exchange de espacios publicitarios
- Stats globales

---

## Flujo de Monetización

```
Cliente → Planes (Stripe)
    │
    ├─→ Starter: Acceso básico
    │
    ├─→ Pro: +Video +Memoria +Metaverso
    │
    └─→ Enterprise: +API +Custom +DOOH

Cliente → Usage (Tokens/Minutos)
    │
    ├─→ Renders de video
    ├─→ Memoria persistente
    └─→ Despliegue a canales premium
```

---

## Integraciones Técnicas

| Servicio | Uso | Dashboard |
|----------|-----|-----------|
| Supabase | DB, Auth, Realtime | Todos |
| Stripe | Pagos, Suscripciones | Planes |
| ElevenLabs | Voz IA | Social Lab |
| SyncLabs | Lip-sync | Social Lab |
| Google Analytics | Tracking | Todos |

---

## Mobile vs Desktop

- **Desktop**: Workflow completo (creación, análisis, despliegue)
- **Mobile**: Monitoreo rápido, notificaciones, approvals simples

---

## Wireframes Implementados

Los wireframes están ubicados en `src/components/wireframes/`:

| Dashboard | Archivo | Descripción |
|-----------|---------|-------------|
| SystemSpaces | `WireframeSystemSpaces.tsx` | Workflow de 4 pasos: Select Agent → Choose Space → Configure Audio → Render |
| Intelligence | `WireframeIntelligence.tsx` | Input de URL + Análisis + Resultados + Historial |
| Marketplace | `WireframeMarketplace.tsx` | Grid de agentes + Filtros + Panel de detalle |
| Social Lab | `WireframeSocialLab.tsx` | Editor de script + Cola de renderizado + Preview |
| Telemetry | `WireframeTelemetry.tsx` | KPIs + Tabla de campañas + Memoria de agentes |

---

## Próximos Pasos

1. [x] Wireframes de cada dashboard
2. [ ] Prototipo interactivo (integrar wireframes en app)
3. [ ] Tests de usabilidad con usuarios objetivo
4. [ ] Implementación responsive
5. [ ] Integración con APIs reales (no mock)
