<script lang="ts">
  import type { JobRole } from '$lib/types/analysis';
  type Props = { roles: JobRole[] };
  let { roles }: Props = $props();
</script>

<div class="roles">
  <p class="intro muted small">Best-matched roles based on your skills, experience, and the target position.</p>
  <ul class="list">
    {#each roles as role, i}
      <li class="item scale-in" style="animation-delay:{i*70}ms">
        <div class="item-head">
          <div class="name-row">
            {#if i === 0}
              <span class="star-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Top Match
              </span>
            {/if}
            <span class="role-name">{role.role}</span>
          </div>
          <span class="score mono" data-tone={role.score >= 75 ? 'good' : role.score >= 50 ? 'ok' : 'low'}>
            {role.score}%
          </span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" data-tone={role.score >= 75 ? 'good' : role.score >= 50 ? 'ok' : 'low'}
            style="width:{role.score}%"></div>
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .roles { display: grid; gap: 1rem; }
  .intro { line-height: 1.6; }
  .list  { display: grid; gap: 0.7rem; }

  .item {
    padding: 1rem 1.25rem;
    border-radius: var(--r-md);
    border: 1.5px solid var(--border);
    background: var(--bg-surface);
    display: grid;
    gap: 0.7rem;
    transition: all var(--t-base) var(--ease-out);
  }

  .item:first-child {
    border-color: var(--border-2);
    background: color-mix(in srgb, var(--brand) 4%, var(--bg-surface));
  }

  .item:hover {
    border-color: var(--brand);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    min-width: 0;
  }

  .star-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.55rem;
    border-radius: var(--r-full);
    background: color-mix(in srgb, var(--brand) 12%, var(--bg-surface-2));
    border: 1px solid var(--border-2);
    color: var(--brand-2);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }

  .role-name { font-weight: 600; font-size: 0.95rem; }

  .score {
    font-size: 0.82rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: var(--r-full);
    flex-shrink: 0;
  }

  [data-tone='good'].score { background: var(--success-bg); color: var(--success); }
  [data-tone='ok'].score   { background: var(--warning-bg); color: var(--warning); }
  [data-tone='low'].score  { background: var(--error-bg);   color: var(--error);   }

  .bar-track {
    height: 5px;
    background: var(--bg-surface-2);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1s var(--ease-out) 0.2s;
  }

  [data-tone='good'].bar-fill { background: linear-gradient(90deg, var(--success), #34d399); }
  [data-tone='ok'].bar-fill   { background: linear-gradient(90deg, var(--warning), #fbbf24); }
  [data-tone='low'].bar-fill  { background: linear-gradient(90deg, var(--error),   #f87171); }
</style>
