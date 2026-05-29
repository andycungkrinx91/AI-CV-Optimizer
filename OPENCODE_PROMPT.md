# OpenCode Prompt — AI CV Optimizer (Fullstack SvelteKit)

> **Status**: Refactor COMPLETE. Use this prompt for future feature additions or modifications.

Copy everything below the `---` and paste into OpenCode.

---

Read the skill at `~/.agents/skills/modern-full-stack/SKILL.md`. Route this task using:
- `references/svelte-code-writer.md` — SvelteKit routes, server actions, API routes, runes
- `references/svelte-components.md` — component API design, accessibility, responsive layout
- `references/ai-sdk.md` — AI model integration, structured output, error handling
- `references/full-stack-workflows.md` — **Workflow 2: SvelteKit-Only App**
- `references/quality-checklist.md` — final review before completion

Then read the project context:
- `PRD.md` — full product requirements (v2.1 — current implemented state)
- `README.md` — tech stack, quick start, project structure, API contract
- `.env` — current provider configuration

## Current State (Already Implemented)

This project has been fully refactored from Python (FastAPI + Streamlit) to a **single fullstack SvelteKit application**. All phases are complete.

### What Exists

**Server (Node.js / SvelteKit):**
- `src/routes/api/analyze/+server.ts` — POST handler; uses `return json()` for ALL responses (never `throw error()`)
- `src/lib/server/prompt.ts` — shared AI prompt + JSON schema
- `src/lib/server/pdf.ts` — PDF text extraction via pdf-parse (dynamic import for CJS/ESM)
- `src/lib/server/providers/base.ts` — AIProvider interface + parseAnalysisJSON
- `src/lib/server/providers/index.ts` — factory (reads `AI_PROVIDER` from `$env/dynamic/private`)
- `src/lib/server/providers/gemini.ts` — Google Gemini (`@google/generative-ai` SDK)
- `src/lib/server/providers/openai.ts` — OpenAI-compatible (raw fetch — Ollama, LM Studio, Groq, OpenAI)
- `src/lib/server/providers/cloudflare.ts` — Cloudflare Workers AI (safe text→JSON.parse; clear error messages)

**UI (Svelte 5 runes):**
- `src/routes/+layout.svelte` — Lightning canvas + Header + Footer; imports `app.css`
- `src/routes/+page.svelte` — main page; uses `response.text()` → `JSON.parse()` (never `response.json()` directly)
- `src/lib/components/Lightning.svelte` — continuous canvas lightning: recursive midpoint-displacement bolts, sparks, aurora; `try/catch` guarded RAF loop; time-based spawn scheduling
- `src/lib/components/Header.svelte` — SVG logo (`logo.svg`), gradient title, badge, ThemeToggle
- `src/lib/components/ThemeToggle.svelte` — sun/moon icon toggle
- `src/lib/components/UploadForm.svelte` — drag-drop PDF zone + textarea + submit button
- `src/lib/components/ScoreBoard.svelte` — 3 animated gauge grid + average ring + progress bar
- `src/lib/components/ScoreGauge.svelte` — SVG arc with count-up animation, gradient by score tone
- `src/lib/components/PersonaCard.svelte` — aurora bg, bouncing emoji, gradient name
- `src/lib/components/ResultTabs.svelte` — `<div role="tablist">` (NOT `<nav>` — a11y rule)
- `src/lib/components/TabCorrections.svelte` — monospace blocks with copy buttons
- `src/lib/components/TabSuggestions.svelte` — numbered mini-cards
- `src/lib/components/TabATS.svelte` — warning-styled items
- `src/lib/components/TabRoles.svelte` — score bars with "Top Match" badge
- `src/lib/components/SkeletonLoader.svelte` — shimmer skeleton + progress animation
- `src/lib/components/Footer.svelte` — copyright + LinkedIn

**Assets:**
- `static/logo.svg` — SVG logo: rounded dark square + document shape + lightning bolt (cyan→violet gradient)
- `static/logo.png` — PNG fallback
- `src/app.css` — design tokens (light + dark) + electric lightning additions (cyan neon, arc-scan, flicker)
- `src/app.html` — dark default, SVG favicon, Inter + JetBrains Mono fonts

### Critical Rules (Must Not Break)

1. **API always returns JSON** — use `return json({error, message}, {status})` for errors, never `throw error()`
2. **Client uses safe JSON parse** — `response.text()` then `JSON.parse()` with try/catch
3. **Lightning loop never dies** — `try/catch` inside RAF callback; `nextSpawnAt` for reliable scheduling
4. **Cloudflare provider** — `response.text()` then `JSON.parse()` (never `response.json()` directly — Cloudflare may return HTML on error)
5. **Valid Cloudflare models only** — `@cf/meta/llama-3.1-8b-instruct`, `@cf/meta/llama-3.1-70b-instruct`, `@cf/google/gemma-7b-it`. NOT `@cf/google/gemma-4-26b-a4b-it`
6. **TabList** — use `<div role="tablist">` not `<nav role="tablist">` (Svelte a11y enforced)
7. **Svelte 5 runes** — `$props()`, `$state`, `$derived`, `$effect`. No `export let`, no `$:` labels
8. **Vanilla CSS only** — no Tailwind. All tokens in `app.css`
9. **Dark mode default** — `app.html` defaults `data-theme="dark"`, falls back to localStorage

### Environment

```env
AI_PROVIDER=cloudflare          # gemini | openai | cloudflare
LLM_TEMPERATURE=0.8
LLM_MAX_TOKENS=8192

# Gemini
# GOOGLE_API_KEY=...
# GOOGLE_MODEL_NAME=gemini-2.5-flash

# OpenAI-compatible
# OPENAI_BASE_URL=http://localhost:11434/v1
# OPENAI_API_KEY=ollama
# OPENAI_MODEL_NAME=llama3.1

# Cloudflare Workers AI
CF_ACCOUNT_ID=...
CF_API_TOKEN=...
CF_MODEL_NAME=@cf/meta/llama-3.1-8b-instruct
```

## Task

[Describe your task here — e.g., "Add streaming support", "Add a new AI provider", "Add CV download as PDF"]

## Rules

- Output complete files, not fragments
- Vanilla CSS with custom properties — NO Tailwind
- Svelte 5 runes — NO `export let`, NO `$:` labels
- `$lib/server/` for all server-only code
- `$env/dynamic/private` for env vars (not `process.env`)
- API route must always `return json()`, never `throw error()`
- Client must use `response.text()` → `JSON.parse()` pattern
- Lightning loop must stay `try/catch` guarded and use `nextSpawnAt` scheduling
- `pnpm lint` must pass with 0 errors and 0 warnings before declaring done
- `pnpm build` must succeed before declaring done
- Summarize changed files after completion
