# 📋 PRD: AI CV Optimizer — Fullstack SvelteKit

> **Version**: 2.1 (Current — Implemented)
> **Date**: 2026-05-29
> **Status**: ✅ Implemented & Deployed
> **Stack**: SvelteKit 2 + Svelte 5 + Vanilla CSS + Multi-Provider AI

---

## 1. Product Vision

**AI CV Optimizer** is an AI-powered web application that helps job seekers improve their CVs by providing personalized scores, persona analysis, AI-powered rewrites, and actionable suggestions — all tailored to a specific target job role.

The app runs as a **single fullstack SvelteKit application** with no separate backend, no Python, and no Docker required.

### 1.1 What Was Delivered

| Goal | Status |
|------|--------|
| No separate backend — all logic in SvelteKit server routes | ✅ |
| No Python dependency — entire stack on Node.js | ✅ |
| No Docker required for development | ✅ |
| No LangChain / FAISS — full CV text → AI directly | ✅ |
| No Tailwind — Vanilla CSS with design tokens | ✅ |
| Multi-provider AI (Gemini, OpenAI-compatible, Cloudflare) | ✅ |
| Electric lightning UI with canvas animation | ✅ |
| SVG logo — document + lightning bolt motif | ✅ |
| Always-JSON API (never returns HTML on errors) | ✅ |
| a11y: 0 errors, 0 warnings (`pnpm lint`) | ✅ |
| Clean production build (`pnpm build`) | ✅ |

---

## 2. Architecture

### 2.1 Data Flow

```
Browser → POST /api/analyze (multipart/form-data)
  → +server.ts: validates, extracts PDF text (pdf-parse)
  → Provider factory (reads AI_PROVIDER env var)
  → [GeminiProvider | OpenAIProvider | CloudflareProvider]
  → AI API call → structured JSON response
  → return json(result)  ← always JSON, even on error
Browser renders results with animations
```

### 2.2 File Structure

```
AI-CV-Optimizer/
├── src/
│   ├── app.html                    # HTML shell, SVG favicon, dark-mode flash prevention
│   ├── app.css                     # Global design tokens + electric lightning CSS additions
│   ├── routes/
│   │   ├── +layout.svelte          # Lightning canvas + Header + Footer
│   │   ├── +page.svelte            # Upload form + results (safe JSON parse)
│   │   └── api/analyze/
│   │       └── +server.ts          # POST handler — return json() for ALL responses
│   └── lib/
│       ├── components/
│       │   ├── Lightning.svelte    # ⚡ Canvas lightning (continuous, try/catch guarded)
│       │   ├── Header.svelte       # Logo (logo.svg), gradient title, ThemeToggle
│       │   ├── ThemeToggle.svelte  # Sun/moon icon button
│       │   ├── UploadForm.svelte   # Drag-drop zone + textarea + submit button
│       │   ├── ScoreBoard.svelte   # 3 gauges in responsive grid
│       │   ├── ScoreGauge.svelte   # Animated SVG arc + count-up
│       │   ├── PersonaCard.svelte  # Aurora bg, bounce emoji, gradient name
│       │   ├── ResultTabs.svelte   # div[role=tablist] (not nav — a11y)
│       │   ├── TabCorrections.svelte
│       │   ├── TabSuggestions.svelte
│       │   ├── TabATS.svelte
│       │   ├── TabRoles.svelte
│       │   ├── SkeletonLoader.svelte
│       │   └── Footer.svelte
│       ├── server/
│       │   ├── prompt.ts           # Shared AI prompt + JSON schema
│       │   ├── pdf.ts              # pdf-parse (dynamic import for CJS/ESM compat)
│       │   └── providers/
│       │       ├── base.ts         # AIProvider interface + parseAnalysisJSON
│       │       ├── index.ts        # Factory: AI_PROVIDER → provider instance
│       │       ├── gemini.ts       # @google/generative-ai SDK
│       │       ├── openai.ts       # Raw fetch (zero SDK) — Ollama/LM Studio/Groq/OpenAI
│       │       └── cloudflare.ts   # REST API — safe text()→JSON.parse(), clear errors
│       ├── stores/theme.ts         # Dark/light mode store (localStorage → data-theme)
│       ├── types/analysis.ts       # AnalysisResult, ProviderType, config types
│       └── utils/clipboard.ts      # copyToClipboard(text)
├── static/
│   ├── logo.svg                    # ⚡ SVG logo — document shape + lightning bolt
│   └── logo.png                    # Fallback PNG
├── .env                            # Active config (not committed)
├── .env.example                    # Template with all 3 providers
├── svelte.config.js                # adapter-node
├── vite.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── PRD.md
├── OPENCODE_PROMPT.md
└── OPENCODE_REFACTORING_GUIDE.md
```

---

## 3. Multi-Provider AI

All providers implement the same interface and return the same JSON schema:

```typescript
interface AIProvider {
  readonly name: string;
  analyzeCV(cvText: string, jobDescription: string): Promise<AnalysisResult>;
}
```

| Provider | `AI_PROVIDER` | Transport | Notes |
|----------|--------------|-----------|-------|
| Google Gemini | `gemini` | `@google/generative-ai` SDK | Native JSON schema support |
| OpenAI-compatible | `openai` | Raw `fetch()` | Ollama, LM Studio, Groq, Together AI, OpenAI |
| Cloudflare Workers AI | `cloudflare` | REST `fetch()` | Free tier; use valid model names only |

### Valid Cloudflare Model Names

```
@cf/meta/llama-3.1-8b-instruct        ← recommended (fast, free)
@cf/meta/llama-3.1-70b-instruct       ← best quality
@cf/mistral/mistral-7b-instruct-v0.2
@cf/google/gemma-7b-it
```

> [!CAUTION]
> `@cf/google/gemma-4-26b-a4b-it` does **NOT exist** in Cloudflare's catalog. Using it returns an HTML error page that causes a JSON parse failure. Always verify model names at https://developers.cloudflare.com/workers-ai/models/

---

## 4. API Contract

### `POST /api/analyze`

**Request**: `multipart/form-data`
- `cv_file` — PDF file, max 10 MB
- `job_description` — plain text string

**Response**: always `application/json`

```typescript
// Success (HTTP 200)
interface AnalysisResult {
  match_score: number;                         // 0–100
  ats_score: number;                           // 0–100
  role_fit_score: number;                      // 0–100
  persona_name: string;
  persona_description: string;
  persona_emoji: string;
  correction_feedback: string;
  optimization_suggestions: string[];
  ats_suggestions: string[];
  suggested_job_roles: Array<{ role: string; score: number }>;
  corrected_cv_summary: string;
  corrected_cv_experience: string;
}

// Error (HTTP 400 / 422 / 500)
{ error: true; message: string }
```

> [!IMPORTANT]
> The server route uses `return json()` for ALL responses — including errors.
> It never uses `throw error()` (SvelteKit helper), which generates HTML error pages.
> The client always does `response.text()` → `JSON.parse()` with a safe fallback.

---

## 5. Environment Variables

### Global

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | `gemini` \| `openai` \| `cloudflare` | `gemini` |
| `LLM_TEMPERATURE` | Generation temperature | `0.8` |
| `LLM_MAX_TOKENS` | Max output tokens | `8192` |

### Google Gemini (`AI_PROVIDER=gemini`)

| Variable | Required |
|----------|----------|
| `GOOGLE_API_KEY` | ✅ |
| `GOOGLE_MODEL_NAME` | ❌ (default: `gemini-2.5-flash`) |

### OpenAI-compatible (`AI_PROVIDER=openai`)

| Variable | Required |
|----------|----------|
| `OPENAI_BASE_URL` | ✅ (e.g. `http://localhost:11434/v1`) |
| `OPENAI_API_KEY` | ❌ (use `ollama` for local LLMs) |
| `OPENAI_MODEL_NAME` | ❌ (default: `llama3.1`) |

### Cloudflare Workers AI (`AI_PROVIDER=cloudflare`)

| Variable | Required |
|----------|----------|
| `CF_ACCOUNT_ID` | ✅ |
| `CF_API_TOKEN` | ✅ (needs Workers AI permission) |
| `CF_MODEL_NAME` | ❌ (default: `@cf/meta/llama-3.1-8b-instruct`) |

---

## 6. Design System

### 6.1 CSS Architecture

- **Token-based Vanilla CSS** — `app.css` defines all tokens as CSS custom properties
- **Light mode** → `:root` (defaults)
- **Dark mode** → `[data-theme='dark']` overrides
- **Electric additions** — appended section in `app.css` with cyan neon overrides for dark mode
- **Default theme**: dark (electric lightning looks best on dark)
- **No Tailwind anywhere**

### 6.2 Key CSS Custom Properties (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | `#03010c` | Storm-black page background |
| `--bg-surface` | `#0b0818` | Card backgrounds |
| `--brand` | `#00d4ff` | Cyan — primary accent |
| `--brand-2` | `#38bdf8` | Sky blue — secondary accent |
| `--border` | `rgba(0,212,255,0.12)` | Subtle neon borders |
| `--shadow-md` | Electric glow + deep shadow | Cards |

### 6.3 Typography

- **Primary**: `Inter` 400–900 (Google Fonts)
- **Monospace**: `JetBrains Mono` 400–600 (Google Fonts)
- **Heading scale**: `clamp()` responsive sizing

### 6.4 Animations

| Effect | Implementation |
|--------|---------------|
| ⚡ Lightning bolts | Canvas `requestAnimationFrame` — recursive midpoint-displacement algorithm |
| Spark particles | Canvas — gravity physics, fade-out lifecycle |
| Ambient aurora | Canvas — pulsing radial gradients, always running |
| Electric flicker on load | CSS `@keyframes electricFlicker` on `.layout-root` |
| Arc scan on card hover | CSS `@keyframes arcScan` on `.card::after` |
| Score gauge count-up | RAF-based easing in `ScoreGauge.svelte` |
| Shimmer skeleton | CSS `@keyframes shimmer` on `.shimmer::after` |
| Gradient text shimmer | CSS `@keyframes textShimmer` on `.gradient-text` |
| Theme switch | 220ms transition on all CSS custom properties |

---

## 7. Svelte 5 Rules (Enforced)

- `$props()` — component inputs (NOT `export let`)
- `$state` — reactive state (NOT plain `let`)
- `$derived` — computed values (NOT `$:` labels)
- `$effect` — DOM side effects only (sparingly)
- `<script lang="ts">` — all components use TypeScript
- `$lib/server/` — server-only modules
- `$env/dynamic/private` — env vars (NOT `process.env`)

---

## 8. Known Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| `"Cross-site" is not valid JSON` | Invalid CF model → HTML error page → `response.json()` crash | Safe `text()→JSON.parse()` in client and provider; fixed model name |
| Lightning stops after 2–3s | Unhandled error in RAF loop killed the loop | `try/catch` wrapper; time-based spawn scheduling |
| `nav[role=tablist]` a11y warning | `<nav>` is a landmark, can't have interactive role | Changed to `<div role="tablist">` |
| Dark mode not applying | `app.css` not imported in `+layout.svelte` | Added `import '../app.css'` |
| `throw error()` returning HTML | SvelteKit `error()` helper produces HTML pages | Changed all to `return json({error, message}, {status})` |

---

## 9. Acceptance Criteria

- [x] User can upload PDF CV + paste job description
- [x] POST `/api/analyze` always returns JSON (success or error)
- [x] Gemini provider works (`AI_PROVIDER=gemini`)
- [x] OpenAI-compatible provider works (`AI_PROVIDER=openai`)
- [x] Cloudflare provider works with valid models (`AI_PROVIDER=cloudflare`)
- [x] Animated score gauges display correctly
- [x] Persona card renders with emoji, name, description
- [x] All 4 result tabs render correctly
- [x] Electric lightning animation runs continuously without stopping
- [x] SVG logo displays in header, footer, and favicon
- [x] Dark mode is default; toggle works and persists
- [x] Responsive layout on mobile (320px+)
- [x] `pnpm lint` — 0 errors, 0 warnings
- [x] `pnpm build` — clean production build
- [x] No Python, no Docker required

---

## 10. Out of Scope (v1)

- User authentication / login
- CV history / saved analyses
- Multiple file upload
- Download optimized CV as PDF
- Real-time streaming of AI response
- Database storage
- Tailwind CSS
