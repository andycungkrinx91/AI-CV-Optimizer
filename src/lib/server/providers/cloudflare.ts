// ============================================================
// AI CV Optimizer — Cloudflare Workers AI Provider
// ============================================================
// Uses the Cloudflare Workers AI REST API.
// Docs: https://developers.cloudflare.com/workers-ai/
//
// Supported models (text generation):
//   • @cf/meta/llama-3.1-70b-instruct   (recommended)
//   • @cf/meta/llama-3.1-8b-instruct
//   • @cf/mistral/mistral-7b-instruct-v0.2
//   • @cf/google/gemma-7b-it
//   • @hf/thebloke/deepseek-coder-6.7b-instruct-awq
//   Full list: https://developers.cloudflare.com/workers-ai/models/
//
// Auth: Cloudflare API Token with Workers AI permission.
// ============================================================

import type { CloudflareConfig } from '$lib/types/analysis';
import type { AIProvider } from './base';
import { parseAnalysisJSON } from './base';
import { buildPrompt, SYSTEM_PROMPT } from '../prompt';

export class CloudflareProvider implements AIProvider {
  readonly name = 'Cloudflare Workers AI';
  private readonly config: CloudflareConfig;

  constructor(config: CloudflareConfig) {
    this.config = config;
  }

  async analyzeCV(cvText: string, jobDescription: string) {
    const { accountId, apiToken, modelName, temperature, maxTokens } = this.config;

    // Cloudflare Workers AI REST endpoint
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelName}`;

    console.log(`[Cloudflare] Starting analysis with model: ${modelName}`);
    console.log(`[Cloudflare] Account: ${accountId.slice(0, 8)}...`);

    const userPrompt = buildPrompt(cvText, jobDescription);

    // Cloudflare Workers AI uses a messages array (similar to OpenAI)
    const body = {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      // Request raw text — we'll parse JSON ourselves
      stream: false,
    };

    console.log('[Cloudflare] Sending request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Cloudflare] API error ${response.status}: ${errorText}`);
      throw new Error(
        `Cloudflare Workers AI returned ${response.status}: ${errorText.slice(0, 500)}`
      );
    }

    const responseText = await response.text();
    let data: { success: boolean; result?: { response?: string }; errors?: { message: string }[] };
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(`[Cloudflare] Non-JSON response (status ${response.status}):`, responseText.slice(0, 400));
      throw new Error(
        `Cloudflare Workers AI returned a non-JSON response (HTTP ${response.status}). ` +
        `Check your CF_ACCOUNT_ID, CF_API_TOKEN, and CF_MODEL_NAME. ` +
        `Raw: ${responseText.slice(0, 200)}`
      );
    }


    // Cloudflare response format: { success: true, result: { response: "..." } }
    // OR for chat models: { success: true, result: { response: "..." } }
    if (!data.success) {
      const errors = data.errors?.map((e: { message: string }) => e.message).join(', ') || 'Unknown error';
      console.error(`[Cloudflare] API returned errors: ${errors}`);
      throw new Error(`Cloudflare Workers AI error: ${errors}`);
    }

    const content = data.result?.response;
    if (!content) {
      console.error('[Cloudflare] No response content:', JSON.stringify(data).slice(0, 500));
      throw new Error('Cloudflare Workers AI returned an empty response.');
    }

    console.log('[Cloudflare] Response received. Parsing JSON...');
    return parseAnalysisJSON(content);
  }
}
