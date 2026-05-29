// ============================================================
// AI CV Optimizer — OpenAI-Compatible Provider
// ============================================================
// Works with ANY OpenAI-compatible API:
//   • OpenAI itself (api.openai.com)
//   • Ollama       (localhost:11434/v1)
//   • LM Studio    (localhost:1234/v1)
//   • vLLM         (localhost:8000/v1)
//   • LocalAI      (localhost:8080/v1)
//   • Together AI, Groq, Fireworks, etc.
//
// Uses the standard OpenAI Chat Completions API.
// No SDK dependency — plain fetch() for zero bloat.
// ============================================================

import type { OpenAIConfig } from '$lib/types/analysis';
import type { AIProvider } from './base';
import { parseAnalysisJSON } from './base';
import { buildPrompt, SYSTEM_PROMPT, ANALYSIS_JSON_SCHEMA } from '../prompt';

export class OpenAIProvider implements AIProvider {
  readonly name: string;
  private readonly config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    // Include the base URL in the name for clarity in logs
    this.name = `OpenAI-Compatible (${config.baseUrl})`;
  }

  async analyzeCV(cvText: string, jobDescription: string) {
    const baseUrl = this.config.baseUrl.replace(/\/+$/, ''); // strip trailing slash
    const url = `${baseUrl}/chat/completions`;

    console.log(`[OpenAI] Starting analysis with model: ${this.config.modelName}`);
    console.log(`[OpenAI] Base URL: ${baseUrl}`);

    const userPrompt = buildPrompt(cvText, jobDescription);

    // Build the request body — compatible with OpenAI, Ollama, LM Studio, vLLM, etc.
    const body: Record<string, unknown> = {
      model: this.config.modelName,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    };

    // If the server supports OpenAI's structured output (response_format),
    // request JSON mode. Ollama, vLLM, and OpenAI itself all support this.
    // Servers that don't support it will simply ignore the field.
    body.response_format = {
      type: 'json_schema',
      json_schema: {
        name: 'cv_analysis',
        strict: true,
        schema: ANALYSIS_JSON_SCHEMA,
      },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth header — skip if apiKey is empty or "ollama" (local LLM, no auth)
    const key = this.config.apiKey.trim().toLowerCase();
    if (key && key !== 'ollama' && key !== 'none' && key !== 'local') {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    console.log('[OpenAI] Sending request...');
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OpenAI] API error ${response.status}: ${errorText}`);
      throw new Error(
        `OpenAI-compatible API returned ${response.status}: ${errorText.slice(0, 500)}`
      );
    }

    const data = await response.json();

    // Extract the content from the Chat Completions response format
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('[OpenAI] No content in response:', JSON.stringify(data).slice(0, 500));
      throw new Error('OpenAI-compatible API returned an empty response.');
    }

    console.log('[OpenAI] Response received. Parsing JSON...');
    return parseAnalysisJSON(content);
  }
}
