<script lang="ts">
  type Props = { suggestions: string[] };
  let { suggestions }: Props = $props();
</script>

<div class="ats">
  <div class="ats-header">
    <span class="warn-badge">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      ATS Issues Found
    </span>
    <p class="muted small">Fix these to pass applicant tracking system filters.</p>
  </div>

  <ul class="list">
    {#each suggestions as s, i}
      <li class="item slide-up" style="animation-delay:{i*50}ms">
        <span class="warn-icon" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
        <p class="text muted">{s}</p>
      </li>
    {/each}
  </ul>
</div>

<style>
  .ats { display: grid; gap: 1rem; }

  .ats-header { display: grid; gap: 0.4rem; }

  .warn-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.75rem;
    border-radius: var(--r-full);
    background: var(--warning-bg);
    border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent);
    color: var(--warning);
    font-size: 0.78rem;
    font-weight: 700;
    width: fit-content;
  }

  .list { display: grid; gap: 0.6rem; }

  .item {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 0.9rem 1.1rem;
    border-radius: var(--r-md);
    border: 1.5px solid color-mix(in srgb, var(--warning) 20%, var(--border));
    background: color-mix(in srgb, var(--warning) 4%, var(--bg-surface));
    transition: all var(--t-base) var(--ease-out);
  }

  .item:hover {
    border-color: var(--warning);
    background: var(--warning-bg);
    transform: translateX(4px);
  }

  .warn-icon {
    flex-shrink: 0;
    width: 28px; height: 28px;
    border-radius: var(--r-xs);
    background: var(--warning-bg);
    display: grid;
    place-items: center;
    color: var(--warning);
    margin-top: 0.05rem;
  }

  .text { font-size: 0.9rem; line-height: 1.65; }
</style>
