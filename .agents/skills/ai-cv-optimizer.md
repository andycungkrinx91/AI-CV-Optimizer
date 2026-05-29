# ai-cv-optimizer

Maintainer guidance for the AI CV Optimizer fullstack SvelteKit app.

## Use when
- updating README, setup docs, or environment variables
- changing provider behavior, prompt shape, or API contracts
- maintaining SvelteKit routes, runes components, or PDF parsing
- preparing the repo for non-coder users or future agentic maintenance

## Priority rules
1. Keep the app pnpm-first.
2. Keep `.env`, `.env.example`, and `README.md` aligned.
3. Do not commit secrets or provider keys.
4. Preserve the shared prompt/schema contract across all providers.
5. Run `pnpm check` and `pnpm build` before finishing.

## Non-coder friendly setup
- README must show the shortest path:
  - `pnpm install`
  - `pnpm dev`
- Document only one provider at a time.
- Use plain language for environment variables.
- Prefer copy/paste examples over architecture explanations.

## Maintenance workflow
1. Read the current README and env files.
2. Identify what changed: docs, config, UI, provider, or prompt.
3. Update all related files together.
4. Keep examples consistent with the actual code.
5. Verify with type-check and build.

## Important files
- `README.md` — user onboarding and quick start
- `.env` — local defaults and easy setup comments
- `.env.example` — shareable template
- `src/lib/server/prompt.ts` — canonical prompt/schema
- `src/lib/server/providers/*` — provider implementations
- `src/routes/api/analyze/+server.ts` — request parsing and response

## Gotchas
- If provider fields change, update the prompt schema and parser together.
- If env vars change, update README + `.env.example` + `.env` in the same change.
- If the UX changes, make sure the README screenshots/steps still match.
- If copying text from the Python version, preserve intent, not just wording.

## Done checklist
- [ ] README is readable for non-coders
- [ ] `.env` has clear defaults and comments
- [ ] pnpm is the documented package manager
- [ ] skill file matches the current app structure
- [ ] `pnpm check` passes
- [ ] `pnpm build` passes
