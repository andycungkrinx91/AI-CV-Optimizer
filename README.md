# AI CV Optimizer

> AI-powered CV analysis for better match scores, cleaner writing, and stronger ATS results — with an electric lightning UI.

![SvelteKit](https://img.shields.io/badge/SvelteKit-ff3e00?logo=svelte&logoColor=white)
![Svelte 5](https://img.shields.io/badge/Svelte_5-ff3e00?logo=svelte&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-4e4e4e?logo=pnpm&logoColor=f69220)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)

## What it does

- 📊 Animated SVG score gauges — CV Match, ATS Score, Role Fit
- 🧠 Persona analysis with creative character-style name, emoji & description
- ✍️ AI rewrite suggestions for professional summary and experience sections
- ⚠️ ATS feedback and missing keyword hints
- 🎯 Suggested roles with match score bars
- ⚡ Continuous canvas-based electric lightning background animation
- 🌑 Dark-first design (defaults to dark/electric mode)
- 📱 Fully responsive — works from 320 px up

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | ✨ SvelteKit 2 + Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`) |
| Styling | 🎨 Vanilla CSS + design tokens — **no Tailwind** |
| UI Effect | ⚡ Canvas lightning engine (`Lightning.svelte`) — recursive midpoint-displacement, spark particles, ambient aurora |
| Logo | 🎨 SVG logo (`static/logo.svg`) — document + lightning bolt, cyan-to-violet gradient |
| PDF parsing | 📄 `pdf-parse` (server-side, Node.js) |
| AI providers | 🤖 Gemini / OpenAI-compatible / Cloudflare Workers AI |
| Package manager | 📦 pnpm |
| Production | 🚀 `@sveltejs/adapter-node` |

## Quick start

```bash
# 1 — install
pnpm install

# 2 — configure (see provider options below)
cp .env.example .env
# edit .env with your chosen AI provider credentials

# 3 — run
pnpm dev        # → http://localhost:5173
```

## Choose one AI provider

Edit `.env` — only fill in the section for the provider you want.

### Gemini (recommended)
```env
AI_PROVIDER=gemini
GOOGLE_API_KEY=paste_your_google_ai_api_key_here
GOOGLE_MODEL_NAME=gemini-2.5-flash
```

### OpenAI-compatible (Ollama / LM Studio / OpenAI / Groq)
```env
AI_PROVIDER=openai
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL_NAME=llama3.1
```

### Cloudflare Workers AI (free tier)
```env
AI_PROVIDER=cloudflare
CF_ACCOUNT_ID=your_account_id_here
CF_API_TOKEN=your_api_token_here
# Valid model names:
CF_MODEL_NAME=@cf/meta/llama-3.1-8b-instruct     # fast, free tier
# CF_MODEL_NAME=@cf/meta/llama-3.1-70b-instruct  # best quality
# CF_MODEL_NAME=@cf/google/gemma-7b-it            # Google's Gemma
```

> [!IMPORTANT]
> The model `@cf/google/gemma-4-26b-a4b-it` is **NOT** a valid Cloudflare model and will cause errors.
> Use one of the models listed above.

## General settings (optional)

```env
LLM_TEMPERATURE=0.8
LLM_MAX_TOKENS=8192
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server → http://localhost:5173 |
| `pnpm check` / `pnpm lint` | Svelte + TypeScript type checking |
| `pnpm build` | Production build (outputs to `build/`) |
| `pnpm start` | Run production server after build (loads `.env`) |

## Project structure

```
src/
├── app.html                        # HTML shell — dark-mode flash prevention, SVG favicon
├── app.css                         # Global tokens, utilities, electric lightning CSS
├── routes/
│   ├── +layout.svelte              # Lightning canvas + Header + Footer wrapper
│   ├── +page.svelte                # Main page — upload form + results
│   └── api/analyze/+server.ts      # POST /api/analyze — always returns JSON
└── lib/
    ├── components/
    │   ├── Lightning.svelte         # ⚡ Canvas lightning engine (continuous, crash-safe)
    │   ├── Header.svelte            # Logo + gradient title + ThemeToggle
    │   ├── ThemeToggle.svelte       # Sun/moon button
    │   ├── UploadForm.svelte        # Drag-drop PDF + job description textarea
    │   ├── ScoreBoard.svelte        # 3 animated score gauges
    │   ├── ScoreGauge.svelte        # SVG arc gauge with count-up animation
    │   ├── PersonaCard.svelte       # Persona name, emoji, aurora background
    │   ├── ResultTabs.svelte        # 4-tab panel (div[role=tablist], not nav)
    │   ├── TabCorrections.svelte    # AI-rewritten summary + experience
    │   ├── TabSuggestions.svelte    # Numbered strategic suggestions
    │   ├── TabATS.svelte            # ATS warning items
    │   ├── TabRoles.svelte          # Suggested roles with score bars
    │   ├── SkeletonLoader.svelte    # Shimmer skeleton during AI processing
    │   └── Footer.svelte            # Copyright + LinkedIn link
    ├── server/
    │   ├── prompt.ts               # Shared AI prompt + JSON schema
    │   ├── pdf.ts                  # PDF text extraction
    │   └── providers/
    │       ├── base.ts             # AIProvider interface + parseAnalysisJSON
    │       ├── index.ts            # Factory: reads AI_PROVIDER env → creates provider
    │       ├── gemini.ts           # Google Gemini
    │       ├── openai.ts           # OpenAI-compatible (Ollama, LM Studio, Groq…)
    │       └── cloudflare.ts       # Cloudflare Workers AI (safe JSON parse)
    ├── stores/theme.ts             # Dark/light mode store
    ├── types/analysis.ts           # AnalysisResult, ProviderType types
    └── utils/clipboard.ts          # copyToClipboard helper
static/
├── logo.svg                        # ⚡ SVG logo — document + lightning bolt icon
└── logo.png                        # Fallback PNG logo
```

## API contract

`POST /api/analyze` — `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `cv_file` | PDF file ≤10 MB | Candidate CV |
| `job_description` | string | Target job description |

**Always returns JSON** — even on error:
```json
// success
{ "match_score": 82, "ats_score": 74, ... }

// error
{ "error": true, "message": "Descriptive error message" }
```

## Known good Cloudflare models

| Model | Speed | Quality |
|-------|-------|---------|
| `@cf/meta/llama-3.1-8b-instruct` | ⚡ Fast | Good |
| `@cf/meta/llama-3.1-70b-instruct` | 🐢 Slow | Best |
| `@cf/mistral/mistral-7b-instruct-v0.2` | ⚡ Fast | Good |
| `@cf/google/gemma-7b-it` | ⚡ Fast | Good |

## Maintenance notes

- Keep `.env.example` in sync with `.env`
- `Lightning.svelte` loop is wrapped in `try/catch` — errors never kill the animation
- API route (`+server.ts`) uses `return json()` for ALL responses — never `throw error()` (which generates HTML)
- `ResultTabs.svelte` uses `<div role="tablist">` not `<nav role="tablist">` (a11y rule)
