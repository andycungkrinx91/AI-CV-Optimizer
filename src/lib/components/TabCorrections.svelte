<script lang="ts">
  import { copyToClipboard } from '$lib/utils/clipboard';
  type Props = { summary: string; experience: string; feedback: string };
  let { summary, experience, feedback }: Props = $props();
  let copied = $state<string | null>(null);

  async function copy(text: string, key: string) {
    await copyToClipboard(text);
    copied = key;
    setTimeout(() => { copied = null; }, 2000);
  }
</script>

<div class="corrections">
  {#each [
    { key: 'summary', icon: '📝', title: 'Optimized Summary', hint: 'AI-rewritten professional summary', text: summary },
    { key: 'exp',     icon: '💼', title: 'Optimized Experience', hint: 'AI-rewritten work experience', text: experience },
  ] as section}
    <div class="section">
      <div class="sec-head">
        <div class="sec-meta">
          <span class="sec-icon" aria-hidden="true">{section.icon}</span>
          <div>
            <p class="sec-title">{section.title}</p>
            <p class="muted small">{section.hint}</p>
          </div>
        </div>
        <button class="btn-secondary copy-btn" type="button"
          onclick={() => copy(section.text, section.key)}>
          {#if copied === section.key}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Copied!
          {:else}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          {/if}
        </button>
      </div>
      <pre class="mono-block">{section.text}</pre>
    </div>
  {/each}

  <div class="feedback">
    <p class="sec-title">💡 Correction Rationale</p>
    <p class="feedback-text muted">{feedback}</p>
  </div>
</div>

<style>
  .corrections { display: grid; gap: 1.25rem; }

  .section {
    border: 1.5px solid var(--border-2);
    border-radius: var(--r-lg);
    overflow: hidden;
    background: var(--bg-surface);
  }

  .sec-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: 1.5px solid var(--border);
    background: var(--bg-surface-2);
  }

  .sec-meta {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .sec-icon {
    font-size: 1.4rem;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 0.05rem;
  }

  .sec-title { font-weight: 700; font-size: 0.9rem; color: var(--brand-2); }

  .copy-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.85rem;
    flex-shrink: 0;
  }

  .mono-block {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    line-height: 1.8;
    padding: 1.25rem;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--text-2);
    overflow-x: auto;
    margin: 0;
  }

  .feedback {
    padding: 1.25rem;
    border-radius: var(--r-lg);
    border: 1.5px solid var(--border);
    background: color-mix(in srgb, var(--brand) 4%, var(--bg-surface));
    display: grid;
    gap: 0.6rem;
  }

  .feedback-text { font-size: 0.9rem; line-height: 1.75; }
</style>
