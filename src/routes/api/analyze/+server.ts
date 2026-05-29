// ============================================================
// AI CV Optimizer — API Endpoint: POST /api/analyze
// ============================================================
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { extractTextFromPDF } from '$lib/server/pdf';
import { createProviderFromEnv } from '$lib/server/providers';
import { env } from '$env/dynamic/private';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** Always return JSON — never throw SvelteKit error() which produces HTML */
function err(status: number, message: string) {
  return json({ error: true, message }, { status });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // ── 1. Parse multipart form ──────────────────────────────
    const formData = await request.formData();
    const cvFile        = formData.get('cv_file');
    const jobDescription = formData.get('job_description');

    // ── 2. Validate ──────────────────────────────────────────
    if (!cvFile || !(cvFile instanceof File)) {
      return err(400, 'Missing or invalid cv_file. Please upload a PDF file.');
    }
    if (cvFile.type !== 'application/pdf') {
      return err(400, 'Invalid file type. Please upload a PDF file.');
    }
    if (cvFile.size > MAX_FILE_SIZE) {
      return err(400, `File too large. Maximum size is 10 MB.`);
    }
    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return err(400, 'Missing or empty job_description.');
    }

    // ── 3. Extract PDF text ──────────────────────────────────
    console.log(`[API] Processing: ${cvFile.name} (${(cvFile.size / 1024).toFixed(1)} KB)`);
    const pdfBuffer = Buffer.from(await cvFile.arrayBuffer());
    const cvText = await extractTextFromPDF(pdfBuffer);

    if (!cvText.trim()) {
      return err(422, 'Could not extract text from this PDF. Make sure it is a text-based (not scanned) PDF.');
    }
    console.log(`[API] Extracted ${cvText.length} chars from PDF.`);

    // ── 4. Run AI analysis ───────────────────────────────────
    const provider = createProviderFromEnv(env);
    console.log(`[API] Provider: ${provider.name}`);

    const result = await provider.analyzeCV(cvText, jobDescription.trim());
    console.log('[API] Analysis complete.');

    return json(result);

  } catch (err) {
    // Catch everything — never let an unhandled exception produce an HTML response
    console.error('[API] Unhandled error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return json(
      { error: true, message: `AI analysis failed: ${message}` },
      { status: 500 }
    );
  }
};
