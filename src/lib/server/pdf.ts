// ============================================================
// AI CV Optimizer — PDF Text Extraction
// ============================================================

/**
 * Extract plain text from a PDF file buffer.
 *
 * Uses `pdf-parse` which is a CommonJS module — we use dynamic
 * import to handle the CJS/ESM boundary in SvelteKit.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to handle CJS module in ESM context
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new Error('No text could be extracted from the PDF. The file may be image-based or empty.');
  }

  return data.text;
}
