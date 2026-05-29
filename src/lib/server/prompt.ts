// ============================================================
// AI CV Optimizer — Shared Prompt Template
// ============================================================
// This is the EXACT prompt from the original Python backend
// (backend/app/core/rag_pipeline.py) — adapted for TypeScript.
// It is shared across ALL AI providers (Gemini, OpenAI, Cloudflare).
// ============================================================

/**
 * JSON schema that describes the expected structured output.
 * Used directly by Gemini's `responseSchema`, and embedded
 * as instructions for OpenAI / Cloudflare providers.
 */
export const ANALYSIS_JSON_SCHEMA = {
  type: 'object' as const,
  properties: {
    match_score: {
      type: 'integer' as const,
      description:
        'A holistic score from 0-100 on how well the CV aligns with the job description, considering keywords, experience level, and required qualifications.',
    },
    ats_score: {
      type: 'integer' as const,
      description:
        'A score from 0-100 for ATS compatibility. Penalize for images, tables, columns, and non-standard fonts/headings. Reward for keyword density and standard resume format.',
    },
    persona_name: {
      type: 'string' as const,
      description:
        "A creative, epic, and professional title for the candidate that combines their core skills, inspired by archetypes (e.g., 'Sang Arsitek & Pengawal Infrastruktur Awan'). Respond in the CV's original language.",
    },
    persona_description: {
      type: 'string' as const,
      description:
        "A powerful 1-2 sentence summary explaining why the candidate fits the epic persona title, referencing their specific skills. Respond in the CV's original language.",
    },
    persona_emoji: {
      type: 'string' as const,
      description:
        "A single emoji that visually represents the persona's combined core skills (e.g., 🛡️ for an architect & guardian).",
    },
    correction_feedback: {
      type: 'string' as const,
      description:
        'The rationale for the rewrites. Explain *why* the changes improve the CV, linking them to the STAR method, impact metrics, and alignment with the job description.',
    },
    optimization_suggestions: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description:
        "A list of 3-5 high-level, strategic recommendations for the candidate's career trajectory based on the analysis.",
    },
    ats_suggestions: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description:
        "A list of concrete actions to improve the ATS score. Must include specific missing keywords from the job description and point out any formatting issues.",
    },
    suggested_job_roles: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          role: { type: 'string' as const },
          score: { type: 'integer' as const },
        },
        required: ['role', 'score'],
      },
      description:
        "A list of suitable job roles. The first item MUST be the target job role from the job description. Add 2-4 alternatives. Each has 'role' (string) and 'score' (integer 0-100).",
    },
    corrected_cv_summary: {
      type: 'string' as const,
      description:
        "A fully rewritten, powerful 2-3 sentence professional summary, tailored as an 'elevator pitch' for this specific job role and packed with relevant keywords.",
    },
    corrected_cv_experience: {
      type: 'string' as const,
      description:
        'A fully rewritten version of the most relevant work experience, with 3-4 bullet points. Each point must start with a strong action verb and include quantifiable results.',
    },
  },
  required: [
    'match_score',
    'ats_score',
    'persona_name',
    'persona_description',
    'persona_emoji',
    'correction_feedback',
    'optimization_suggestions',
    'ats_suggestions',
    'suggested_job_roles',
    'corrected_cv_summary',
    'corrected_cv_experience',
  ],
};

/**
 * Build the full user-prompt that is sent to the AI model.
 *
 * @param cvText         – full extracted text from the PDF CV
 * @param jobDescription – the target job description pasted by the user
 */
export function buildPrompt(cvText: string, jobDescription: string): string {
  return `You are a world-class AI career coach and technical recruiter. Your task is to provide a comprehensive, rich, and highly relevant analysis of a CV against a specific job description. Your feedback must be actionable, encouraging, and directly tied to the provided texts. Respond in the CV's original language (e.g., English or Indonesian).

**CORE ANALYSIS PRINCIPLES:**
1.  **Direct Comparison**: For every piece of feedback, you MUST cross-reference the CV text with the JOB DESCRIPTION. Your goal is to close the gap between the two.
2.  **Be Specific & Actionable**: Do not give generic advice. Provide concrete examples and quantifiable suggestions. Instead of "add more keywords," say "Incorporate keywords like 'FastAPI', 'PostgreSQL', and 'CI/CD' from the job description into your experience bullet points."
3.  **Impact-Oriented Rewrites**: When rewriting sections, explain *why* the new version is better. Focus on demonstrating achievements and results, not just listing responsibilities. Use the STAR (Situation, Task, Action, Result) method as a guiding principle for experience points.

**PERSONA ANALYSIS (Superhero & Wayang Dynamic Character):**
Your goal is to create a unique, professional, and highly creative "Coder Persona" for the candidate, localized to the CV's language (English or Indonesian). The persona MUST be based on a Superhero or Wayang character archetype.

1.  **Analyze Core Skills**: Deeply analyze the CV to identify the candidate's primary and secondary areas of expertise (e.g., Infrastructure, Security, Backend Development).
2.  **Create a Character-Based Title**: Generate a powerful persona_name that creates an analogy between the candidate's skills and a specific **Superhero** or **Wayang Character**. The title must be epic, memorable, and professional.
3.  **Write a Detailed Description**: The persona_description should be a concise, powerful summary of *why* they fit this character persona, directly referencing their skills from the CV.
4.  **Localize**: Ensure the persona_name and persona_description are in the CV's original language.
5.  **Choose a Relevant Emoji**: Provide a single, relevant persona_emoji that visually represents their core skill(s) in the context of the character.

**High-Quality Examples:**
- **Example 1 (Indonesian – Wayang Inspired):**
  - CV shows skills in reliability, security, and system stability.
  - persona_name: "Gatotkaca Penjaga Kode"
  - persona_description: "Seperti Gatotkaca dengan otot kawat dan tulang besi, Anda adalah penjaga tangguh yang memastikan keandalan dan keamanan sistem, melindungi dari bug dan ancaman."
  - persona_emoji: "🛡️"
- **Example 2 (English – Superhero Inspired):**
  - CV shows skills in system design, building complex features, and using many tools.
  - persona_name: "The 'Iron Man' of Software Architecture"
  - persona_description: "Like Tony Stark building his suits, you architect and construct complex, high-tech solutions from the ground up, mastering every tool at your disposal."
  - persona_emoji: "🤖"

**DETAILED INSTRUCTIONS:**
-   **match_score, ats_score**: Calculate these scores based on a holistic review of the FULL CV TEXT against the JOB DESCRIPTION.
-   **ats_suggestions**:
    -   Identify specific keywords from the JOB DESCRIPTION that are missing in the CV.
    -   Check for non-standard formatting (e.g., tables, columns, graphics, headers/footers) that can confuse parsers.
    -   Verify standard section headings (e.g., 'Work Experience', 'Education', 'Skills').
-   **suggested_job_roles**:
    -   The first item MUST be the target job role from the JOB DESCRIPTION.
    -   Then brainstorm 2-4 *alternative* job roles the candidate is qualified for.
    -   Provide a percentage match score for each role, justified by the CV's content.
-   **corrected_cv_summary & corrected_cv_experience**:
    -   Rewrite these sections to be concise, powerful, and packed with relevant keywords from the job description.
    -   The summary should be a 2-3 sentence "elevator pitch" for this specific role.
    -   The experience bullet points should start with strong action verbs and include metrics where possible.
-   **correction_feedback**: Clearly explain the rationale behind your rewrites.

**JOB DESCRIPTION:**
----------------
${jobDescription}
----------------

**FULL CV TEXT:**
----------------
${cvText}
----------------

Provide your response ONLY as a valid JSON object matching this schema. Your tone should be professional yet encouraging.

JSON Schema:
${JSON.stringify(ANALYSIS_JSON_SCHEMA, null, 2)}`;
}

/**
 * System prompt used for chat-based APIs (OpenAI, Cloudflare).
 * Gemini uses a single user prompt instead.
 */
export const SYSTEM_PROMPT =
  'You are a world-class AI career coach and technical recruiter. You always respond with valid JSON matching the requested schema. Never include markdown code fences or extra text — only the raw JSON object.';
