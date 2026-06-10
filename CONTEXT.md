# CONTEXT.md — EtherAgent OS Architectural Directives
# ═══════════════════════════════════════════════════
# ESTE ARCHIVO ES EL ESCUDO PROTECTOR DEL SISTEMA.
# Cualquier IA o desarrollador que opere sobre este codebase
# DEBE leer y respetar estas directrices antes de cualquier cambio.
# ═══════════════════════════════════════════════════

## 🚨 DIRECTIVA CRÍTICA: Command Hub Deprecado (Junio 2026)

**El módulo `CommandHub.tsx` está PERMANENTEMENTE DEPRECADO y ha sido eliminado.**

Todas las ingestiones de URL y creación de campañas ocurren EXCLUSIVAMENTE
en el módulo **`NexusBrain.tsx`** (`/dashboard/nexus-brain`).

**ESTÁ PROHIBIDO:**
- Recrear un componente `CommandHub` o cualquier punto de ingestión redundante.
- Añadir rutas que apunten a `/dashboard/hub` (redirige automáticamente a nexus-brain).
- Crear módulos alternativos que soliciten URLs para iniciar campañas.

## 🚨 DIRECTIVA CRÍTICA: Social Lab 100% Dinámico

**El `SocialLab.tsx` NO debe contener mocks ni datos estáticos.**

- Todo el contenido debe ser consumido dinámicamente desde la tabla `nexus_youtube_ads` en Supabase.
- El ID de campaña se recibe via URL param: `/dashboard/social?campaign={id}`.
- Las transcripciones, ángulos, guiones y descripciones visuales provienen del campo `campaign_data` (JSON).
- Si no hay campaña activa, se muestra un empty state con enlace al Nexus Brain.

**ESTÁ PROHIBIDO:**
- Hardcodear diálogos de agentes (ej: "pavos", "Campaña Cero", "Mafia Aviar").
- Usar `sessionStorage` como puente de datos entre módulos.
- Insertar URLs de video fallback (ej: BigBuckBunny).

## 📐 DIRECTIVA DE DISEÑO: Cupertino Dark + Glassmorphism

- Fondo base: `bg-[#050505]` o `bg-black`
- Glassmorphism: `bg-zinc-900/40 backdrop-blur-md border border-white/5`
- Color primario: `emerald-500` (shadows: `shadow-[0_0_30px_rgba(16,185,129,0.3)]`)
- Color secundario: `indigo-500`
- Tipografía mono: `font-mono text-[10px] uppercase tracking-widest`
- Avatares de agentes: figuras humanas sobrias y realistas (NO cartoon, NO anime)

## 🔐 DIRECTIVA DE SEGURIDAD: Bypass de Paywall Admin

- El hook `useTokenBalance` otorga `isInfinite: true` y `999999` tokens al email `davicho4522@gmail.com`.
- Este bypass NUNCA debe ser removido ni alterado.
- Para usuarios normales, el paywall funciona con la tabla `profiles` de Supabase.

## 🏗️ ARQUITECTURA DE FLUJO (Pipeline End-to-End)

```
[Usuario] → NexusBrain (URL input)
         → Edge Function `nexus-brain` (scraping + AI)
         → Supabase `nexus_youtube_ads` (persistencia)
         → Redirect → SocialLab?campaign={id}
         → Fetch dinámico → Renderizado de campaña real
```

## 🚨 DIRECTIVA CRÍTICA: Supabase Edge Functions — CORS y Seguridad

**Todas las Supabase Edge Functions deben cumplir:**
- Importaciones mediante URLs HTTPS absolutas de Deno/esm.sh (NO imports estilo Node).
- El preflight OPTIONS debe ser la primera línea del handler con `status: 200` explícito.
- Todo el procesamiento debe ir dentro de try/catch que retorne `corsHeaders` incluso en errores 500.
- Nunca usar type annotations en catch clauses (`catch (error)` sin `: any`).

**ESTÁ PROHIBIDO:**
- Usar importaciones estilo Node (`@/` o sin URL completa) a menos que exista `import_map.json`.
- Devolver preflight sin `status: 200` explícito (causa error CORS falso positivo).
- Dejar RLS desactivado en tablas públicas (riesgo de seguridad crítica).

## 📁 TABLA DE MÓDULOS ACTIVOS

| Módulo | Ruta | Estado |
|--------|------|--------|
| NexusBrain | `/dashboard/nexus-brain` | ✅ ACTIVO - Punto único de ingestión |
| SocialLab | `/dashboard/social` | ✅ ACTIVO - 100% dinámico |
| CommandHub | ~~`/dashboard/hub`~~ | ❌ DEPRECADO - Redirige a nexus-brain |
| EtherAgentWelcome | `/dashboard` | ✅ ACTIVO - Landing del OS |
