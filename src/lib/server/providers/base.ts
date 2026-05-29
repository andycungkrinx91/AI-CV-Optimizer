// ============================================================
// AI CV Optimizer — Provider Base Interface
// ============================================================

import type { AnalysisResult, ProviderConfig } from '$lib/types/analysis';

/**
 * Every AI provider must implement this interface.
 */
export interface AIProvider {
  /** Human-readable name shown in logs / UI. */
  readonly name: string;

  /**
   * Analyze a CV against a job description.
   *
   * @param cvText         – full text extracted from the PDF
   * @param jobDescription – the target job description
   * @returns structured analysis result
   */
  analyzeCV(cvText: string, jobDescription: string): Promise<AnalysisResult>;
}

// ---- Shared Helpers --------------------------------------------------------

/**
 * Parse a (potentially messy) LLM response into a validated AnalysisResult.
 *
 * Handles common issues:
 *  - Markdown code fences (```json … ```)
 *  - Leading/trailing whitespace
 *  - Missing fields → filled with sensible defaults
 */
export function parseAnalysisJSON(raw: string): AnalysisResult {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  // Ensure all required fields exist with fallback defaults
  return {
    match_score: Number(parsed.match_score) || 0,
    ats_score: Number(parsed.ats_score) || 0,
    persona_name: String(parsed.persona_name || 'The Versatile Engineer'),
    persona_description: String(
      parsed.persona_description || 'A well-rounded professional with diverse skills.'
    ),
    persona_emoji: String(parsed.persona_emoji || '💻'),
    correction_feedback: String(parsed.correction_feedback || 'No feedback available.'),
    optimization_suggestions: Array.isArray(parsed.optimization_suggestions)
      ? parsed.optimization_suggestions.map(String)
      : [],
    ats_suggestions: Array.isArray(parsed.ats_suggestions)
      ? parsed.ats_suggestions.map(String)
      : [],
    suggested_job_roles: Array.isArray(parsed.suggested_job_roles)
      ? parsed.suggested_job_roles.map((r: Record<string, unknown>) => ({
          role: String(r.role || 'Unknown Role'),
          score: Number(r.score) || 0,
        }))
      : [],
    corrected_cv_summary: String(parsed.corrected_cv_summary || 'Not available.'),
    corrected_cv_experience: String(parsed.corrected_cv_experience || 'Not available.'),
  };
}
