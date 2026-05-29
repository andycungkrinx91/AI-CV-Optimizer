# 🛠️ OpenCode Refactoring Guide — AI CV Optimizer

> **Status**: Refactor COMPLETE (2026-05-29). All 7 phases done + post-launch fixes applied.
> **Stack**: SvelteKit 2 + Svelte 5 + Vanilla CSS + Multi-Provider AI + Canvas Lightning
> **Build**: `pnpm lint` → 0 errors/warnings · `pnpm build` → clean

This guide documents both the original refactoring steps and all post-refactor fixes applied to reach the current working state.

---

## ✅ What Has Been Done

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Scaffold SvelteKit Project | ✅ Complete |
| 2 | Fix Pre-Written Server Code | ✅ Complete |
| 3 | Design System (Vanilla CSS) | ✅ Complete |
| 4 | Stores, Utilities & Components | ✅ Complete |
| 5 | Page Assembly | ✅ Complete |
| 6 | Polish & Accessibility | ✅ Complete |
| 7 | Cleanup & Deploy | ✅ Complete |
| 8 | Electric Lightning UI | ✅ Added post-launch |
| 9 | Bug Fixes & Hardening | ✅ Applied post-launch |

---

## 🐛 Post-Launch Fixes Applied

These bugs were found after the initial refactor and have been fixed:

### Fix 1 — `app.css` not imported in layout

**Symptom**: No styles applied — page showed unstyled HTML.
**Cause**: `+layout.svelte` was missing `import '../app.css'`.
**Fix**: Added import to `src/routes/+layout.svelte`.

### Fix 2 — Lightning animation stopped after 2–3 seconds

**Symptom**: Lightning bolts appeared briefly then froze.
**Cause**: Any JavaScript error inside `requestAnimationFrame` silently kills the loop — `ctx.filter` and array mutation during iteration were throwing occasionally.
**Fix** (`src/lib/components/Lightning.svelte`):
- Wrapped entire RAF body in `try/catch` — errors never propagate
- Replaced frame-based spawn check with `nextSpawnAt` timestamp scheduling
- Used in-place `splice()` instead of `filter()` + reassignment
- Added `running` flag for clean `onMount` teardown

### Fix 3 — `"Cross-site" is not valid JSON` error

**Symptom**: Analyzing CV threw `Failed to execute 'json' on 'Response': Unexpected token 'C'`.
**Root causes** (4 compounding):
1. `CF_MODEL_NAME=@cf/google/gemma-4-26b-a4b-it` doesn't exist → Cloudflare returned HTML
2. `cloudflare.ts` called `response.json()` directly — crashes on HTML body
3. `+server.ts` used `throw error()` (SvelteKit helper) → generates HTML error pages
4. `+page.svelte` called `response.json()` → crashes on HTML body

**Fixes**:
- Changed `.env`: `CF_MODEL_NAME=@cf/meta/llama-3.1-8b-instruct` (valid model)
- `cloudflare.ts`: `response.text()` → `JSON.parse()` with descriptive error
- `+server.ts`: all `throw error()` → `return json({error, message}, {status})`
- `+page.svelte`: `response.text()` → `JSON.parse()` with fallback error message

### Fix 4 — `nav[role=tablist]` a11y warning blocking build

**Symptom**: `pnpm lint` and `pnpm build` both emitted a warning for `ResultTabs.svelte`.
**Cause**: `<nav>` is an HTML5 landmark element; ARIA spec prohibits giving it `role="tablist"`.
**Fix** (`ResultTabs.svelte`): Changed `<nav>` → `<div>` for the tablist container.

---

## 🏗️ Architecture Reference

### File Map

```
src/
├── app.html                    # Shell — dark default, SVG favicon, Google Fonts, flash-prevention script
├── app.css                     # Tokens (light/dark) + electric additions (cyan neon, arc-scan, flicker)
├── routes/
│   ├── +layout.svelte          # Lightning + Header + Footer; imports app.css
│   ├── +page.svelte            # Upload → analyze → results; safe JSON parse
│   └── api/analyze/
│       └── +server.ts          # POST handler — always return json(); never throw error()
└── lib/
    ├── components/
    │   ├── Lightning.svelte    # Canvas RAF loop — try/catch + nextSpawnAt + splice
    │   ├── Header.svelte       # logo.svg, gradient title, badge, ThemeToggle
    │   ├── ThemeToggle.svelte  # Sun/moon button, btn-icon class
    │   ├── UploadForm.svelte   # Drag-drop + textarea + submit
    │   ├── ScoreBoard.svelte   # 3 gauges grid + average ring + progress bar
    │   ├── ScoreGauge.svelte   # SVG arc + RAF count-up + tone-based gradient
    │   ├── PersonaCard.svelte  # Aurora bg + bounce emoji + gradient name
    │   ├── ResultTabs.svelte   # div[role=tablist] — NOT nav (a11y!)
    │   ├── TabCorrections.svelte
    │   ├── TabSuggestions.svelte
    │   ├── TabATS.svelte
    │   ├── TabRoles.svelte
    │   ├── SkeletonLoader.svelte
    │   └── Footer.svelte
    ├── server/
    │   ├── prompt.ts           # Shared prompt + JSON schema
    │   ├── pdf.ts              # Dynamic import pdf-parse (CJS/ESM compat)
    │   └── providers/
    │       ├── base.ts         # AIProvider interface + parseAnalysisJSON
    │       ├── index.ts        # Factory: AI_PROVIDER env → provider
    │       ├── gemini.ts       # @google/generative-ai SDK
    │       ├── openai.ts       # Raw fetch — zero SDK
    │       └── cloudflare.ts   # REST + safe text→JSON.parse
    ├── stores/theme.ts
    ├── types/analysis.ts
    └── utils/clipboard.ts
static/
├── logo.svg                    # ⚡ SVG — rounded dark square + document + lightning bolt
└── logo.png                    # PNG fallback
```

### API Route Rules (NEVER Break)

```typescript
// ✅ CORRECT — always returns JSON
export const POST: RequestHandler = async ({ request }) => {
  try {
    // ...
    return json(result);
  } catch (err) {
    return json({ error: true, message: '...' }, { status: 500 });
  }
};

// ❌ WRONG — throw error() generates an HTML error page
throw error(500, 'Something failed');
```

### Client Fetch Rules (NEVER Break)

```typescript
// ✅ CORRECT — safe parse
const rawText = await response.text();
let data: unknown;
try {
  data = JSON.parse(rawText);
} catch {
  throw new Error(`Server error ${response.status}`);
}

// ❌ WRONG — crashes if server sends HTML
const data = await response.json();
```

### Lightning Loop Rules (NEVER Break)

```typescript
// ✅ CORRECT — crash-safe loop with time-based scheduling
function loop(now: number) {
  if (!running) return;
  try {
    // all drawing code here
    if (now >= nextSpawnAt) {
      spawnStrike();
      scheduleNextSpawn(now); // sets nextSpawnAt = now + random(600, 1800)
    }
  } catch (_) { /* never kill the loop */ }
  animId = requestAnimationFrame(loop);
}

// ❌ WRONG — any error kills the loop forever
function loop(now: number) {
  // unguarded code...
  if (now - lastSpawn > randomBetween(700, 2200)) { /* unpredictable */ }
  animId = requestAnimationFrame(loop);
}
```

---

## 🔧 Troubleshooting

### `pnpm lint` a11y warning about `nav[role=tablist]`

`<nav>` is a landmark element — ARIA prohibits interactive roles on it.
Use `<div role="tablist">` instead.

### Lightning stops after a few seconds

The RAF loop has died due to an unhandled error. Make sure:
1. The entire loop body is inside `try/catch`
2. `animId = requestAnimationFrame(loop)` is **outside** the try/catch (after it)
3. Spawn scheduling uses timestamp comparison (`nextSpawnAt`), not `randomBetween()` per frame

### Cloudflare returns "Cross-site..." or non-JSON

1. Verify `CF_MODEL_NAME` is a valid Cloudflare model — check https://developers.cloudflare.com/workers-ai/models/
2. `@cf/google/gemma-4-26b-a4b-it` does NOT exist
3. Use `response.text()` → `JSON.parse()` (never `response.json()`) in the provider

### API returns HTML instead of JSON

The server route is using `throw error()` from `@sveltejs/kit`. Replace with:
```typescript
return json({ error: true, message: '...' }, { status: 400 });
```

### `pdf-parse` ESM issues

```typescript
// src/lib/server/pdf.ts
const pdfParse = (await import('pdf-parse')).default;
```

### Gemini SDK — structured output

```typescript
// Use responseMimeType + responseSchema in generationConfig
// Fallback: parse response text with JSON.parse() in try/catch
```

### OpenAI-compatible — Ollama connection refused

```
1. Start Ollama: ollama serve
2. Correct URL: http://localhost:11434/v1 (not /api)
3. Pull model: ollama pull llama3.1
4. No trailing slash in OPENAI_BASE_URL
```

### OpenAI-compatible — model doesn't return valid JSON

```
1. Try a larger model (70B instead of 8B)
2. parseAnalysisJSON strips markdown fences automatically
3. Set LLM_TEMPERATURE=0.3 for more deterministic output
```

### Cloudflare 401 Unauthorized

```
1. CF_API_TOKEN needs "Workers AI" permission
2. Dashboard → My Profile → API Tokens → Create Token
3. Verify CF_ACCOUNT_ID (Dashboard → Workers & Pages → sidebar)
```

### Dark Mode Flash on Load

Already handled in `app.html`:
```html
<html data-theme="dark">
<script>
  (function(){
    const saved = localStorage.getItem('theme');
    const t = saved || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

---

## 📋 Maintenance Checklist

Before every commit / feature addition:

```bash
pnpm lint    # must be 0 errors AND 0 warnings
pnpm build   # must succeed cleanly
```

Key invariants to preserve:
- [ ] `+server.ts` uses `return json()` for ALL responses
- [ ] `+page.svelte` uses `text()` → `JSON.parse()` (not `response.json()`)
- [ ] `cloudflare.ts` uses `text()` → `JSON.parse()` (not `response.json()`)
- [ ] `Lightning.svelte` RAF loop body is inside `try/catch`
- [ ] `Lightning.svelte` uses `nextSpawnAt` timestamp (not per-frame random)
- [ ] `ResultTabs.svelte` uses `<div role="tablist">` (not `<nav>`)
- [ ] `CF_MODEL_NAME` in `.env` is a valid Cloudflare model
- [ ] `app.css` is imported in `+layout.svelte`
- [ ] No Tailwind anywhere
- [ ] All components use `$props()` not `export let`
