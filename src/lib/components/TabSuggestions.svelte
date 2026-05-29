<script lang="ts">
  type Props = { suggestions: string[] };
  let { suggestions }: Props = $props();
</script>

<div class="suggestions">
  <p class="intro muted small">Strategic recommendations to boost your CV's impact for this role.</p>
  <ol class="list">
    {#each suggestions as s, i}
      <li class="item slide-up" style="animation-delay:{i*50}ms">
        <span class="num mono">{String(i + 1).padStart(2,'0')}</span>
        <p class="text muted">{s}</p>
      </li>
    {/each}
  </ol>
</div>

<style>
  .suggestions { display: grid; gap: 1rem; }
  .intro { line-height: 1.6; }
  .list  { display: grid; gap: 0.6rem; }

  .item {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 0.9rem 1.1rem;
    border-radius: var(--r-md);
    border: 1.5px solid var(--border);
    background: var(--bg-surface);
    transition: all var(--t-base) var(--ease-out);
  }

  .item:hover {
    border-color: var(--brand);
    background: color-mix(in srgb, var(--brand) 4%, var(--bg-surface));
    transform: translateX(4px);
  }

  .num {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--brand-2);
    background: color-mix(in srgb, var(--brand) 10%, var(--bg-surface-2));
    border: 1px solid var(--border-2);
    border-radius: var(--r-xs);
    padding: 0.2rem 0.5rem;
    flex-shrink: 0;
    min-width: 2.1rem;
    text-align: center;
    margin-top: 0.15rem;
  }

  .text { font-size: 0.9rem; line-height: 1.65; }
</style>
