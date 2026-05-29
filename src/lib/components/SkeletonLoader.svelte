<script lang="ts">
  let d = $state(0);
  $effect(() => {
    const id = setInterval(() => { d = (d + 1) % 4; }, 500);
    return () => clearInterval(id);
  });
</script>

<div class="skeleton section-gap slide-up" aria-busy="true" aria-label="Analyzing…">

  <!-- Status card -->
  <div class="status card">
    <div class="spin-ring" aria-hidden="true"></div>
    <div class="status-text">
      <strong class="analyzing">Analyzing your CV{'.'?.repeat(d) ?? ''}</strong>
      <p class="muted small">This usually takes 15–30 seconds depending on your AI provider.</p>
    </div>
    <div class="prog-track" aria-hidden="true">
      <div class="prog-fill"></div>
    </div>
  </div>

  <!-- Score skeleton -->
  <div class="card sk-scores">
    <div class="sk-head">
      <div class="sk shimmer sk-badge"></div>
      <div class="sk shimmer sk-title"></div>
    </div>
    <div class="grid-3 sk-gauges">
      {#each [0,1,2] as _}
        <div class="sk shimmer sk-gauge"></div>
      {/each}
    </div>
  </div>

  <!-- Persona skeleton -->
  <div class="card sk-persona">
    <div class="sk shimmer sk-emoji"></div>
    <div class="sk-persona-lines">
      <div class="sk shimmer" style="width:35%;height:.75rem"></div>
      <div class="sk shimmer" style="width:70%;height:1.5rem;margin-top:.4rem"></div>
      <div class="sk shimmer" style="width:100%;height:.85rem;margin-top:.6rem"></div>
      <div class="sk shimmer" style="width:85%;height:.85rem;margin-top:.4rem"></div>
    </div>
  </div>

  <!-- Tabs skeleton -->
  <div class="card sk-tabs-wrap">
    <div class="sk-tabbar">
      {#each [0,1,2,3] as _}
        <div class="sk shimmer sk-tab"></div>
      {/each}
    </div>
    <div class="sk-panel-area">
      {#each [100,85,92,70,80] as w, i}
        <div class="sk shimmer" style="width:{w}%;height:.85rem;animation-delay:{i*80}ms"></div>
      {/each}
      <div class="sk shimmer" style="height:72px;margin-top:.5rem"></div>
      <div class="sk shimmer" style="height:72px;margin-top:.6rem"></div>
    </div>
  </div>

</div>

<style>
  .skeleton { display: contents; }

  /* Status */
  .status {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: .6rem 1rem;
    align-items: center;
  }

  .spin-ring {
    width: 2.5rem; height: 2.5rem;
    border-radius: 50%;
    border: 3px solid var(--border-2);
    border-top-color: var(--brand);
    animation: spin .9s linear infinite;
    grid-row: 1 / 3;
    flex-shrink: 0;
  }

  .status-text { display: grid; gap: .2rem; }

  .analyzing {
    font-family: 'JetBrains Mono', monospace;
    font-size: .88rem;
    color: var(--brand-2);
  }

  .prog-track {
    grid-column: 2;
    height: 4px;
    background: var(--bg-surface-2);
    border-radius: 2px;
    overflow: hidden;
  }

  .prog-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--brand), var(--brand-3));
    border-radius: 2px;
    animation: progressFlow 2.4s ease-in-out infinite;
  }

  /* Score skeleton */
  .sk-scores { padding: 2rem; display: grid; gap: 1.5rem; }
  .sk-head   { display: grid; gap: .5rem; }
  .sk-badge  { height: 1.4rem; width: 120px; border-radius: var(--r-full); }
  .sk-title  { height: 1.3rem; width: 180px; }
  .sk-gauges { display: grid; }
  .sk-gauge  { height: 190px; border-radius: var(--r-lg); }

  /* Persona skeleton */
  .sk-persona {
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.75rem;
  }
  .sk-emoji  { width: 96px; height: 96px; border-radius: var(--r-lg); flex-shrink: 0; }
  .sk-persona-lines { flex: 1; display: grid; }

  /* Tabs skeleton */
  .sk-tabs-wrap { overflow: hidden; }
  .sk-tabbar    { display: grid; grid-template-columns: repeat(4,1fr); border-bottom: 1.5px solid var(--border); }
  .sk-tab       { height: 68px; border-radius: 0; }
  .sk-panel-area { padding: 1.75rem; display: grid; gap: .65rem; }

  /* Generic shimmer block */
  .sk { border-radius: var(--r-sm); }

  @media (max-width: 600px) {
    .sk-gauges { grid-template-columns: 1fr !important; }
    .sk-gauge  { height: 90px; }
    .sk-tabbar { grid-template-columns: repeat(2,1fr); }
    .sk-persona { flex-direction: column; align-items: flex-start; }
  }
</style>
