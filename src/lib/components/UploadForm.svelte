<script lang="ts">
  type Payload = { cvFile: File; jobDescription: string };
  type Props = { loading?: boolean; onSubmit: (p: Payload) => Promise<void> | void };
  let { loading = false, onSubmit }: Props = $props();

  let fileInput: HTMLInputElement | null = null;
  let file     = $state<File | null>(null);
  let jd       = $state('');
  let dragging  = $state(false);
  let localErr  = $state('');
  let ready     = $derived(!!file && jd.trim().length > 10);

  function pick(f: File | null) {
    localErr = '';
    if (!f) return;
    if (f.type !== 'application/pdf') { localErr = 'Please upload a PDF file.'; return; }
    if (f.size > 10 * 1024 * 1024)    { localErr = 'File too large — max 10 MB.'; return; }
    file = f;
  }

  const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  async function submit(e: SubmitEvent) {
    e.preventDefault(); localErr = '';
    if (!file)          { localErr = 'Please upload your CV (PDF).'; return; }
    if (!jd.trim())     { localErr = 'Please paste the job description.'; return; }
    await onSubmit({ cvFile: file, jobDescription: jd.trim() });
  }
</script>

<form class="form card slide-up" onsubmit={submit}>

  <!-- ── Header ────────────────────────────────── -->
  <div class="form-header">
    <span class="badge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
      </svg>
      Step 1 of 1 — Upload & Analyze
    </span>
    <h2 class="form-title">Optimize your CV with AI</h2>
    <p class="muted small">Upload your PDF CV and paste a job description. The AI will analyze both and return detailed feedback.</p>
  </div>

  <!-- ── Two-column inputs ─────────────────────── -->
  <div class="inputs grid-2">

    <!-- Drop zone -->
    <label
      class="drop"
      class:dragging
      class:filled={!!file}
      ondragover={(e) => { e.preventDefault(); dragging = true; }}
      ondragleave={() => dragging = false}
      ondrop={(e) => { e.preventDefault(); dragging = false; pick(e.dataTransfer?.files?.[0] ?? null); }}
    >
      <input bind:this={fileInput} type="file" accept="application/pdf" class="sr-only"
        onchange={(e) => pick((e.currentTarget as HTMLInputElement).files?.[0] ?? null)} />

      <div class="drop-icon" class:filled={!!file}>
        {#if file}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <polyline points="9 15 12 18 15 15"/><line x1="12" y1="12" x2="12" y2="18"/>
          </svg>
        {:else}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
        {/if}
      </div>

      <div class="drop-content">
        <strong>{file ? file.name : 'Drop your CV here'}</strong>
        {#if file}
          <span class="muted small">{fmt(file.size)} · PDF</span>
        {:else}
          <span class="muted small">or click to browse · PDF only · max 10 MB</span>
        {/if}
      </div>

      <button type="button" class="btn-secondary" onclick={(e) => { e.preventDefault(); fileInput?.click(); }}>
        {file ? 'Replace' : 'Browse'}
      </button>
    </label>

    <!-- Job description -->
    <div class="jd-wrap">
      <label class="jd-label" for="jd">
        <strong>Job Description</strong>
        <span class="muted small">{jd.length.toLocaleString()} chars</span>
      </label>
      <textarea id="jd" class="textarea jd-ta" bind:value={jd}
        placeholder="Paste the full job description — include responsibilities, requirements, and preferred skills for the best analysis."
        rows="8"></textarea>
    </div>

  </div>

  <!-- ── Error ─────────────────────────────────── -->
  {#if localErr}
    <div class="local-err fade-in" role="alert">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {localErr}
    </div>
  {/if}

  <!-- ── Footer ────────────────────────────────── -->
  <div class="form-foot">
    <p class="muted small providers">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Works with Gemini · OpenAI-compatible · Cloudflare AI
    </p>
    <button class="btn-primary submit-btn" type="submit" disabled={loading || !ready}>
      {#if loading}
        <span class="spinner" aria-hidden="true"></span> Analyzing…
      {:else}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        Analyze &amp; Optimize
      {/if}
    </button>
  </div>

</form>

<style>
  .form {
    padding: 2rem;
    display: grid;
    gap: 1.5rem;
  }

  .form-header { display: grid; gap: 0.5rem; }
  .form-title  { font-size: 1.35rem; font-weight: 700; }

  /* DROP ZONE */
  .drop {
    display: grid;
    gap: 1rem;
    align-content: center;
    justify-items: start;
    padding: 1.75rem;
    border-radius: var(--r-lg);
    border: 2px dashed var(--border-2);
    background: var(--bg-surface-2);
    cursor: pointer;
    min-height: 240px;
    transition:
      border-color var(--t-base) var(--ease-out),
      background   var(--t-base) var(--ease-out),
      box-shadow   var(--t-base) var(--ease-out);
  }

  .drop:hover,
  .drop.dragging {
    border-color: var(--brand);
    background: color-mix(in srgb, var(--brand) 5%, var(--bg-surface-2));
    box-shadow: 0 0 0 4px var(--brand-glow-soft);
  }

  .drop.filled {
    border-style: solid;
    border-color: var(--success);
    background: color-mix(in srgb, var(--success) 5%, var(--bg-surface-2));
  }

  .drop-icon {
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    border-radius: var(--r-md);
    border: 1.5px solid var(--border-2);
    background: var(--bg-surface);
    color: var(--brand);
    box-shadow: var(--shadow-xs);
    transition: all var(--t-base) var(--ease-out);
  }

  .drop-icon.filled {
    border-color: var(--success);
    color: var(--success);
    background: var(--success-bg);
  }

  .drop-content { display: grid; gap: 0.2rem; }
  .drop-content strong { font-size: 0.95rem; word-break: break-all; line-height: 1.4; }

  /* JD */
  .jd-wrap { display: grid; gap: 0.6rem; align-content: start; }
  .jd-label { display: flex; align-items: center; justify-content: space-between; }
  .jd-ta    { min-height: 210px; font-size: 0.88rem; }

  /* FORM FOOTER */
  .form-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 0.25rem;
  }

  .providers { display: flex; align-items: center; gap: 0.4rem; }
  .submit-btn { min-width: 196px; }

  /* ERROR */
  .local-err {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1rem;
    border-radius: var(--r-sm);
    background: var(--error-bg);
    border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
    color: var(--error);
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* SPINNER */
  .spinner {
    width: 1rem; height: 1rem;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    animation: spin 0.75s linear infinite;
    flex-shrink: 0;
  }

  /* HIDDEN FILE INPUT */
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  @media (max-width: 639px) {
    .form { padding: 1.25rem; }
    .drop { min-height: 160px; padding: 1.25rem; }
    .form-foot { flex-direction: column; align-items: stretch; }
    .submit-btn { width: 100%; }
  }
</style>
