<script lang="ts">
  import ScoreGauge from './ScoreGauge.svelte';
  type Props = { matchScore: number; atsScore: number; roleFitScore: number };
  let { matchScore, atsScore, roleFitScore }: Props = $props();
  const avg = $derived(Math.round((matchScore + atsScore + roleFitScore) / 3));
  const tone = $derived(avg >= 75 ? 'good' : avg >= 50 ? 'ok' : 'low');
</script>

<section class="scoreboard card slide-up d1">
  <div class="sb-head">
    <div>
      <span class="badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Analysis Results
      </span>
      <h2 class="sb-title">Your CV Performance</h2>
    </div>
    <div class="avg-ring" data-tone={tone} aria-label="Average score: {avg}%">
      <span class="avg-num">{avg}</span>
      <span class="avg-label">avg</span>
    </div>
  </div>

  <div class="gauges grid-3">
    <ScoreGauge score={matchScore}  label="CV Match"  delay={0}   />
    <ScoreGauge score={atsScore}    label="ATS Score" delay={180} />
    <ScoreGauge score={roleFitScore} label="Role Fit" delay={360} />
  </div>

  <div class="progress-row">
    <div class="progress-track">
      <div class="progress-fill" data-tone={tone} style="width:{avg}%"></div>
    </div>
    <span class="muted small">Overall: {avg}%</span>
  </div>
</section>

<style>
  .scoreboard { padding: 2rem; display: grid; gap: 1.5rem; }

  .sb-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .sb-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-top: 0.4rem;
  }

  /* Average ring */
  .avg-ring {
    width: 70px; height: 70px;
    border-radius: 50%;
    border: 3px solid;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  [data-tone='good'].avg-ring { border-color: var(--success); background: var(--success-bg); }
  [data-tone='ok'].avg-ring   { border-color: var(--warning); background: var(--warning-bg); }
  [data-tone='low'].avg-ring  { border-color: var(--error);   background: var(--error-bg);   }

  .avg-num {
    font-size: 1.35rem;
    font-weight: 800;
    line-height: 1;
  }

  [data-tone='good'] .avg-num { color: var(--success); }
  [data-tone='ok']   .avg-num { color: var(--warning); }
  [data-tone='low']  .avg-num { color: var(--error);   }

  .avg-label {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-3);
  }

  /* Progress */
  .progress-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .progress-track {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--bg-surface-2);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1.4s var(--ease-out) 0.2s;
  }

  [data-tone='good'].progress-fill { background: linear-gradient(90deg, var(--success), #34d399); }
  [data-tone='ok'].progress-fill   { background: linear-gradient(90deg, var(--warning), #fbbf24); }
  [data-tone='low'].progress-fill  { background: linear-gradient(90deg, var(--error),   #f87171); }
</style>
