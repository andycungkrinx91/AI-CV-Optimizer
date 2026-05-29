<script lang="ts">
  import TabATS from './TabATS.svelte';
  import TabCorrections from './TabCorrections.svelte';
  import TabRoles from './TabRoles.svelte';
  import TabSuggestions from './TabSuggestions.svelte';
  import type { AnalysisResult } from '$lib/types/analysis';

  type TabKey = 'corrections' | 'suggestions' | 'ats' | 'roles';
  type Props = { result: AnalysisResult };
  let { result }: Props = $props();

  const tabs: { key: TabKey; icon: string; label: string }[] = [
    { key: 'corrections',  icon: '✅', label: 'Corrections'  },
    { key: 'suggestions',  icon: '🚀', label: 'Suggestions'  },
    { key: 'ats',          icon: '📄', label: 'ATS Review'   },
    { key: 'roles',        icon: '🎯', label: 'Target Roles' },
  ];

  let active = $state<TabKey>('corrections');
</script>

<section class="tabs card slide-up d3">
  <!-- Tab bar -->
  <div class="tabbar" role="tablist" aria-label="Analysis sections">
    {#each tabs as t}
      <button
        class="tab" class:active={active === t.key}
        role="tab"
        aria-selected={active === t.key}
        aria-controls="panel-{t.key}"
        id="tab-{t.key}"
        onclick={() => (active = t.key)}
        type="button"
      >
        <span aria-hidden="true">{t.icon}</span>
        <span class="tab-label">{t.label}</span>
      </button>
    {/each}
  </div>

  <!-- Panel -->
  <div class="panel" id="panel-{active}" role="tabpanel" aria-labelledby="tab-{active}">
    {#key active}
      <div class="panel-inner fade-in">
        {#if active === 'corrections'}
          <TabCorrections
            summary={result.corrected_cv_summary}
            experience={result.corrected_cv_experience}
            feedback={result.correction_feedback}
          />
        {:else if active === 'suggestions'}
          <TabSuggestions suggestions={result.optimization_suggestions} />
        {:else if active === 'ats'}
          <TabATS suggestions={result.ats_suggestions} />
        {:else}
          <TabRoles roles={result.suggested_job_roles} />
        {/if}
      </div>
    {/key}
  </div>
</section>

<style>
  .tabs {
    overflow: hidden;
    padding: 0;
  }

  /* TAB BAR */
  .tabbar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1.5px solid var(--border);
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 1rem 0.5rem;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: var(--text-3);
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 500;
    transition: all var(--t-base) var(--ease-out);
  }

  .tab:hover:not(.active) {
    color: var(--text-1);
    background: var(--bg-surface-2);
  }

  .tab.active {
    color: var(--brand);
    border-bottom-color: var(--brand);
    background: color-mix(in srgb, var(--brand) 5%, var(--bg-surface));
    font-weight: 600;
  }

  .tab-label { font-size: 0.8rem; }

  /* PANEL */
  .panel { padding: 1.75rem; }
  .panel-inner { animation: fadeIn 200ms var(--ease-out) both; }

  @media (max-width: 540px) {
    .tabbar { grid-template-columns: repeat(2, 1fr); }
    .panel  { padding: 1.25rem; }
  }
</style>
