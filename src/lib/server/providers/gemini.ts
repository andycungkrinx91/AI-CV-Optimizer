// ============================================================
// AI CV Optimizer — Google Gemini Provider
// ============================================================
// Uses @google/generative-ai SDK with native structured output.
// This is the primary / recommended provider.
// ============================================================

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { GeminiConfig } from '$lib/types/analysis';
import type { AIProvider } from './base';
import { parseAnalysisJSON } from './base';
import { buildPrompt, ANALYSIS_JSON_SCHEMA } from '../prompt';

export class GeminiProvider implements AIProvider {
  readonly name = 'Google Gemini';
  private readonly config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  async analyzeCV(cvText: string, jobDescription: string) {
    console.log(`[Gemini] Starting analysis with model: ${this.config.modelName}`);

    const genAI = new GoogleGenerativeAI(this.config.apiKey);

    const model = genAI.getGenerativeModel({
      model: this.config.modelName,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        responseMimeType: 'application/json',
        // Gemini supports native JSON schema — pass it directly
        responseSchema: ANALYSIS_JSON_SCHEMA as Parameters<
          typeof genAI.getGenerativeModel
        >[0] extends { generationConfig?: { responseSchema?: infer S } } ? S : never,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = buildPrompt(cvText, jobDescription);

    console.log('[Gemini] Sending prompt to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('[Gemini] Response received. Parsing JSON...');
    return parseAnalysisJSON(text);
  }
}
