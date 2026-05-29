<script lang="ts">
  import PersonaCard from '$lib/components/PersonaCard.svelte';
  import ResultTabs from '$lib/components/ResultTabs.svelte';
  import ScoreBoard from '$lib/components/ScoreBoard.svelte';
  import SkeletonLoader from '$lib/components/SkeletonLoader.svelte';
  import UploadForm from '$lib/components/UploadForm.svelte';
  import type { AnalysisResult } from '$lib/types/analysis';

  let loading = $state(false);
  let result = $state<AnalysisResult | null>(null);
  let error = $state('');
  let showResults = $state(false);

  async function handleSubmit(payload: { cvFile: File; jobDescription: string }) {
    loading = true;
    error = '';
    showResults = false;
    result = null;

    try {
      const formData = new FormData();
      formData.append('cv_file', payload.cvFile);
      formData.append('job_description', payload.jobDescription);

      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const rawText = await response.text();

      let data: unknown;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Server returned something that isn't JSON (HTML error page, CORS block, etc.)
        console.error('[Client] Non-JSON response:', rawText.slice(0, 300));
        throw new Error(
          response.ok
            ? 'Server returned an unexpected response. Check the server logs.'
            : `Server error ${response.status} — ${rawText.slice(0, 200)}`
        );
      }

      // The server always returns {error, message} on failures
      if (!response.ok || (data && typeof data === 'object' && 'error' in (data as object))) {
        const msg = (data as { message?: string })?.message ?? `Request failed (${response.status})`;
        throw new Error(msg);
      }

      result = data as AnalysisResult;


      // Small delay then reveal for animation
      setTimeout(() => { showResults = true; }, 80);
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unexpected error occurred.';
    } finally {
      loading = false;
    }
  }

  const mainRoleScore = $derived(result?.suggested_job_roles?.[0]?.score ?? 0);
</script>

<svelte:head>
  <title>AI CV Optimizer — AI-Powered CV Analysis</title>
  <meta name="description" content="Upload your CV and get instant AI-powered analysis with match scores, persona insights, rewritten sections, ATS tips, and suggested job roles." />
</svelte:head>

<div class="page-stack">
  <UploadForm {loading} onSubmit={handleSubmit} />

  {#if error}
    <div class="error-card card fade-in" role="alert">
      <div class="error-body">
        <span class="error-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </span>
        <div>
          <strong>Analysis failed</strong>
          <p class="muted">{error}</p>
        </div>
      </div>
      <button class="icon-button" type="button" onclick={() => error = ''} aria-label="Dismiss error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  {/if}

  {#if loading}
    <SkeletonLoader />
  {/if}

  {#if result && showResults}
    <div class="results">
      <ScoreBoard matchScore={result.match_score} atsScore={result.ats_score} roleFitScore={mainRoleScore} />
      <PersonaCard name={result.persona_name} description={result.persona_description} emoji={result.persona_emoji} />
      <ResultTabs {result} />
    </div>
  {/if}
</div>

<style>
  .page-stack { display: grid; gap: 1.25rem; }

  .results {
    display: grid;
    gap: 1.25rem;
  }

  /* Error card */
  .error-card {
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border-color: color-mix(in srgb, var(--error) 35%, var(--border));
    background: color-mix(in srgb, var(--error) 8%, var(--bg-surface));
  }

  .error-body {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
  }

  .error-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-xs);
    background: color-mix(in srgb, var(--error) 16%, var(--bg-surface));
    display: grid;
    place-items: center;
    color: var(--error);
    margin-top: 0.1rem;
  }

  .error-body strong { display: block; margin-bottom: 0.2rem; }
  .error-body p { font-size: 0.88rem; line-height: 1.5; }
</style>
