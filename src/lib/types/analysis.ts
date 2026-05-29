// ============================================================
// AI CV Optimizer — Shared Types
// ============================================================

/**
 * Supported AI provider backends.
 *
 * - gemini     → Google Generative AI (Gemini 2.5 Flash / Pro)
 * - openai     → Any OpenAI-compatible API (Ollama, LM Studio, vLLM, OpenAI itself, etc.)
 * - cloudflare → Cloudflare Workers AI (REST API)
 */
export type ProviderType = 'gemini' | 'openai' | 'cloudflare';

// ---- Analysis Result -------------------------------------------------------

export interface JobRole {
  role: string;
  score: number;
}

export interface AnalysisResult {
  match_score: number;
  ats_score: number;
  persona_name: string;
  persona_description: string;
  persona_emoji: string;
  correction_feedback: string;
  optimization_suggestions: string[];
  ats_suggestions: string[];
  suggested_job_roles: JobRole[];
  corrected_cv_summary: string;
  corrected_cv_experience: string;
}

// ---- Frontend State --------------------------------------------------------

export interface AnalysisState {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

// ---- Provider Configuration ------------------------------------------------

/** Base config shared by every provider. */
export interface BaseProviderConfig {
  temperature: number;
  maxTokens: number;
}

export interface GeminiConfig extends BaseProviderConfig {
  provider: 'gemini';
  apiKey: string;
  modelName: string;
}

export interface OpenAIConfig extends BaseProviderConfig {
  provider: 'openai';
  apiKey: string;         // can be "ollama" or any dummy value for local LLMs
  baseUrl: string;        // e.g. http://localhost:11434/v1  (Ollama)
  modelName: string;      // e.g. llama3.1, mistral, gpt-4o, etc.
}

export interface CloudflareConfig extends BaseProviderConfig {
  provider: 'cloudflare';
  accountId: string;
  apiToken: string;
  modelName: string;      // e.g. @cf/meta/llama-3.1-70b-instruct
}

export type ProviderConfig = GeminiConfig | OpenAIConfig | CloudflareConfig;
