// ============================================================
// AI CV Optimizer — Provider Factory
// ============================================================
// Reads environment variables and instantiates the correct
// AI provider. The selection is driven by the `AI_PROVIDER`
// env var (defaults to "gemini").
// ============================================================

import type { ProviderConfig, ProviderType } from '$lib/types/analysis';
import type { AIProvider } from './base';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { CloudflareProvider } from './cloudflare';

/**
 * Build a ProviderConfig from environment variables.
 *
 * We accept `env` as a Record so this can be called from
 * SvelteKit server routes using `$env/dynamic/private` or
 * passed in from `process.env` directly.
 */
export function buildConfigFromEnv(env: Record<string, string | undefined>): ProviderConfig {
  const provider = (env.AI_PROVIDER || 'gemini').toLowerCase() as ProviderType;
  const temperature = parseFloat(env.LLM_TEMPERATURE || '0.8');
  const maxTokens = parseInt(env.LLM_MAX_TOKENS || '8192', 10);

  switch (provider) {
    // ── Google Gemini ──────────────────────────────────────────
    case 'gemini': {
      const apiKey = env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(
          'AI_PROVIDER is set to "gemini" but GOOGLE_API_KEY is missing. ' +
          'Please add it to your .env file.'
        );
      }
      return {
        provider: 'gemini',
        apiKey,
        modelName: env.GOOGLE_MODEL_NAME || 'gemini-2.5-flash',
        temperature,
        maxTokens,
      };
    }

    // ── OpenAI-Compatible (Local LLM / OpenAI / etc.) ─────────
    case 'openai': {
      const baseUrl = env.OPENAI_BASE_URL;
      if (!baseUrl) {
        throw new Error(
          'AI_PROVIDER is set to "openai" but OPENAI_BASE_URL is missing. ' +
          'Set it to your OpenAI-compatible server URL, e.g.:\n' +
          '  Ollama:    http://localhost:11434/v1\n' +
          '  LM Studio: http://localhost:1234/v1\n' +
          '  OpenAI:    https://api.openai.com/v1'
        );
      }
      return {
        provider: 'openai',
        apiKey: env.OPENAI_API_KEY || 'ollama', // default for local LLMs
        baseUrl,
        modelName: env.OPENAI_MODEL_NAME || 'llama3.1',
        temperature,
        maxTokens,
      };
    }

    // ── Cloudflare Workers AI ─────────────────────────────────
    case 'cloudflare': {
      const accountId = env.CF_ACCOUNT_ID;
      const apiToken = env.CF_API_TOKEN;
      if (!accountId || !apiToken) {
        throw new Error(
          'AI_PROVIDER is set to "cloudflare" but CF_ACCOUNT_ID and/or CF_API_TOKEN are missing. ' +
          'Please add both to your .env file.'
        );
      }
      return {
        provider: 'cloudflare',
        accountId,
        apiToken,
        modelName: env.CF_MODEL_NAME || '@cf/meta/llama-3.1-70b-instruct',
        temperature,
        maxTokens,
      };
    }

    default:
      throw new Error(
        `Unknown AI_PROVIDER: "${provider}". ` +
        'Supported values: "gemini", "openai", "cloudflare".'
      );
  }
}

/**
 * Create the appropriate AIProvider instance from a config.
 */
export function createProvider(config: ProviderConfig): AIProvider {
  switch (config.provider) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'cloudflare':
      return new CloudflareProvider(config);
  }
}

/**
 * Convenience: build config from env AND create the provider in one call.
 */
export function createProviderFromEnv(env: Record<string, string | undefined>): AIProvider {
  const config = buildConfigFromEnv(env);
  console.log(`[Provider] Using AI provider: ${config.provider} (model: ${config.modelName})`);
  return createProvider(config);
}
